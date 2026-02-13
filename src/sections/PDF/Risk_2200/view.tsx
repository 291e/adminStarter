import { useState } from 'react';
import type { Theme, SxProps } from '@mui/material/styles';
import { useLocation } from 'react-router';
import dayjs from 'dayjs';
import { toast } from 'sonner';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';

import { DashboardContent } from 'src/layouts/dashboard';
import { useNavigate } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getSafetySystemItem,
  deleteSafetySystemDocument,
} from 'src/services/safety-system/safety-system.service';
import { getSafetySystemDocumentDetail } from 'src/services/dashboard/dashboard.service';
import type {
  SafetySystem,
  SafetySystemItem,
} from 'src/services/safety-system/safety-system.types';

import Risk_2200Breadcrumbs from './components/Breadcrumbs';
import Risk_2200Filters from './components/Filters';
import Risk_2200Table, { type Risk_2200Row } from './components/Table';
import Risk_2200Pagination from './components/Pagination';
import RiskAssessmentSettingModal, {
  type RiskAssessmentData,
} from './components/RiskAssessmentSettingModal';
import PDFDownloadModal from './components/PDFDownloadModal';
import DeleteDocumentModal from './components/DeleteDocumentModal';
import { useRisk_2200 } from './hooks/use-risk-2200';
import { useExportRisk2200Documents } from './hooks/use-risk-2200-api';
import { getTableDataByDocument } from 'src/_mock/_safety-system';
import { downloadDocumentPDF } from './utils/download-pdf';
import { parseSampleUrls } from './components/SampleViewModal';
import DownloadFormatModal, { type DownloadFormat } from './components/DownloadFormatModal';
import { resolveFileUrl } from './utils/file-url';

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
  const [pdfDownloadModalOpen, setPdfDownloadModalOpen] = useState(false);
  const [downloadFormatModalOpen, setDownloadFormatModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [downloadLoadingTitle, setDownloadLoadingTitle] = useState('파일 다운로드');
  const [downloadLoadingMessage, setDownloadLoadingMessage] = useState('파일을 생성하고 있습니다...');
  const [selectedDeleteRow, setSelectedDeleteRow] = useState<Risk_2200Row | null>(null);
  const [selectedDownloadTarget, setSelectedDownloadTarget] = useState<{
    id: string;
    safetySystemItemIdx?: number;
    documentName?: string;
  } | null>(null);
  const queryClient = useQueryClient();
  const exportDocumentsMutation = useExportRisk2200Documents();

  // 아이템 상세 정보 조회 (문서 목록 포함)
  const { data: itemDetailResponse, isLoading: isItemLoading } = useQuery({
    queryKey: ['safety-system-item', state?.item?.safetySystemItemIdx],
    queryFn: async () => {
      if (!state?.item?.safetySystemItemIdx) {
        return null;
      }
      try {
        const response = await getSafetySystemItem(state.item.safetySystemItemIdx);

        // axios 인터셉터에서 body.data를 평탄화하므로
        // BaseResponseDto<{ item: SafetySystemItem, documentList: SafetySystemDocument[] }> 구조에서
        // 인터셉터를 거치면 { item: SafetySystemItem, documentList: SafetySystemDocument[], header: ... } 형태가 됨
        const item =
          (response as any).item ||
          (response as any).body?.data?.item ||
          (response as any).body?.item;
        const documentList =
          (response as any).documentList ||
          (response as any).body?.data?.documentList ||
          (response as any).body?.documentList ||
          [];

        // item과 documentList를 합쳐서 반환
        if (!item) return null;

        return {
          ...item,
          documentList, // documentList를 item에 포함
        } as SafetySystemItem;
      } catch (error) {
        console.error('아이템 상세 정보 조회 실패:', error);
        return null;
      }
    },
    enabled: !!state?.item?.safetySystemItemIdx,
  });

  // itemDetail을 itemDetailResponse로 변경
  const itemDetail = itemDetailResponse;

  // 문서 목록을 UI 구조에 맞게 변환
  const adapt = (docs: SafetySystemItem['documentList']): Risk_2200Row[] => {
    if (!docs) return [];
    return docs.map((doc, index): Risk_2200Row => {
      const createAtStr =
        typeof doc.createAt === 'string' ? doc.createAt : new Date(doc.createAt).toISOString();
      const updateAtStr =
        typeof doc.updateAt === 'string' ? doc.updateAt : new Date(doc.updateAt).toISOString();

      return {
        ...doc, // SafetySystemDocument의 모든 필드 포함
        id: `${doc.safetySystemDocumentIdx}`,
        sequence: index + 1,
        registeredAt: createAtStr.split('T')[0],
        registeredTime: createAtStr.split('T')[1]?.split('.')[0] || '',
        writtenAt: updateAtStr.split('T')[0], // 작성일 (updateAt)
        published: doc.isPublished === 1,
        // approvalProgress와 signatureList는 doc에서 직접 가져옴 (이미 SafetySystemDocument에 포함됨)
      };
    });
  };

  // 아이템 상세 정보에서 문서 목록 가져오기
  const documentList = itemDetail?.documentList || state?.item?.documentList || [];
  const rows = adapt(documentList);
  const logic = useRisk_2200(rows);

  // 제목/브레드크럼 텍스트 계산
  const computedTitle =
    state?.item?.itemName || state?.item?.documentName || state?.system?.systemName || title;
  const breadcrumbItems = state
    ? [
        { label: '대시보드', href: '/dashboard' },
        { label: '안전보건체계 관리', href: '/dashboard/safety-system' },
        { label: computedTitle },
      ]
    : [{ label: '대시보드', href: '/dashboard' }, { label: title }];

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

  // 문서 삭제 mutation
  const deleteDocumentMutation = useMutation({
    mutationFn: async (safetySystemDocumentIdx: number) => {
      await deleteSafetySystemDocument(safetySystemDocumentIdx);
    },
    onSuccess: () => {
      // 삭제 성공 시 목록 새로고침
      queryClient.invalidateQueries({
        queryKey: ['safety-system-item', state?.item?.safetySystemItemIdx],
      });
      // 대시보드 서명 대기/공유 문서 즉시 반영
      queryClient.invalidateQueries({ queryKey: ['pendingSignatures'] });
      queryClient.invalidateQueries({ queryKey: ['sharedDocuments'] });
      queryClient.invalidateQueries({ queryKey: ['sharedDocumentDetail'] });
      toast.success('문서가 삭제되었습니다.');
      setDeleteModalOpen(false);
      setSelectedDeleteRow(null);
    },
    onError: (error: any) => {
      console.error('문서 삭제 실패:', error);
      toast.error(
        error?.response?.data?.header?.resultMessage || '문서 삭제에 실패했습니다.'
      );
    },
  });

  const handleDelete = (id: string) => {
    // id는 safetySystemDocumentIdx를 문자열로 변환한 값
    const safetySystemDocumentIdx = Number(id);
    if (!safetySystemDocumentIdx || isNaN(safetySystemDocumentIdx)) {
      toast.error('문서 ID가 유효하지 않습니다.');
      return;
    }

    // 삭제할 문서 찾기
    const rowToDelete = rows.find((row) => row.id === id);
    if (!rowToDelete) {
      toast.error('삭제할 문서를 찾을 수 없습니다.');
      return;
    }

    // 삭제 확인 모달 열기
    setSelectedDeleteRow(rowToDelete);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!selectedDeleteRow) return;

    const safetySystemDocumentIdx = Number(selectedDeleteRow.id);
    if (!safetySystemDocumentIdx || isNaN(safetySystemDocumentIdx)) {
      toast.error('문서 ID가 유효하지 않습니다.');
      return;
    }

    deleteDocumentMutation.mutate(safetySystemDocumentIdx);
  };

  const handleDownload = (id: string, safetySystemItemIdx?: number) => {
    const targetRow = rows.find((row) => row.id === id);
    setSelectedDownloadTarget({
      id,
      safetySystemItemIdx,
      documentName: targetRow?.documentName,
    });
    setDownloadFormatModalOpen(true);
  };

  const formatActionMap: Record<
    Exclude<DownloadFormat, 'pdf'>,
    'EXPORT_EXCEL' | 'EXPORT_WORD' | 'EXPORT_PPT'
  > = {
    excel: 'EXPORT_EXCEL',
    word: 'EXPORT_WORD',
    ppt: 'EXPORT_PPT',
  };

  const triggerDownloadByUrl = (url: string) => {
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.target = '_blank';
    anchor.rel = 'noopener noreferrer';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  };

  const handleSelectDownloadFormat = async (format: DownloadFormat) => {
    if (!selectedDownloadTarget) return;

    setDownloadFormatModalOpen(false);
    setPdfDownloadModalOpen(true);
    setDownloadLoadingTitle('파일 다운로드');
    setDownloadLoadingMessage('파일을 생성하고 있습니다...');

    try {
      if (format === 'pdf') {
        if (!safetyId) {
          toast.error('안전보건체계 정보가 없습니다.');
          return;
        }
        setDownloadLoadingTitle('PDF 다운로드');
        setDownloadLoadingMessage('PDF를 생성하고 있습니다...');
        await downloadDocumentPDF(
          selectedDownloadTarget.id,
          safetyId,
          selectedDownloadTarget.safetySystemItemIdx
        );
        return;
      }

      const response = await exportDocumentsMutation.mutateAsync({
        action: formatActionMap[format],
        selectedIds: [selectedDownloadTarget.id],
      });

      const downloadUrl =
        (response as any)?.downloadUrl || (response as any)?.body?.downloadUrl || '';

      if (!downloadUrl) {
        toast.error('다운로드 URL을 받지 못했습니다.');
        return;
      }

      triggerDownloadByUrl(downloadUrl);
    } catch (error: any) {
      console.error('파일 다운로드 실패:', error);
      toast.error(error?.response?.data?.header?.resultMessage || '파일 다운로드에 실패했습니다.');
    } finally {
      setPdfDownloadModalOpen(false);
      setSelectedDownloadTarget(null);
    }
  };

  const handleCopy = async (id: string) => {
    if (!safetyId) return;

    try {
      // id는 safetySystemDocumentIdx를 문자열로 변환한 값
      const safetySystemDocumentIdx = Number(id);
      if (!safetySystemDocumentIdx || isNaN(safetySystemDocumentIdx)) {
        toast.error('문서 ID가 유효하지 않습니다.');
        return;
      }

      // 문서 상세 정보 조회
      const response = await getSafetySystemDocumentDetail({
        safetySystemDocumentIdx,
      });

      // axios 인터셉터에서 평탄화되므로 직접 접근
      const originalDocument =
        (response as any).originalDocument ||
        (response as any).body?.data?.originalDocument ||
        (response as any).body?.originalDocument;

      if (!originalDocument) {
        toast.error('문서 정보를 가져올 수 없습니다.');
        return;
      }

      // create 페이지로 이동 시 system, item, 그리고 복사할 문서 데이터를 함께 전달
      navigate(`/dashboard/safety-system/${safetyId}/risk-2200/create`, {
        state: {
          system: state?.system,
          item: state?.item,
          copyFrom: id, // 복사할 문서 ID (참고용)
          documentData: originalDocument, // 복사할 문서 데이터
        },
      });
    } catch (error: any) {
      console.error('문서 복사 실패:', error);
      toast.error(error?.response?.data?.header?.resultMessage || '문서 복사에 실패했습니다.');
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

  const handleViewSample = () => {
    // 활성화된 아이템 정보(itemDetail) 또는 전달받은 상태(state.item)에서 샘플 URL 확인
    const sampleUrl = itemDetail?.sample || state?.item?.sample;
    if (sampleUrl) {
      const samples = parseSampleUrls(sampleUrl);
      if (samples.length > 0) {
        const firstSampleUrl = resolveFileUrl(samples[0]?.url);
        if (!firstSampleUrl) {
          toast.error('샘플 파일 URL이 유효하지 않습니다.');
          return;
        }
        openPopup(firstSampleUrl, 'risk2200-sample-view');
      } else {
        toast.error('등록된 샘플 파일이 없습니다.');
      }
    } else {
      toast.error('등록된 샘플 파일이 없습니다.');
    }
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
        {isItemLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
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
              onDownload={handleDownload}
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
        )}
      </Box>

      {/* 위험성 평가 설정 모달 */}
      <RiskAssessmentSettingModal
        open={riskAssessmentModalOpen}
        onClose={() => setRiskAssessmentModalOpen(false)}
        onSave={handleRiskAssessmentSave}
      />

      {/* PDF 다운로드 로딩 모달 */}
      <PDFDownloadModal
        open={pdfDownloadModalOpen}
        title={downloadLoadingTitle}
        message={downloadLoadingMessage}
      />

      <DownloadFormatModal
        open={downloadFormatModalOpen}
        documentName={selectedDownloadTarget?.documentName}
        onClose={() => {
          setDownloadFormatModalOpen(false);
          setSelectedDownloadTarget(null);
        }}
        onSelect={handleSelectDownloadFormat}
      />

      {/* 삭제 확인 모달 */}
      <DeleteDocumentModal
        open={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSelectedDeleteRow(null);
        }}
        onConfirm={handleConfirmDelete}
        document={selectedDeleteRow}
        isDeleting={deleteDocumentMutation.isPending}
      />
    </DashboardContent>
  );
}
