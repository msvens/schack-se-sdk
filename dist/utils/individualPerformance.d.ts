/**
 * The tournament-wide performance list — resultat.schack.se's "Individuella
 * resultat" (ShowIndividualPerformanceServlet): every player of the
 * tournament, ranked by tournament performance (PERF). One row per player
 * across all groups — in team leagues players move between a club's teams in
 * different divisions, and the official list pools those games into one row.
 * Use {@link hasIndividualPerformance} to decide whether the list is meaningful.
 *
 * Pure: no fetching. Ratings come from the caller through {@link PlayerAt}, so
 * caching and where ratings come from stay the caller's concern. Use
 * {@link getIndividualPerformanceLookups} to learn which ratings to prefetch.
 *
 * Rules, verified exactly against the official list (see
 * __tests__/fixtures/individual-results.json and official-performance.json):
 * - Groups with Schackfyran scoring (`pointSystem` 3/2/1) are left out.
 * - SP counts every countable game, walkovers and byes included.
 * - W / D / L and points count games actually played: walkover result codes
 *   and byes excluded (a game against a walkover placeholder id with an
 *   ordinary result code counts). Points are 1 / ½ / 0.
 * - PERF uses games actually played in rated rounds against rated opponents,
 *   each opponent rated per round (`getPlayerRatingForRound`); the player's own
 *   rating is not needed. A group mixing rating types gets one pooled PERF.
 * - PERF needs at least {@link MIN_RATED_GAMES_FOR_PERFORMANCE} such games;
 *   below that the official list (and player page) shows none.
 * - Order: PERF highest first, players without one last. The official site
 *   shows no derivable order among equal PERFs; ties keep encounter order.
 *
 * Not verified (no such group in the sample): 3-1-0 groups (`pointSystem` 2)
 * are included with 1 / ½ / 0 points.
 *
 * Not included: players registered to a team who never played. The official
 * list shows them (from the team registrations) with SP 0 and no PERF, last;
 * they appear in no round result, so they can't be derived from these inputs.
 */
import type { PlayerInfoDto, TournamentDto, TournamentRoundResultDto } from '../types';
/**
 * Fewest games against rated opponents for the official site to show a PERF.
 * Verified: every official PERF in the reference data rests on ≥ 3 such games,
 * and every player with 1–2 has none.
 */
export declare const MIN_RATED_GAMES_FOR_PERFORMANCE = 3;
/** One row of the performance list: one player, across all the tournament's groups. */
export interface IndividualPerformanceRow {
    playerId: number;
    /**
     * The groups the player played in, by games played (most first, ties in
     * encounter order). `groupIds[0]` is the natural place to link to their games.
     */
    groupIds: number[];
    /** SP: countable games, walkovers and byes included. */
    games: number;
    /** Games actually played (walkovers and byes excluded). */
    won: number;
    drawn: number;
    lost: number;
    /** 1 / ½ / 0 over games actually played. */
    points: number;
    /** Games behind `performance`: played, in a rated round, against a rated opponent. */
    ratedGames: number;
    /** Tournament performance, or `null` with fewer than {@link MIN_RATED_GAMES_FOR_PERFORMANCE} rated games. */
    performance: number | null;
}
/**
 * A player's record as of a round. `roundDate` is the round result row's `date`
 * (`YYYY-MM-DD`), passed through untouched — map it to whichever rating list
 * you use. The official PERF uses the list of each round's month.
 */
export type PlayerAt = (playerId: number, roundDate: string) => Pick<PlayerInfoDto, 'elo'> | null | undefined;
/** A `(playerId, roundDate)` pair {@link getIndividualPerformance} will ask {@link PlayerAt} for. */
export interface IndividualPerformanceLookup {
    playerId: number;
    roundDate: string;
}
/**
 * Build the performance list for a tournament.
 *
 * @param tournament - The tournament, with its groups' `pointSystem`, `rankingAlgorithm` and rounds
 * @param roundResultsByGroup - Round results per group id (individual or team); groups not in the map are skipped
 * @param playerAt - A player's record as of a round, for the opponent ratings
 * @returns One row per player (games pooled across groups), sorted by performance, highest first, `null` last
 */
export declare function getIndividualPerformance(tournament: TournamentDto, roundResultsByGroup: Map<number, TournamentRoundResultDto[]>, playerAt: PlayerAt): IndividualPerformanceRow[];
/**
 * The lookups {@link getIndividualPerformance} will make, deduplicated, so the
 * caller can prefetch them (e.g. into a cache) before building the list.
 */
export declare function getIndividualPerformanceLookups(tournament: TournamentDto, roundResultsByGroup: Map<number, TournamentRoundResultDto[]>): IndividualPerformanceLookup[];
/**
 * Whether the performance list is meaningful for a tournament: true when at
 * least one group without Schackfyran (3/2/1) scoring is rated, i.e. its
 * rounds' rated types or its `rankingAlgorithm` give a time control
 * ({@link getGroupTimeControl} is not `'unknown'`).
 *
 * False for unrated tournaments (e.g. Minior-Lag-DM 2025, group 17042: no
 * rating algorithm, every round unrated — the official list shows rows without
 * any results there), LASK-only ones and all-Schackfyran ones.
 */
export declare function hasIndividualPerformance(tournament: TournamentDto): boolean;
//# sourceMappingURL=individualPerformance.d.ts.map