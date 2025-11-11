import type { Member } from 'src/sections/Organization/types/member';
import { useMemo, useState, useCallback } from 'react';

// ----------------------------------------------------------------------

export type OrganizationFilters = {
  q1: string;
  q2: string;
  q3: string;
};

export type DivisionType =
  | 'all'
  | 'operator'
  | 'member'
  | 'distributor'
  | 'agency'
  | 'dealer'
  | 'nonmember';

export type UseOrganizationResult = {
  tab: string;
  onChangeTab: (value: string) => void;
  division: DivisionType;
  onChangeDivision: (value: DivisionType) => void;
  filters: OrganizationFilters;
  onChangeFilters: (partial: Partial<OrganizationFilters>) => void;
  countAll: number;
  countActive: number;
  countInactive: number;
  searchField: 'all' | 'orgName' | 'manager';
  setSearchField: (v: 'all' | 'orgName' | 'manager') => void;
  page: number;
  rowsPerPage: number;
  onChangePage: (page: number) => void;
  onChangeRowsPerPage: (rows: number) => void;
  filtered: Member[];
  total: number;
};

export function useOrganization(members: Member[]): UseOrganizationResult {
  const [tab, setTab] = useState<string>('all');
  const [division, setDivision] = useState<DivisionType>('all');
  const [filters, setFilters] = useState<OrganizationFilters>({ q1: '', q2: '', q3: '' });
  const [searchField, setSearchField] = useState<'all' | 'orgName' | 'manager'>('all');
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);

  const onChangeTab = useCallback((value: string) => {
    setTab(value);
    setPage(0);
  }, []);

  const onChangeDivision = useCallback((value: DivisionType) => {
    setDivision(value);
    setPage(0);
  }, []);

  const onChangeFilters = useCallback((partial: Partial<OrganizationFilters>) => {
    setFilters((prev) => ({ ...prev, ...partial }));
    setPage(0);
  }, []);

  const onChangePage = useCallback((next: number) => {
    setPage(next);
  }, []);

  const onChangeRowsPerPage = useCallback((rows: number) => {
    setRowsPerPage(rows);
    setPage(0);
  }, []);

  const filteredAll = useMemo(
    () =>
      members.filter((m) => {
        // Tab 필터링: 전체, 활성, 비활성만 필터링 (pending, blocked 제외)
        const byTab =
          tab === 'all'
            ? m.memberStatus === 'active' || m.memberStatus === 'inactive'
            : tab === 'active'
              ? m.memberStatus === 'active'
              : tab === 'inactive'
                ? m.memberStatus === 'inactive'
                : false;

        // Tab 필터링에서 걸러진 항목만 다음 필터링 진행
        if (!byTab) return false;

        const query = (text: string) =>
          text.toLowerCase().includes((filters.q2 || '').toLowerCase());
        const fieldMatch =
          searchField === 'all'
            ? [m.memberName, m.memberNameOrg, m.memberPhone, m.memberEmail, m.memberAddress].some(
                (s) => s && query(s)
              )
            : searchField === 'orgName'
              ? query(String(m.memberNameOrg ?? ''))
              : searchField === 'manager'
                ? query(String(m.memberName ?? ''))
                : true;
        const t1 = filters.q1 ? `${m.memberStatus}`.includes(filters.q1) : true;
        const t3 = filters.q3 ? `${m.memberStatus}`.includes(filters.q3) : true;

        // 구분 필터링: Tab 필터링 이후에 적용
        // division === 'all'이면 모든 구분 통과
        // division이 특정 값이면 해당 구분만 통과
        const byDivision =
          division === 'all'
            ? true
            : division === 'operator'
              ? m.memberRole === 'operator' || m.memberRole === 'admin'
              : division === 'member'
                ? m.memberRole === 'member'
                : division === 'distributor'
                  ? m.memberRole === 'distributor'
                  : division === 'agency'
                    ? m.memberRole === 'agency'
                    : division === 'dealer'
                      ? m.memberRole === 'dealer'
                      : division === 'nonmember'
                        ? m.memberStatus === 'inactive' || !m.memberRole
                        : true;

        return fieldMatch && t1 && t3 && byDivision;
      }),
    [members, filters, searchField, tab, division]
  );

  const total = filteredAll.length;

  // 전체 카운트는 활성 + 비활성만 카운트 (pending, blocked 제외)
  const countActive = members.filter((m) => m.memberStatus === 'active').length;
  const countInactive = members.filter((m) => m.memberStatus === 'inactive').length;
  const countAll = countActive + countInactive;

  const filtered = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredAll.slice(start, start + rowsPerPage);
  }, [filteredAll, page, rowsPerPage]);

  return {
    tab,
    onChangeTab,
    division,
    onChangeDivision,
    filters,
    onChangeFilters,
    countAll,
    countActive,
    countInactive,
    searchField,
    setSearchField,
    page,
    rowsPerPage,
    onChangePage,
    onChangeRowsPerPage,
    filtered,
    total,
  };
}
