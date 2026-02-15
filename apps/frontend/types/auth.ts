export interface User {
    id: string;
    email: string;
    fullName: string;
    role: 'USER' | 'ADMIN';
    emailActive: boolean;
    plan: string;
    resumeGenerationLimit: number;
    resumeGenerationUsed: number;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    fullName: string;
    email: string;
    password: string;
    confirmPassword: string;
}

export interface LoginResponse {
    message: string;
    email: string;
}

export interface RegisterResponse {
    message: string;
    email: string;
}

export interface UserInfoResponse {
    id: string;
    email: string;
    fullName: string;
    role: 'USER' | 'ADMIN';
    emailActive: boolean;
    plan: string;
    resumeGenerationLimit: number;
    resumeGenerationUsed: number;
}

export interface CommonResponse {
    message: string;
    email?: string;
}

export interface ApiError {
    message: string;
    status?: number;
    errors?: Record<string, string[]>;
}
