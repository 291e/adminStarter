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
import { useNavigate } from 'react-router';
import React from 'react';
import { paths } from 'src/routes/paths';
import dayjs from 'dayjs';
import {
  useCreateOrganization,
  useDeactivateOrganization,
  useDeleteOrganization,
} from './hooks/use-organization-api';
import { useOrganization } from './hooks/use-organization';
import type { Organization } from 'src/services/organization/organization.types';

// ----------------------------------------------------------------------

type Props = {
  title?: string;
  description?: string;
  sx?: SxProps<Theme>;
};

export function OrganizationView({ title = 'Blank', description, sx }: Props) {
  const navigate = useNavigate();
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // 필터, 페이지네이션, API 호출을 모두 포함한 hook 사용
  const {
    tab,
    onChangeTab,
    division,
    onChangeDivision,
    filters,
    onChangeStartDate,
    onChangeEndDate,
    searchField,
    onChangeSearchField,
    onChangeSearchValue,
    page,
    rowsPerPage,
    onChangePage,
    onChangeRowsPerPage,
    organizations,
    counts,
    total,
    isLoading,
    error: organizationsError,
  } = useOrganization();

  // Mutations
  const createOrganizationMutation = useCreateOrganization();
  const deactivateOrganizationMutation = useDeactivateOrganization();
  const deleteOrganizationMutation = useDeleteOrganization();

  const handleViewDetail = (row: Organization) => {
    navigate(paths.dashboard.organization.detail(row.companyIdx.toString()));
  };

  const handleDeactivate = async (row: Organization) => {
    try {
      await deactivateOrganizationMutation.mutateAsync(row.companyIdx);
      if (import.meta.env.DEV) {
        console.log('✅ 조직 비활성화 완료:', row.companyIdx);
      }
    } catch (error) {
      console.error('❌ 조직 비활성화 실패:', error);
    }
  };

  const handleDelete = async (row: Organization) => {
    try {
      await deleteOrganizationMutation.mutateAsync(row.companyIdx);
      if (import.meta.env.DEV) {
        console.log('✅ 조직 삭제 완료:', row.companyIdx);
      }
    } catch (error) {
      console.error('❌ 조직 삭제 실패:', error);
    }
  };

  const handleSaveCreate = async (data: OrganizationFormData) => {
    try {
      // OrganizationFormData를 CreateOrganizationParams로 변환
      const params = {
        companyName: data.organizationName,
        companyType: data.companyType, // 필수 필드
        businessNumber: data.businessNumber,
        representativeName: data.representativeName,
        representativePhone: data.representativePhone,
        representativeEmail: data.representativeEmail,
        businessType: data.businessCategory,
        businessCategory: data.businessItem,
        address: data.address,
        addressDetail: data.detailAddress,
        manager: data.manager,
        subscriptionService: data.subscriptionService,
        sendInviteEmail: data.sendInvitationEmail,
      };

      await createOrganizationMutation.mutateAsync(params);
      setCreateModalOpen(false);
      if (import.meta.env.DEV) {
        console.log('✅ 조직 등록 완료');
      }
    } catch (error) {
      console.error('❌ 조직 등록 실패:', error);
    }
  };

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
      <OrganizationTabs value={tab} onChange={onChangeTab} counts={counts} />

      <OrganizationFilters
        division={division}
        onChangeDivision={onChangeDivision}
        startDate={filters.startDate ? dayjs(filters.startDate) : null}
        onChangeStartDate={onChangeStartDate}
        endDate={filters.endDate ? dayjs(filters.endDate) : null}
        onChangeEndDate={onChangeEndDate}
        searchField={searchField}
        onChangeSearchField={onChangeSearchField}
        searchValue={filters.searchValue}
        onChangeSearchValue={onChangeSearchValue}
      />

      {isLoading && (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            데이터를 불러오는 중...
          </Typography>
        </Box>
      )}

      {organizationsError && (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="error">
            데이터를 불러오는 중 오류가 발생했습니다.
          </Typography>
        </Box>
      )}

      {!isLoading && !organizationsError && (
        <>
          <OrganizationTable
            rows={organizations}
            onViewDetail={handleViewDetail}
            onDeactivate={handleDeactivate}
            onDelete={handleDelete}
          />

          <OrganizationPagination
            count={total}
            page={page - 1}
            rowsPerPage={rowsPerPage}
            onChangePage={(newPage) => onChangePage(newPage + 1)}
            onChangeRowsPerPage={onChangeRowsPerPage}
          />
        </>
      )}
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
        onSave={handleSaveCreate}
      />
    </DashboardContent>
  );
}
