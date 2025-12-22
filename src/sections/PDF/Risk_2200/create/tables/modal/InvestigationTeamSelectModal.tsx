import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import Dialog from '@mui/material/Dialog';
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
import Radio from '@mui/material/Radio';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Pagination from '@mui/material/Pagination';
import Chip from '@mui/material/Chip';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';

import { Iconify } from 'src/components/iconify';
import DialogBtn from 'src/components/safeyoui/button/dialogBtn';
import { useAuthContext } from 'src/auth/hooks/use-auth-context';
import { useMyInfo } from 'src/sections/Chat/hooks/use-my-info';
import { getCompanyMembers } from 'src/services/organization/organization.service';
import { getEducationReports } from 'src/services/education-report/education-report.service';
import { getOrganizations } from 'src/services/organization/organization.service';
import type { InvestigationTeamMember } from '../../../types/table-data';

// ----------------------------------------------------------------------

type InvitableMember = {
  id: string;
  name: string;
  department: string;
  role: string;
  roleLabel: string;
  completedHours?: number; // 이수시간 (2400번대용)
  totalHours?: number; // 총 이수시간 (2400번대용)
};

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: (members: InvestigationTeamMember[]) => void;
  is2400Series?: boolean; // 2400번대 여부
  isNearMiss?: boolean; // 아차사고 여부 (1명만 선택 가능)
  isSingleSelect?: boolean; // 1명만 선택 가능 여부 (라디오 버튼 사용)
};

const getRoleLabel = (role: string): string => {
  if (!role) return '';

  const roleUpper = role.toUpperCase();
  const roleMap: { [key: string]: string } = {
    OPERATOR_MANAGER: '조직 관리자',
    MANAGEMENT_SUPERVISOR: '관리 감독자',
    SAFETY_MANAGER: '안전보건 담당자',
    WORKER: '근로자',
    ADMIN: '조직 관리자',
    MANAGER: '관리자',
    MEMBER: '근로자',
    SAFETY_WORKER: '안전근로자',
    // 소문자 키 (하위 호환성)
    operator_manager: '조직 관리자',
    management_supervisor: '관리 감독자',
    safety_manager: '안전보건 담당자',
    worker: '근로자',
    admin: '조직 관리자',
    manager: '관리자',
    member: '근로자',
    safety_worker: '안전근로자',
  };

  return roleMap[roleUpper] || roleMap[role] || role;
};

