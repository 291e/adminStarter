import { useMemo, useState, useCallback } from 'react';

import type { ApiSetting } from 'src/_mock/_api-setting';

// ----------------------------------------------------------------------

export type ApiSettingFilters = {
  status: string;
  searchFilter: string;
  searchValue: string;
};

export type UseApiSettingResult = {
  filters: ApiSettingFilters;
  onChangeStatus: (value: string) => void;
  onChangeSearchFilter: (value: string) => void;
  onChangeSearchValue: (value: string) => void;
  page: number;
  rowsPerPage: number;
  onChangePage: (page: number) => void;
  onChangeRowsPerPage: (rows: number) => void;
  filtered: ApiSetting[];
  total: number;
};

export function useApiSetting(apis: ApiSetting[]): UseApiSettingResult {
  const [filters, setFilters] = useState<ApiSettingFilters>({
    status: 'all',
    searchFilter: 'all',
    searchValue: '',
  });
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);

  const onChangeStatus = useCallback((value: string) => {
    setFilters((prev) => ({ ...prev, status: value }));
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

  const filteredAll = useMemo(
    () =>
      apis.filter((api) => {
        // 상태 필터
        if (filters.status === '활성' && api.status !== 'active') {
          return false;
        }
        if (filters.status === '비활성' && api.status !== 'inactive') {
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
            api.name.toLowerCase().includes(searchLower) ||
            api.provider.toLowerCase().includes(searchLower);
        } else if (filters.searchFilter === 'API 이름') {
          searchMatch = api.name.toLowerCase().includes(searchLower);
        } else if (filters.searchFilter === '제공기관') {
          searchMatch = api.provider.toLowerCase().includes(searchLower);
        }

        return searchMatch;
      }),
    [apis, filters]
  );

  const total = filteredAll.length;

  const filtered = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredAll.slice(start, start + rowsPerPage);
  }, [filteredAll, page, rowsPerPage]);

  return {
    filters,
    onChangeStatus,
    onChangeSearchFilter,
    onChangeSearchValue,
    page,
    rowsPerPage,
    onChangePage,
    onChangeRowsPerPage,
    filtered,
    total,
  };
}

