#!/usr/bin/env node
// Build the official performance-rating fixture.
//
// Scrapes the PERF column of resultat.schack.se's "Individuella resultat" page
// (ShowIndividualPerformanceServlet) and pairs each value with the inputs the
// SDK's calculatePerformanceRating receives from a consumer: per-game opponent
// ratings and the 1/½/0 score, derived from the JSON API the way the chess app
// does it. Writes __tests__/fixtures/official-performance.json and prints how
// the built SDK's formula (dist/) and the FIDE-table prototype below compare.
//
// With `--individual-results` it instead writes only
// __tests__/fixtures/individual-results.json: stripped raw inputs (groups, round
// results, rating snapshot) plus the official rows (SP, W/D/L, P, PERF) for a few
// tournaments, so getIndividualPerformance can be tested end to end, offline.
// The default run's fixture stays untouched.
//
// NOT part of `pnpm check` — run manually (`pnpm perf:fixture`). Scraping lives
// only here; nothing in src/ touches HTML. Imports the built SDK from dist/.
//
// Input rules (mirroring the chess app's tournamentElo/playerMatches):
// - skip walkovers, non-countable codes, unrated rounds, byes (non-positive ids)
// - rating per game = getPlayerRatingForRound(elo, rankingAlgorithm, round.rated)
//   for both sides, elo from the rating list at the first of the round's month
// - skip the game when the opponent lacks that rating. The app also skips it
//   when the player lacks it; the official site does not, so those entries are
//   kept and flagged `selfUnrated` (the app shows no performance for them)
// - score 1 / ½ / 0 from the player's perspective
// - where /player/{id}/date has no record (HTTP 204 — some players are only
//   reachable through results), fall back to the playerInfo on the group's
//   results table, as the official site evidently does. Entries relying on it
//   are flagged `tableRatingFallback` (the app currently drops those games)

import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import {
  PlayerService,
  ResultsService,
  TournamentService,
  calculatePerformanceRating,
  getPlayerOutcome,
  getPlayerRatingForRound,
  isWalkoverResultCode,
  normalizeEloLookupDate,
  getMonthStartString,
  parseLocalDate,
  RoundRatedType,
} from '../dist/index.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, '../__tests__/fixtures/official-performance.json');
const PAGE = 'https://resultat.schack.se/ShowIndividualPerformanceServlet?id=';
const CONCURRENCY = 8;

// One group id per tournament; the official page covers every group of it.
const TOURNAMENTS = [
  { groupId: 18711, label: 'Skol-SM 2026 (rapid, groups A–E)' },
  { groupId: 18962, label: 'LASS Snabb-LM 2026 (rapid)' },
  { groupId: 18980, label: 'LASK Open 2026 (standard)' },
  { groupId: 18958, label: 'Manhems JKM 2026 (standard)' },
  { groupId: 19307, label: 'Visby SK KM Blixt 2026 (blitz)' },
  { groupId: 19201, label: 'SmSF Snabbschack DM-lag (team, rapid)' },
  { groupId: 19405, label: 'Hemse ASK klassisk höst 2026 (team, standard)' },
  { groupId: 18842, label: 'West Coast Chess Open 2026 (mixed standard+rapid)' },
];

const players = new PlayerService();
const results = new ResultsService();
const tournaments = new TournamentService();

// FIDE Rating Regulations §8.1.1, p = 0.50 … 1.00 (candidate formula prototype).
const DP = [0, 7, 14, 21, 29, 36, 43, 50, 57, 65, 72, 80, 87, 95, 102, 110, 117, 125, 133, 141,
  149, 158, 166, 175, 184, 193, 202, 211, 220, 230, 240, 251, 262, 273, 284, 296, 309, 322, 336,
  351, 366, 383, 401, 422, 444, 470, 501, 538, 589, 677, 800];
function candidate(opponentRatings, score) {
  const n = opponentRatings.length;
  if (n === 0) return 0;
  const avg = Math.floor(opponentRatings.reduce((a, b) => a + b, 0) / n);
  const pct = Math.floor((100 * score) / n + 0.5);
  return avg + (pct >= 50 ? DP[pct - 50] : -DP[50 - pct]);
}

const unwrap = (res, what) => {
  if (res.error || !res.data) throw new Error(`${what}: ${res.error ?? 'no data'} (HTTP ${res.status})`);
  return res.data;
};

