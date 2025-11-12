import { useState, useMemo } from 'react';
import type { Dayjs } from 'dayjs';

import type { SharedDocument } from '../components/Table';

// ----------------------------------------------------------------------

export type SharedDocumentFilters = {
  tab: 'all' | 'public' | 'private';
  priority: 'urgent' | 'important' | 'reference' | '';
  startDate: Dayjs | null;
  endDate: Dayjs | null;
  searchValue: string;
};

export type UseSharedDocumentResult = {
  filters: SharedDocumentFilters;
  onChangeTab: (tab: 'all' | 'public' | 'private') => void;
  onChangePriority: (priority: 'urgent' | 'important' | 'reference' | '') => void;
  onChangeStartDate: (date: Dayjs | null) => void;
  onChangeEndDate: (date: Dayjs | null) => void;
  onChangeSearchValue: (value: string) => void;
  filtered: SharedDocument[];
  total: number;
  page: number;
  rowsPerPage: number;
  onChangePage: (page: number) => void;
  onChangeRowsPerPage: (rowsPerPage: number) => void;
  dense: boolean;
  onChangeDense: (dense: boolean) => void;
  countAll: number;
  countPublic: number;
  countPrivate: number;
};

export function useSharedDocument(
  allData: SharedDocument[],
  initialFilters?: Partial<SharedDocumentFilters>
): UseSharedDocumentResult {
  const [filters, setFilters] = useState<SharedDocumentFilters>({
    tab: 'all',
    priority: '',
    startDate: null,
    endDate: null,
    searchValue: '',
    ...initialFilters,
  });

  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [dense, setDense] = useState(false);

  // 필터링된 데이터
  const filtered = useMemo(() => {
    let result = [...allData];

    // 탭 필터 (공개/비공개)
    if (filters.tab === 'public') {
      result = result.filter((item) => item.status === 'public');
    } else if (filters.tab === 'private') {
      result = result.filter((item) => item.status === 'private');
    }

    // 중요도 필터
    if (filters.priority) {
      result = result.filter((item) => item.priority === filters.priority);
    }

    // 날짜 필터
    if (filters.startDate) {
      const startDateStr = filters.startDate.format('YYYY-MM-DD');
      result = result.filter((item) => {
        const itemDate = item.registeredDate.split(' ')[0];
        return itemDate >= startDateStr;
      });
    }
    if (filters.endDate) {
      const endDateStr = filters.endDate.format('YYYY-MM-DD');
      result = result.filter((item) => {
        const itemDate = item.registeredDate.split(' ')[0];
        return itemDate <= endDateStr;
      });
    }

    // 검색 필터
    if (filters.searchValue) {
      const searchLower = filters.searchValue.toLowerCase();
      result = result.filter((item) => item.documentName.toLowerCase().includes(searchLower));
    }

    return result;
  }, [allData, filters]);

  // 카운트 계산
  const countAll = allData.length;
  const countPublic = allData.filter((item) => item.status === 'public').length;
  const countPrivate = allData.filter((item) => item.status === 'private').length;

  // 페이지네이션된 데이터
  const paginatedData = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filtered.slice(start, start + rowsPerPage);
  }, [filtered, page, rowsPerPage]);

  return {
    filters,
    onChangeTab: (tab) => {
      setFilters((prev) => ({ ...prev, tab }));
      setPage(1);
    },
    onChangePriority: (priority) => {
      setFilters((prev) => ({ ...prev, priority }));
      setPage(1);
    },
    onChangeStartDate: (startDate) => {
      setFilters((prev) => ({ ...prev, startDate }));
      setPage(1);
    },
    onChangeEndDate: (endDate) => {
      setFilters((prev) => ({ ...prev, endDate }));
      setPage(1);
    },
    onChangeSearchValue: (searchValue) => {
      setFilters((prev) => ({ ...prev, searchValue }));
      setPage(1);
    },
    filtered: paginatedData,
    total: filtered.length,
    page,
    rowsPerPage,
    onChangePage: (next) => setPage(next),
    onChangeRowsPerPage: (rows) => {
      setRowsPerPage(rows);
      setPage(1);
    },
    dense,
    onChangeDense: setDense,
    countAll,
    countPublic,
    countPrivate,
  };
}
