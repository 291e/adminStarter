import { useMemo, useState, useCallback, useEffect } from 'react';
import dayjs, { type Dayjs } from 'dayjs';

import type { CodeSetting } from 'src/services/code-setting/code-setting.types';

// ----------------------------------------------------------------------

export type CodeSettingFilters = {
  status: string;
  startDate: Dayjs | null;
  endDate: Dayjs | null;
  searchFilter: string;
  searchValue: string;
  categoryFilter?: string; // 유해인자용 카테고리 필터
};

export type UseCodeSettingResult = {
  filters: CodeSettingFilters;
  onChangeStatus: (value: string) => void;
  onChangeStartDate: (value: Dayjs | null) => void;
  onChangeEndDate: (value: Dayjs | null) => void;
  onChangeSearchFilter: (value: string) => void;
  onChangeSearchValue: (value: string) => void;
  onChangeCategoryFilter?: (value: string) => void;
  page: number;
  rowsPerPage: number;
  onChangePage: (page: number) => void;
  onChangeRowsPerPage: (rows: number) => void;
  filtered: CodeSetting[];
  paginated: CodeSetting[];
  total: number;
};

export function useCodeSetting(codes: CodeSetting[], category: string): UseCodeSettingResult {
  const [filters, setFilters] = useState<CodeSettingFilters>({
    status: 'all',
    startDate: null,
    endDate: null,
    searchFilter: 'all',
    searchValue: '',
    categoryFilter: 'all',
  });
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);

  const onChangeStatus = useCallback((value: string) => {
    setFilters((prev) => ({ ...prev, status: value }));
    setPage(0);
  }, []);

  const onChangeStartDate = useCallback((value: Dayjs | null) => {
    setFilters((prev) => ({ ...prev, startDate: value }));
    setPage(0);
  }, []);

  const onChangeEndDate = useCallback((value: Dayjs | null) => {
    setFilters((prev) => ({ ...prev, endDate: value }));
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

  const onChangeCategoryFilter = useCallback((value: string) => {
    setFilters((prev) => ({ ...prev, categoryFilter: value }));
    setPage(0);
  }, []);

  const onChangePage = useCallback((next: number) => {
    setPage(next);
  }, []);

  const onChangeRowsPerPage = useCallback((rows: number) => {
    setRowsPerPage(rows);
    setPage(0);
  }, []);

  // 카테고리 변경 시 필터 초기화
  useEffect(() => {
    setFilters({
      status: 'all',
      startDate: null,
      endDate: null,
      searchFilter: 'all',
      searchValue: '',
      categoryFilter: 'all',
    });
    setPage(0);
  }, [category]);

  // 필터링
  const filteredAll = useMemo(
    () =>
      codes.filter((c) => {
        // 카테고리 타입 필터 (machine/hazard)
        const categoryTypeUpper = c.categoryType?.toUpperCase();
        if (category === 'machine' && categoryTypeUpper !== 'MACHINE') {
          return false;
        }
        if (category === 'hazard' && categoryTypeUpper !== 'HAZARD') {
          return false;
        }

        // 상태 필터 (대소문자 모두 지원)
        if (filters.status && filters.status !== 'all') {
          const statusUpper = c.status?.toUpperCase();
          if (filters.status === '활성' && statusUpper !== 'ACTIVE') {
            return false;
          }
          if (filters.status === '비활성' && statusUpper !== 'INACTIVE') {
            return false;
          }
        }
        // 유해인자 카테고리 필터
        if (category === 'hazard' && filters.categoryFilter && filters.categoryFilter !== 'all') {
          if (c.codeSettingHazardCategoryInformation?.name !== filters.categoryFilter) {
            return false;
          }
        }

        // 날짜 필터
        const dateToCompare = c.updateAt || c.createAt;
        if (filters.startDate && dateToCompare) {
          const compareDate = dayjs(dateToCompare);
          if (compareDate.isBefore(filters.startDate, 'day')) {
            return false;
          }
        }
        if (filters.endDate && dateToCompare) {
          const compareDate = dayjs(dateToCompare);
          if (compareDate.isAfter(filters.endDate, 'day')) {
            return false;
          }
        }

        // 검색 필터
        if (!filters.searchValue) {
          return true;
        }

        const searchLower = filters.searchValue.toLowerCase();
        let searchMatch = false;

        if (!filters.searchFilter || filters.searchFilter === 'all') {
          // 검색어 필터가 없거나 'all'이면 코드와 이름 모두 검색
          searchMatch =
            c.code.toLowerCase().includes(searchLower) ||
            c.name.toLowerCase().includes(searchLower);
        } else if (
          filters.searchFilter === '기계·설비 코드' ||
          filters.searchFilter === '유해인자 코드'
        ) {
          searchMatch = c.code.toLowerCase().includes(searchLower);
        } else if (
          filters.searchFilter === '기계·설비명' ||
          filters.searchFilter === '유해인자명'
        ) {
          searchMatch = c.name.toLowerCase().includes(searchLower);
        }

        return searchMatch;
      }),
    [codes, category, filters]
  );

  // 페이지네이션 적용
  const paginated = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredAll.slice(start, start + rowsPerPage);
  }, [filteredAll, page, rowsPerPage]);

  const total = filteredAll.length;

  return {
    filters,
    onChangeStatus,
    onChangeStartDate,
    onChangeEndDate,
    onChangeSearchFilter,
    onChangeSearchValue,
    onChangeCategoryFilter: category === 'hazard' ? onChangeCategoryFilter : undefined,
    page,
    rowsPerPage,
    onChangePage,
    onChangeRowsPerPage,
    filtered: filteredAll,
    paginated,
    total,
  };
}
