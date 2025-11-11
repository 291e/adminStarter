import { useState } from 'react';

import type { Theme, SxProps } from '@mui/material/styles';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { DashboardContent } from 'src/layouts/dashboard';
import LibraryReportBreadcrumbs from './components/Breadcrumbs';
import LibraryReportTabs from './components/Tabs';
import LibraryReportFilters from './components/Filters';
import LibraryReportTable from './components/Table';
import LibraryReportPagination from './components/Pagination';
import CategorySettingsModal, { type CategoryItem } from './components/CategorySettingsModal';
import VODUploadModal, { type VODUploadFormData } from './components/VODUploadModal';
import EditContentModal, { type EditContentFormData } from './components/EditContentModal';
import { useLibraryReport } from './hooks/use-library-report';
import { useNavigate } from 'react-router';
import { mockLibraryReports } from 'src/_mock/_library-report';
import dayjs from 'dayjs';

// ----------------------------------------------------------------------

type Props = {
  title?: string;
  description?: string;
  sx?: SxProps<Theme>;
};

// 초기 카테고리 목업 데이터
const initialCategories: CategoryItem[] = [
  { id: '1', name: 'TBM 작업안전', isActive: true },
  { id: '2', name: '사무직 외 근로자', isActive: true },
  { id: '3', name: '사무직 근로자', isActive: true },
  { id: '4', name: '물질안전보건 교육', isActive: true },
  { id: '5', name: '개인정보보호 교육', isActive: true },
  { id: '6', name: '직장 내 성희롱 예방 교육', isActive: true },
  { id: '7', name: '장애인 인식 개선 교육', isActive: true },
  { id: '8', name: '퇴직연금 교육', isActive: true },
];

