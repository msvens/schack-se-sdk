import { ApiResponse, RequestOptions } from '../types';
import { getConfig } from '../config';

export class BaseApiService {
  protected baseUrl: string;
  protected defaultHeaders: HeadersInit;
  protected timeoutMs?: number;

  constructor(baseUrl?: string, defaultHeaders?: HeadersInit, timeoutMs?: number) {
    this.baseUrl = baseUrl ?? getConfig().baseUrl;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...defaultHeaders,
    };
    // Left undefined unless a per-service default was passed, so request()
    // falls through to the live global default (getConfig().timeoutMs).
    this.timeoutMs = timeoutMs;
  }

  protected async request<T>(
    endpoint: string,
    options: RequestInit = {},
    reqOptions: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;

    // Effective timeout, high→low precedence: per-call, per-service, global.
    const timeoutMs = reqOptions.timeoutMs ?? this.timeoutMs ?? getConfig().timeoutMs;
    const controller = new AbortController();
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, timeoutMs);

    const config: RequestInit = {
      headers: {
        ...this.defaultHeaders,
        ...options.headers,
      },
      ...options,
      signal: controller.signal,
    };

    try {
      // Network-level failures (DNS, connection refused, offline, CORS, etc.):
      // fetch rejects with no Response. Surface as status: 0 so callers can
      // distinguish "never reached the server" from a real HTTP error. A
      // timeout also rejects here (as an AbortError) — we give it status: 408
      // via the timedOut flag so callers can tell "too slow" apart from other
      // transport failures. These APIs never return a genuine HTTP 408, so
      // there's no realistic conflation.
      let response: Response;
      try {
        response = await fetch(url, config);
      } catch (error) {
        if (timedOut) {
          return {
            error: `Request timed out after ${timeoutMs}ms`,
            status: 408,
            message: 'Error',
          };
        }
        return {
          error: error instanceof Error ? error.message : 'Network error',
          status: 0,
          message: 'Error',
        };
      }

      // HTTP-level failures: preserve the real status code so callers can react
      // (404 vs 429 vs 500). Try to extract a meaningful error message from the
      // body; fall back to statusText if the body isn't readable JSON.
      if (!response.ok) {
        let errorMessage = response.statusText || `HTTP ${response.status}`;
        try {
          const body = await response.json();
          if (body && typeof body === 'object' && 'message' in body && typeof body.message === 'string') {
            errorMessage = body.message;
          } else if (body && typeof body === 'object' && 'error' in body && typeof body.error === 'string') {
            errorMessage = body.error;
          }
        } catch {
          // Body wasn't JSON — keep the statusText fallback
        }

        return {
          error: errorMessage,
          status: response.status,
          message: 'Error',
        };
      }

      // Success: parse body. If JSON parsing fails on a 2xx response, that's a
      // server contract violation — report it as status: 0 (no usable response).
      // The timeout also covers the body read, so a stall mid-stream surfaces
      // as a 408 rather than a spurious parse error.
      try {
        const data = await response.json();
        return {
          data: data as T,
          status: response.status,
          message: 'Success',
        };
      } catch (error) {
        if (timedOut) {
          return {
            error: `Request timed out after ${timeoutMs}ms`,
            status: 408,
            message: 'Error',
          };
        }
        return {
          error: error instanceof Error ? error.message : 'Failed to parse response',
          status: 0,
          message: 'Error',
        };
      }
    } finally {
      clearTimeout(timer);
    }
  }

  protected async get<T>(endpoint: string, reqOptions?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' }, reqOptions);
  }

  protected async post<T>(endpoint: string, body?: unknown, reqOptions?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }, reqOptions);
  }

  protected async put<T>(endpoint: string, body?: unknown, reqOptions?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    }, reqOptions);
  }

  protected async delete<T>(endpoint: string, reqOptions?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' }, reqOptions);
  }

  protected formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  protected formatDateToString(date: Date): string {
    return this.formatDate(date);
  }

  protected getCurrentDate(): string {
    return this.formatDate(new Date());
  }
}
