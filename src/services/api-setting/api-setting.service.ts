import axiosInstance from 'src/lib/axios';

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

export async function getApis(
  params: GetApisParams
): Promise<GetApisResponse> {
  // TODO: API 엔드포인트 구현
  throw new Error('Not implemented');
}

export async function getApiDetail(
  params: GetApiDetailParams
): Promise<GetApiDetailResponse> {
  // TODO: API 엔드포인트 구현
  throw new Error('Not implemented');
}

export async function createApi(
  params: CreateApiParams
): Promise<CreateApiResponse> {
  // TODO: API 엔드포인트 구현
  throw new Error('Not implemented');
}

export async function updateApi(
  params: UpdateApiParams
): Promise<UpdateApiResponse> {
  // TODO: API 엔드포인트 구현
  throw new Error('Not implemented');
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

