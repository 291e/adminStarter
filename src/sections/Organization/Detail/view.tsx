import { useParams, useNavigate } from 'react-router';
import { useState } from 'react';

import type { Theme, SxProps } from '@mui/material/styles';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';

import { DashboardContent } from 'src/layouts/dashboard';
import { Iconify } from 'src/components/iconify';
import { useOrganizationDetail as useOrganizationDetailApi } from 'src/sections/Organization/hooks/use-organization-api';
import { useOrganizationDetail } from './hooks/use-organization-detail';
import { useAuthContext } from 'src/auth/hooks/use-auth-context';
import { useMyInfo } from 'src/sections/Chat/hooks/use-my-info';
import OrganizationInfo from './components/OrganizationInfo';
import MemberTabs from './components/MemberTabs';
import MemberFilters from './components/MemberFilters';
import MemberTable from './components/MemberTable';
import MemberPagination from './components/MemberPagination';
import EditMemberModal from './components/EditMemberModal';
import type { Organization } from 'src/services/organization/organization.types';
import type { Member } from 'src/sections/Organization/types/member';

// ----------------------------------------------------------------------

type Props = {
  title?: string;
  description?: string;
  sx?: SxProps<Theme>;
};

export function OrganizationDetailView({ title = '조직 관리', description, sx }: Props) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { data: myInfo } = useMyInfo();
  const [activeTab, setActiveTab] = useState(0);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);

  // 현재 사용자 역할 및 슈퍼 어드민 여부 추출
  const currentUserRole = ((myInfo as any)?.memberRole || (user as any)?.memberRole) as
    | 'OPERATOR_MANAGER'
    | 'MANAGEMENT_SUPERVISOR'
    | 'SAFETY_MANAGER'
    | 'WORKER'
    | null;
  const isSuperAdmin =
    (myInfo as any)?.isSuperAdmin === true || (user as any)?.isSuperAdmin === true;

  const organizationId = id ? parseInt(id, 10) : null;

  // 조직 상세 정보 조회
  const {
    data: organizationDetailData,
    isLoading: isLoadingOrganization,
    isError: isErrorOrganization,
  } = useOrganizationDetailApi({
    companyIdx: organizationId || 0,
  });

  // axios interceptor가 응답을 평탄화하므로 organizationDetailData는 OrganizationDetail 타입
  // 실제 API 응답 구조: { ...organizationFields, companyMemberList: [...], header: {...} }
  // 즉, organization 필드가 없고 직접 Organization 필드들이 있음
  const responseData = organizationDetailData as any;
  const organization =
    responseData?.organization ||
    (responseData?.companyIdx ? (responseData as Organization) : null);

  // 멤버 목록 및 필터링 로직 (조직 상세 API 응답의 companyMemberList 사용)
  const companyMemberList = responseData?.companyMemberList;
  const logic = useOrganizationDetail(organizationId, companyMemberList);

  const handleBack = () => {
    navigate('/dashboard/organization');
  };

  // 로딩 상태
  if (isLoadingOrganization) {
    return (
      <DashboardContent maxWidth="xl">
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
          <IconButton onClick={handleBack} sx={{ p: 0 }}>
            <Iconify icon="eva:arrow-ios-back-fill" width={24} />
          </IconButton>
          <Typography variant="h4">{title}</Typography>
        </Stack>
        <Box
          sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}
        >
          <CircularProgress />
        </Box>
      </DashboardContent>
    );
  }

  // 에러 상태
  if (isErrorOrganization || !organization) {
    return (
      <DashboardContent maxWidth="xl">
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
          <IconButton onClick={handleBack} sx={{ p: 0 }}>
            <Iconify icon="eva:arrow-ios-back-fill" width={24} />
          </IconButton>
          <Typography variant="h4">{title}</Typography>
        </Stack>
        <Alert severity="error" sx={{ mt: 2 }}>
          조직 정보를 불러오는 중 오류가 발생했습니다.
        </Alert>
      </DashboardContent>
    );
  }

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
          organization={organization as Organization}
          organizationId={organizationId || 0}
          companyMemberList={companyMemberList}
          onTabChange={(tabValue) => {
            setActiveTab(tabValue);
          }}
        />

        {/* 멤버 리스트 섹션 - 조직 정보 탭일 때만 표시 */}
        {activeTab === 0 && (
          <Box
            sx={{
              bgcolor: 'background.paper',
              borderRadius: 2,
              boxShadow: (theme) => theme.customShadows.card,
              overflow: 'hidden',
              mt: 3,
            }}
          >
            {logic.isLoading ? (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  minHeight: 200,
                }}
              >
                <CircularProgress />
              </Box>
            ) : logic.isError ? (
              <Alert severity="error" sx={{ m: 2 }}>
                멤버 목록을 불러오는 중 오류가 발생했습니다.
              </Alert>
            ) : (
              <>
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
                  organizationId={organizationId?.toString()}
                  rows={logic.filtered}
                  currentUserRole={currentUserRole}
                  isSuperAdmin={isSuperAdmin}
                  onEdit={(member) => {
                    setSelectedMember(member);
                    setEditModalOpen(true);
                  }}
                />

                <EditMemberModal
                  open={editModalOpen}
                  onClose={() => {
                    setEditModalOpen(false);
                    setSelectedMember(null);
                  }}
                  member={selectedMember}
                  organization={organization}
                  currentUserRole={currentUserRole}
                  isSuperAdmin={isSuperAdmin}
                  onUpdated={() => {
                    // 쿼리 무효화는 모달 내부에서 처리됨
                  }}
                  onDeleted={() => {
                    // 쿼리 무효화는 모달 내부에서 처리됨
                  }}
                />

                <MemberPagination
                  count={logic.total}
                  page={logic.page}
                  rowsPerPage={logic.rowsPerPage}
                  onChangePage={logic.onChangePage}
                  onChangeRowsPerPage={logic.onChangeRowsPerPage}
                />
              </>
            )}
          </Box>
        )}
      </Box>
    </DashboardContent>
  );
}
