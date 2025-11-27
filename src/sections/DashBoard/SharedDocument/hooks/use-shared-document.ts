import { useState, useMemo } from 'react';
import type { Dayjs } from 'dayjs';

import type { SharedDocument } from '../components/Table';
import type { PrioritySetting } from 'src/services/dashboard/dashboard.types';

// ----------------------------------------------------------------------

export type SharedDocumentFilters = {
  tab: 'all' | 'public' | 'private';
  priority: string; // 중요도 labelType (자유 문자열)
  startDate: Dayjs | null;
  endDate: Dayjs | null;
  searchValue: string;
};

export type UseSharedDocumentResult = {
  filters: SharedDocumentFilters;
  onChangeTab: (tab: 'all' | 'public' | 'private') => void;
  onChangePriority: (priority: string) => void;
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

// 레거시 호환성을 위한 영어 중요도 값을 한글 labelType으로 변환하는 매핑 (사용 안 함)
// const PRIORITY_LABEL_MAP: Record<'URGENT' | 'IMPORTANT' | 'REFERENCE', string> = {
//   URGENT: '긴급',
//   IMPORTANT: '중요',
//   REFERENCE: '참고',
// };

export function useSharedDocument(
  allData: SharedDocument[],
  prioritySettings: PrioritySetting[] = [],
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

    // 탭 필터 (공개/비공개) - isPublic: 1=공개, 0=비공개
    if (filters.tab === 'public') {
      result = result.filter((item) => item.isPublic === 1);
    } else if (filters.tab === 'private') {
      result = result.filter((item) => item.isPublic === 0);
    }

    // 중요도 필터
    // filters.priority는 labelType 값
    // item.priorityInformation?.labelType과 비교
    if (filters.priority) {
      result = result.filter(
        (item) => item.priorityInformation?.labelType === filters.priority
      );
    }

    // 날짜 필터 - createAt 사용
    if (filters.startDate) {
      const startDateStr = filters.startDate.format('YYYY-MM-DD');
      result = result.filter((item) => {
        if (!item.createAt) return false;
        const itemDate = item.createAt.split('T')[0];
        return itemDate >= startDateStr;
      });
    }
    if (filters.endDate) {
      const endDateStr = filters.endDate.format('YYYY-MM-DD');
      result = result.filter((item) => {
        if (!item.createAt) return false;
        const itemDate = item.createAt.split('T')[0];
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

  // 카운트 계산 - isPublic: 1=공개, 0=비공개
  const countAll = allData.length;
  const countPublic = allData.filter((item) => item.isPublic === 1).length;
  const countPrivate = allData.filter((item) => item.isPublic === 0).length;

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
