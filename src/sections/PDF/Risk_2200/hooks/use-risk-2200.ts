import { useState, useMemo, useCallback } from 'react';
import type { Dayjs } from 'dayjs';
import type { Risk_2200Row } from '../components/Table';

// ----------------------------------------------------------------------

export type UseRisk_2200Result = {
  // Filter state
  dateFilterType: string; // 'registered' | 'written'
  startDate: string | null;
  endDate: string | null;
  searchValue: string;
  onChangeDateFilterType: (value: string) => void;
  onChangeStartDate: (value: Dayjs | null) => void;
  onChangeEndDate: (value: Dayjs | null) => void;
  onChangeSearchValue: (value: string) => void;

  // Selection state
  selectedIds: string[];
  onSelectAll: (checked: boolean) => void;
  onSelectRow: (id: string) => void;

  // Pagination state
  page: number;
  rowsPerPage: number;
  onChangePage: (page: number) => void;
  onChangeRowsPerPage: (rows: number) => void;

  // Filtered and paginated data
  filtered: Risk_2200Row[];
  total: number;
};

export function useRisk_2200(rows: Risk_2200Row[]): UseRisk_2200Result {
  // Filter state
  const [dateFilterType, setDateFilterType] = useState('registered');
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState('');

  // Selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const onChangeStartDate = useCallback((value: Dayjs | null) => {
    setStartDate(value ? value.format('YYYY-MM-DD') : null);
    setPage(0);
  }, []);

  const onChangeEndDate = useCallback((value: Dayjs | null) => {
    setEndDate(value ? value.format('YYYY-MM-DD') : null);
    setPage(0);
  }, []);

  // Filtered data
  const filtered = useMemo(() => {
    let result = [...rows];

    // 날짜 필터
    if (startDate || endDate) {
      result = result.filter((row) => {
        const dateToCompare =
          dateFilterType === 'registered' ? row.registeredAt : row.writtenAt;
        const dateStr = dateToCompare.split(' ')[0]; // YYYY-MM-DD 부분만 추출

        if (startDate && dateStr < startDate) {
          return false;
        }
        if (endDate && dateStr > endDate) {
          return false;
        }
        return true;
      });
    }

    // 검색어 필터
    if (searchValue) {
      const searchLower = searchValue.toLowerCase();
      result = result.filter(
        (row) =>
          row.documentName.toLowerCase().includes(searchLower) ||
          row.organizationName.toLowerCase().includes(searchLower) ||
          row.id.toLowerCase().includes(searchLower)
      );
    }

    return result;
  }, [rows, dateFilterType, startDate, endDate, searchValue]);

  // Paginated data
  const paginated = useMemo(() => {
    const start = page * rowsPerPage;
    return filtered.slice(start, start + rowsPerPage);
  }, [filtered, page, rowsPerPage]);

  const handleSelectAll = useCallback(
    (checked: boolean) => {
      if (checked) {
        setSelectedIds(paginated.map((row) => row.id));
      } else {
        setSelectedIds([]);
      }
    },
    [paginated]
  );

  const handleSelectRow = useCallback((id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }, []);

  return {
    dateFilterType,
    startDate,
    endDate,
    searchValue,
    onChangeDateFilterType: (value: string) => {
      setDateFilterType(value);
      setPage(0);
    },
    onChangeStartDate,
    onChangeEndDate,
    onChangeSearchValue: (value: string) => {
      setSearchValue(value);
      setPage(0);
    },
    selectedIds,
    onSelectAll: handleSelectAll,
    onSelectRow: handleSelectRow,
    page,
    rowsPerPage,
    onChangePage: setPage,
    onChangeRowsPerPage: (newRowsPerPage: number) => {
      setRowsPerPage(newRowsPerPage);
      setPage(0);
    },
    filtered: paginated,
    total: filtered.length,
  };
}