async function pool(items, fn) {
  const out = new Array(items.length);
  let i = 0;
  await Promise.all(Array.from({ length: CONCURRENCY }, async () => {
    while (i < items.length) { const k = i++; out[k] = await fn(items[k]); }
  }));
  return out;
}

const decode = (s) => s
  .replace(/<[^>]+>/g, '')
  .replace(/&nbsp;/g, ' ')
  .replace(/&amp;/g, '&')
  .replace(/&#(\d+);/g, (_, c) => String.fromCharCode(Number(c)))
  .trim();

/**
 * Official rows: { name, club, games, won, drawn, lost, points, perf, groupId, memberId }, perf null when
 * blank. groupId / memberId come from the row's onclick link (ShowTournamentParticipantResultServlet?id=&partid=).
 */
async function officialRows(groupId) {
  const html = await (await fetch(PAGE + groupId)).text();
  const rows = [];
  for (const [, attrs, tr] of html.matchAll(/<tr([^>]*)>([\s\S]*?)<\/tr>/g)) {
    const link = attrs.match(/ShowTournamentParticipantResultServlet\?id=(\d+)&(?:amp;)?partid=(\d+)/);
    const cells = [...tr.matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/g)].map((m) => decode(m[1])).filter(Boolean);
    if (!/^\d+\.$/.test(cells[0] ?? '')) continue;
    const [, name, club, games, won, drawn, lost, points, perf] = cells;
    rows.push({
      name, club, games: Number(games), won: Number(won), drawn: Number(drawn), lost: Number(lost),
      points: Number(points), perf: perf === undefined ? null : Number(perf),
      groupId: link ? Number(link[1]) : null, memberId: link ? Number(link[2]) : null,
    });
  }
  return rows;
}

const eloCache = new Map();
async function eloAt(id, monthString) {
  const key = `${id}@${monthString}`;
  if (!eloCache.has(key)) {
    const res = await players.getPlayerInfo(id, parseLocalDate(monthString));
    eloCache.set(key, res.data ?? null);
  }
  return eloCache.get(key);
}

