#!/usr/bin/env node
// Verify the test-data corpus against live SSF data.
//
// For each entry: confirm its groupId/tournamentId still resolves (data drifts,
// ids disappear), and flag stale `observed` dates. Conceptual entries (both ids
// null) are skipped. NOT part of `pnpm check` — run manually or nightly.
//
// Exit codes: 0 = all resolvable (stale entries only warn), 1 = one or more
// broken, 2 = SSF unreachable (skipped, not a failure).

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const corpus = JSON.parse(
  readFileSync(join(__dirname, '../src/corpus/ssf-corpus.json'), 'utf8'),
);

const BASE = 'https://member.schack.se/public/api/v1';
const STALE_DAYS = 90;
const TIMEOUT_MS = 15000;
const today = new Date();

async function getJson(path) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${BASE}${path}`, { signal: ctrl.signal });
    if (!res.ok) return { ok: false, reason: `HTTP ${res.status}` };
    return { ok: true, data: await res.json() };
  } catch (e) {
    return { ok: false, reason: e.name === 'AbortError' ? 'timeout' : String(e), transport: true };
  } finally {
    clearTimeout(timer);
  }
}

// Probe once so a full SSF outage yellows the run instead of reporting 25 breaks.
const probe = await getJson('/organisation/federation');
if (!probe.ok && probe.transport) {
  console.error(`member.schack.se unreachable (${probe.reason}); skipping corpus verification.`);
  process.exit(2);
}

const daysSince = (iso) => Math.floor((today - new Date(iso)) / 86400000);

let broken = 0;
let stale = 0;
let skipped = 0;

for (const e of corpus.entries) {
  let status;
  if (e.groupId != null) {
    // Resolve the group via its tournament — type-agnostic (the individual
    // results table 500s for team groups), so this confirms existence without
    // caring whether the group is individual or team.
    const r = await getJson(`/tournament/group/id/${e.groupId}`);
    status = r.ok && r.data && r.data.id
      ? { ok: true, detail: `group ${e.groupId} (tournament ${r.data.id})` }
      : { ok: false, detail: `group ${e.groupId}: ${r.ok ? 'not found' : r.reason}` };
  } else if (e.tournamentId != null) {
    const r = await getJson(`/tournament/tournament/id/${e.tournamentId}`);
    status = r.ok && r.data && r.data.id
      ? { ok: true, detail: `tournament ${e.tournamentId}` }
      : { ok: false, detail: `tournament ${e.tournamentId}: ${r.ok ? 'not found' : r.reason}` };
  } else {
    skipped++;
    console.log(`  ⏭  ${e.id} (conceptual — no ids to verify)`);
    continue;
  }

  const age = daysSince(e.observed);
  const staleFlag = age > STALE_DAYS;
  if (staleFlag) stale++;

  if (status.ok) {
    const staleNote = staleFlag ? `  ⚠ stale: observed ${e.observed} (${age}d)` : '';
    console.log(`  ✓  ${e.id} — ${status.detail}${staleNote}`);
  } else {
    broken++;
    console.log(`  ✗  ${e.id} — ${status.detail}`);
  }
}

console.log('');
console.log(
  `${corpus.entries.length} entries: ${corpus.entries.length - broken - skipped} ok, ` +
  `${broken} broken, ${stale} stale, ${skipped} conceptual (skipped).`,
);
process.exit(broken > 0 ? 1 : 0);
