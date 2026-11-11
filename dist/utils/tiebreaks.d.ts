/**
 * Tie-break ("särskiljning") computation for the standings playback.
 *
 * Two layers, intentionally separable:
 *
 *  - **Layer A — FIDE base methods.** Plain, published methods from the FIDE
 *    Tie-Break Regulations (03/2026), each cited to its article. Standalone and
 *    reusable. This is the "pure FIDE" fallback: if we ever drop the SSF layer,
 *    these still give correct, documented values and ordering.
 *
 *  - **Layer B — SSF packing (REVERSE-ENGINEERED).** SSF's own software ("Lotta")
 *    does not publish its tie-break formula. We reverse-engineered it by
 *    comparing the official `secPoints` column to round-results data across live
 *    tournaments. SSF packs an *ordered list* of tie-breaks into the decimal
 *    places of a single sortable number:
 *
 *        secPoints = base + tb2·10⁻² + tb3·10⁻⁴ + tb4·10⁻⁶ + …
 *
 *    so the whole ranking resolves as one float. {@link computeSsfSecPoints}
 *    reproduces that value per `tiebreakSystem`.
 *
 * ⚠️  Layer B reproduces SSF/Lotta OUTPUT, not the FIDE spec, and is derived
 *     empirically — it is best-effort and PENDING CONFIRMATION FROM SSF. The
 *     decode for each system records the evidence and confidence below. When a
 *     formula stabilizes, hand it to SSF for a correct/broken verdict (and ask
 *     for the Linköping 2016 autotest dataset as a torture test).
 *
 * Not part of the public API — used by the internal round-standings engine.
 */
/**
 * Buchholz (Art 8.1): sum of opponents' scores.
 *
 * NOTE: this is the simple form over already-resolved opponent scores. FIDE
 * Art 16 virtual-opponent handling for byes/forfeits is not yet applied (added
 * in a later phase); for events without unplayed games this matches.
 */
export declare function buchholz(opponentScores: readonly number[]): number;
/**
 * Buchholz Cut-1 (Art 14.1): Buchholz minus the single lowest opponent score.
 * A single opponent is cut too, leaving 0 (SSF doesn't; see computeSsfSecPoints).
 */
export declare function buchholzCut1(opponentScores: readonly number[]): number;
/**
 * Median Buchholz / Median-1 (Art 14.3): Buchholz dropping the highest AND
 * lowest opponent score.
 */
export declare function medianBuchholz(opponentScores: readonly number[]): number;
/** One played game's contribution to Sonneborn-Berger. */
export interface SbContribution {
    /** Opponent's score (cumulative, as of the round being evaluated). */
    opponentScore: number;
    /** Points scored against that opponent in the game (1 / 0.5 / 0). */
    myResult: number;
}
/**
 * Sonneborn-Berger (Art 9.1): Σ (opponent's score × points scored against them).
 */
export declare function sonnebornBerger(contributions: readonly SbContribution[]): number;
/**
 * Per-player input for a tie-break computation, as of a given round. The
 * round-standings engine builds this from the per-round accumulators.
 */
