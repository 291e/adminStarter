import { useMemo, useState, useCallback } from 'react';

import type { ServiceSetting } from 'src/_mock/_service-setting';

// ----------------------------------------------------------------------

export type ServiceSettingFilters = {
  status: string;
  searchFilter: string;
  searchValue: string;
};

export type UseServiceSettingResult = {
  filters: ServiceSettingFilters;
  onChangeStatus: (value: string) => void;
  onChangeSearchFilter: (value: string) => void;
  onChangeSearchValue: (value: string) => void;
  page: number;
  rowsPerPage: number;
  onChangePage: (page: number) => void;
  onChangeRowsPerPage: (rows: number) => void;
  filtered: ServiceSetting[];
  total: number;
};

export function useServiceSetting(services: ServiceSetting[]): UseServiceSettingResult {
  const [filters, setFilters] = useState<ServiceSettingFilters>({
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
      services.filter((s) => {
        // 상태 필터
        if (filters.status === '활성' && s.status !== 'active') {
          return false;
        }
        if (filters.status === '비활성' && s.status !== 'inactive') {
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
            s.serviceName.toLowerCase().includes(searchLower) ||
            s.servicePeriod.toLowerCase().includes(searchLower);
        } else if (filters.searchFilter === '서비스명') {
          searchMatch = s.serviceName.toLowerCase().includes(searchLower);
        } else if (filters.searchFilter === '서비스 기간') {
          searchMatch = s.servicePeriod.toLowerCase().includes(searchLower);
        }

        return searchMatch;
      }),
    [services, filters]
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

