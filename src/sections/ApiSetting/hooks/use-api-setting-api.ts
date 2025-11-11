import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apis'] });
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
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['apis'] });
      queryClient.invalidateQueries({ queryKey: ['apiDetail', variables.id] });
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
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['apiDetail', variables.id] });
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

