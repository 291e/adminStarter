import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

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
    queryKey: ['serviceDetail', params.serviceSettingIdx],
    queryFn: () => getServiceDetail(params),
    enabled: !!params.serviceSettingIdx,
  });
}

/**
 * 서비스 등록 Mutation Hook
 */
export function useCreateService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: CreateServiceParams) => createService(params),
    onSuccess: (response) => {
      const resultMessage = response?.header?.resultMessage || '서비스가 등록되었습니다.';
      if (resultMessage && resultMessage !== 'SUCCESS') {
        toast.success(resultMessage);
      } else {
        toast.success('서비스가 등록되었습니다.');
      }
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
    onError: (error: any) => {
      const resultMessage =
        error?.response?.data?.header?.resultMessage || error?.message || '서비스 등록에 실패했습니다.';
      toast.error(resultMessage);
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
    onSuccess: (response, variables) => {
      const resultMessage = response?.header?.resultMessage || '서비스 정보가 수정되었습니다.';
      if (resultMessage && resultMessage !== 'SUCCESS') {
        toast.success(resultMessage);
      } else {
        toast.success('서비스 정보가 수정되었습니다.');
      }
      queryClient.invalidateQueries({ queryKey: ['services'] });
      queryClient.invalidateQueries({ queryKey: ['serviceDetail', variables.serviceSettingIdx] });
    },
    onError: (error: any) => {
      const resultMessage =
        error?.response?.data?.header?.resultMessage || error?.message || '서비스 수정에 실패했습니다.';
      toast.error(resultMessage);
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
    onSuccess: (_, variables) => {
      toast.success('서비스가 비활성화되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
    onError: (error: any) => {
      const resultMessage =
        error?.response?.data?.header?.resultMessage || error?.message || '서비스 비활성화에 실패했습니다.';
      toast.error(resultMessage);
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
    onSuccess: (_, variables) => {
      toast.success('서비스가 삭제되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
    onError: (error: any) => {
      const resultMessage =
        error?.response?.data?.header?.resultMessage || error?.message || '서비스 삭제에 실패했습니다.';
      toast.error(resultMessage);
    },
  });
}

