import { apiClient } from '@/lib/api/client';

export interface DashboardAnalyticsOverviewResponse {
  monthlyResumeLimit: number;
  totalGeneratedResumes: number;
  uniqueRolesTargeted: number;
  aiSuccessRate: number;
}

export interface DashboardAnalyticsMetricsResponse {
  aiSuccessRate: number;
  monthlyResumeLimit: number;
  monthlyTokensUsed: number;
  totalTokensUsed: number;
}

export type ChartInputOutputRow = {
  date: string; // YYYY-MM-DD
  inputTokens: number;
  outputTokens: number;
};

export type ChartInputOutputResponse = {
  items: ChartInputOutputRow[];
};

export type AgentExecutionTimeResponse = {
  resumeParser: number;
  jobDescriptionAnalyzer: number;
  matching: number;
  resumeRewriter: number;
  atsOptimizer: number;
};

export type AgentExecutionStatusResponse = {
  successCount: number;
  failureCount: number;
  partialCount: number;
}

export const dashboardAnalyticsApi = {
  overview: async (): Promise<DashboardAnalyticsOverviewResponse> => {
    return apiClient.get<DashboardAnalyticsOverviewResponse>('/api/dashboard/analytics/overview');
  },

  metrics: async (): Promise<DashboardAnalyticsMetricsResponse> => {
    return apiClient.get<DashboardAnalyticsMetricsResponse>('/api/dashboard/analytics/metrics');
  },

  chart: async (): Promise<ChartInputOutputResponse> => {
    return apiClient.get<ChartInputOutputResponse>('/api/dashboard/analytics/chart/input-output-tokens');
  },

  agentExecutionTime: async (): Promise<AgentExecutionTimeResponse> => {
    return apiClient.get<AgentExecutionTimeResponse>('/api/dashboard/analytics/agent-execution-time');
  },

  agentExecutionStatus: async (): Promise<AgentExecutionStatusResponse> => {
    return apiClient.get<AgentExecutionStatusResponse>('/api/dashboard/analytics/ai-execution-status');
  },
};
