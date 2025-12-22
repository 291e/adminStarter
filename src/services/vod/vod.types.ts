// VOD API 타입 정의

import type { BaseResponseDto } from '../common';

// ----------------------------------------------------------------------

// VOD 상태
export type VodStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

// VOD 처리 단계
export type VodProcessStep = 'QUEUED' | 'EXTRACTING_AUDIO' | 'TRANSCRIBING' | 'TRANSLATING' | 'COMPLETED';

// VOD 업로드 요청 파라미터
export type UploadVodParams = {
  video: File; // 비디오 파일
  targetLanguages?: string[]; // 번역 대상 언어 목록 (기본: en, vi, uk)
};

// VOD 업로드 응답
export type UploadVodResponse = BaseResponseDto<{
  vodIdx: number;
  status: VodStatus;
  processStep: VodProcessStep;
  progress: number;
  targetLanguages: string[];
}>;

// VOD 상세 정보
export type VodDetail = {
  vodIdx: number;
  companyIdx: number;
  memberIdx: number;
  videoOriginalName: string;
  videoPath: string;
  audioPath: string;
  targetLanguages: string[];
  vttMap: Record<string, string>; // { "en": "data/vod/vtt/12_en.vtt", ... }
  status: VodStatus;
  processStep: VodProcessStep;
  progress: number;
  errorMessage: string | null;
  durationSec: number;
  createAt: string; // ISO date string
  updateAt: string; // ISO date string
};

// VOD 상세 조회 응답
export type GetVodDetailResponse = BaseResponseDto<VodDetail>;

// VOD 처리 상태 조회 응답
export type GetVodStatusResponse = BaseResponseDto<{
  vodIdx: number;
  status: VodStatus;
  processStep: VodProcessStep;
  progress: number;
  errorMessage: string | null;
}>;













