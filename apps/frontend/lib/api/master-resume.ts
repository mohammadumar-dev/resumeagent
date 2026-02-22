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
      // 403/404 are expected when the user has no master resume yet.
      return await apiClient.get<MasterResumeViewResponse>('/api/master-resume/view', { silent: true });
    } catch (error) {
      const status = (error as { status?: number; message?: string } | null)?.status;
      if (status === 403 || status === 404) return null;
      // Backward-compatible: older backend versions returned 400 for missing master resume.
      const message = (error as { message?: string } | null)?.message?.toLowerCase() ?? "";
      if (status === 400 && message.includes("master resume") && (message.includes("not found") || message.includes("does not exist"))) {
        return null;
      }
      console.error(`[API] /api/master-resume/view`, error);
      throw error;
    }
  },

  remove: async (): Promise<MasterResumeCommonResponse> => {
    return apiClient.delete<MasterResumeCommonResponse>('/api/master-resume/delete');
  },
};
