import { useState, useMemo } from 'react';
import dayjs, { type Dayjs } from 'dayjs';

import type { Checklist } from 'src/_mock/_checklist';

// ----------------------------------------------------------------------

export type ChecklistFilters = {
  status: string; // 'all' | 'active' | 'inactive'
  startDate: Dayjs | null;
  endDate: Dayjs | null;
  searchFilter: string; // 'all' | 'highRiskWork' | 'disasterFactors'
  searchValue: string;
};

export type UseChecklistResult = {
  filtered: Checklist[];
  total: number;
  page: number;
  rowsPerPage: number;
  onChangePage: (event: unknown, newPage: number) => void;
  onChangeRowsPerPage: (event: React.ChangeEvent<HTMLInputElement>) => void;
  filters: ChecklistFilters;
  onChangeStatus: (value: string) => void;
  onChangeStartDate: (value: Dayjs | null) => void;
  onChangeEndDate: (value: Dayjs | null) => void;
  onChangeSearchFilter: (value: string) => void;
  onChangeSearchValue: (value: string) => void;
};

// ----------------------------------------------------------------------

export function useChecklist(allData: Checklist[], industry: string): UseChecklistResult {
  const [filters, setFilters] = useState<ChecklistFilters>({
    status: 'all',
    startDate: null,
    endDate: null,
    searchFilter: 'all',
    searchValue: '',
  });

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // 업종별 필터링
  const filteredByIndustry = useMemo(() => {
    if (industry === 'all') return allData;
    return allData.filter((item) => item.industry === industry);
  }, [allData, industry]);

  // 필터 적용
  const filteredAll = useMemo(() => {
    let result = [...filteredByIndustry];

    // 상태 필터
    if (filters.status !== 'all') {
      result = result.filter((item) => item.status === filters.status);
    }

    // 날짜 필터
    if (filters.startDate) {
      result = result.filter((item) => {
        const itemDate = dayjs(item.registrationDate);
        return itemDate.isAfter(filters.startDate, 'day');
      });
    }

    if (filters.endDate) {
      result = result.filter((item) => {
        const itemDate = dayjs(item.registrationDate);
        return itemDate.isBefore(filters.endDate, 'day');
      });
    }

    // 검색 필터
    if (filters.searchValue.trim()) {
      const searchLower = filters.searchValue.toLowerCase();
      result = result.filter((item) => {
        if (filters.searchFilter === 'all') {
          return (
            item.highRiskWork.toLowerCase().includes(searchLower) ||
            item.disasterFactors.some((factor) => factor.toLowerCase().includes(searchLower))
          );
        }
        if (filters.searchFilter === 'highRiskWork') {
          return item.highRiskWork.toLowerCase().includes(searchLower);
        }
        if (filters.searchFilter === 'disasterFactors') {
          return item.disasterFactors.some((factor) => factor.toLowerCase().includes(searchLower));
        }
        return true;
      });
    }

    return result;
  }, [filteredByIndustry, filters]);

  // 페이지네이션 적용
  const filtered = useMemo(() => {
    const start = page * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredAll.slice(start, end);
  }, [filteredAll, page, rowsPerPage]);

  const onChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const onChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const onChangeStatus = (value: string) => {
    setFilters((prev) => ({ ...prev, status: value }));
    setPage(0);
  };

  const onChangeStartDate = (value: Dayjs | null) => {
    setFilters((prev) => ({ ...prev, startDate: value }));
    setPage(0);
  };

  const onChangeEndDate = (value: Dayjs | null) => {
    setFilters((prev) => ({ ...prev, endDate: value }));
    setPage(0);
  };

  const onChangeSearchFilter = (value: string) => {
    setFilters((prev) => ({ ...prev, searchFilter: value }));
    setPage(0);
  };

  const onChangeSearchValue = (value: string) => {
    setFilters((prev) => ({ ...prev, searchValue: value }));
    setPage(0);
  };

  return {
    filtered,
    total: filteredAll.length,
    page,
    rowsPerPage,
    onChangePage,
    onChangeRowsPerPage,
    filters,
    onChangeStatus,
    onChangeStartDate,
    onChangeEndDate,
    onChangeSearchFilter,
    onChangeSearchValue,
  };
}
