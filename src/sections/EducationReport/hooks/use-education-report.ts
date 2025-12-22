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
        // department가 null이거나 undefined일 수 있으므로 명시적으로 처리
        const department = memberInfo?.department ?? r.department ?? '';
        const memberRole = memberInfo?.memberRole || r.role || '';

        // 디버깅: 소속팀 필터 검색 시 로그
        if (import.meta.env.DEV && filters.searchFilter === 'department' && filters.searchValue) {
          console.log('🔍 [useEducationReport] 소속팀 검색:', {
            searchValue: filters.searchValue,
            department,
            memberInfo: memberInfo?.department,
            rowDepartment: r.department,
            match: department.toLowerCase().includes(searchLower),
          });
        }

        if (filters.searchFilter === 'all') {
          // 전체 검색: 조직명, 이름, 소속팀, 역할 모두 검색
          searchMatch =
            organizationName.toLowerCase().includes(searchLower) ||
            memberName.toLowerCase().includes(searchLower) ||
            (Boolean(department) && department.toLowerCase().includes(searchLower)) ||
            memberRole.toLowerCase().includes(searchLower);
        } else if (filters.searchFilter === 'name') {
          // 이름으로 검색
          searchMatch = memberName.toLowerCase().includes(searchLower);
        } else if (filters.searchFilter === 'department') {
          // 소속팀으로 검색 (조직명이 아님)
          // department가 빈 문자열이 아닐 때만 검색
          searchMatch = Boolean(department) && department.toLowerCase().includes(searchLower);
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
