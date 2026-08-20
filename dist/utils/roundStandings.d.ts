/**
 * Internal engine for round-by-round standings replay.
 *
 * NOT part of the public API — `ResultsService.getRoundStandings(groupId)` is
 * the only entry point. It derives `mode` and the individual quality metric
 * from the tournament/group and calls this engine; callers never choose them.
 * Only the result types (`RoundStandings`, `RoundStandingRow`) are exported.
 *
 * The round-results DTO is identical for team and individual events, so this
 * engine cannot infer the mode from its input — it must be told. The values it
 * accumulates (`homeResult` / `awayResult`) are already in the tournament's own
 * units, so the primary column it produces is exact:
 *
 * - **Individual**: player game points. Ranking points → quality points, where
 *   quality points are plain **Buchholz** or **Sonneborn-Berger** (used for
 *   round-robin, where Buchholz is FIDE-invalid). Indicative only — the official
 *   per-group tie-break variant is not reproduced (see `TiebreakSystem`).
 * - **Team**: team board-point totals per match. Ranking match points → board
 *   points, both exact. Match points from comparing the two board totals.
 *
 * Byes and walkovers credit the awarded points to the real contender but add no
 * opponent contribution and are excluded from W/D/L and gamesPlayed.
 */
import type { TournamentRoundResultDto } from '../types';
import { type SecondaryBasis } from './tiebreaks';
export type { SecondaryBasis } from './tiebreaks';
export type StandingsMode = 'individual' | 'team';
export type QualityMetric = 'buchholz' | 'sonneborn-berger';
/** A single contender's row within a round snapshot. */
export interface RoundStandingRow {
    /** Player id (individual) or team/club id (team), from `homeId` / `awayId`. */
    contenderId: number;
    /** Team number distinguishing multiple teams of one club. Team mode only. */
    teamNumber?: number;
    /** 1-based placement; tied contenders share a rank (standard competition ranking). */
    rank: number;
    /**
     * Cumulative primary-unit points after this round — exact.
     * Individual: the player's game points. Team: the team's board/player points
     * (the team *secondary* key; `matchPoints` is the primary key).
     */
    points: number;
    /** Team mode only — cumulative match points (primary key). */
    matchPoints?: number;
    /** Individual mode only — indicative quality points (Buchholz or Sonneborn-Berger). */
    qualityPoints?: number;
    /** Wins in real games (individual) or matches (team) up to this round. */
    wins: number;
    /** Draws up to this round. */
    draws: number;
    /** Losses up to this round. */
    losses: number;
    /** Real games (individual) or matches (team) played; excludes byes/walkovers. */
    gamesPlayed: number;
}
/** Standings snapshot as of the end of a specific round. */
export interface RoundStandings {
    /** The round this snapshot reflects (table after this round). */
    round: number;
    /** Contender rows, sorted best-first. */
    rows: RoundStandingRow[];
    /**
     * Whether the secondary (tie-break) ordering should be shown to users as an
     * *estimate* rather than the trustworthy official result. Constant across a
     * group's snapshots. The app's rule is one line: `if (snapshot.estimated)`.
     * Today: `false` for team standings (exact), `true` for individual (the
     * tie-break reproduction is reverse-engineered / pending SSF confirmation).
     */
    estimated: boolean;
    /** Why — the basis of the secondary ordering (see {@link SecondaryBasis}). */
    secondaryBasis: SecondaryBasis;
}
/** Internal — the service derives these from the tournament; not caller-facing. */
export interface ComputeRoundStandingsOptions {
    /** `'individual'` or `'team'`. Determines the ranking keys. */
    mode: StandingsMode;
    /** Individual only — fallback secondary metric when no SSF system applies. Default `'buchholz'`. */
    qualityMetric?: QualityMetric;
    /**
     * Individual only — the group's `tiebreakSystem`. When it's one the SDK can
     * reproduce (see `computeSsfSecPoints`), `qualityPoints` becomes the official
     * `secPoints` value; otherwise the indicative `qualityMetric` is used.
     */
    tiebreakSystem?: number;
    /** Team only — match-point award scheme. Default `{ win: 2, draw: 1, loss: 0 }`. */
    matchPointValues?: {
        win: number;
        draw: number;
        loss: number;
    };
}
/**
 * Compute one standings snapshot per round present in `roundResults`, ordered
 * by round ascending. Internal — use `ResultsService.getRoundStandings`.
 */
export declare function computeRoundStandings(roundResults: TournamentRoundResultDto[], options: ComputeRoundStandingsOptions): RoundStandings[];
//# sourceMappingURL=roundStandings.d.ts.map