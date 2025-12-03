import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

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
import Radio from '@mui/material/Radio';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Pagination from '@mui/material/Pagination';
import CircularProgress from '@mui/material/CircularProgress';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';

import DialogBtn from 'src/components/safeyoui/button/dialogBtn';
import { Iconify } from 'src/components/iconify';
import { useAuthContext } from 'src/auth/hooks/use-auth-context';
import { useMyInfo } from 'src/sections/Chat/hooks/use-my-info';
import { getCompanyMembers } from 'src/services/organization/organization.service';
import type { ApprovalType } from './ApprovalSection';

// ----------------------------------------------------------------------

type InvitableUser = {
  id: string;
  name: string;
  role: string;
  roleLabel: string;
  department: string;
  position: string;
  avatar: string;
};

const getRoleLabel = (role: string): string => {
  const roleMap: Record<string, string> = {
    ADMIN: '관리자',
    MANAGER: '관리자',
    MEMBER: '멤버',
    WORKER: '근로자',
    SAFETY_MANAGER: '안전관리자',
    SAFETY_WORKER: '안전근로자',
  };
  return roleMap[role] || role;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: (memberIdx: number, memberName: string) => void;
  approvalType: ApprovalType;
};

export default function SelectApprovalMemberModal({
  open,
  onClose,
  onConfirm,
  approvalType,
}: Props) {
  const { user } = useAuthContext();
  const [selectedId, setSelectedId] = useState<string>('');
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const rowsPerPage = 5;

  // 내 정보 조회 (companyIdx 추출용)
  const { data: myInfoData } = useMyInfo();

  // companyIdx 추출
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

  // 회사 멤버 조회
  const { data: membersData, isLoading: isMembersLoading } = useQuery({
    queryKey: ['companyMembers', companyIdx],
    queryFn: () => getCompanyMembers(companyIdx),
    enabled: open && !!companyIdx,
    staleTime: 5 * 60 * 1000,
  });

  // API 데이터에서 멤버 목록 추출 및 매핑
  const invitableUsers: InvitableUser[] = useMemo(() => {
    if (!membersData) return [];

    const rawMembers =
      (membersData as any).memberList ||
      (membersData as any).members ||
      (membersData as any).body?.memberList ||
      (membersData as any).body?.members ||
      [];

    return rawMembers.map((member: any): InvitableUser => {
      const rawRole = member.memberRole || member.role || '';
      return {
        id: member.memberIdx?.toString() || member.memberIndex?.toString() || member.id,
        name: member.memberName || member.name,
        role: rawRole,
        roleLabel: getRoleLabel(rawRole),
        department: member.deptName || member.department || '',
        position: member.positionName || member.position || '',
        avatar: member.memberThumbnail || member.profileImage || '',
      };
    });
  }, [membersData]);

  // 검색 필터링
  const filteredUsers = useMemo(
    () =>
      invitableUsers.filter(
        (member) =>
          member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          member.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
          member.roleLabel.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [invitableUsers, searchQuery]
  );

  // 페이지네이션
  const paginatedUsers = useMemo(() => {
    const startIndex = (page - 1) * rowsPerPage;
    return filteredUsers.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredUsers, page, rowsPerPage]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / rowsPerPage));

  const handleSelect = (id: string) => {
    setSelectedId(id);
  };

  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const handleClose = () => {
    setSelectedId('');
    setSearchQuery('');
    setPage(1);
    onClose();
  };

  const handleConfirm = () => {
    if (!selectedId) return;

    const selectedUser = invitableUsers.find((u) => u.id === selectedId);
    if (selectedUser) {
      onConfirm(Number(selectedUser.id), selectedUser.name);
      handleClose();
    }
  };

  const TYPE_LABEL: Record<ApprovalType, string> = {
    writer: '작성',
    reviewer: '검토',
    approver: '승인',
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography component="div" variant="h6" sx={{ fontWeight: 600, fontSize: 18 }}>
          {TYPE_LABEL[approvalType]} 대상자 선택
        </Typography>
        <Box
          component="button"
          onClick={handleClose}
          sx={{
            position: 'absolute',
            right: 16,
            top: 16,
            border: 0,
            background: 'none',
            cursor: 'pointer',
            color: (theme) => theme.palette.grey[500],
            p: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Iconify icon="solar:close-circle-bold" width={24} />
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        <Stack spacing={2} sx={{ p: 3 }}>
          {/* 검색 필드 */}
          <TextField
            fullWidth
            placeholder="이름, 부서, 역할로 검색"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="eva:search-fill" width={24} sx={{ color: 'text.disabled' }} />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiInputBase-input': {
                fontSize: 15,
                lineHeight: '24px',
                py: 2,
              },
            }}
          />

          {/* 멤버 목록 */}
          {isMembersLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 6 }}>
              <CircularProgress size={32} />
            </Box>
          ) : (
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell padding="checkbox" sx={{ width: 50 }} />
                      <TableCell sx={{ fontSize: 14, fontWeight: 600 }}>이름</TableCell>
                      <TableCell sx={{ fontSize: 14, fontWeight: 600 }}>부서</TableCell>
                      <TableCell sx={{ fontSize: 14, fontWeight: 600 }}>역할</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} sx={{ textAlign: 'center', py: 4 }}>
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            검색 결과가 없습니다
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedUsers.map((member) => (
                        <TableRow
                          key={member.id}
                          hover
                          onClick={() => handleSelect(member.id)}
                          sx={{ cursor: 'pointer' }}
                        >
                          <TableCell padding="checkbox">
                            <Radio checked={selectedId === member.id} />
                          </TableCell>
                          <TableCell>
                            <Stack direction="row" spacing={1.5} alignItems="center">
                              <Avatar src={member.avatar} sx={{ width: 40, height: 40 }}>
                                {member.name[0]}
                              </Avatar>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {member.name}
                              </Typography>
                            </Stack>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                              {member.department || '-'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                              {member.roleLabel}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* 페이지네이션 */}
              {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  <Pagination count={totalPages} page={page} onChange={handlePageChange} />
                </Box>
              )}
            </>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 3 }}>
        <Box sx={{ flex: 1 }} />
        <Stack direction="row" spacing={1.5}>
          <DialogBtn variant="outlined" onClick={handleClose} sx={{ minHeight: 36, fontSize: 14 }}>
            취소
          </DialogBtn>
          <DialogBtn
            variant="contained"
            onClick={handleConfirm}
            disabled={!selectedId}
            sx={{ minHeight: 36, fontSize: 14 }}
          >
            선택
          </DialogBtn>
        </Stack>
      </DialogActions>
    </Dialog>
  );
}
