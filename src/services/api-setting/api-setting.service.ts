import axiosInstance from 'src/lib/axios';

import { endpoints } from 'src/lib/axios';

import type {
  GetApisParams,
  GetApisResponse,
  GetApiDetailParams,
  GetApiDetailResponse,
  CreateApiParams,
  CreateApiResponse,
  UpdateApiParams,
  UpdateApiResponse,
  GenerateApiKeyParams,
  GenerateApiKeyResponse,
  GetApiUrlParams,
  GetApiUrlResponse,
  GetApiModifiedDateParams,
  GetApiModifiedDateResponse,
} from './api-setting.types';

// ----------------------------------------------------------------------

/**
 * API 목록 조회
 * GET /api-settings
 */
export async function getApis(params: GetApisParams): Promise<GetApisResponse> {
  const response = await axiosInstance.get<GetApisResponse>(endpoints.apiSetting.base, {
    params,
  });
  return response.data;
}

/**
 * API 상세 정보 조회
 * GET /api-settings/{apiSettingIdx}
 */
export async function getApiDetail(
  params: GetApiDetailParams
): Promise<GetApiDetailResponse> {
  const response = await axiosInstance.get<GetApiDetailResponse>(
    `${endpoints.apiSetting.base}/${params.apiSettingIdx}`
  );
  return response.data;
}

export async function createApi(
  params: CreateApiParams
): Promise<CreateApiResponse> {
  // TODO: API 엔드포인트 구현
  throw new Error('Not implemented');
}

/**
 * API 수정
 * PUT /api-settings/{apiSettingIdx}
 */
export async function updateApi(params: UpdateApiParams): Promise<UpdateApiResponse> {
  const { apiSettingIdx, ...updateData } = params;
  const response = await axiosInstance.put<UpdateApiResponse>(
    `${endpoints.apiSetting.base}/${apiSettingIdx}`,
    updateData
  );
  return response.data;
}

export async function generateApiKey(
  params: GenerateApiKeyParams
): Promise<GenerateApiKeyResponse> {
  // TODO: API 엔드포인트 구현
  throw new Error('Not implemented');
}

export async function getApiUrl(
  params: GetApiUrlParams
): Promise<GetApiUrlResponse> {
  // TODO: API 엔드포인트 구현
  throw new Error('Not implemented');
}

export async function getApiModifiedDate(
  params: GetApiModifiedDateParams
): Promise<GetApiModifiedDateResponse> {
  // TODO: API 엔드포인트 구현
  throw new Error('Not implemented');
}

