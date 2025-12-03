import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';

import { Iconify } from 'src/components/iconify';
import DialogBtn from 'src/components/safeyoui/button/dialogBtn';
import {
  getSharedDocumentDetail,
  getSafetySystemDocumentDetail,
} from 'src/services/dashboard/dashboard.service';
import type {
  GetSharedDocumentDetailResponse,
  GetSafetySystemDocumentDetailResponse,
} from 'src/services/dashboard/dashboard.types';
import type { Table1100Row } from 'src/sections/PDF/Risk_2200/types/table-data';
import { fDateTime } from 'src/utils/format-time';
import ApprovalSection, { type ApprovalSignature, type ApprovalType } from './ApprovalSection';
import {
  createDocumentApproval,
  addApprovalSignature,
} from 'src/services/safety-system/safety-system.service';

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  onClose: () => void;
  sharedDocumentIdx?: number | null;
  safetySystemDocumentIdx?: number | null;
};

export default function SharedDocumentDetailModal({
  open,
  onClose,
  sharedDocumentIdx: propSharedDocumentIdx,
  safetySystemDocumentIdx: propSafetySystemDocumentIdx,
}: Props) {
  // sharedDocumentIdx가 있으면 공유 문서 상세 조회, 없으면 안전 시스템 문서 상세 조회
  const isUsingSharedDocument =
    propSharedDocumentIdx !== null && propSharedDocumentIdx !== undefined;

  const {
    data: sharedDocumentDetail,
    isLoading: isLoadingShared,
    isError: isErrorShared,
    error: errorShared,
  } = useQuery<GetSharedDocumentDetailResponse>({
    queryKey: ['sharedDocumentDetail', propSharedDocumentIdx],
    queryFn: () => getSharedDocumentDetail({ sharedDocumentIdx: propSharedDocumentIdx! }),
    enabled: open && isUsingSharedDocument && propSharedDocumentIdx! > 0,
  });

  const {
    data: safetySystemDocumentDetail,
    isLoading: isLoadingSafetySystem,
    isError: isErrorSafetySystem,
    error: errorSafetySystem,
  } = useQuery<GetSafetySystemDocumentDetailResponse>({
    queryKey: ['safetySystemDocumentDetail', propSafetySystemDocumentIdx],
    queryFn: () =>
      getSafetySystemDocumentDetail({
        safetySystemDocumentIdx: propSafetySystemDocumentIdx!,
      }),
    enabled:
      open &&
      !isUsingSharedDocument &&
      propSafetySystemDocumentIdx !== null &&
      propSafetySystemDocumentIdx !== undefined &&
      propSafetySystemDocumentIdx > 0,
  });

  const isLoading = isLoadingShared || isLoadingSafetySystem;
  const isError = isErrorShared || isErrorSafetySystem;
  const error = errorShared || errorSafetySystem;

  // 응답 데이터 통합 처리
  const sharedDocument = sharedDocumentDetail?.sharedDocument;
  const originalDocument =
    sharedDocument?.originalDocument || safetySystemDocumentDetail?.originalDocument;

  // tableData 파싱
  const parsedTableData = useMemo(() => {
    if (!originalDocument?.tableData) return null;
    try {
      return typeof originalDocument.tableData === 'string'
        ? JSON.parse(originalDocument.tableData)
        : originalDocument.tableData;
    } catch (parseError) {
      console.error('tableData 파싱 실패:', parseError);
      return null;
    }
  }, [originalDocument?.tableData]);

  // 날짜 포맷팅
  const registeredAt = originalDocument?.createAt
    ? fDateTime(originalDocument.createAt, 'YYYY-MM-DD HH:mm:ss')
    : null;
  const modifiedAt = originalDocument?.updateAt
    ? fDateTime(originalDocument.updateAt, 'YYYY-MM-DD HH:mm:ss')
    : null;
  const documentWrittenAt = originalDocument?.writtenAt || null;
  const approvalDeadline = originalDocument?.approvalDeadline || null;

  // 문서 제목과 작성일
  const documentTitle = originalDocument?.documentName || sharedDocument?.documentName || '';
  const writtenDate = documentWrittenAt
    ? dayjs(documentWrittenAt).format('YYYY.MM.DD (ddd)')
    : null;

  const queryClient = useQueryClient();

  // signatureData를 올바른 형식으로 변환하는 헬퍼 함수
  // URL인 경우 그대로 반환 (ApprovalSection의 getFullFileUrl에서 처리)
  // base64인 경우만 접두사 추가
  const normalizeSignatureData = (signatureData: string | null | undefined): string | undefined => {
    if (!signatureData) return undefined;
    // 이미 data URL인 경우 (실제 base64 데이터)
    if (signatureData.startsWith('data:image/') && !signatureData.includes('data/admin/')) {
      return signatureData;
    }
    // URL인 경우 (data/admin/로 시작하거나 /로 시작하거나 http로 시작)
    if (
      signatureData.startsWith('data/admin/') ||
      signatureData.startsWith('/data/admin/') ||
      signatureData.startsWith('http') ||
      signatureData.includes('/')
    ) {
      return signatureData; // ApprovalSection의 getFullFileUrl에서 처리
    }
    // base64 문자열인 경우
    return `data:image/png;base64,${signatureData}`;
  };

  // 결재 정보 처리
  const approvalStep = originalDocument?.approvalStep || 0;
  const safetySystemDocumentIdx =
    originalDocument?.safetySystemDocumentIdx || propSafetySystemDocumentIdx || undefined;

  // approvalStep에 따라 결재 정보 매핑
  const approvalSignatures = useMemo(() => {
    const approvalList = (originalDocument as any)?.approvalList || [];
    const signatures: ApprovalSignature[] = [];

    // approvalStep에 따라 필요한 타입 결정
    const needsWriter = approvalStep >= 2;
    const needsReviewer = approvalStep >= 3;
    const needsApprover = approvalStep >= 1;

    // approvalList에서 각 단계의 첫 번째 항목 찾기
    if (needsWriter) {
      const writer = approvalList.find((item: any) => item.approvalStep === 2);
      if (writer) {
        signatures.push({
          type: 'writer',
          name: writer.memberName,
          date: writer.approvedAt ? dayjs(writer.approvedAt).format('YYYY-MM-DD') : undefined,
          signature: normalizeSignatureData(writer.signatureData),
          memberIdx: writer.targetMemberIdx,
          documentApprovalIdx: writer.documentApprovalIdx,
        });
      } else {
        signatures.push({ type: 'writer' });
      }
    }

    if (needsReviewer) {
      const reviewer = approvalList.find((item: any) => item.approvalStep === 3);
      if (reviewer) {
        signatures.push({
          type: 'reviewer',
          name: reviewer.memberName,
          date: reviewer.approvedAt ? dayjs(reviewer.approvedAt).format('YYYY-MM-DD') : undefined,
          signature: normalizeSignatureData(reviewer.signatureData),
          memberIdx: reviewer.targetMemberIdx,
          documentApprovalIdx: reviewer.documentApprovalIdx,
        });
      } else {
        signatures.push({ type: 'reviewer' });
      }
    }

    if (needsApprover) {
      const approver = approvalList.find((item: any) => item.approvalStep === 1);
      if (approver) {
        signatures.push({
          type: 'approver',
          name: approver.memberName,
          date: approver.approvedAt ? dayjs(approver.approvedAt).format('YYYY-MM-DD') : undefined,
          signature: normalizeSignatureData(approver.signatureData),
          memberIdx: approver.targetMemberIdx,
          documentApprovalIdx: approver.documentApprovalIdx,
        });
      } else {
        signatures.push({ type: 'approver' });
      }
    }

    return signatures;
  }, [originalDocument, approvalStep]);

  // approvalList를 타입별로 매핑 (documentApprovalIdx 찾기용)
  const approvalListMap = useMemo(() => {
    const approvalList = (originalDocument as any)?.approvalList || [];
    const map = new Map<ApprovalType, any>();
    approvalList.forEach((item: any) => {
      if (item.approvalStep === 1) map.set('approver', item);
      else if (item.approvalStep === 2) map.set('writer', item);
      else if (item.approvalStep === 3) map.set('reviewer', item);
    });
    return map;
  }, [originalDocument]);

  // 결재 대상자 등록 Mutation
  const createApprovalMutation = useMutation({
    mutationFn: async ({
      approvalType,
      targetMemberIdx,
      approvalStepValue,
    }: {
      approvalType: ApprovalType;
      targetMemberIdx: number;
      approvalStepValue: number;
    }) => {
      if (!safetySystemDocumentIdx) throw new Error('문서 인덱스가 없습니다.');

      // approvalStep 매핑: writer=2, reviewer=3, approver=1
      const stepMap: Record<ApprovalType, number> = {
        writer: 2,
        reviewer: 3,
        approver: 1,
      };

      await createDocumentApproval(safetySystemDocumentIdx, {
        approvalType: 'sequential',
        approvalTargetList: [
          {
            targetMemberIdx,
            approvalStep: stepMap[approvalType],
          },
        ],
      });
    },
    onSuccess: () => {
      if (propSharedDocumentIdx) {
        queryClient.invalidateQueries({
          queryKey: ['sharedDocumentDetail', propSharedDocumentIdx],
        });
      }
      if (propSafetySystemDocumentIdx) {
        queryClient.invalidateQueries({
          queryKey: ['safetySystemDocumentDetail', propSafetySystemDocumentIdx],
        });
      }
    },
  });

  // 서명 등록 Mutation
  const addSignatureMutation = useMutation({
    mutationFn: async ({
      signatureData,
      approvalStatus,
    }: {
      signatureData: string;
      approvalStatus: 'APPROVED' | 'REJECTED';
    }) => {
      if (!safetySystemDocumentIdx) throw new Error('문서 인덱스가 없습니다.');

      await addApprovalSignature(safetySystemDocumentIdx, {
        signatureData,
        approvalStatus,
      });
    },
    onSuccess: () => {
      if (propSharedDocumentIdx) {
        queryClient.invalidateQueries({
          queryKey: ['sharedDocumentDetail', propSharedDocumentIdx],
        });
      }
      if (propSafetySystemDocumentIdx) {
        queryClient.invalidateQueries({
          queryKey: ['safetySystemDocumentDetail', propSafetySystemDocumentIdx],
        });
      }
    },
  });

  // 결재 정보 업데이트 핸들러
  const handleUpdateSignature = async (
    type: ApprovalType,
    memberIdx: number,
    signatureData?: string,
    documentApprovalIdx?: number
  ) => {
    if (!safetySystemDocumentIdx) return;

    try {
      // approvalStep 매핑
      const stepMap: Record<ApprovalType, number> = {
        writer: 2,
        reviewer: 3,
        approver: 1,
      };

      // 멤버 지정 (서명이 없을 때)
      if (!signatureData) {
        await createApprovalMutation.mutateAsync({
          approvalType: type,
          targetMemberIdx: memberIdx,
          approvalStepValue: stepMap[type],
        });
      } else {
        // 서명 등록 (이미 멤버가 지정되어 있어야 함)
        // documentApprovalIdx가 있으면 사용, 없으면 approvalListMap에서 찾기
        const approvalItem = documentApprovalIdx
          ? { documentApprovalIdx }
          : approvalListMap.get(type);
        if (!approvalItem) {
          console.error('결재 정보를 찾을 수 없습니다.');
          return;
        }

        await addSignatureMutation.mutateAsync({
          signatureData,
          approvalStatus: 'APPROVED',
        });
      }

      // 서명 완료 후 쿼리 무효화하여 데이터 새로고침
      if (propSharedDocumentIdx) {
        queryClient.invalidateQueries({
          queryKey: ['sharedDocumentDetail', propSharedDocumentIdx],
        });
      }
      if (propSafetySystemDocumentIdx) {
        queryClient.invalidateQueries({
          queryKey: ['safetySystemDocumentDetail', propSafetySystemDocumentIdx],
        });
      }
    } catch (updateError) {
      console.error('결재 정보 업데이트 실패:', updateError);
    }
  };

  // 모달 닫기 핸들러
  const handleClose = () => {
    onClose();
  };

  // 테이블 렌더링 (1100 타입만 지원)
  const renderTable = () => {
    if (!parsedTableData || parsedTableData.tableType !== '1100') {
      return null;
    }

    const rows: Table1100Row[] = parsedTableData.rows || [];

    return (
      <Box
        component="table"
        sx={{
          width: '100%',
          border: '2px solid',
          borderColor: 'text.primary',
          borderCollapse: 'collapse',
          '& th, & td': {
            border: '1px solid',
            borderColor: 'text.primary',
            padding: 1,
            textAlign: 'center',
            verticalAlign: 'middle',
          },
          '& th': {
            backgroundColor: 'grey.100',
            fontSize: 14,
            fontWeight: 600,
            lineHeight: '22px',
            height: 60,
          },
          '& td': {
            fontSize: 14,
            fontWeight: 400,
            lineHeight: '22px',
            whiteSpace: 'pre-wrap',
          },
        }}
      >
        <thead>
          <tr>
            <th style={{ maxWidth: 200 }}>고위험작업 및 상황</th>
            <th style={{ maxWidth: 361 }}>재해유발요인</th>
            <th style={{ maxWidth: 100 }}>작업장소</th>
            <th style={{ maxWidth: 160 }}>
              기계·기구·설비
              <br />
              유해인자
            </th>
            <th style={{ maxWidth: 80 }}>개선필요</th>
            <th style={{ maxWidth: 110 }}>비고</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index}>
              <td>
                <Typography
                  sx={{
                    fontSize: 14,
                    fontWeight: 400,
                    lineHeight: '22px',
                    textAlign: 'left',
                    px: 1,
                  }}
                >
                  {row.highRiskWork}
                </Typography>
              </td>
              <td>
                <Typography
                  sx={{
                    fontSize: 14,
                    fontWeight: 400,
                    lineHeight: '22px',
                    textAlign: 'left',
                    px: 1,
                  }}
                >
                  {row.disasterFactor}
                </Typography>
              </td>
              <td>
                <Typography
                  sx={{
                    fontSize: 14,
                    fontWeight: 400,
                    lineHeight: '22px',
                  }}
                >
                  {row.workplace}
                </Typography>
              </td>
              <td>
                <Typography
                  sx={{
                    fontSize: 14,
                    fontWeight: 400,
                    lineHeight: '22px',
                  }}
                >
                  {row.machineHazard}
                </Typography>
              </td>
              <td>
                <Typography
                  sx={{
                    fontSize: 14,
                    fontWeight: 400,
                    lineHeight: '22px',
                  }}
                >
                  {row.improvementNeeded}
                </Typography>
              </td>
              <td>
                <Typography
                  sx={{
                    fontSize: 14,
                    fontWeight: 400,
                    lineHeight: '22px',
                  }}
                >
                  {row.remark}
                </Typography>
              </td>
            </tr>
          ))}
        </tbody>
      </Box>
    );
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Typography component="div" variant="h6" sx={{ fontWeight: 600, fontSize: 18 }}>
          공유 문서 상세
        </Typography>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            position: 'absolute',
            right: 16,
            top: 16,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <Iconify icon="solar:close-circle-bold" width={24} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 6 }}>
            <CircularProgress size={32} />
          </Box>
        ) : isError ? (
          <Alert severity="error" sx={{ my: 2, mx: 3 }}>
            {error instanceof Error ? error.message : '문서를 불러오는 중 오류가 발생했습니다.'}
          </Alert>
        ) : originalDocument ? (
          <Stack spacing={0}>
            {/* 헤더 정보 (회색 배경) */}
            <Box
              sx={{
                bgcolor: 'grey.100',
                p: 3,
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
              }}
            >
              {/* 첫 번째 행: 등록일, 수정일 */}
              <Box sx={{ display: 'flex', gap: 5, width: '100%' }}>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flex: 1 }}>
                  <Typography variant="subtitle2" sx={{ minWidth: 100, fontWeight: 600 }}>
                    등록일
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.primary' }}>
                    {registeredAt || '-'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flex: 1 }}>
                  <Typography variant="subtitle2" sx={{ minWidth: 100, fontWeight: 600 }}>
                    수정일
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.primary' }}>
                    {modifiedAt || '-'}
                  </Typography>
                </Box>
              </Box>

              {/* 두 번째 행: 문서번호, 작성 IP */}
              <Box sx={{ display: 'flex', gap: 5, width: '100%' }}>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flex: 1 }}>
                  <Typography variant="subtitle2" sx={{ minWidth: 100, fontWeight: 600 }}>
                    문서번호
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.primary' }}>
                    {originalDocument.safetySystemDocumentIdx || '-'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flex: 1 }}>
                  <Typography variant="subtitle2" sx={{ minWidth: 100, fontWeight: 600 }}>
                    작성 IP
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.primary' }}>
                    -
                  </Typography>
                </Box>
              </Box>

              {/* 세 번째 행: 문서 작성일, 결재 마감일 */}
              <Box sx={{ display: 'flex', gap: 5, width: '100%' }}>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flex: 1 }}>
                  <Typography variant="subtitle2" sx={{ minWidth: 100, fontWeight: 600 }}>
                    문서 작성일
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.primary' }}>
                    {documentWrittenAt || '-'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flex: 1 }}>
                  <Typography variant="subtitle2" sx={{ minWidth: 100, fontWeight: 600 }}>
                    결재 마감일
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.primary' }}>
                    {approvalDeadline || '-'}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* 문서 제목, 작성일, 결재 섹션 */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                px: 3,
                py: 3,
                gap: 3,
              }}
            >
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1.25 }}>
                <Typography
                  variant="h3"
                  sx={{
                    fontSize: 32,
                    fontWeight: 700,
                    lineHeight: '48px',
                    color: 'text.primary',
                  }}
                >
                  {documentTitle}
                </Typography>
                {writtenDate && (
                  <Typography
                    variant="h6"
                    sx={{
                      fontSize: 18,
                      fontWeight: 600,
                      lineHeight: '28px',
                      color: 'text.primary',
                    }}
                  >
                    작성일 : {writtenDate}
                  </Typography>
                )}
              </Box>
              {/* 결재 섹션 */}
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <ApprovalSection
                  signatures={approvalSignatures}
                  approvalStep={approvalStep}
                  onUpdateSignature={handleUpdateSignature}
                  safetySystemDocumentIdx={safetySystemDocumentIdx ?? undefined}
                />
              </Box>
            </Box>

            {/* 테이블 */}
            {parsedTableData && <Box sx={{ px: 3, pb: 3, width: '100%' }}>{renderTable()}</Box>}
          </Stack>
        ) : (
          <Alert severity="info" sx={{ my: 2, mx: 3 }}>
            문서 정보를 찾을 수 없습니다.
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 3 }}>
        <Box sx={{ flex: 1 }} />
        <DialogBtn variant="contained" onClick={handleClose} sx={{ minHeight: 36, fontSize: 14 }}>
          닫기
        </DialogBtn>
      </DialogActions>
    </Dialog>
  );
}
