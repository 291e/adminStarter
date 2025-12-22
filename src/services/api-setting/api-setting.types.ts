import type { BaseResponseDto } from '../common';

export type ApiStatus = 'ACTIVE' | 'INACTIVE';
export type KeyStatus = 'NORMAL' | 'ABNORMAL';

// API 설정 정보 (API 응답 구조)
export type ApiSetting = {
  apiSettingIdx: number;
  name: string;
  provider: string;
  apiUrl: string | null;
  keyStatus: KeyStatus;
  lastInterlockedAt: string | null; // ISO date string
  expiresAt: string | null; // ISO date string
  status: ApiStatus;
  createAt: string; // ISO date string
  updateAt: string; // ISO date string
};

// API 목록 조회 파라미터
export type GetApisParams = {
  page: number;
  pageSize: number;
  status?: string; // 상태 필터
  keyStatus?: string; // 키 상태 필터
  search?: string; // 검색어 (이름, 제공자)
};

// API 목록 조회 응답
export type GetApisResponse = BaseResponseDto<{
  apiSettingList: ApiSetting[];
  totalCount: number;
}>;

// API 상세 조회 파라미터
export type GetApiDetailParams = {
  apiSettingIdx: number;
};

// API 상세 조회 응답
export type GetApiDetailResponse = BaseResponseDto<ApiSetting>;

export type CreateApiParams = {
  name: string;
  provider: string;
  apiUrl: string;
  apiKey: string;
  expirationDate?: string;
};

export type CreateApiResponse = BaseResponseDto<ApiSetting>;

// API 수정 파라미터
export type UpdateApiParams = {
  apiSettingIdx: number;
  name?: string;
  provider?: string;
  apiUrl?: string | null;
  apiKey?: string; // Key 교체 시에만 전송
  expiresAt?: string | null; // ISO date string
  status?: ApiStatus;
};

export type UpdateApiResponse = BaseResponseDto<ApiSetting>;

export type GenerateApiKeyParams = {
  apiSettingIdx: number;
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

