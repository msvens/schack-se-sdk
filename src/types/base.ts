// Base API types
// Core types used across all API domains

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  status: number;
  message?: string;
}

export interface ApiError {
  message: string;
  status: number;
  code?: string;
}

/**
 * Per-request options accepted by every service method.
 */
export interface RequestOptions {
  /**
   * Milliseconds to wait before aborting the request. On timeout the call
   * resolves with `{ status: 408, error: "Request timed out after Nms" }`.
   * Overrides the service-level (constructor) and global (`configure`) defaults
   * for this call only.
   */
  timeoutMs?: number;
}
