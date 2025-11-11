import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import {
  getOrganizations,
  createOrganization,
  updateOrganization,
  deactivateOrganization,
  deleteOrganization,
  getOrganizationDetail,
  upgradeService,
  cancelService,
  cardAction,
} from 'src/services/organization/organization.service';
import type {
  GetOrganizationsParams,
  CreateOrganizationParams,
  UpdateOrganizationParams,
  GetOrganizationDetailParams,
  UpgradeServiceParams,
  CancelServiceParams,
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
    queryKey: ['organizationDetail', params.id],
    queryFn: () => getOrganizationDetail(params),
    enabled: !!params.id,
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
    mutationFn: ({ id, ...params }: UpdateOrganizationParams & { id: string }) =>
      updateOrganization(id, params),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      queryClient.invalidateQueries({ queryKey: ['organizationDetail', variables.id] });
    },
  });
}

/**
 * 조직 비활성화 Mutation Hook
 */
export function useDeactivateOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deactivateOrganization(id),
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
    mutationFn: (id: string) => deleteOrganization(id),
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
    mutationFn: (params: UpgradeServiceParams) => upgradeService(params),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['organizationDetail', variables.organizationId] });
    },
  });
}

/**
 * 서비스 취소 Mutation Hook
 */
export function useCancelService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: CancelServiceParams) => cancelService(params),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['organizationDetail', variables.organizationId] });
    },
  });
}

/**
 * 카드 액션 Mutation Hook
 */
export function useCardAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: CardActionParams) => cardAction(params),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['organizationDetail', variables.organizationId] });
    },
  });
}

