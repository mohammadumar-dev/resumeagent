import { apiClient } from '@/lib/api/client';
import type {
  CreateAndUpdateMasterResumeRequest,
  MasterResumeCommonResponse,
  MasterResumeViewResponse,
} from '@/types/master-resume';

export const masterResumeApi = {
  create: async (
    data: CreateAndUpdateMasterResumeRequest,
  ): Promise<MasterResumeCommonResponse> => {
    return apiClient.post<MasterResumeCommonResponse>('/api/master-resume/create', data);
  },

  createFromText: async (
    resumeText: string,
  ): Promise<MasterResumeCommonResponse> => {
    const formData = new FormData();
    formData.append('resume', resumeText);

    return apiClient.post<MasterResumeCommonResponse>(
      '/api/master-resume/create/text',
      formData,
    );
  },

  edit: async (
    data: CreateAndUpdateMasterResumeRequest,
  ): Promise<MasterResumeCommonResponse> => {
    return apiClient.put<MasterResumeCommonResponse>('/api/master-resume/update', data);
  },

  view: async (): Promise<MasterResumeViewResponse> => {
    return apiClient.get<MasterResumeViewResponse>('/api/master-resume/view');
  },

  viewOrNull: async (): Promise<MasterResumeViewResponse | null> => {
    try {
      return await apiClient.get<MasterResumeViewResponse>('/api/master-resume/view');
    } catch (error) {
      const status = (error as { status?: number } | null)?.status;
      if (status === 403 || status === 404) return null;
      throw error;
    }
  },

  remove: async (): Promise<MasterResumeCommonResponse> => {
    return apiClient.delete<MasterResumeCommonResponse>('/api/master-resume/delete');
  },
};
