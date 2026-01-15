import axiosInstance, { endpoints } from 'src/lib/axios';

import type {
  GetLibraryReportsParams,
  GetLibraryReportsResult,
  CreateLibraryReportParams,
  CreateLibraryReportResponse,
  GetLibraryReportParams,
  GetLibraryReportResponse,
  UpdateLibraryReportParams,
  UpdateLibraryReportResponse,
  DeleteLibraryReportParams,
  GetLibraryCategoryListResult,
  SaveLibraryCategoryListParams,
  SaveLibraryCategoryListResponse,
  HideLibraryReportParams,
  UnhideLibraryReportParams,
  RegisterAsSharedDocumentParams,
  LibraryReport,
  LibraryReportSummary,
  LibraryCategory,
} from './library-report.types';
import type { BaseResponseHeader } from '../common';

type LibraryReportListResponseRaw = {
  header?: BaseResponseHeader;
  libraryReportList?: any[];
  totalCount?: number;
  summary?: LibraryReportSummary;
};

type LibraryCategoryListResponseRaw = {
  header?: BaseResponseHeader;
  libraryCategoryList?: any[];
  totalCount?: number;
};

const normalizeLibraryReport = (item: any, index: number): LibraryReport => {
  const libraryReportIdx =
    item?.libraryReportIdx ?? item?.libraryReportId ?? item?.id ?? item?.libraryReportIDX ?? index;
  const registrationDate =
    item?.registrationDate || item?.createAt || item?.createdAt || item?.updatedAt || '';
  const organizationName = item?.organizationName || item?.companyName || '';

  const playbackTime = item?.playbackTime || item?.playTime || '';
  const hasSubtitlesRaw = item?.hasSubtitles ?? item?.subtitleYn ?? item?.hasSubtitle;
  const hasSubtitles =
    typeof hasSubtitlesRaw === 'number'
      ? hasSubtitlesRaw === 1
      : typeof hasSubtitlesRaw === 'string'
        ? hasSubtitlesRaw.toLowerCase() === 'y'
        : Boolean(hasSubtitlesRaw);
  const isActiveRaw = item?.isActive ?? item?.status ?? 'active';
  const numericIsActive =
    typeof isActiveRaw === 'number'
      ? isActiveRaw
      : typeof isActiveRaw === 'string' &&
          isActiveRaw.trim() !== '' &&
          !Number.isNaN(Number(isActiveRaw))
        ? Number(isActiveRaw)
        : null;
  let status: LibraryReport['status'];
  if (numericIsActive !== null) {
    status = numericIsActive === 1 ? 'active' : 'inactive';
  } else {
    const normalized = String(isActiveRaw).trim().toLowerCase();
    const inactiveKeywords = ['inactive', 'disabled', 'deactivated', 'n', 'false', '0'];
    status = inactiveKeywords.includes(normalized) ? 'inactive' : 'active';
  }

  return {
    id: String(libraryReportIdx ?? `library-${index}`),
    libraryReportIdx:
      typeof libraryReportIdx === 'number' ? libraryReportIdx : Number(libraryReportIdx) || index,
    vodIdx: item?.vodIdx ?? undefined,
    libraryCategoryIdx: item?.libraryCategoryIdx ?? item?.categoryIdx ?? null,
    libraryReportCategoryInformation: item?.libraryReportCategoryInformation ?? null,

    registrationDate,
    organizationName,
    title: item?.title || '',
    playbackTime,
    hasSubtitles,
    visibilityType: item?.visibilityType,
    status,
    fileUrl: item?.fileUrl,
    thumbnailUrl: item?.thumbnailUrl,
    thumbnailPath: item?.thumbnailPath,
    description: item?.description,
    memo: item?.memo,
    isActive: typeof item?.isActive === 'number' ? item.isActive : status === 'active' ? 1 : 0,
  };
};

const normalizeCategory = (item: any, index: number): LibraryCategory => ({
  id: String(item?.libraryCategoryIdx ?? item?.id ?? `category-${index}`),
  libraryCategoryIdx:
    typeof item?.libraryCategoryIdx === 'number'
      ? item.libraryCategoryIdx
      : item?.libraryCategoryIdx
        ? Number(item.libraryCategoryIdx)
        : item?.id
          ? Number(item.id)
          : null,
  name: item?.name || item?.categoryName || `카테고리 ${index + 1}`,
  order: item?.order ?? item?.sort ?? index + 1,
  description: item?.description ?? null,
  isActive:
    typeof item?.isActive === 'number'
      ? item.isActive === 1
      : item?.isActive !== undefined
        ? Boolean(item.isActive)
        : true,
});

