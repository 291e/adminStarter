import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import {
  getOrganizations,
  createOrganization,
  updateOrganization,
  deactivateOrganization,
  deleteOrganization,
  getOrganizationDetail,
  upgradeService,
  cancelSubscription,
  cardAction,
  getAccidentFree,
  updateAccidentFree,
  getCompanyMembers,
  inviteMember,
} from 'src/services/organization/organization.service';
import type {
  GetOrganizationsParams,
  CreateOrganizationParams,
  UpdateOrganizationParams,
  GetOrganizationDetailParams,
  UpgradeServiceParams,
  CancelSubscriptionParams,
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
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
    onSuccess: (data, variables) => {
      if (import.meta.env.DEV) {
        console.log('✅ [useUpdateOrganization] API 호출 성공', {
          data,
          variables,
        });
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
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
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['organizationDetail', variables.companyIdx] });
    },
  });
}

/**
 * 구독 취소 Mutation Hook
 */
export function useCancelService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: CancelSubscriptionParams) => cancelSubscription(params),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['organizationDetail', variables.companyIdx] });
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
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['organizationDetail', variables.companyIdx] });
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
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      queryClient.invalidateQueries({ queryKey: ['organizationDetail', variables.companyIdx] });
      queryClient.invalidateQueries({ queryKey: ['accidentFree', variables.companyIdx] });
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
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['companyMembers', variables.companyIdx] });
      queryClient.invalidateQueries({ queryKey: ['organizationDetail', variables.companyIdx] });
    },
  });
}
