import type { EducationReport } from 'src/_mock/_education-report';
import { useMemo, useState, useCallback } from 'react';

// ----------------------------------------------------------------------

export type EducationReportFilters = {
  role: string;
  searchFilter: string;
  searchValue: string;
};

export type UseEducationReportResult = {
  filters: EducationReportFilters;
  onChangeRole: (value: string) => void;
  onChangeSearchFilter: (value: string) => void;
  onChangeSearchValue: (value: string) => void;
  page: number;
  rowsPerPage: number;
  onChangePage: (page: number) => void;
  onChangeRowsPerPage: (rows: number) => void;
  selectedIds: string[];
  onSelectAll: (checked: boolean) => void;
  onSelectRow: (id: string, checked: boolean) => void;
  filtered: EducationReport[];
  total: number;
};

export function useEducationReport(
  reports: EducationReport[]
): UseEducationReportResult {
  const [filters, setFilters] = useState<EducationReportFilters>({
    role: 'all',
    searchFilter: 'all',
    searchValue: '',
  });
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

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

  const filteredAll = useMemo(
    () =>
      reports.filter((r) => {
        // 역할 필터
        const roleMatch = filters.role === 'all' || r.role === filters.role;

        // 검색 필터
        if (!filters.searchValue) {
          return roleMatch;
        }

        const searchLower = filters.searchValue.toLowerCase();
        let searchMatch = false;

        if (filters.searchFilter === 'all') {
          searchMatch =
            r.organizationName.toLowerCase().includes(searchLower) ||
            r.name.toLowerCase().includes(searchLower) ||
            r.department.toLowerCase().includes(searchLower) ||
            r.role.toLowerCase().includes(searchLower);
        } else if (filters.searchFilter === 'organizationName') {
          searchMatch = r.organizationName.toLowerCase().includes(searchLower);
        } else if (filters.searchFilter === 'name') {
          searchMatch = r.name.toLowerCase().includes(searchLower);
        } else if (filters.searchFilter === 'department') {
          searchMatch = r.department.toLowerCase().includes(searchLower);
        } else if (filters.searchFilter === 'role') {
          searchMatch = r.role.toLowerCase().includes(searchLower);
        }

        return roleMatch && searchMatch;
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
    onChangeRole,
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
  };
}

