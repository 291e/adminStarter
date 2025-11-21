import axiosInstance from 'src/lib/axios';

import { endpoints } from 'src/lib/axios';

import type {
  TokenUpdateDto,
  FileUploadDto,
  FileUploadResponseDto,
  CreateSeoDto,
  SeoResponseDto,
  ReadPlacesDto,
  PlacesResponseDto,
} from './system.types';

// ----------------------------------------------------------------------

/**
 * Token 업데이트
 * POST /system/token
 */
export async function updateToken(params: TokenUpdateDto): Promise<void> {
  await axiosInstance.post(endpoints.system.token, params);
}

/**
 * 파일 업로드
 * POST /system/upload
 */
export async function uploadFile(params: FileUploadDto): Promise<FileUploadResponseDto> {
  const formData = new FormData();
  params.files.forEach((file) => {
    formData.append('files', file);
  });

  const response = await axiosInstance.post<FileUploadResponseDto>(
    endpoints.system.upload,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  return response.data;
}

/**
 * SEO 생성
 * POST /system/seo
 */
export async function createSeo(params: CreateSeoDto): Promise<SeoResponseDto> {
  const response = await axiosInstance.post<SeoResponseDto>(endpoints.system.seo, params);
  return response.data;
}

/**
 * SEO 수정
 * PUT /system/seo
 */
export async function updateSeo(params: CreateSeoDto): Promise<SeoResponseDto> {
  const response = await axiosInstance.put<SeoResponseDto>(endpoints.system.seo, params);
  return response.data;
}

/**
 * SEO 조회
 * GET /system/seo
 */
export async function getSeo(): Promise<SeoResponseDto> {
  const response = await axiosInstance.get<SeoResponseDto>(endpoints.system.seo);
  return response.data;
}

/**
 * 주변 병원/소방서 조회
 * POST /system/places
 */
export async function getPlaces(params: ReadPlacesDto): Promise<PlacesResponseDto> {
  const response = await axiosInstance.post<PlacesResponseDto>(endpoints.system.places, params);
  return response.data;
}

