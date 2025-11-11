import { useMemo, useState, useCallback } from 'react';

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
};

export function useOrganizationDetail(members: Member[]): UseOrganizationDetailResult {
  const [filters, setFilters] = useState<OrganizationDetailFilters>({
    tab: 'all',
    role: 'all',
    searchFilter: 'all',
    searchValue: '',
  });
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);

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

  const counts = useMemo(() => {
    const all = members.length;
    const active = members.filter((m) => m.memberStatus === 'active').length;
    const inactive = members.filter((m) => m.memberStatus === 'inactive').length;
    return { all, active, inactive };
  }, [members]);

  // 역할 목록 추출 (멤버들의 역할을 기반으로)
  const roleOptions = useMemo(() => {
    const roles = new Set<string>();
    members.forEach((m) => {
      if (m.memberRole) {
        roles.add(m.memberRole);
      }
    });
    return Array.from(roles);
  }, [members]);

  const filteredAll = useMemo(
    () =>
      members.filter((m) => {
        // 탭 필터
        if (filters.tab === 'active' && m.memberStatus !== 'active') {
          return false;
        }
        if (filters.tab === 'inactive' && m.memberStatus !== 'inactive') {
          return false;
        }

        // 역할 필터
        if (filters.role !== 'all' && m.memberRole !== filters.role) {
          return false;
        }

        // 검색 필터
        if (!filters.searchValue) {
          return true;
        }

        const searchLower = filters.searchValue.toLowerCase();
        let searchMatch = false;

        if (filters.searchFilter === 'all') {
          searchMatch =
            m.memberId.toLowerCase().includes(searchLower) ||
            m.memberName.toLowerCase().includes(searchLower) ||
            m.memberEmail.toLowerCase().includes(searchLower) ||
            m.memberPhone.toLowerCase().includes(searchLower);
        } else if (filters.searchFilter === 'memberId') {
          searchMatch = m.memberId.toLowerCase().includes(searchLower);
        } else if (filters.searchFilter === 'memberName') {
          searchMatch = m.memberName.toLowerCase().includes(searchLower);
        } else if (filters.searchFilter === 'memberEmail') {
          searchMatch = m.memberEmail.toLowerCase().includes(searchLower);
        } else if (filters.searchFilter === 'memberPhone') {
          searchMatch = m.memberPhone.toLowerCase().includes(searchLower);
        }

        return searchMatch;
      }),
    [members, filters]
  );

  const total = filteredAll.length;

  const filtered = useMemo(() => {
    const start = page * rowsPerPage;
    // 순번 부여를 위해 인덱스 추가
    return filteredAll.slice(start, start + rowsPerPage).map((member, index) => ({
      ...member,
      order: start + index + 1, // 순번 추가
    }));
  }, [filteredAll, page, rowsPerPage]);

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
    filtered,
    total,
    counts,
  };
}

