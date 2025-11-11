import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import {
  getServices,
  getServiceDetail,
  createService,
  updateService,
  deactivateService,
  deleteService,
} from 'src/services/service-setting/service-setting.service';
import type {
  GetServicesParams,
  GetServiceDetailParams,
  CreateServiceParams,
  UpdateServiceParams,
  DeactivateServiceParams,
  DeleteServiceParams,
} from 'src/services/service-setting/service-setting.types';

// ----------------------------------------------------------------------

/**
 * 서비스 목록 조회 Hook
 */
export function useServices(params: GetServicesParams) {
  return useQuery({
    queryKey: ['services', params],
    queryFn: () => getServices(params),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * 서비스 상세 정보 조회 Hook
 */
export function useServiceDetail(params: GetServiceDetailParams) {
  return useQuery({
    queryKey: ['serviceDetail', params.id],
    queryFn: () => getServiceDetail(params),
    enabled: !!params.id,
  });
}

/**
 * 서비스 등록 Mutation Hook
 */
export function useCreateService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: CreateServiceParams) => createService(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
  });
}

/**
 * 서비스 수정 Mutation Hook
 */
export function useUpdateService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: UpdateServiceParams) => updateService(params),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      queryClient.invalidateQueries({ queryKey: ['serviceDetail', variables.id] });
    },
  });
}

/**
 * 서비스 비활성화 Mutation Hook
 */
export function useDeactivateService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: DeactivateServiceParams) => deactivateService(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
  });
}

/**
 * 서비스 삭제 Mutation Hook
 */
export function useDeleteService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: DeleteServiceParams) => deleteService(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
  });
}

