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

// Default timeout for API requests
export const DEFAULT_TIMEOUT = 10000;

// Legacy exports (deprecated - use direct URLs instead)
/** @deprecated Use SSF_PROD_API_URL instead */
export const SSF_API_BASE_URL = SSF_PROD_API_URL;
