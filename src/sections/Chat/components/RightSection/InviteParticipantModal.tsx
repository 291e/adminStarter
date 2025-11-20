import { useState, useMemo } from 'react';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Pagination from '@mui/material/Pagination';
import Chip from '@mui/material/Chip';

import { Iconify } from 'src/components/iconify';
import DialogBtn from 'src/components/safeyoui/button/dialogBtn';
import { useAuthContext } from 'src/auth/hooks/use-auth-context';
import type { ChatRoom } from 'src/_mock/_chat';

// ----------------------------------------------------------------------

type InvitableUser = {
  id: string;
  name: string;
  role?: string;
  department?: string;
  position?: string;
  avatar?: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: (userIds: string[]) => void;
  room?: ChatRoom | null;
};

// TODO: TanStack Query Hook(useQuery)으로 초대 가능한 사용자 목록 조회
// 임시 목업 데이터
const mockInvitableUsers: InvitableUser[] = [
  { id: '1', name: '김안전', role: '과장', department: '생산 1팀', position: '최고 관리자' },
  { id: '2', name: '이영희', role: '팀장', department: '생산 1팀', position: '조직 관리자' },
  { id: '3', name: '박지민', role: '사원', department: '생산 1팀', position: '관리 감독자' },
  { id: '4', name: '최민수', role: '대리', department: '생산 2팀', position: '안전보건 담당자' },
  { id: '5', name: '정수진', role: '과장', department: '생산 2팀', position: '관리 감독자' },
  { id: '6', name: '강호영', role: '사원', department: '생산 3팀', position: '안전보건 담당자' },
  { id: '7', name: '윤지훈', role: '대리', department: '생산 3팀', position: '관리 감독자' },
  { id: '8', name: '임동혁', role: '팀장', department: '생산 4팀', position: '조직 관리자' },
];

