import type { Theme, SxProps } from '@mui/material/styles';

import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { mockRiskReports } from 'src/_mock/_risk-report';
import { DashboardContent } from 'src/layouts/dashboard';

import { useOperation } from './hooks/use-operation';
import { useNavigate } from 'react-router';
import React from 'react';
import OperationBreadcrumbs from './components/Breadcrumbs';
import OperationFilters from './components/Filters';
import OperationTable from './components/Table';
import OperationPagination from './components/Pagination';

// ----------------------------------------------------------------------

type Props = {
  title?: string;
  description?: string;
  sx?: SxProps<Theme>;
};

export function OperationView({ title = 'Blank', description, sx }: Props) {
  // TODO: TanStack Query Hook(useQuery)으로 위험 보고 목록 가져오기
  // const { data: reports, isLoading } = useQuery({
  //   queryKey: ['riskReports', logic.filters, logic.tab, logic.searchField],
  //   queryFn: () => getRiskReports({ filters: logic.filters, tab: logic.tab, searchField: logic.searchField }),
  // });
  // 목업 데이터 사용
  const reports = mockRiskReports(20);
  const logic = useOperation(reports);
  const navigate = useNavigate();

  const renderContent = () => (
    <>
      <OperationFilters
        tab={logic.tab}
        onChangeTab={(tab) => {
          logic.onChangeTab(tab);
          // TODO: 탭 변경 시 TanStack Query로 위험 보고 목록 새로고침
          // queryClient.invalidateQueries({ queryKey: ['riskReports'] });
        }}
        startDate={logic.startDate}
        onChangeStartDate={logic.onChangeStartDate}
        endDate={logic.endDate}
        onChangeEndDate={logic.onChangeEndDate}
        countAll={logic.countAll}
        countActive={logic.countConfirmed}
        countInactive={logic.countUnconfirmed}
        searchField={logic.searchField}
        setSearchField={logic.setSearchField}
        searchValue={logic.searchValue}
        onChangeSearchValue={logic.onChangeSearchValue}
      />

      <OperationTable
        rows={logic.filtered}
        onEdit={(row) => {
          // TODO: TanStack Query Hook(useQuery)으로 위험 보고 상세 정보 가져오기 (수정 모달용)
          // const { data: detail } = useQuery({
          //   queryKey: ['riskReport', row.id],
          //   queryFn: () => getRiskReportDetail(row.id),
          // });
          // 수정 모달 열기 또는 수정 페이지로 이동
          console.log('수정:', row);
        }}
        onRegisterNearMiss={(row) => {
          // TODO: TanStack Query Hook(useMutation)으로 아차사고 등록
          // const mutation = useMutation({
          //   mutationFn: (riskReportId: string) => registerNearMiss(riskReportId),
          //   onSuccess: () => {
          //     queryClient.invalidateQueries({ queryKey: ['riskReports'] });
          //   },
          // });
          // mutation.mutate(row.id);
          console.log('아차사고 등록:', row);
        }}
        onRegisterAccident={(row) => {
          // TODO: TanStack Query Hook(useMutation)으로 산업재해 등록
          // const mutation = useMutation({
          //   mutationFn: (riskReportId: string) => registerAccident(riskReportId),
          //   onSuccess: () => {
          //     queryClient.invalidateQueries({ queryKey: ['riskReports'] });
          //   },
          // });
          // mutation.mutate(row.id);
          console.log('산업재해 등록:', row);
        }}
      />

      <Divider sx={{ mt: 2, mb: 1 }} />

      <OperationPagination
        count={logic.total}
        page={logic.page}
        rowsPerPage={logic.rowsPerPage}
        onChangePage={(page) => {
          logic.onChangePage(page);
          // TODO: 페이지 변경 시 TanStack Query로 위험 보고 목록 새로고침
          // queryClient.invalidateQueries({ queryKey: ['riskReports'] });
        }}
        onChangeRowsPerPage={(rowsPerPage) => {
          logic.onChangeRowsPerPage(rowsPerPage);
          // TODO: 페이지 크기 변경 시 TanStack Query로 위험 보고 목록 새로고침
          // queryClient.invalidateQueries({ queryKey: ['riskReports'] });
        }}
      />
    </>
  );

  return (
    <DashboardContent maxWidth="xl">
      <Typography variant="h4"> {title} </Typography>
      {description && <Typography sx={{ mt: 1 }}> {description} </Typography>}

      <OperationBreadcrumbs
        items={[
          { label: '대시보드', href: '/dashboard' },
          { label: '현장 운영 관리', href: '/dashboard/operation' },
          { label: title },
        ]}
        onCreate={() => navigate('/dashboard/operation/risk-report/create')}
      />

      <Box sx={[(theme) => ({ mt: 2, width: 1 }), ...(Array.isArray(sx) ? sx : [sx])]}>
        {renderContent()}
      </Box>
    </DashboardContent>
  );
}
