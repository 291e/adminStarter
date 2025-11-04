import type { Member } from 'src/_mock/_member';
import { useMemo, useState, useCallback } from 'react';

// ----------------------------------------------------------------------

export type OrganizationFilters = {
  q1: string;
  q2: string;
  q3: string;
};

export type UseOrganizationResult = {
  tab: string;
  onChangeTab: (value: string) => void;
  filters: OrganizationFilters;
  onChangeFilters: (partial: Partial<OrganizationFilters>) => void;
  countAll: number;
  countActive: number;
  countInactive: number;
  searchField: 'all' | 'orgName' | 'name' | 'phone' | 'email' | 'address';
  setSearchField: (v: 'all' | 'orgName' | 'name' | 'phone' | 'email' | 'address') => void;
  page: number;
  rowsPerPage: number;
  onChangePage: (page: number) => void;
  onChangeRowsPerPage: (rows: number) => void;
  filtered: Member[];
  total: number;
};

export function useOrganization(members: Member[]): UseOrganizationResult {
  const [tab, setTab] = useState<string>('all');
  const [filters, setFilters] = useState<OrganizationFilters>({ q1: '', q2: '', q3: '' });
  const [searchField, setSearchField] = useState<
    'all' | 'orgName' | 'name' | 'phone' | 'email' | 'address'
  >('all');
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);

  const onChangeTab = useCallback((value: string) => {
    setTab(value);
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
        const query = (text: string) =>
          text.toLowerCase().includes((filters.q2 || '').toLowerCase());
        const fieldMatch =
          searchField === 'all'
            ? [m.memberName, m.memberNameOrg, m.memberPhone, m.memberEmail, m.memberAddress].some(
                (s) => s && query(s)
              )
            : query(String(m[searchField as keyof Member] ?? ''));
        const t1 = filters.q1 ? `${m.memberStatus}`.includes(filters.q1) : true;
        const t3 = filters.q3 ? `${m.memberStatus}`.includes(filters.q3) : true;
        const byTab = tab === 'all' ? true : m.memberStatus === (tab as 'active' | 'inactive');
        return fieldMatch && t1 && t3 && byTab;
      }),
    [members, filters, tab]
  );

  const total = filteredAll.length;

  const countAll = members.length;
  const countActive = members.filter((m) => m.memberStatus === 'active').length;
  const countInactive = members.filter((m) => m.memberStatus === 'inactive').length;

  const filtered = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredAll.slice(start, start + rowsPerPage);
  }, [filteredAll, page, rowsPerPage]);

  return {
    tab,
    onChangeTab,
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