async function buildTournament({ groupId, label }) {
  const tournament = unwrap(await tournaments.getTournamentFromGroup(groupId), `tournament of ${groupId}`);
  const groups = tournament.rootClasses.flatMap((c) => c.groups);
  const official = await officialRows(groupId);

  // Per player: games with ratings, per rating type.
  const perPlayer = new Map(); // id -> { groupIds:Set, byType: {type: {opponentRatings, score}} }
  const lookups = [];
  const tableInfo = new Map(); // id -> playerInfo from an individual group's results table
  for (const group of groups) {
    const team = group.playersinteam > 0;
    if (!team) {
      for (const row of (await results.getTournamentResults(group.id)).data ?? []) {
        if (row.playerInfo) tableInfo.set(row.contenderId, row.playerInfo);
      }
    }
    const rounds = unwrap(
      team ? await results.getTeamRoundResults(group.id) : await results.getTournamentRoundResults(group.id),
      `rounds of ${group.id}`,
    );
    const ratedOf = new Map(group.tournamentRounds.map((r) => [r.roundNumber, r.rated]));
    for (const row of rounds) {
      const rated = ratedOf.get(row.roundNr);
      if (rated === RoundRatedType.UNRATED) continue;
      const month = getMonthStartString(normalizeEloLookupDate(parseLocalDate(row.date).getTime()));
      for (const g of row.games ?? []) {
        if (g.whiteId <= 0 || g.blackId <= 0 || isWalkoverResultCode(g.result)) continue;
        lookups.push({ group, rated, month, g });
      }
    }
  }

  const ids = new Set();
  for (const { month, g } of lookups) { ids.add(`${g.whiteId}@${month}`); ids.add(`${g.blackId}@${month}`); }
  await pool([...ids], (k) => { const [id, m] = k.split('@'); return eloAt(Number(id), m); });

  const names = new Map(); // id -> name, from any fetched record
  for (const [id, info] of tableInfo) names.set(id, `${info.firstName} ${info.lastName}`.trim());
  for (const [k, info] of eloCache) {
    if (info) names.set(Number(k.split('@')[0]), `${info.firstName} ${info.lastName}`.trim());
  }
  const ratingInfo = async (id, month) => {
    const dated = await eloAt(id, month);
    return dated ? { info: dated, fallback: false } : { info: tableInfo.get(id), fallback: tableInfo.has(id) };
  };

  for (const { group, rated, month, g } of lookups) {
    for (const [self, opp, isWhite] of [[g.whiteId, g.blackId, true], [g.blackId, g.whiteId, false]]) {
      const entry = perPlayer.get(self) ?? { groupIds: new Set(), byType: {}, selfUnrated: false, fallback: false };
      entry.groupIds.add(group.id);
      perPlayer.set(self, entry);
      const outcome = getPlayerOutcome(g.result, isWhite);
      if (outcome === null) continue;
      const selfInfo = await ratingInfo(self, month);
      const oppInfo = await ratingInfo(opp, month);
      const mine = getPlayerRatingForRound(selfInfo.info?.elo, group.rankingAlgorithm, rated);
      const theirs = getPlayerRatingForRound(oppInfo.info?.elo, group.rankingAlgorithm, rated);
      if (!theirs.rating || !theirs.ratingType) continue;
      if (oppInfo.fallback) entry.fallback = true;
      if (!mine.rating) entry.selfUnrated = true;
      const bucket = (entry.byType[theirs.ratingType] ??= { opponentRatings: [], score: 0 });
      bucket.opponentRatings.push(theirs.rating);
      bucket.score += outcome === 'win' ? 1 : outcome === 'draw' ? 0.5 : 0;
    }
  }

  // Match official rows to member ids by name within this tournament.
  const byName = new Map();
  for (const id of perPlayer.keys()) {
    const n = names.get(id);
    if (n) byName.set(n, [...(byName.get(n) ?? []), id]);
  }
  const entries = [];
  const dropped = [];
  for (const row of official) {
    if (row.perf === null) continue;
    const idsForName = byName.get(row.name) ?? [];
    if (idsForName.length !== 1) {
      dropped.push({ tournamentId: tournament.id, name: row.name, reason: idsForName.length ? 'ambiguous name' : 'no API match' });
      continue;
    }
    const memberId = idsForName[0];
    const p = perPlayer.get(memberId);
    if (p.groupIds.size !== 1) {
      dropped.push({ tournamentId: tournament.id, name: row.name, reason: 'played in several groups' });
      continue;
    }
    const types = Object.keys(p.byType);
    if (types.length === 0) {
      dropped.push({ tournamentId: tournament.id, name: row.name, reason: 'no rated games derived from API' });
      continue;
    }
    const base = {
      tournamentId: tournament.id, groupId: [...p.groupIds][0], memberId, name: row.name,
      officialGames: row.games, officialPoints: row.points, official: row.perf,
      ...(p.selfUnrated ? { selfUnrated: true } : {}),
      ...(p.fallback ? { tableRatingFallback: true } : {}),
    };
    if (types.length === 1) {
      entries.push({ ...base, ratingType: types[0], ...p.byType[types[0]] });
    } else {
      entries.push({ ...base, mixed: true, byType: p.byType });
    }
  }
  return { tournamentId: tournament.id, label, name: tournament.name, entries, dropped };
}

function stats(list, f) {
  const d = list.map((e) => e.official - f(e.opponentRatings, e.score));
  return {
    n: d.length,
    exact: d.filter((x) => x === 0).length,
    within5: d.filter((x) => Math.abs(x) <= 5).length,
    maxDiff: d.length ? Math.max(...d.map(Math.abs)) : 0,
  };
}
const fmt = (s) => `exact ${s.exact}/${s.n}, within5 ${s.within5}/${s.n}, max |diff| ${s.maxDiff}`;

// --- --individual-results mode -------------------------------------------------

const INDIVIDUAL_OUT = join(__dirname, '../__tests__/fixtures/individual-results.json');
// Ordinary events on purpose; Skol-SM is an outlier (3/2/1 groups, school-only players).
const INDIVIDUAL_TOURNAMENTS = [
  { groupId: 18962, label: 'LASS Snabb-LM 2026 (rapid)' },
  { groupId: 18958, label: 'Manhems JKM 2026 (standard)' },
  { groupId: 18980, label: 'LASK Open 2026 (standard, rounds over several months)' },
  { groupId: 19307, label: 'Visby SK KM Blixt 2026 (blitz)' },
  { groupId: 19201, label: 'SmSF Snabbschack DM-lag (team, rapid)' },
  { groupId: 19405, label: 'Hemse ASK klassisk höst 2026 (team, standard)' },
  { groupId: 19016, label: 'Torsdagskampen HT26 (mixed rapid + standard)' },
  { groupId: 17040, label: 'Stockholmsserien 2025/2026 (team league; players across divisions)' },
];

