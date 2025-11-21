import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import {
  getLibraryReports,
  getLibraryCategoryList,
  saveLibraryCategoryList,
  createLibraryReport,
  updateLibraryReport,
  deleteLibraryReport,
  getLibraryReportPreviewUrl,
  getLibraryReportUpdateDate,
} from 'src/services/library-report/library-report.service';
import type {
  GetLibraryReportsParams,
  SaveLibraryCategoryListParams,
  CreateLibraryReportParams,
  UpdateLibraryReportParams,
  DeleteLibraryReportParams,
  GetLibraryReportPreviewUrlParams,
  GetLibraryReportUpdateDateParams,
} from 'src/services/library-report/library-report.types';

// ----------------------------------------------------------------------

/**
 * 라이브러리 리포트 목록 조회 Hook
 */
export function useLibraryReports(params?: GetLibraryReportsParams) {
  return useQuery({
    queryKey: ['libraryReports', params],
    queryFn: () => getLibraryReports(params),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * 카테고리 목록 조회 Hook
 */
export function useCategories() {
  return useQuery({
    queryKey: ['libraryCategories'],
    queryFn: () => getLibraryCategoryList(),
  });
}

/**
 * 카테고리 설정 저장 Mutation Hook
 */
export function useSaveCategories() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: SaveLibraryCategoryListParams) => saveLibraryCategoryList(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['libraryCategories'] });
      queryClient.invalidateQueries({ queryKey: ['libraryReports'] });
    },
  });
}

/**
 * VOD 업로드 Mutation Hook
 */
export function useUploadVOD() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: CreateLibraryReportParams) => createLibraryReport(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['libraryReports'] });
    },
  });
}

/**
 * 컨텐츠 수정 Mutation Hook
 */
export function useUpdateContent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: UpdateLibraryReportParams) => updateLibraryReport(params),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['libraryReports'] });
      queryClient.invalidateQueries({ queryKey: ['libraryReport', variables.libraryReportId] });
      queryClient.invalidateQueries({
        queryKey: ['videoPreview', variables.libraryReportId],
      });
      queryClient.invalidateQueries({
        queryKey: ['modifiedDate', variables.libraryReportId],
      });
    },
  });
}

/**
 * 컨텐츠 삭제 Mutation Hook
 */
export function useDeleteContent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: DeleteLibraryReportParams) => deleteLibraryReport(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['libraryReports'] });
    },
  });
}

/**
 * 비디오 파일 미리보기 URL 조회 Hook
 */
export function useVideoPreview(params: GetLibraryReportPreviewUrlParams) {
  return useQuery({
    queryKey: ['videoPreview', params.libraryReportId],
    queryFn: () => getLibraryReportPreviewUrl(params),
    enabled: !!params.libraryReportId,
  });
}

/**
 * 수정일 조회 Hook
 */
export function useModifiedDate(params: GetLibraryReportUpdateDateParams) {
  return useQuery({
    queryKey: ['modifiedDate', params.libraryReportId],
    queryFn: () => getLibraryReportUpdateDate(params),
    enabled: !!params.libraryReportId,
  });
}
