import { useMemo, useState, useCallback } from 'react';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import type { RiskReportStatus } from 'src/services/operation/operation.types';

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
  queryParams: {
    status?: RiskReportStatus;
    searchKey?: string;
    searchValue?: string;
    startDate?: string;
    endDate?: string;
    page: number;
    pageSize: number;
  };
};

export function useOperation(): UseOperationResult {
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

  const mappedStatus = useMemo<RiskReportStatus | undefined>(() => {
    if (tab === 'confirmed') return 'CONFIRMED';
    if (tab === 'unconfirmed') return 'UNCONFIRMED';
    return undefined;
  }, [tab]);

  const queryParams = useMemo(() => {
    const params: UseOperationResult['queryParams'] = {
      page: page + 1,
      pageSize: rowsPerPage,
    };
    if (mappedStatus) params.status = mappedStatus;
    if (searchField && searchValue.trim()) {
      params.searchKey = searchField;
      params.searchValue = searchValue.trim();
    }
    if (startDate && endDate) {
      params.startDate = dayjs(startDate).format('YYYY-MM-DD');
      params.endDate = dayjs(endDate).format('YYYY-MM-DD');
    }
    return params;
  }, [page, rowsPerPage, mappedStatus, searchField, searchValue, startDate, endDate]);

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
    queryParams,
  };
}
