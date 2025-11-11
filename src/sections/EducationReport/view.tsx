import { useState } from 'react';

import type { Theme, SxProps } from '@mui/material/styles';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { DashboardContent } from 'src/layouts/dashboard';
import EducationReportBreadcrumbs from './components/Breadcrumbs';
import EducationReportFilters from './components/Filters';
import EducationReportTable from './components/Table';
import EducationReportPagination from './components/Pagination';
import AddEducationModal from './components/AddEducationModal';
import EducationDetailModal, { type EducationDetailData } from './components/EducationDetailModal';
import { useEducationReport } from './hooks/use-education-report';
import { useNavigate } from 'react-router';
import {
  mockEducationReports,
  mockMandatoryEducationRecords,
  mockRegularEducationRecords,
} from 'src/_mock/_education-report';

// ----------------------------------------------------------------------

type Props = {
  title?: string;
  description?: string;
  sx?: SxProps<Theme>;
};

export function EducationReportView({ title = '교육 이수 현황', description, sx }: Props) {
  // TODO: TanStack Query Hook(useQuery)으로 교육 이수 현황 목록 가져오기
  // const { data: reports, isLoading } = useQuery({
  //   queryKey: ['educationReports', logic.filters, logic.tab],
  //   queryFn: () => getEducationReports({ filters: logic.filters, tab: logic.tab }),
  // });
  // 목업 데이터 사용
  const reports = mockEducationReports(20);
  const logic = useEducationReport(reports);
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedDetailData, setSelectedDetailData] = useState<EducationDetailData | null>(null);

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
      <EducationReportFilters
        role={logic.filters.role}
        onChangeRole={(role) => {
          logic.onChangeRole(role);
          // TODO: 역할 필터 변경 시 TanStack Query로 교육 이수 현황 목록 새로고침
          // queryClient.invalidateQueries({ queryKey: ['educationReports'] });
        }}
        searchFilter={logic.filters.searchFilter}
        onChangeSearchFilter={(filter) => {
          logic.onChangeSearchFilter(filter);
          // TODO: 검색 필터 변경 시 TanStack Query로 교육 이수 현황 목록 새로고침
          // queryClient.invalidateQueries({ queryKey: ['educationReports'] });
        }}
        searchValue={logic.filters.searchValue}
        onChangeSearchValue={(value) => {
          logic.onChangeSearchValue(value);
          // TODO: 검색 값 변경 시 TanStack Query로 교육 이수 현황 목록 새로고침
          // queryClient.invalidateQueries({ queryKey: ['educationReports'] });
        }}
      />

      <EducationReportTable
        rows={logic.filtered}
        selectedIds={logic.selectedIds}
        onSelectAll={logic.onSelectAll}
        onSelectRow={logic.onSelectRow}
        onViewDetail={(row) => {
          // TODO: TanStack Query Hook(useQuery)으로 교육 상세 정보 가져오기
          // const { data: detailData } = useQuery({
          //   queryKey: ['educationDetail', row.id],
          //   queryFn: () => getEducationDetail(row.id),
          // });
          // 목업 데이터 사용
          const mandatoryRecords = mockMandatoryEducationRecords(10);
          const regularRecords = mockRegularEducationRecords(10);

          setSelectedDetailData({
            report: row,
            mandatoryEducationRecords: mandatoryRecords,
            regularEducationRecords: regularRecords,
            joinDate: '2025-10-31',
          });
          setDetailModalOpen(true);
        }}
      />

      <EducationReportPagination
        count={logic.total}
        page={logic.page}
        rowsPerPage={logic.rowsPerPage}
        onChangePage={(page) => {
          logic.onChangePage(page);
          // TODO: 페이지 변경 시 TanStack Query로 교육 이수 현황 목록 새로고침
          // queryClient.invalidateQueries({ queryKey: ['educationReports'] });
        }}
        onChangeRowsPerPage={(rowsPerPage) => {
          logic.onChangeRowsPerPage(rowsPerPage);
          // TODO: 페이지 크기 변경 시 TanStack Query로 교육 이수 현황 목록 새로고침
          // queryClient.invalidateQueries({ queryKey: ['educationReports'] });
        }}
        onCreate={() => setModalOpen(true)}
      />
    </Box>
  );

  return (
    <DashboardContent maxWidth="xl">
      <Typography variant="h4"> {title} </Typography>
      {description && <Typography sx={{ mt: 1 }}> {description} </Typography>}

      <EducationReportBreadcrumbs
        items={[
          { label: '대시보드', href: '/dashboard' },
          { label: '현장 운영 관리', href: '/dashboard/operation' },
          { label: title },
        ]}
      />

      <Box sx={[(theme) => ({ mt: 2, width: 1 }), ...(Array.isArray(sx) ? sx : [sx])]}>
        {renderContent()}
      </Box>

      <AddEducationModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={(data) => {
          // TODO: TanStack Query Hook(useMutation)으로 교육 추가
          // const mutation = useMutation({
          //   mutationFn: (formData: EducationFormData) => createEducation(formData),
          //   onSuccess: () => {
          //     queryClient.invalidateQueries({ queryKey: ['educationReports'] });
          //     setModalOpen(false);
          //   },
          // });
          // mutation.mutate(data);
          console.log('교육 추가:', data);
        }}
      />

      <EducationDetailModal
        open={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false);
          setSelectedDetailData(null);
        }}
        onSave={() => {
          // TODO: TanStack Query Hook(useMutation)으로 교육 상세 정보 저장
          // const mutation = useMutation({
          //   mutationFn: (detailData: EducationDetailData) => updateEducationDetail(detailData),
          //   onSuccess: () => {
          //     queryClient.invalidateQueries({ queryKey: ['educationReports'] });
          //     queryClient.invalidateQueries({ queryKey: ['educationDetail', selectedDetailData?.report.id] });
          //     setDetailModalOpen(false);
          //   },
          // });
          // mutation.mutate(selectedDetailData!);
          console.log('저장');
        }}
        data={selectedDetailData}
      />
    </DashboardContent>
  );
}
