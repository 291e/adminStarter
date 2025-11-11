import type { BaseResponseDto } from '../common';

export type ApiStatus = 'active' | 'inactive';

export type Api = {
  id: string;
  name: string;
  provider: string;
  apiUrl: string;
  apiKey?: string; // 마스킹된 값
  expirationDate?: string;
  status: ApiStatus;
  registrationDate: string;
};

export type GetApisParams = {
  page: number;
  pageSize: number;
};

export type GetApisResponse = BaseResponseDto<{
  apis: Api[];
  total: number;
}>;

export type GetApiDetailParams = {
  id: string;
};

export type GetApiDetailResponse = BaseResponseDto<Api>;

export type CreateApiParams = {
  name: string;
  provider: string;
  apiUrl: string;
  apiKey: string;
  expirationDate?: string;
};

export type CreateApiResponse = BaseResponseDto<Api>;

export type UpdateApiParams = {
  id: string;
  name?: string;
  provider?: string;
  apiUrl?: string;
  apiKey?: string; // Key 교체 시에만 전송
  expirationDate?: string;
  status?: ApiStatus;
};

export type UpdateApiResponse = BaseResponseDto<Api>;

export type GenerateApiKeyParams = {
  id: string;
};

export type GenerateApiKeyResponse = BaseResponseDto<{
  apiKey: string;
}>;

export type GetApiUrlParams = {
  id: string;
};

export type GetApiUrlResponse = BaseResponseDto<{
  apiUrl: string;
}>;

export type GetApiModifiedDateParams = {
  id: string;
};

export type GetApiModifiedDateResponse = BaseResponseDto<{
  modifiedDate: string;
}>;

