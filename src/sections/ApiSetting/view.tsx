import { useState, useMemo } from 'react';

import type { Theme, SxProps } from '@mui/material/styles';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';

import { DashboardContent } from 'src/layouts/dashboard';
import ApiSettingBreadcrumbs from './components/Breadcrumbs';
import ApiSettingTable from './components/Table';
import ApiSettingPagination from './components/Pagination';
import CreateApiModal, { type ApiFormData } from './components/CreateApiModal';
import EditApiModal, { type ApiEditFormData } from './components/EditApiModal';
import { useApis, useApiDetail, useUpdateApi } from './hooks/use-api-setting-api';
import type { ApiSetting as ApiSettingType } from 'src/services/api-setting/api-setting.types';
import type { ApiSetting } from 'src/_mock/_api-setting';

// ----------------------------------------------------------------------

type Props = {
  title?: string;
  description?: string;
  sx?: SxProps<Theme>;
};

export function ApiSettingView({ title = 'API 관리', description, sx }: Props) {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedApi, setSelectedApi] = useState<ApiSetting | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  // TODO: 필터 기능 추가 시 사용
  // const [statusFilter, setStatusFilter] = useState<string>('');
  // const [keyStatusFilter, setKeyStatusFilter] = useState<string>('');
  // const [searchValue, setSearchValue] = useState<string>('');

  // API 목록 조회
  const {
    data: apisResponse,
    isLoading: isLoadingApis,
    isError: isErrorApis,
    error: apisError,
  } = useApis({
    page: page + 1, // API는 1부터 시작
    pageSize: rowsPerPage,
    // TODO: 필터 기능 추가 시 활성화
    // status: statusFilter || undefined,
    // keyStatus: keyStatusFilter || undefined,
    // search: searchValue || undefined,
  });

  // API 상세 조회 (수정 모달용)
  const { data: apiDetailResponse, isLoading: isLoadingDetail } = useApiDetail({
    apiSettingIdx: (selectedApi as any)?.apiSettingIdx || 0,
  });

  // API 수정 Mutation
  const updateApiMutation = useUpdateApi();

  // API 응답 데이터를 UI 타입으로 변환
  const apis: ApiSetting[] = useMemo(() => {
    const apiList = (apisResponse as any)?.apiSettingList || [];
    const totalCount = (apisResponse as any)?.totalCount || 0;

    return apiList.map((api: ApiSettingType, index: number) => ({
      id: String(api.apiSettingIdx),
      apiSettingIdx: api.apiSettingIdx,
      order: totalCount - (page * rowsPerPage + index),
      registrationDate: api.createAt,
      modificationDate: api.updateAt,
      name: api.name,
      provider: api.provider,
      keyStatus: api.keyStatus.toLowerCase() as 'normal' | 'abnormal',
      lastInterlocked: api.updateAt || api.lastInterlockedAt || '',
      expirationDate: api.expiresAt || '',
      status: api.status.toLowerCase() as 'active' | 'inactive',
    }));
  }, [apisResponse, page, rowsPerPage]);

  const totalCount = (apisResponse as any)?.totalCount || 0;

  const renderContent = () => {
    if (isLoadingApis) {
      return (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: 400,
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: (theme) => theme.customShadows.card,
          }}
        >
          <CircularProgress />
        </Box>
      );
    }

    if (isErrorApis) {
      return (
        <Box
          sx={{
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: (theme) => theme.customShadows.card,
            p: 3,
          }}
        >
          <Alert severity="error">
            API 목록을 불러오는 중 오류가 발생했습니다: {apisError?.message || '알 수 없는 오류'}
          </Alert>
        </Box>
      );
    }

    return (
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
          rows={apis}
          onEdit={(row) => {
            setSelectedApi(row);
            setEditModalOpen(true);
          }}
        />

        <ApiSettingPagination
          count={totalCount}
          page={page}
          rowsPerPage={rowsPerPage}
          onChangePage={(newPage) => {
            setPage(newPage);
          }}
          onChangeRowsPerPage={(newRowsPerPage) => {
            setRowsPerPage(newRowsPerPage);
            setPage(0);
          }}
        />
      </Box>
    );
  };

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

  const handleSaveEditApi = async (data: ApiEditFormData) => {
    if (!selectedApi || !selectedApi.apiSettingIdx) return;

    try {
      await updateApiMutation.mutateAsync({
        apiSettingIdx: selectedApi.apiSettingIdx,
        name: data.name,
        provider: data.provider,
        apiUrl: data.apiUrl || null,
        apiKey: data.apiKey || undefined, // Key 교체 시에만 전송
        expiresAt: data.expirationDate ? data.expirationDate.endOf('day').toISOString() : null,
        status: data.status.toUpperCase() as 'ACTIVE' | 'INACTIVE',
      });
      setEditModalOpen(false);
      setSelectedApi(null);
    } catch (error) {
      // 에러는 mutation의 onError에서 처리됨
      console.error('API 수정 실패:', error);
    }
  };

  return (
    <DashboardContent maxWidth="xl">
      <Typography variant="h4">{title}</Typography>
      {description && <Typography sx={{ mt: 1 }}>{description}</Typography>}

      <ApiSettingBreadcrumbs
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
        initialData={
          selectedApi
            ? {
                ...selectedApi,
                // API 상세 정보가 있으면 사용
                ...(apiDetailResponse
                  ? {
                      apiUrl: (apiDetailResponse as any)?.apiUrl || '',
                    }
                  : {}),
              }
            : undefined
        }
        isLoadingDetail={isLoadingDetail}
      />
    </DashboardContent>
  );
}
