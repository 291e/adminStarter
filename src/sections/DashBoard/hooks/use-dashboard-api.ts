import { useQuery } from '@tanstack/react-query';

import {
  getPendingSignatures,
  getSharedDocuments,
  getAccidentRiskStats,
  getUserProfile,
  getEducationCompletionRate,
} from 'src/services/dashboard/dashboard.service';
import type {
  GetUserProfileParams,
  GetEducationCompletionRateParams,
} from 'src/services/dashboard/dashboard.types';

// ----------------------------------------------------------------------

/**
 * 서명 대기 문서 목록 조회 Hook
 */
export function usePendingSignatures() {
  return useQuery({
    queryKey: ['pendingSignatures'],
    queryFn: () => getPendingSignatures(),
  });
}

/**
 * 공유된 문서 목록 조회 Hook
 */
export function useSharedDocuments() {
  return useQuery({
    queryKey: ['sharedDocuments'],
    queryFn: () => getSharedDocuments(),
  });
}

/**
 * 사고·위험 보고 현황 통계 조회 Hook
 */
export function useAccidentRiskStats() {
  return useQuery({
    queryKey: ['accidentRiskStats'],
    queryFn: () => getAccidentRiskStats(),
  });
}

/**
 * 사용자 프로필 정보 조회 Hook
 */
export function useUserProfile(params: GetUserProfileParams) {
  return useQuery({
    queryKey: ['userProfile', params.userId],
    queryFn: () => getUserProfile(params),
  });
}

/**
 * 교육 이수율 조회 Hook
 */
export function useEducationCompletionRate(params: GetEducationCompletionRateParams) {
  return useQuery({
    queryKey: ['educationCompletionRate', params.userId],
    queryFn: () => getEducationCompletionRate(params),
  });
}

