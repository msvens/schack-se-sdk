import { ApiResponse } from '../types';
import { getConfig } from '../config';

export class BaseApiService {
  protected baseUrl: string;
  protected defaultHeaders: HeadersInit;

  constructor(baseUrl?: string, defaultHeaders?: HeadersInit) {
    this.baseUrl = baseUrl ?? getConfig().baseUrl;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...defaultHeaders,
    };
  }

  protected async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const config: RequestInit = {
      headers: {
        ...this.defaultHeaders,
        ...options.headers,
      },
      ...options,
    };

    // Network-level failures (DNS, connection refused, offline, CORS, etc.):
    // fetch rejects with no Response. Surface as status: 0 so callers can
    // distinguish "never reached the server" from a real HTTP error.
    let response: Response;
    try {
      response = await fetch(url, config);
    } catch (error) {
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
    try {
      const data = await response.json();
      return {
        data: data as T,
        status: response.status,
        message: 'Success',
      };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Failed to parse response',
        status: 0,
        message: 'Error',
      };
    }
  }

  protected async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  protected async post<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  protected async put<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  protected async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
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
