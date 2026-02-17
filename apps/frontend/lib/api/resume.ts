import { apiClient } from '@/lib/api/client';
import type { MasterResumeViewResponse } from '@/types/master-resume';
import type { ResumeGenerateResponse, ResumeListAllResponse } from '@/types/resume';

export const resumeApi = {

  generate: async (
    jobDescription: string,
  ): Promise<ResumeGenerateResponse> => {
    const formData = new FormData();
    formData.append('jobDescription', jobDescription);

    return apiClient.post<ResumeGenerateResponse>(
      '/api/resume/generate',
      formData,
    );
  },

  listAll: async (params?: {
    page?: number;
    size?: number;
    sort?: string;
  }): Promise<ResumeListAllResponse> => {
    const page = params?.page ?? 0;
    const size = params?.size ?? 20;
    const sort = params?.sort ?? 'createdAt,desc';

    const search = new URLSearchParams({
      page: String(page),
      size: String(size),
      sort,
    });

    return apiClient.get<ResumeListAllResponse>(
      `/api/resume/list/all?${search.toString()}`,
    );
  },

  view: async (resumeId: string): Promise<MasterResumeViewResponse> => {
    return apiClient.get<MasterResumeViewResponse>(`/api/resume/view/${resumeId}`);
  },

  downloadGreen: async (resumeId: string): Promise<Blob> => {
    return apiClient.blob(`/api/resume/${resumeId}/green/download`);
  },

  downloadBlue: async (resumeId: string): Promise<Blob> => {
    return apiClient.blob(`/api/resume/${resumeId}/blue/download`);
  },
};
