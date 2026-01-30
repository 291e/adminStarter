import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { useSearchParams } from 'src/routes/hooks';

import { FormHead } from '../../components/form-head';

import { verifyInvitationCode } from 'src/services/organization/organization.service';
import { useAuthI18n } from '../../i18n/auth-i18n';

// ----------------------------------------------------------------------

export function JwtInvitationView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get('code');
  const { t, locale } = useAuthI18n();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 초대 코드 검증
  const {
    data: verifyData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['verifyInvitationCode', code],
    queryFn: () => verifyInvitationCode({ code: code! }),
    enabled: !!code,
    retry: false,
  });

  useEffect(() => {
    if (!code) {
      setErrorMessage(t('invitation.noCode'));
      return;
    }

    if (isLoading) {
      setErrorMessage(null); // 로딩 중에는 에러 메시지 초기화
      return;
    }

    if (isError) {
      const errorMsg =
        (error as any)?.body?.resultMessage ||
        (error as any)?.message ||
        t('invitation.invalidCode');
      setErrorMessage(errorMsg);
      return;
    }

    // verifyData가 없으면 아무것도 하지 않음
    if (!verifyData) {
      return;
    }

    // axios 인터셉터가 응답을 평탄화하므로 data에 직접 접근
    // 평탄화 후 구조: { header: {...}, isValid: true, invitation: {...} }
    const isValid = (verifyData as any)?.isValid;
    const invitation = (verifyData as any)?.invitation;

    if (import.meta.env.DEV) {
      console.log('🔍 [JwtInvitationView] Verify Response:', {
        verifyData,
        isValid,
        invitation,
      });
    }

    // 검증 성공 시 회원가입 페이지로 리다이렉트 (code와 함께)
    if (isValid === true && invitation) {
      setErrorMessage(null); // 성공 시 에러 메시지 초기화
      router.push(`${paths.auth.jwt.signUp}?code=${encodeURIComponent(code)}`);
    } else if (isValid === false) {
      setErrorMessage(t('invitation.invalidCode'));
    } else if (verifyData && isValid !== true && !invitation) {
      // isValid가 undefined이거나 false이고 invitation도 없는 경우
      setErrorMessage(t('invitation.invalidCode'));
    }
  }, [code, verifyData, isLoading, isError, error, router, t]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <CircularProgress />
          <Typography variant="body2" color="text.secondary">
            {t('invitation.verifying')}
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

    // axios 인터셉터가 평탄화하므로 data에 직접 접근
    // 평탄화 후 구조: { header: {...}, isValid: true, invitation: {...} }
    const invitation = (verifyData as any)?.invitation;

    // 초대 정보 표시
    if (invitation) {
      return (
        <Stack spacing={2} sx={{ mb: 3 }}>
          <Alert severity="success" sx={{ mb: 2 }}>
            {t('invitation.valid')}
          </Alert>
          <Box
            sx={{
              p: 2,
              bgcolor: 'grey.50',
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              {t('invitation.info.title')}
            </Typography>
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              {t('invitation.info.companyName')} {invitation.companyName}
            </Typography>
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              {t('invitation.info.invitedEmail')} {invitation.invitedEmail}
            </Typography>
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              {t('invitation.info.role')} {invitation.memberRole}
            </Typography>
            <Typography variant="body2">
              {t('invitation.info.expiresAt')}{' '}
              {new Date(invitation.expiresAt).toLocaleDateString(locale)}
            </Typography>
          </Box>
        </Stack>
      );
    }

    // 응답은 왔지만 invitation이 없는 경우
    if (verifyData && !invitation) {
      return (
        <Alert severity="warning" sx={{ mb: 3 }}>
          {t('invitation.notFound')}
        </Alert>
      );
    }

    return null;
  };

  return (
    <>
      <FormHead
        title={t('invitation.title')}
        description={t('invitation.description')}
        sx={{ textAlign: { xs: 'center', md: 'left' } }}
      />

      {renderContent()}
    </>
  );
}
