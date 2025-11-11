import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import {
  getLibraryReports,
  getCategories,
  saveCategories,
  uploadVOD,
  updateContent,
  deleteContent,
  getVideoPreview,
  getModifiedDate,
} from 'src/services/library-report/library-report.service';
import type {
  GetLibraryReportsParams,
  SaveCategoriesParams,
  UploadVODParams,
  UpdateContentParams,
  DeleteContentParams,
  GetVideoPreviewParams,
  GetModifiedDateParams,
} from 'src/services/library-report/library-report.types';

// ----------------------------------------------------------------------

/**
 * 라이브러리 리포트 목록 조회 Hook
 */
export function useLibraryReports(params: GetLibraryReportsParams) {
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
    queryFn: () => getCategories(),
  });
}

/**
 * 카테고리 설정 저장 Mutation Hook
 */
export function useSaveCategories() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: SaveCategoriesParams) => saveCategories(params),
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
    mutationFn: (params: UploadVODParams) => uploadVOD(params),
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
    mutationFn: (params: UpdateContentParams) => updateContent(params),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['libraryReports'] });
      queryClient.invalidateQueries({ queryKey: ['videoPreview', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['modifiedDate', variables.id] });
    },
  });
}

/**
 * 컨텐츠 삭제 Mutation Hook
 */
export function useDeleteContent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: DeleteContentParams) => deleteContent(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['libraryReports'] });
    },
  });
}

/**
 * 비디오 파일 미리보기 URL 조회 Hook
 */
export function useVideoPreview(params: GetVideoPreviewParams) {
  return useQuery({
    queryKey: ['videoPreview', params.id],
    queryFn: () => getVideoPreview(params),
    enabled: !!params.id,
  });
}

/**
 * 수정일 조회 Hook
 */
export function useModifiedDate(params: GetModifiedDateParams) {
  return useQuery({
    queryKey: ['modifiedDate', params.id],
    queryFn: () => getModifiedDate(params),
    enabled: !!params.id,
  });
}

