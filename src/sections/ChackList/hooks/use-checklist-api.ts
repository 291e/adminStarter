import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import {
  getChecklists,
  updateHighRiskWork,
  getDisasterFactors,
  saveDisasterFactors,
  getIndustries,
  saveIndustries,
  createRiskWork,
} from 'src/services/checklist/checklist.service';
import type {
  GetChecklistsParams,
  UpdateHighRiskWorkParams,
  GetDisasterFactorsParams,
  SaveDisasterFactorsParams,
  SaveIndustriesParams,
  CreateRiskWorkParams,
} from 'src/services/checklist/checklist.types';

// ----------------------------------------------------------------------

/**
 * 체크리스트 목록 조회 Hook
 */
export function useChecklists(params: GetChecklistsParams) {
  return useQuery({
    queryKey: ['checklists', params],
    queryFn: () => getChecklists(params),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * 고위험작업/상황 업데이트 Mutation Hook
 */
export function useUpdateHighRiskWork() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: UpdateHighRiskWorkParams) => updateHighRiskWork(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checklists'] });
    },
  });
}

/**
 * 재해유발요인 목록 조회 Hook
 */
export function useDisasterFactors(params: GetDisasterFactorsParams) {
  return useQuery({
    queryKey: ['disasterFactors', params.checklistId],
    queryFn: () => getDisasterFactors(params),
    enabled: !!params.checklistId,
  });
}

/**
 * 재해유발요인 목록 저장 Mutation Hook
 */
export function useSaveDisasterFactors() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: SaveDisasterFactorsParams) => saveDisasterFactors(params),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['checklists'] });
      queryClient.invalidateQueries({ queryKey: ['disasterFactors', variables.checklistId] });
    },
  });
}

/**
 * 업종 목록 조회 Hook
 */
export function useIndustries() {
  return useQuery({
    queryKey: ['industries'],
    queryFn: () => getIndustries(),
  });
}

/**
 * 업종 목록 저장 Mutation Hook
 */
export function useSaveIndustries() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: SaveIndustriesParams) => saveIndustries(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['industries'] });
    },
  });
}

/**
 * 위험작업/상황 등록 Mutation Hook
 */
export function useCreateRiskWork() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: CreateRiskWorkParams) => createRiskWork(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checklists'] });
    },
  });
}

