// 라이브러리 리포트 API 타입 정의

import type { BaseResponseDto, BaseResponseHeader } from '../common';

// ----------------------------------------------------------------------

export type LibraryReportStatus = 'active' | 'inactive';

export type LibraryReportCategoryInformation = {
  createAt?: string;
  deletedAt?: string | null;
  description?: string | null;
  isActive?: number;
  libraryCategoryIdx?: number;
  name?: string;
  updateAt?: string;
};

export type LibraryReport = {
  id: string;
  libraryReportIdx?: number;
  vodIdx?: number;
  libraryCategoryIdx?: number | null;
  libraryReportCategoryInformation?: LibraryReportCategoryInformation | null;
  registrationDate?: string;
  organizationName?: string;
  title?: string;
  playbackTime?: string;
  hasSubtitles?: boolean;
  visibilityType?: 'public' | 'organization';
  status?: LibraryReportStatus;
  fileUrl?: string;
  thumbnailUrl?: string;
  thumbnailPath?: string;
  description?: string | null;
  memo?: string | null;
  isActive?: number | boolean;
};

export type LibraryReportSummary = {
  allCount?: number;
  activeCount?: number;
  inactiveCount?: number;
};

export type GetLibraryReportsParams = {
  page?: number;
  pageSize?: number;
  status?: LibraryReportStatus;
  libraryCategoryIdx?: number;
  startDate?: string;
  endDate?: string;
  searchKey?: 'organizationName' | 'category' | 'title';
  searchValue?: string;
};

export type GetLibraryReportsResult = {
  header?: BaseResponseHeader;
  libraryReports: LibraryReport[];
  totalCount: number;
  summary: LibraryReportSummary;
};

export type LibraryCategory = {
  id: string;
  name: string;
  libraryCategoryIdx?: number | null;
  isActive: boolean;
  order?: number | null;
  description?: string | null;
};

export type GetLibraryCategoryListResult = {
  header?: BaseResponseHeader;
  categories: LibraryCategory[];
};

export type SaveLibraryCategoryListParams = {
  categoryList: Array<{
    libraryCategoryIdx?: number | null;
    name: string;
    order?: number | null;
    description?: string | null;
    isActive?: number;
  }>;
};

export type SaveLibraryCategoryListResponse = BaseResponseDto;

export type CreateLibraryReportParams = {
  libraryCategoryIdx?: number;
  title: string;
  organizationName?: string;
  category?: string;
  playbackTime?: string;
  hasSubtitles?: boolean;
  visibilityType?: 'public' | 'organization';
  description?: string;
  memo?: string;
  fileUrl: string;
  thumbnailUrl?: string;
};

export type CreateLibraryReportResponse = BaseResponseDto<LibraryReport>;

// 라이브러리 리포트 조회 요청
export type GetLibraryReportParams = {
  libraryReportIdx: number;
};

// 라이브러리 리포트 조회 응답
export type GetLibraryReportResponse = BaseResponseDto<LibraryReport>;

// 컨텐츠 수정 요청 파라미터
export type UpdateLibraryReportParams = {
  libraryReportIdx: number;
  libraryCategoryIdx?: number;
  title?: string;
  description?: string;
  category?: string;
  organizationName?: string;
  playbackTime?: string;
  hasSubtitles?: boolean | number;
  visibilityType?: 'public' | 'organization';
  fileUrl?: string;
  thumbnailUrl?: string;
  memo?: string;
  isActive?: number;
};

export type UpdateLibraryReportResponse = BaseResponseDto<LibraryReport>;

export type DeleteLibraryReportParams = {
  libraryReportIdx: number;
};

export type HideLibraryReportParams = {
  libraryReportIdx: number;
  companyIdx: number;
};

export type UnhideLibraryReportParams = {
  libraryReportIdx: number;
};

export type RegisterAsSharedDocumentParams = {
  libraryReportIdx: number;
};
