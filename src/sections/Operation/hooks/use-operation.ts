import type { RiskReport } from 'src/_mock/_risk-report';
import { useMemo, useState, useCallback } from 'react';
import type { Dayjs } from 'dayjs';

// ----------------------------------------------------------------------

export type UseOperationResult = {
  tab: string;
  onChangeTab: (value: string) => void;
  startDate: Dayjs | null;
  onChangeStartDate: (value: Dayjs | null) => void;
  endDate: Dayjs | null;
  onChangeEndDate: (value: Dayjs | null) => void;
  countAll: number;
  countConfirmed: number;
  countUnconfirmed: number;
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
};

export function useOperation(reports: RiskReport[]): UseOperationResult {
  const [tab, setTab] = useState<string>('all');
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);
  const [searchField, setSearchField] = useState<'reporter' | 'author' | ''>('');
  const [searchValue, setSearchValue] = useState<string>('');
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);

  const onChangeTab = useCallback((value: string) => {
    setTab(value);
    setPage(0);
  }, []);

  const onChangeStartDate = useCallback((value: Dayjs | null) => {
    setStartDate(value);
    setPage(0);
  }, []);

  const onChangeEndDate = useCallback((value: Dayjs | null) => {
    setEndDate(value);
    setPage(0);
  }, []);

  const onChangeSearchValue = useCallback((value: string) => {
    setSearchValue(value);
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
        // 검색 필드 매칭
        const fieldMatch =
          searchValue && searchField
            ? String(r[searchField] ?? '').toLowerCase().includes(searchValue.toLowerCase())
            : true;

        // 날짜 필터링
        const dateMatch =
          startDate && endDate
            ? (() => {
                const reportDate = new Date(r.registeredAt);
                const start = startDate.toDate();
                const end = endDate.toDate();
                return reportDate >= start && reportDate <= end;
              })()
            : true;

        // 탭 필터링
        const byTab =
          tab === 'all'
            ? true
            : r.status === (tab === 'confirmed' ? 'confirmed' : 'unconfirmed');

        return fieldMatch && dateMatch && byTab;
      }),
    [reports, searchField, searchValue, startDate, endDate, tab]
  );

  const total = filteredAll.length;

  const countAll = reports.length;
  const countConfirmed = reports.filter((r) => r.status === 'confirmed').length;
  const countUnconfirmed = reports.filter((r) => r.status === 'unconfirmed').length;

  const filtered = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredAll.slice(start, start + rowsPerPage);
  }, [filteredAll, page, rowsPerPage]);

  return {
    tab,
    onChangeTab,
    startDate,
    onChangeStartDate,
    endDate,
    onChangeEndDate,
    countAll,
    countConfirmed,
    countUnconfirmed,
    searchField,
    setSearchField,
    searchValue,
    onChangeSearchValue,
    page,
    rowsPerPage,
    onChangePage,
    onChangeRowsPerPage,
    filtered,
    total,
  };
}
