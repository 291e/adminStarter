import { useState, useCallback } from 'react';

import type { Theme, SxProps } from '@mui/material/styles';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';

import { DashboardContent } from 'src/layouts/dashboard';
import ServiceSettingBreadcrumbs from './components/Breadcrumbs';
import ServiceSettingFilters from './components/Filters';
import ServiceSettingTable from './components/Table';
import ServiceSettingPagination from './components/Pagination';
import AdminSubscriptionChart from 'src/sections/AdminDashBoard/components/AdminSubscriptionChart';
import CreateServiceModal, { type ServiceFormData } from './components/CreateServiceModal';
import EditServiceModal, { type ServiceEditFormData } from './components/EditServiceModal';
import { useServiceSetting } from './hooks/use-service-setting';
import {
  useServices,
  useCreateService,
  useUpdateService,
  useDeactivateService,
  useDeleteService,
} from './hooks/use-service-setting-api';
import type { ServiceSetting } from 'src/services/service-setting/service-setting.types';

// ----------------------------------------------------------------------

type Props = {
  title?: string;
  description?: string;
  sx?: SxProps<Theme>;
};

export function ServiceSettingView({ title = '서비스 관리', description, sx }: Props) {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceSetting | null>(null);

  // 필터 상태 (서버 사이드 필터링을 위해)
  const [filters, setFilters] = useState({
    status: undefined as 'ACTIVE' | 'INACTIVE' | undefined,
    search: undefined as string | undefined,
  });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // 서비스 목록 조회
  const servicesQuery = useServices({
    page,
    pageSize,
    status: filters.status,
    search: filters.search,
  });

  const services = servicesQuery.data?.serviceSettingList ?? [];
  const totalCount = servicesQuery.data?.totalCount ?? 0;

  // 클라이언트 사이드 필터링 및 페이지네이션 (필요시)
  const logic = useServiceSetting(services);

  const createServiceMutation = useCreateService();
  const updateServiceMutation = useUpdateService();
  const deactivateServiceMutation = useDeactivateService();
  const deleteServiceMutation = useDeleteService();

  const renderContent = () => {
    if (servicesQuery.isLoading) {
      return (
        <Stack alignItems="center" justifyContent="center" sx={{ py: 5 }}>
          <CircularProgress />
        </Stack>
      );
    }

    if (servicesQuery.isError) {
      return (
        <Alert severity="error" sx={{ m: 2 }}>
          서비스 데이터를 불러오는 중 오류가 발생했습니다.
        </Alert>
      );
    }

    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap',
          alignItems: 'stretch',
          gap: 3,
          width: '100%',
        }}
      >
        <Box sx={{ flex: '1 1 320px', minWidth: 280, maxWidth: { xs: '100%' } }}>
          <AdminSubscriptionChart title="구독 서비스 현황" sx={{ height: '100%' }} />
        </Box>

        <Box
          sx={{
            flex: '2 1 760px',
            minWidth: 0,
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: (theme) => theme.customShadows.card,
            width: '100%',
            overflow: 'hidden',
          }}
        >
          <ServiceSettingFilters
            status={logic.filters.status}
            onChangeStatus={(status) => {
              logic.onChangeStatus(status);
              // '활성' -> 'ACTIVE', '비활성' -> 'INACTIVE', '전체' -> undefined
              const statusValue =
                status === 'all' || status === '전체'
                  ? undefined
                  : status === 'active' || status === '활성'
                    ? 'ACTIVE'
                    : status === 'inactive' || status === '비활성'
                      ? 'INACTIVE'
                      : (status as 'ACTIVE' | 'INACTIVE');
              setFilters((prev) => ({ ...prev, status: statusValue }));
              setPage(1);
            }}
            searchFilter={logic.filters.searchFilter}
            onChangeSearchFilter={(filter) => {
              logic.onChangeSearchFilter(filter);
            }}
            searchValue={logic.filters.searchValue}
            onChangeSearchValue={(value) => {
              logic.onChangeSearchValue(value);
              setFilters((prev) => ({ ...prev, search: value || undefined }));
              setPage(1);
            }}
          />

          <ServiceSettingTable
            rows={logic.filtered}
            onViewDetail={(row) => {
              if (import.meta.env.DEV) {
                console.log('서비스 상세 보기:', row);
              }
            }}
            onEdit={(row) => {
              setSelectedService(row);
              setEditModalOpen(true);
            }}
            onDeactivate={async (row) => {
              if (!row.serviceSettingIdx) {
                console.error('서비스 ID가 없습니다.');
                return;
              }
              try {
                await deactivateServiceMutation.mutateAsync({
                  serviceSettingIdx: row.serviceSettingIdx,
                });
                if (import.meta.env.DEV) {
                  console.log('서비스 비활성화 성공:', row);
                }
              } catch (error) {
                console.error('서비스 비활성화 실패:', error);
              }
            }}
            onDelete={async (row) => {
              if (!row.serviceSettingIdx) {
                console.error('서비스 ID가 없습니다.');
                return;
              }
              if (window.confirm('정말 삭제하시겠습니까?')) {
                try {
                  await deleteServiceMutation.mutateAsync({
                    serviceSettingIdx: row.serviceSettingIdx,
                  });
                  if (import.meta.env.DEV) {
                    console.log('서비스 삭제 성공:', row);
                  }
                } catch (error) {
                  console.error('서비스 삭제 실패:', error);
                }
              }
            }}
          />

          <ServiceSettingPagination
            count={totalCount}
            page={page - 1}
            rowsPerPage={pageSize}
            onChangePage={(newPage) => {
              setPage(newPage + 1);
            }}
            onChangeRowsPerPage={(newRowsPerPage) => {
              setPageSize(newRowsPerPage);
              setPage(1);
            }}
          />
        </Box>
      </Box>
    );
  };

  const handleCreate = () => {
    setCreateModalOpen(true);
  };

  const handleSaveService = useCallback(
    async (data: ServiceFormData) => {
      try {
        // servicePeriod를 숫자로 변환 (예: "1개월" -> 1, "3개월" -> 3)
        const servicePeriodNumber = parseInt(data.servicePeriod.replace('개월', ''), 10) || 1;

        await createServiceMutation.mutateAsync({
          serviceName: data.serviceName,
          servicePeriod: servicePeriodNumber,
          memberCount: Number(data.memberCount),
          monthlyFee: Number(data.monthlyFee),
        });
        setCreateModalOpen(false);
        if (import.meta.env.DEV) {
          console.log('서비스 등록 성공:', data);
        }
      } catch (error) {
        console.error('서비스 등록 실패:', error);
      }
    },
    [createServiceMutation]
  );

  const handleSaveEditService = useCallback(
    async (data: ServiceEditFormData) => {
      if (!selectedService?.serviceSettingIdx) {
        console.error('서비스 ID가 없습니다.');
        return;
      }

      try {
        // servicePeriod를 숫자로 변환 (예: "1개월" -> 1, "3개월" -> 3)
        const servicePeriodNumber = data.servicePeriod
          ? parseInt(data.servicePeriod.replace('개월', ''), 10) || undefined
          : undefined;

        await updateServiceMutation.mutateAsync({
          serviceSettingIdx: selectedService.serviceSettingIdx,
          serviceName: data.serviceName,
          servicePeriod: servicePeriodNumber,
          memberCount: Number(data.memberCount),
          monthlyFee: Number(data.monthlyFee),
          status: data.status === 'active' ? 'ACTIVE' : 'INACTIVE',
        });
        setEditModalOpen(false);
        setSelectedService(null);
        if (import.meta.env.DEV) {
          console.log('서비스 수정 성공:', data);
        }
      } catch (error) {
        console.error('서비스 수정 실패:', error);
      }
    },
    [selectedService, updateServiceMutation]
  );

  return (
    <DashboardContent maxWidth="xl">
      <Typography variant="h4">{title}</Typography>
      {description && <Typography sx={{ mt: 1 }}>{description}</Typography>}

      <ServiceSettingBreadcrumbs
        items={[
          { label: '대시보드', href: '/admin/dashboard' },
          { label: '설정 및 관리', href: '/admin/dashboard' },
          { label: title },
        ]}
        onCreate={handleCreate}
      />

      <Box sx={[(theme) => ({ mt: 2, width: 1 }), ...(Array.isArray(sx) ? sx : [sx])]}>
        {renderContent()}
      </Box>

      <CreateServiceModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSave={handleSaveService}
      />

      <EditServiceModal
        open={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedService(null);
        }}
        onSave={handleSaveEditService}
        initialData={selectedService}
      />
    </DashboardContent>
  );
}
