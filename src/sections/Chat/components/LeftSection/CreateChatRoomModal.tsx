import { useState, useMemo } from 'react';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
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
import CircularProgress from '@mui/material/CircularProgress';
import TextField from '@mui/material/TextField';

import DialogBtn from 'src/components/safeyoui/button/dialogBtn';
import { Iconify } from 'src/components/iconify';
import { useMyInfo } from 'src/sections/Chat/hooks/use-my-info';
import { useAuthContext } from 'src/auth/hooks/use-auth-context';
import { useQuery } from '@tanstack/react-query';
import { getCompanyMembers } from 'src/services/organization/organization.service';

// ----------------------------------------------------------------------

// 역할 한글 맵핑 함수
const getRoleLabel = (role: string): string => {
  if (!role) return '';

  const roleUpper = role.toUpperCase();
  const roleMap: { [key: string]: string } = {
    OPERATOR_MANAGER: '조직 관리자',
    MANAGEMENT_SUPERVISOR: '관리 감독자',
    SAFETY_MANAGER: '안전보건 담당자',
    WORKER: '근로자',
    ADMIN: '조직 관리자',
    MEMBER: '근로자',
    // 소문자 키 (하위 호환성)
    operator_manager: '조직 관리자',
    management_supervisor: '관리 감독자',
    safety_manager: '안전보건 담당자',
    worker: '근로자',
    admin: '조직 관리자',
    member: '근로자',
  };

  return roleMap[roleUpper] || roleMap[role] || role;
};

export type InvitableUser = {
  id: string;
  name: string;
  role?: string;
  roleLabel?: string; // 한글 역할명
  department?: string;
  position?: string;
  avatar?: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: (roomName: string, userIds: string[]) => void;
};

