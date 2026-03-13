import type { Theme, SxProps } from '@mui/material/styles';
import { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';

import { DashboardContent } from 'src/layouts/dashboard';
import { CONFIG } from 'src/global-config';
import { getItem, type SafetySystem } from 'src/_mock/_safety-system';
import type {
  SafetySystemItem,
  SafetySystemDocument,
} from 'src/services/safety-system/safety-system.types';
import {
  getSafetySystemItem,
  addApprovalSignature,
} from 'src/services/safety-system/safety-system.service';
import { getSafetySystemDocumentDetail } from 'src/services/dashboard/dashboard.service';
import { uploadFile } from 'src/services/system/system.service';

import DetailHeader from './components/Header';
import DocumentHeader from './components/DocumentHeader';
import { tableRegistry, type TableComponent } from './tables';
import FooterButtons from './components/FooterButtons';
import { generatePDF } from './utils/pdf-utils';
import { getRiskAssessmentTableData } from './data/table-data';
import type { DefaultTableRow } from './tables/Default';
import SignatureModal from '../edit/components/SignatureModal';
import PDFDownloadModal from '../components/PDFDownloadModal';
import SampleViewModal, { parseSampleUrls } from '../components/SampleViewModal';

// ----------------------------------------------------------------------

type Props = {
  riskId?: string;
  safetyId?: string;
  system?: SafetySystem;
  item?: SafetySystemItem;
  title?: string;
  description?: string;
  sx?: SxProps<Theme>;
};

const isValidWorkerSignature = (worker: {
  targetMemberIdx?: number | null;
  memberName?: string | null;
}): boolean => {
  if (!worker?.targetMemberIdx || worker.targetMemberIdx <= 0) {
    return false;
  }

  const memberName = worker.memberName?.trim();
  return Boolean(memberName);
};

const buildEducationVideoRowsFromWorkerSignatureList = (workerList: any[]) =>
  workerList
    .filter((worker) => isValidWorkerSignature(worker))
    .map((worker) => {
    const signatureData = worker.signatureData ?? worker.signature ?? undefined;
    return normalizeTbmEvidenceFields({
      participant: {
        memberIdx: worker.targetMemberIdx,
        name: worker.memberName || '',
        department: worker.department || '',
      },
      educationVideo: worker.vodTitle || '',
      vodIdx: worker.vodIdx,
      evidenceFileName: worker.evidenceFileName,
      evidenceFileUrl: worker.evidenceFileUrl,
      evidenceFileNames: worker.evidenceFileNames,
      evidenceFileUrls: worker.evidenceFileUrls,
      workerSignatureIdx:
        worker.documentWorkerSignatureIdx ?? worker.workerSignatureIdx ?? undefined,
      signature: signatureData ? signatureData : worker.status === 'SIGNED' ? 'SIGNED' : '',
    });
  });

const normalizeTbmEducationMethod = (method?: string | null) => {
  if (method === 'IN_PERSON') return 'OFFLINE';
  if (method === 'VIDEO') return 'ONLINE';
  return method ?? 'ONLINE';
};

const normalizeTbmEvidenceFields = (row: any) => {
  const evidenceFileNames =
    Array.isArray(row?.evidenceFileNames) && row.evidenceFileNames.length > 0
      ? row.evidenceFileNames
      : row?.evidenceFileName
        ? [row.evidenceFileName]
        : [];
  const evidenceFileUrls =
    Array.isArray(row?.evidenceFileUrls) && row.evidenceFileUrls.length > 0
      ? row.evidenceFileUrls
      : row?.evidenceFileUrl
        ? [row.evidenceFileUrl]
        : [];

  return {
    ...row,
    evidenceFileNames,
    evidenceFileUrls,
    evidenceFileName: evidenceFileNames[0],
    evidenceFileUrl: evidenceFileUrls[0],
  };
};

const getTbmWorkerKey = (
  row: { targetMemberIdx?: number | null; vodIdx?: number | null },
  isOffline: boolean
) => `${row.targetMemberIdx ?? ''}${isOffline ? '' : `:${row.vodIdx ?? ''}`}`;

export function Risk_2200View({
  riskId,
  safetyId,
  system,
  item: propItem,
  title = 'Blank',
  description,
  sx,
}: Props) {
  const pdfRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { risk_id } = useParams<{ risk_id: string }>();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentDate = new Date();
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const formattedDate = `${currentDate.getFullYear()}.${String(currentDate.getMonth() + 1).padStart(
    2,
    '0'
  )}.${String(currentDate.getDate()).padStart(2, '0')} (${days[currentDate.getDay()]})`;

  // riskId 또는 risk_id에서 safetySystemDocumentIdx 추출
  const safetySystemDocumentIdx = riskId ? Number(riskId) : risk_id ? Number(risk_id) : null;

  // item이 없으면 system에서 찾기 (타입 변환 필요)
  const item = propItem || (system?.items?.[0] as SafetySystemItem | undefined);

  // safetySystemItemIdx 추출 (타입 가드 사용)
  const safetySystemItemIdx = useMemo(() => {
    if (!item) return null;
    // services 타입인지 확인
    if ('safetySystemItemIdx' in item) {
      return (item as SafetySystemItem).safetySystemItemIdx;
    }
    // _mock 타입인 경우 (itemNumber와 safetyIdx로 조회 필요)
    // 하지만 API를 사용하려면 safetySystemItemIdx가 필요하므로 null 반환
    return null;
  }, [item]);

  // 문서 상세 정보 조회 (아이템 상세 정보에서 documentList를 가져와서 해당 문서 찾기)
  const {
    data: itemDetailResponse,
    isLoading: isItemLoading,
    error: itemError,
  } = useQuery({
    queryKey: ['safety-system-item', safetySystemItemIdx],
    queryFn: async () => {
      if (!safetySystemItemIdx) {
        return null;
      }
      try {
        const response = await getSafetySystemItem(safetySystemItemIdx);

        // axios 인터셉터에서 body.data를 평탄화
        const itemData =
          (response as any).item ||
          (response as any).body?.data?.item ||
          (response as any).body?.item;
        const documentList =
          (response as any).documentList ||
          (response as any).body?.data?.documentList ||
          (response as any).body?.documentList ||
          [];

        if (!itemData) return null;

        return {
          ...itemData,
          documentList,
        } as SafetySystemItem;
      } catch (error) {
        console.error('아이템 상세 정보 조회 실패:', error);
        return null;
      }
    },
    enabled: !!safetySystemItemIdx,
  });

  const { data: documentDetailResponse, isLoading: isDetailLoading } = useQuery({
    queryKey: ['safety-system-document-detail', safetySystemDocumentIdx],
    queryFn: async () => {
      if (!safetySystemDocumentIdx) {
        return null;
      }
      try {
        return await getSafetySystemDocumentDetail({ safetySystemDocumentIdx });
      } catch (error) {
        console.error('문서 상세 정보 조회 실패:', error);
        return null;
      }
    },
    enabled: !!safetySystemDocumentIdx,
  });

  const detailDocument = useMemo(() => {
    if (!documentDetailResponse) return null;
    return (
      (documentDetailResponse as any).originalDocument ||
      (documentDetailResponse as any).body?.data?.originalDocument ||
      (documentDetailResponse as any).body?.originalDocument ||
      null
    );
  }, [documentDetailResponse]);

  // 현재 문서 찾기
  const listDocument = itemDetailResponse?.documentList?.find(
    (doc) => doc.safetySystemDocumentIdx === safetySystemDocumentIdx
  ) as SafetySystemDocument | undefined;

  const resolvedDocument = useMemo(() => {
    if (!detailDocument) return listDocument;
    if (!listDocument) return detailDocument as SafetySystemDocument;

    return {
      ...listDocument,
      ...detailDocument,
      approvalList: detailDocument.approvalList ?? listDocument.approvalList,
      signatureList: detailDocument.signatureList ?? listDocument.signatureList,
      workerSignatureList: detailDocument.workerSignatureList ?? listDocument.workerSignatureList,
    } as SafetySystemDocument;
  }, [detailDocument, listDocument]);

  const currentDocument = resolvedDocument;

  const isLoadingDocument = isItemLoading || isDetailLoading;
  const documentError = itemError;

  const handleDownloadPDF = async () => {
    const element = pdfRef.current;
    if (!element) return;

    setPdfDownloadModalOpen(true);
    try {
      // 문서명을 사용하여 PDF 파일명 생성
      const documentName = currentDocument?.documentName || '문서';
      const filename = `${documentName}_${formattedDate.replace(/[\s:]/g, '_')}.pdf`;
      await generatePDF(element, filename);
    } finally {
      setPdfDownloadModalOpen(false);
    }
  };

  // 자동 PDF 다운로드 (URL 파라미터로 트리거) — searchParams 직접 변이 금지(무한 리렌더 방지)
  const autoDownloadTriggeredRef = useRef(false);
  useEffect(() => {
    const autoDownload = searchParams.get('autoDownload');
    if (autoDownload !== 'true' || !pdfRef.current || autoDownloadTriggeredRef.current) {
      return undefined;
    }
    autoDownloadTriggeredRef.current = true;
    const timer = setTimeout(() => {
      handleDownloadPDF().then(() => {
        const nextParams = new URLSearchParams(searchParams);
        nextParams.delete('autoDownload');
        setSearchParams(nextParams, { replace: true });
        if (window.opener) {
          window.close();
        }
      });
    }, 1500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleBack = () => {
    // 이전 페이지로 정확히 복귀 (히스토리 기반)
    navigate(-1);
  };

  // 서명 패드 모달 상태
  const [signatureModal, setSignatureModal] = useState<{
    open: boolean;
    type: 'writer' | 'reviewer' | 'approver' | null;
  }>({ open: false, type: null });

  // PDF 다운로드 모달 상태
  const [pdfDownloadModalOpen, setPdfDownloadModalOpen] = useState(false);

  const handleAddSignature = useCallback(() => {
    // 서명 패드 모달 열기 (작성자 서명)
    setSignatureModal({ open: true, type: 'writer' });
  }, []);

  const handleCloseSignatureModal = useCallback(() => {
    setSignatureModal({ open: false, type: null });
  }, []);

  // 결재 서명 등록 API Mutation
  const addSignatureMutation = useMutation({
    mutationFn: async ({ docIdx, signatureData }: { docIdx: number; signatureData: string }) => {
      // signatureData는 이미 업로드된 URL
      await addApprovalSignature(docIdx, {
        signatureData,
        approvalStatus: 'APPROVED',
      });
    },
    onSuccess: () => {
      alert('서명이 등록되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['safety-system-item'] });
    },
    onError: (error: any) => {
      alert(error?.message || '서명 등록에 실패했습니다.');
    },
  });

  const handleConfirmSignature = useCallback(
    async (signatureDataUrl: string) => {
      if (!signatureModal.type || !safetySystemDocumentIdx) {
        handleCloseSignatureModal();
        return;
      }

      try {
        // base64 데이터를 File 객체로 변환
        const base64Data = signatureDataUrl.includes(',')
          ? signatureDataUrl.split(',')[1]
          : signatureDataUrl.replace(/^data:image\/png;base64,/, '');
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'image/png' });
        const file = new File([blob], `signature_${signatureModal.type}_${Date.now()}.png`, {
          type: 'image/png',
        });

        // 파일 업로드 API 호출
        const uploadResponse = await uploadFile({ files: [file] });
        // axios 인터셉터에서 평탄화되므로 직접 접근
        // 실제 응답 구조: { files: [{ fileUrl: string, ... }], header: {...} }
        const uploadedFiles = (uploadResponse as any).files || [];
        const signatureUrl = uploadedFiles[0]?.fileUrl || (uploadResponse as any).fileUrls?.[0];

        if (!signatureUrl) {
          throw new Error('파일 업로드에 실패했습니다.');
        }

        // 서명 등록 API 호출 (업로드된 URL 전송)
        await addSignatureMutation.mutateAsync({
          docIdx: safetySystemDocumentIdx,
          signatureData: signatureUrl,
        });
        handleCloseSignatureModal();
      } catch (error) {
        // 에러는 mutation의 onError에서 처리됨
        console.error('서명 업로드 실패:', error);
      }
    },
    [signatureModal.type, safetySystemDocumentIdx, addSignatureMutation, handleCloseSignatureModal]
  );

  // riskId에서 문서 정보 추출 (형식: safetyIdx-itemNumber-documentNumber)
  const extractedInfo = riskId
    ? (() => {
        const parts = riskId.split('-');
        if (parts.length >= 3) {
          return {
            safetyIdx: Number(parts[0]),
            itemNumber: Number(parts[1]),
            documentNumber: Number(parts[2]),
          };
        }
        return null;
      })()
    : null;

  // 문서 테이블 데이터 파싱 (currentDocument의 tableData 사용)
  const documentTableData = useMemo(() => {
    if (!currentDocument?.tableData) return null;

    try {
      const parsed =
        typeof currentDocument.tableData === 'string'
          ? JSON.parse(currentDocument.tableData)
          : currentDocument.tableData;

      if (parsed?.tableType === '2400-tbm') {
        const normalizedMethod = normalizeTbmEducationMethod(
          parsed?.data?.educationMethod ?? (currentDocument as any)?.educationMethod
        );
        const isOffline = normalizedMethod === 'OFFLINE';
        const workerSignatureList = (
          (currentDocument as any)?.workerSignatureList ||
          (currentDocument as any)?.educationVideoRows ||
          []
        ).filter((worker: any) => isValidWorkerSignature(worker));

        const rowsFromTableData = Array.isArray(parsed?.data?.educationVideoRows)
          ? parsed.data.educationVideoRows
              .map((row: any) => normalizeTbmEvidenceFields(row))
              .filter(
              (row: any) =>
                Boolean(row?.participant?.memberIdx) &&
                typeof row?.participant?.name === 'string' &&
                row.participant.name.trim() !== ''
              )
          : [];

        const baseEducationVideoRows =
          rowsFromTableData.length > 0
            ? rowsFromTableData
            : Array.isArray(workerSignatureList)
              ? buildEducationVideoRowsFromWorkerSignatureList(workerSignatureList)
              : [];

        if (!Array.isArray(workerSignatureList) || workerSignatureList.length === 0) {
          return {
            ...parsed,
            data: {
              ...(parsed.data ?? {}),
              educationVideoRows: baseEducationVideoRows,
            },
          };
        }

        const signatureMap = new Map<
          string,
          { signatureData?: string; status?: string; workerSignatureIdx?: number }
        >();

        workerSignatureList.forEach((worker: any) => {
          const key = getTbmWorkerKey(worker, isOffline);
          signatureMap.set(key, {
            signatureData: worker.signatureData ?? worker.signature,
            status: worker.status,
            workerSignatureIdx:
              worker.documentWorkerSignatureIdx ?? worker.workerSignatureIdx ?? undefined,
          });
        });

        const educationVideoRows = baseEducationVideoRows.map((row: any) => {
          const directKey = getTbmWorkerKey(
            { targetMemberIdx: row.participant?.memberIdx, vodIdx: row.vodIdx },
            isOffline
          );
          const fallbackKey = getTbmWorkerKey(
            { targetMemberIdx: row.participant?.memberIdx, vodIdx: undefined },
            true
          );
          const match = signatureMap.get(directKey) || signatureMap.get(fallbackKey);

          const resolvedSignature = match
            ? match.signatureData
              ? match.signatureData
              : match.status === 'SIGNED'
                ? 'SIGNED'
                : ''
            : row.signature || '';

          return {
            ...row,
            workerSignatureIdx: match?.workerSignatureIdx ?? row.workerSignatureIdx,
            signature: resolvedSignature,
          };
        });

        return {
          ...parsed,
          data: {
            ...(parsed.data ?? {}),
            educationMethod: normalizedMethod,
            educationPlace: parsed?.data?.educationPlace,
            educationVideoRows,
          },
        };
      }
      return parsed;
    } catch (error) {
      console.error('tableData 파싱 실패:', error);
      return null;
    }
  }, [currentDocument]);

  // safetyIdx와 itemNumber 추출 (item/system이 없으면 riskId에서 추출)
  const safetyIdx = item?.safetyIdx || system?.safetyIdx || extractedInfo?.safetyIdx;
  const itemNumber = item?.itemNumber || extractedInfo?.itemNumber;

  // TODO: TanStack Query Hook(useQuery)으로 테이블 데이터 가져오기 (기본값용)
  // const { data: tableData } = useQuery({
  //   queryKey: ['risk2200TableData', safetyIdx, itemNumber],
  //   queryFn: () => getRisk2200TableData({ safetyIdx, itemNumber }),
  //   enabled: !!safetyIdx && !!itemNumber,
  // });
  // 목업 데이터 사용
  const tableData = getRiskAssessmentTableData(safetyIdx, itemNumber);

  // 2100번대 문서 여부 확인 (safetyIdx=2, itemNumber=1)
  const is2100Series = safetyIdx === 2 && itemNumber === 1;
  // 1200번대 문서 여부 확인 (safetyIdx=1, itemNumber=2)
  const is1200Series = safetyIdx === 1 && itemNumber === 2;
  // 1500번대 문서 여부 확인 (safetyIdx=1, itemNumber=5)
  const is1500Series = safetyIdx === 1 && itemNumber === 5;
  // 1400번대 문서 여부 확인 (safetyIdx=1, itemNumber=4)
  const is1400Series = safetyIdx === 1 && itemNumber === 4;
  // 1100번대 문서 여부 확인 (safetyIdx=1, itemNumber=1)
  const is1100Series = safetyIdx === 1 && itemNumber === 1;
  // 1300번대 문서 여부 확인 (safetyIdx=1, itemNumber=3)
  const is1300Series = safetyIdx === 1 && itemNumber === 3;
  // 2300번대 문서 여부 확인 (safetyIdx=2, itemNumber=3)
  const is2300Series = safetyIdx === 2 && itemNumber === 3;
  // 2200번대 문서 여부 확인 (safetyIdx=2, itemNumber=2)
  const is2200Series = safetyIdx === 2 && itemNumber === 2;
  // 2400번대 문서 여부 확인 (safetyIdx=2, itemNumber=4)
  const is2400Series = safetyIdx === 2 && itemNumber === 4;
  // 2400번대 TBM 일지 여부 확인
  const is2400TBM = is2400Series && documentTableData?.tableType === '2400-tbm';
  // 2400번대 연간 교육 계획 여부 확인
  const is2400Education = is2400Series && documentTableData?.tableType === '2400-education';

  // resolvedItem은 API에서 가져온 item 또는 propItem 사용
  const resolvedItem =
    itemDetailResponse ||
    (item && 'safetySystemItemIdx' in item ? item : undefined) ||
    (safetyIdx && itemNumber ? getItem(safetyIdx, itemNumber) : undefined);

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

  // 샘플 보기 모달 상태
  const [sampleViewModalOpen, setSampleViewModalOpen] = useState(false);

  const handleSampleView = () => {
    // 활성화된 아이템 정보(resolvedItem)에서 샘플 URL 확인 (타입 단언 추가)
    const sampleUrl = (resolvedItem as any)?.sample;
    if (sampleUrl) {
      const samples = parseSampleUrls(sampleUrl);
      if (samples.length > 0) {
        // 단일/다중 샘플 모두 모달로 표시
        setSampleViewModalOpen(true);
      }
    } else {
      alert('등록된 샘플 파일이 없습니다.');
    }
  };

  // 샘플 목록 가져오기 (모달용)
  const sampleList = useMemo(() => {
    const sampleUrl = (resolvedItem as any)?.sample;
    return parseSampleUrls(sampleUrl);
  }, [resolvedItem]);

  // 로딩 상태
  if (isLoadingDocument) {
    return (
      <DashboardContent maxWidth="xl">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      </DashboardContent>
    );
  }

  // 에러 상태
  if (documentError) {
    return (
      <DashboardContent maxWidth="xl">
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <Typography color="error">문서를 불러오는 중 오류가 발생했습니다.</Typography>
        </Box>
      </DashboardContent>
    );
  }

  return (
    <>
      <DashboardContent maxWidth="xl">
        <Box
          sx={[
            {
              display: 'flex',
              flexDirection: 'column',
              gap: 5,
              alignItems: 'center',
            },
            ...(Array.isArray(sx) ? sx : [sx]),
          ]}
        >
          <DetailHeader
            title={
              currentDocument?.documentName ||
              (resolvedItem && 'itemName' in resolvedItem
                ? resolvedItem.itemName
                : resolvedItem?.documentName) ||
              system?.systemName ||
              '위험요인 제거·대체 및 통제'
            }
            onBack={handleBack}
            onSampleView={handleSampleView}
          />

          {/* Main Card */}
        <Box
          ref={pdfRef}
          component="div"
          data-pdf-content
          data-pdf-ready={!isLoadingDocument && currentDocument ? 'true' : 'false'}
          sx={{
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: 3,
              width: '100%',

              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              py: 4,
            }}
          >
            <DocumentHeader
              formattedDate={formattedDate}
              title={
                is1100Series
                  ? '위험요인 파악'
                  : is1200Series && documentTableData?.tableType === '1200-industrial'
                    ? '사고조사 보고서'
                    : is1200Series
                      ? '아차 사고 조사표'
                      : is2100Series
                        ? '위험요인별 위험성 평가'
                        : is1500Series
                          ? '위험장소 및 작업형태별 위험요인'
                          : is1400Series
                            ? '유해인자'
                            : is1300Series
                              ? '위험 기계·기구·설비'
                              : is2300Series
                                ? '종합대책 수립·이행'
                                : is2200Series
                                  ? '위험요인 제거·대체 및 통제'
                                  : is2400TBM
                                    ? 'TBM 일지'
                                    : is2400Education
                                      ? '연간 교육 계획'
                                      : undefined
              }
              approvalVariant={
                is1100Series ||
                is1200Series ||
                is2100Series ||
                is1500Series ||
                is1400Series ||
                is1300Series ||
                is2300Series ||
                is2200Series ||
                is2400TBM ||
                is2400Education
                  ? 'four'
                  : 'default'
              }
              onAddSignature={handleAddSignature}
              riskId={riskId}
              currentDocument={currentDocument}
            />

            {(() => {
              // 문서 테이블 데이터가 있으면 사용, 없으면 기본값
              if (is1100Series && documentTableData?.tableType === '1100') {
                const TableComp = tableRegistry['1-1-1100'] as any;
                return <TableComp rows={documentTableData.rows} />;
              }
              if (is2100Series && documentTableData?.tableType === '2100') {
                const TableComp = tableRegistry['2-1-2100'] as any;
                return <TableComp data={documentTableData.data} />;
              }
              if (is1200Series && documentTableData?.tableType === '1200-industrial') {
                const TableComp = tableRegistry['1-2-1200-industrial'] as any;
                return <TableComp row={documentTableData.rows[0]} />;
              }
              if (is1200Series && documentTableData?.tableType === '1200-near-miss') {
                const TableComp = tableRegistry['1-2-1200'] as any;
                return <TableComp row={documentTableData.row} />;
              }
              if (is1500Series && documentTableData?.tableType === '1500') {
                const TableComp = tableRegistry['1-5-1500'] as any;
                return <TableComp rows={documentTableData.rows} />;
              }
              if (is1400Series && documentTableData?.tableType === '1400') {
                const TableComp = tableRegistry['1-4-1400'] as any;
                return <TableComp data={documentTableData.data} />;
              }
              if (is1300Series && documentTableData?.tableType === '1300') {
                const TableComp = tableRegistry['1-3-1300'] as any;
                return <TableComp rows={documentTableData.rows} />;
              }
              if (is2300Series && documentTableData?.tableType === '2300') {
                const TableComp = tableRegistry['2-3-2300'] as any;
                return <TableComp rows={documentTableData.rows} />;
              }
              if (is2200Series && documentTableData?.tableType === '2200') {
                const TableComp = tableRegistry['2-2'] as any;
                return <TableComp data={documentTableData.rows} />;
              }
              if (is2400TBM && documentTableData?.tableType === '2400-tbm') {
                const TableComp = tableRegistry['2-4-2400-tbm'] as any;
                return <TableComp data={documentTableData.data} />;
              }
              if (is2400Education && documentTableData?.tableType === '2400-education') {
                const TableComp = tableRegistry['2-4-2400-education'] as any;
                return (
                  <TableComp
                    rows={documentTableData.rows}
                    minimumEducationRows={documentTableData.minimumEducationRows}
                  />
                );
              }

              // 기본값: 문서 데이터가 없거나 매칭되지 않는 경우
              if (is1100Series) {
                const TableComp = tableRegistry['1-1-1100'] as any;
                return <TableComp />;
              }
              if (is1200Series) {
                const TableComp = tableRegistry['1-2-1200'] as any;
                return <TableComp />;
              }
              if (is2100Series) {
                const TableComp = tableRegistry['2-1-2100'] as any;
                return <TableComp />;
              }
              if (is1500Series) {
                const TableComp = tableRegistry['1-5-1500'] as any;
                return <TableComp />;
              }
              if (is1400Series) {
                const TableComp = tableRegistry['1-4-1400'] as any;
                return <TableComp />;
              }
              if (is1300Series) {
                const TableComp = tableRegistry['1-3-1300'] as any;
                return <TableComp />;
              }
              if (is2300Series) {
                const TableComp = tableRegistry['2-3-2300'] as any;
                return <TableComp />;
              }
              if (is2200Series) {
                const TableComp = tableRegistry['2-2'] as TableComponent;
                return <TableComp data={tableData as DefaultTableRow[]} />;
              }
              if (is2400TBM) {
                const TableComp = tableRegistry['2-4-2400-tbm'] as any;
                return <TableComp />;
              }
              if (is2400Education) {
                const TableComp = tableRegistry['2-4-2400-education'] as any;
                return <TableComp />;
              }

              const key = item ? `${item.safetyIdx}-${item.itemNumber}` : 'Default';
              const TableComp = (tableRegistry as any)[key] || tableRegistry.Default;
              return <TableComp data={tableData as any[]} />;
            })()}
          </Box>

          <FooterButtons onDownloadPDF={handleDownloadPDF} />
        </Box>
      </DashboardContent>

      {/* 서명 패드 모달 */}
      <SignatureModal
        open={signatureModal.open}
        onClose={handleCloseSignatureModal}
        onConfirm={handleConfirmSignature}
        targetLabel={
          signatureModal.type === 'writer'
            ? '작성자'
            : signatureModal.type === 'reviewer'
              ? '검토자'
              : signatureModal.type === 'approver'
                ? '승인자'
                : '결재자'
        }
      />

      {/* PDF 다운로드 로딩 모달 */}
      <PDFDownloadModal open={pdfDownloadModalOpen} />

      {/* 샘플 보기 모달 */}
      <SampleViewModal
        open={sampleViewModalOpen}
        onClose={() => setSampleViewModalOpen(false)}
        samples={sampleList}
      />
    </>
  );
}
