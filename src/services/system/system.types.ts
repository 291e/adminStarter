// System API 타입 정의

import type { BaseResponseDto } from '../common';

// Token 업데이트 요청
export type TokenUpdateDto = {
  token: string;
};

// 파일 업로드 요청
export type FileUploadDto = {
  files: File[];
};

// 파일 업로드 응답
export type FileUploadResponseDto = BaseResponseDto<{
  fileUrls: string[];
}>;

// SEO 생성/수정 요청
export type CreateSeoDto = {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
};

// SEO 조회 응답
export type SeoResponseDto = BaseResponseDto<{
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
}>;

// 주변 병원/소방서 조회 요청
export type ReadPlacesDto = {
  latitude: number;
  longitude: number;
  radius?: number; // km 단위
};

// 주변 병원/소방서 응답
export type PlacesResponseDto = BaseResponseDto<{
  hospitals: Array<{
    name: string;
    address: string;
    phone: string;
    latitude: number;
    longitude: number;
    distance: number;
  }>;
  fireStations: Array<{
    name: string;
    address: string;
    phone: string;
    latitude: number;
    longitude: number;
    distance: number;
  }>;
}>;