export default function CreateChatRoomModal({ open, onClose, onConfirm }: Props) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [roomName, setRoomName] = useState('');
  const [page, setPage] = useState(1);
  const rowsPerPage = 5;

  // 내 정보 조회 (companyIdx 추출용)
  const { data: myInfoData } = useMyInfo();
  const { user } = useAuthContext();

  // companyIdx 추출 (여러 후보 필드에서 시도)
  const companyIdx = useMemo(() => {
    if (!myInfoData && !user) return 0;

    const candidates = [
      (myInfoData as any)?.companyIdx,
      (myInfoData as any)?.companyIndex,
      (myInfoData as any)?.company?.companyIdx,
      (myInfoData as any)?.company?.companyIndex,
      user?.companyIdx,
      (user as any)?.companyIndex,
    ];

    for (const candidate of candidates) {
      const parsed = Number(candidate);
      if (!Number.isNaN(parsed) && parsed > 0) {
        return parsed;
      }
    }
    return 0;
  }, [myInfoData, user]);

  // 회사 멤버 조회 (모달이 열렸을 때만 조회)
  const { data: membersData, isLoading: isMembersLoading } = useQuery({
    queryKey: ['companyMembers', companyIdx],
    queryFn: () => getCompanyMembers(companyIdx),
    enabled: open && !!companyIdx, // 모달이 열려있고 companyIdx가 있을 때만 조회
    staleTime: 5 * 60 * 1000,
  });

  // 현재 사용자 memberIdx 추출 (여러 후보 필드에서 시도)
  const currentMemberIdx = useMemo(() => {
    if (!myInfoData && !user) return null;

    const candidates = [
      (myInfoData as any)?.memberIdx,
      (myInfoData as any)?.memberIndex,
      (myInfoData as any)?.member?.memberIdx,
      (myInfoData as any)?.member?.memberIndex,
      user?.memberIdx,
      (user as any)?.memberIndex,
      (user as any)?.id,
    ];

    for (const candidate of candidates) {
      const parsed = Number(candidate);
      if (!Number.isNaN(parsed) && parsed > 0) {
        return parsed;
      }
    }
    return null;
  }, [myInfoData, user]);

  // API 데이터에서 멤버 목록 추출 및 매핑
  const invitableUsers: InvitableUser[] = useMemo(() => {
    if (!membersData) return [];

    // axios 인터셉터가 평탄화하므로 body를 거치지 않고 직접 접근
    // 응답 구조: { header: {...}, memberList: [...], totalCount: 4 }
    const rawMembers =
      (membersData as any).memberList ||
      (membersData as any).members ||
      (membersData as any).body?.memberList ||
      (membersData as any).body?.members ||
      [];

    // 현재 사용자 ID 후보 목록 (문자열로 변환)
    const currentUserIds = new Set<string>();
    if (currentMemberIdx) {
      currentUserIds.add(currentMemberIdx.toString());
    }
    if (user?.id) {
      currentUserIds.add(user.id.toString());
    }
    if ((user as any)?.memberIndex) {
      currentUserIds.add((user as any).memberIndex.toString());
    }
    if ((user as any)?.memberIdx) {
      currentUserIds.add((user as any).memberIdx.toString());
    }

    return rawMembers
      .map((member: any): InvitableUser => {
        const rawRole = member.memberRole || member.role || '';
        return {
          id: member.memberIdx?.toString() || member.memberIndex?.toString() || member.id,
          name: member.memberName || member.name,
          role: rawRole,
          roleLabel: getRoleLabel(rawRole), // 한글 역할명
          department: member.deptName || member.department || '',
          position: member.positionName || member.position || '',
          avatar: member.memberThumbnail || member.profileImage || '',
        };
      })
      .filter(
        // 본인 제외: ID가 현재 사용자 ID 후보 목록에 없어야 함
        (u: InvitableUser) => !currentUserIds.has(u.id)
      );
  }, [membersData, currentMemberIdx, user]);

  // 페이지네이션된 사용자 목록
  const paginatedUsers = useMemo(() => {
    const startIndex = (page - 1) * rowsPerPage;
    return invitableUsers.slice(startIndex, startIndex + rowsPerPage);
  }, [invitableUsers, page, rowsPerPage]);

  const totalPages = Math.ceil(invitableUsers.length / rowsPerPage);

  // 선택된 사용자 목록
  const selectedUsers = useMemo(
    () =>
      invitableUsers.filter((invitableUser: InvitableUser) =>
        selectedIds.includes(invitableUser.id)
      ),
    [selectedIds, invitableUsers]
  );

  // 전체 선택/해제 (현재 페이지의 모든 항목이 선택되었는지 확인)
  const paginatedUserIds = paginatedUsers.map((invitableUser: InvitableUser) => invitableUser.id);
  const isAllSelected =
    paginatedUsers.length > 0 && paginatedUserIds.every((id: string) => selectedIds.includes(id));
  const isIndeterminate =
    paginatedUserIds.some((id: string) => selectedIds.includes(id)) && !isAllSelected;

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
    onConfirm(roomName.trim(), selectedIds);
    handleClose();
  };

  const handleClose = () => {
    setSelectedIds([]);
    setRoomName('');
    setPage(1);
    onClose();
  };

  // 2명 이상 선택했는지 확인
  const shouldShowRoomNameInput = selectedIds.length >= 2;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontSize: 18, fontWeight: 600, lineHeight: '28px', pb: 3 }}>
        새로운 채팅
      </DialogTitle>

      {/* 채팅방 이름 입력 필드 (2명 이상 선택 시 표시) */}
      {shouldShowRoomNameInput && (
        <Box sx={{ px: 3, pb: 2 }}>
          <TextField
            fullWidth
            label="채팅방 이름"
            placeholder="채팅방 이름을 입력하세요"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            slotProps={{
              inputLabel: { shrink: true },
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                height: 56,
              },
            }}
          />
        </Box>
      )}

      <DialogContent sx={{ px: 0, py: 0 }}>
        {/* 테이블 */}
        {isMembersLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: '#F4F6F8' }}>
                  <TableCell
                    sx={{
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
                      fontSize: 14,
                      fontWeight: 600,
                      lineHeight: '24px',
                      color: 'text.secondary',
                      px: 2,
                      py: 1.75,
                    }}
                    align="center"
                  >
                    소속팀
                  </TableCell>
                  <TableCell
                    sx={{
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
                  paginatedUsers.map((invitableUser: InvitableUser) => {
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
                            <Avatar
                              src={
                                invitableUser.avatar && invitableUser.avatar.trim() !== ''
                                  ? invitableUser.avatar
                                  : undefined
                              }
                              alt={invitableUser.name}
                              sx={{ width: 40, height: 40, bgcolor: 'grey.300' }}
                            >
                              {(!invitableUser.avatar || invitableUser.avatar.trim() === '') &&
                                (invitableUser.name?.[0] ? (
                                  invitableUser.name[0]
                                ) : (
                                  <Iconify icon="solar:user-rounded-bold" width={24} />
                                ))}
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
                              {invitableUser.roleLabel && (
                                <Typography
                                  variant="body2"
                                  sx={{
                                    fontSize: 14,
                                    fontWeight: 400,
                                    lineHeight: '22px',
                                    color: 'text.disabled',
                                  }}
                                >
                                  {invitableUser.roleLabel}
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
                            align="center"
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
                            {invitableUser.roleLabel || invitableUser.role || '-'}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* 페이지네이션 */}
        {!isMembersLoading && totalPages > 1 && (
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
            {selectedUsers.map((selectedUser: InvitableUser) => (
              <Chip
                key={selectedUser.id}
                label={selectedUser.name}
                onDelete={() => handleSelectUser(selectedUser.id)}
                deleteIcon={<Iconify icon="solar:close-circle-bold" width={16} />}
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
            sx={{
              minHeight: 36,
              fontSize: 14,
              bgcolor: 'grey.900',
              color: 'common.white',
              '&:hover': {
                bgcolor: 'grey.800',
              },
            }}
          >
            만들기
          </DialogBtn>
        </Stack>
      </DialogActions>
    </Dialog>
  );
}
