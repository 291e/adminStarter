import type { Theme, SxProps } from '@mui/material/styles';

import { varAlpha } from 'minimal-shared/utils';

import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { DashboardContent } from 'src/layouts/dashboard';
import OrganizationBreadcrumbs from './components/Breadcrumbs';
import OrganizationFilters from './components/Filters';
import OrganizationTable from './components/Table';
import OrganizationPagination from './components/Pagination';
import { useOrganization } from './hooks/use-organization';
import { useNavigate } from 'react-router';
import React from 'react';
import { mockMembers } from 'src/_mock';

// ----------------------------------------------------------------------

type Props = {
  title?: string;
  description?: string;
  sx?: SxProps<Theme>;
};

export function OrganizationView({ title = 'Blank', description, sx }: Props) {
  const logic = useOrganization(mockMembers());
  const navigate = useNavigate();

  const renderContent = () => (
    <>
      <OrganizationBreadcrumbs
        items={[{ label: 'Dashboard', href: '/' }, { label: title }]}
        onCreate={() => navigate('/dashboard/organization/create')}
      />

      <OrganizationFilters
        tab={logic.tab}
        onChangeTab={logic.onChangeTab}
        q1={logic.filters.q1}
        q2={logic.filters.q2}
        q3={logic.filters.q3}
        onChangeFilters={logic.onChangeFilters}
        countAll={logic.countAll}
        countActive={logic.countActive}
        countInactive={logic.countInactive}
        searchField={logic.searchField}
        setSearchField={logic.setSearchField}
      />

      <OrganizationTable
        rows={logic.filtered}
        onViewDetail={(row) => navigate(`/dashboard/organization/${row.memberIdx}`)}
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

      <OrganizationPagination
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
