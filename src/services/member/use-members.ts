import { useQuery } from '@tanstack/react-query';

import { getMembers } from './member.service';
import type { GetMembersParams } from './member.types';

// ----------------------------------------------------------------------

/**
 * 회원 목록 조회를 위한 TanStack Query Hook
 *
 * @example
 * ```tsx
 * const { data, isLoading, error } = useMembers({
 *   page: 1,
 *   pageSize: 25,
 *   searchingKey: 'memberName',
 *   searchingVal: '홍길동',
 * });
 * ```
 */
export function useMembers(params: GetMembersParams) {
  return useQuery({
    queryKey: ['members', params], // params가 변경되면 자동으로 재요청
    queryFn: () => getMembers(params),
    staleTime: 5 * 60 * 1000, // 5분간 캐시 유지
    enabled: !!params.page && !!params.pageSize, // 필수 파라미터가 있을 때만 요청
  });
}
