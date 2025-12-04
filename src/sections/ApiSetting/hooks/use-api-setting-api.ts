import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import {
  getApis,
  getApiDetail,
  createApi,
  updateApi,
  generateApiKey,
  getApiUrl,
  getApiModifiedDate,
} from 'src/services/api-setting/api-setting.service';
import type {
  GetApisParams,
  GetApiDetailParams,
  CreateApiParams,
  UpdateApiParams,
  GenerateApiKeyParams,
  GetApiUrlParams,
  GetApiModifiedDateParams,
} from 'src/services/api-setting/api-setting.types';

// ----------------------------------------------------------------------

/**
 * API 목록 조회 Hook
 */
export function useApis(params: GetApisParams) {
  return useQuery({
    queryKey: ['apis', params],
    queryFn: () => getApis(params),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * API 상세 정보 조회 Hook
 */
export function useApiDetail(params: GetApiDetailParams) {
  return useQuery({
    queryKey: ['apiDetail', params.id],
    queryFn: () => getApiDetail(params),
    enabled: !!params.id,
  });
}

/**
 * API 등록 Mutation Hook
 */
export function useCreateApi() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: CreateApiParams) => createApi(params),
    onSuccess: (response) => {
      const resultMessage = response?.header?.resultMessage || 'API가 등록되었습니다.';
      if (resultMessage && resultMessage !== 'SUCCESS') {
        toast.success(resultMessage);
      } else {
        toast.success('API가 등록되었습니다.');
      }
      queryClient.invalidateQueries({ queryKey: ['apis'] });
    },
    onError: (error: any) => {
      const resultMessage =
        error?.response?.data?.header?.resultMessage || error?.message || 'API 등록에 실패했습니다.';
      toast.error(resultMessage);
    },
  });
}

/**
 * API 수정 Mutation Hook
 */
export function useUpdateApi() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: UpdateApiParams) => updateApi(params),
    onSuccess: (response, variables) => {
      const resultMessage = response?.header?.resultMessage || 'API 정보가 수정되었습니다.';
      if (resultMessage && resultMessage !== 'SUCCESS') {
        toast.success(resultMessage);
      } else {
        toast.success('API 정보가 수정되었습니다.');
      }
      queryClient.invalidateQueries({ queryKey: ['apis'] });
      queryClient.invalidateQueries({ queryKey: ['apiDetail', variables.id] });
    },
    onError: (error: any) => {
      const resultMessage =
        error?.response?.data?.header?.resultMessage || error?.message || 'API 수정에 실패했습니다.';
      toast.error(resultMessage);
    },
  });
}

/**
 * 새 Key 생성 Mutation Hook
 */
export function useGenerateApiKey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: GenerateApiKeyParams) => generateApiKey(params),
    onSuccess: (response, variables) => {
      const resultMessage = response?.header?.resultMessage || '새 API Key가 생성되었습니다.';
      if (resultMessage && resultMessage !== 'SUCCESS') {
        toast.success(resultMessage);
      } else {
        toast.success('새 API Key가 생성되었습니다.');
      }
      queryClient.invalidateQueries({ queryKey: ['apiDetail', variables.id] });
    },
    onError: (error: any) => {
      const resultMessage =
        error?.response?.data?.header?.resultMessage || error?.message || 'API Key 생성에 실패했습니다.';
      toast.error(resultMessage);
    },
  });
}

/**
 * API URL 조회 Hook
 */
export function useApiUrl(params: GetApiUrlParams) {
  return useQuery({
    queryKey: ['apiUrl', params.id],
    queryFn: () => getApiUrl(params),
    enabled: !!params.id,
  });
}

/**
 * 수정일 조회 Hook
 */
export function useApiModifiedDate(params: GetApiModifiedDateParams) {
  return useQuery({
    queryKey: ['apiModifiedDate', params.id],
    queryFn: () => getApiModifiedDate(params),
    enabled: !!params.id,
  });
}

