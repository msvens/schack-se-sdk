/**
 * Side prizes ("Age & Ranking prizes") attached to a tournament group.
 *
 * The federation stores these as `TournamentClassGroupDto.prizeCategories`, a
 * list of bands each with a `type` saying which dimension the band is in. This
 * module interprets that raw encoding (which `type` means ages vs Elo vs
 * age≥60) and matches players to a category, so consumers never re-derive the
 * federation's own rules — and every consumer gets the same answer to "who is
 * eligible for R3".
 *
 * The type constants below were confirmed by schack.se (2026-08-11). Where the
 * *interpretation* of a type's bounds is still inferred from live data rather
 * than confirmed, it is flagged per-case.
 *
 * Note `registrationCategories` on the same group is a DIFFERENT thing — entry
 * restrictions such as "Rankingspärr 1750+" — distinguished by `usagetype`
 * (1 = prize, 2 = registration). Use {@link isPrizeCategory} to keep them apart.
 */
import {
  getPlayerRatingByAlgorithm,
  isFemale,
  chessAge,
} from './ratingUtils';
import type {
  PrizeCategoryDto,
  TournamentEndResultDto,
} from '../types';

// =============================================================================
// Constants (confirmed by schack.se 2026-08-11)
// =============================================================================

/** Prize-category `type` codes. */
export const PrizeCategoryType = {
  /** Age band. `start`/`end` are ages (see {@link chessAge}). */
  AGE: 1,
  /** Women's prize ("DAM"). Matched as "is female"; any `start`/`end` bounds
   *  are present in the data but not applied (see resolvePrizeMembers). */
  WOMEN: 2,
  /** Senior/veteran ("VETERAN"). Bounds are ignored; the rule is age ≥ 60. */
  SENIOR: 3,
  /** Rating band ("RANKING"). `start`/`end` are Elo bounds, inclusive. */
  RATING: 4,
  /** SM class ("SM-KLASS"). Only ever seen as a registration restriction. */
  SMCLASS: 5,
} as const;
export type PrizeCategoryTypeValue = typeof PrizeCategoryType[keyof typeof PrizeCategoryType];

// `usagetype` values, backing isPrizeCategory. Not exported: consumers use
// isPrizeCategory rather than the raw number.
const USAGE_PRIZE = 1;

/**
 * `andlogic`: how multiple conditions in a category combine. Internal and
 * currently unused: no category carries a combined condition today (each is
 * matched by its single `type`), and there is no live non-OR example to
 * implement or test against. It stays a matching detail — used internally once
 * AND-combination is implemented, never exported (callers don't reason about it).
 * The raw value remains on `PrizeCategoryDto` for anyone who wants to inspect it.
 */
const PrizeCategoryLogic = {
  AND: 1,
  OR: -1,
} as const;

/**
 * Minimum age for a SENIOR prize, separate per sex upstream (both 60 today).
 * Internal: applied by resolvePrizeMembers; the bounds on a SENIOR category are
 * ignored in favour of this.
 */
const SeniorAgeLimit = {
  WOMEN: 60,
  MALE: 60,
} as const;

// =============================================================================
// Interpretation (no player data)
// =============================================================================

/**
 * A prize category parsed into a described rule, so a consumer never re-derives
 * that `start`/`end` mean ages here, Elo there, and nothing for SENIOR.
 */
export type PrizeRule =
  | { kind: 'rating'; min: number; max: number }
  | { kind: 'age'; minAge: number; maxAge: number }
  | { kind: 'senior' } // bounds ignored; rule is age ≥ SeniorAgeLimit
  | { kind: 'women' } // bounds ignored; rule is "is female" (see resolvePrizeMembers)
  | { kind: 'smclass' } // registration restriction; not matched as a prize
  | { kind: 'unknown'; type: number };

/**
 * Whether a category is a prize (`usagetype === 1`) rather than an entry
 * restriction from `registrationCategories` (`usagetype === 2`).
 */
export function isPrizeCategory(category: PrizeCategoryDto): boolean {
  return category.usagetype === USAGE_PRIZE;
}

/** Interpret a raw category into a {@link PrizeRule}. Pure — no player data. */
export function parsePrizeCategory(category: PrizeCategoryDto): PrizeRule {
  switch (category.type) {
    case PrizeCategoryType.RATING:
      return { kind: 'rating', min: category.start, max: category.end };
    case PrizeCategoryType.AGE:
      return { kind: 'age', minAge: category.start, maxAge: category.end };
    case PrizeCategoryType.SENIOR:
      return { kind: 'senior' };
    case PrizeCategoryType.WOMEN:
      return { kind: 'women' };
    case PrizeCategoryType.SMCLASS:
      return { kind: 'smclass' };
    default:
      return { kind: 'unknown', type: category.type };
  }
}

