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
      navigate(`/dashboard/safety-system/${safetyId}/risk-2200/create`);
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
    console.log('삭제:', id);
    // 삭제 로직 추가
  };

  const handleDownloadPDF = async (id: string) => {
    if (safetyId) {
      try {
        await downloadDocumentPDF(id, safetyId);
      } catch (error) {
        console.error('PDF 다운로드 실패:', error);
      }
    }
  };

  const handleSendNotification = (id: string) => {
    console.log('알림발송:', id);
    // 알림발송 로직 추가
    // TODO: 알림 발송 API 호출
  };

  const handleAction = (action: string) => {
    console.log('액션:', action);
    // 엑셀 내보내기, 인쇄 등 로직 추가
  };

  return (
    <DashboardContent maxWidth="xl">
      <Typography variant="h4"> {computedTitle} </Typography>
      {description && <Typography sx={{ mt: 1 }}> {description} </Typography>}

      <Box sx={[(theme) => ({ mt: 2, width: 1 }), ...(Array.isArray(sx) ? sx : [sx])]}>
        <Risk_2200Breadcrumbs
          items={breadcrumbItems}
          onCreate={handleCreate}
          onAction={handleAction}
        />

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
            onChangeFilterType={logic.onChangeFilterType}
            onChangeSearchField={logic.onChangeSearchField}
            onChangeSearchValue={logic.onChangeSearchValue}
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
            onChangePage={logic.onChangePage}
            onChangeRowsPerPage={logic.onChangeRowsPerPage}
          />
        </Box>
      </Box>
    </DashboardContent>
  );
}
