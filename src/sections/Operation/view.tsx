import type { Theme, SxProps } from '@mui/material/styles';

import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';

import { DashboardContent } from 'src/layouts/dashboard';

import { useOperation } from './hooks/use-operation';
import { useNavigate } from 'react-router';
import React from 'react';
import OperationBreadcrumbs from './components/Breadcrumbs';
import OperationFilters from './components/Filters';
import OperationTable from './components/Table';
import OperationPagination from './components/Pagination';
import {
  useRiskReports,
  useDeleteRiskReport,
  useUpdateRiskReport,
} from './hooks/use-operation-api';
import type { RiskReport } from 'src/services/operation/operation.types';

// ----------------------------------------------------------------------

type Props = {
  title?: string;
  description?: string;
  sx?: SxProps<Theme>;
};

export function OperationView({ title = 'Blank', description, sx }: Props) {
  const logic = useOperation();
  const navigate = useNavigate();
  const { data, isLoading, isError } = useRiskReports(logic.queryParams);
  const updateMutation = useUpdateRiskReport();
  const deleteMutation = useDeleteRiskReport();

  React.useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('🔍 [OperationView] 위험 보고 목록 상태', {
        params: logic.queryParams,
        data,
        isLoading,
        isError,
      });
    }
  }, [data, isLoading, isError, logic.queryParams]);

  const body = data?.body;
  const rows: RiskReport[] = body?.riskReportList ?? [];
  const totalCount = body?.totalCount ?? rows.length;
  const countActive = rows.filter((row) => row.status === 'CONFIRMED').length;
  const countInactive = rows.filter((row) => row.status !== 'CONFIRMED').length;
  const countAll = totalCount;

  const handleEdit = (row: RiskReport) => {
    if (import.meta.env.DEV) {
      console.log('🔍 [handleEdit] 수정 버튼 클릭', {
        row,
        riskReportIdx: row.riskReportIdx,
        id: row.id,
      });
    }
    const riskReportIdx = row.riskReportIdx ? String(row.riskReportIdx) : row.id;
    if (!riskReportIdx) {
      if (import.meta.env.DEV) {
        console.error('❌ [handleEdit] riskReportIdx를 찾을 수 없습니다.', row);
      }
      return;
    }
    if (import.meta.env.DEV) {
      console.log(
        '✅ [handleEdit] 네비게이션',
        `/dashboard/operation/risk-report/edit/${riskReportIdx}`
      );
    }
    navigate(`/dashboard/operation/risk-report/edit/${riskReportIdx}`);
  };

  const handleRegisterAccident = (row: RiskReport) => {
    // TODO: 아차사고 등록 기능 구현
    console.log('아차사고 등록:', row);
  };

  const handleRegisterIndustrialAccident = (row: RiskReport) => {
    // TODO: 산업재해 등록 기능 구현
    console.log('산업재해 등록:', row);
  };

  const renderTableSection = () => {
    if (isLoading) {
      return (
        <Stack alignItems="center" sx={{ py: 6 }}>
          <CircularProgress />
        </Stack>
      );
    }

    if (isError) {
      return (
        <Alert severity="error" sx={{ my: 4 }}>
          위험 보고 목록을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.
        </Alert>
      );
    }

    if (rows.length === 0) {
      return (
        <Alert severity="info" sx={{ my: 4 }}>
          조회된 위험 보고가 없습니다. 조건을 변경해보세요.
        </Alert>
      );
    }

    return (
      <OperationTable
        rows={rows}
        onEdit={handleEdit}
        onRegisterAccident={handleRegisterAccident}
        onRegisterIndustrialAccident={handleRegisterIndustrialAccident}
      />
    );
  };

  const renderContent = () => (
    <>
      <OperationFilters
        tab={logic.tab}
        onChangeTab={(tab) => {
          logic.onChangeTab(tab);
        }}
        startDate={logic.startDate}
        onChangeStartDate={logic.onChangeStartDate}
        endDate={logic.endDate}
        onChangeEndDate={logic.onChangeEndDate}
        countAll={countAll}
        countActive={countActive}
        countInactive={countInactive}
        searchField={logic.searchField}
        setSearchField={logic.setSearchField}
        searchValue={logic.searchValue}
        onChangeSearchValue={logic.onChangeSearchValue}
      />

      {renderTableSection()}

      <Divider sx={{ mt: 2, mb: 1 }} />

      <OperationPagination
        count={totalCount}
        page={logic.page}
        rowsPerPage={logic.rowsPerPage}
        onChangePage={(page) => {
          logic.onChangePage(page);
        }}
        onChangeRowsPerPage={(rowsPerPage) => {
          logic.onChangeRowsPerPage(rowsPerPage);
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
          { label: '대시보드', href: '/admin/dashboard' },
          { label: '현장 운영 관리', href: '/admin/dashboard/operation' },
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
