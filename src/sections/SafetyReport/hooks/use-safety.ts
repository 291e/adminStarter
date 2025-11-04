import type { SafetyReport } from 'src/_mock/_safety-report';
import { useMemo, useState, useCallback } from 'react';

// ----------------------------------------------------------------------

export type UseSafetyReportResult = {
  documentType: string;
  onChangeDocumentType: (value: string) => void;
  searchField: 'all' | 'documentName';
  onChangeSearchField: (value: 'all' | 'documentName') => void;
  searchValue: string;
  onChangeSearchValue: (value: string) => void;
  page: number;
  rowsPerPage: number;
  onChangePage: (page: number) => void;
  onChangeRowsPerPage: (rows: number) => void;
  filtered: SafetyReport[];
  total: number;
};

export function useSafetyReport(reports: SafetyReport[]): UseSafetyReportResult {
  const [documentType, setDocumentType] = useState<string>('all');
  const [searchField, setSearchField] = useState<'all' | 'documentName'>('all');
  const [searchValue, setSearchValue] = useState<string>('');
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);

  const onChangeDocumentType = useCallback((value: string) => {
    setDocumentType(value);
    setPage(0);
  }, []);

  const onChangeSearchField = useCallback((value: 'all' | 'documentName') => {
    setSearchField(value);
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
        const typeMatch = documentType === 'all' || r.documentType === documentType;
        const query = searchValue.toLowerCase();
        const searchMatch =
          searchField === 'all'
            ? r.documentName.toLowerCase().includes(query) ||
              r.documentType.toLowerCase().includes(query)
            : r.documentName.toLowerCase().includes(query);
        return typeMatch && searchMatch;
      }),
    [reports, documentType, searchField, searchValue]
  );

  const total = filteredAll.length;

  const filtered = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredAll.slice(start, start + rowsPerPage);
  }, [filteredAll, page, rowsPerPage]);

  return {
    documentType,
    onChangeDocumentType,
    searchField,
    onChangeSearchField,
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
