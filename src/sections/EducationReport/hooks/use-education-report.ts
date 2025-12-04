import type { EducationReport } from 'src/services/education-report/education-report.types';
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

export function useEducationReport(reports: EducationReport[]): UseEducationReportResult {
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
        // 역할 필터 (memberInformation.memberRole 우선 사용)
        const role = r.memberInformation?.memberRole || r.role || '';
        const roleMatch = filters.role === 'all' || role === filters.role;

        // 검색 필터
        if (!filters.searchValue) {
          return roleMatch;
        }

        const searchLower = filters.searchValue.toLowerCase();
        let searchMatch = false;

        // memberInformation과 companyInformation 우선 사용, 없으면 하위 호환 필드 사용
        const memberInfo = r.memberInformation;
        const companyInfo = r.companyInformation;
        const organizationName = companyInfo?.companyName || r.organizationName || '';
        const memberName = memberInfo?.memberName || r.name || '';
        const department = memberInfo?.department || r.department || '';
        const memberRole = memberInfo?.memberRole || r.role || '';

        if (filters.searchFilter === 'all') {
          searchMatch =
            organizationName.toLowerCase().includes(searchLower) ||
            memberName.toLowerCase().includes(searchLower) ||
            department.toLowerCase().includes(searchLower) ||
            memberRole.toLowerCase().includes(searchLower);
        } else if (filters.searchFilter === 'organizationName') {
          searchMatch = organizationName.toLowerCase().includes(searchLower);
        } else if (filters.searchFilter === 'name') {
          searchMatch = memberName.toLowerCase().includes(searchLower);
        } else if (filters.searchFilter === 'department') {
          searchMatch = department.toLowerCase().includes(searchLower);
        } else if (filters.searchFilter === 'role') {
          searchMatch = memberRole.toLowerCase().includes(searchLower);
        }

        return roleMatch && searchMatch;
      }),
    [reports, filters]
  );

  const onSelectAll = useCallback(
    (checked: boolean) => {
      if (checked) {
        setSelectedIds(
          filteredAll
            .map((r) =>
              String(r.educationReportIdx || r.educationReportId || r.id || r.memberIdx || '')
            )
            .filter((id): id is string => !!id)
        );
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
