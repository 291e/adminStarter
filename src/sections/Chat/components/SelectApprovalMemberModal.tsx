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
import { getChatAvatarUrl } from 'src/sections/Chat/utils/avatar';
import { useAuthContext } from 'src/auth/hooks/use-auth-context';
import { useMyInfo } from 'src/sections/Chat/hooks/use-my-info';
import {
  getCompanyMembers,
  getOrganizations,
} from 'src/services/organization/organization.service';
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
    ADMIN: '조직 관리자',
    MANAGER: '관리 감독자',
    MEMBER: '근로자',
    WORKER: '근로자',
    SAFETY_MANAGER: '안전보건 담당자',
    SAFETY_WORKER: '안전근로자',
    OPERATOR_MANAGER: '조직 관리자',
    MANAGEMENT_SUPERVISOR: '관리 감독자',
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

  // 내 정보 조회 (companyIdx 및 superAdmin 확인용)
  const { data: myInfoData } = useMyInfo();

  // superAdmin 여부 확인 (실제 슈퍼어드민 정보가 있는 경우에만 true)
  const isSuperAdmin = useMemo(() => {
    // isSuperAdmin 플래그가 명시적으로 true인 경우
    if ((myInfoData as any)?.isSuperAdmin === true || (user as any)?.isSuperAdmin === true) {
      return true;
    }

    // memberSuperAdminInformation이 실제로 존재하고 유효한 객체인 경우
    const superAdminInfo = (myInfoData as any)?.memberSuperAdminInformation;
    if (
      superAdminInfo !== undefined &&
      superAdminInfo !== null &&
      typeof superAdminInfo === 'object' &&
      Object.keys(superAdminInfo).length > 0
    ) {
      return true;
    }

    return false;
  }, [myInfoData, user]);

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

  // superAdmin인 경우 모든 조직 목록 조회
  const { data: organizationsData } = useQuery({
    queryKey: ['organizations', 'all'],
    queryFn: () =>
      getOrganizations({
        status: 'active',
        page: 1,
        pageSize: 1000, // 모든 조직 가져오기
      }),
    enabled: open && isSuperAdmin,
    staleTime: 5 * 60 * 1000,
  });

  // 회사 멤버 조회 (superAdmin이 아닌 경우)
  const { data: membersData, isLoading: isMembersLoading } = useQuery({
    queryKey: ['companyMembers', companyIdx],
    queryFn: () => getCompanyMembers(companyIdx),
    enabled: open && !!companyIdx && !isSuperAdmin,
    staleTime: 5 * 60 * 1000,
  });

  // superAdmin인 경우 모든 조직의 멤버 조회
  const { data: allMembersData, isLoading: isAllMembersLoading } = useQuery({
    queryKey: ['allCompanyMembers', organizationsData],
    queryFn: async () => {
      // axios 인터셉터가 평탄화하므로 직접 접근
      const companyList =
        (organizationsData as any)?.companyList ||
        (organizationsData as any)?.body?.companyList ||
        [];
      if (!companyList || companyList.length === 0) return { memberList: [] };

      // 모든 조직의 멤버를 병렬로 가져오기
      const memberPromises = companyList.map((org: any) =>
        getCompanyMembers(org.companyIdx).catch(() => ({ memberList: [] }))
      );
      const memberResults = await Promise.all(memberPromises);

      // 모든 멤버를 하나의 배열로 합치기
      const allMembers = memberResults.flatMap((result: any) => {
        const members =
          result?.memberList ||
          result?.members ||
          result?.body?.memberList ||
          result?.body?.members ||
          [];
        return members;
      });

      return { memberList: allMembers };
    },
    enabled: open && isSuperAdmin && !!organizationsData,
    staleTime: 5 * 60 * 1000,
  });

  // API 데이터에서 멤버 목록 추출 및 매핑
  const invitableUsers: InvitableUser[] = useMemo(() => {
    // superAdmin인 경우 모든 멤버, 아닌 경우 해당 회사 멤버
    const dataSource = isSuperAdmin ? allMembersData : membersData;
    if (!dataSource) return [];

    // axios 인터셉터가 평탄화하므로 body를 거치지 않고 직접 접근
    const rawMembers =
      (dataSource as any).memberList ||
      (dataSource as any).members ||
      (dataSource as any).body?.memberList ||
      (dataSource as any).body?.members ||
      [];

    return rawMembers.map((member: any): InvitableUser => {
      const rawRole = member.memberRole || member.role || '';
      // 슈퍼 어드민이면 '최고관리자'로 표시
      const roleLabel = member.isSuperAdmin ? '최고관리자' : getRoleLabel(rawRole);
      return {
        id: member.memberIdx?.toString() || member.memberIndex?.toString() || member.id,
        name: member.memberName || member.name,
        role: rawRole,
        roleLabel,
        department: member.deptName || member.department || '',
        position: member.positionName || member.position || '',
        avatar: member.memberThumbnail || member.profileImage || '',
      };
    });
  }, [isSuperAdmin, allMembersData, membersData]);

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
            placeholder="이름, 소속팀, 역할로 검색"
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
          {isMembersLoading || isAllMembersLoading ? (
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
                      <TableCell sx={{ fontSize: 14, fontWeight: 600 }}>소속팀</TableCell>
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
                              <Avatar
                                src={getChatAvatarUrl(member.avatar)}
                                sx={{ width: 40, height: 40 }}
                              >
                                <Iconify icon="solar:user-rounded-bold" width={24} />
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
