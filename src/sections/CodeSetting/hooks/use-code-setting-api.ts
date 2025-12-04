import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

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
    onSuccess: (response) => {
      const resultMessage = response?.header?.resultMessage || '기계·설비가 등록되었습니다.';
      if (resultMessage && resultMessage !== 'SUCCESS') {
        toast.success(resultMessage);
      } else {
        toast.success('기계·설비가 등록되었습니다.');
      }
      queryClient.invalidateQueries({ queryKey: ['codes'] });
    },
    onError: (error: any) => {
      const resultMessage =
        error?.response?.data?.header?.resultMessage || error?.message || '기계·설비 등록에 실패했습니다.';
      toast.error(resultMessage);
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
    onSuccess: (response, variables) => {
      const resultMessage = response?.header?.resultMessage || '기계·설비 정보가 수정되었습니다.';
      if (resultMessage && resultMessage !== 'SUCCESS') {
        toast.success(resultMessage);
      } else {
        toast.success('기계·설비 정보가 수정되었습니다.');
      }
      queryClient.invalidateQueries({ queryKey: ['codes'] });
      queryClient.invalidateQueries({
        queryKey: ['codeDetail', variables.codeSettingIdx],
      });
    },
    onError: (error: any) => {
      const resultMessage =
        error?.response?.data?.header?.resultMessage || error?.message || '기계·설비 수정에 실패했습니다.';
      toast.error(resultMessage);
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
    onSuccess: (response) => {
      const resultMessage = response?.header?.resultMessage || '유해인자가 등록되었습니다.';
      if (resultMessage && resultMessage !== 'SUCCESS') {
        toast.success(resultMessage);
      } else {
        toast.success('유해인자가 등록되었습니다.');
      }
      queryClient.invalidateQueries({ queryKey: ['codes'] });
    },
    onError: (error: any) => {
      const resultMessage =
        error?.response?.data?.header?.resultMessage || error?.message || '유해인자 등록에 실패했습니다.';
      toast.error(resultMessage);
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
    onSuccess: (response, variables) => {
      const resultMessage = response?.header?.resultMessage || '유해인자 정보가 수정되었습니다.';
      if (resultMessage && resultMessage !== 'SUCCESS') {
        toast.success(resultMessage);
      } else {
        toast.success('유해인자 정보가 수정되었습니다.');
      }
      queryClient.invalidateQueries({ queryKey: ['codes'] });
      queryClient.invalidateQueries({
        queryKey: ['codeDetail', variables.codeSettingIdx],
      });
    },
    onError: (error: any) => {
      const resultMessage =
        error?.response?.data?.header?.resultMessage || error?.message || '유해인자 수정에 실패했습니다.';
      toast.error(resultMessage);
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
    onSuccess: (response) => {
      const resultMessage = response?.header?.resultMessage || '카테고리가 저장되었습니다.';
      if (resultMessage && resultMessage !== 'SUCCESS') {
        toast.success(resultMessage);
      } else {
        toast.success('카테고리가 저장되었습니다.');
      }
      // 카테고리 목록과 코드 목록 모두 무효화하여 최신 데이터 반영
      queryClient.invalidateQueries({ queryKey: ['hazardCategories'] });
      queryClient.invalidateQueries({ queryKey: ['codes'] });
    },
    onError: (error: any) => {
      const resultMessage =
        error?.response?.data?.header?.resultMessage || error?.message || '카테고리 저장에 실패했습니다.';
      toast.error(resultMessage);
    },
  });
}


