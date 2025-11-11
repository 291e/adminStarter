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
export type UploadVODParams = {
  title: string;
  description?: string;
  category: string;
  videoFile: File;
  subtitleFile?: File;
  thumbnailFile?: File;
};

// VOD 업로드 응답
export type UploadVODResponse = BaseResponseDto<{
  content: LibraryReport;
}>;

// 컨텐츠 수정 요청 파라미터
export type UpdateContentParams = {
  id: string;
  title?: string;
  description?: string;
  category?: string;
  status?: 'active' | 'inactive';
};

// 컨텐츠 수정 응답
export type UpdateContentResponse = BaseResponseDto;

// 컨텐츠 삭제 요청 파라미터
export type DeleteContentParams = {
  id: string;
};

// 컨텐츠 삭제 응답
export type DeleteContentResponse = BaseResponseDto;

// 비디오 미리보기 URL 조회 요청 파라미터
export type GetVideoPreviewParams = {
  id: string;
};

// 비디오 미리보기 URL 조회 응답
export type GetVideoPreviewResponse = BaseResponseDto<{
  previewUrl: string;
}>;

// 수정일 조회 요청 파라미터
export type GetModifiedDateParams = {
  id: string;
};

// 수정일 조회 응답
export type GetModifiedDateResponse = BaseResponseDto<{
  modifiedDate: string;
}>;