export default function InviteParticipantModal({ open, onClose, onConfirm, room }: Props) {
  const { user } = useAuthContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const rowsPerPage = 5;

  // 현재 사용자 이름 (displayName 또는 name 사용)
  const currentUserName = user?.displayName || user?.name || '';

  // TODO: TanStack Query Hook(useQuery)으로 초대 가능한 사용자 목록 조회
  // const { data: invitableUsers } = useQuery({
  //   queryKey: ['invitableUsers', room?.id],
  //   queryFn: () => getInvitableUsers(room?.id),
  //   enabled: !!room && open,
  // });

  // 필터링된 사용자 목록 (본인 제외, 검색어 필터링)
  const filteredUsers = useMemo(
    () =>
      mockInvitableUsers.filter(
        (invitableUser) =>
          invitableUser.name !== currentUserName &&
          invitableUser.id !== user?.id &&
          (invitableUser.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            invitableUser.role?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            invitableUser.department?.toLowerCase().includes(searchQuery.toLowerCase()))
      ),
    [searchQuery, currentUserName, user?.id]
  );

  // 페이지네이션된 사용자 목록
  const paginatedUsers = useMemo(() => {
    const startIndex = (page - 1) * rowsPerPage;
    return filteredUsers.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredUsers, page, rowsPerPage]);

  const totalPages = Math.ceil(filteredUsers.length / rowsPerPage);

  // 선택된 사용자 목록
  const selectedUsers = useMemo(
    () => mockInvitableUsers.filter((invitableUser) => selectedIds.includes(invitableUser.id)),
    [selectedIds]
  );

  // 전체 선택/해제 (현재 페이지의 모든 항목이 선택되었는지 확인)
  const paginatedUserIds = paginatedUsers.map((invitableUser) => invitableUser.id);
  const isAllSelected =
    paginatedUsers.length > 0 && paginatedUserIds.every((id) => selectedIds.includes(id));
  const isIndeterminate = paginatedUserIds.some((id) => selectedIds.includes(id)) && !isAllSelected;

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelectedIds = paginatedUserIds;
      setSelectedIds((prev) => [...new Set([...prev, ...newSelectedIds])]);
    } else {
      setSelectedIds((prev) => prev.filter((id) => !paginatedUserIds.includes(id)));
    }
  };

  const handleSelectUser = (userId: string) => {
    setSelectedIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const handleConfirm = () => {
    // TODO: TanStack Query Hook(useMutation)으로 채팅방에 참가자 초대 API 호출
    // const mutation = useMutation({
    //   mutationFn: (data: { roomId: string; userIds: string[] }) => {
    //     return inviteParticipantsToChat(data.roomId, data.userIds);
    //   },
    //   onSuccess: () => {
    //     queryClient.invalidateQueries({ queryKey: ['chatRoom', room?.id, 'participants'] });
    //     // 성공 토스트 메시지 표시
    //     handleClose();
    //   },
    //   onError: (error) => {
    //     console.error('참가자 초대 실패:', error);
    //     // 에러 토스트 메시지 표시
    //   },
    // });
    // mutation.mutate({ roomId: room?.id || '', userIds: selectedIds });

    onConfirm(selectedIds);
    handleClose();
  };

  const handleClose = () => {
    setSearchQuery('');
    setSelectedIds([]);
    setPage(1);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontSize: 18, fontWeight: 600, lineHeight: '28px', pb: 3 }}>
        초대하기
      </DialogTitle>

      <DialogContent sx={{ px: 0, py: 0 }}>
        {/* 검색 입력 필드 */}
        <TextField
          fullWidth
          size="medium"
          placeholder="이름을 입력하세요."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setPage(1); // 검색 시 첫 페이지로 리셋
          }}
          InputProps={{
            endAdornment: (
              <Iconify
                icon={'solar:magnifer-bold' as any}
                width={20}
                sx={{ ml: 1, color: 'text.disabled' }}
              />
            ),
          }}
          sx={{ mb: 2.75, px: 3 }}
        />

        {/* 테이블 */}
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{
                    bgcolor: 'grey.50',
                    minWidth: 72,
                    width: 72,
                    px: 1,
                    py: 1.75,
                  }}
                >
                  <Checkbox
                    checked={isAllSelected}
                    indeterminate={isIndeterminate}
                    onChange={handleSelectAll}
                    size="small"
                    sx={{ p: 1 }}
                  />
                </TableCell>
                <TableCell
                  sx={{
                    bgcolor: 'grey.50',
                    fontSize: 14,
                    fontWeight: 600,
                    lineHeight: '24px',
                    color: 'text.secondary',
                    px: 2,
                    py: 1.75,
                  }}
                >
                  이름 / 직급
                </TableCell>
                <TableCell
                  sx={{
                    bgcolor: 'grey.50',
                    fontSize: 14,
                    fontWeight: 600,
                    lineHeight: '24px',
                    color: 'text.secondary',
                    px: 2,
                    py: 1.75,
                  }}
                >
                  소속
                </TableCell>
                <TableCell
                  sx={{
                    bgcolor: 'grey.50',
                    fontSize: 14,
                    fontWeight: 600,
                    lineHeight: '24px',
                    color: 'text.secondary',
                    px: 2,
                    py: 1.75,
                  }}
                >
                  역할
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      검색 결과가 없습니다.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedUsers.map((invitableUser) => {
                  const isSelected = selectedIds.includes(invitableUser.id);
                  return (
                    <TableRow
                      key={invitableUser.id}
                      hover
                      sx={{
                        borderBottom: '1px dashed',
                        borderColor: 'divider',
                        '&:last-child': { borderBottom: 'none' },
                      }}
                    >
                      <TableCell sx={{ px: 1, py: 1.75 }}>
                        <Checkbox
                          checked={isSelected}
                          onChange={() => handleSelectUser(invitableUser.id)}
                          size="small"
                          sx={{ p: 1 }}
                        />
                      </TableCell>
                      <TableCell sx={{ px: 2, py: 1.75 }}>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Avatar sx={{ width: 40, height: 40, bgcolor: 'grey.300' }}>
                            {invitableUser.name[0]}
                          </Avatar>
                          <Stack spacing={0.5}>
                            <Typography
                              variant="body2"
                              sx={{
                                fontSize: 14,
                                fontWeight: 400,
                                lineHeight: '22px',
                                color: 'text.primary',
                              }}
                            >
                              {invitableUser.name}
                            </Typography>
                            {invitableUser.role && (
                              <Typography
                                variant="body2"
                                sx={{
                                  fontSize: 14,
                                  fontWeight: 400,
                                  lineHeight: '22px',
                                  color: 'text.disabled',
                                }}
                              >
                                {invitableUser.role}
                              </Typography>
                            )}
                          </Stack>
                        </Stack>
                      </TableCell>
                      <TableCell sx={{ px: 2, py: 1.75 }}>
                        <Typography
                          variant="body2"
                          sx={{
                            fontSize: 14,
                            fontWeight: 400,
                            lineHeight: '22px',
                            color: 'text.primary',
                          }}
                        >
                          {invitableUser.department || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ px: 2, py: 1.75 }}>
                        <Typography
                          variant="body2"
                          sx={{
                            fontSize: 14,
                            fontWeight: 400,
                            lineHeight: '22px',
                            color: 'text.primary',
                          }}
                        >
                          {invitableUser.position || '-'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={handlePageChange}
              color="standard"
              size="small"
            />
          </Box>
        )}

        {/* 선택된 사용자 Chip 목록 */}
        {selectedUsers.length > 0 && (
          <Stack
            direction="row"
            spacing={1}
            sx={{
              flexWrap: 'wrap',
              gap: 1,
              width: '100%',
              py: 2,
              px: 3,
            }}
          >
            {selectedUsers.map((selectedUser) => (
              <Chip
                key={selectedUser.id}
                label={selectedUser.name}
                size="small"
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
                }}
              />
            ))}
          </Stack>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 2, pb: 3, pt: 0, justifyContent: 'flex-end' }}>
        <Stack direction="row" spacing={1.5}>
          <DialogBtn variant="outlined" onClick={handleClose} sx={{ minHeight: 36, fontSize: 14 }}>
            취소
          </DialogBtn>
          <DialogBtn
            variant="contained"
            onClick={handleConfirm}
            disabled={selectedIds.length === 0}
            sx={{ minHeight: 36, fontSize: 14 }}
          >
            초대하기
          </DialogBtn>
        </Stack>
      </DialogActions>
    </Dialog>
  );
}
