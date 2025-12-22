import axiosInstance from 'src/lib/axios';

import { endpoints } from 'src/lib/axios';

import type {
  UploadVodParams,
  UploadVodResponse,
  GetVodDetailResponse,
  GetVodStatusResponse,
} from './vod.types';

// ----------------------------------------------------------------------

/**
 * 비디오 업로드 및 STT/번역 처리
 * POST /vods
 */
export async function uploadVod(params: UploadVodParams): Promise<UploadVodResponse> {
  const formData = new FormData();
  formData.append('video', params.video);

  if (params.targetLanguages && params.targetLanguages.length > 0) {
    params.targetLanguages.forEach((lang) => {
      formData.append('targetLanguages', lang);
    });
  }

  const response = await axiosInstance.post<UploadVodResponse>(endpoints.vod.base, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
}

/**
 * VOD 상세 조회 (메타 + VTT 경로)
 * GET /vods/{vodIdx}
 */
export async function getVodDetail(vodIdx: number): Promise<GetVodDetailResponse> {
  const response = await axiosInstance.get<GetVodDetailResponse>(`${endpoints.vod.base}/${vodIdx}`);
  return response.data;
}

/**
 * VOD 처리 상태 폴링
 * GET /vods/{vodIdx}/status
 */
export async function getVodStatus(vodIdx: number): Promise<GetVodStatusResponse> {
  const response = await axiosInstance.get<GetVodStatusResponse>(
    `${endpoints.vod.base}/${vodIdx}/status`
  );
  return response.data;
}

/**
 * 비디오 스트리밍 URL 가져오기
 * GET /vods/{vodIdx}/video
 * axiosInstance를 사용하므로 상대 경로만 반환합니다.
 */
export function getVodVideoUrl(vodIdx: number): string {
  return `${endpoints.vod.base}/${vodIdx}/video`;
}

/**
 * 언어별 VTT 파일 다운로드 URL 가져오기
 * GET /vods/{vodIdx}/vtt/{lang}
 * axiosInstance를 사용하므로 상대 경로만 반환합니다.
 */
export function getVodVttUrl(vodIdx: number, lang: string): string {
  return `${endpoints.vod.base}/${vodIdx}/vtt/${lang}`;
}

/**
 * 자막이 포함된 비디오 다운로드 (Soft Sub)
 * GET /vods/{vodIdx}/download
 * 모든 언어의 자막을 포함한 MP4 파일을 다운로드합니다.
 * fetch를 사용하므로 전체 URL을 반환합니다.
 */
export function getVodDownloadUrl(vodIdx: number): string {
  const baseURL = axiosInstance.defaults.baseURL || '';
  return `${baseURL}${endpoints.vod.base}/${vodIdx}/download`;
}

/**
 * 여러 VOD를 한 번에 다운로드 (ZIP)
 * GET /vods/download/batch?vodIdx=1,2,3
 * 여러 VOD의 자막 포함 MP4 파일을 ZIP으로 압축하여 다운로드합니다.
 * fetch를 사용하므로 전체 URL을 반환합니다.
 */
export function getVodBatchDownloadUrl(vodIdxes: number[]): string {
  const baseURL = axiosInstance.defaults.baseURL || '';
  const vodIdxParam = vodIdxes.join(',');
  return `${baseURL}${endpoints.vod.base}/download/batch?vodIdx=${vodIdxParam}`;
}
