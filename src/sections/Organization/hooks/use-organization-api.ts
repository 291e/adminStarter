import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import {
  getOrganizations,
  createOrganization,
  updateOrganization,
  deactivateOrganization,
  deleteOrganization,
  getOrganizationDetail,
  upgradeService,
  cardAction,
  getAccidentFree,
  updateAccidentFree,
  getCompanyMembers,
  inviteMember,
  getServicePlans,
  getCurrentSubscription,
} from 'src/services/organization/organization.service';
import type {
  GetOrganizationsParams,
  CreateOrganizationParams,
  UpdateOrganizationParams,
  GetOrganizationDetailParams,
  UpgradeServiceParams,
  CardActionParams,
  UpdateAccidentFreeParams,
  GetCompanyMembersParams,
  InviteMemberParams,
} from 'src/services/organization/organization.types';

// ----------------------------------------------------------------------

/**
 * 조직 목록 조회 Hook
 */
export function useOrganizations(params: GetOrganizationsParams) {
  return useQuery({
    queryKey: ['organizations', params],
    queryFn: () => getOrganizations(params),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * 조직 상세 정보 조회 Hook
 */
export function useOrganizationDetail(params: GetOrganizationDetailParams) {
  return useQuery({
    queryKey: ['organizationDetail', params.companyIdx],
    queryFn: () => getOrganizationDetail(params),
    enabled: !!params.companyIdx,
  });
}

/**
 * 조직 등록 Mutation Hook
 */
export function useCreateOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: CreateOrganizationParams) => createOrganization(params),
    onSuccess: (response) => {
      // 성공 메시지 표시
      const resultMessage = response?.header?.resultMessage || '조직이 등록되었습니다.';
      if (resultMessage && resultMessage !== 'SUCCESS') {
        toast.success(resultMessage);
      } else {
        toast.success('조직이 등록되었습니다.');
      }
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
    },
    onError: (error: any) => {
      if (import.meta.env.DEV) {
        console.error('❌ [useCreateOrganization] 조직 등록 실패', {
          error,
          errorMessage: error?.message,
          errorResponse: error?.response?.data,
        });
      }
      // 에러 메시지 표시
      const resultMessage =
        error?.response?.data?.header?.resultMessage ||
        error?.message ||
        '조직 등록에 실패했습니다.';
      toast.error(resultMessage);
    },
  });
}

/**
 * 조직 수정 Mutation Hook
 */
export function useUpdateOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ companyIdx, ...params }: UpdateOrganizationParams & { companyIdx: number }) => {
      if (import.meta.env.DEV) {
        console.log('📤 [useUpdateOrganization] API 호출 시작', {
          companyIdx,
          params,
        });
      }
      return updateOrganization(companyIdx, params);
    },
    onSuccess: (response, variables) => {
      if (import.meta.env.DEV) {
        console.log('✅ [useUpdateOrganization] API 호출 성공', {
          response,
          variables,
        });
      }
      // 성공 메시지 표시
      const resultMessage = response?.header?.resultMessage || '조직 정보가 수정되었습니다.';
      if (resultMessage && resultMessage !== 'SUCCESS') {
        toast.success(resultMessage);
      } else {
        toast.success('조직 정보가 수정되었습니다.');
      }
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      queryClient.invalidateQueries({ queryKey: ['organizationDetail', variables.companyIdx] });
    },
    onError: (error: any, variables) => {
      if (import.meta.env.DEV) {
        console.error('❌ [useUpdateOrganization] API 호출 실패', {
          error,
          errorMessage: error?.message,
          errorResponse: error?.response?.data,
          variables,
        });
      }
      // 에러 메시지 표시
      const resultMessage =
        error?.response?.data?.header?.resultMessage ||
        error?.message ||
        '조직 수정에 실패했습니다.';
      toast.error(resultMessage);
    },
  });
}

/**
 * 조직 비활성화 Mutation Hook
 */
