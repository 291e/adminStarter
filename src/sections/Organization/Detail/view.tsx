import { useParams, useNavigate } from 'react-router';

import type { Theme, SxProps } from '@mui/material/styles';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';

import { DashboardContent } from 'src/layouts/dashboard';
import { Iconify } from 'src/components/iconify';
import { mockMembers } from 'src/_mock';
import { mockCompanies } from 'src/_mock/_company';

import { useOrganizationDetail } from './hooks/use-organization-detail';
import OrganizationInfo from './components/OrganizationInfo';
import MemberTabs from './components/MemberTabs';
import MemberFilters from './components/MemberFilters';
import MemberTable from './components/MemberTable';
import MemberPagination from './components/MemberPagination';

// ----------------------------------------------------------------------

type Props = {
  title?: string;
  description?: string;
  sx?: SxProps<Theme>;
};

export function OrganizationDetailView({ title = '조직 관리', description, sx }: Props) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // TODO: TanStack Query Hook(useQuery)으로 조직 정보 및 멤버 목록 가져오기
  // const { data: organization } = useQuery({
  //   queryKey: ['organization', id],
  //   queryFn: () => getOrganizationDetail(id!),
  //   enabled: !!id,
  // });
  // const { data: members } = useQuery({
  //   queryKey: ['organizationMembers', id],
  //   queryFn: () => getOrganizationMembers(id!),
  //   enabled: !!id,
  // });
  // 목업 데이터 사용
  const allMembers = mockMembers(50);
  const allCompanies = mockCompanies();
  const organizationId = id ? parseInt(id, 10) : null;

  // 해당 조직의 멤버들 필터링
  const organizationMembers = organizationId
    ? allMembers.filter((member) => member.companyIdx === organizationId)
    : [];

  // 조직 정보 찾기
  const organization = organizationId
    ? allCompanies.find((company) => company.companyIdx === organizationId)
    : undefined;

  const logic = useOrganizationDetail(organizationMembers);

  const handleBack = () => {
    navigate('/dashboard/organization');
  };

  return (
    <DashboardContent maxWidth="xl">
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
        <IconButton onClick={handleBack} sx={{ p: 0 }}>
          <Iconify icon="eva:arrow-ios-back-fill" width={24} />
        </IconButton>
        <Typography variant="h4">{title}</Typography>
      </Stack>
      {description && <Typography sx={{ mt: 1, mb: 2 }}>{description}</Typography>}

      <Box sx={[(theme) => ({ mt: 2, width: 1 }), ...(Array.isArray(sx) ? sx : [sx])]}>
        {/* 조직 정보 섹션 */}
        <OrganizationInfo
          organization={organization}
          organizationMembers={organizationMembers}
          onInviteMember={() => {
            // TODO: 조직원 초대 모달 열기 또는 TanStack Query Hook(useMutation)으로 조직원 초대
            // const mutation = useMutation({
            //   mutationFn: (email: string) => inviteOrganizationMember(organizationId!, email),
            //   onSuccess: () => {
            //     queryClient.invalidateQueries({ queryKey: ['organizationMembers', organizationId] });
            //   },
            // });
            console.log('조직원 초대');
          }}
          onEditOrganization={() => {
            // TODO: 조직정보 수정 모달 열기 또는 TanStack Query Hook(useMutation)으로 조직정보 수정
            // const mutation = useMutation({
            //   mutationFn: (data: OrganizationFormData) => updateOrganization(organizationId!, data),
            //   onSuccess: () => {
            //     queryClient.invalidateQueries({ queryKey: ['organization', organizationId] });
            //   },
            // });
            console.log('조직정보 수정');
          }}
        />

        {/* 멤버 리스트 섹션 */}
        <Box
          sx={{
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: (theme) => theme.customShadows.card,
            overflow: 'hidden',
            mt: 3,
          }}
        >
          <MemberTabs
            value={logic.filters.tab}
            onChange={logic.onChangeTab}
            counts={logic.counts}
          />

          <MemberFilters
            role={logic.filters.role}
            onChangeRole={logic.onChangeRole}
            searchFilter={logic.filters.searchFilter}
            onChangeSearchFilter={logic.onChangeSearchFilter}
            searchValue={logic.filters.searchValue}
            onChangeSearchValue={logic.onChangeSearchValue}
          />

          <MemberTable
            rows={logic.filtered}
            onEdit={(member) => {
              // TODO: 멤버 수정 모달 열기 또는 TanStack Query Hook(useMutation)으로 멤버 수정
              // const mutation = useMutation({
              //   mutationFn: (data: MemberFormData) => updateMember(member.memberIdx, data),
              //   onSuccess: () => {
              //     queryClient.invalidateQueries({ queryKey: ['organizationMembers', organizationId] });
              //   },
              // });
              console.log('멤버 수정:', member);
            }}
          />

          <MemberPagination
            count={logic.total}
            page={logic.page}
            rowsPerPage={logic.rowsPerPage}
            onChangePage={logic.onChangePage}
            onChangeRowsPerPage={logic.onChangeRowsPerPage}
          />
        </Box>
      </Box>
    </DashboardContent>
  );
}
