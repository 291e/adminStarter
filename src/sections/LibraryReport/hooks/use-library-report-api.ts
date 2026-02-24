import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import {
  getLibraryReports,
  getLibraryCategoryList,
  saveLibraryCategoryList,
  createLibraryReport,
  updateLibraryReport,
  deleteLibraryReport,
  updateLibraryReportOrder,
} from 'src/services/library-report/library-report.service';
import type {
  GetLibraryReportsParams,
  SaveLibraryCategoryListParams,
  CreateLibraryReportParams,
  UpdateLibraryReportParams,
  DeleteLibraryReportParams,
  GetLibraryReportsResult,
  GetLibraryCategoryListResult,
  UpdateLibraryReportOrderParams,
} from 'src/services/library-report/library-report.types';

// ----------------------------------------------------------------------

/**
 * 라이브러리 리포트 목록 조회 Hook
 */
export function useLibraryReports(params?: GetLibraryReportsParams) {
  return useQuery<GetLibraryReportsResult>({
    queryKey: ['libraryReports'],
    queryFn: () => getLibraryReports(params),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * 카테고리 목록 조회 Hook
 */
export function useCategories() {
  return useQuery<GetLibraryCategoryListResult>({
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
    onSuccess: (response) => {
      const resultMessage = response?.header?.resultMessage || '카테고리가 저장되었습니다.';
      if (resultMessage && resultMessage !== 'SUCCESS') {
        toast.success(resultMessage);
      } else {
        toast.success('카테고리가 저장되었습니다.');
      }
      queryClient.invalidateQueries({ queryKey: ['libraryCategories'] });
      queryClient.invalidateQueries({ queryKey: ['libraryReports'] });
    },
    onError: (error: any) => {
      const resultMessage =
        error?.response?.data?.header?.resultMessage || error?.message || '카테고리 저장에 실패했습니다.';
      toast.error(resultMessage);
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
    onSuccess: (response) => {
      const resultMessage = response?.header?.resultMessage || 'VOD가 업로드되었습니다.';
      if (resultMessage && resultMessage !== 'SUCCESS') {
        toast.success(resultMessage);
      } else {
        toast.success('VOD가 업로드되었습니다.');
      }
      queryClient.invalidateQueries({ queryKey: ['libraryReports'] });
    },
    onError: (error: any) => {
      const resultMessage =
        error?.response?.data?.header?.resultMessage || error?.message || 'VOD 업로드에 실패했습니다.';
      toast.error(resultMessage);
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
    onSuccess: (response, variables) => {
      const resultMessage = response?.header?.resultMessage || '컨텐츠가 수정되었습니다.';
      if (resultMessage && resultMessage !== 'SUCCESS') {
        toast.success(resultMessage);
      } else {
        toast.success('컨텐츠가 수정되었습니다.');
      }
      queryClient.invalidateQueries({ queryKey: ['libraryReports'] });
      queryClient.invalidateQueries({ queryKey: ['libraryReport', variables.libraryReportIdx] });
    },
    onError: (error: any) => {
      const resultMessage =
        error?.response?.data?.header?.resultMessage || error?.message || '컨텐츠 수정에 실패했습니다.';
      toast.error(resultMessage);
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
    onSuccess: (_, variables) => {
      toast.success('컨텐츠가 삭제되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['libraryReports'] });
    },
    onError: (error: any) => {
      const resultMessage =
        error?.response?.data?.header?.resultMessage || error?.message || '컨텐츠 삭제에 실패했습니다.';
      toast.error(resultMessage);
    },
  });
}

/**
 * 라이브러리 리포트 순서 변경 Mutation Hook
 */
export function useUpdateLibraryReportOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: UpdateLibraryReportOrderParams) => updateLibraryReportOrder(params),
    onSuccess: (response) => {
      const resultMessage = response?.header?.resultMessage || '순서가 변경되었습니다.';
      if (resultMessage && resultMessage !== 'SUCCESS') {
        toast.success(resultMessage);
      } else {
        toast.success('순서가 변경되었습니다.');
      }
      queryClient.invalidateQueries({ queryKey: ['libraryReports'] });
    },
    onError: (error: any) => {
      const resultMessage =
        error?.response?.data?.header?.resultMessage || error?.message || '순서 변경에 실패했습니다.';
      toast.error(resultMessage);
    },
  });
}