export function useDeactivateOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (companyIdx: number) => deactivateOrganization(companyIdx),
    onSuccess: (_, variables) => {
      // 성공 메시지 표시
      toast.success('조직이 비활성화되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      queryClient.invalidateQueries({ queryKey: ['organizationDetail', variables] });
    },
    onError: (error: any) => {
      if (import.meta.env.DEV) {
        console.error('❌ [useDeactivateOrganization] 조직 비활성화 실패', {
          error,
          errorMessage: error?.message,
          errorResponse: error?.response?.data,
        });
      }
      // 에러 메시지 표시
      const resultMessage =
        error?.response?.data?.header?.resultMessage ||
        error?.message ||
        '조직 비활성화에 실패했습니다.';
      toast.error(resultMessage);
    },
  });
}

/**
 * 조직 삭제 Mutation Hook
 */
export function useDeleteOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (companyIdx: number) => deleteOrganization(companyIdx),
    onSuccess: (_, variables) => {
      // 성공 메시지 표시
      toast.success('조직이 삭제되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      queryClient.invalidateQueries({ queryKey: ['organizationDetail', variables] });
    },
    onError: (error: any) => {
      if (import.meta.env.DEV) {
        console.error('❌ [useDeleteOrganization] 조직 삭제 실패', {
          error,
          errorMessage: error?.message,
          errorResponse: error?.response?.data,
        });
      }
      // 에러 메시지 표시
      const resultMessage =
        error?.response?.data?.header?.resultMessage ||
        error?.message ||
        '조직 삭제에 실패했습니다.';
      toast.error(resultMessage);
    },
  });
}

/**
 * 서비스 업그레이드 Mutation Hook
 */
export function useUpgradeService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ companyIdx, ...params }: UpgradeServiceParams & { companyIdx: number }) =>
      upgradeService(companyIdx, params),
    onSuccess: (response, variables) => {
      // 성공 메시지 표시
      const resultMessage = response?.header?.resultMessage || '서비스가 업그레이드되었습니다.';
      if (resultMessage && resultMessage !== 'SUCCESS') {
        toast.success(resultMessage);
      } else {
        toast.success('서비스가 업그레이드되었습니다.');
      }
      queryClient.invalidateQueries({ queryKey: ['organizationDetail', variables.companyIdx] });
    },
    onError: (error: any, variables) => {
      if (import.meta.env.DEV) {
        console.error('❌ [useUpgradeService] 서비스 업그레이드 실패', {
          error,
          errorMessage: error?.message,
          errorResponse: error?.response?.data,
          companyIdx: variables.companyIdx,
        });
      }
      // 에러 메시지 표시
      const resultMessage =
        error?.response?.data?.header?.resultMessage ||
        error?.message ||
        '서비스 업그레이드에 실패했습니다.';
      toast.error(resultMessage);
    },
  });
}


/**
 * 카드 액션 Mutation Hook
 */
export function useCardAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ companyIdx, ...params }: CardActionParams & { companyIdx: number }) =>
      cardAction(companyIdx, params),
    onSuccess: (response, variables) => {
      // 성공 메시지 표시
      const resultMessage = response?.header?.resultMessage || '카드 액션이 완료되었습니다.';
      if (resultMessage && resultMessage !== 'SUCCESS') {
        toast.success(resultMessage);
      } else {
        toast.success('카드 액션이 완료되었습니다.');
      }
      queryClient.invalidateQueries({ queryKey: ['organizationDetail', variables.companyIdx] });
    },
    onError: (error: any, variables) => {
      if (import.meta.env.DEV) {
        console.error('❌ [useCardAction] 카드 액션 실패', {
          error,
          errorMessage: error?.message,
          errorResponse: error?.response?.data,
          companyIdx: variables.companyIdx,
        });
      }
      // 에러 메시지 표시
      const resultMessage =
        error?.response?.data?.header?.resultMessage ||
        error?.message ||
        '카드 액션에 실패했습니다.';
      toast.error(resultMessage);
    },
  });
}

