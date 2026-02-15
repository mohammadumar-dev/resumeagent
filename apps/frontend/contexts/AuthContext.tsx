"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '@/lib/api/auth';
import type { User, LoginRequest, RegisterRequest, ApiError } from '@/types/auth';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (data: LoginRequest) => Promise<void>;
    register: (data: RegisterRequest) => Promise<void>;
    logout: () => Promise<void>;
    checkAuth: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const isAuthenticated = user !== null;

    /**
     * Check if user is authenticated by fetching current user
     */
    const checkAuth = useCallback(async () => {
        try {
            setIsLoading(true);
            const userData = await authApi.getCurrentUser();
            setUser(userData);
        } catch (error) {
            // Not authenticated or error occurred
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * Refresh user data
     */
    const refreshUser = useCallback(async () => {
        try {
            const userData = await authApi.getCurrentUser();
            setUser(userData);
        } catch (error) {
            setUser(null);
        }
    }, []);

    /**
     * Login user
     */
    const login = useCallback(async (data: LoginRequest) => {
        const response = await authApi.login(data);
        // After successful login, fetch user data
        await checkAuth();
    }, [checkAuth]);

    /**
     * Register user
     */
    const register = useCallback(async (data: RegisterRequest) => {
        await authApi.register(data);
        // Don't auto-login after registration - user needs to verify email
    }, []);

    /**
     * Logout user
     */
    const logout = useCallback(async () => {
        try {
            await authApi.logout();
        } catch (error) {
            // Logout failed, but clear local state anyway
            console.error('Logout error:', error);
        } finally {
            setUser(null);
        }
    }, []);

    /**
     * Check authentication status on mount
     */
    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    const value: AuthContextType = {
        user,
        isLoading,
        isAuthenticated,
        login,
        register,
        logout,
        checkAuth,
        refreshUser,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to use auth context
 */
export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
