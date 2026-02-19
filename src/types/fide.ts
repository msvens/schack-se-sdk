/**
 * FIDE player types from the ChessTools API (https://api.chesstools.org)
 *
 * Note: The API is inconsistent across endpoints (e.g. `fideid` vs `fide_id`,
 * `rating` as number vs string). Each interface models the exact shape returned
 * by its corresponding endpoint.
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
 * Player from /fide/{id} and /fide/top_by_rating endpoints.
 * Note: `fideid` is a string, `rating` is a number.
 */
export interface FidePlayer {
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
  rapid_rating: number;
  rapid_games: number;
  rapid_k_factor: string;
  blitz_rating: number;
  blitz_games: number;
  blitz_k_factor: string;
  birthday: string;
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
 * Active top player from /fide/top_active/ endpoint.
 * Note: `fide_id` (not `fideid`), `rating` and `rank` are strings.
 */
export interface FideActivePlayer {
  fide_id: string;
  name: string;
  federation: string;
  rating: string;
  rank: string;
  history?: FideRatingPeriod[];
}

/**
 * Search result from /ratinglist/search endpoint.
 */
export interface FideSearchResult {
  name: string;
  fide_id: string;
  country: string;
  rating: string;
}
