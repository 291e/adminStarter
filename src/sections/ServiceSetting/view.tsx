import { useState } from 'react';

import type { Theme, SxProps } from '@mui/material/styles';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { DashboardContent } from 'src/layouts/dashboard';
import ServiceSettingBreadcrumbs from './components/Breadcrumbs';
import ServiceSettingFilters from './components/Filters';
import ServiceSettingTable from './components/Table';
import ServiceSettingPagination from './components/Pagination';
import CreateServiceModal, { type ServiceFormData } from './components/CreateServiceModal';
import EditServiceModal, { type ServiceEditFormData } from './components/EditServiceModal';
import { useServiceSetting } from './hooks/use-service-setting';
import { mockServiceSettings, type ServiceSetting } from 'src/_mock/_service-setting';

// ----------------------------------------------------------------------

type Props = {
  title?: string;
  description?: string;
  sx?: SxProps<Theme>;
};

export function ServiceSettingView({ title = '서비스 관리', description, sx }: Props) {
  // TODO: TanStack Query Hook(useQuery)으로 서비스 목록 가져오기
  // const { data: services, isLoading, error } = useQuery({
  //   queryKey: ['serviceSettings', logic.filters],
  //   queryFn: () => getServiceSettings({ filters: logic.filters }),
  // });
  // 목업 데이터 사용
  const services = mockServiceSettings(20);
  const logic = useServiceSetting(services);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceSetting | null>(null);

  const renderContent = () => (
    <Box
      sx={{
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
          // TODO: 상태 필터 변경 시 TanStack Query로 서비스 목록 새로고침
          // queryClient.invalidateQueries({ queryKey: ['serviceSettings'] });
        }}
        searchFilter={logic.filters.searchFilter}
        onChangeSearchFilter={(filter) => {
          logic.onChangeSearchFilter(filter);
          // TODO: 검색 필터 변경 시 TanStack Query로 서비스 목록 새로고침
          // queryClient.invalidateQueries({ queryKey: ['serviceSettings'] });
        }}
        searchValue={logic.filters.searchValue}
        onChangeSearchValue={(value) => {
          logic.onChangeSearchValue(value);
          // TODO: 검색 값 변경 시 TanStack Query로 서비스 목록 새로고침
          // queryClient.invalidateQueries({ queryKey: ['serviceSettings'] });
        }}
      />

      <ServiceSettingTable
        rows={logic.filtered}
        onViewDetail={(row) => {
          // TODO: 서비스 상세 페이지로 이동 또는 TanStack Query Hook(useQuery)으로 상세 정보 가져오기
          // const { data: detail } = useQuery({
          //   queryKey: ['serviceDetail', row.id],
          //   queryFn: () => getServiceDetail(row.id),
          // });
          console.log('서비스 상세 보기:', row);
        }}
        onEdit={(row) => {
          setSelectedService(row);
          setEditModalOpen(true);
          // TODO: TanStack Query Hook(useQuery)으로 서비스 상세 정보 가져오기 (수정 모달용)
          // const { data: detail } = useQuery({
          //   queryKey: ['serviceDetail', row.id],
          //   queryFn: () => getServiceDetail(row.id),
          // });
        }}
        onDeactivate={(row) => {
          // TODO: TanStack Query Hook(useMutation)으로 서비스 비활성화
          // const mutation = useMutation({
          //   mutationFn: () => deactivateService(row.id),
          //   onSuccess: () => {
          //     queryClient.invalidateQueries({ queryKey: ['serviceSettings'] });
          //   },
          // });
          // mutation.mutate();
          console.log('서비스 비활성화:', row);
        }}
        onDelete={(row) => {
          // TODO: TanStack Query Hook(useMutation)으로 서비스 삭제
          // const mutation = useMutation({
          //   mutationFn: () => deleteService(row.id),
          //   onSuccess: () => {
          //     queryClient.invalidateQueries({ queryKey: ['serviceSettings'] });
          //   },
          // });
          // mutation.mutate();
          console.log('서비스 삭제:', row);
        }}
      />

      <ServiceSettingPagination
        count={logic.total}
        page={logic.page}
        rowsPerPage={logic.rowsPerPage}
        onChangePage={(page) => {
          logic.onChangePage(page);
          // TODO: 페이지 변경 시 TanStack Query로 서비스 목록 새로고침
          // queryClient.invalidateQueries({ queryKey: ['serviceSettings'] });
        }}
        onChangeRowsPerPage={(rowsPerPage) => {
          logic.onChangeRowsPerPage(rowsPerPage);
          // TODO: 페이지 크기 변경 시 TanStack Query로 서비스 목록 새로고침
          // queryClient.invalidateQueries({ queryKey: ['serviceSettings'] });
        }}
      />
    </Box>
  );

  const handleCreate = () => {
    setCreateModalOpen(true);
  };

  const handleSaveService = (data: ServiceFormData) => {
    // TODO: TanStack Query Hook(useMutation)으로 서비스 등록
    // const mutation = useMutation({
    //   mutationFn: (formData: ServiceFormData) => createService({
    //     serviceName: formData.serviceName,
    //     servicePeriod: formData.servicePeriod,
    //     memberCount: Number(formData.memberCount),
    //     monthlyFee: Number(formData.monthlyFee),
    //   }),
    //   onSuccess: () => {
    //     queryClient.invalidateQueries({ queryKey: ['serviceSettings'] });
    //     setCreateModalOpen(false);
    //   },
    // });
    // mutation.mutate(data);
    console.log('서비스 등록:', data);
  };

  const handleSaveEditService = (data: ServiceEditFormData) => {
    if (!selectedService) return;

    // TODO: TanStack Query Hook(useMutation)으로 서비스 수정
    // const mutation = useMutation({
    //   mutationFn: (formData: ServiceEditFormData) => updateService(selectedService.id, {
    //     serviceName: formData.serviceName,
    //     servicePeriod: formData.servicePeriod,
    //     memberCount: Number(formData.memberCount),
    //     monthlyFee: Number(formData.monthlyFee),
    //     status: formData.status,
    //   }),
    //   onSuccess: () => {
    //     queryClient.invalidateQueries({ queryKey: ['serviceSettings'] });
    //     queryClient.invalidateQueries({ queryKey: ['serviceDetail', selectedService.id] });
    //     setEditModalOpen(false);
    //     setSelectedService(null);
    //   },
    // });
    // mutation.mutate(data);
    console.log('서비스 수정:', data);
  };

  return (
    <DashboardContent maxWidth="xl">
      <Typography variant="h4">{title}</Typography>
      {description && <Typography sx={{ mt: 1 }}>{description}</Typography>}

      <ServiceSettingBreadcrumbs
        items={[
          { label: '대시보드', href: '/dashboard' },
          { label: '설정 및 관리', href: '/dashboard/system-setting' },
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
