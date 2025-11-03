import type { Theme, SxProps } from '@mui/material/styles';

import { varAlpha } from 'minimal-shared/utils';

import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { _organizationMembers } from 'src/_mock';
import { DashboardContent } from 'src/layouts/dashboard';
import OrganizationBreadcrumbs from './components/Breadcrumbs';
import OrganizationFilters from './components/Filters';
import OrganizationTable from './components/Table';
import OrganizationPagination from './components/Pagination';
import { useOrganization } from './hooks/use-organization';
import type { OrganizationMember } from 'src/_mock/_organization';
import { useNavigate } from 'react-router';
import React from 'react';

// ----------------------------------------------------------------------

type Props = {
  title?: string;
  description?: string;
  sx?: SxProps<Theme>;
};

export function OrganizationView({ title = 'Blank', description, sx }: Props) {
  const logic = useOrganization(_organizationMembers);
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
        onEdit={(row) => navigate(`/dashboard/organization/${row.id}/edit`)}
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
