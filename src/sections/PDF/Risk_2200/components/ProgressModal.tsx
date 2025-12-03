import { useState, useMemo } from 'react';

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

import { sendNotification } from 'src/services/safety-system/safety-system.service';
import type { DocumentSignatureInfo } from 'src/services/safety-system/safety-system.types';

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
}: Props) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [page, setPage] = useState(1);

  // approvalStep에 따라 역할 결정
  const getRoleByStep = (step: number) => {
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

  // signatureList를 UI 타입으로 변환
  const signatureTargets = useMemo(
    () =>
      signatureList.map((sig) => {
        const status: 'completed' | 'incomplete' =
          sig.approvalStatus === 'APPROVED' ? 'completed' : 'incomplete';
        return {
          id: `${sig.documentApprovalIdx}`,
          targetMemberIdx: sig.targetMemberIdx,
          name: sig.memberName,
          position: '', // API에서 제공되지 않음
          department: '', // API에서 제공되지 않음
          role: getRoleByStep(sig.approvalStep),
          type: 'approval' as const, // signatureList는 모두 결재 관련
          status,
          completedAt: sig.approvedAt ? sig.approvedAt.split('T')[0] : undefined,
          avatar: undefined,
          approvalStep: sig.approvalStep,
          approvalOrder: sig.approvalOrder,
        };
      }),
    [signatureList]
  );

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

  const getRoleLabel = (role?: string) => role || '';

  const getTypeLabel = (type: 'approval' | 'signature') => (type === 'approval' ? '결재' : '서명');

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
              <Typography variant="body2" sx={{ color: 'text.secondary', minWidth: 80 }}>
                문서명
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.primary' }}>
                {documentName || '1-5 위험장소 및 작업형태별 위험요인'}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary', minWidth: 80 }}>
                문서 작성일
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.primary' }}>
                {writtenAt || '2025-10-23'}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary', minWidth: 80 }}>
                결재 마감일
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.primary' }}>
                {approvalDeadline || '2025-10-23'}
              </Typography>
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
                    소속
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
                        {getRoleLabel(target.role)}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ p: 2 }}>
                      <Typography variant="body2" sx={{ color: 'text.primary' }}>
                        {getTypeLabel(target.type)}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ p: 2, textAlign: 'center' }}>
                      {target.status === 'completed' ? (
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
                      )}
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
                justifyContent: 'center',
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
