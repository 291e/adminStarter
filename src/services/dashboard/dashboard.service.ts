import axiosInstance from 'src/lib/axios';

import type {
  GetPendingSignaturesResponse,
  GetSharedDocumentsResponse,
  GetAccidentRiskStatsResponse,
  GetUserProfileParams,
  GetUserProfileResponse,
  GetEducationCompletionRateParams,
  GetEducationCompletionRateResponse,
} from './dashboard.types';

// ----------------------------------------------------------------------

export async function getPendingSignatures(): Promise<GetPendingSignaturesResponse> {
  // TODO: API 엔드포인트 구현
  throw new Error('Not implemented');
}

export async function getSharedDocuments(): Promise<GetSharedDocumentsResponse> {
  // TODO: API 엔드포인트 구현
  throw new Error('Not implemented');
}

export async function getAccidentRiskStats(): Promise<GetAccidentRiskStatsResponse> {
  // TODO: API 엔드포인트 구현
  throw new Error('Not implemented');
}

export async function getUserProfile(
  params: GetUserProfileParams
): Promise<GetUserProfileResponse> {
  // TODO: API 엔드포인트 구현
  throw new Error('Not implemented');
}

export async function getEducationCompletionRate(
  params: GetEducationCompletionRateParams
): Promise<GetEducationCompletionRateResponse> {
  // TODO: API 엔드포인트 구현
  throw new Error('Not implemented');
}

