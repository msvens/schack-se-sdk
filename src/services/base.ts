import { ApiResponse, ApiError } from '../types';
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
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const config: RequestInit = {
        headers: {
          ...this.defaultHeaders,
          ...options.headers,
        },
        ...options,
      };
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return {
        data: data as T,
        status: response.status,
        message: 'Success',
      };
    } catch (error) {
      const apiError: ApiError = {
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        status: 500,
      };

      return {
        error: apiError.message,
        status: apiError.status,
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
