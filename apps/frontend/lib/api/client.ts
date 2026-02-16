import { ApiError } from '@/types/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export class ApiClient {
    private baseUrl: string;

    constructor(baseUrl: string = API_BASE_URL) {
        this.baseUrl = baseUrl;
    }

    /**
     * Make an HTTP request with credentials and error handling
     */
    async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const url = `${this.baseUrl}${endpoint}`;

        const defaultHeaders: HeadersInit = {
            'Accept': 'application/json',
        };


        const config: RequestInit = {
            ...options,
            headers: {
                ...defaultHeaders,
                ...options.headers,
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
                let errorData: ApiError;

                if (isJson) {
                    errorData = await response.json();
                } else {
                    const text = await response.text();
                    errorData = {
                        message: text || response.statusText || 'An error occurred',
                        status: response.status,
                    };
                }

                throw {
                    ...errorData,
                    status: response.status,
                } as ApiError;
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
    async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
        return this.request<T>(endpoint, {
            ...options,
            method: 'GET',
        });
    }

    async post<T>(
        endpoint: string,
        data?: unknown,
        options?: RequestInit
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
        options?: RequestInit
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


    /**
     * DELETE request
     */
    async delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
        return this.request<T>(endpoint, {
            ...options,
            method: 'DELETE',
        });
    }
}

// Export singleton instance
export const apiClient = new ApiClient();
