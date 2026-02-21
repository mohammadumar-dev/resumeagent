import { apiClient } from '@/lib/api/client';

export type ResumeStatus = "ACTIVE" | "INACTIVE" | "ARCHIVED" | (string & {});

export interface AcivityListItem {
  activity: string;
  title: string | null;
  company: string | null;
  status: ResumeStatus;
  time: string; 
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

export type RecentActivityResponse = PaginatedResponse<AcivityListItem>;

export const recentActivity = {
  view: async (params?: {
    page?: number;
    size?: number;
  }): Promise<RecentActivityResponse> => {
    const page = params?.page ?? 0;
    const size = params?.size ?? 20;

    const search = new URLSearchParams({
      page: String(page),
      size: String(size),
    });

    return apiClient.get<RecentActivityResponse>(`/api/activity/recent?${search.toString()}`);
  },
};