export function LibraryReportView({ title = '라이브러리', description, sx }: Props) {
  // TODO: TanStack Query Hook(useQuery)으로 라이브러리 리포트 목록 가져오기
  // const { data: reports, isLoading } = useQuery({
  //   queryKey: ['libraryReports', logic.filters, logic.tab],
  //   queryFn: () => getLibraryReports({ filters: logic.filters, tab: logic.tab }),
  // });
  // 목업 데이터 사용
  const reports = mockLibraryReports(20);

  // TODO: TanStack Query Hook(useQuery)으로 카테고리 목록 가져오기
  // const { data: categoriesData } = useQuery({
  //   queryKey: ['libraryCategories'],
  //   queryFn: () => getLibraryCategories(),
  // });
  // 목업 데이터 사용
  const [categories, setCategories] = useState<CategoryItem[]>(initialCategories);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [vodUploadModalOpen, setVodUploadModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<(typeof reports)[0] | null>(null);
  const logic = useLibraryReport(reports, categories);
  const navigate = useNavigate();

  const renderContent = () => (
    <Box
      sx={{
        bgcolor: 'background.paper',
        borderRadius: 2,
        boxShadow: 3,
        width: '100%',
        overflow: 'hidden',
      }}
    >
      <LibraryReportTabs
        value={logic.filters.tab}
        onChange={(tab) => {
          logic.onChangeTab(tab);
          // TODO: 탭 변경 시 TanStack Query로 라이브러리 리포트 목록 새로고침
          // queryClient.invalidateQueries({ queryKey: ['libraryReports'] });
        }}
        counts={logic.counts}
      />

      <LibraryReportFilters
        categories={categories}
        category={logic.filters.category}
        onChangeCategory={(category) => {
          logic.onChangeCategory(category);
          // TODO: 카테고리 필터 변경 시 TanStack Query로 라이브러리 리포트 목록 새로고침
          // queryClient.invalidateQueries({ queryKey: ['libraryReports'] });
        }}
        startDate={logic.filters.startDate ? dayjs(logic.filters.startDate) : null}
        onChangeStartDate={(date) => {
          logic.onChangeStartDate(date);
          // TODO: 시작일 변경 시 TanStack Query로 라이브러리 리포트 목록 새로고침
          // queryClient.invalidateQueries({ queryKey: ['libraryReports'] });
        }}
        endDate={logic.filters.endDate ? dayjs(logic.filters.endDate) : null}
        onChangeEndDate={(date) => {
          logic.onChangeEndDate(date);
          // TODO: 종료일 변경 시 TanStack Query로 라이브러리 리포트 목록 새로고침
          // queryClient.invalidateQueries({ queryKey: ['libraryReports'] });
        }}
        searchFilter={logic.filters.searchFilter}
        onChangeSearchFilter={(filter) => {
          logic.onChangeSearchFilter(filter);
          // TODO: 검색 필터 변경 시 TanStack Query로 라이브러리 리포트 목록 새로고침
          // queryClient.invalidateQueries({ queryKey: ['libraryReports'] });
        }}
        searchValue={logic.filters.searchValue}
        onChangeSearchValue={(value) => {
          logic.onChangeSearchValue(value);
          // TODO: 검색 값 변경 시 TanStack Query로 라이브러리 리포트 목록 새로고침
          // queryClient.invalidateQueries({ queryKey: ['libraryReports'] });
        }}
      />

      <LibraryReportTable
        rows={logic.filtered}
        selectedIds={logic.selectedIds}
        onSelectAll={logic.onSelectAll}
        onSelectRow={logic.onSelectRow}
        onEdit={(row) => {
          setSelectedRow(row);
          setEditModalOpen(true);
        }}
      />

      <LibraryReportPagination
        count={logic.total}
        page={logic.page}
        rowsPerPage={logic.rowsPerPage}
        onChangePage={(page) => {
          logic.onChangePage(page);
          // TODO: 페이지 변경 시 TanStack Query로 라이브러리 리포트 목록 새로고침
          // queryClient.invalidateQueries({ queryKey: ['libraryReports'] });
        }}
        onChangeRowsPerPage={(rowsPerPage) => {
          logic.onChangeRowsPerPage(rowsPerPage);
          // TODO: 페이지 크기 변경 시 TanStack Query로 라이브러리 리포트 목록 새로고침
          // queryClient.invalidateQueries({ queryKey: ['libraryReports'] });
        }}
      />
    </Box>
  );

  return (
    <DashboardContent maxWidth="xl">
      <Typography variant="h4"> {title} </Typography>
      {description && <Typography sx={{ mt: 1 }}> {description} </Typography>}

      <LibraryReportBreadcrumbs
        items={[
          { label: '대시보드', href: '/dashboard' },
          { label: '현장 운영 관리', href: '/dashboard/operation' },
          { label: title },
        ]}
        onCategorySettings={() => setCategoryModalOpen(true)}
        onVodUpload={() => setVodUploadModalOpen(true)}
      />

      <Box sx={[(theme) => ({ mt: 2, width: 1 }), ...(Array.isArray(sx) ? sx : [sx])]}>
        {renderContent()}
      </Box>

      <CategorySettingsModal
        open={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        onSave={(newCategories) => {
          // TODO: TanStack Query Hook(useMutation)으로 카테고리 설정 저장
          // const mutation = useMutation({
          //   mutationFn: (categories: CategoryItem[]) => saveLibraryCategories(categories),
          //   onSuccess: () => {
          //     queryClient.invalidateQueries({ queryKey: ['libraryCategories'] });
          //     queryClient.invalidateQueries({ queryKey: ['libraryReports'] });
          //     setCategoryModalOpen(false);
          //   },
          // });
          // mutation.mutate(newCategories);
          setCategories(newCategories);
        }}
        initialCategories={categories}
      />

      <VODUploadModal
        open={vodUploadModalOpen}
        onClose={() => setVodUploadModalOpen(false)}
        onSave={(data: VODUploadFormData) => {
          // TODO: TanStack Query Hook(useMutation)으로 VOD 업로드
          // const mutation = useMutation({
          //   mutationFn: (formData: VODUploadFormData) => uploadVOD(formData),
          //   onSuccess: () => {
          //     queryClient.invalidateQueries({ queryKey: ['libraryReports'] });
          //     setVodUploadModalOpen(false);
          //   },
          // });
          // mutation.mutate(data);
          console.log('VOD 업로드:', data);
        }}
        categories={categories}
      />

      <EditContentModal
        open={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedRow(null);
        }}
        onSave={(data: EditContentFormData) => {
          // TODO: TanStack Query Hook(useMutation)으로 컨텐츠 수정
          // const mutation = useMutation({
          //   mutationFn: (formData: EditContentFormData) => updateLibraryContent(selectedRow!.id, formData),
          //   onSuccess: () => {
          //     queryClient.invalidateQueries({ queryKey: ['libraryReports'] });
          //     setEditModalOpen(false);
          //     setSelectedRow(null);
          //   },
          // });
          // mutation.mutate(data);
          console.log('컨텐츠 수정:', data);
        }}
        onDelete={() => {
          // TODO: TanStack Query Hook(useMutation)으로 컨텐츠 삭제
          // const mutation = useMutation({
          //   mutationFn: () => deleteLibraryContent(selectedRow!.id),
          //   onSuccess: () => {
          //     queryClient.invalidateQueries({ queryKey: ['libraryReports'] });
          //     setEditModalOpen(false);
          //     setSelectedRow(null);
          //   },
          // });
          // mutation.mutate();
          console.log('컨텐츠 삭제:', selectedRow);
        }}
        categories={categories}
        initialData={selectedRow}
      />
    </DashboardContent>
  );
}
