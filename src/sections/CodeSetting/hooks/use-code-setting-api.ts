import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import {
  getCodes,
  getCodeDetail,
  createMachine,
  updateMachine,
  createHazard,
  updateHazard,
  getHazardCategories,
  saveHazardCategories,
} from 'src/services/code-setting/code-setting.service';
import type {
  GetCodesParams,
  GetCodeDetailParams,
  CreateMachineParams,
  UpdateMachineParams,
  CreateHazardParams,
  UpdateHazardParams,
  SaveHazardCategoriesParams,
} from 'src/services/code-setting/code-setting.types';

// ----------------------------------------------------------------------

/**
 * 코드 목록 조회 Hook
 */
export function useCodes(params: GetCodesParams) {
  return useQuery({
    queryKey: ['codes', params],
    queryFn: () => getCodes(params),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * 코드 상세 정보 조회 Hook
 */
export function useCodeDetail(params: GetCodeDetailParams) {
  return useQuery({
    queryKey: ['codeDetail', params.codeSettingIdx],
    queryFn: () => getCodeDetail(params),
    enabled: !!params.codeSettingIdx,
  });
}

/**
 * 기계·설비 등록 Mutation Hook
 */
export function useCreateMachine() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: CreateMachineParams) => createMachine(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['codes'] });
    },
  });
}

/**
 * 기계·설비 수정 Mutation Hook
 */
export function useUpdateMachine() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: UpdateMachineParams) => updateMachine(params),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['codes'] });
      queryClient.invalidateQueries({
        queryKey: ['codeDetail', variables.codeSettingIdx],
      });
    },
  });
}

/**
 * 유해인자 등록 Mutation Hook
 */
export function useCreateHazard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: CreateHazardParams) => createHazard(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['codes'] });
    },
  });
}

/**
 * 유해인자 수정 Mutation Hook
 */
export function useUpdateHazard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: UpdateHazardParams) => updateHazard(params),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['codes'] });
      queryClient.invalidateQueries({
        queryKey: ['codeDetail', variables.codeSettingIdx],
      });
    },
  });
}

/**
 * 카테고리 목록 조회 Hook
 */
export function useHazardCategories() {
  return useQuery({
    queryKey: ['hazardCategories'],
    queryFn: () => getHazardCategories(),
  });
}

/**
 * 카테고리 목록 저장 Mutation Hook
 */
export function useSaveHazardCategories() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: SaveHazardCategoriesParams) => saveHazardCategories(params),
    onSuccess: () => {
      // 카테고리 목록과 코드 목록 모두 무효화하여 최신 데이터 반영
      queryClient.invalidateQueries({ queryKey: ['hazardCategories'] });
      queryClient.invalidateQueries({ queryKey: ['codes'] });
    },
  });
}


