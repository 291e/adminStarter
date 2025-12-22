import { useQuery } from '@tanstack/react-query';

import { getChemicalSummary } from 'src/services/safety-system/safety-system.service';
import type { GetChemicalSummaryParams } from 'src/services/safety-system/safety-system.types';

// ----------------------------------------------------------------------

/**
 * 화학물질 검색 요약 조회 Hook
 */
export function useChemicalSummary(params: GetChemicalSummaryParams) {
  return useQuery({
    queryKey: ['chemicalSummary', params.search],
    queryFn: () => getChemicalSummary(params),
    enabled: !!params.search && params.search.length >= 2, // 검색어가 2자 이상일 때만 호출
    staleTime: 5 * 60 * 1000, // 5분
  });
}

