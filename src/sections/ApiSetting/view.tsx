import { useState } from 'react';

import type { Theme, SxProps } from '@mui/material/styles';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { DashboardContent } from 'src/layouts/dashboard';
import ApiSettingBreadcrumbs from './components/Breadcrumbs';
import ApiSettingTable from './components/Table';
import ApiSettingPagination from './components/Pagination';
import CreateApiModal, { type ApiFormData } from './components/CreateApiModal';
import EditApiModal, { type ApiEditFormData } from './components/EditApiModal';
import { useApiSetting } from './hooks/use-api-setting';
import { mockApiSettings, type ApiSetting } from 'src/_mock/_api-setting';

// ----------------------------------------------------------------------

type Props = {
  title?: string;
  description?: string;
  sx?: SxProps<Theme>;
};

export function ApiSettingView({ title = 'API 관리', description, sx }: Props) {
  // TODO: TanStack Query Hook(useQuery)으로 API 목록 가져오기
  // const { data: apis, isLoading, error } = useQuery({
  //   queryKey: ['apiSettings'],
  //   queryFn: () => getApiSettings(),
  // });
  // 목업 데이터 사용
  const apis = mockApiSettings(10);
  const logic = useApiSetting(apis);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedApi, setSelectedApi] = useState<ApiSetting | null>(null);

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
      <ApiSettingTable
        rows={logic.filtered}
        onEdit={(row) => {
          setSelectedApi(row);
          setEditModalOpen(true);
          // TODO: TanStack Query Hook(useQuery)으로 API 상세 정보 가져오기 (수정 모달용)
          // const { data: detail } = useQuery({
          //   queryKey: ['apiDetail', row.id],
          //   queryFn: () => getApiDetail(row.id),
          // });
        }}
      />

      <ApiSettingPagination
        count={logic.total}
        page={logic.page}
        rowsPerPage={logic.rowsPerPage}
        onChangePage={(page) => {
          logic.onChangePage(page);
          // TODO: 페이지 변경 시 TanStack Query로 API 목록 새로고침
          // queryClient.invalidateQueries({ queryKey: ['apiSettings'] });
        }}
        onChangeRowsPerPage={(rowsPerPage) => {
          logic.onChangeRowsPerPage(rowsPerPage);
          // TODO: 페이지 크기 변경 시 TanStack Query로 API 목록 새로고침
          // queryClient.invalidateQueries({ queryKey: ['apiSettings'] });
        }}
      />
    </Box>
  );

  const handleCreate = () => {
    setCreateModalOpen(true);
  };

  const handleSaveApi = (data: ApiFormData) => {
    // TODO: TanStack Query Hook(useMutation)으로 API 등록
    // const mutation = useMutation({
    //   mutationFn: (formData: ApiFormData) => createApi({
    //     name: formData.name,
    //     provider: formData.provider,
    //     apiUrl: formData.apiUrl,
    //     apiKey: formData.apiKey,
    //     expirationDate: formData.expirationDate ? formData.expirationDate.format('YYYY-MM-DD') : null,
    //   }),
    //   onSuccess: () => {
    //     queryClient.invalidateQueries({ queryKey: ['apiSettings'] });
    //     setCreateModalOpen(false);
    //   },
    // });
    // mutation.mutate(data);
    console.log('API 등록:', data);
  };

  const handleSaveEditApi = (data: ApiEditFormData) => {
    if (!selectedApi) return;

    // TODO: TanStack Query Hook(useMutation)으로 API 수정
    // const mutation = useMutation({
    //   mutationFn: (formData: ApiEditFormData) => updateApi(selectedApi.id, {
    //     name: formData.name,
    //     provider: formData.provider,
    //     apiUrl: formData.apiUrl,
    //     apiKey: formData.apiKey, // Key 교체 시에만 전송
    //     expirationDate: formData.expirationDate ? formData.expirationDate.format('YYYY-MM-DD') : null,
    //     status: formData.status,
    //   }),
    //   onSuccess: () => {
    //     queryClient.invalidateQueries({ queryKey: ['apiSettings'] });
    //     queryClient.invalidateQueries({ queryKey: ['apiDetail', selectedApi.id] });
    //     setEditModalOpen(false);
    //     setSelectedApi(null);
    //   },
    // });
    // mutation.mutate(data);
    console.log('API 수정:', data);
  };

  return (
    <DashboardContent maxWidth="xl">
      <Typography variant="h4">{title}</Typography>
      {description && <Typography sx={{ mt: 1 }}>{description}</Typography>}

      <ApiSettingBreadcrumbs
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

      <CreateApiModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSave={handleSaveApi}
      />

      <EditApiModal
        open={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedApi(null);
        }}
        onSave={handleSaveEditApi}
        initialData={selectedApi}
      />
    </DashboardContent>
  );
}
