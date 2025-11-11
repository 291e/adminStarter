import axiosInstance from 'src/lib/axios';

import { endpoints } from 'src/lib/axios';

import type { GetMembersParams, GetMembersResponse } from './member.types';

// ----------------------------------------------------------------------

/**
 * 회원 목록 조회
 * GET /safeyoui/api/member
 */
export async function getMembers(params: GetMembersParams): Promise<GetMembersResponse> {
  const response = await axiosInstance.get<GetMembersResponse>(endpoints.member.list, {
    params: {
      filterMemberIndexes: params.filterMemberIndexes,
      filterMemberStatuses: params.filterMemberStatuses,
      searchingDateKey: params.searchingDateKey,
      searchingStartDate: params.searchingStartDate,
      searchingEndDate: params.searchingEndDate,
      searchingKey: params.searchingKey,
      searchingVal: params.searchingVal,
      sortBy: params.sortBy,
      sortOrder: params.sortOrder,
      page: params.page,
      pageSize: params.pageSize,
    },
  });

  return response.data;
}

