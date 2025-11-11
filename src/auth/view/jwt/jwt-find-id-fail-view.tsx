import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';
import { CONFIG } from 'src/global-config';

import { Iconify } from 'src/components/iconify';
import { FormHead } from '../../components/form-head';

// ----------------------------------------------------------------------

export function JwtFindIdFailView() {
  const router = useRouter();

  const handleRetry = () => {
    router.push(paths.auth.jwt.findId);
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
            width: 96,
            height: 79,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 2,
          }}
        >
          <img
            alt="아이디 찾기 실패"
            src={`${CONFIG.assetsDir}/auth/jwt3.svg`}
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        </Box>

        <FormHead title="아이디 찾기 실패" sx={{ textAlign: { xs: 'center', md: 'left' } }} />

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
          해당 이메일로 가입된 정보가 없습니다.
        </Typography>
      </Box>

      <Box sx={{ gap: 3, display: 'flex', flexDirection: 'column' }}>
        {/* 고객센터 문의하기 박스 */}
        <Box
          sx={{
            bgcolor: 'grey.200',
            borderRadius: 1,
            p: 1.5,
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
            alignItems: 'center',
            width: '100%',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 0.5,
            }}
          >
            <Typography
              variant="caption"
              sx={{
                fontSize: 12,
                fontWeight: 500,
                color: 'text.secondary',
              }}
            >
              고객센터 문의하기
            </Typography>
            <Button
              variant="text"
              size="small"
              sx={{
                minWidth: 'auto',
                p: 0.5,
                fontSize: 12,
                fontWeight: 600,
                color: 'primary.main',
                textTransform: 'none',
                '&:hover': {
                  bgcolor: 'transparent',
                },
              }}
            >
              1588-6752
            </Button>
          </Box>
        </Box>

        {/* 다시 입력하기 버튼 */}
        <Button
          fullWidth
          color="inherit"
          size="large"
          variant="contained"
          onClick={handleRetry}
        >
          다시 입력하기
        </Button>
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

