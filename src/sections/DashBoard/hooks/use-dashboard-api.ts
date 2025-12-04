import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import {
  getDocumentSignatureList,
  getSharedDocumentList,
  createSharedDocument,
  updateSharedDocument,
  deleteSharedDocument,
  shareDocumentToChatRoom,
  getRiskReportStatistics,
  getMemberProfile,
  getEducationCompletionRate,
  getPrioritySettingList,
  createPrioritySetting,
  updatePrioritySetting,
  deletePrioritySetting,
} from 'src/services/dashboard/dashboard.service';
import type {
  GetSharedDocumentListParams,
  CreateSharedDocumentParams,
  UpdateSharedDocumentParams,
  DeleteSharedDocumentParams,
  ShareDocumentToChatRoomParams,
  GetRiskReportStatisticsParams,
  GetEducationCompletionRateParams,
  CreatePrioritySettingParams,
  UpdatePrioritySettingParams,
  DeletePrioritySettingParams,
} from 'src/services/dashboard/dashboard.types';

// ----------------------------------------------------------------------

/**
 * 서명 대기 문서 목록 조회 Hook
 */
export function usePendingSignatures() {
  return useQuery({
    queryKey: ['pendingSignatures'],
    queryFn: () => getDocumentSignatureList(),
  });
}

/**
 * 공유된 문서 목록 조회 Hook
 */
export function useSharedDocuments(params?: GetSharedDocumentListParams) {
  return useQuery({
    queryKey: ['sharedDocuments', params],
    queryFn: () => getSharedDocumentList(params),
  });
}

/**
 * 사고·위험 보고 현황 통계 조회 Hook
 */
export function useAccidentRiskStats(params?: GetRiskReportStatisticsParams) {
  return useQuery({
    queryKey: ['riskReportStatistics', params],
    queryFn: () => getRiskReportStatistics(params),
  });
}

/**
 * 사용자 프로필 정보 조회 Hook
 */
export function useUserProfile() {
  return useQuery({
    queryKey: ['memberProfile'],
    queryFn: () => getMemberProfile(),
  });
}

/**
 * 교육 이수율 조회 Hook
 */
export function useEducationCompletionRate(params?: GetEducationCompletionRateParams) {
  return useQuery({
    queryKey: ['educationCompletionRate', params],
    queryFn: () => getEducationCompletionRate(params),
  });
}

/**
 * 공유 문서 생성 Mutation Hook
 */
export function useCreateSharedDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: CreateSharedDocumentParams) => createSharedDocument(params),
    onSuccess: (response) => {
      const resultMessage = response?.header?.resultMessage || '공유 문서가 생성되었습니다.';
      if (resultMessage && resultMessage !== 'SUCCESS') {
        toast.success(resultMessage);
      } else {
        toast.success('공유 문서가 생성되었습니다.');
      }
      queryClient.invalidateQueries({ queryKey: ['sharedDocuments'] });
    },
    onError: (error: any) => {
      const resultMessage =
        error?.response?.data?.header?.resultMessage ||
        error?.message ||
        '공유 문서 생성에 실패했습니다.';
      toast.error(resultMessage);
    },
  });
}

/**
 * 공유 문서 수정 Mutation Hook
 */
export function useUpdateSharedDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: UpdateSharedDocumentParams) => updateSharedDocument(params),
    onSuccess: (response) => {
      const resultMessage = response?.header?.resultMessage || '공유 문서가 수정되었습니다.';
      if (resultMessage && resultMessage !== 'SUCCESS') {
        toast.success(resultMessage);
      } else {
        toast.success('공유 문서가 수정되었습니다.');
      }
      queryClient.invalidateQueries({ queryKey: ['sharedDocuments'] });
    },
    onError: (error: any) => {
      const resultMessage =
        error?.response?.data?.header?.resultMessage ||
        error?.message ||
        '공유 문서 수정에 실패했습니다.';
      toast.error(resultMessage);
    },
  });
}

/**
 * 공유 문서 삭제 Mutation Hook
 */
export function useDeleteSharedDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: DeleteSharedDocumentParams) => deleteSharedDocument(params),
    onSuccess: (_, variables) => {
      toast.success('공유 문서가 삭제되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['sharedDocuments'] });
    },
    onError: (error: any) => {
      const resultMessage =
        error?.response?.data?.header?.resultMessage ||
        error?.message ||
        '공유 문서 삭제에 실패했습니다.';
      toast.error(resultMessage);
    },
  });
}

/**
 * 공유 문서 채팅방 공유 Mutation Hook
 */
export function useShareDocumentToChatRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: ShareDocumentToChatRoomParams) => shareDocumentToChatRoom(params),
    onSuccess: () => {
      toast.success('문서가 채팅방에 공유되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['sharedDocuments'] });
    },
    onError: (error: any) => {
      const resultMessage =
        error?.response?.data?.header?.resultMessage ||
        error?.message ||
        '문서 공유에 실패했습니다.';
      toast.error(resultMessage);
    },
  });
}

/**
 * 중요도 설정 목록 조회 Hook
 */
export function usePrioritySettings() {
  return useQuery({
    queryKey: ['prioritySettings'],
    queryFn: () => getPrioritySettingList(),
  });
}

/**
 * 중요도 설정 생성 Mutation Hook
 */
export function useCreatePrioritySetting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: CreatePrioritySettingParams) => createPrioritySetting(params),
    onSuccess: (response) => {
      const resultMessage = response?.header?.resultMessage || '중요도 설정이 생성되었습니다.';
      if (resultMessage && resultMessage !== 'SUCCESS') {
        toast.success(resultMessage);
      } else {
        toast.success('중요도 설정이 생성되었습니다.');
      }
      queryClient.invalidateQueries({ queryKey: ['prioritySettings'] });
    },
    onError: (error: any) => {
      const resultMessage =
        error?.response?.data?.header?.resultMessage ||
        error?.message ||
        '중요도 설정 생성에 실패했습니다.';
      toast.error(resultMessage);
    },
  });
}

/**
 * 중요도 설정 수정 Mutation Hook
 */
export function useUpdatePrioritySetting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: UpdatePrioritySettingParams) => updatePrioritySetting(params),
    onSuccess: (response) => {
      const resultMessage = response?.header?.resultMessage || '중요도 설정이 수정되었습니다.';
      if (resultMessage && resultMessage !== 'SUCCESS') {
        toast.success(resultMessage);
      } else {
        toast.success('중요도 설정이 수정되었습니다.');
      }
      queryClient.invalidateQueries({ queryKey: ['prioritySettings'] });
    },
    onError: (error: any) => {
      const resultMessage =
        error?.response?.data?.header?.resultMessage ||
        error?.message ||
        '중요도 설정 수정에 실패했습니다.';
      toast.error(resultMessage);
    },
  });
}

/**
 * 중요도 설정 삭제 Mutation Hook
 */
export function useDeletePrioritySetting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: DeletePrioritySettingParams) => deletePrioritySetting(params),
    onSuccess: () => {
      toast.success('중요도 설정이 삭제되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['prioritySettings'] });
    },
    onError: (error: any) => {
      const resultMessage =
        error?.response?.data?.header?.resultMessage ||
        error?.message ||
        '중요도 설정 삭제에 실패했습니다.';
      toast.error(resultMessage);
    },
  });
}
