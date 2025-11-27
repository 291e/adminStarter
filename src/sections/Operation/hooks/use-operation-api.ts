import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['riskReports'] });
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['riskReports'] });
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
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['riskReports'] });
      queryClient.invalidateQueries({ queryKey: ['riskReportDetail', variables.riskReportIdx] });
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['riskReports'] });
    },
  });
}
