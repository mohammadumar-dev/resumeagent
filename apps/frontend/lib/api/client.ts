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

type ApiRequestOptions = RequestInit & { silent?: boolean };

export class ApiClient {
    private baseUrl: string;

    constructor(baseUrl: string = API_BASE_URL) {
        this.baseUrl = baseUrl;
    }

    /**
     * Make an HTTP request with credentials and error handling
     */
    async request<T>(endpoint: string, options: ApiRequestOptions = {}): Promise<T> {
        const url = `${this.baseUrl}${endpoint}`;

        const { silent, ...requestOptions } = options;

        const defaultHeaders: HeadersInit = {
            'Accept': 'application/json',
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

                throw apiError;
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
                throw {
                    message: 'Network error. Please check your connection.',
                    status: 0,
                } as ApiError;
            }

            // Re-throw API errors
            throw error;
        }
    }

    /**
     * GET request
     */
    async get<T>(endpoint: string, options?: ApiRequestOptions): Promise<T> {
        return this.request<T>(endpoint, {
            ...options,
            method: 'GET',
        });
    }

    async post<T>(
        endpoint: string,
        data?: unknown,
        options?: ApiRequestOptions
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
        options?: ApiRequestOptions
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
        options?: ApiRequestOptions
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
    async delete<T>(endpoint: string, options?: ApiRequestOptions): Promise<T> {
        return this.request<T>(endpoint, {
            ...options,
            method: 'DELETE',
        });
    }

    async blob(endpoint: string, options?: ApiRequestOptions): Promise<Blob> {
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
