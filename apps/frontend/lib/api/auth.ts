import { apiClient } from './client';
import type {
    LoginRequest,
    LoginResponse,
    RegisterRequest,
    RegisterResponse,
    UserInfoResponse,
    CommonResponse,
} from '@/types/auth';

/**
 * Authentication API endpoints
 */
export const authApi = {
    /**
     * Register a new user account
     */
    register: async (data: RegisterRequest): Promise<RegisterResponse> => {
        return apiClient.post<RegisterResponse>('/auth/register', data);
    },

    /**
     * Login with email and password
     */
    login: async (data: LoginRequest): Promise<LoginResponse> => {
        return apiClient.post<LoginResponse>('/auth/login', data);
    },

    /**
     * Logout current user
     */
    logout: async (): Promise<CommonResponse> => {
        return apiClient.post<CommonResponse>('/auth/logout');
    },

    /**
     * Get current authenticated user information
     */
    getCurrentUser: async (): Promise<UserInfoResponse> => {
        return apiClient.get<UserInfoResponse>('/auth/me');
    },

    /**
     * Verify email with token
     */
    verifyEmail: async (token: string): Promise<CommonResponse> => {
        return apiClient.get<CommonResponse>(`/auth/verify-email?token=${token}`);
    },

    /**
     * Resend verification email
     */
    resendVerification: async (email: string): Promise<CommonResponse> => {
        return apiClient.post<CommonResponse>('/auth/resend-verification', { email });
    },

    /**
     * Request password reset
     */
    forgotPassword: async (email: string): Promise<CommonResponse> => {
        return apiClient.post<CommonResponse>('/auth/forgot-password', { email });
    },

    /**
     * Reset password with token
     */
    resetPassword: async (token: string, newPassword: string): Promise<CommonResponse> => {
        return apiClient.post<CommonResponse>('/auth/reset-password', {
            token,
            newPassword,
        });
    },
};
