import type { Theme, SxProps } from '@mui/material/styles';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { useState } from 'react';

import { DashboardContent } from 'src/layouts/dashboard';
import OrganizationBreadcrumbs from './components/Breadcrumbs';
import OrganizationTabs from './components/Tabs';
import OrganizationFilters from './components/Filters';
import OrganizationTable from './components/Table';
import OrganizationPagination from './components/Pagination';
import CreateOrganizationModal, {
  type OrganizationFormData,
} from './components/CreateOrganizationModal';
import { useOrganization } from './hooks/use-organization';
import { useNavigate } from 'react-router';
import React from 'react';
import { mockMembers } from 'src/_mock';
import { paths } from 'src/routes/paths';
import dayjs from 'dayjs';

// ----------------------------------------------------------------------

type Props = {
  title?: string;
  description?: string;
  sx?: SxProps<Theme>;
};

export function OrganizationView({ title = 'Blank', description, sx }: Props) {
  // TODO: TanStack Query Hook(useQuery)으로 조직 목록 가져오기
  // const { data: organizations, isLoading } = useQuery({
  //   queryKey: ['organizations', logic.filters, logic.tab, logic.division],
  //   queryFn: () => getOrganizations({ filters: logic.filters, tab: logic.tab, division: logic.division }),
  // });
  // 목업 데이터 사용
  const logic = useOrganization(mockMembers());
  const navigate = useNavigate();
  const [createModalOpen, setCreateModalOpen] = useState(false);

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
      <OrganizationTabs
        value={logic.tab}
        onChange={(tab) => {
          logic.onChangeTab(tab);
          // TODO: 탭 변경 시 TanStack Query로 조직 목록 새로고침
          // queryClient.invalidateQueries({ queryKey: ['organizations'] });
        }}
        counts={logic.counts}
      />

      <OrganizationFilters
        division={logic.division}
        onChangeDivision={logic.onChangeDivision}
        startDate={logic.filters.startDate ? dayjs(logic.filters.startDate) : null}
        onChangeStartDate={(date) => {
          logic.onChangeStartDate(date);
          // TODO: 시작일 변경 시 TanStack Query로 조직 목록 새로고침
          // queryClient.invalidateQueries({ queryKey: ['organizations'] });
        }}
        endDate={logic.filters.endDate ? dayjs(logic.filters.endDate) : null}
        onChangeEndDate={(date) => {
          logic.onChangeEndDate(date);
          // TODO: 종료일 변경 시 TanStack Query로 조직 목록 새로고침
          // queryClient.invalidateQueries({ queryKey: ['organizations'] });
        }}
        searchField={logic.searchField}
        onChangeSearchField={logic.onChangeSearchField}
        searchValue={logic.filters.searchValue}
        onChangeSearchValue={(value) => {
          logic.onChangeSearchValue(value);
          // TODO: 검색 값 변경 시 TanStack Query로 조직 목록 새로고침
          // queryClient.invalidateQueries({ queryKey: ['organizations'] });
        }}
      />

      <OrganizationTable
        rows={logic.filtered}
        onViewDetail={(row) =>
          navigate(paths.dashboard.organization.detail(row.companyIdx.toString()))
        }
        onDeactivate={(row) => {
          // TODO: TanStack Query Hook(useMutation)으로 조직 비활성화
          // const mutation = useMutation({
          //   mutationFn: () => deactivateOrganization(row.companyIdx),
          //   onSuccess: () => {
          //     queryClient.invalidateQueries({ queryKey: ['organizations'] });
          //   },
          // });
          // mutation.mutate();
          console.log('비활성화:', row);
        }}
        onDelete={(row) => {
          // TODO: TanStack Query Hook(useMutation)으로 조직 삭제
          // const mutation = useMutation({
          //   mutationFn: () => deleteOrganization(row.companyIdx),
          //   onSuccess: () => {
          //     queryClient.invalidateQueries({ queryKey: ['organizations'] });
          //   },
          // });
          // mutation.mutate();
          console.log('삭제:', row);
        }}
      />

      <OrganizationPagination
        count={logic.total}
        page={logic.page}
        rowsPerPage={logic.rowsPerPage}
        onChangePage={logic.onChangePage}
        onChangeRowsPerPage={logic.onChangeRowsPerPage}
      />
    </Box>
  );

  return (
    <DashboardContent maxWidth="xl">
      <Typography variant="h4"> {title} </Typography>
      {description && <Typography sx={{ mt: 1 }}> {description} </Typography>}

      <OrganizationBreadcrumbs
        items={[{ label: '대시보드', href: '/' }, { label: title }]}
        onCreate={() => setCreateModalOpen(true)}
      />

      <Box sx={[(theme) => ({ mt: 2, width: 1 }), ...(Array.isArray(sx) ? sx : [sx])]}>
        {renderContent()}
      </Box>

      <CreateOrganizationModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSave={(data: OrganizationFormData) => {
          // TODO: TanStack Query Hook(useMutation)으로 조직 등록
          // const mutation = useMutation({
          //   mutationFn: (formData: OrganizationFormData) => createOrganization(formData),
          //   onSuccess: () => {
          //     queryClient.invalidateQueries({ queryKey: ['organizations'] });
          //     setCreateModalOpen(false);
          //   },
          // });
          // mutation.mutate(data);
          console.log('조직 등록:', data);
        }}
      />
    </DashboardContent>
  );
}
