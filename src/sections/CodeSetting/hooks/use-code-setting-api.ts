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
  getCodeDates,
  getHazardManagement,
} from 'src/services/code-setting/code-setting.service';
import type {
  GetCodesParams,
  GetCodeDetailParams,
  CreateMachineParams,
  UpdateMachineParams,
  CreateHazardParams,
  UpdateHazardParams,
  SaveHazardCategoriesParams,
  GetCodeDatesParams,
  GetHazardManagementParams,
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
    queryKey: ['codeDetail', params.id],
    queryFn: () => getCodeDetail(params),
    enabled: !!params.id,
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
      queryClient.invalidateQueries({ queryKey: ['codeDetail', variables.id] });
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
      queryClient.invalidateQueries({ queryKey: ['codeDetail', variables.id] });
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
      queryClient.invalidateQueries({ queryKey: ['hazardCategories'] });
    },
  });
}

/**
 * 등록일/수정일 정보 조회 Hook
 */
export function useCodeDates(params: GetCodeDatesParams) {
  return useQuery({
    queryKey: ['codeDates', params.id],
    queryFn: () => getCodeDates(params),
    enabled: !!params.id,
  });
}

/**
 * 관리기준/관리대책 조회 Hook
 */
export function useHazardManagement(params: GetHazardManagementParams) {
  return useQuery({
    queryKey: ['hazardManagement', params.id],
    queryFn: () => getHazardManagement(params),
    enabled: !!params.id,
  });
}

