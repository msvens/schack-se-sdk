/**
 * The tournament-wide performance list — resultat.schack.se's "Individuella
 * resultat" (ShowIndividualPerformanceServlet): every player of every group,
 * ranked by tournament performance (PERF).
 *
 * Pure: no fetching. Ratings come from the caller through {@link PlayerAt}, so
 * caching and where ratings come from stay the caller's concern. Use
 * {@link getIndividualPerformanceLookups} to learn which ratings to prefetch.
 *
 * Rules, verified exactly against the official list (see
 * __tests__/fixtures/individual-results.json and official-performance.json):
 * - Groups with Schackfyran scoring (`pointSystem` 3/2/1) are left out.
 * - SP counts every countable game, walkovers and byes included.
 * - W / D / L and points count games actually played: walkovers and byes
 *   excluded. Points are 1 / ½ / 0.
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
 */
import type { PlayerInfoDto, TournamentDto, TournamentRoundResultDto } from '../types';
/**
 * Fewest games against rated opponents for the official site to show a PERF.
 * Verified: every official PERF in the reference data rests on ≥ 3 such games,
 * and every player with 1–2 has none.
 */
export declare const MIN_RATED_GAMES_FOR_PERFORMANCE = 3;
/** One row of the performance list. */
export interface IndividualPerformanceRow {
    playerId: number;
    groupId: number;
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
 * @returns One row per (player, group), sorted by performance, highest first, `null` last
 */
export declare function getIndividualPerformance(tournament: TournamentDto, roundResultsByGroup: Map<number, TournamentRoundResultDto[]>, playerAt: PlayerAt): IndividualPerformanceRow[];
/**
 * The lookups {@link getIndividualPerformance} will make, deduplicated, so the
 * caller can prefetch them (e.g. into a cache) before building the list.
 */
export declare function getIndividualPerformanceLookups(tournament: TournamentDto, roundResultsByGroup: Map<number, TournamentRoundResultDto[]>): IndividualPerformanceLookup[];
//# sourceMappingURL=individualPerformance.d.ts.map