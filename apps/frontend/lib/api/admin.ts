import { apiClient } from "./client";
import type { CommonResponse } from "@/types/auth";

export type UserRole = "USER" | "ADMIN" | (string & {});

export interface User {
  id: string;
  full_name: string | null;
  email: string;
  plan: string;
  role: UserRole;
  resume_generation_limit: number;
  resume_generation_used: number;
  is_email_active: boolean;
  created_at: string;
}

export interface PaginatedResponse<TItem> {
  items: TItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export type UserListResponse = PaginatedResponse<User>;

export interface RegisterRequest {
    fullName: string;
    email: string;
    password: string;
    confirmPassword: string;
}

export interface RegisterResponse {
    message: string;
    email: string;
}

export interface AdminUsersDashboardResponse {
  // Note: backend field name is `totalUSersCount` (capitalization preserved).
  totalUsersCount: number;
  totalAdmins: number;
  totalUsers: number;
  totalFreePlanUsers: number;
  totalPremiumPlanUsers: number;
  totalResumeGenerations: number;
}

export interface AdminUserActivitySummaryResponse {
  userId: string | null;
  email: string;
  fullName: string;
  role: string | null;
  plan: string | null;
  emailActive: boolean;
  createdAt: string | null;

  resumeGenerationLimit: number;
  resumeGenerationUsed: number;

  hasMasterResume: boolean;
  totalResumes: number;
  totalResumeGenerations: number;
  totalAgentLogs: number;

  agentSuccessCount: number;
  agentFailureCount: number;
  agentPartialCount: number;

  totalTokensUsed: number;

  lastResumeGenerationStatus: string | null;
  lastResumeGenerationAt: string | null;
}

export const adminApi = {
  listUsers: async (params?: {
    page?: number;
    size?: number;
    role?: UserRole | "ALL";
  }): Promise<UserListResponse> => {
    const page = params?.page ?? 0;
    const size = params?.size ?? 20;

    const search = new URLSearchParams({
      page: String(page),
      size: String(size),
    });

    if (params?.role && params.role !== "ALL") {
      search.set("role", params.role);
    }

    return apiClient.get<UserListResponse>(`/api/admin/users?${search.toString()}`);
  },

  registerAdmin: async (data: RegisterRequest): Promise<RegisterResponse> => {
          return apiClient.post<RegisterResponse>('/api/admin/register', data);
  },

  getDashboardStats: async (): Promise<AdminUsersDashboardResponse> => {
    return apiClient.get<AdminUsersDashboardResponse>('/api/admin/dashboard-stats');
  },

  getUserSummary: async (userId: string): Promise<AdminUserActivitySummaryResponse> => {
    return apiClient.get<AdminUserActivitySummaryResponse>(`/api/admin/users/${userId}/summary`);
  },

  deactivateUser: async (userId: string): Promise<CommonResponse> => {
    return apiClient.patch<CommonResponse>(`/api/admin/users/${userId}/deactivate`);
  },
};
