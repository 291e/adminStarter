import type { Theme, SxProps } from '@mui/material/styles';

import { varAlpha } from 'minimal-shared/utils';

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
  const reports = mockRiskReports(20);
  const logic = useOperation(reports);
  const navigate = useNavigate();

  const renderContent = () => (
    <>
      <OperationBreadcrumbs
        items={[{ label: '대시보드', href: '/' }, { label: title }]}
        onCreate={() => navigate('/dashboard/operation/risk-report/create')}
      />

      <OperationFilters
        tab={logic.tab}
        onChangeTab={logic.onChangeTab}
        q1={logic.filters.q1}
        q2={logic.filters.q2}
        q3={logic.filters.q3}
        onChangeFilters={logic.onChangeFilters}
        countAll={logic.countAll}
        countActive={logic.countConfirmed}
        countInactive={logic.countUnconfirmed}
        searchField={logic.searchField}
        setSearchField={logic.setSearchField}
      />

      <OperationTable
        rows={logic.filtered}
        onViewDetail={(row) => navigate(`/dashboard/organization/${row.id}`)}
        onDeactivate={(row) => {
          // 비활성화 로직 추가
          console.log('비활성화:', row);
        }}
        onDelete={(row) => {
          // 삭제 로직 추가
          console.log('삭제:', row);
        }}
      />

      <Divider sx={{ mt: 2, mb: 1 }} />

      <OperationPagination
        count={logic.total}
        page={logic.page}
        rowsPerPage={logic.rowsPerPage}
        onChangePage={logic.onChangePage}
        onChangeRowsPerPage={logic.onChangeRowsPerPage}
      />
    </>
  );

  return (
    <DashboardContent maxWidth="xl">
      <Typography variant="h4"> {title} </Typography>
      {description && <Typography sx={{ mt: 1 }}> {description} </Typography>}

      <Box sx={[(theme) => ({ mt: 2, width: 1 }), ...(Array.isArray(sx) ? sx : [sx])]}>
        {renderContent()}
      </Box>
    </DashboardContent>
  );
}
