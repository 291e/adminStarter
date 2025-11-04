import type { Theme, SxProps } from '@mui/material/styles';

import { varAlpha } from 'minimal-shared/utils';

import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { mockSafetyReports } from 'src/_mock/_safety-report';
import { DashboardContent } from 'src/layouts/dashboard';

import { useNavigate } from 'react-router';
import React from 'react';
import { useSafetyReport } from './hooks/use-safety';
import SafetyReportBreadcrumbs from './components/Breadcrumbs';
import SafetyReportFilters from './components/Filters';
import SafetyReportTable from './components/Table';
import SafetyReportPagination from './components/Pagination';

// ----------------------------------------------------------------------

type Props = {
  title?: string;
  description?: string;
  sx?: SxProps<Theme>;
};

export function SafetyReportView({ title = 'Blank', description, sx }: Props) {
  const reports = mockSafetyReports(20);
  const logic = useSafetyReport(reports);
  const navigate = useNavigate();

  const renderContent = () => (
    <>
      <SafetyReportBreadcrumbs
        items={[{ label: '대시보드', href: '/' }, { label: title }]}
        onCreate={() => navigate('/dashboard/safety-report/create')}
        onDocumentTypeManagement={() =>
          navigate('/dashboard/safety-report/document-type-management')
        }
      />

      <SafetyReportFilters
        documentType={logic.documentType}
        onChangeDocumentType={logic.onChangeDocumentType}
        searchField={logic.searchField}
        onChangeSearchField={logic.onChangeSearchField}
        searchValue={logic.searchValue}
        onChangeSearchValue={logic.onChangeSearchValue}
      />

      <SafetyReportTable
        rows={logic.filtered}
        onViewDetail={(row) => navigate(`/dashboard/safety-report/${row.id}`)}
        onEdit={(row) => {
          console.log('편집:', row);
        }}
      />

      <Divider sx={{ mt: 2, mb: 1 }} />

      <SafetyReportPagination
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