export default function InvestigationTeamSelectModal({
  open,
  onClose,
  onConfirm,
  is2400Series = false,
  isNearMiss = false,
  isSingleSelect = false,
}: Props) {
  const { user } = useAuthContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const rowsPerPage = 5;

  // 내 정보 조회 (companyIdx 및 superAdmin 확인용)
  const { data: myInfoData } = useMyInfo();

  // superAdmin 여부 확인 (truthy 값으로 확인하도록 수정)
  const isSuperAdmin = useMemo(
    () =>
      !!(myInfoData as any)?.isSuperAdmin ||
      !!(myInfoData as any)?.memberSuperAdminInformation ||
      !!(user as any)?.isSuperAdmin,
    [myInfoData, user]
  );

  // companyIdx 추출
  const companyIdx = useMemo(() => {
    // 1. myInfoData에서 확인
    if (myInfoData) {
      const idx =
        (myInfoData as any).companyIdx ??
        (myInfoData as any).companyIndex ??
        (myInfoData as any).company?.companyIdx ??
        (myInfoData as any).company?.companyIndex;
      if (idx && !Number.isNaN(Number(idx))) return Number(idx);
    }

    // 2. user(AuthContext)에서 확인
    if (user) {
      const idx = (user as any).companyIdx ?? (user as any).companyIndex;
      if (idx && !Number.isNaN(Number(idx))) return Number(idx);
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

  // 교육 이수 현황 조회 (2400번대인 경우)
  const { data: educationReportsData } = useQuery({
    queryKey: ['educationReports', 'all'],
    queryFn: () =>
      getEducationReports({
        page: 1,
        pageSize: 10000, // 모든 멤버의 교육 이수 현황 가져오기
      }),
    enabled: open && is2400Series,
    staleTime: 5 * 60 * 1000,
  });

  // API 데이터에서 멤버 목록 추출 및 매핑
  const invitableMembers: InvitableMember[] = useMemo(() => {
    // superAdmin인 경우 모든 멤버, 아닌 경우 해당 회사 멤버
    const dataSource = isSuperAdmin ? allMembersData : membersData;
    if (!dataSource) return [];

    // axios 인터셉터가 평탄화하므로 body를 거치지 않고 직접 접근
    // 응답 구조: { header: {...}, memberList: [...], totalCount: 4 }
    const rawMembers =
      (dataSource as any).memberList ||
      (dataSource as any).members ||
      (dataSource as any).body?.memberList ||
      (dataSource as any).body?.members ||
      [];

    // 교육 이수 현황 맵 생성 (2400번대인 경우)
    const educationMap = new Map<number, { completedHours: number; totalHours: number }>();
    if (is2400Series && educationReportsData) {
      // axios 인터셉터가 평탄화하므로 직접 접근
      // getEducationReports는 BaseResponseDto<{ educationReports: [...] }> 형태를 반환
      // 인터셉터가 평탄화하면 body가 사라지고 educationReports가 최상위로 올라감
      let educationReports: any[] = [];
      const data = educationReportsData as any;

      if (Array.isArray(data?.educationReports)) {
        educationReports = data.educationReports;
      } else if (Array.isArray(data?.educationReportList)) {
        educationReports = data.educationReportList;
      } else if (Array.isArray(data?.body?.educationReports)) {
        educationReports = data.body.educationReports;
      } else if (Array.isArray(data?.body?.educationReportList)) {
        educationReports = data.body.educationReportList;
      } else if (Array.isArray(data)) {
        educationReports = data;
      }

      educationReports.forEach((report: any) => {
        const memberIdx = report.memberIdx || report.memberInformation?.memberIdx;
        if (memberIdx) {
          const completedHours = report.totalEducation || 0;
          const totalHours = report.standardEducation || 120;

          educationMap.set(memberIdx, {
            completedHours, // 총 이수 시간
            totalHours, // 이수 기준 시간
          });
        }
      });
    }

    return rawMembers.map((member: any): InvitableMember => {
      const rawRole = member.memberRole || member.role || '';
      const memberIdx = member.memberIdx || member.memberIndex || Number(member.id);
      const educationInfo = educationMap.get(memberIdx);

      return {
        id: memberIdx?.toString() || member.id,
        name: member.memberName || member.name,
        department: member.deptName || member.departmentName || member.department || '',
        role: rawRole,
        roleLabel: getRoleLabel(rawRole),
        // 실제 교육 이수 현황 사용 (2400번대인 경우)
        completedHours: is2400Series
          ? (educationInfo?.completedHours ?? 0)
          : (member.completedHours ?? 0),
        totalHours: is2400Series ? (educationInfo?.totalHours ?? 120) : member.totalHours || 120,
      };
    });
  }, [membersData, allMembersData, isSuperAdmin, is2400Series, educationReportsData]);

  // 검색 필터링
  const filteredMembers = useMemo(
    () =>
      invitableMembers.filter(
        (member) =>
          member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          member.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
          member.roleLabel.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [invitableMembers, searchQuery]
  );

  const paginatedMembers = useMemo(() => {
    const startIndex = (page - 1) * rowsPerPage;
    return filteredMembers.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredMembers, page, rowsPerPage]);

  const totalPages = Math.max(1, Math.ceil(filteredMembers.length / rowsPerPage));
  const paginatedIds = paginatedMembers.map((member) => member.id);
  const isAllSelected =
    paginatedMembers.length > 0 && paginatedIds.every((id) => selectedIds.includes(id));
  const isIndeterminate = paginatedIds.some((id) => selectedIds.includes(id)) && !isAllSelected;

  const selectedMembers = useMemo(
    () => invitableMembers.filter((member) => selectedIds.includes(member.id)),
    [invitableMembers, selectedIds]
  );

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelectedIds((prev) => [...new Set([...prev, ...paginatedIds])]);
    } else {
      setSelectedIds((prev) => prev.filter((id) => !paginatedIds.includes(id)));
    }
  };

  // 단일 선택 모드인지 확인 (아차사고 또는 단일 선택 모드)
  const shouldSingleSelect = isNearMiss || isSingleSelect;

  const handleSelect = (id: string) => {
    if (shouldSingleSelect) {
      // 1명만 선택 가능 (라디오 버튼 방식)
      setSelectedIds([id]);
    } else {
      // 여러 명 선택 가능 (체크박스 방식)
      setSelectedIds((prev) =>
        prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
      );
    }
  };

  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const handleClose = () => {
    setSearchQuery('');
    setSelectedIds([]);
    setPage(1);
    onClose();
  };

  const handleConfirm = () => {
    // TODO: TanStack Query Hook(useMutation)으로 사고조사반 추가 API 호출
    onConfirm(
      selectedMembers.map((member) => ({
        department: member.department,
        name: member.name,
        memberIdx: Number(member.id) || undefined, // id를 memberIdx로 변환
      }))
    );
    handleClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogContent sx={{ px: 0, pt: 3 }}>
        <TextField
          fullWidth
          size="medium"
          placeholder="이름을 입력하세요."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setPage(1);
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Iconify icon="eva:search-fill" width={24} sx={{ color: 'primary.main' }} />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2.75, px: 3 }}
        />

        {isMembersLoading || isAllMembersLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 6 }}>
            <CircularProgress size={32} />
          </Box>
        ) : (
          <TableContainer sx={{ minHeight: 350 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  {!shouldSingleSelect && (
                    <TableCell
                      sx={{
                        bgcolor: 'grey.100',
                        minWidth: 72,
                        width: 72,
                        px: 1,
                        py: 2,
                      }}
                      align="center"
                    >
                      <Checkbox
                        checked={isAllSelected}
                        indeterminate={isIndeterminate}
                        onChange={handleSelectAll}
                        size="small"
                        sx={{ p: 1 }}
                      />
                    </TableCell>
                  )}
                  {shouldSingleSelect && (
                    <TableCell
                      sx={{
                        bgcolor: 'grey.100',
                        minWidth: 72,
                        width: 72,
                        px: 1,
                        py: 2,
                      }}
                    />
                  )}
                  <TableCell
                    sx={{
                      bgcolor: 'grey.100',
                      fontSize: 14,
                      fontWeight: 600,
                      lineHeight: '24px',
                      color: 'text.secondary',
                      px: 2,
                      py: 2,
                    }}
                  >
                    이름 / 직급
                  </TableCell>
                  <TableCell
                    sx={{
                      bgcolor: 'grey.100',
                      fontSize: 14,
                      fontWeight: 600,
                      lineHeight: '24px',
                      color: 'text.secondary',
                      px: 2,
                      py: 2,
                    }}
                  >
                    소속팀
                  </TableCell>
                  <TableCell
                    sx={{
                      bgcolor: 'grey.100',
                      fontSize: 14,
                      fontWeight: 600,
                      lineHeight: '24px',
                      color: 'text.secondary',
                      px: 2,
                      py: 2,
                    }}
                  >
                    역할
                  </TableCell>
                  {is2400Series && (
                    <TableCell
                      sx={{
                        bgcolor: 'grey.100',
                        fontSize: 14,
                        fontWeight: 600,
                        lineHeight: '24px',
                        color: 'text.secondary',
                        px: 2,
                        py: 2,
                      }}
                    >
                      이수시간(분)
                    </TableCell>
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedMembers.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={
                        is2400Series ? (shouldSingleSelect ? 4 : 5) : shouldSingleSelect ? 3 : 4
                      }
                      align="center"
                      sx={{ py: 4 }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        검색 결과가 없습니다.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedMembers.map((member) => {
                    const isSelected = selectedIds.includes(member.id);
                    return (
                      <TableRow
                        key={member.id}
                        hover
                        sx={{
                          borderBottom: '1px dashed',
                          borderColor: 'divider',
                          '&:last-child': { borderBottom: 'none' },
                        }}
                      >
                        <TableCell sx={{ px: 1, py: 2 }} align="center">
                          {shouldSingleSelect ? (
                            <Radio
                              checked={isSelected}
                              onChange={() => handleSelect(member.id)}
                              size="small"
                              sx={{ p: 1 }}
                            />
                          ) : (
                            <Checkbox
                              checked={isSelected}
                              onChange={() => handleSelect(member.id)}
                              size="small"
                              sx={{ p: 1 }}
                            />
                          )}
                        </TableCell>
                        <TableCell sx={{ px: 2, py: 2 }}>
                          <Stack direction="row" spacing={2} alignItems="center">
                            <Avatar sx={{ width: 40, height: 40, bgcolor: 'grey.300' }}>
                              {member.name[0]}
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
                                {member.name}
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{
                                  fontSize: 14,
                                  fontWeight: 400,
                                  lineHeight: '22px',
                                  color: 'text.disabled',
                                }}
                              >
                                {member.roleLabel}
                              </Typography>
                            </Stack>
                          </Stack>
                        </TableCell>
                        <TableCell sx={{ px: 2, py: 2 }}>
                          <Typography
                            variant="body2"
                            sx={{
                              fontSize: 14,
                              fontWeight: 400,
                              lineHeight: '22px',
                              color: 'text.primary',
                            }}
                          >
                            {member.department}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ px: 2, py: 2 }}>
                          <Typography
                            variant="body2"
                            sx={{
                              fontSize: 14,
                              fontWeight: 400,
                              lineHeight: '22px',
                              color: 'text.primary',
                            }}
                          >
                            {member.roleLabel}
                          </Typography>
                        </TableCell>
                        {is2400Series && (
                          <TableCell sx={{ px: 2, py: 2 }}>
                            <Typography
                              variant="body2"
                              sx={{
                                fontSize: 14,
                                fontWeight: 400,
                                lineHeight: '22px',
                                color: 'text.primary',
                              }}
                            >
                              <Box component="span" sx={{ fontWeight: 600 }}>
                                {member.completedHours ?? 0}
                              </Box>
                              {` / ${member.totalHours ?? 120}`}
                            </Typography>
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

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

        {selectedMembers.length > 0 && (
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
            {selectedMembers.map((member) => (
              <Chip
                key={member.id}
                label={member.name}
                size="small"
                onDelete={() => handleSelect(member.id)}
                deleteIcon={<Iconify icon="solar:close-circle-bold" width={16} />}
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
            확인
          </DialogBtn>
        </Stack>
      </DialogActions>
    </Dialog>
  );
}
