import type { LibraryReport } from 'src/_mock/_library-report';
import { useMemo, useState, useCallback } from 'react';
import type { Dayjs } from 'dayjs';
import type { CategoryItem } from '../components/CategorySettingsModal';

// ----------------------------------------------------------------------

export type LibraryReportFilters = {
  tab: 'all' | 'active' | 'inactive';
  category: string;
  startDate: string | null;
  endDate: string | null;
  searchFilter: string;
  searchValue: string;
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
  onSelectAll: (checked: boolean) => void;
  onSelectRow: (id: string, checked: boolean) => void;
  filtered: LibraryReport[];
  total: number;
  counts: {
    all: number;
    active: number;
    inactive: number;
  };
};

export function useLibraryReport(
  reports: LibraryReport[],
  categories: CategoryItem[] = []
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

  const counts = useMemo(() => {
    const all = reports.length;
    const active = reports.filter((r) => r.status === 'active').length;
    const inactive = reports.filter((r) => r.status === 'inactive').length;
    return { all, active, inactive };
  }, [reports]);

  const filteredAll = useMemo(
    () =>
      reports.filter((r) => {
        // 탭 필터
        if (filters.tab === 'active' && r.status !== 'active') {
          return false;
        }
        if (filters.tab === 'inactive' && r.status !== 'inactive') {
          return false;
        }

        // 카테고리 필터
        if (filters.category !== 'all') {
          // 활성화된 카테고리 중에서만 필터링
          const activeCategoryNames = categories.filter((cat) => cat.isActive).map((cat) => cat.name);
          if (!activeCategoryNames.includes(filters.category) || r.category !== filters.category) {
            return false;
          }
        } else {
          // '전체' 선택 시 활성화된 카테고리만 표시
          const activeCategoryNames = categories.filter((cat) => cat.isActive).map((cat) => cat.name);
          if (activeCategoryNames.length > 0 && !activeCategoryNames.includes(r.category)) {
            return false;
          }
        }

        // 날짜 필터
        if (filters.startDate) {
          const regDate = r.registrationDate.split(' ')[0]; // YYYY-MM-DD 부분만 추출
          if (regDate < filters.startDate) {
            return false;
          }
        }
        if (filters.endDate) {
          const regDate = r.registrationDate.split(' ')[0];
          if (regDate > filters.endDate) {
            return false;
          }
        }

        // 검색 필터
        if (!filters.searchValue) {
          return true;
        }

        const searchLower = filters.searchValue.toLowerCase();
        let searchMatch = false;

        if (filters.searchFilter === 'all') {
          searchMatch =
            r.organizationName.toLowerCase().includes(searchLower) ||
            r.category.toLowerCase().includes(searchLower) ||
            r.title.toLowerCase().includes(searchLower);
        } else if (filters.searchFilter === 'organizationName') {
          searchMatch = r.organizationName.toLowerCase().includes(searchLower);
        } else if (filters.searchFilter === 'category') {
          searchMatch = r.category.toLowerCase().includes(searchLower);
        } else if (filters.searchFilter === 'title') {
          searchMatch = r.title.toLowerCase().includes(searchLower);
        }

        return searchMatch;
      }),
    [reports, filters]
  );

  const onSelectAll = useCallback(
    (checked: boolean) => {
      if (checked) {
        setSelectedIds(filteredAll.map((r) => r.id));
      } else {
        setSelectedIds([]);
      }
    },
    [filteredAll]
  );

  const onSelectRow = useCallback((id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      if (checked) {
        return [...prev, id];
      }
      return prev.filter((selectedId) => selectedId !== id);
    });
  }, []);

  const total = filteredAll.length;

  const filtered = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredAll.slice(start, start + rowsPerPage);
  }, [filteredAll, page, rowsPerPage]);

  return {
    filters,
    onChangeTab,
    onChangeCategory,
    onChangeStartDate: onChangeStartDate,
    onChangeEndDate: onChangeEndDate,
    onChangeSearchFilter,
    onChangeSearchValue,
    page,
    rowsPerPage,
    onChangePage,
    onChangeRowsPerPage,
    selectedIds,
    onSelectAll,
    onSelectRow,
    filtered,
    total,
    counts,
  };
}

