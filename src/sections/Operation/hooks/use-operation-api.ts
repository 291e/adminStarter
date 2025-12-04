import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import {
  getRiskReports,
  createRiskReport,
  deleteRiskReport,
  getRiskReport,
  updateRiskReport,
  createRiskReportFromChat,
} from 'src/services/operation/operation.service';
import type {
  GetRiskReportsParams,
  CreateRiskReportParams,
  DeleteRiskReportParams,
  GetRiskReportParams,
  UpdateRiskReportParams,
  CreateRiskReportFromChatParams,
} from 'src/services/operation/operation.types';

// ----------------------------------------------------------------------

/**
 * 위험 보고 목록 조회 Hook
 */
export function useRiskReports(params: GetRiskReportsParams) {
  return useQuery({
    queryKey: ['riskReports', params],
    queryFn: () => getRiskReports(params),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * 위험 보고 상세 조회 Hook
 */
export function useRiskReportDetail(params: GetRiskReportParams, enabled = true) {
  return useQuery({
    queryKey: ['riskReportDetail', params.riskReportIdx],
    queryFn: () => getRiskReport(params),
    enabled,
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * 위험 보고 등록 Mutation Hook
 */
export function useCreateRiskReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: CreateRiskReportParams) => createRiskReport(params),
    onSuccess: (response) => {
      const resultMessage = response?.header?.resultMessage || '위험 보고가 등록되었습니다.';
      if (resultMessage && resultMessage !== 'SUCCESS') {
        toast.success(resultMessage);
      } else {
        toast.success('위험 보고가 등록되었습니다.');
      }
      queryClient.invalidateQueries({ queryKey: ['riskReports'] });
    },
    onError: (error: any) => {
      const resultMessage =
        error?.response?.data?.header?.resultMessage || error?.message || '위험 보고 등록에 실패했습니다.';
      toast.error(resultMessage);
    },
  });
}

/**
 * 위험 보고 삭제 Mutation Hook
 */
export function useDeleteRiskReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: DeleteRiskReportParams) => deleteRiskReport(params),
    onSuccess: (_, variables) => {
      toast.success('위험 보고가 삭제되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['riskReports'] });
    },
    onError: (error: any) => {
      const resultMessage =
        error?.response?.data?.header?.resultMessage || error?.message || '위험 보고 삭제에 실패했습니다.';
      toast.error(resultMessage);
    },
  });
}

/**
 * 위험 보고 수정 Mutation Hook
 */
export function useUpdateRiskReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: UpdateRiskReportParams) => updateRiskReport(params),
    onSuccess: (response, variables) => {
      const resultMessage = response?.header?.resultMessage || '위험 보고가 수정되었습니다.';
      if (resultMessage && resultMessage !== 'SUCCESS') {
        toast.success(resultMessage);
      } else {
        toast.success('위험 보고가 수정되었습니다.');
      }
      queryClient.invalidateQueries({ queryKey: ['riskReports'] });
      queryClient.invalidateQueries({ queryKey: ['riskReportDetail', variables.riskReportIdx] });
    },
    onError: (error: any) => {
      const resultMessage =
        error?.response?.data?.header?.resultMessage || error?.message || '위험 보고 수정에 실패했습니다.';
      toast.error(resultMessage);
    },
  });
}

/**
 * 채팅 위험 보고 생성 Mutation Hook
 */
export function useCreateRiskReportFromChat() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: CreateRiskReportFromChatParams) => createRiskReportFromChat(params),
    onSuccess: (response) => {
      const resultMessage = response?.header?.resultMessage || '채팅 위험 보고가 생성되었습니다.';
      if (resultMessage && resultMessage !== 'SUCCESS') {
        toast.success(resultMessage);
      } else {
        toast.success('채팅 위험 보고가 생성되었습니다.');
      }
      queryClient.invalidateQueries({ queryKey: ['riskReports'] });
    },
    onError: (error: any) => {
      const resultMessage =
        error?.response?.data?.header?.resultMessage || error?.message || '채팅 위험 보고 생성에 실패했습니다.';
      toast.error(resultMessage);
    },
  });
}
