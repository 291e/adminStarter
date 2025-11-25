import { useEffect, useState } from 'react';
import { useMutation } from '@tanstack/react-query';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { useSearchParams } from 'src/routes/hooks';

import { FormHead } from '../../components/form-head';

import { verifyInvitation } from 'src/services/sign/sign.service';
import type { InvitationDto } from 'src/services/sign/sign.types';

// ----------------------------------------------------------------------

export function JwtInvitationView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get('code');

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const verifyMutation = useMutation({
    mutationFn: (params: InvitationDto) => verifyInvitation(params),
    onSuccess: (data) => {
      // 검증 성공 시 회원가입 페이지로 리다이렉트 (code와 함께)
      if (code) {
        router.push(`${paths.auth.jwt.signUp}?code=${encodeURIComponent(code)}`);
      } else {
        router.push(paths.auth.jwt.signUp);
      }
    },
    onError: (error: any) => {
      console.error('초대 코드 검증 실패:', error);
      const message =
        error?.body?.resultMessage ||
        error?.message ||
        '초대 링크가 유효하지 않거나 만료되었습니다.';
      setErrorMessage(message);
    },
  });

  useEffect(() => {
    if (!code) {
      setErrorMessage('초대 코드가 없습니다.');
      return;
    }

    // 초대 코드 검증
    verifyMutation.mutate({
      code,
      link: window.location.href, // 전체 링크도 함께 전송
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  const renderContent = () => {
    if (verifyMutation.isPending) {
      return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <CircularProgress />
          <Typography variant="body2" color="text.secondary">
            초대 링크를 검증하는 중...
          </Typography>
        </Box>
      );
    }

    if (errorMessage) {
      return (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errorMessage}
        </Alert>
      );
    }

    return null;
  };

  return (
    <>
      <FormHead
        title="초대 링크 검증 중"
        description="초대 링크를 확인하고 있습니다. 잠시만 기다려주세요."
        sx={{ textAlign: { xs: 'center', md: 'left' } }}
      />

      {renderContent()}
    </>
  );
}

