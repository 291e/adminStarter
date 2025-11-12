import type { Member } from 'src/sections/Organization/types/member';
import { useMemo, useState, useCallback } from 'react';
import type { Dayjs } from 'dayjs';

// ----------------------------------------------------------------------

export type OrganizationFilters = {
  startDate: string | null;
  endDate: string | null;
  searchValue: string;
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
  onChangeStartDate: (value: Dayjs | null) => void;
  onChangeEndDate: (value: Dayjs | null) => void;
  onChangeSearchValue: (value: string) => void;
  counts: {
    all: number;
    active: number;
    inactive: number;
  };
  searchField: 'all' | 'orgName' | 'manager';
  onChangeSearchField: (value: 'all' | 'orgName' | 'manager') => void;
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
  const [filters, setFilters] = useState<OrganizationFilters>({
    startDate: null,
    endDate: null,
    searchValue: '',
  });
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

  const onChangeStartDate = useCallback((value: Dayjs | null) => {
    setFilters((prev) => ({ ...prev, startDate: value ? value.format('YYYY-MM-DD') : null }));
    setPage(0);
  }, []);

  const onChangeEndDate = useCallback((value: Dayjs | null) => {
    setFilters((prev) => ({ ...prev, endDate: value ? value.format('YYYY-MM-DD') : null }));
    setPage(0);
  }, []);

  const onChangeSearchValue = useCallback((value: string) => {
    setFilters((prev) => ({ ...prev, searchValue: value }));
    setPage(0);
  }, []);

  const onChangeSearchField = useCallback((value: 'all' | 'orgName' | 'manager') => {
    setSearchField(value);
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

        // 검색 필터
        const query = (text: string) =>
          text.toLowerCase().includes((filters.searchValue || '').toLowerCase());
        const fieldMatch = !filters.searchValue
          ? true
          : searchField === 'all'
            ? [m.memberName, m.memberNameOrg, m.memberPhone, m.memberEmail, m.memberAddress].some(
                (s) => s && query(s)
              )
            : searchField === 'orgName'
              ? query(String(m.memberNameOrg ?? ''))
              : searchField === 'manager'
                ? query(String(m.memberName ?? ''))
                : true;

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

        // 날짜 필터 (등록일 기준으로 필터링, 실제 필드명에 맞게 수정 필요)
        // TODO: 실제 날짜 필드명에 맞게 수정
        const byDate = true; // 임시로 항상 true

        return fieldMatch && byDate && byDivision;
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
    onChangeStartDate,
    onChangeEndDate,
    onChangeSearchValue,
    counts: {
      all: countAll,
      active: countActive,
      inactive: countInactive,
    },
    searchField,
    onChangeSearchField,
    page,
    rowsPerPage,
    onChangePage,
    onChangeRowsPerPage,
    filtered,
    total,
  };
}
