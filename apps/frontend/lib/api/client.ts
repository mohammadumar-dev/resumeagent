import { ApiError } from '@/types/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

function defaultMessageForStatus(status: number, statusText?: string): string {
    if (statusText && statusText.trim()) return statusText;
    if (status === 401) return "Unauthorized";
    if (status === 403) return "Forbidden";
    if (status === 404) return "Not found";
    if (status >= 500) return "Internal server error";
    return `Request failed (${status})`;
}

function extractApiError(payload: unknown, status: number, statusText?: string): ApiError {
    const body = (payload ?? {}) as Record<string, unknown>;

    const message =
        (typeof body.message === "string" && body.message.trim()) ||
        (typeof body.error === "string" && body.error.trim()) ||
        (typeof body.detail === "string" && body.detail.trim()) ||
        defaultMessageForStatus(status, statusText);

    const errors =
        body.errors && typeof body.errors === "object" && !Array.isArray(body.errors)
            ? (body.errors as Record<string, string[]>)
            : undefined;

    return {
        message,
        status,
        errors,
    };
}

function shouldLogPayload(payload: unknown): boolean {
    if (!payload) return false;
    if (typeof payload !== "object") return true;
    if (Array.isArray(payload)) return payload.length > 0;
    return Object.keys(payload as Record<string, unknown>).length > 0;
}

export class ApiClient {
    private baseUrl: string;

    constructor(baseUrl: string = API_BASE_URL) {
        this.baseUrl = baseUrl;
    }

    private getCsrfTokenFromCookie(): string | null {
        if (typeof document === "undefined") return null;
        const match = document.cookie.match(/(?:^|; )XSRF-TOKEN=([^;]+)/);
        return match ? decodeURIComponent(match[1]) : null;
    }

    private shouldAttachCsrf(method?: string): boolean {
        if (!method) return false;
        return !["GET", "HEAD", "OPTIONS"].includes(method.toUpperCase());
    }

    private async ensureCsrfToken(): Promise<string | null> {
        const existing = this.getCsrfTokenFromCookie();
        if (existing) return existing;
        if (typeof document === "undefined") return null;

        try {
            await fetch(`${this.baseUrl}/auth/me`, {
                method: "GET",
                headers: { "Accept": "application/json" },
                credentials: "include",
                cache: "no-store",
            });
        } catch {
            // Best-effort: even a 401 can still set the CSRF cookie.
        }

        return this.getCsrfTokenFromCookie();
    }

    /**
     * Make an HTTP request with credentials and error handling
     */
    async request<T>(
        endpoint: string,
        options: (RequestInit & { silent?: boolean }) = {}
    ): Promise<T> {
        const url = `${this.baseUrl}${endpoint}`;

        const { silent, ...requestOptions } = options;

        const shouldAttach = this.shouldAttachCsrf(requestOptions.method);
        const csrfToken = shouldAttach ? await this.ensureCsrfToken() : null;

        const defaultHeaders: HeadersInit = {
            'Accept': 'application/json',
            ...(csrfToken ? { 'X-CSRF-TOKEN': csrfToken } : {}),
        };

        const config: RequestInit = {
            ...requestOptions,
            headers: {
                ...defaultHeaders,
                ...requestOptions.headers,
            },
            credentials: 'include', // Include cookies for authentication
        };

        try {
            const response = await fetch(url, config);

            // Handle non-JSON responses
            const contentType = response.headers.get('content-type');
            const isJson = contentType?.includes('application/json');

            if (!response.ok) {
                // Parse error response
                let apiError: ApiError;
                const log = response.status >= 500 ? console.error : console.warn;

                if (isJson) {
                    const json = await response.json();
                    apiError = extractApiError(json, response.status, response.statusText);
                    if (!silent) {
                        if (shouldLogPayload(json)) {
                            log(`[API ${response.status}] ${endpoint}`, json);
                        } else {
                            log(`[API ${response.status}] ${endpoint} ${apiError.message}`);
                        }
                    }
                } else {
                    const text = await response.text();
                    apiError = {
                        message: text || defaultMessageForStatus(response.status, response.statusText),
                        status: response.status,
                    } as ApiError;
                    if (!silent) log(`[API ${response.status}] ${endpoint} ${apiError.message}`, text);
                }

                return Promise.reject(apiError);
            }
            // Parse successful response
            if (isJson) {
                return await response.json();
            } else {
                // For non-JSON responses (like plain text), return as is
                return (await response.text()) as unknown as T;
            }
        } catch (error) {
            // Network errors or other fetch failures
            if (error instanceof TypeError) {
                return Promise.reject({
                    message: 'Network error. Please check your connection.',
                    status: 0,
                } as ApiError);
            }

            // Re-throw API errors
            return Promise.reject(error);
        }
    }