const monthOf = (date) => getMonthStartString(normalizeEloLookupDate(parseLocalDate(date).getTime()));
const stripElo = (e) => (e ? { rating: e.rating, rapidRating: e.rapidRating, blitzRating: e.blitzRating, date: e.date } : null);

/** Raw inputs + official rows for one tournament. Ratings are snapshotted for every player of every round month. */
async function buildRaw({ groupId, label }) {
  const tournament = unwrap(await tournaments.getTournamentFromGroup(groupId), `tournament of ${groupId}`);
  const flatten = (cs) => (cs ?? []).flatMap((c) => [...(c.groups ?? []), ...flatten(c.subClasses)]);
  const groups = flatten(tournament.rootClasses);

  const roundResults = {};
  const table = {}; // id -> elo, from individual results tables (the fallback the official site uses)
  const pairs = new Set();
  for (const g of groups) {
    const team = g.playersinteam > 0;
    const rows = unwrap(team ? await results.getTeamRoundResults(g.id) : await results.getTournamentRoundResults(g.id), `rounds of ${g.id}`);
    roundResults[g.id] = rows.map((r) => ({
      roundNr: r.roundNr, date: r.date,
      games: (r.games ?? []).map((x) => [x.whiteId, x.blackId, x.result]), // [whiteId, blackId, result]
    }));
    if (!team) {
      for (const row of (await results.getTournamentResults(g.id)).data ?? []) {
        if (!row.playerInfo) continue;
        table[row.contenderId] = stripElo(row.playerInfo.elo);
      }
    }
    if (g.pointSystem === 1) continue; // 3/2/1 groups: kept as input (exclusion is tested), no ratings needed
    for (const r of rows) for (const x of r.games ?? []) for (const id of [x.whiteId, x.blackId]) {
      if (id > 0) pairs.add(`${id}@${monthOf(r.date)}`);
    }
  }
  await pool([...pairs], (k) => { const [id, m] = k.split('@'); return eloAt(Number(id), m); });
  const dated = {};
  for (const k of pairs) {
    const info = eloCache.get(k);
    if (info) dated[k] = stripElo(info.elo);
  }

  // Official rows carry their member id; a row whose player appears in no API game can't be reproduced.
  const inApi = new Set();
  for (const rows of Object.values(roundResults)) for (const r of rows) for (const [w, b] of r.games) { inApi.add(w); inApi.add(b); }
  const official = [];
  const notInApi = [];
  const noGames = [];
  for (const row of await officialRows(groupId)) {
    // The row link's `id` is the requested page's group, not the player's, so only the member id is kept.
    const entry = { memberId: row.memberId, name: row.name, sp: row.games, w: row.won, d: row.drawn, l: row.lost, p: row.points, perf: row.perf };
    // SP 0: registered to a team but never played (the official list takes them from team registrations).
    (row.games === 0 ? noGames : inApi.has(row.memberId) ? official : notInApi).push(entry);
  }

  return {
    label,
    tournament: {
      id: tournament.id, name: tournament.name,
      rootClasses: [{ groups: groups.map((g) => ({
        id: g.id, name: g.name, pointSystem: g.pointSystem, rankingAlgorithm: g.rankingAlgorithm, playersinteam: g.playersinteam,
        tournamentRounds: (g.tournamentRounds ?? []).map((r) => ({ roundNumber: r.roundNumber, rated: r.rated })),
      })), subClasses: [] }],
    },
    roundResults, ratings: { dated, table }, official, notInApi, noGames,
  };
}

if (process.argv.includes('--individual-results')) {
  const out = [];
  for (const t of INDIVIDUAL_TOURNAMENTS) {
    process.stdout.write(`… ${t.label}\n`);
    const raw = await buildRaw(t);
    console.log(`    official rows ${raw.official.length} (with PERF ${raw.official.filter((r) => r.perf !== null).length}), not in API ${raw.notInApi.length}, no games ${raw.noGames.length}`);
    out.push(raw);
  }
  writeFileSync(INDIVIDUAL_OUT, JSON.stringify({
    _meta: {
      purpose: 'Raw inputs and official "Individuella resultat" rows for testing getIndividualPerformance end to end. Generated by `pnpm perf:fixture --individual-results`; do not edit by hand.',
      source: `${PAGE}<groupId>`,
      fetchedAt: new Date().toISOString().slice(0, 10),
      ratings: 'dated: "<id>@<YYYY-MM-01>" from /player/{id}/date at the round month; table: <id> from the individual results table (fallback for players the dated lookup lacks)',
      games: 'roundResults[groupId][].games are [whiteId, blackId, resultCode] tuples',
      notInApi: 'official rows whose player appears in no API game (e.g. Torsdagskampen HT26 "Grupp 2", absent from the API tournament)',
      noGames: 'official rows with SP 0: players registered to a team who never played (not derivable from round results)',
    },
    tournaments: out,
  }) + '\n');
  console.log(`\nWrote ${INDIVIDUAL_OUT}`);
  process.exit(0);
}

