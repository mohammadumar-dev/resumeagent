import type { CommonResponse } from "@/types/auth";

export type ResumeStatus = "ACTIVE" | "INACTIVE" | "ARCHIVED" | (string & {});

export interface ResumeListItem {
  id: string;
  jobTitle: string;
  companyName: string | null;
  status: ResumeStatus;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
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

export type ResumeListAllResponse = PaginatedResponse<ResumeListItem>;

export type ResumeGenerateResponse = CommonResponse;

