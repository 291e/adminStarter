import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import LinearProgress from '@mui/material/LinearProgress';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';

import { Iconify } from 'src/components/iconify';

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

type Props = {
  name: string;
  label: string;
  roles: string[];
  educationRate: number;
  onViewDetail?: () => void;
};

export default function ProfileCard({ name, label, roles, educationRate, onViewDetail }: Props) {
  // label을 한글로 변환
  const labelKorean = getRoleLabel(label);

  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        borderRadius: { xs: 2, sm: 2.5 },
        p: { xs: 2, sm: 2.5 },
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        gap: { xs: 2, sm: 3.5 },
        alignItems: { xs: 'center', sm: 'flex-start' },
        height: '100%',
        width: '100%',
      }}
    >
      {/* 프로필 아바타 */}
      <Box sx={{ position: 'relative', flexShrink: 0 }}>
        <Avatar
          sx={{
            width: { xs: 80, sm: 96 },
            height: { xs: 80, sm: 96 },
          }}
        >
          {name[0]}
        </Avatar>
        <IconButton
          sx={{
            position: 'absolute',
            left: { xs: 52, sm: 64 },
            top: { xs: 56, sm: 68 },
            bgcolor: 'text.primary',
            color: 'common.white',
            width: { xs: 24, sm: 28 },
            height: { xs: 24, sm: 28 },
            borderRadius: 1.75,
            boxShadow: 2,
            '&:hover': {
              bgcolor: 'text.primary',
            },
          }}
        >
          <Iconify icon="solar:pen-bold" width={16} />
        </IconButton>
      </Box>

      {/* 프로필 정보 */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: { xs: 1, sm: 1.5 },
          width: '100%',
          alignItems: { xs: 'center', sm: 'stretch' },
        }}
      >
        {/* 이름 및 라벨 */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: { xs: 0.5, sm: 1.5 },
            alignItems: { xs: 'center', sm: 'center' },
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 700, fontSize: '1.25rem' }}>
            {name}
          </Typography>
          <Chip
            label={labelKorean}
            size="small"
            sx={{
              height: 24,
              fontSize: { xs: 11, sm: 12 },
              fontWeight: 700,
              bgcolor: 'grey.100',
              color: 'text.secondary',
            }}
          />
        </Box>

        {/* 역할 목록 */}
        <Box
          component="ul"
          sx={{
            m: 0,
            fontSize: { xs: 13, sm: 14 },
            color: 'text.secondary',
            lineHeight: '22px',
            textAlign: { xs: 'center', sm: 'left' },
            '& li': {
              mb: 0,
            },
          }}
        >
          {roles.map((role, index) => (
            <li key={index}>
              <Typography
                variant="body2"
                sx={{ color: 'text.secondary', fontSize: { xs: 13, sm: 14 } }}
              >
                {role}
              </Typography>
            </li>
          ))}
        </Box>

        {/* 교육이수율 */}
        <Box
          sx={{
            bgcolor: 'grey.50',
            border: '1px solid',
            borderColor: 'grey.200',
            borderRadius: 1,
            p: { xs: 1.25, sm: 1.5 },
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: { xs: 1, sm: 1.5 },
            width: '100%',
            minHeight: 86,
            maxWidth: 314,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              width: '100%',
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: { xs: 13, sm: 14 } }}>
              교육이수율
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: 'text.secondary', fontSize: { xs: 12, sm: 14 } }}
            >
              ({educationRate}%)
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={educationRate}
            sx={{
              height: 8,
              borderRadius: '50px',
              bgcolor: 'grey.100',
              '& .MuiLinearProgress-bar': {
                borderRadius: '50px',
                bgcolor: '#2563E9',
              },
            }}
          />
          <Button
            variant="outlined"
            size="small"
            endIcon={<Iconify icon="eva:arrow-ios-forward-fill" width={20} />}
            onClick={onViewDetail}
            sx={{
              alignSelf: { xs: 'stretch', sm: 'flex-end' },
              minHeight: 36,
              fontSize: { xs: 13, sm: 14 },
              fontWeight: 700,
              borderColor: '#2563E9',
              color: '#2563E9',
              '&:hover': {
                borderColor: '#2563E9',
                bgcolor: 'rgba(37, 99, 233, 0.04)',
              },
            }}
          >
            상세보기
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
