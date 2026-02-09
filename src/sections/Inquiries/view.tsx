import { useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { toast } from 'sonner';

import Card from '@mui/material/Card';
import Container from '@mui/material/Container';

import { DashboardContent } from 'src/layouts/dashboard';

import InquiriesTabs from './components/tab';
import type { InquiryRow } from './components/table';
import InquiriesTable from './components/table';
import InquiriesFilter from './components/filter';
import InquiriesPagination from './components/pagination';
import InquiriesBreadcrumbs from './components/breadcrumbs';
import { useBoardCategories, useBoardPosts } from 'src/sections/Board/hooks/use-board-api';
import type { BoardCategory, BoardPost } from 'src/services/board/board.types';

import InquiryNewView from './inquiry-new-view';
import InquiryEditView from './inquiry-edit-view';
import InquiryDetailsView from './inquiry-details-view';
import InquiryReplyView from './inquiry-reply-view';
import CategoryManageModal from './components/CategoryManageModal';

// ----------------------------------------------------------------------

export default function InquiriesView() {
  const [view, setView] = useState<'list' | 'new' | 'edit' | 'details' | 'reply'>('list');
  const [selectedInquiry, setSelectedInquiry] = useState<any>(null);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);

  const [currentTab, setCurrentTab] = useState('all');
  const [filters, setFilters] = useState({
    category: '',
    startDate: null,
    endDate: null,
    searchFilter: '',
    searchValue: '',
  });

  const [pagination, setPagination] = useState({
    total: 20,
    rowsPerPage: 10,
    currentPage: 1,
  });

  const { data: categoryData } = useBoardCategories({ postCategoryType: '문의/답변' });
  const categories = categoryData?.categories || [];

  const statusFilter =
    currentTab === 'completed' ? '1' : currentTab === 'pending' ? '0' : undefined;

  const searchKey =
    filters.searchFilter === 'title'
      ? 'postTitle'
      : filters.searchFilter === 'content'
        ? 'postContent'
        : undefined;

  const { data: postsData } = useBoardPosts({
    postGubun: '문의/답변',
    page: pagination.currentPage,
    pageSize: pagination.rowsPerPage,
    filterPostCategoryIndexes: filters.category || undefined,
    filterPostAnswerStatuses: statusFilter,
    searchingKey: searchKey,
    searchingVal: filters.searchValue || undefined,
    sortBy: 'postIdx',
    sortOrder: 'DESC',
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setCurrentTab(newValue);
  };

  const handleFilters = (newFilters: any) => {
    setFilters(newFilters);
  };

  const handleRowsPerPageChange = (event: any) => {
    setPagination({ ...pagination, rowsPerPage: event.target.value, currentPage: 1 });
  };

  const handlePageChange = (page: number) => {
    setPagination({ ...pagination, currentPage: page });
  };

  const handleNewInquiry = () => {
    setView('new');
  };

  const handleCategoryManage = () => {
    setCategoryModalOpen(true);
  };

  const handleEditInquiry = (row: InquiryRow) => {
    setSelectedInquiry(row);
    setView('edit');
  };

  const handleReplyInquiry = (row: InquiryRow) => {
    setSelectedInquiry(row);
    setView('reply');
  };

  const handleViewAnswer = (row: InquiryRow) => {
    setSelectedInquiry(row);
    setView('details');
  };

  const handleBackToList = () => {
    setView('list');
    setSelectedInquiry(null);
  };

  const rows = useMemo(() => {
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
      const sequence = totalCount - ((pagination.currentPage - 1) * pagination.rowsPerPage + index);
      const status = post.postAnswerStatus === 1 ? 'completed' : 'pending';
      return {
        id: String(post.postIdx ?? `${pagination.currentPage}-${index}`),
        postIdx: post.postIdx,
        sequence: sequence < 1 ? index + 1 : sequence,
        inquirerName: post.memberName || post.adminName || '-', // 문의자 이름
        inquirerEmail: post.memberEmail || '-', // 문의자 이메일
        inquirerId: post.memberId || undefined, // 회원 ID
        inquirerPhone: post.memberPhone || undefined, // 전화번호
        inquiryAt: post.registrationDate || post.createAt || post.updateAt || '-',
        answeredAt: post.postAnswerAt,
        category: post.postCategoryTitle || post.categoryTitle || '-', // 카테고리 (두 필드 모두 확인)
        postCategoryIdx: post.postCategoryIdx || post.categoryIdx,
        title: post.postTitle || '-',
        status,
        content: post.postContent || '',
        answer: post.postAnswerContent || '',
        commentInformation: post.commentInformation,
      } as InquiryRow;
    });
  }, [postsData, filters.startDate, filters.endDate, pagination.currentPage, pagination.rowsPerPage]);

  const counts = useMemo(() => {
    const posts = postsData?.posts || ([] as BoardPost[]);
    const completedCount = posts.filter((post: BoardPost) => post.postAnswerStatus === 1).length;
    const pendingCount = posts.filter((post: BoardPost) => post.postAnswerStatus !== 1).length;
    return {
      all: postsData?.totalCount || posts.length,
      completed: completedCount,
      pending: pendingCount,
    };
  }, [postsData]);

  if (view === 'new') {
    return <InquiryNewView onBack={handleBackToList} />;
  }

  if (view === 'edit' && selectedInquiry) {
    return <InquiryEditView onBack={handleBackToList} inquiry={selectedInquiry} />;
  }

  if (view === 'details' && selectedInquiry) {
    return <InquiryDetailsView onBack={handleBackToList} inquiry={selectedInquiry} />;
  }

  if (view === 'reply' && selectedInquiry) {
    return <InquiryReplyView onBack={handleBackToList} inquiry={selectedInquiry} />;
  }

  return (
    <DashboardContent>
      <Container maxWidth="xl">
        <InquiriesBreadcrumbs onNewInquiry={handleNewInquiry} onCategoryManage={handleCategoryManage} />

        <Card sx={{ boxShadow: '0 0 20px rgba(0,0,0,0.05)', borderRadius: 2 }}>
          <InquiriesTabs
            currentTab={currentTab}
            onChangeTab={handleTabChange}
            counts={counts}
          />

          <InquiriesFilter filters={filters} categories={categories} onFilters={handleFilters} />

          <InquiriesTable
            rows={rows}
            onEdit={handleEditInquiry}
            onReply={handleReplyInquiry}
            onViewAnswer={handleViewAnswer}
          />

          <InquiriesPagination
            total={postsData?.totalCount || rows.length}
            rowsPerPage={pagination.rowsPerPage}
            currentPage={pagination.currentPage}
            onChangeRowsPerPage={handleRowsPerPageChange}
            onChangePage={handlePageChange}
          />
        </Card>
      </Container>

      <CategoryManageModal
        open={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        postCategoryType="문의/답변"
      />
    </DashboardContent>
  );
}
