import axiosInstance from 'src/lib/axios';

import type {
  GetLibraryReportsParams,
  GetLibraryReportsResponse,
  GetCategoriesResponse,
  SaveCategoriesParams,
  SaveCategoriesResponse,
  UploadVODParams,
  UploadVODResponse,
  UpdateContentParams,
  UpdateContentResponse,
  DeleteContentParams,
  DeleteContentResponse,
  GetVideoPreviewParams,
  GetVideoPreviewResponse,
  GetModifiedDateParams,
  GetModifiedDateResponse,
} from './library-report.types';

// ----------------------------------------------------------------------

/**
 * 라이브러리 리포트 목록 조회
 * GET /api/library-reports
 */
export async function getLibraryReports(
  params: GetLibraryReportsParams
): Promise<GetLibraryReportsResponse> {
  // TODO: API 엔드포인트 구현
  throw new Error('Not implemented');
}

/**
 * 카테고리 목록 조회
 * GET /api/library-reports/categories
 */
export async function getCategories(): Promise<GetCategoriesResponse> {
  // TODO: API 엔드포인트 구현
  throw new Error('Not implemented');
}

/**
 * 카테고리 설정 저장
 * POST /api/library-reports/categories
 */
export async function saveCategories(
  params: SaveCategoriesParams
): Promise<SaveCategoriesResponse> {
  // TODO: API 엔드포인트 구현
  throw new Error('Not implemented');
}

/**
 * VOD 업로드
 * POST /api/library-reports/vod
 */
export async function uploadVOD(
  params: UploadVODParams
): Promise<UploadVODResponse> {
  // TODO: API 엔드포인트 구현
  throw new Error('Not implemented');
}

/**
 * 컨텐츠 수정
 * PUT /api/library-reports/:id
 */
export async function updateContent(
  params: UpdateContentParams
): Promise<UpdateContentResponse> {
  // TODO: API 엔드포인트 구현
  throw new Error('Not implemented');
}

/**
 * 컨텐츠 삭제
 * DELETE /api/library-reports/:id
 */
export async function deleteContent(
  params: DeleteContentParams
): Promise<DeleteContentResponse> {
  // TODO: API 엔드포인트 구현
  throw new Error('Not implemented');
}

/**
 * 비디오 파일 미리보기 URL 가져오기
 * GET /api/library-reports/:id/video-preview
 */
export async function getVideoPreview(
  params: GetVideoPreviewParams
): Promise<GetVideoPreviewResponse> {
  // TODO: API 엔드포인트 구현
  throw new Error('Not implemented');
}

/**
 * 수정일 가져오기
 * GET /api/library-reports/:id/modified-date
 */
export async function getModifiedDate(
  params: GetModifiedDateParams
): Promise<GetModifiedDateResponse> {
  // TODO: API 엔드포인트 구현
  throw new Error('Not implemented');
}

