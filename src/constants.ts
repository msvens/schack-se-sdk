/**
 * API Configuration Constants
 *
 * USAGE:
 * - For production: Use SSF_PROD_API_URL
 * - For development/testing: Use SSF_DEV_API_URL
 * - Default: SSF_PROD_API_URL
 */

// API Versions
export const API_VERSION = 'v1';           // Production API version
export const API_VERSION_DEV = 'v1';       // Dev API version

// Remote API URLs (direct API calls)
export const SSF_PROD_API_URL = `https://member.schack.se/public/api/${API_VERSION}`;
export const SSF_DEV_API_URL = `https://halvarsson.no-ip.com/webapp/memdb/public/api/${API_VERSION_DEV}`;

// Current API URL (default to production)
export const CURRENT_API_URL = SSF_PROD_API_URL;

// Current remote API URL for tests
export const CURRENT_TEST_API_URL = SSF_PROD_API_URL;

// ChessTools API URL (FIDE data)
export const CHESSTOOLS_API_URL = 'https://api.chesstools.org';

// mfide API URL (FIDE data from FIDE's official rating lists). Needs an API
// key; browser apps go through a same-origin proxy that adds it instead.
export const MFIDE_API_URL = 'https://mfide.mellowtech.org/api';

// Default timeout for API requests
export const DEFAULT_TIMEOUT = 10000;

// The SSF group search (TournamentService.searchGroups) returns at most this many
// groups, oldest tournaments first. The cap is server-side and can't be raised; a
// result of exactly this length was most likely cut off.
export const SEARCH_GROUPS_MAX_RESULTS = 100;

// Legacy exports (deprecated - use direct URLs instead)
/** @deprecated Use SSF_PROD_API_URL instead */
export const SSF_API_BASE_URL = SSF_PROD_API_URL;
