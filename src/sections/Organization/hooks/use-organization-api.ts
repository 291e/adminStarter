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
} from 'src/services/organization/organization.service';
import type {
  GetOrganizationsParams,
  CreateOrganizationParams,
  UpdateOrganizationParams,
  GetOrganizationDetailParams,
  UpgradeServiceParams,
  CancelSubscriptionParams,
  CardActionParams,
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
    mutationFn: ({ companyIdx, ...params }: UpdateOrganizationParams & { companyIdx: number }) =>
      updateOrganization(companyIdx, params),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      queryClient.invalidateQueries({ queryKey: ['organizationDetail', variables.companyIdx] });
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
    mutationFn: ({
      companyIdx,
      ...params
    }: UpgradeServiceParams & { companyIdx: number }) => upgradeService(companyIdx, params),
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
    mutationFn: ({
      companyIdx,
      ...params
    }: CardActionParams & { companyIdx: number }) => cardAction(companyIdx, params),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['organizationDetail', variables.companyIdx] });
    },
  });
}