// ----------------------------------------------------------------------

/**
 * 라이브러리 리포트 목록 조회
 * GET /library/reports
 * 모든 데이터를 가져오기 위해 큰 pageSize 사용
 */
export async function getLibraryReports(
  params?: GetLibraryReportsParams
): Promise<GetLibraryReportsResult> {
  const response = await axiosInstance.get<LibraryReportListResponseRaw>(
    endpoints.library.reports,
    {
      params: {
        page: 1,
        pageSize: 1000, // 모든 데이터를 가져오기 위해 충분히 큰 값 설정
      },
    }
  );

  const data = response.data ?? {};
  const list = Array.isArray(data.libraryReportList) ? data.libraryReportList : [];
  const libraryReports = list.map(normalizeLibraryReport);

  const computedActiveCount = libraryReports.filter((item) => item.status === 'active').length;
  const activeCount = data.summary?.activeCount ?? computedActiveCount;
  const inactiveCount =
    data.summary?.inactiveCount ??
    Math.max((data.totalCount ?? libraryReports.length) - activeCount, 0);

  return {
    header: data.header,
    libraryReports,
    totalCount: data.totalCount ?? libraryReports.length,
    summary: {
      allCount: data.summary?.allCount ?? data.totalCount ?? libraryReports.length,
      activeCount,
      inactiveCount,
    },
  };
}

/**
 * VOD 업로드
 * POST /library/reports
 * 파일은 먼저 /system/upload로 업로드하고 fileUrl을 사용해야 함
 */
export async function createLibraryReport(
  params: CreateLibraryReportParams
): Promise<CreateLibraryReportResponse> {
  const { hasSubtitles, visibilityType, ...body } = params;
  const response = await axiosInstance.post<CreateLibraryReportResponse>(
    endpoints.library.reports,
    {
      ...body,
      hasSubtitles: hasSubtitles ? 1 : 0,
      visibilityType: visibilityType ? visibilityType.toUpperCase() : undefined,
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
    `${endpoints.library.reports}/${params.libraryReportIdx}`
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
  const { libraryReportIdx, visibilityType, ...body } = params;
  const response = await axiosInstance.put<UpdateLibraryReportResponse>(
    `${endpoints.library.reports}/${libraryReportIdx}`,
    {
      ...body,
      visibilityType: visibilityType ? visibilityType.toUpperCase() : undefined,
    }
  );
  return response.data;
}

/**
 * 컨텐츠 삭제
 * DELETE /library/reports/{libraryReportId}
 */
export async function deleteLibraryReport(params: DeleteLibraryReportParams): Promise<void> {
  await axiosInstance.delete(`${endpoints.library.reports}/${params.libraryReportIdx}`);
}

/**
 * 카테고리 목록 조회
 * GET /library/categories
 */
export async function getLibraryCategoryList(): Promise<GetLibraryCategoryListResult> {
  const response = await axiosInstance.get<LibraryCategoryListResponseRaw>(
    endpoints.library.categories
  );
  const data = response.data ?? {};
  const list = Array.isArray(data.libraryCategoryList) ? data.libraryCategoryList : [];
  return {
    header: data.header,
    categories: list.map(normalizeCategory),
  };
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
  await axiosInstance.patch(`${endpoints.library.reports}/${params.libraryReportIdx}/hide`, {
    companyIdx: params.companyIdx,
  });
}

/**
 * VOD 숨김 해제
 * PATCH /library/reports/{libraryReportId}/unhide
 */
export async function unhideLibraryReport(params: UnhideLibraryReportParams): Promise<void> {
  await axiosInstance.patch(`${endpoints.library.reports}/${params.libraryReportIdx}/unhide`);
}

/**
 * VOD를 공유 문서로 등록
 * POST /library/reports/{libraryReportId}/shared-document
 */
export async function registerAsSharedDocument(
  params: RegisterAsSharedDocumentParams
): Promise<void> {
  await axiosInstance.post(
    `${endpoints.library.reports}/${params.libraryReportIdx}/shared-document`
  );
}
