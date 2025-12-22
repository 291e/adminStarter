import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import Checkbox from '@mui/material/Checkbox';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Pagination from '@mui/material/Pagination';
import Divider from '@mui/material/Divider';

import {
  sendNotification,
  getSafetySystemDocument,
} from 'src/services/safety-system/safety-system.service';
import type {
  DocumentSignatureInfo,
  WorkerSignatureStatusInfo,
} from 'src/services/safety-system/safety-system.types';

import DialogBtn from 'src/components/safeyoui/button/dialogBtn';
import Badge from 'src/components/safeyoui/badge';

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  onClose: () => void;
  documentName?: string;
  writtenAt?: string;
  approvalDeadline?: string;
  documentId?: string;
  signatureList?: DocumentSignatureInfo[]; // 결재 서명 목록
  workerSignatureList?: WorkerSignatureStatusInfo[]; // 근로자 서명 목록 (추가)
};

const ROWS_PER_PAGE = 10;

export default function ProgressModal({
  open,
  onClose,
  documentName,
  writtenAt,
  approvalDeadline,
  documentId,
  signatureList = [],
  workerSignatureList = [],
}: Props) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [page, setPage] = useState(1);

  // 문서 상세 정보 조회 (실시간 서명 현황 반영을 위해)
  const { data: documentDetail } = useQuery({
    queryKey: ['safetySystemDocument', Number(documentId)],
    queryFn: () => getSafetySystemDocument(Number(documentId)),
    enabled: !!documentId,
  });

  // approvalStep에 따라 유형 결정 (결재 유형)
  const getApprovalTypeByStep = (step: number) => {
    switch (step) {
      case 1:
        return '승인자';
      case 2:
        return '작성자';
      case 3:
        return '검토자';
      default:
        return '결재자';
    }
  };

  // memberRole을 한글로 변환 (슈퍼어드민이면 "최고관리자" 반환)
  const getMemberRoleLabel = (memberRole?: string, isSuperAdmin?: boolean) => {
    // 슈퍼어드민이면 무조건 "최고관리자"
    if (isSuperAdmin) {
      return '최고관리자';
    }

    if (!memberRole) return '-';

    const roleMap: Record<string, string> = {
      OPERATOR_MANAGER: '조직 관리자',
      MANAGEMENT_SUPERVISOR: '관리 감독자',
      SAFETY_MANAGER: '안전보건 담당자',
      WORKER: '근로자',
      ADMIN: '조직 관리자',
      MEMBER: '근로자',
    };

    return roleMap[memberRole.toUpperCase()] || roleMap[memberRole] || memberRole;
  };

  // signatureList 및 workerSignatureList 병합하여 UI 타입으로 변환
  const signatureTargets = useMemo(() => {
    // API 응답 구조 대응: documentDetail이 BaseResponseDto인 경우 body나 직접 속성에 document가 있을 수 있음
    const detailAny = documentDetail as any;
    const docData = detailAny?.document || detailAny?.body?.document || detailAny?.data?.document;

    // API에서 가져온 서명 목록이 있으면 사용 (없으면 props)
    const effectiveSignatureList: DocumentSignatureInfo[] = docData?.signatureList || signatureList;
    const effectiveWorkerList: WorkerSignatureStatusInfo[] =
      docData?.workerSignatureList || workerSignatureList;

    // 1. 결재자 목록 변환
    const approvalTargets = effectiveSignatureList.map((sig) => {
      const status: 'completed' | 'incomplete' =
        sig.approvalStatus === 'APPROVED' ? 'completed' : 'incomplete';
      return {
        id: `approval-${sig.documentApprovalIdx}`,
        targetMemberIdx: sig.targetMemberIdx,
        name: sig.memberName,
        position: sig.position || '',
        department: sig.department || '',
        memberRole: getMemberRoleLabel(sig.memberRole, sig.isSuperAdmin), // 실제 멤버 역할
        approvalType: getApprovalTypeByStep(sig.approvalStep), // 결재 유형 (승인자, 작성자, 검토자)
        type: 'approval' as const,
        status,
        completedAt: sig.approvedAt ? sig.approvedAt.split('T')[0] : undefined,
        avatar: undefined,
      };
    });

    // 2. 근로자 목록 변환
    const workerTargets = effectiveWorkerList.map((sig) => {
      let status: 'completed' | 'incomplete' | 'progress' = 'incomplete';
      let label = '미완료';

      if (sig.status === 'SIGNED') {
        status = 'completed';
        label = '서명완료';
      } else if (sig.status === 'WATCHED') {
        status = 'progress' as any;
        label = '시청완료';
      } else if (sig.status === 'WATCHING') {
        status = 'progress' as any;
        label = '시청중';
      }

      return {
        id: `worker-${sig.workerSignatureIdx}`,
        targetMemberIdx: sig.targetMemberIdx,
        name: sig.memberName,
        position: sig.position || '',
        department: sig.department || '',
        memberRole: getMemberRoleLabel(sig.memberRole, sig.isSuperAdmin), // 실제 멤버 역할
        approvalType: '근로자', // 근로자 유형
        type: 'worker' as const,
        status,
        statusLabel: label,
        completedAt: sig.signedAt ? sig.signedAt.split('T')[0] : undefined,
        avatar: undefined,
      };
    });

    return [...approvalTargets, ...workerTargets];
  }, [documentDetail, signatureList, workerSignatureList]);

  const paginatedTargets = useMemo(() => {
    const startIndex = (page - 1) * ROWS_PER_PAGE;
    const endIndex = startIndex + ROWS_PER_PAGE;
    return signatureTargets.slice(startIndex, endIndex);
  }, [signatureTargets, page]);

  const totalPages = Math.ceil(signatureTargets.length / ROWS_PER_PAGE);

  const selectedTargets = useMemo(
    () => signatureTargets.filter((target) => selectedIds.includes(target.id)),
    [signatureTargets, selectedIds]
  );

  const isAllSelected =
    paginatedTargets.length > 0 &&
    paginatedTargets.every((target) => selectedIds.includes(target.id));
  const isIndeterminate =
    paginatedTargets.some((target) => selectedIds.includes(target.id)) && !isAllSelected;

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const newSelectedIds = [
        ...selectedIds,
        ...paginatedTargets
          .filter((target) => !selectedIds.includes(target.id))
          .map((target) => target.id),
      ];
      setSelectedIds(newSelectedIds);
    } else {
      const paginatedIds = paginatedTargets.map((target) => target.id);
      setSelectedIds(selectedIds.filter((id) => !paginatedIds.includes(id)));
    }
  };

  const handleSelectTarget = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((selectedId) => selectedId !== id) : [...prev, id]
    );
  };

  const handleRemoveSelected = (id: string) => {
    setSelectedIds((prev) => prev.filter((selectedId) => selectedId !== id));
  };

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const handleSendNotification = async () => {
    if (!documentId || selectedIds.length === 0) return;

    try {
      // 선택된 대상자의 memberIdx 추출
      const targetMemberIndexList = selectedIds
        .map((id) => {
          const target = signatureTargets.find((t) => t.id === id);
          return target?.targetMemberIdx;
        })
        .filter((idx): idx is number => idx !== undefined);

      // 알림 발송
      await sendNotification(Number(documentId), {
        notificationType: 'signature_request',
        targetMemberIndexList,
      });

      // 성공 시 모달 닫기
      handleClose();
    } catch (error) {
      console.error('알림 발송 실패:', error);
      // TODO: 에러 토스트 표시
    }
  };

  const handleClose = () => {
    setSelectedIds([]);
    setPage(1);
    onClose();
  };

  const getStatusBadge = (target: any) => {
    if (target.type === 'approval') {
      return target.status === 'completed' ? (
        <Box>
          <Badge label="완료" variant="completed" />
          {target.completedAt && (
            <Typography
              variant="caption"
              sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}
            >
              {target.completedAt}
            </Typography>
          )}
        </Box>
      ) : (
        <Badge label="미완료" variant="incomplete" />
      );
    }

    // 근로자 전용 뱃지 로직
    if (target.status === 'completed') {
      return (
        <Box>
          <Badge label={target.statusLabel} variant="completed" />
          {target.completedAt && (
            <Typography
              variant="caption"
              sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}
            >
              {target.completedAt}
            </Typography>
          )}
        </Box>
      );
    }
    return (
      <Badge
        label={target.statusLabel || '미완료'}
        variant={target.status === ('progress' as any) ? 'info' : 'incomplete'}
      />
    );
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{
          fontSize: 20,
          fontWeight: 700,
          lineHeight: '30px',
          color: 'text.primary',
          pb: 3,
        }}
      >
        서명 대상 및 현황
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* 문서 정보 */}
          <Box
            sx={{ display: 'flex', flexDirection: 'column', gap: 1, borderRadius: 0 }}
            bgcolor="background.neutral"
            p={3}
            borderRadius={2}
          >
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Typography variant="subtitle2" sx={{ color: 'text.primary', minWidth: 80 }}>
                문서명
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.primary' }}>
                {documentName || '1-5 위험장소 및 작업형태별 위험요인'}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: '100px', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Typography variant="subtitle2" sx={{ color: 'text.primary', minWidth: 80 }}>
                  문서 작성일
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.primary' }}>
                  {writtenAt || '2025-10-23'}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Typography variant="subtitle2" sx={{ color: 'text.primary', minWidth: 80 }}>
                  결재 마감일
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.primary' }}>
                  {approvalDeadline || '2025-10-23'}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* 테이블 */}
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{
                      width: 48,
                      bgcolor: 'grey.100',
                      p: 1,
                    }}
                  >
                    <Checkbox
                      checked={isAllSelected}
                      indeterminate={isIndeterminate}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell
                    sx={{
                      bgcolor: 'grey.100',
                      fontSize: 14,
                      fontWeight: 600,
                      color: 'text.secondary',
                      p: 2,
                    }}
                  >
                    이름/직급
                  </TableCell>
                  <TableCell
                    sx={{
                      bgcolor: 'grey.100',
                      fontSize: 14,
                      fontWeight: 600,
                      color: 'text.secondary',
                      p: 2,
                    }}
                  >
                    소속팀
                  </TableCell>
                  <TableCell
                    sx={{
                      bgcolor: 'grey.100',
                      fontSize: 14,
                      fontWeight: 600,
                      color: 'text.secondary',
                      p: 2,
                    }}
                  >
                    역할
                  </TableCell>
                  <TableCell
                    sx={{
                      bgcolor: 'grey.100',
                      fontSize: 14,
                      fontWeight: 600,
                      color: 'text.secondary',
                      p: 2,
                    }}
                  >
                    유형
                  </TableCell>
                  <TableCell
                    sx={{
                      bgcolor: 'grey.100',
                      fontSize: 14,
                      fontWeight: 600,
                      color: 'text.secondary',
                      p: 2,
                      textAlign: 'center',
                    }}
                  >
                    상태
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedTargets.map((target) => (
                  <TableRow
                    key={target.id}
                    sx={{
                      '&:hover': {
                        bgcolor: 'action.hover',
                      },
                    }}
                  >
                    <TableCell sx={{ p: 1 }}>
                      <Checkbox
                        checked={selectedIds.includes(target.id)}
                        onChange={() => handleSelectTarget(target.id)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ width: 40, height: 40 }}>{target.name?.[0] || '?'}</Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ color: 'text.primary' }}>
                            {target.name || `사용자 ${target.targetMemberIdx}`}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            {target.position || ''}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ p: 2 }}>
                      <Typography variant="body2" sx={{ color: 'text.primary' }}>
                        {target.department}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ p: 2 }}>
                      <Typography variant="body2" sx={{ color: 'text.primary' }}>
                        {target.memberRole}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ p: 2 }}>
                      <Typography variant="body2" sx={{ color: 'text.primary' }}>
                        {target.approvalType}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ p: 2, textAlign: 'center' }}>
                      {getStatusBadge(target)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <Pagination count={totalPages} page={page} onChange={handlePageChange} />
            </Box>
          )}

          {/* 선택된 참가자 */}
          {selectedTargets.length > 0 && (
            <Stack
              direction="row"
              spacing={1}
              sx={{
                flexWrap: 'wrap',
                px: 3,
                pb: 3,
                gap: 1,
                width: '100%',
              }}
            >
              {selectedTargets.map((target) => (
                <Chip
                  key={target.id}
                  label={target.name}
                  size="small"
                  onDelete={() => handleRemoveSelected(target.id)}
                  sx={{
                    height: 24,
                    bgcolor: 'info.lighter',
                    color: 'info.darker',
                    fontSize: 13,
                    fontWeight: 500,
                    lineHeight: '18px',
                    '& .MuiChip-label': {
                      px: 1.25,
                      py: 0,
                    },
                    '& .MuiChip-deleteIcon': {
                      color: 'info.darker',
                      fontSize: 16,
                    },
                  }}
                />
              ))}
            </Stack>
          )}
        </Box>
      </DialogContent>

      <Divider />
      <DialogActions sx={{ justifyContent: 'flex-end', px: 3, py: 2 }}>
        <DialogBtn variant="outlined" onClick={handleClose}>
          닫기
        </DialogBtn>
        <DialogBtn
          variant="contained"
          onClick={handleSendNotification}
          disabled={selectedIds.length === 0}
        >
          알림 발송
        </DialogBtn>
      </DialogActions>
    </Dialog>
  );
}
