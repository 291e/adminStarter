import { useSearchParams } from 'react-router';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';
import { CONFIG } from 'src/global-config';

import { Iconify } from 'src/components/iconify';
import { FormHead } from '../../components/form-head';

// ----------------------------------------------------------------------

/**
 * 아이디의 뒤 2글자를 마스킹 처리하는 함수
 * @param id - 마스킹할 아이디
 * @returns 마스킹된 아이디 (뒤 2글자가 **로 대체됨)
 */
const maskUserId = (id: string): string => {
  if (!id || id.length === 0) return '';
  if (id.length <= 2) return '**';
  return id.slice(0, -2) + '**';
};

// ----------------------------------------------------------------------

export function JwtFindIdSuccessView() {
  const router = useRouter();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';

  // URL 파라미터에서 아이디 가져오기 (실제로는 API 응답에서 받아올 것)
  // TODO: API 호출로 실제 아이디 가져오기
  const actualUserId = 'master'; // 임시 값 (실제로는 API 응답에서 받아올 것)
  const userId = maskUserId(actualUserId);

  const handleLogin = () => {
    router.push(paths.auth.jwt.signIn);
  };

  const handleResetPassword = () => {
    router.push(paths.auth.jwt.resetPassword);
  };

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          mb: 3,
        }}
      >
        {/* 아이콘 이미지 */}
        <Box
          sx={{
            width: 108,
            height: 80,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 2,
          }}
        >
          <img
            alt="아이디 찾기 완료"
            src={`${CONFIG.assetsDir}/auth/jwt2.svg`}
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        </Box>

        <FormHead title="아이디 찾기 완료" sx={{ textAlign: { xs: 'center', md: 'left' } }} />

        <Typography
          variant="body2"
          sx={{
            fontSize: 14,
            lineHeight: '22px',
            color: 'text.secondary',
            textAlign: 'center',
            mt: 1.5,
            mb: 0,
            maxWidth: 380,
          }}
        >
          아이디 확인이 완료되었습니다!
          <br />
          안전한 이용을 위해 일부 정보는 마스킹 처리되었습니다.
        </Typography>
      </Box>

      <Box sx={{ gap: 3, display: 'flex', flexDirection: 'column' }}>
        {/* 아이디 필드 (비활성화) */}
        <TextField
          label="아이디"
          value={userId}
          disabled
          fullWidth
          required
          slotProps={{
            inputLabel: { shrink: true, required: true },
          }}
          sx={{
            '& .MuiInputBase-root': {
              bgcolor: 'grey.200',
            },
          }}
        />

        {/* 버튼들 */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Button
            fullWidth
            color="inherit"
            size="large"
            variant="contained"
            onClick={handleLogin}
          >
            로그인 하기
          </Button>

          <Button
            fullWidth
            color="inherit"
            size="large"
            variant="outlined"
            onClick={handleResetPassword}
            sx={{
              bgcolor: 'grey.300',
              color: 'text.primary',
              '&:hover': {
                bgcolor: 'grey.400',
              },
            }}
          >
            비밀번호 찾기
          </Button>
        </Box>
      </Box>

      {/* 돌아가기 링크 */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
        <Link
          component={RouterLink}
          href={paths.auth.jwt.signIn}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            fontSize: 14,
            fontWeight: 600,
            color: 'text.primary',
            textDecoration: 'none',
            cursor: 'pointer',
            '&:hover': {
              textDecoration: 'underline',
            },
          }}
        >
          <Iconify icon="eva:arrow-ios-back-fill" width={16} />
          돌아가기
        </Link>
      </Box>
    </>
  );
}

