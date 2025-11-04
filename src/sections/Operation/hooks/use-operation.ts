import type { RiskReport } from 'src/_mock/_risk-report';
import { useMemo, useState, useCallback } from 'react';

// ----------------------------------------------------------------------

export type RiskReportFilters = {
  q1: string;
  q2: string;
  q3: string;
};

export type UseOperationResult = {
  tab: string;
  onChangeTab: (value: string) => void;
  filters: RiskReportFilters;
  onChangeFilters: (partial: Partial<RiskReportFilters>) => void;
  countAll: number;
  countConfirmed: number;
  countUnconfirmed: number;
  searchField: 'all' | 'title' | 'location' | 'content' | 'author' | 'reporter';
  setSearchField: (
    v: 'all' | 'title' | 'location' | 'content' | 'author' | 'reporter'
  ) => void;
  page: number;
  rowsPerPage: number;
  onChangePage: (page: number) => void;
  onChangeRowsPerPage: (rows: number) => void;
  filtered: RiskReport[];
  total: number;
};

export function useOperation(reports: RiskReport[]): UseOperationResult {
  const [tab, setTab] = useState<string>('all');
  const [filters, setFilters] = useState<RiskReportFilters>({ q1: '', q2: '', q3: '' });
  const [searchField, setSearchField] = useState<
    'all' | 'title' | 'location' | 'content' | 'author' | 'reporter'
  >('all');
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);

  const onChangeTab = useCallback((value: string) => {
    setTab(value);
    setPage(0);
  }, []);

  const onChangeFilters = useCallback((partial: Partial<RiskReportFilters>) => {
    setFilters((prev) => ({ ...prev, ...partial }));
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
        const query = (text: string) =>
          text.toLowerCase().includes((filters.q2 || '').toLowerCase());
        const fieldMatch =
          searchField === 'all'
            ? [r.title, r.location, r.content, r.author, r.reporter].some((s) => query(s))
            : query(String(r[searchField] ?? ''));
        const t1 = filters.q1 ? `${r.status}`.includes(filters.q1) : true;
        const t3 = filters.q3 ? `${r.status}`.includes(filters.q3) : true;
        const byTab =
          tab === 'all'
            ? true
            : r.status === (tab === 'confirmed' ? 'confirmed' : 'unconfirmed');
        return fieldMatch && t1 && t3 && byTab;
      }),
    [reports, filters, tab, searchField]
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
    filters,
    onChangeFilters,
    countAll,
    countConfirmed,
    countUnconfirmed,
    searchField,
    setSearchField,
    page,
    rowsPerPage,
    onChangePage,
    onChangeRowsPerPage,
    filtered,
    total,
  };
}
