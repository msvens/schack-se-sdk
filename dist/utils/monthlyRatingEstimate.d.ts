import { PlayerService } from '../services/players';
import { ResultsService } from '../services/results';
import { TournamentService } from '../services/tournaments';
import type { ApiResponse } from '../types';
import { type RatedTimeControl } from './ratingUtils';
export interface MonthlyRatingEstimateOptions {
    /** The month as `YYYY-MM`. Defaults to the current month (local time). */
    month?: string;
    tournamentService?: TournamentService;
    resultsService?: ResultsService;
    playerService?: PlayerService;
}
/** One game behind an estimate. */
export interface EstimatedGame {
    tournamentId: number;
    tournamentName: string;
    groupId: number;
    roundNr: number;
    /** The round's date, `YYYY-MM-DD`. */
    date: string;
    opponentId: number;
    /** The opponent's rating for this time control, from the month's list. */
    opponentRating: number;
    /** 1 / ½ / 0. */
    score: number;
    expectedScore: number;
    /** K × (score − expected), to 0.1. Only the month's total is rounded to whole points. */
    change: number;
}
/** The estimate for one time control. */
export interface EstimatedRatingChange {
    timeControl: RatedTimeControl;
    /** The player's rating on the month's list. */
    rating: number;
    /** K used: the stored K, lowered so K × games ≤ 700. */
    k: number;
    games: number;
    score: number;
    expectedScore: number;
    /** Rounded to a whole number, 0.5 away from zero, as FIDE rounds a period's change. */
    change: number;
    /** `rating + change`: the rating if only these games were rated on top of the month's list. */
    estimatedRating: number;
    /** The games, oldest first. */
    gameList: EstimatedGame[];
}
/** From {@link estimateMonthlyRatingChange}. */
export interface MonthlyRatingEstimate {
    memberId: number;
    /** `YYYY-MM`. */
    month: string;
    /** One entry per time control with at least one counted game, standard, rapid, blitz order. */
    estimates: EstimatedRatingChange[];
}
/**
 * An **estimate**, for fun, of how many FIDE rating points a player's games
 * in one month are worth: "your rated games in November ≈ +60 (rapid)". Built
 * from the games reported to SSF; not an official rating.
 *
 * It values the month's games; it doesn't predict the next list. FIDE rates a
 * tournament when the organizer reports it, usually in time for the next
 * list but sometimes a list or two later, so the next list can hold other
 * games. When FIDE rates the same games, the estimate matches exactly
 * (checked against published lists).
 *
 * Counts each game in a round dated in the month, in individual and team
 * groups alike, when the round is FIDE-rated (`rated` standard / rapid /
 * blitz, which also decides the time control), the game was actually played
 * (no walkovers or byes), and both players have a rating for that time control
 * on the month's list. Then per time control, following FIDE's rules:
 * - ratings (player and opponents) are those on the 1st of the month;
 * - K is the player's stored K ({@link getKFactorForRating}), lowered so that
 *   K × games ≤ 700;
 * - expected scores come from FIDE's table with the 400-point rule (not
 *   applied in standard from 2650);
 * - the change is K × (score − expected score), rounded once for the month.
 *
 * Limits:
 * - Only games reported to SSF: the player's FIDE-rated games abroad or
 *   elsewhere are missing (mostly a concern for strong players). Opponents'
 *   other games don't matter; only their rating on the month's list is used.
 * - Games are found through tournaments with results updated from the 1st to
 *   7 days after the month; results entered later are missed.
 * - Round dates and the `rated` flag are set by organizers and can be wrong.
 * - A time control the player has no rating in is left out: a first rating
 *   is calculated differently. So is FIDE's rule that rapid/blitz games
 *   between players 600+ points apart are unrated when one is above 2600.
 *
 * Requests: the player's games, one results-updated search, the round results
 * of each group the player played in that had updates, and one batch of
 * player lookups. If any fails, its error is returned rather than a partial
 * estimate.
 *
 * @example
 * const res = await estimateMonthlyRatingChange(642062, { month: '2026-11' });
 * for (const e of res.data?.estimates ?? []) {
 *   console.log(`${e.timeControl}: ${e.rating} → ~${e.estimatedRating} (${e.change >= 0 ? '+' : ''}${e.change})`);
 * }
 */
export declare function estimateMonthlyRatingChange(memberId: number, options?: MonthlyRatingEstimateOptions): Promise<ApiResponse<MonthlyRatingEstimate>>;
//# sourceMappingURL=monthlyRatingEstimate.d.ts.map