    /**
     * GET request
     */
    async get<T>(endpoint: string, options?: (RequestInit & { silent?: boolean })): Promise<T> {
        return this.request<T>(endpoint, {
            ...options,
            method: 'GET',
        });
    }

    async post<T>(
        endpoint: string,
        data?: unknown,
        options?: (RequestInit & { silent?: boolean })
    ): Promise<T> {
        const isFormData = data instanceof FormData;

        return this.request<T>(endpoint, {
            ...options,
            method: 'POST',
            body: isFormData ? (data as FormData) : data ? JSON.stringify(data) : undefined,
            headers: {
                ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
                ...options?.headers,
            },
        });
    }

    async put<T>(
        endpoint: string,
        data?: unknown,
        options?: (RequestInit & { silent?: boolean })
    ): Promise<T> {
        const isFormData = data instanceof FormData;

        return this.request<T>(endpoint, {
            ...options,
            method: 'PUT',
            body: isFormData ? (data as FormData) : data ? JSON.stringify(data) : undefined,
            headers: {
                ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
                ...options?.headers,
            },
        });
    }

    async patch<T>(
        endpoint: string,
        data?: unknown,
        options?: (RequestInit & { silent?: boolean })
    ): Promise<T> {
        const isFormData = data instanceof FormData;

        return this.request<T>(endpoint, {
            ...options,
            method: 'PATCH',
            body: isFormData ? (data as FormData) : data ? JSON.stringify(data) : undefined,
            headers: {
                ...(isFormData ? {} : data ? { 'Content-Type': 'application/json' } : {}),
                ...options?.headers,
            },
        });
    }


    /**
     * DELETE request
     */
    async delete<T>(endpoint: string, options?: (RequestInit & { silent?: boolean })): Promise<T> {
        return this.request<T>(endpoint, {
            ...options,
            method: 'DELETE',
        });
    }

    async blob(endpoint: string, options?: (RequestInit & { silent?: boolean })): Promise<Blob> {
        const url = `${this.baseUrl}${endpoint}`;
        const { silent, ...requestOptions } = options ?? {};

        const response = await fetch(url, {
            ...requestOptions,
            method: requestOptions?.method ?? "GET",
            credentials: "include",
        });

        if (!response.ok) {
            const contentType = response.headers.get("content-type");
            const isJson = contentType?.includes("application/json");
            const log = response.status >= 500 ? console.error : console.warn;

            if (isJson) {
                const json = await response.json();
                const apiError = extractApiError(json, response.status, response.statusText);
                if (!silent) {
                    if (shouldLogPayload(json)) {
                        log(`[API ${response.status}] ${endpoint}`, json);
                    } else {
                        log(`[API ${response.status}] ${endpoint} ${apiError.message}`);
                    }
                }
                throw apiError;
            }

            const text = await response.text();
            const message = text || defaultMessageForStatus(response.status, response.statusText);
            if (!silent) log(`[API ${response.status}] ${endpoint} ${message}`, text);
            throw {
                message,
                status: response.status,
            };
        }

        return response.blob();
    }

}

// Export singleton instance
export const apiClient = new ApiClient();
