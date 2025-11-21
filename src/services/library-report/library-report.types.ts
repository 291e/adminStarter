// 라이브러리 리포트 API 타입 정의

import type { BaseResponseDto } from '../common';

// ----------------------------------------------------------------------

// 라이브러리 리포트 정보
export type LibraryReport = {
  id: string;
  title: string;
  category: string;
  status: 'active' | 'inactive';
  registrationDate: string;
  // ... 기타 필드
};

// 라이브러리 리포트 목록 조회 요청 파라미터
export type GetLibraryReportsParams = {
  tab?: 'all' | 'active' | 'inactive';
  category?: string;
  startDate?: string;
  endDate?: string;
  searchKey?: string;
  searchValue?: string;
  page: number;
  pageSize: number;
};

// 라이브러리 리포트 목록 조회 응답
export type GetLibraryReportsResponse = BaseResponseDto<{
  libraryReports: LibraryReport[];
  total: number;
}>;

// 카테고리 정보
export type Category = {
  id: string;
  name: string;
  isActive: boolean;
};

// 카테고리 목록 조회 응답
export type GetCategoriesResponse = BaseResponseDto<{
  categories: Category[];
}>;

// 카테고리 설정 저장 요청 파라미터
export type SaveCategoriesParams = {
  categories: Category[];
};

// 카테고리 설정 저장 응답
export type SaveCategoriesResponse = BaseResponseDto;

// VOD 업로드 요청 파라미터
export type CreateLibraryReportParams = {
  title: string;
  description?: string;
  category: string;
  videoFile: File;
  subtitleFile?: File;
  thumbnailFile?: File;
};

// VOD 업로드 응답
export type CreateLibraryReportResponse = BaseResponseDto<LibraryReport>;

// 라이브러리 리포트 조회 요청
export type GetLibraryReportParams = {
  libraryReportId: string;
};

// 라이브러리 리포트 조회 응답
export type GetLibraryReportResponse = BaseResponseDto<LibraryReport>;

// 컨텐츠 수정 요청 파라미터
export type UpdateLibraryReportParams = {
  libraryReportId: string;
  title?: string;
  description?: string;
  category?: string;
};

// 컨텐츠 수정 응답
export type UpdateLibraryReportResponse = BaseResponseDto<LibraryReport>;

// 컨텐츠 삭제 요청 파라미터
export type DeleteLibraryReportParams = {
  libraryReportId: string;
};

// 비디오 미리보기 URL 조회 요청 파라미터
export type GetLibraryReportPreviewUrlParams = {
  libraryReportId: string;
};

// 비디오 미리보기 URL 조회 응답
export type GetLibraryReportPreviewUrlResponse = BaseResponseDto<{
  previewUrl: string;
}>;

// 수정일 조회 요청 파라미터
export type GetLibraryReportUpdateDateParams = {
  libraryReportId: string;
};

// 수정일 조회 응답
export type GetLibraryReportUpdateDateResponse = BaseResponseDto<{
  updateDate: string;
}>;

// 카테고리 목록 조회 응답
export type GetLibraryCategoryListResponse = BaseResponseDto<{
  categories: Category[];
}>;

// 카테고리 설정 저장 요청
export type SaveLibraryCategoryListParams = {
  categories: Category[];
};

// 카테고리 설정 저장 응답
export type SaveLibraryCategoryListResponse = BaseResponseDto;

// VOD 숨김 처리 요청
export type HideLibraryReportParams = {
  libraryReportId: string;
  companyIdx: number;
};

// VOD 숨김 해제 요청
export type UnhideLibraryReportParams = {
  libraryReportId: string;
};

// 공유 문서로 등록 요청
export type RegisterAsSharedDocumentParams = {
  libraryReportId: string;
};

