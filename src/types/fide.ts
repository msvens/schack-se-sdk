/**
 * FIDE player types from the ChessTools API (https://api.chesstools.org)
 *
 * These types are exact 1:1 mappings of the JSON responses from the API,
 * including internal fields like `_id` (MongoDB ObjectId). We don't reshape
 * or omit fields — what the API returns is what the type describes.
 *
 * The API has two data sources with different response shapes:
 * - **Web scraper** (scrapes FIDE website): `top_active`, `player_info`, `player_history`
 * - **MongoDB rating list** (parsed from FIDE XML): `top_by_rating`, `/fide/{id}`, `search`
 *
 * This leads to inconsistencies across endpoints (e.g. `fideid` vs `fide_id`,
 * `rating` as number vs string, `country` vs `federation`). Each interface
 * models the exact shape returned by its corresponding endpoint.
 */

/**
 * A single rating period entry used in player history.
 * Shared across endpoints that return history data.
 */
export interface FideRatingPeriod {
  period: string;
  date: string;
  classical_rating: number;
  classical_games: number;
  rapid_rating: number;
  rapid_games: number;
  blitz_rating: number;
  blitz_games: number;
}

/**
 * Player from /fide/{id} and /fide/top_by_rating endpoints (MongoDB rating list).
 * Only classical rating data is stored from the FIDE XML — no rapid/blitz fields.
 * Note: `fideid` is a string, `rating` is a number, `birth_year` is a number.
 */
export interface FidePlayer {
  _id: string;
  fideid: string;
  name: string;
  country: string;
  sex: string;
  title: string;
  w_title: string;
  o_title: string;
  foa_title: string;
  rating: number;
  games: number;
  k_factor: string;
  birth_year: number;
  flag: string;
}

/**
 * Detailed player info from /fide/player_info/ endpoint.
 * Note: `fide_id` (not `fideid`), `sex` is full word ("Male"/"Female"),
 * `fide_title` is full word ("Grandmaster").
 * Rating fields are only present in history entries, not on the base response.
 */
export interface FidePlayerInfo {
  fide_id: string;
  name: string;
  federation: string;
  sex: string;
  fide_title: string;
  birth_year: number;
  world_rank_all: number;
  world_rank_active: number;
  continental_rank_all: number;
  continental_rank_active: number;
  national_rank_all: number;
  national_rank_active: number;
  history?: FideRatingPeriod[];
}

/**
 * Active top player from /fide/top_active/ endpoint (web scraper).
 * Note: `fide_id` (not `fideid`), `rating` and `rank` are strings.
 * Uses `country` (not `federation`) as parsed from the FIDE HTML table.
 */
export interface FideActivePlayer {
  fide_id: string;
  name: string;
  country: string;
  rating: string;
  rank: string;
  history?: FideRatingPeriod[];
}

