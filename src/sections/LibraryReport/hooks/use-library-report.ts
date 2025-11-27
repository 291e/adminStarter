import { useState, useCallback, useMemo } from 'react';
import type { Dayjs } from 'dayjs';
import type { LibraryReport } from 'src/services/library-report/library-report.types';

export type LibraryReportFilters = {
  tab: 'all' | 'active' | 'inactive';
  category: string;
  startDate: string | null;
  endDate: string | null;
  searchFilter: string;
  searchValue: string;
};

export type LibraryReportCounts = {
  all: number;
  active: number;
  inactive: number;
};

export type UseLibraryReportResult = {
  filters: LibraryReportFilters;
  onChangeTab: (value: 'all' | 'active' | 'inactive') => void;
  onChangeCategory: (value: string) => void;
  onChangeStartDate: (value: Dayjs | null) => void;
  onChangeEndDate: (value: Dayjs | null) => void;
  onChangeSearchFilter: (value: string) => void;
  onChangeSearchValue: (value: string) => void;
  page: number;
  rowsPerPage: number;
  onChangePage: (page: number) => void;
  onChangeRowsPerPage: (rows: number) => void;
  selectedIds: string[];
  onSelectAll: (
    rows: Array<{ id?: string; libraryReportIdx?: number | null }>,
    checked: boolean
  ) => void;
  onSelectRow: (id: string, checked: boolean) => void;
  counts: LibraryReportCounts;
  resetSelection: () => void;
  // 필터링 및 페이지네이션 처리된 데이터
  filteredRows: LibraryReport[];
  paginatedRows: LibraryReport[];
  totalCount: number;
};

export function useLibraryReport(
  allRows: LibraryReport[] = []
): UseLibraryReportResult {
  const [filters, setFilters] = useState<LibraryReportFilters>({
    tab: 'all',
    category: 'all',
    startDate: null,
    endDate: null,
    searchFilter: 'all',
    searchValue: '',
  });
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const onChangeTab = useCallback((value: 'all' | 'active' | 'inactive') => {
    setFilters((prev) => ({ ...prev, tab: value }));
    setPage(0);
  }, []);

  const onChangeCategory = useCallback((value: string) => {
    setFilters((prev) => ({ ...prev, category: value }));
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

  const onSelectAll = useCallback(
    (
      rows: Array<{ id?: string; libraryReportIdx?: number | null }>,
      checked: boolean
    ) => {
      if (checked) {
        const ids = rows
          .map((row) => row.id ?? (row.libraryReportIdx !== undefined ? String(row.libraryReportIdx) : null))
          .filter((value): value is string => Boolean(value));
        setSelectedIds(ids);
      } else {
        setSelectedIds([]);
      }
    },
    []
  );

  const onSelectRow = useCallback((id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      if (checked) {
        return [...prev, id];
      }
      return prev.filter((selectedId) => selectedId !== id);
    });
  }, []);

  const resetSelection = useCallback(() => {
    setSelectedIds([]);
  }, []);

  // 탭별 필터링
  const filteredRows = useMemo(() => {
    if (filters.tab === 'all') {
      return allRows;
    }
    return allRows.filter((row) => {
      const status = row.status ?? (row.isActive === 0 ? 'inactive' : 'active');
      return status === filters.tab;
    });
  }, [allRows, filters.tab]);

  // 페이지네이션 적용
  const paginatedRows = useMemo(() => {
    const start = page * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredRows.slice(start, end);
  }, [filteredRows, page, rowsPerPage]);

  // 필터링된 전체 개수
  const totalCount = useMemo(() => filteredRows.length, [filteredRows]);

  // 카운트 계산
  const counts = useMemo<LibraryReportCounts>(() => {
    const activeCount = allRows.filter((row) => {
      const status = row.status ?? (row.isActive === 0 ? 'inactive' : 'active');
      return status === 'active';
    }).length;
    const inactiveCount = allRows.filter((row) => {
      const status = row.status ?? (row.isActive === 0 ? 'inactive' : 'active');
      return status === 'inactive';
    }).length;
    return {
      all: allRows.length,
      active: activeCount,
      inactive: inactiveCount,
    };
  }, [allRows]);

  return {
    filters,
    onChangeTab,
    onChangeCategory,
    onChangeStartDate,
    onChangeEndDate,
    onChangeSearchFilter,
    onChangeSearchValue,
    page,
    rowsPerPage,
    onChangePage,
    onChangeRowsPerPage,
    selectedIds,
    onSelectAll,
    onSelectRow,
    counts,
    resetSelection,
    filteredRows,
    paginatedRows,
    totalCount,
  };
}

