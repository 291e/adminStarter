import axiosInstance from 'src/lib/axios';

import { endpoints } from 'src/lib/axios';

import type {
  GetLibraryReportsParams,
  GetLibraryReportsResponse,
  CreateLibraryReportParams,
  CreateLibraryReportResponse,
  GetLibraryReportParams,
  GetLibraryReportResponse,
  UpdateLibraryReportParams,
  UpdateLibraryReportResponse,
  DeleteLibraryReportParams,
  GetLibraryReportPreviewUrlParams,
  GetLibraryReportPreviewUrlResponse,
  GetLibraryReportUpdateDateParams,
  GetLibraryReportUpdateDateResponse,
  GetLibraryCategoryListResponse,
  SaveLibraryCategoryListParams,
  SaveLibraryCategoryListResponse,
  HideLibraryReportParams,
  UnhideLibraryReportParams,
  RegisterAsSharedDocumentParams,
} from './library-report.types';

// ----------------------------------------------------------------------

/**
 * 라이브러리 리포트 목록 조회 (권한별 필터링)
 * GET /library/reports
 */
export async function getLibraryReports(
  params?: GetLibraryReportsParams
): Promise<GetLibraryReportsResponse> {
  const response = await axiosInstance.get<GetLibraryReportsResponse>(
    endpoints.library.reports,
    { params }
  );
  return response.data;
}

/**
 * VOD 업로드
 * POST /library/reports
 */
export async function createLibraryReport(
  params: CreateLibraryReportParams
): Promise<CreateLibraryReportResponse> {
  const formData = new FormData();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      if (key === 'videoFile' && value instanceof File) {
        formData.append('videoFile', value);
      } else if (key === 'subtitleFile' && value instanceof File) {
        formData.append('subtitleFile', value);
      } else if (key === 'thumbnailFile' && value instanceof File) {
        formData.append('thumbnailFile', value);
      } else {
        formData.append(key, String(value));
      }
    }
  });

  const response = await axiosInstance.post<CreateLibraryReportResponse>(
    endpoints.library.reports,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data;
}

/**
 * 라이브러리 리포트 상세 정보 조회
 * GET /library/reports/{libraryReportId}
 */
export async function getLibraryReport(
  params: GetLibraryReportParams
): Promise<GetLibraryReportResponse> {
  const response = await axiosInstance.get<GetLibraryReportResponse>(
    `${endpoints.library.reports}/${params.libraryReportId}`
  );
  return response.data;
}

/**
 * 컨텐츠 수정
 * PUT /library/reports/{libraryReportId}
 */
export async function updateLibraryReport(
  params: UpdateLibraryReportParams
): Promise<UpdateLibraryReportResponse> {
  const response = await axiosInstance.put<UpdateLibraryReportResponse>(
    `${endpoints.library.reports}/${params.libraryReportId}`,
    params
  );
  return response.data;
}

/**
 * 컨텐츠 삭제
 * DELETE /library/reports/{libraryReportId}
 */
export async function deleteLibraryReport(
  params: DeleteLibraryReportParams
): Promise<void> {
  await axiosInstance.delete(`${endpoints.library.reports}/${params.libraryReportId}`);
}

/**
 * 비디오 파일 미리보기 URL 가져오기
 * GET /library/reports/{libraryReportId}/preview
 */
export async function getLibraryReportPreviewUrl(
  params: GetLibraryReportPreviewUrlParams
): Promise<GetLibraryReportPreviewUrlResponse> {
  const response = await axiosInstance.get<GetLibraryReportPreviewUrlResponse>(
    `${endpoints.library.reports}/${params.libraryReportId}/preview`
  );
  return response.data;
}

/**
 * 수정일 가져오기
 * GET /library/reports/{libraryReportId}/update-date
 */
export async function getLibraryReportUpdateDate(
  params: GetLibraryReportUpdateDateParams
): Promise<GetLibraryReportUpdateDateResponse> {
  const response = await axiosInstance.get<GetLibraryReportUpdateDateResponse>(
    `${endpoints.library.reports}/${params.libraryReportId}/update-date`
  );
  return response.data;
}

/**
 * 카테고리 목록 조회
 * GET /library/categories
 */
export async function getLibraryCategoryList(): Promise<GetLibraryCategoryListResponse> {
  const response = await axiosInstance.get<GetLibraryCategoryListResponse>(
    endpoints.library.categories
  );
  return response.data;
}

/**
 * 카테고리 설정 저장
 * POST /library/categories
 */
export async function saveLibraryCategoryList(
  params: SaveLibraryCategoryListParams
): Promise<SaveLibraryCategoryListResponse> {
  const response = await axiosInstance.post<SaveLibraryCategoryListResponse>(
    endpoints.library.categories,
    params
  );
  return response.data;
}

/**
 * VOD 숨김 처리 (조직별)
 * PATCH /library/reports/{libraryReportId}/hide
 */
export async function hideLibraryReport(params: HideLibraryReportParams): Promise<void> {
  await axiosInstance.patch(
    `${endpoints.library.reports}/${params.libraryReportId}/hide`,
    { companyIdx: params.companyIdx }
  );
}

/**
 * VOD 숨김 해제
 * PATCH /library/reports/{libraryReportId}/unhide
 */
export async function unhideLibraryReport(params: UnhideLibraryReportParams): Promise<void> {
  await axiosInstance.patch(`${endpoints.library.reports}/${params.libraryReportId}/unhide`);
}

/**
 * VOD를 공유 문서로 등록
 * POST /library/reports/{libraryReportId}/shared-document
 */
export async function registerAsSharedDocument(
  params: RegisterAsSharedDocumentParams
): Promise<void> {
  await axiosInstance.post(
    `${endpoints.library.reports}/${params.libraryReportId}/shared-document`
  );
}

