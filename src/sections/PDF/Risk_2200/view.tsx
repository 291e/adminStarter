import { useState } from 'react';
import type { Theme, SxProps } from '@mui/material/styles';
import { useLocation } from 'react-router';
import dayjs from 'dayjs';

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
import RiskAssessmentSettingModal, {
  type RiskAssessmentData,
} from './components/RiskAssessmentSettingModal';
import { useRisk_2200 } from './hooks/use-risk-2200';
import {
  mockSafetySystemDocuments,
  getDocumentsByItem,
  getTableDataByDocument,
} from 'src/_mock/_safety-system';
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
  const [riskAssessmentModalOpen, setRiskAssessmentModalOpen] = useState(false);

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
    docs.map((d, index) => ({
      id: `${d.safetyIdx}-${d.itemNumber}-${String(d.documentNumber).padStart(3, '0')}`,
      sequence: d.sequence,
      registeredAt: d.registeredAt,
      registeredTime: d.registeredTime,
      organizationName: d.organizationName,
      documentName: d.documentName,
      writtenAt: d.writtenAt,
      approvalDeadline: d.approvalDeadline,
      completionRate: d.completionRate,
      // TODO: API에서 상태와 게시 여부 가져오기
      status: (['draft', 'in_progress', 'completed'] as const)[index % 3],
      published: index % 2 === 0,
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

  const handleEdit = (id: string) => {
    if (safetyId) {
      // 문서 ID에서 정보 추출 (형식: safetyIdx-itemNumber-documentNumber)
      const parts = id.split('-');
      let documentType: 'industrial-accident' | 'near-miss' | 'tbm' | 'education' | undefined;

      if (parts.length >= 3) {
        const safetyIdx = Number(parts[0]);
        const itemNumber = Number(parts[1]);

        // 1200번대 또는 2400번대인 경우 documentType 추론
        if (safetyIdx === 1 && itemNumber === 2) {
          // 1200번대: getTableDataByDocument로 타입 확인
          // TODO: API 연동 시 문서 상세 정보에서 documentType 가져오기
          // const { data: documentDetail } = useQuery({
          //   queryKey: ['risk2200DocumentDetail', id],
          //   queryFn: () => getRisk2200DocumentDetail(id),
          // });
          // documentType = documentDetail?.documentType;

          // 목업 데이터 사용
          const tableData = getTableDataByDocument(safetyIdx, itemNumber, Number(parts[2]));
          if (tableData?.type === '1200-industrial') {
            documentType = 'industrial-accident';
          } else if (tableData?.type === '1200-near-miss') {
            documentType = 'near-miss';
          }
        } else if (safetyIdx === 2 && itemNumber === 4) {
          // 2400번대: getTableDataByDocument로 타입 확인
          const tableData = getTableDataByDocument(safetyIdx, itemNumber, Number(parts[2]));
          if (tableData?.type === '2400-tbm') {
            documentType = 'tbm';
          } else if (tableData?.type === '2400-education') {
            documentType = 'education';
          }
        }
      }

      navigate(`/dashboard/safety-system/${safetyId}/risk-2200/${id}/edit`, {
        state: {
          system: state?.system,
          item: state?.item,
          documentType,
        },
      });
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

  const handleCopy = (id: string) => {
    if (safetyId) {
      // TODO: TanStack Query Hook(useQuery)으로 문서 상세 정보 가져오기 (복사용)
      // const { data: documentDetail } = useQuery({
      //   queryKey: ['risk2200DocumentDetail', id],
      //   queryFn: () => getRisk2200DocumentDetail(id),
      //   enabled: !!id,
      // });
      // 문서 ID에서 정보 추출 (형식: safetyIdx-itemNumber-documentNumber)
      const parts = id.split('-');
      if (parts.length >= 3) {
        // create 페이지로 이동 시 system, item, 그리고 복사할 문서 데이터를 함께 전달
        navigate(`/dashboard/safety-system/${safetyId}/risk-2200/create`, {
          state: {
            system: state?.system,
            item: state?.item,
            copyFrom: id, // 복사할 문서 ID
            // TODO: API 연동 시 documentDetail 데이터도 함께 전달
            // documentData: documentDetail,
          },
        });
      }
    }
  };

  const handleTogglePublish = (id: string, published: boolean) => {
    // TODO: TanStack Query Hook(useMutation)으로 게시 상태 변경
    // const mutation = useMutation({
    //   mutationFn: ({ documentId, published }: { documentId: string; published: boolean }) =>
    //     updateRisk2200DocumentPublish(documentId, published),
    //   onSuccess: () => {
    //     queryClient.invalidateQueries({ queryKey: ['risk2200Documents'] });
    //   },
    // });
    // mutation.mutate({ documentId: id, published });
    console.log('게시 상태 변경:', id, published);
  };

  const handleViewSample = () => {
    // TODO: 샘플 보기 기능 구현
    console.log('샘플 보기');
  };

  // 1200번대 문서 여부 확인 (safetyIdx=1, itemNumber=2)
  const is1200Series = state?.system?.safetyIdx === 1 && state?.item?.itemNumber === 2;
  // 1500번대 문서 여부 확인 (safetyIdx=1, itemNumber=5)
  const is1500Series = state?.system?.safetyIdx === 1 && state?.item?.itemNumber === 5;
  // 2400번대 문서 여부 확인 (safetyIdx=2, itemNumber=4)
  const is2400Series = state?.system?.safetyIdx === 2 && state?.item?.itemNumber === 4;

  const handleCreateIndustrialAccident = () => {
    if (safetyId) {
      // 산업재해 작성 페이지로 이동
      navigate(`/dashboard/safety-system/${safetyId}/risk-2200/create`, {
        state: {
          system: state?.system,
          item: state?.item,
          documentType: 'industrial-accident', // 산업재해 문서 타입
        },
      });
    }
  };

  const handleCreateNearMiss = () => {
    if (safetyId) {
      // 아차사고 작성 페이지로 이동
      navigate(`/dashboard/safety-system/${safetyId}/risk-2200/create`, {
        state: {
          system: state?.system,
          item: state?.item,
          documentType: 'near-miss', // 아차사고 문서 타입
        },
      });
    }
  };

  const handleRiskAssessmentSetting = () => {
    setRiskAssessmentModalOpen(true);
  };

  const handleRiskAssessmentSave = (data: RiskAssessmentData) => {
    // TODO: API 호출하여 위험성 평가 기준 저장
    console.log('위험성 평가 기준 저장:', data);
  };

  const handleCreateTBM = () => {
    if (safetyId) {
      // TBM 일지 작성 페이지로 이동
      navigate(`/dashboard/safety-system/${safetyId}/risk-2200/create`, {
        state: {
          system: state?.system,
          item: state?.item,
          documentType: 'tbm', // TBM 일지 문서 타입
        },
      });
    }
  };

  const handleCreateEducation = () => {
    if (safetyId) {
      // 연간 교육 계획 작성 페이지로 이동
      navigate(`/dashboard/safety-system/${safetyId}/risk-2200/create`, {
        state: {
          system: state?.system,
          item: state?.item,
          documentType: 'education', // 연간 교육 계획 문서 타입
        },
      });
    }
  };

  return (
    <DashboardContent maxWidth="xl">
      <Typography variant="h4"> {computedTitle} </Typography>
      {description && <Typography sx={{ mt: 1 }}> {description} </Typography>}

      <Risk_2200Breadcrumbs
        items={breadcrumbItems}
        onCreate={handleCreate}
        onViewSample={handleViewSample}
        is1200Series={is1200Series}
        is1500Series={is1500Series}
        is2400Series={is2400Series}
        onCreateIndustrialAccident={is1200Series ? handleCreateIndustrialAccident : undefined}
        onCreateNearMiss={is1200Series ? handleCreateNearMiss : undefined}
        onRiskAssessmentSetting={is1500Series ? handleRiskAssessmentSetting : undefined}
        onCreateTBM={is2400Series ? handleCreateTBM : undefined}
        onCreateEducation={is2400Series ? handleCreateEducation : undefined}
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
            dateFilterType={logic.dateFilterType}
            startDate={logic.startDate ? dayjs(logic.startDate) : null}
            endDate={logic.endDate ? dayjs(logic.endDate) : null}
            searchValue={logic.searchValue}
            onChangeDateFilterType={(value) => {
              logic.onChangeDateFilterType(value);
              // TODO: 검색일 구분 변경 시 TanStack Query로 문서 목록 새로고침
              // queryClient.invalidateQueries({ queryKey: ['risk2200Documents'] });
            }}
            onChangeStartDate={(date) => {
              logic.onChangeStartDate(date);
              // TODO: 시작일 변경 시 TanStack Query로 문서 목록 새로고침
              // queryClient.invalidateQueries({ queryKey: ['risk2200Documents'] });
            }}
            onChangeEndDate={(date) => {
              logic.onChangeEndDate(date);
              // TODO: 종료일 변경 시 TanStack Query로 문서 목록 새로고침
              // queryClient.invalidateQueries({ queryKey: ['risk2200Documents'] });
            }}
            onChangeSearchValue={(value) => {
              logic.onChangeSearchValue(value);
              // TODO: 검색어 변경 시 TanStack Query로 문서 목록 새로고침
              // queryClient.invalidateQueries({ queryKey: ['risk2200Documents'] });
            }}
          />

          <Risk_2200Table
            rows={logic.filtered}
            selectedIds={logic.selectedIds}
            onSelectAll={logic.onSelectAll}
            onSelectRow={logic.onSelectRow}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onDownloadPDF={handleDownloadPDF}
            onCopy={handleCopy}
            onTogglePublish={handleTogglePublish}
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

      {/* 위험성 평가 설정 모달 */}
      <RiskAssessmentSettingModal
        open={riskAssessmentModalOpen}
        onClose={() => setRiskAssessmentModalOpen(false)}
        onSave={handleRiskAssessmentSave}
      />
    </DashboardContent>
  );
}
