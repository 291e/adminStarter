import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import {
  getChecklists,
  updateHighRiskWork,
  getDisasterFactors,
  saveDisasterFactors,
  createDisasterFactor,
  updateDisasterFactor,
  deleteDisasterFactor,
  getIndustries,
  createIndustry,
  updateIndustry,
  deleteIndustry,
  createChecklist,
} from 'src/services/checklist/checklist.service';
import type {
  GetChecklistsParams,
  UpdateHighRiskWorkParams,
  GetDisasterFactorsParams,
  SaveDisasterFactorsParams,
  CreateDisasterFactorParams,
  UpdateDisasterFactorParams,
  DeleteDisasterFactorParams,
  CreateIndustryParams,
  UpdateIndustryParams,
  DeleteIndustryParams,
  CreateChecklistParams,
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
    onSuccess: (response) => {
      const resultMessage =
        response?.header?.resultMessage || '고위험작업/상황이 업데이트되었습니다.';
      if (resultMessage && resultMessage !== 'SUCCESS') {
        toast.success(resultMessage);
      } else {
        toast.success('고위험작업/상황이 업데이트되었습니다.');
      }
      queryClient.invalidateQueries({ queryKey: ['checklists'] });
    },
    onError: (error: any) => {
      const resultMessage =
        error?.response?.data?.header?.resultMessage ||
        error?.message ||
        '고위험작업/상황 업데이트에 실패했습니다.';
      toast.error(resultMessage);
    },
  });
}

/**
 * 재해유발요인 목록 조회 Hook
 */
export function useDisasterFactors(params: GetDisasterFactorsParams) {
  return useQuery({
    queryKey: ['disasterFactors', params.checklistIdx],
    queryFn: () => getDisasterFactors(params),
    enabled: !!params.checklistIdx,
  });
}

/**
 * 재해유발요인 목록 전체 저장 Mutation Hook (PUT)
 */
export function useSaveDisasterFactors() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: SaveDisasterFactorsParams) => saveDisasterFactors(params),
    onSuccess: (response, variables) => {
      const resultMessage = response?.header?.resultMessage || '재해유발요인이 저장되었습니다.';
      if (resultMessage && resultMessage !== 'SUCCESS') {
        toast.success(resultMessage);
      } else {
        toast.success('재해유발요인이 저장되었습니다.');
      }
      queryClient.invalidateQueries({ queryKey: ['checklists'] });
      queryClient.invalidateQueries({ queryKey: ['disasterFactors', variables.checklistIdx] });
    },
    onError: (error: any) => {
      const resultMessage =
        error?.response?.data?.header?.resultMessage ||
        error?.message ||
        '재해유발요인 저장에 실패했습니다.';
      toast.error(resultMessage);
    },
  });
}

/**
 * 재해유발요인 개별 생성 Mutation Hook (POST)
 */
export function useCreateDisasterFactor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: CreateDisasterFactorParams) => createDisasterFactor(params),
    onSuccess: (response, variables) => {
      toast.success('재해유발요인이 추가되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['checklists'] });
      queryClient.invalidateQueries({ queryKey: ['disasterFactors', variables.checklistIdx] });
    },
    onError: (error: any) => {
      const resultMessage =
        error?.response?.data?.header?.resultMessage ||
        error?.message ||
        '재해유발요인 추가에 실패했습니다.';
      toast.error(resultMessage);
    },
  });
}

/**
 * 재해유발요인 개별 수정 Mutation Hook (PATCH)
 */
export function useUpdateDisasterFactor(checklistIdx?: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: UpdateDisasterFactorParams) => updateDisasterFactor(params),
    onSuccess: () => {
      toast.success('재해유발요인이 수정되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['checklists'] });
      if (checklistIdx) {
        queryClient.invalidateQueries({ queryKey: ['disasterFactors', checklistIdx] });
      }
    },
    onError: (error: any) => {
      const resultMessage =
        error?.response?.data?.header?.resultMessage ||
        error?.message ||
        '재해유발요인 수정에 실패했습니다.';
      toast.error(resultMessage);
    },
  });
}

/**
 * 재해유발요인 개별 삭제 Mutation Hook (DELETE)
 */
export function useDeleteDisasterFactor(checklistIdx?: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: DeleteDisasterFactorParams) => deleteDisasterFactor(params),
    onSuccess: () => {
      toast.success('재해유발요인이 삭제되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['checklists'] });
      if (checklistIdx) {
        queryClient.invalidateQueries({ queryKey: ['disasterFactors', checklistIdx] });
      }
    },
    onError: (error: any) => {
      const resultMessage =
        error?.response?.data?.header?.resultMessage ||
        error?.message ||
        '재해유발요인 삭제에 실패했습니다.';
      toast.error(resultMessage);
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
 * 업종 등록 Mutation Hook
 */
export function useCreateIndustry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: CreateIndustryParams) => createIndustry(params),
    onSuccess: (response) => {
      const resultMessage = response?.header?.resultMessage || '업종이 등록되었습니다.';
      if (resultMessage && resultMessage !== 'SUCCESS') {
        toast.success(resultMessage);
      } else {
        toast.success('업종이 등록되었습니다.');
      }
      queryClient.invalidateQueries({ queryKey: ['industries'] });
      queryClient.invalidateQueries({ queryKey: ['checklists'] });
    },
    onError: (error: any) => {
      const resultMessage =
        error?.response?.data?.header?.resultMessage ||
        error?.message ||
        '업종 등록에 실패했습니다.';
      toast.error(resultMessage);
    },
  });
}

/**
 * 업종 수정 Mutation Hook
 */
export function useUpdateIndustry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: UpdateIndustryParams) => updateIndustry(params),
    onSuccess: (response) => {
      const resultMessage = response?.header?.resultMessage || '업종 정보가 수정되었습니다.';
      if (resultMessage && resultMessage !== 'SUCCESS') {
        toast.success(resultMessage);
      } else {
        toast.success('업종 정보가 수정되었습니다.');
      }
      queryClient.invalidateQueries({ queryKey: ['industries'] });
      queryClient.invalidateQueries({ queryKey: ['checklists'] });
    },
    onError: (error: any) => {
      const resultMessage =
        error?.response?.data?.header?.resultMessage ||
        error?.message ||
        '업종 수정에 실패했습니다.';
      toast.error(resultMessage);
    },
  });
}

/**
 * 업종 삭제 Mutation Hook
 */
export function useDeleteIndustry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: DeleteIndustryParams) => deleteIndustry(params),
    onSuccess: (_, variables) => {
      toast.success('업종이 삭제되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['industries'] });
      queryClient.invalidateQueries({ queryKey: ['checklists'] });
    },
    onError: (error: any) => {
      const resultMessage =
        error?.response?.data?.header?.resultMessage ||
        error?.message ||
        '업종 삭제에 실패했습니다.';
      toast.error(resultMessage);
    },
  });
}

/**
 * 위험작업/상황 등록 Mutation Hook
 */
export function useCreateChecklist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: CreateChecklistParams) => createChecklist(params),
    onSuccess: (response) => {
      const resultMessage = response?.header?.resultMessage || '체크리스트가 등록되었습니다.';
      if (resultMessage && resultMessage !== 'SUCCESS') {
        toast.success(resultMessage);
      } else {
        toast.success('체크리스트가 등록되었습니다.');
      }
      queryClient.invalidateQueries({ queryKey: ['checklists'] });
    },
    onError: (error: any) => {
      const resultMessage =
        error?.response?.data?.header?.resultMessage ||
        error?.message ||
        '체크리스트 등록에 실패했습니다.';
      toast.error(resultMessage);
    },
  });
}
