import type { Theme, SxProps } from '@mui/material/styles';

import { DashboardContent } from 'src/layouts/dashboard';
import OrganizationForm from '../components/Form';
import OrganizationFilters from '../components/Filters';
import OrganizationPagination from '../components/Pagination';
import { _organizationMembers } from 'src/_mock';
import { useOrganization } from '../hooks/use-organization';
import OrganizationTableEdit from './components/Table';
import type { OrganizationMember } from 'src/_mock/_organization';

type Props = {
  value: OrganizationMember | null;
  lastAccessIp?: string;
  sx?: SxProps<Theme>;
};

export default function OrganizationEditView({ value, lastAccessIp, sx }: Props) {
  const logic = useOrganization(_organizationMembers);

  return (
    <DashboardContent maxWidth="xl">
      <OrganizationForm
        mode="edit"
        value={value}
        lastAccessIp={lastAccessIp}
        onCancel={() => window.history.back()}
        onSearchAddress={() => {}}
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

      <OrganizationTableEdit rows={logic.filtered} />

      <OrganizationPagination
        count={logic.total}
        page={logic.page}
        rowsPerPage={logic.rowsPerPage}
        onChangePage={logic.onChangePage}
        onChangeRowsPerPage={logic.onChangeRowsPerPage}
      />
    </DashboardContent>
  );
}


