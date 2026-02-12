import { useCallback, useMemo, useState } from 'react';
import Card from '@mui/material/Card';
import Container from '@mui/material/Container';
import dayjs from 'dayjs';

import { DashboardContent } from 'src/layouts/dashboard';
import BoardBreadcrumbs from './components/breadcrumbs';
import CategoryManageModal from './components/CategoryManageModal';
import BoardTabs from './components/tab';
import BoardFilter from './components/filter';
import BoardTable, { type BoardRow } from './components/table';
import BoardPagination from './components/pagination';
import BoardDetailsView from './board-details-view';
import BoardEditView from './board-edit-view';
import BoardNewView from './board-new-view';
import { useBoardCategories, useBoardPostDetail, useBoardPosts } from './hooks/use-board-api';
import { useMyInfo } from 'src/sections/Chat/hooks/use-my-info';
import type { BoardPost } from 'src/services/board/board.types';

// ----------------------------------------------------------------------

export function BoardView() {
  const [view, setView] = useState<'list' | 'new' | 'edit' | 'details'>('list');
  const [selectedPost, setSelectedPost] = useState<BoardPost | null>(null);
  const [selectedPostIdx, setSelectedPostIdx] = useState<number | null>(null);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);

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
  const { data: myInfo } = useMyInfo();
  const isSuperAdmin = myInfo?.isSuperAdmin === true;
  const memberRole = String((myInfo as any)?.memberRole || (myInfo as any)?.role || '').toUpperCase();
  const isOrganizationManager = memberRole === 'OPERATOR_MANAGER' || memberRole === 'ADMIN';
  const canEditNotice = isSuperAdmin || isOrganizationManager;
  const canViewAdminColumns = isSuperAdmin || isOrganizationManager;

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
  const { data: allCountData } = useBoardPosts({
    postGubun: '공지사항',
    page: 1,
    pageSize: 1,
    filterPostCategoryIndexes: filters.category || undefined,
    searchingKey: searchKey,
    searchingVal: filters.searchValue || undefined,
    sortBy: 'postIdx',
    sortOrder: 'DESC',
  });
  const { data: activeCountData } = useBoardPosts({
    postGubun: '공지사항',
    page: 1,
    pageSize: 1,
    filterPostCategoryIndexes: filters.category || undefined,
    filterPostStatuses: 'ACTIVE',
    searchingKey: searchKey,
    searchingVal: filters.searchValue || undefined,
    sortBy: 'postIdx',
    sortOrder: 'DESC',
  });
  const { data: inactiveCountData } = useBoardPosts({
    postGubun: '공지사항',
    page: 1,
    pageSize: 1,
    filterPostCategoryIndexes: filters.category || undefined,
    filterPostStatuses: 'INACTIVE',
    searchingKey: searchKey,
    searchingVal: filters.searchValue || undefined,
    sortBy: 'postIdx',
    sortOrder: 'DESC',
  });
  const { data: postDetailData, isLoading: isPostDetailLoading } = useBoardPostDetail(
    selectedPostIdx ?? undefined,
    view === 'details'
  );

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

  const handleBackToList = () => {
    setSelectedPost(null);
    setSelectedPostIdx(null);
    setView('list');
  };

  const handleOpenCategoryManage = () => {
    setCategoryModalOpen(true);
  };

  const handleOpenNewPost = () => {
    setView('new');
  };

  const handleViewPost = useCallback(
    (row: BoardRow) => {
      setSelectedPostIdx(row.postIdx);
      setView('details');
    },
    []
  );

  const handleEditPost = useCallback(
    (row: BoardRow) => {
      if (!canEditNotice) return;
      if (row.isAuthorSuperAdmin) return;
      const target = postsData?.posts.find((post: BoardPost) => post.postIdx === row.postIdx);
      if (!target) return;
      setSelectedPost(target);
      setView('edit');
    },
    [canEditNotice, postsData]
  );

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
    const sorted = [...filtered].sort((a, b) => {
      const aPinned = (a.isPinned ?? 0) === 1 ? 1 : 0;
      const bPinned = (b.isPinned ?? 0) === 1 ? 1 : 0;
      if (aPinned !== bPinned) return bPinned - aPinned;

      const aDateValue = a.registrationDate || a.createAt || a.updateAt || '';
      const bDateValue = b.registrationDate || b.createAt || b.updateAt || '';
      const aTs = aDateValue ? dayjs(aDateValue).valueOf() : 0;
      const bTs = bDateValue ? dayjs(bDateValue).valueOf() : 0;
      if (aTs !== bTs) return bTs - aTs;

      const aPostIdx = a.postIdx ?? 0;
      const bPostIdx = b.postIdx ?? 0;
      return bPostIdx - aPostIdx;
    });

    const totalCount = Math.max(postsData?.totalCount ?? 0, posts.length, filtered.length);
    return sorted.map((post: BoardPost, index: number) => {
      const sequence = totalCount - (page * rowsPerPage + index);
      return {
        id: String(post.postIdx ?? `${page}-${index}`),
        postIdx: post.postIdx ?? index,
        sequence: sequence < 1 ? index + 1 : sequence,
        registeredAt: post.registrationDate || post.createAt || post.updateAt || '-',
        category: post.postCategoryTitle || '-',
        title: post.postTitle || '-',
        isPopup: (post.isPop ?? 0) === 1,
        isTopFixed: (post.isPinned ?? 0) === 1,
        views: post.postViews ?? 0,
        author:
          post.memberInformation?.memberName || post.memberName || post.adminName || '-',
        isAuthorSuperAdmin:
          post.authorIsSuperAdmin === true ||
          post.memberInformation?.isSuperAdmin === true ||
          String(post.memberRole || post.memberInformation?.memberRole || '').toUpperCase() ===
            'SUPER_ADMIN',
        status: post.postStatus === 'INACTIVE' ? 'inactive' : 'active',
      } as BoardRow;
    });
  }, [postsData, filters.startDate, filters.endDate, page, rowsPerPage]);

  const counts = useMemo(
    () => ({
      all: allCountData?.totalCount ?? 0,
      active: activeCountData?.totalCount ?? 0,
      inactive: inactiveCountData?.totalCount ?? 0,
    }),
    [allCountData, activeCountData, inactiveCountData]
  );

  if (view === 'new') {
    return <BoardNewView onBack={handleBackToList} />;
  }

  if (view === 'details' && selectedPostIdx) {
    return (
      <BoardDetailsView
        onBack={handleBackToList}
        post={postDetailData?.post}
        loading={isPostDetailLoading}
      />
    );
  }

  if (view === 'edit' && selectedPost) {
    return <BoardEditView onBack={handleBackToList} post={selectedPost} />;
  }

  return (
    <DashboardContent>
      <Container maxWidth="xl">
        <BoardBreadcrumbs
          onCategoryManage={handleOpenCategoryManage}
          onNewPost={handleOpenNewPost}
        />

        <Card sx={{ boxShadow: '0 0 20px rgba(0,0,0,0.05)', borderRadius: 2 }}>
          <BoardTabs currentTab={currentTab} onChangeTab={handleTabChange} counts={counts} />

          <BoardFilter filters={filters} categories={categories} onFilters={handleFilters} />

          <BoardTable
            rows={filteredData}
            isSuperAdmin={canViewAdminColumns}
            canEdit={canEditNotice}
            onView={handleViewPost}
            onEdit={canEditNotice ? handleEditPost : undefined}
          />

          <BoardPagination
            count={postsData?.totalCount || filteredData.length}
            page={page}
            rowsPerPage={rowsPerPage}
            onChangePage={handleChangePage}
            onChangeRowsPerPage={handleChangeRowsPerPage}
          />
        </Card>
      </Container>

      <CategoryManageModal
        open={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        postCategoryType="공지사항"
      />
    </DashboardContent>
  );
}
