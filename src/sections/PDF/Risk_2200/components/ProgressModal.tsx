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

import DialogBtn from 'src/components/safeyoui/button/dialogBtn';
import Badge from 'src/components/safeyoui/badge';

// ----------------------------------------------------------------------

export type SignatureTarget = {
  id: string;
  name: string;
  position: string;
  department: string;
  role: string;
  type: 'approval' | 'signature'; // 결재, 서명
  status: 'completed' | 'incomplete'; // 완료, 미완료
  completedAt?: string; // 완료일 (완료인 경우)
  avatar?: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  documentName?: string;
  writtenAt?: string;
  approvalDeadline?: string;
  documentId?: string;
};

// TODO: TanStack Query Hook(useQuery)으로 서명 대상 목록 조회
// 임시 목업 데이터
const mockSignatureTargets: SignatureTarget[] = [
  {
    id: '1',
    name: '김안전',
    position: '과장',
    department: '생산 1팀',
    role: '최고 관리자',
    type: 'approval',
    status: 'completed',
    completedAt: '2025-10-27',
  },
  {
    id: '2',
    name: '이영희',
    position: '팀장',
    department: '생산 1팀',
    role: '조직 관리자',
    type: 'signature',
    status: 'completed',
    completedAt: '2025-10-27',
  },
  {
    id: '3',
    name: '박지민',
    position: '사원',
    department: '생산 1팀',
    role: '관리 감독자',
    type: 'signature',
    status: 'completed',
    completedAt: '2025-10-27',
  },
  {
    id: '4',
    name: '최은주',
    position: '부장',
    department: '생산 1팀',
    role: '안전보건 담당자',
    type: 'approval',
    status: 'completed',
    completedAt: '2025-10-27',
  },
  {
    id: '5',
    name: '정민수',
    position: '인턴',
    department: '생산 1팀',
    role: '근로자',
    type: 'signature',
    status: 'completed',
    completedAt: '2025-10-27',
  },
  {
    id: '6',
    name: '정민수',
    position: '인턴',
    department: '생산 1팀',
    role: '근로자',
    type: 'signature',
    status: 'incomplete',
  },
  {
    id: '7',
    name: '정민수',
    position: '인턴',
    department: '생산 1팀',
    role: '근로자',
    type: 'signature',
    status: 'incomplete',
  },
  {
    id: '8',
    name: '정민수',
    position: '인턴',
    department: '생산 1팀',
    role: '근로자',
    type: 'signature',
    status: 'incomplete',
  },
  {
    id: '9',
    name: '정민수',
    position: '인턴',
    department: '생산 1팀',
    role: '근로자',
    type: 'signature',
    status: 'completed',
    completedAt: '2025-10-27',
  },
  {
    id: '10',
    name: '정민수',
    position: '인턴',
    department: '생산 1팀',
    role: '근로자',
    type: 'signature',
    status: 'completed',
    completedAt: '2025-10-27',
  },
];

const ROWS_PER_PAGE = 10;

export default function ProgressModal({
  open,
  onClose,
  documentName,
  writtenAt,
  approvalDeadline,
  documentId,
}: Props) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [page, setPage] = useState(1);

  // TODO: TanStack Query Hook(useQuery)으로 서명 대상 목록 조회
  // const { data: signatureTargets } = useQuery({
  //   queryKey: ['signatureTargets', documentId],
  //   queryFn: () => getSignatureTargets(documentId!),
  //   enabled: open && !!documentId,
  // });
  const signatureTargets = useMemo(() => mockSignatureTargets, []);

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

  const handleSendNotification = () => {
    // TODO: TanStack Query Hook(useMutation)으로 알림 발송
    // 알림 발송 로직:
    //
    // 1. 결재 요청 -> 순차 요청&자동알림
    //    - 관리자 A 결재 완료 -> 관리자 B 알림
    //    - 관리자 B 결재 완료 -> 관리자 C 알림
    //    - 관리자 C 결재 완료 -> 문서 최종 완료 + 알림
    //
    // 2. 서명 요청 -> 동시 요청&자동알림
    //    - 전원 서명 완료 -> 작성자에게 알림
    //
    // 3. 결재 마감일 자동 알림
    //    - 결재 마감일 15일 전 자동 알림
    //    - 결재 마감일 일주일 전 자동 알림
    //    - 결재 마감일 하루 전 자동 알림
    //
    // const mutation = useMutation({
    //   mutationFn: (data: { documentId: string; targetIds: string[] }) => sendNotification(data),
    //   onSuccess: () => {
    //     queryClient.invalidateQueries({ queryKey: ['signatureTargets', documentId] });
    //     onClose();
    //   },
    // });
    // mutation.mutate({ documentId: documentId!, targetIds: selectedIds });
    console.log('알림 발송', { documentId, targetIds: selectedIds });
    onClose();
  };

  const handleClose = () => {
    setSelectedIds([]);
    setPage(1);
    onClose();
  };

  const getRoleLabel = (role: string) => role;

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
                        <Avatar sx={{ width: 40, height: 40 }}>{target.name[0]}</Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ color: 'text.primary' }}>
                            {target.name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            {target.position}
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
