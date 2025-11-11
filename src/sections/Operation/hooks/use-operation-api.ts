import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import {
  getRiskReports,
  createRiskReport,
  deactivateRiskReport,
  deleteRiskReport,
} from 'src/services/operation/operation.service';
import type {
  GetRiskReportsParams,
  CreateRiskReportParams,
  DeactivateRiskReportParams,
  DeleteRiskReportParams,
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
 * 위험 보고 비활성화 Mutation Hook
 */
export function useDeactivateRiskReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: DeactivateRiskReportParams) => deactivateRiskReport(params),
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