export interface TiebreakContext {
    /** Real opponents' scores (cumulative, as of this round), one per game played. */
    opponentScores: number[];
    /** Parallel to `opponentScores`: rounds that opponent had no pairing at all (withdrawn, absent). */
    opponentAbsentRounds: number[];
    /** Sonneborn-Berger contributions (real games only). */
    sbContributions: SbContribution[];
    /** The player's own score (cumulative, as of this round). */
    ownScore: number;
    /**
     * Wins for the packed wins field: games won plus walkovers won against a real
     * opponent (byes excluded), which is what SSF's `secPoints` counts.
     */
    wins: number;
    /** Games played with the black pieces as of this round (FIDE Art 7.3). */
    gamesWithBlack: number;
    /** Unplayed rounds the player won: a bye or a walkover win. */
    unplayedWon: number;
    /** Unplayed rounds the player didn't win: a walkover loss, postponed or no-result game. */
    unplayedLost: number;
    /** Rounds the player had no pairing at all. */
    absentRounds: number;
}
/**
 * Reproduce SSF's official secondary points (`secPoints`) for a supported
 * `tiebreakSystem`, or `null` if we don't (yet) model that system — in which
 * case the caller falls back to an indicative metric.
 *
 * Decoded systems and their evidence:
 *
 * - **SSF_BUCHHOLZ (3)** — individual Swiss.
 *   `secPoints = base + wins·10⁻² + gamesWithBlack·10⁻⁴`, where `base` is
 *   Buchholz Cut-1 (the lowest value dropped) over one value per round:
 *     - a played game: the opponent's score, plus ½ for every round that
 *       opponent had no pairing at all (withdrawn or absent). A walkover loss
 *       they were paired for adds nothing;
 *     - a bye or walkover the player won, or a round they had no pairing: a
 *       fictive opponent with the player's own score;
 *     - a walkover the player lost, or a postponed / no-result game: 0.
 *   With a single value (after round 1) nothing is cut, so a walkover winner
 *   has 1 QP and ranks above the winners over the board, whose opponents have 0.
 *   Seen many times by the user on SSF's own tables after round 1; not visible in
 *   final tables, where everyone has more than one value.
 *   `wins` counts walkover wins against a real opponent but not byes, and
 *   `gamesWithBlack` counts only games played over the board.
 *   The unplayed-round rules were fitted to live data (2026-11-11): over 188
 *   finished SSF Buchholz groups (~4,300 players) the base matches the official
 *   value for 86% of players and every player in 99 groups, against 69% and 29
 *   groups for the earlier rule (plain Buchholz, without the cut, for a bye; a
 *   walkover counted as a game). Players with several unplayed rounds make up
 *   most of the remaining misses, and old tables (LM 2016, group 6072) match
 *   worse, so SSF's rules seem to have changed over the years. Earlier evidence
 *   for the packed fields: group 15816 (no byes, 64 players) within 9.8e-6 of
 *   the official value; a sub-10⁻⁵ field separating the deepest ties is not
 *   decoded. Confidence: HIGH for played games and the packing, MEDIUM for
 *   unplayed rounds.
 *
 * Not yet modeled (caller uses the indicative fallback): SSF_BERGER (1, likely
 * Sonneborn-Berger base + similar packing), MEDIAN_BUCHHOLZ (4), PROGRESSIVE (5),
 * FIDE_BUCHHOLZ_2024 (7), plain BUCHHOLZ (2). ALLSVENSKAN (6) is teams (handled
 * separately).
 */
export declare function computeSsfSecPoints(tiebreakSystem: number, ctx: TiebreakContext): number | null;
/** Whether {@link computeSsfSecPoints} models this system (vs. the fallback). */
export declare function isSsfSecPointsSupported(tiebreakSystem: number): boolean;
/**
 * How trustworthy a group's secondary (tie-break) ordering is:
 * - `'exact'`       — structurally the official numbers (team: match → board points).
 * - `'verified'`    — our reconstruction's final-round ordering was checked against
 *                     the official table and matches it, so it's proven for this group.
 * - `'official'`    — a reproduced system that SSF has confirmed bit-correct, on
 *                     data with no edge cases we can't model. (None yet — pending SSF.)
 * - `'reproduced'`  — we reproduce the official secondary (reverse-engineered), but
 *                     it's unconfirmed and/or has a residual; treat as an estimate.
 * - `'indicative'`  — only a rough Buchholz/Sonneborn-Berger stand-in.
 */
export type SecondaryBasis = 'exact' | 'verified' | 'official' | 'reproduced' | 'indicative';
/**
 * Classify a group's secondary-ordering basis. The `estimated` flag is derived
 * from this — see {@link isEstimated}. Note this is keyed on the *system* and the
 * *data*, NOT on team-vs-individual: a clean round-robin (no unplayed rounds) of
 * a confirmed system is `'official'`, while a Swiss event with byes, or any
 * unconfirmed system, is not. The round-robin advantage falls out of
 * `hasUnhandledUnplayed` — round-robins have no byes, so nothing to mishandle.
 */
export declare function secondaryBasis(opts: {
    mode: 'individual' | 'team';
    tiebreakSystem: number | undefined;
    /** True when the data has unplayed-round cases we can't reproduce exactly (e.g. multi-VUR). */
    hasUnhandledUnplayed: boolean;
}): SecondaryBasis;
/** Whether a basis should be shown to users as an estimate (vs. trustworthy). */
export declare function isEstimated(basis: SecondaryBasis): boolean;
/**
 * Self-verification: does our reconstructed ordering agree with the official
 * standings? `orderedKeys` is our rows best-first; `officialPlace` maps each
 * contender key to its official `place`. Returns true iff every contender is
 * present in the official table and our order never puts a worse place before a
 * better one (equal places — official ties — are allowed in either order).
 */
export declare function orderingMatchesOfficial(orderedKeys: readonly string[], officialPlace: ReadonlyMap<string, number>): boolean;
//# sourceMappingURL=tiebreaks.d.ts.map