// --- default mode: official-performance.json -----------------------------------

const built = [];
for (const t of TOURNAMENTS) {
  process.stdout.write(`… ${t.label}\n`);
  built.push(await buildTournament(t));
}

const all = built.flatMap((t) => t.entries);
const single = all.filter((e) => !e.mixed);
console.log('\nPer tournament (single rating type entries):');
for (const t of built) {
  const s = t.entries.filter((e) => !e.mixed);
  console.log(`  ${t.label} [${t.tournamentId}]  entries ${s.length}, mixed ${t.entries.length - s.length}, dropped ${t.dropped.length}`);
  console.log(`    dist/     : ${fmt(stats(s, calculatePerformanceRating))}`);
  console.log(`    candidate : ${fmt(stats(s, candidate))}`);
}
console.log('\nOverall (single type):');
console.log(`  dist/     : ${fmt(stats(single, calculatePerformanceRating))}`);
console.log(`  candidate : ${fmt(stats(single, candidate))}`);

const misses = single.filter((e) => candidate(e.opponentRatings, e.score) !== e.official);
if (misses.length) {
  console.log('\nCandidate mismatches:');
  for (const e of misses.slice(0, 40)) {
    console.log(`  ${e.name} [${e.tournamentId}/${e.groupId}/${e.memberId}] official ${e.official}, candidate ${candidate(e.opponentRatings, e.score)}, ` +
      `${e.score}/${e.opponentRatings.length} (official ${e.officialPoints}/${e.officialGames})`);
  }
}

const mixed = all.filter((e) => e.mixed);
if (mixed.length) {
  const pooled = mixed.map((e) => {
    const ops = Object.values(e.byType).flatMap((b) => b.opponentRatings);
    const score = Object.values(e.byType).reduce((a, b) => a + b.score, 0);
    return { ...e, opponentRatings: ops, score };
  });
  console.log(`\nMixed entries (informational), all games pooled: candidate ${fmt(stats(pooled, candidate))}`);
}

const edges = {
  perfect: single.filter((e) => e.score === e.opponentRatings.length).length,
  zero: single.filter((e) => e.score === 0).length,
  nearSweep: single.filter((e) => { const p = e.score / e.opponentRatings.length; return p >= 0.85 && p < 1; }).length,
  halfPercent: single.filter((e) => Math.round(200 * e.score / e.opponentRatings.length) % 2 === 1).length,
};
console.log('\nEdge-case coverage:', edges);

const dropped = built.flatMap((t) => t.dropped);
console.log(`Entries where the player lacks the rating (app shows no performance): ${single.filter((e) => e.selfUnrated).length}`);
console.log(`Entries using the results-table rating fallback (app drops those games): ${all.filter((e) => e.tableRatingFallback).length}`);
mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify({
  _meta: {
    purpose: 'Official member.schack.se PERF values with the inputs calculatePerformanceRating receives. Generated by scripts/perf-fixture.mjs; do not edit by hand.',
    source: `${PAGE}<groupId>`,
    fetchedAt: new Date().toISOString().slice(0, 10),
    tournaments: built.map((t) => ({ tournamentId: t.tournamentId, name: t.name, label: t.label, entries: t.entries.length })),
    inputRules: [
      'walkovers, non-countable codes, unrated rounds and byes are skipped',
      'rating per game: getPlayerRatingForRound(elo at the first of the round month, rankingAlgorithm, round.rated), both sides',
      'opponent rating from /player/{id}/date at the round month, else (HTTP 204, no record) from the group results table playerInfo — flagged tableRatingFallback',
      'games where the opponent lacks that rating are skipped; selfUnrated marks players without it (the app shows no performance for them)',
      'score is 1 / 0.5 / 0 from the player perspective',
      'mixed entries (several rating types) carry byType instead of opponentRatings/score',
    ],
    dropped,
  },
  entries: all,
}, null, 1) + '\n');
console.log(`\nWrote ${all.length} entries (${single.length} single-type, ${mixed.length} mixed), ${dropped.length} dropped → ${OUT}`);
