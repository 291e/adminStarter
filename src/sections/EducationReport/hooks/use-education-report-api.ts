import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import {
  getEducationReports,
  getEducationDetail,
  createEducation,
  updateEducationDetail,
} from 'src/services/education-report/education-report.service';
import type {
  GetEducationReportsParams,
  GetEducationDetailParams,
  CreateEducationParams,
  UpdateEducationDetailParams,
} from 'src/services/education-report/education-report.types';

// ----------------------------------------------------------------------

/**
 * 교육 이수 현황 목록 조회 Hook
 */
export function useEducationReports(params: GetEducationReportsParams) {
  return useQuery({
    queryKey: ['educationReports', params],
    queryFn: () => getEducationReports(params),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * 교육 상세 정보 조회 Hook
 */
export function useEducationDetail(params: GetEducationDetailParams) {
  return useQuery({
    queryKey: ['educationDetail', params.id],
    queryFn: () => getEducationDetail(params),
    enabled: !!params.id,
  });
}

/**
 * 교육 추가 Mutation Hook
 */
export function useCreateEducation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: CreateEducationParams) => createEducation(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['educationReports'] });
    },
  });
}

/**
 * 교육 상세 정보 저장 Mutation Hook
 */
export function useUpdateEducationDetail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: UpdateEducationDetailParams) => updateEducationDetail(params),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['educationReports'] });
      queryClient.invalidateQueries({ queryKey: ['educationDetail', variables.id] });
    },
  });
}