/**
 * 무재해 인증 정보 조회 Hook
 */
export function useAccidentFree(companyIdx: number) {
  return useQuery({
    queryKey: ['accidentFree', companyIdx],
    queryFn: () => getAccidentFree(companyIdx),
    enabled: !!companyIdx,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * 무재해 인증 정보 수정 Mutation Hook
 */
export function useUpdateAccidentFree() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ companyIdx, ...params }: UpdateAccidentFreeParams & { companyIdx: number }) =>
      updateAccidentFree(companyIdx, params),
    onSuccess: (_, variables) => {
      // 성공 메시지 표시
      toast.success('무재해 인증 정보가 수정되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      queryClient.invalidateQueries({ queryKey: ['organizationDetail', variables.companyIdx] });
      queryClient.invalidateQueries({ queryKey: ['accidentFree', variables.companyIdx] });
    },
    onError: (error: any, variables) => {
      if (import.meta.env.DEV) {
        console.error('❌ [useUpdateAccidentFree] 무재해 인증 정보 수정 실패', {
          error,
          errorMessage: error?.message,
          errorResponse: error?.response?.data,
          companyIdx: variables.companyIdx,
        });
      }
      // 에러 메시지 표시
      const resultMessage =
        error?.response?.data?.header?.resultMessage ||
        error?.message ||
        '무재해 인증 정보 수정에 실패했습니다.';
      toast.error(resultMessage);
    },
  });
}

/**
 * 회사/지점별 역할별 멤버 조회 Hook
 */
export function useCompanyMembers(companyIdx: number, params?: GetCompanyMembersParams) {
  return useQuery({
    queryKey: ['companyMembers', companyIdx, params],
    queryFn: () => getCompanyMembers(companyIdx, params),
    enabled: !!companyIdx,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * 조직원 초대 Mutation Hook
 */
export function useInviteMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ companyIdx, ...params }: InviteMemberParams & { companyIdx: number }) =>
      inviteMember(companyIdx, params),
    onSuccess: (response, variables) => {
      // 성공 메시지 표시
      const resultMessage = response?.header?.resultMessage || '조직원 초대가 완료되었습니다.';
      if (resultMessage && resultMessage !== 'SUCCESS') {
        toast.success(resultMessage);
      } else {
        toast.success('조직원 초대가 완료되었습니다.');
      }
      queryClient.invalidateQueries({ queryKey: ['companyMembers', variables.companyIdx] });
      queryClient.invalidateQueries({ queryKey: ['organizationDetail', variables.companyIdx] });
    },
    onError: (error: any, variables) => {
      if (import.meta.env.DEV) {
        console.error('❌ [useInviteMember] 조직원 초대 실패', {
          error,
          errorMessage: error?.message,
          errorResponse: error?.response?.data,
          companyIdx: variables.companyIdx,
        });
      }
      // 에러 메시지 표시
      const resultMessage =
        error?.response?.data?.header?.resultMessage ||
        error?.message ||
        '조직원 초대에 실패했습니다.';
      toast.error(resultMessage);
    },
  });
}

/**
 * 서비스 플랜 목록 조회 Hook
 */
export function useServicePlans(companyIdx: number) {
  return useQuery({
    queryKey: ['servicePlans', companyIdx],
    queryFn: () => getServicePlans(companyIdx),
    enabled: !!companyIdx,
    staleTime: 10 * 60 * 1000, // 10분
  });
}

/**
 * 현재 구독 정보 조회 Hook
 */
export function useCurrentSubscription(companyIdx: number) {
  return useQuery({
    queryKey: ['currentSubscription', companyIdx],
    queryFn: () => getCurrentSubscription(companyIdx),
    enabled: !!companyIdx,
    staleTime: 5 * 60 * 1000,
  });
}

