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

import { TiebreakSystem } from '../types';

// ---------------------------------------------------------------------------
// Layer A — FIDE base methods (FIDE Tie-Break Regulations 03/2026)
// ---------------------------------------------------------------------------

/**
 * Buchholz (Art 8.1): sum of opponents' scores.
 *
 * NOTE: this is the simple form over already-resolved opponent scores. FIDE
 * Art 16 virtual-opponent handling for byes/forfeits is not yet applied (added
 * in a later phase); for events without unplayed games this matches.
 */
export function buchholz(opponentScores: readonly number[]): number {
  return opponentScores.reduce((sum, s) => sum + s, 0);
}

/**
 * Buchholz Cut-1 (Art 14.1): Buchholz minus the single lowest opponent score.
 * With fewer than 2 opponents there is nothing to cut.
 */
export function buchholzCut1(opponentScores: readonly number[]): number {
  if (opponentScores.length === 0) return 0;
  const min = Math.min(...opponentScores);
  return buchholz(opponentScores) - min;
}

/**
 * Median Buchholz / Median-1 (Art 14.3): Buchholz dropping the highest AND
 * lowest opponent score.
 */
export function medianBuchholz(opponentScores: readonly number[]): number {
  if (opponentScores.length <= 2) return 0;
  const min = Math.min(...opponentScores);
  const max = Math.max(...opponentScores);
  return buchholz(opponentScores) - min - max;
}

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
export function sonnebornBerger(contributions: readonly SbContribution[]): number {
  return contributions.reduce((sum, c) => sum + c.opponentScore * c.myResult, 0);
}

// ---------------------------------------------------------------------------
// Layer B — SSF packing (reverse-engineered)
// ---------------------------------------------------------------------------

/**
 * Per-player input for a tie-break computation, as of a given round. The
 * round-standings engine builds this from the per-round accumulators.
 */
export interface TiebreakContext {
  /** Real opponents' scores (cumulative, as of this round). */
  opponentScores: number[];
  /** Sonneborn-Berger contributions (real games only). */
  sbContributions: SbContribution[];
  /** Games won as of this round (FIDE Art 7.1 / 7.2 — equal for individual play). */
  wins: number;
  /** Games played with the black pieces as of this round (FIDE Art 7.3). */
  gamesWithBlack: number;
  /**
   * Fictive-opponent scores for the player's byes/walkovers (one per unplayed
   * round). Per SSF TB 2025/26 §7.2.2, a frirond counts toward the player's own
   * kvalitetspoäng as a game against a fictive opponent whose score = the
   * player's score before the bye + the player's points in the remaining rounds
   * (≈ player's score − the bye's points). These are added to the opponent
   * scores before the cut-1, so the cut drops the lowest of real + fictive.
   */
  byeFictiveScores: number[];
}

/** Scale factors for successive packed fields: ·10⁻², ·10⁻⁴, ·10⁻⁶, … */
const FIELD_SCALE = [1e-2, 1e-4, 1e-6, 1e-8];

/** Fold an ordered list of small-integer tie-break fields into decimal places. */
function pack(base: number, fields: readonly number[]): number {
  return fields.reduce((acc, f, i) => acc + f * FIELD_SCALE[i], base);
}

/**
 * Reproduce SSF's official secondary points (`secPoints`) for a supported
 * `tiebreakSystem`, or `null` if we don't (yet) model that system — in which
 * case the caller falls back to an indicative metric.
 *
 * Decoded systems and their evidence:
 *
 * - **SSF_BUCHHOLZ (3)** — individual Swiss.
 *   `secPoints = base + wins·10⁻² + gamesWithBlack·10⁻⁴`, where
 *   `base = BuchholzCut1` of the real opponents, EXCEPT when the player has a
 *   bye/walkover (an Art 16 VUR), in which case the cut is spent on the dummy
 *   opponent and `base = plain Buchholz` of the real opponents (Art 16.5.1).
 *   Verified against two live groups:
 *     - 15816 (2025, no byes, 64 players): value within 9.8e-6 of official;
 *       ordering 62/64 (the gap is a not-yet-decoded sub-10⁻⁵ packed field that
 *       only separates the very deepest ties).
 *     - 6072 (Linköpingsmästerskapen 2016, the SSF reference torture set): 31/31
 *       non-bye and all 6 bye players match the official `secPoints` (this old
 *       tournament returns `secPoints` rounded to ~0.1, so compare with that
 *       tolerance).
 *   Field 1 = number of wins (Art 7.1); field 2 = games played with black
 *   (Art 7.3). Confidence: HIGH for value and near-complete ordering. The
 *   sub-10⁻⁵ field and multi-VUR cases remain to be decoded.
 *
 * Not yet modeled (caller uses the indicative fallback): SSF_BERGER (1, likely
 * Sonneborn-Berger base + similar packing), MEDIAN_BUCHHOLZ (4), PROGRESSIVE (5),
 * FIDE_BUCHHOLZ_2024 (7), plain BUCHHOLZ (2). ALLSVENSKAN (6) is teams (handled
 * separately).
 */
