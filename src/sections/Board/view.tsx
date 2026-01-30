import { useState, useCallback, useMemo } from 'react';
import Card from '@mui/material/Card';
import Container from '@mui/material/Container';
import dayjs from 'dayjs';

import { DashboardContent } from 'src/layouts/dashboard';
import BoardBreadcrumbs from './components/breadcrumbs';
import BoardTabs from './components/tab';
import BoardFilter from './components/filter';
import BoardTable, { type BoardRow } from './components/table';
import BoardPagination from './components/pagination';
import { useBoardCategories, useBoardPosts } from './hooks/use-board-api';
import type { BoardPost } from 'src/services/board/board.types';

// ----------------------------------------------------------------------

export function BoardView() {
  const [currentTab, setCurrentTab] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filters, setFilters] = useState({
    category: '',
    startDate: null,
    endDate: null,
    searchFilter: '',
    searchValue: '',
  });

  const { data: categoryData } = useBoardCategories({ postCategoryType: '공지사항' });
  const categories = categoryData?.categories || [];

  const statusFilter =
    currentTab === 'active' ? 'ACTIVE' : currentTab === 'inactive' ? 'INACTIVE' : undefined;

  const searchKey =
    filters.searchFilter === 'title'
      ? 'postTitle'
      : filters.searchFilter === 'author'
        ? 'adminName'
        : undefined;

  const { data: postsData } = useBoardPosts({
    postGubun: '공지사항',
    page: page + 1,
    pageSize: rowsPerPage,
    filterPostCategoryIndexes: filters.category || undefined,
    filterPostStatuses: statusFilter,
    searchingKey: searchKey,
    searchingVal: filters.searchValue || undefined,
    sortBy: 'postIdx',
    sortOrder: 'DESC',
  });

  const handleTabChange = useCallback((event: React.SyntheticEvent, newValue: string) => {
    setCurrentTab(newValue);
    setPage(0);
  }, []);

  const handleFilters = useCallback((newFilters: any) => {
    setFilters(newFilters);
    setPage(0);
  }, []);

  const handleChangePage = useCallback((event: any, newPage: number) => {
    setPage(newPage);
  }, []);

  const handleChangeRowsPerPage = useCallback((event: any) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  }, []);

  const filteredData = useMemo(() => {
    const posts = postsData?.posts || ([] as BoardPost[]);
    const startDate = filters.startDate ? dayjs(filters.startDate) : null;
    const endDate = filters.endDate ? dayjs(filters.endDate) : null;
    const filtered = posts.filter((post: BoardPost) => {
      if (!startDate && !endDate) return true;
      const dateValue = post.registrationDate || post.createAt || post.updateAt || '';
      if (!dateValue) return false;
      const date = dayjs(dateValue);
      if (startDate && date.isBefore(startDate, 'day')) return false;
      if (endDate && date.isAfter(endDate, 'day')) return false;
      return true;
    });

    const totalCount = postsData?.totalCount || filtered.length || 0;
    return filtered.map((post: BoardPost, index: number) => {
      const sequence = totalCount - (page * rowsPerPage + index);
      return {
        id: String(post.postIdx ?? `${page}-${index}`),
        sequence: sequence < 1 ? index + 1 : sequence,
        registeredAt: post.registrationDate || post.createAt || post.updateAt || '-',
        category: post.postCategoryTitle || '-',
        title: post.postTitle || '-',
        isPopup: (post.isPop ?? 0) === 1,
        isTopFixed: (post.isPinned ?? 0) === 1,
        views: post.postViews ?? 0,
        author: post.adminName || post.memberName || '-',
        status: post.postStatus === 'INACTIVE' ? 'inactive' : 'active',
      } as BoardRow;
    });
  }, [postsData, filters.startDate, filters.endDate, page, rowsPerPage]);

  const counts = useMemo(() => {
    const posts = postsData?.posts || ([] as BoardPost[]);
    const activeCount = posts.filter((post: BoardPost) => post.postStatus !== 'INACTIVE').length;
    const inactiveCount = posts.filter((post: BoardPost) => post.postStatus === 'INACTIVE').length;
    return {
      all: postsData?.totalCount || posts.length,
      active: activeCount,
      inactive: inactiveCount,
    };
  }, [postsData]);

  return (
    <DashboardContent>
      <Container maxWidth="xl">
        <BoardBreadcrumbs />

        <Card sx={{ boxShadow: '0 0 20px rgba(0,0,0,0.05)', borderRadius: 2 }}>
          <BoardTabs currentTab={currentTab} onChangeTab={handleTabChange} counts={counts} />

          <BoardFilter filters={filters} categories={categories} onFilters={handleFilters} />

          <BoardTable rows={filteredData} />

          <BoardPagination
            count={postsData?.totalCount || filteredData.length}
            page={page}
            rowsPerPage={rowsPerPage}
            onChangePage={handleChangePage}
            onChangeRowsPerPage={handleChangeRowsPerPage}
          />
        </Card>
      </Container>
    </DashboardContent>
  );
}
