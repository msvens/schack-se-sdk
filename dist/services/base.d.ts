import { ApiResponse, RequestOptions } from '../types';
export declare class BaseApiService {
    protected baseUrl: string;
    protected defaultHeaders: HeadersInit;
    protected timeoutMs?: number;
    constructor(baseUrl?: string, defaultHeaders?: HeadersInit, timeoutMs?: number);
    protected request<T>(endpoint: string, options?: RequestInit, reqOptions?: RequestOptions): Promise<ApiResponse<T>>;
    protected get<T>(endpoint: string, reqOptions?: RequestOptions): Promise<ApiResponse<T>>;
    protected post<T>(endpoint: string, body?: unknown, reqOptions?: RequestOptions): Promise<ApiResponse<T>>;
    protected put<T>(endpoint: string, body?: unknown, reqOptions?: RequestOptions): Promise<ApiResponse<T>>;
    protected delete<T>(endpoint: string, reqOptions?: RequestOptions): Promise<ApiResponse<T>>;
    protected formatDate(date: Date): string;
    protected formatDateToString(date: Date): string;
    protected getCurrentDate(): string;
}
//# sourceMappingURL=base.d.ts.map