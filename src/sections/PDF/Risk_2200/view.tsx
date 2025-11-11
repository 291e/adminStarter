import type { Theme, SxProps } from '@mui/material/styles';
import { useLocation } from 'react-router';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';

import { DashboardContent } from 'src/layouts/dashboard';
import { useNavigate } from 'react-router';
import type { SafetySystem, SafetySystemItem } from 'src/_mock/_safety-system';

import Risk_2200Breadcrumbs from './components/Breadcrumbs';
import Risk_2200Filters from './components/Filters';
import Risk_2200Table from './components/Table';
import Risk_2200Pagination from './components/Pagination';
import { useRisk_2200 } from './hooks/use-risk-2200';
import { mockSafetySystemDocuments, getDocumentsByItem } from 'src/_mock/_safety-system';
import { downloadDocumentPDF } from './utils/download-pdf';

// ----------------------------------------------------------------------

type Props = {
  safetyId?: string;
  title?: string;
  description?: string;
  sx?: SxProps<Theme>;
};

export function Risk_2200View({ safetyId, title = 'Blank', description, sx }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as
    | { system: SafetySystem; item?: SafetySystemItem; isGuide?: boolean }
    | undefined;

  // TODO: TanStack Query Hook(useQuery)으로 문서 목록 가져오기
  // const { data: documents, isLoading } = useQuery({
  //   queryKey: ['risk2200Documents', state?.system?.safetyIdx, state?.item?.itemNumber, logic.filterType, logic.searchField, logic.searchValue],
  //   queryFn: () => getRisk2200Documents({
  //     safetyIdx: state?.system?.safetyIdx,
  //     itemNumber: state?.item?.itemNumber,
  //     filterType: logic.filterType,
  //     searchField: logic.searchField,
  //     searchValue: logic.searchValue,
  //     page: logic.page,
  //     pageSize: logic.rowsPerPage,
  //   }),
  // });
  // 목업 데이터 사용
  const adapt = (docs: ReturnType<typeof getDocumentsByItem>) =>
    docs.map((d) => ({
      id: `${d.safetyIdx}-${d.itemNumber}-${String(d.documentNumber).padStart(3, '0')}`,
      sequence: d.sequence,
      registeredAt: d.registeredAt,
      registeredTime: d.registeredTime,
      organizationName: d.organizationName,
      documentName: d.documentName,
      writtenAt: d.writtenAt,
      approvalDeadline: d.approvalDeadline,
      completionRate: d.completionRate,
    }));

  const rows = state?.item
    ? adapt(getDocumentsByItem(state.system.safetyIdx, state.item.itemNumber))
    : adapt(mockSafetySystemDocuments.slice(0, 20) as any);
  const logic = useRisk_2200(rows);

  // 제목/브레드크럼 텍스트 계산
  const computedTitle = state?.item?.documentName || state?.system?.systemName || title;
  const breadcrumbItems = state
    ? [
        { label: '대시보드', href: '/' },
        { label: '안전보건체계 관리', href: '/dashboard/safety-system' },
        { label: computedTitle },
      ]
    : [{ label: '대시보드', href: '/' }, { label: title }];

  const handleCreate = () => {
    if (safetyId) {
      // create 페이지로 이동 시 system과 item 정보를 함께 전달하여 문서 타입별 폼 표시
      navigate(`/dashboard/safety-system/${safetyId}/risk-2200/create`, {
        state: { system: state?.system, item: state?.item },
      });
    }
  };

  const handleViewDetail = (id: string) => {
    if (safetyId) {
      // 가이드에서 온 경우 system과 item 정보를 함께 전달
      navigate(`/dashboard/safety-system/${safetyId}/risk-2200/${id}`, {
        state: { system: state?.system, item: state?.item },
      });
    }
  };

  const handleEdit = (id: string) => {
    if (safetyId) {
      navigate(`/dashboard/safety-system/${safetyId}/risk-2200/${id}/edit`);
    }
  };

  const handleDelete = (id: string) => {
    // TODO: TanStack Query Hook(useMutation)으로 문서 삭제
    // const mutation = useMutation({
    //   mutationFn: (documentId: string) => deleteRisk2200Document(documentId),
    //   onSuccess: () => {
    //     queryClient.invalidateQueries({ queryKey: ['risk2200Documents'] });
    //   },
    // });
    // mutation.mutate(id);
    console.log('삭제:', id);
  };

  const handleDownloadPDF = async (id: string) => {
    if (safetyId) {
      try {
        // TODO: TanStack Query Hook(useQuery)으로 문서 상세 정보 가져오기 (PDF 다운로드용)
        // const { data: documentDetail } = useQuery({
        //   queryKey: ['risk2200DocumentDetail', id],
        //   queryFn: () => getRisk2200DocumentDetail(id),
        //   enabled: !!id,
        // });
        await downloadDocumentPDF(id, safetyId);
      } catch (error) {
        console.error('PDF 다운로드 실패:', error);
      }
    }
  };

  const handleSendNotification = (id: string) => {
    // TODO: TanStack Query Hook(useMutation)으로 알림 발송
    // const mutation = useMutation({
    //   mutationFn: (documentId: string) => sendRisk2200Notification(documentId),
    //   onSuccess: () => {
    //     // 알림 발송 성공 처리
    //   },
    // });
    // mutation.mutate(id);
    console.log('알림발송:', id);
  };

  const handleAction = (action: string) => {
    // TODO: TanStack Query Hook(useMutation)으로 액션 처리 (엑셀 내보내기, 인쇄 등)
    // const mutation = useMutation({
    //   mutationFn: ({ action, selectedIds }: { action: string; selectedIds: string[] }) => {
    //     if (action === 'export') {
    //       return exportRisk2200Documents(selectedIds);
    //     }
    //     // 기타 액션 처리
    //   },
    // });
    // mutation.mutate({ action, selectedIds: logic.selectedIds });
    console.log('액션:', action);
  };

  return (
    <DashboardContent maxWidth="xl">
      <Typography variant="h4"> {computedTitle} </Typography>
      {description && <Typography sx={{ mt: 1 }}> {description} </Typography>}

      <Risk_2200Breadcrumbs
        items={breadcrumbItems}
        onCreate={handleCreate}
        onAction={handleAction}
      />

      <Box sx={[(theme) => ({ mt: 2, width: 1 }), ...(Array.isArray(sx) ? sx : [sx])]}>
        <Box
          sx={{
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: 3,
            width: '100%',
            mt: 2,
          }}
        >
          <Risk_2200Filters
            filterType={logic.filterType}
            searchField={logic.searchField}
            searchValue={logic.searchValue}
            onChangeFilterType={(value) => {
              logic.onChangeFilterType(value);
              // TODO: 필터 타입 변경 시 TanStack Query로 문서 목록 새로고침
              // queryClient.invalidateQueries({ queryKey: ['risk2200Documents'] });
            }}
            onChangeSearchField={(value) => {
              logic.onChangeSearchField(value);
              // TODO: 검색 필드 변경 시 TanStack Query로 문서 목록 새로고침
              // queryClient.invalidateQueries({ queryKey: ['risk2200Documents'] });
            }}
            onChangeSearchValue={(value) => {
              logic.onChangeSearchValue(value);
              // TODO: 검색 값 변경 시 TanStack Query로 문서 목록 새로고침
              // queryClient.invalidateQueries({ queryKey: ['risk2200Documents'] });
            }}
          />

          <Risk_2200Table
            rows={logic.filtered}
            selectedIds={logic.selectedIds}
            onSelectAll={logic.onSelectAll}
            onSelectRow={logic.onSelectRow}
            onViewDetail={handleViewDetail}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onDownloadPDF={handleDownloadPDF}
            onSendNotification={handleSendNotification}
          />

          <Divider sx={{ mt: 2, mb: 1 }} />

          <Risk_2200Pagination
            count={logic.total}
            page={logic.page}
            rowsPerPage={logic.rowsPerPage}
            onChangePage={(page) => {
              logic.onChangePage(page);
              // TODO: 페이지 변경 시 TanStack Query로 문서 목록 새로고침
              // queryClient.invalidateQueries({ queryKey: ['risk2200Documents'] });
            }}
            onChangeRowsPerPage={(rowsPerPage) => {
              logic.onChangeRowsPerPage(rowsPerPage);
              // TODO: 페이지 크기 변경 시 TanStack Query로 문서 목록 새로고침
              // queryClient.invalidateQueries({ queryKey: ['risk2200Documents'] });
            }}
          />
        </Box>
      </Box>
    </DashboardContent>
  );
}
