import { useState, useMemo } from 'react';
import type { Risk_2200Row } from '../components/Table';

// ----------------------------------------------------------------------

export type UseRisk_2200Result = {
  // Filter state
  filterType: string;
  searchField: string;
  searchValue: string;
  onChangeFilterType: (value: string) => void;
  onChangeSearchField: (value: string) => void;
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
  const [filterType, setFilterType] = useState('all');
  const [searchField, setSearchField] = useState('title');
  const [searchValue, setSearchValue] = useState('');

  // Selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Filtered data
  const filtered = useMemo(() => {
    let result = [...rows];

    // Filter by type
    if (filterType !== 'all') {
      // 필터 타입에 따른 필터링 로직 추가 가능
    }

    // Search
    if (searchValue) {
      result = result.filter((row) => {
        if (searchField === 'title') {
          return row.documentName.toLowerCase().includes(searchValue.toLowerCase());
        }
        if (searchField === 'organization') {
          return row.organizationName.toLowerCase().includes(searchValue.toLowerCase());
        }
        if (searchField === 'documentNumber') {
          return row.id.toLowerCase().includes(searchValue.toLowerCase());
        }
        return true;
      });
    }

    return result;
  }, [rows, filterType, searchField, searchValue]);

  // Paginated data
  const paginated = useMemo(() => {
    const start = page * rowsPerPage;
    return filtered.slice(start, start + rowsPerPage);
  }, [filtered, page, rowsPerPage]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(paginated.map((row) => row.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return {
    filterType,
    searchField,
    searchValue,
    onChangeFilterType: setFilterType,
    onChangeSearchField: setSearchField,
    onChangeSearchValue: setSearchValue,
    selectedIds,
    onSelectAll: handleSelectAll,
    onSelectRow: handleSelectRow,
    page,
    rowsPerPage,
    onChangePage: setPage,
    onChangeRowsPerPage: (newRowsPerPage) => {
      setRowsPerPage(newRowsPerPage);
      setPage(0);
    },
    filtered: paginated,
    total: filtered.length,
  };
}
