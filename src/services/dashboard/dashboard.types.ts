import type { BaseResponseDto } from '../common';

export type PendingSignature = {
  id: string;
  title: string;
  documentType: string;
  requestDate: string;
  // ... 기타 필드
};

export type GetPendingSignaturesResponse = BaseResponseDto<{
  signatures: PendingSignature[];
}>;

export type SharedDocument = {
  id: string;
  title: string;
  documentType: string;
  sharedDate: string;
  // ... 기타 필드
};

export type GetSharedDocumentsResponse = BaseResponseDto<{
  documents: SharedDocument[];
}>;

export type AccidentRiskStats = {
  accidentCount: number;
  riskCount: number;
  // ... 기타 필드
};

export type GetAccidentRiskStatsResponse = BaseResponseDto<AccidentRiskStats>;

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: string;
  // ... 기타 필드
};

export type GetUserProfileParams = {
  userId?: string; // 토큰에서 추출 가능
};

export type GetUserProfileResponse = BaseResponseDto<UserProfile>;

export type GetEducationCompletionRateParams = {
  userId?: string; // 토큰에서 추출 가능
};

export type GetEducationCompletionRateResponse = BaseResponseDto<{
  completionRate: number;
  total: number;
  completed: number;
}>;

