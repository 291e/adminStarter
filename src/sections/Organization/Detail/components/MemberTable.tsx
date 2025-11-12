import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';

import type { Member } from 'src/sections/Organization/types/member';
import { fDateTime } from 'src/utils/format-time';
import { Iconify } from 'src/components/iconify';

type Props = {
  organizationId?: string | number;
  rows?: (Member & { order?: number })[];
  onEdit?: (member: Member) => void;
};

// 역할 매핑 함수
const getRoleLabel = (memberRole: string): string => {
  const roleMap: { [key: string]: string } = {
    organization_admin: '조직 관리자',
    supervisor: '관리 감독자',
    safety_manager: '안전보건 담당자',
    worker: '근로자',
    admin: '조직 관리자',
    member: '근로자',
    distributor: '총판',
    agency: '대리점',
    dealer: '딜러',
  };
  return roleMap[memberRole] || memberRole;
};

// 직종 매핑 함수 (실제로는 멤버 데이터에 직종 정보가 있어야 함)
const getJobType = (member: Member): string => {
  // 임시로 랜덤하게 반환 (실제로는 멤버 데이터에 직종 필드가 있어야 함)
  const jobTypes = ['생산직', '사무직', '관리직'];
  return jobTypes[member.memberIdx % jobTypes.length];
};

// 국적 매핑 함수 (실제로는 멤버 데이터에 국적 정보가 있어야 함)
const getNationality = (member: Member): string => {
  // 임시로 랜덤하게 반환 (실제로는 멤버 데이터에 국적 필드가 있어야 함)
  const nationalities = ['대한민국', '우즈베키스탄', '베트남', '필리핀'];
  return nationalities[member.memberIdx % nationalities.length];
};

// 직급 매핑 함수 (실제로는 멤버 데이터에 직급 정보가 있어야 함)
const getPosition = (member: Member): string => {
  // 임시로 랜덤하게 반환 (실제로는 멤버 데이터에 직급 필드가 있어야 함)
  const positions = ['과장', '팀장', '사원', '부장', '인턴'];
  return positions[member.memberIdx % positions.length];
};

// 소속 매핑 함수 (실제로는 멤버 데이터에 소속 정보가 있어야 함)
const getDepartment = (member: Member): string => {
  // 임시로 랜덤하게 반환 (실제로는 멤버 데이터에 소속 필드가 있어야 함)
  const departments = ['생산 1팀', '생산 2팀', '관리팀', '안전팀'];
  return departments[member.memberIdx % departments.length];
};

export default function MemberTable({ organizationId, rows: initialRows, onEdit }: Props) {
  // TODO: TanStack Query Hook(useQuery)으로 조직원 초대로 초대받아 회원가입한 멤버 목록 조회
  // const { data: invitedMembers, isLoading, isError } = useQuery({
  //   queryKey: ['organization', organizationId, 'invited-members'],
  //   queryFn: () => getInvitedMembers(organizationId),
  //   enabled: !!organizationId,
  //   select: (data) => {
  //     // 초대받아 회원가입 완료한 멤버만 필터링 (초대 상태가 'accepted' 또는 'registered'인 경우)
  //     return data.filter((member) =>
  //       member.invitationStatus === 'accepted' ||
  //       member.invitationStatus === 'registered' ||
  //       member.invitedBy !== null // 초대받은 멤버만
  //     );
  //   },
  // });

  // 임시: 초기 rows가 있으면 사용, 없으면 빈 배열
  // 실제로는 API에서 받아온 데이터 사용
  const rows = initialRows || [];

  return (
    <TableContainer
      component={Paper}
      sx={{ overflowX: 'auto', borderTopLeftRadius: 0, borderTopRightRadius: 0 }}
    >
      <Table size="small" stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell sx={{ bgcolor: 'grey.100', minWidth: 120 }}>등록일</TableCell>
            <TableCell sx={{ bgcolor: 'grey.100', minWidth: 120 }}>아이디</TableCell>
            <TableCell sx={{ bgcolor: 'grey.100', minWidth: 160 }}>이름 / 직급</TableCell>
            <TableCell sx={{ bgcolor: 'grey.100', minWidth: 100 }}>소속</TableCell>
            <TableCell sx={{ bgcolor: 'grey.100', minWidth: 140 }}>역할</TableCell>
            <TableCell sx={{ bgcolor: 'grey.100', minWidth: 100 }}>직종</TableCell>
            <TableCell sx={{ bgcolor: 'grey.100', minWidth: 292 }}>전화번호 / 이메일</TableCell>
            <TableCell align="center" sx={{ bgcolor: 'grey.100', minWidth: 120 }}>
              국적
            </TableCell>
            <TableCell align="center" sx={{ bgcolor: 'grey.100', minWidth: 100 }}>
              상태
            </TableCell>
            <TableCell align="center" sx={{ bgcolor: 'grey.100', minWidth: 68 }}>
              액션
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.memberIdx} hover>
              <TableCell>
                <Typography variant="body2">
                  {fDateTime(row.createAt, 'YYYY-MM-DD HH:mm:ss')}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">{row.memberId}</Typography>
              </TableCell>
              <TableCell>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Avatar src={row.memberThumbnail} sx={{ width: 32, height: 32 }}>
                    {row.memberName.charAt(0)}
                  </Avatar>
                  <Stack spacing={0.5}>
                    <Typography variant="body2">{row.memberName}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {getPosition(row)}
                    </Typography>
                  </Stack>
                </Stack>
              </TableCell>
              <TableCell>
                <Typography variant="body2">{getDepartment(row)}</Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">{getRoleLabel(row.memberRole)}</Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">{getJobType(row)}</Typography>
              </TableCell>
              <TableCell>
                <Stack spacing={0.5}>
                  <Typography variant="body2">{row.memberPhone}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {row.memberEmail}
                  </Typography>
                </Stack>
              </TableCell>
              <TableCell align="center">
                <Typography variant="body2">{getNationality(row)}</Typography>
              </TableCell>
              <TableCell align="center">
                {row.memberStatus === 'active' ? (
                  <Chip label="활성" size="small" color="success" variant="soft" />
                ) : (
                  <Chip label="비활성" size="small" sx={{ bgcolor: 'grey.300' }} />
                )}
              </TableCell>
              <TableCell align="center">
                <IconButton
                  size="small"
                  onClick={() => onEdit?.(row)}
                  sx={{
                    bgcolor: 'grey.200',
                    '&:hover': {
                      bgcolor: 'grey.300',
                    },
                  }}
                >
                  <Iconify icon="solar:pen-bold" width={20} />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
