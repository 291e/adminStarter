import { useMemo, useState, useCallback } from 'react';
import { useCompanyMembers } from '../../hooks/use-organization-api';
import type { Member } from 'src/sections/Organization/types/member';

// ----------------------------------------------------------------------

export type OrganizationDetailFilters = {
  tab: 'all' | 'active' | 'inactive';
  role: string;
  searchFilter: string;
  searchValue: string;
};

export type UseOrganizationDetailResult = {
  filters: OrganizationDetailFilters;
  onChangeTab: (value: OrganizationDetailFilters['tab']) => void;
  onChangeRole: (value: string) => void;
  onChangeSearchFilter: (value: string) => void;
  onChangeSearchValue: (value: string) => void;
  page: number;
  rowsPerPage: number;
  onChangePage: (page: number) => void;
  onChangeRowsPerPage: (rows: number) => void;
  filtered: Member[];
  total: number;
  counts: {
    all: number;
    active: number;
    inactive: number;
  };
  isLoading: boolean;
  isError: boolean;
};

export function useOrganizationDetail(
  companyIdx: number | null,
  companyMemberList?: any[] // 조직 상세 API 응답의 companyMemberList
): UseOrganizationDetailResult {
  const [filters, setFilters] = useState<OrganizationDetailFilters>({
    tab: 'all',
    role: 'all',
    searchFilter: 'all',
    searchValue: '',
  });
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);

  // API 파라미터 구성
  const apiParams = useMemo(() => {
    const params: {
      role?: string;
      page?: number;
      pageSize?: number;
    } = {
      page: page + 1, // API는 1-based 페이지네이션
      pageSize: rowsPerPage,
    };

    // 역할 필터
    if (filters.role !== 'all') {
      params.role = filters.role;
    }

    return params;
  }, [filters.role, page, rowsPerPage]);

  // API 호출 (companyMemberList가 있으면 사용, 없으면 별도 API 호출)
  const {
    data: membersData,
    isLoading,
    isError,
  } = useCompanyMembers(companyIdx || 0, companyIdx && !companyMemberList ? apiParams : undefined);

  // API 응답에서 멤버 목록 추출 및 매핑
  // 조직 상세 API 응답의 companyMemberList를 우선 사용
  const members = useMemo(() => {
    // 조직 상세 API 응답의 companyMemberList 사용
    if (companyMemberList && companyMemberList.length > 0) {
      return companyMemberList.map((member: any, index: number) => ({
        // API 응답의 Member 타입을 UI에서 사용하는 Member 타입으로 매핑
        member: null,
        memberIdx: member.memberIdx || index,
        memberId: member.memberId || '',
        password: '',
        memberRole: member.memberRole || '',
        memberThumbnail: member.memberThumbnail || '',
        memberStatus: member.memberStatus === 'ACTIVE' ? 'active' : 'inactive',
        memberEmail: member.memberEmail || '',
        memberName: member.memberName || '',
        memberPhone: member.memberPhone || '',
        memberAddress: member.memberAddress || '',
        memberAddressDetail: member.memberAddressDetail || '',
        memberMemo: member.memberMemo || null,
        createAt: member.createAt || '',
        updateAt: member.updateAt || '',
        duplicateSigninKey: member.duplicateSigninKey || null,
        lastSigninDate: member.lastSigninAt || null,
        companyIdx: member.companyIdx || companyIdx || 0,
        companyBranchIdx: member.companyBranchIdx || null,
        memberNameOrg: member.memberNameOrg || null,
        memberLang: member.memberLang || 'ko',
        deviceToken: member.deviceToken || null,
        deviceGubun: member.deviceGubun || null,
        memberlat: member.memberlat || null,
        memberlng: member.memberlng || null,
        lastLocationUpdateAt: member.lastLocationUpdateAt || null,
        loginAttempts: member.loginAttempts || 0,
        loginBlockedUntil: member.loginBlockedUntil || null,
        accidentFreeYear: null,
        order: page * rowsPerPage + index + 1, // 순번 추가
      })) as (Member & { order: number })[];
    }

    // 별도 멤버 조회 API 응답 사용
    const responseData = membersData as any;
    if (!responseData?.members) return [];

    return responseData.members.map((member: any, index: number) => ({
      // API 응답의 Member 타입을 UI에서 사용하는 Member 타입으로 매핑
      member: null,
      memberIdx: member.memberIdx || member.id || index,
      memberId: member.memberId || member.id || '',
      password: '',
      memberRole: member.memberRole || member.role || '',
      memberThumbnail: member.memberThumbnail || '',
      memberStatus: member.memberStatus || member.status || 'inactive',
      memberEmail: member.memberEmail || member.email || '',
      memberName: member.memberName || member.name || '',
      memberPhone: member.memberPhone || member.phone || '',
      memberAddress: member.memberAddress || '',
      memberAddressDetail: member.memberAddressDetail || '',
      memberMemo: null,
      createAt: member.createAt || '',
      updateAt: member.updateAt || '',
      duplicateSigninKey: null,
      lastSigninDate: member.lastSigninDate || null,
      companyIdx: member.companyIdx || companyIdx || 0,
      companyBranchIdx: member.companyBranchIdx || null,
      memberNameOrg: member.memberNameOrg || null,
      memberLang: member.memberLang || 'ko',
      deviceToken: null,
      deviceGubun: null,
      memberlat: null,
      memberlng: null,
      lastLocationUpdateAt: null,
      loginAttempts: 0,
      loginBlockedUntil: null,
      accidentFreeYear: null,
      order: page * rowsPerPage + index + 1, // 순번 추가
    })) as (Member & { order: number })[];
  }, [membersData, companyMemberList, page, rowsPerPage, companyIdx]);

  // 클라이언트 사이드 검색 필터링 (API에서 지원하지 않는 경우)
  const filteredMembers = useMemo(() => {
    if (!filters.searchValue) return members;

    const searchLower = filters.searchValue.toLowerCase();
    return members.filter((m: Member) => {
      if (filters.searchFilter === 'all') {
        return (
          m.memberId.toLowerCase().includes(searchLower) ||
          m.memberName.toLowerCase().includes(searchLower) ||
          m.memberEmail.toLowerCase().includes(searchLower) ||
          m.memberPhone.toLowerCase().includes(searchLower)
        );
      }
      if (filters.searchFilter === 'memberId') {
        return m.memberId.toLowerCase().includes(searchLower);
      }
      if (filters.searchFilter === 'memberName') {
        return m.memberName.toLowerCase().includes(searchLower);
      }
      if (filters.searchFilter === 'memberEmail') {
        return m.memberEmail.toLowerCase().includes(searchLower);
      }
      if (filters.searchFilter === 'memberPhone') {
        return m.memberPhone.toLowerCase().includes(searchLower);
      }
      return true;
    });
  }, [members, filters.searchFilter, filters.searchValue]);

  // 탭 필터링 (클라이언트 사이드)
  const filteredByTab = useMemo(() => {
    if (filters.tab === 'all') return filteredMembers;
    return filteredMembers.filter((m: Member) => {
      const status = m.memberStatus === 'active' ? 'active' : 'inactive';
      return status === filters.tab;
    });
  }, [filteredMembers, filters.tab]);

  // 카운트 계산
  const counts = useMemo(() => {
    // companyMemberList를 사용하는 경우
    if (companyMemberList) {
      const all = companyMemberList.length;
      const active = filteredMembers.filter((m: Member) => m.memberStatus === 'active').length;
      const inactive = filteredMembers.filter((m: Member) => m.memberStatus !== 'active').length;
      return { all, active, inactive };
    }

    // 별도 멤버 조회 API 응답 사용
    const responseData = membersData as any;
    const all = responseData?.total || 0;
    const active = filteredMembers.filter((m: Member) => m.memberStatus === 'active').length;
    const inactive = filteredMembers.filter((m: Member) => m.memberStatus !== 'active').length;
    return { all, active, inactive };
  }, [membersData, companyMemberList, filteredMembers]);

  const onChangeTab = useCallback((value: OrganizationDetailFilters['tab']) => {
    setFilters((prev) => ({ ...prev, tab: value }));
    setPage(0);
  }, []);

  const onChangeRole = useCallback((value: string) => {
    setFilters((prev) => ({ ...prev, role: value }));
    setPage(0);
  }, []);

  const onChangeSearchFilter = useCallback((value: string) => {
    setFilters((prev) => ({ ...prev, searchFilter: value }));
    setPage(0);
  }, []);

  const onChangeSearchValue = useCallback((value: string) => {
    setFilters((prev) => ({ ...prev, searchValue: value }));
    setPage(0);
  }, []);

  const onChangePage = useCallback((next: number) => {
    setPage(next);
  }, []);

  const onChangeRowsPerPage = useCallback((rows: number) => {
    setRowsPerPage(rows);
    setPage(0);
  }, []);

  // 디버깅
  if (import.meta.env.DEV) {
    const responseData = membersData as any;
    console.log('🔍 [useOrganizationDetail]', {
      companyIdx,
      filters,
      page,
      rowsPerPage,
      apiParams,
      companyMemberListLength: companyMemberList?.length,
      membersCount: members.length,
      total: companyMemberList ? companyMemberList.length : responseData?.total,
      isLoading,
      isError,
    });
  }

  const responseData = membersData as any;
  return {
    filters,
    onChangeTab,
    onChangeRole,
    onChangeSearchFilter,
    onChangeSearchValue,
    page,
    rowsPerPage,
    onChangePage,
    onChangeRowsPerPage,
    filtered: filteredByTab,
    total: companyMemberList ? companyMemberList.length : responseData?.total || 0,
    counts,
    isLoading: companyMemberList ? false : isLoading, // companyMemberList가 있으면 로딩 완료
    isError: companyMemberList ? false : isError, // companyMemberList가 있으면 에러 없음
  };
}