export function computeSsfSecPoints(tiebreakSystem: number, ctx: TiebreakContext): number | null {
  switch (tiebreakSystem) {
    case TiebreakSystem.SSF_BUCHHOLZ: {
      // kvalitetspoäng = Buchholz Cut-1 over the real opponents. For a bye we use
      // the simpler "drop the bye from the cut → plain Buchholz of the real
      // opponents" rule. The rulebook's exact fictive-opponent rule (§7.2.2 —
      // fictive scores are provided in `byeFictiveScores`) was tried and matched
      // the STORED tables WORSE (e.g. LM 2016 37→33), because real stored tables
      // vary by era; neither rule fits recent bye players either. Bye handling is
      // therefore best-effort, and self-verification flags groups we don't match.
      const base = ctx.byeFictiveScores.length
        ? buchholz(ctx.opponentScores)
        : buchholzCut1(ctx.opponentScores);
      return pack(base, [ctx.wins, ctx.gamesWithBlack]);
    }
    default:
      return null;
  }
}

/** Whether {@link computeSsfSecPoints} models this system (vs. the fallback). */
export function isSsfSecPointsSupported(tiebreakSystem: number): boolean {
  return tiebreakSystem === TiebreakSystem.SSF_BUCHHOLZ;
}

// ---------------------------------------------------------------------------
// Secondary-ordering confidence (powers the `estimated` flag on standings)
// ---------------------------------------------------------------------------

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

/** Individual systems whose secondary we reproduce (reverse-engineered; pending SSF). */
const REPRODUCED_SYSTEMS = new Set<number>([TiebreakSystem.SSF_BUCHHOLZ]);

/**
 * Systems SSF has confirmed bit-correct. Empty until we get that confirmation;
 * once a system is added here, clean groups of it report `'official'` (and stop
 * being flagged as estimates). The friend-verification is the gate.
 */
const CONFIRMED_SYSTEMS = new Set<number>();

/**
 * Classify a group's secondary-ordering basis. The `estimated` flag is derived
 * from this — see {@link isEstimated}. Note this is keyed on the *system* and the
 * *data*, NOT on team-vs-individual: a clean round-robin (no unplayed rounds) of
 * a confirmed system is `'official'`, while a Swiss event with byes, or any
 * unconfirmed system, is not. The round-robin advantage falls out of
 * `hasUnhandledUnplayed` — round-robins have no byes, so nothing to mishandle.
 */
export function secondaryBasis(opts: {
  mode: 'individual' | 'team';
  tiebreakSystem: number | undefined;
  /** True when the data has unplayed-round cases we can't reproduce exactly (e.g. multi-VUR). */
  hasUnhandledUnplayed: boolean;
}): SecondaryBasis {
  if (opts.mode === 'team') return 'exact';
  const sys = opts.tiebreakSystem;
  if (sys !== undefined && CONFIRMED_SYSTEMS.has(sys) && !opts.hasUnhandledUnplayed) {
    return 'official';
  }
  if (sys !== undefined && REPRODUCED_SYSTEMS.has(sys)) return 'reproduced';
  return 'indicative';
}

/** Whether a basis should be shown to users as an estimate (vs. trustworthy). */
export function isEstimated(basis: SecondaryBasis): boolean {
  return basis === 'reproduced' || basis === 'indicative';
}

/**
 * Self-verification: does our reconstructed ordering agree with the official
 * standings? `orderedKeys` is our rows best-first; `officialPlace` maps each
 * contender key to its official `place`. Returns true iff every contender is
 * present in the official table and our order never puts a worse place before a
 * better one (equal places — official ties — are allowed in either order).
 */
export function orderingMatchesOfficial(
  orderedKeys: readonly string[],
  officialPlace: ReadonlyMap<string, number>
): boolean {
  if (orderedKeys.length === 0) return false;
  let prevPlace = Number.NEGATIVE_INFINITY;
  for (const key of orderedKeys) {
    const place = officialPlace.get(key);
    if (place === undefined) return false; // contender missing from official table
    if (place < prevPlace) return false; // our order contradicts official place
    prevPlace = place;
  }
  return true;
}