// =============================================================================
// Matching
// =============================================================================

export interface PrizeEligibilityOptions {
  /** Calendar year the tournament is played in — the basis for every age band. */
  tournamentYear: number;
  /** Group ranking algorithm, so ratings match what the standings table displays. */
  rankingAlgorithm: number | null | undefined;
}

/** Inclusive band check. */
function withinBand(value: number | null | undefined, min: number, max: number): boolean {
  return value != null && value >= min && value <= max;
}

/**
 * Contender ids from `results` eligible for `category`.
 *
 * PURE: the caller passes the standings it already has, so this never touches
 * the network. Ratings come from `getPlayerRatingByAlgorithm` — the same call
 * the standings table uses — so a player's displayed rating and their band
 * membership can never disagree, including when a fallback rating is used (a
 * player rated only in another time control is banded on that fallback rating,
 * as the federation does; verified against resultat.schack.se).
 *
 * - Rating band: rating within `[start, end]` inclusive. A genuinely unrated
 *   player (rating `null`) counts only towards a band starting at 0 — the
 *   organiser's catch-all, since no real SSF rating sits between 1 and 1000.
 * - Age band: {@link chessAge} within `[start, end]`.
 * - Senior: age ≥ 60 for the player's sex; bounds ignored.
 * - Women: female. Any rating bounds on the category are NOT applied — see the
 *   note in the implementation (verified against resultat.schack.se).
 * - SM class / unknown types: nobody.
 *
 * Only valid for individual standings; team result rows carry no player info.
 *
 * Returns `[]` for a non-prize category (`usagetype !== 1`) — the entries in a
 * group's `registrationCategories` are entry restrictions, not prizes, and share
 * the same `PrizeCategoryDto` shape, so this guards against one being passed by
 * mistake (which would otherwise return a plausible-but-wrong "winners" list,
 * e.g. every player under a "Rankingspärr 1750" registration bar).
 *
 * @returns Eligible contender ids, in the order they appear in `results`.
 */
export function resolvePrizeMembers(
  category: PrizeCategoryDto,
  results: readonly TournamentEndResultDto[],
  opts: PrizeEligibilityOptions
): number[] {
  if (!isPrizeCategory(category)) return [];
  const { tournamentYear, rankingAlgorithm } = opts;
  const rule = parsePrizeCategory(category);
  const ids: number[] = [];

  for (const row of results) {
    // Skip the synthetic walkover/bye row (-100, birthdate 1970), which would
    // otherwise fall into low age bands.
    if (row.contenderId < 0) continue;
    const player = row.playerInfo;
    if (!player) continue;

    const inRatingBand = (min: number, max: number): boolean => {
      const rating = getPlayerRatingByAlgorithm(player.elo, rankingAlgorithm).rating;
      // Unrated: eligible only when the band starts at 0 (the catch-all).
      return rating == null ? min === 0 : withinBand(rating, min, max);
    };

    let eligible = false;
    switch (rule.kind) {
      case 'rating':
        eligible = inRatingBand(rule.min, rule.max);
        break;
      case 'age': {
        const age = chessAge(player.birthdate, tournamentYear);
        eligible = withinBand(age, rule.minAge, rule.maxAge);
        break;
      }
      case 'senior': {
        // Age ≥ 60 (schack.se-confirmed), where age is chessAge(tournamentYear).
        // Known caveat: the official site has been observed to include a player
        // turning 60 the *following* calendar year (chessAge 59) — the exact
        // reference-year/season rule is unconfirmed and there are only two
        // SENIOR categories in 507 sampled tournaments to check against.
        const age = chessAge(player.birthdate, tournamentYear);
        const limit = isFemale(player) ? SeniorAgeLimit.WOMEN : SeniorAgeLimit.MALE;
        eligible = age != null && age >= limit;
        break;
      }
      case 'women':
        // A women's prize is "best woman" — every female is eligible. Any rating
        // bounds on the category are NOT applied: verified against
        // resultat.schack.se, where an unrated woman (Yeganeh Ranjbar, 0) is
        // listed under "Dampris 1400–2500" (group 16129). There is no live
        // example of a rated woman falling outside a women's band, so whether
        // such bounds ever restrict is an open question for schack.se.
        eligible = isFemale(player);
        break;
      case 'smclass':
      case 'unknown':
        eligible = false;
        break;
    }
    if (eligible) ids.push(row.contenderId);
  }

  return ids;
}
