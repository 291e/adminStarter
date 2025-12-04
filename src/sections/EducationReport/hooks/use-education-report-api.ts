import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import {
  getEducationReports,
  createEducationReport,
  getEducationReport,
  updateEducationReport,
  getEducationDetail,
  createEducationRecord,
  updateEducationRecord,
  deleteEducationRecord,
} from 'src/services/education-report/education-report.service';
import type {
  GetEducationReportsParams,
  GetEducationReportParams,
  CreateEducationReportParams,
  UpdateEducationReportParams,
  GetEducationDetailStatisticsParams,
  CreateEducationRecordParams,
  UpdateEducationRecordParams,
  DeleteEducationRecordParams,
} from 'src/services/education-report/education-report.types';

// ----------------------------------------------------------------------

/**
 * 교육 이수 현황 목록 조회 Hook
 */
export function useEducationReports(params?: GetEducationReportsParams) {
  return useQuery({
    queryKey: ['educationReports', params],
    queryFn: () => getEducationReports(params),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * 교육 리포트 생성 Mutation Hook
 */
export function useCreateEducation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: CreateEducationReportParams) => createEducationReport(params),
    onSuccess: (response) => {
      const resultMessage = response?.header?.resultMessage || '교육 리포트가 생성되었습니다.';
      if (resultMessage && resultMessage !== 'SUCCESS') {
        toast.success(resultMessage);
      } else {
        toast.success('교육 리포트가 생성되었습니다.');
      }
      queryClient.invalidateQueries({ queryKey: ['educationReports'] });
    },
    onError: (error: any) => {
      const resultMessage =
        error?.response?.data?.header?.resultMessage || error?.message || '교육 리포트 생성에 실패했습니다.';
      toast.error(resultMessage);
    },
  });
}

/**
 * 교육 리포트 조회 Hook
 */
export function useEducationDetail(params: GetEducationReportParams) {
  return useQuery({
    queryKey: ['educationReport', params.educationReportIdx],
    queryFn: () => getEducationReport(params),
    enabled: !!params.educationReportIdx,
  });
}

/**
 * 교육 리포트 수정 Mutation Hook
 */
export function useUpdateEducationDetail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: UpdateEducationReportParams) => updateEducationReport(params),
    onSuccess: (response, variables) => {
      const resultMessage = response?.header?.resultMessage || '교육 리포트가 수정되었습니다.';
      if (resultMessage && resultMessage !== 'SUCCESS') {
        toast.success(resultMessage);
      } else {
        toast.success('교육 리포트가 수정되었습니다.');
      }
      queryClient.invalidateQueries({ queryKey: ['educationReports'] });
      queryClient.invalidateQueries({ queryKey: ['educationReport', variables.educationReportIdx] });
    },
    onError: (error: any) => {
      const resultMessage =
        error?.response?.data?.header?.resultMessage || error?.message || '교육 리포트 수정에 실패했습니다.';
      toast.error(resultMessage);
    },
  });
}

/**
 * 교육 상세 현황 조회 Hook
 */
export function useEducationDetailStatistics(params?: GetEducationDetailStatisticsParams) {
  return useQuery({
    queryKey: ['educationDetailStatistics', params],
    queryFn: () => {
      if (!params) {
        throw new Error('params is required');
      }
      if (!params.memberIdx) {
        throw new Error('memberIdx is required');
      }
      // 타입 가드로 params가 확실히 정의되어 있음을 보장
      const validParams: GetEducationDetailStatisticsParams = {
        memberIdx: params.memberIdx,
        role: params.role,
        startDate: params.startDate,
        endDate: params.endDate,
      };
      return getEducationDetail(validParams);
    },
    enabled: !!params?.memberIdx,
  });
}

/**
 * 교육 기록 등록 Mutation Hook
 */
export function useCreateEducationRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: CreateEducationRecordParams) => createEducationRecord(params),
    onSuccess: (response, variables) => {
      const resultMessage = response?.header?.resultMessage || '교육 기록이 등록되었습니다.';
      if (resultMessage && resultMessage !== 'SUCCESS') {
        toast.success(resultMessage);
      } else {
        toast.success('교육 기록이 등록되었습니다.');
      }
      // 교육 상세 현황 새로고침
      queryClient.invalidateQueries({ queryKey: ['educationDetailStatistics'] });
      // 교육 리포트 목록도 새로고침 (필요시)
      queryClient.invalidateQueries({ queryKey: ['educationReports'] });
      if (variables?.educationReportIdx) {
        queryClient.invalidateQueries({
          queryKey: ['educationReport', variables.educationReportIdx],
        });
      }
    },
    onError: (error: any) => {
      const resultMessage =
        error?.response?.data?.header?.resultMessage || error?.message || '교육 기록 등록에 실패했습니다.';
      toast.error(resultMessage);
    },
  });
}

/**
 * 교육 기록 수정 Mutation Hook
 */
export function useUpdateEducationRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: UpdateEducationRecordParams) => updateEducationRecord(params),
    onSuccess: (response) => {
      const resultMessage = response?.header?.resultMessage || '교육 기록이 수정되었습니다.';
      if (resultMessage && resultMessage !== 'SUCCESS') {
        toast.success(resultMessage);
      } else {
        toast.success('교육 기록이 수정되었습니다.');
      }
      // 교육 상세 현황 새로고침
      queryClient.invalidateQueries({ queryKey: ['educationDetailStatistics'] });
      // 교육 리포트 목록도 새로고침 (필요시)
      queryClient.invalidateQueries({ queryKey: ['educationReports'] });
    },
    onError: (error: any) => {
      const resultMessage =
        error?.response?.data?.header?.resultMessage || error?.message || '교육 기록 수정에 실패했습니다.';
      toast.error(resultMessage);
    },
  });
}

/**
 * 교육 기록 삭제 Mutation Hook
 */
export function useDeleteEducationRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: DeleteEducationRecordParams) => deleteEducationRecord(params),
    onSuccess: (_, variables) => {
      toast.success('교육 기록이 삭제되었습니다.');
      // 교육 상세 현황 새로고침
      queryClient.invalidateQueries({ queryKey: ['educationDetailStatistics'] });
      // 교육 리포트 목록도 새로고침 (필요시)
      queryClient.invalidateQueries({ queryKey: ['educationReports'] });
    },
    onError: (error: any) => {
      const resultMessage =
        error?.response?.data?.header?.resultMessage || error?.message || '교육 기록 삭제에 실패했습니다.';
      toast.error(resultMessage);
    },
  });
}
