import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import type { SxProps, Theme } from '@mui/material/styles';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { DashboardContent } from 'src/layouts/dashboard';
import { CONFIG } from 'src/global-config';
import { updateSafetySystem } from 'src/services/safety-system/safety-system.service';
import { uploadFile } from 'src/services/system/system.service';
import type {
  UpdateSafetySystemDto,
  UpdateSystemItemDto,
} from 'src/services/safety-system/safety-system.types';

import DocumentSettingFilters from './components/DocumentSettingFilters';
import DocumentSettingTable from './components/DocumentSettingTable';
import DocumentSettingPagination from './components/Pagination';
import DocumentSettingBreadcrumbs from './components/Breadcrumbs';
import { useDocumentSetting } from './hooks/use-document-setting';
import EditDocumentSettingModal, {
  type DocumentEditFormData,
} from './components/EditDocumentSettingModal';
import type { DocumentSettingItem } from './hooks/use-document-setting';

type Props = {
  title?: string;
  sx?: SxProps<Theme>;
};

export function DocumentSettingView({ title = '문서 설정 관리', sx }: Props) {
  const logic = useDocumentSetting();
  const queryClient = useQueryClient();
  const [editOpen, setEditOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<DocumentSettingItem | null>(null);

  // 시스템 수정 Mutation
  const updateSystemMutation = useMutation({
    mutationFn: ({ safetyIdx, params }: { safetyIdx: number; params: UpdateSafetySystemDto }) =>
      updateSafetySystem(safetyIdx, params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['safetySystemList'] });
      handleCloseEdit();
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.header?.resultMessage ||
        error?.message ||
        '문서 설정 수정에 실패했습니다.';
      console.error('문서 설정 수정 실패:', errorMessage);
      alert(errorMessage); // TODO: Snackbar로 교체
    },
  });

  const handleOpenEdit = (row: DocumentSettingItem) => {
    setSelectedRow(row);
    setEditOpen(true);
  };

  const handleCloseEdit = () => {
    setEditOpen(false);
    setSelectedRow(null);
  };

  const handleSaveEdit = async (data: DocumentEditFormData) => {
    if (!selectedRow) return;

    const isSystem = selectedRow.safetySystemItemIdx === 0;

    try {
      // 파일 업로드 처리
      let guideUrl: string | undefined;

      if (data.guideFile) {
        const uploadResponse = await uploadFile({ files: [data.guideFile] });
        let fileUrl: string | undefined;

        if ((uploadResponse as any)?.fileUrls && Array.isArray((uploadResponse as any).fileUrls)) {
          fileUrl = (uploadResponse as any).fileUrls[0];
        } else if ((uploadResponse as any)?.files && Array.isArray((uploadResponse as any).files)) {
          fileUrl = (uploadResponse as any).files[0]?.fileUrl;
        } else if (
          (uploadResponse as any)?.data?.fileUrls &&
          Array.isArray((uploadResponse as any).data.fileUrls)
        ) {
          fileUrl = (uploadResponse as any).data.fileUrls[0];
        }

        if (fileUrl) {
          guideUrl = fileUrl;
        }
      }

      let finalSampleUrl: string | undefined;

      if (data.sampleFiles.length > 0 && !isSystem) {
        // 아이템인 경우에만 샘플 업로드
        const uploadResponse = await uploadFile({ files: data.sampleFiles });
        let newlyUploadedUrls: string[] = [];

        if ((uploadResponse as any)?.fileUrls && Array.isArray((uploadResponse as any).fileUrls)) {
          newlyUploadedUrls = (uploadResponse as any).fileUrls;
        } else if ((uploadResponse as any)?.files && Array.isArray((uploadResponse as any).files)) {
          newlyUploadedUrls = (uploadResponse as any).files.map((f: any) => f.fileUrl);
        } else if (
          (uploadResponse as any)?.data?.fileUrls &&
          Array.isArray((uploadResponse as any).data.fileUrls)
        ) {
          newlyUploadedUrls = (uploadResponse as any).data.fileUrls;
        }

        // 기존 유지된 URL + 새로 업로드된 URL 합치기
        const allSamples = [...data.existingSampleUrls, ...newlyUploadedUrls];
        if (allSamples.length > 0) {
          // JSON 배열 형태로 저장 (parseSampleUrls에서 지원함)
          finalSampleUrl = JSON.stringify(allSamples);
        }
      } else if (!isSystem) {
        // 새로 추가된 파일은 없지만 기존 것들 중 유지된 것이 있는 경우
        if (data.existingSampleUrls.length > 0) {
          finalSampleUrl = JSON.stringify(data.existingSampleUrls);
        }
      }

      if (isSystem) {
        // 시스템 정보만 수정
        const params: UpdateSafetySystemDto = {
          guide: guideUrl || selectedRow.guideUrl || undefined,
          isActive: data.status === 'active' ? 1 : 0,
          systemName: data.documentName,
        };

        await updateSystemMutation.mutateAsync({
          safetyIdx: selectedRow.safetyIdx,
          params,
        });
      } else {
        // 아이템 수정
        // 작성주기를 cycleUnit으로 변환
        const periodToCycleUnit: Record<
          string,
          'YEAR' | 'HALF' | 'QUARTER' | 'WEEK' | 'DAY' | 'ALWAYS' | 'IMMEDIATE'
        > = {
          년: 'YEAR',
          반기: 'HALF',
          분기: 'QUARTER',
          주: 'WEEK',
          일: 'DAY',
          상시: 'ALWAYS',
          즉시: 'IMMEDIATE',
          // '월'은 API에서 지원하지 않으므로 제외
        };

        const cycleUnit = data.period ? periodToCycleUnit[data.period] : undefined;

        const itemParams: UpdateSystemItemDto = {
          safetySystemItemIdx: selectedRow.safetySystemItemIdx,
          guide: guideUrl || selectedRow.guideUrl || undefined,
          sample:
            finalSampleUrl !== undefined ? finalSampleUrl : selectedRow.sampleUrl || undefined,
          isActive: data.status === 'active' ? 1 : 0,
          approvalStep: Number(data.approvalStep), // 0/1/2/3
          documentName: data.documentName,
        };

        if (cycleUnit) {
          itemParams.cycleUnit = cycleUnit;
        }

        const params: UpdateSafetySystemDto = {
          itemList: [itemParams],
        };

        await updateSystemMutation.mutateAsync({
          safetyIdx: selectedRow.safetyIdx,
          params,
        });
      }
    } catch (error) {
      console.error('문서 설정 수정 실패:', error);
      // 에러는 mutation의 onError에서 처리됨
    }
  };

  // 파일 URL을 전체 URL로 변환
  const getFullFileUrl = (url: string | null | undefined): string | null => {
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    const baseUrl = CONFIG.serverUrl.replace(/\/$/, '');
    const path = url.startsWith('/') ? url : `/${url}`;
    return `${baseUrl}${path}`;
  };

  // 팝업 창 열기 헬퍼 함수
  const openPopup = (url: string, name: string) => {
    const width = 1200;
    const height = 900;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;
    window.open(
      url,
      name,
      `width=${width},height=${height},left=${left},top=${top},menubar=no,status=no,toolbar=no,scrollbars=yes`
    );
  };

  return (
    <DashboardContent maxWidth="xl">
      <Typography variant="h4">{title}</Typography>

      <DocumentSettingBreadcrumbs
        items={[
          { label: '대시보드', href: '/admin/dashboard' },
          { label: '설정 및 관리', href: '/admin/dashboard' },
          { label: title },
        ]}
      />

      {logic.isLoading ? (
        <Stack alignItems="center" justifyContent="center" sx={{ py: 5 }}>
          <CircularProgress />
        </Stack>
      ) : logic.isError ? (
        <Alert severity="error" sx={{ m: 2 }}>
          문서 설정 데이터를 불러오는 중 오류가 발생했습니다.
        </Alert>
      ) : (
        <Box
          sx={{
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: (theme) => theme.customShadows.card,
            width: '100%',
            overflow: 'hidden',
            mt: 2,
            ...sx,
          }}
        >
          <DocumentSettingFilters
            status={logic.filters.status}
            onChangeStatus={logic.onChangeStatus}
            startDate={logic.filters.startDate}
            onChangeStartDate={logic.onChangeStartDate}
            endDate={logic.filters.endDate}
            onChangeEndDate={logic.onChangeEndDate}
            searchValue={logic.filters.keyword}
            onChangeSearchValue={logic.onChangeKeyword}
          />

          <DocumentSettingTable
            rows={logic.paginated}
            onViewGuide={(row) => {
              if (row.guideUrl) {
                const fullUrl = getFullFileUrl(row.guideUrl);
                if (fullUrl) {
                  openPopup(fullUrl, 'guide-popup');
                }
              }
            }}
            onViewSample={(row) => {
              if (row.sampleUrl) {
                const fullUrl = getFullFileUrl(row.sampleUrl);
                if (fullUrl) {
                  openPopup(fullUrl, 'sample-popup');
                }
              }
            }}
            onEdit={handleOpenEdit}
          />

          <DocumentSettingPagination
            count={logic.total}
            page={logic.page}
            rowsPerPage={logic.rowsPerPage}
            onChangePage={logic.onChangePage}
            onChangeRowsPerPage={logic.onChangeRowsPerPage}
          />
        </Box>
      )}

      <EditDocumentSettingModal
        open={editOpen}
        onClose={handleCloseEdit}
        onSave={handleSaveEdit}
        initialData={selectedRow}
      />
    </DashboardContent>
  );
}
