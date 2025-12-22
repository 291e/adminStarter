import { useMemo, useState, useCallback } from 'react';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import type { RiskReport } from 'src/services/operation/operation.types';

// ----------------------------------------------------------------------

export type UseOperationResult = {
  tab: string;
  onChangeTab: (value: string) => void;
  startDate: Dayjs | null;
  onChangeStartDate: (value: Dayjs | null) => void;
  endDate: Dayjs | null;
  onChangeEndDate: (value: Dayjs | null) => void;
  searchField: 'reporter' | 'author' | '';
  setSearchField: (v: 'reporter' | 'author' | '') => void;
  searchValue: string;
  onChangeSearchValue: (value: string) => void;
  page: number;
  rowsPerPage: number;
  onChangePage: (page: number) => void;
  onChangeRowsPerPage: (rows: number) => void;
  filtered: RiskReport[];
  total: number;
  countAll: number;
  countActive: number;
  countInactive: number;
  // API 호출용 파라미터 (전체 데이터 가져오기)
  apiParams: {
    page: number;
    pageSize: number;
  };
};

export function useOperation(allData: RiskReport[] = []): UseOperationResult {
  const [tab, setTab] = useState<string>('all');
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);
  const [searchField, setSearchField] = useState<'reporter' | 'author' | ''>('');
  const [searchValue, setSearchValue] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);

  const onChangeTab = useCallback((value: string) => {
    setTab(value);
    setPage(1);
  }, []);

  const onChangeStartDate = useCallback((value: Dayjs | null) => {
    setStartDate(value);
    setPage(1);
  }, []);

  const onChangeEndDate = useCallback((value: Dayjs | null) => {
    setEndDate(value);
    setPage(1);
  }, []);

  const onChangeSearchValue = useCallback((value: string) => {
    setSearchValue(value);
    setPage(1);
  }, []);

  const onChangePage = useCallback((next: number) => {
    setPage(next);
  }, []);

  const onChangeRowsPerPage = useCallback((rows: number) => {
    setRowsPerPage(rows);
    setPage(1);
  }, []);

  // 필터링된 데이터
  const filtered = useMemo(() => {
    let result = [...allData];

    // 탭 필터 (status)
    if (tab === 'confirmed') {
      result = result.filter((item) => item.status === 'CONFIRMED');
    } else if (tab === 'unconfirmed') {
      result = result.filter((item) => item.status !== 'CONFIRMED');
    }

    // 날짜 필터
    if (startDate) {
      const startDateStr = startDate.format('YYYY-MM-DD');
      result = result.filter((item) => {
        if (!item.registeredAt) return false;
        const itemDate = item.registeredAt.split('T')[0];
        return itemDate >= startDateStr;
      });
    }
    if (endDate) {
      const endDateStr = endDate.format('YYYY-MM-DD');
      result = result.filter((item) => {
        if (!item.registeredAt) return false;
        const itemDate = item.registeredAt.split('T')[0];
        return itemDate <= endDateStr;
      });
    }

    // 검색 필터
    if (searchField && searchValue.trim()) {
      const searchLower = searchValue.trim().toLowerCase();
      result = result.filter((item) => {
        if (searchField === 'reporter') {
          return item.reporterName?.toLowerCase().includes(searchLower) || false;
        }
        if (searchField === 'author') {
          return item.authorName?.toLowerCase().includes(searchLower) || false;
        }
        return true;
      });
    }

    return result;
  }, [allData, tab, startDate, endDate, searchField, searchValue]);

  // 카운트 계산 (전체 데이터 기준)
  const countAll = allData.length;
  const countActive = allData.filter((item) => item.status === 'CONFIRMED').length;
  const countInactive = allData.filter((item) => item.status !== 'CONFIRMED').length;

  // 페이지네이션된 데이터
  const paginatedData = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filtered.slice(start, start + rowsPerPage);
  }, [filtered, page, rowsPerPage]);

  // API 호출용 파라미터 (전체 데이터 가져오기)
  const apiParams = useMemo(
    () => ({
      page: 1,
      pageSize: 1000, // 충분히 큰 값으로 모든 데이터 가져오기
    }),
    []
  );

  return {
    tab,
    onChangeTab,
    startDate,
    onChangeStartDate,
    endDate,
    onChangeEndDate,
    searchField,
    setSearchField,
    searchValue,
    onChangeSearchValue,
    page,
    rowsPerPage,
    onChangePage,
    onChangeRowsPerPage,
    filtered: paginatedData,
    total: filtered.length,
    countAll,
    countActive,
    countInactive,
    apiParams,
  };
}
