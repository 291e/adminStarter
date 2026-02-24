import { z as zod } from 'zod';
import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';
import { CONFIG } from 'src/global-config';

import { Iconify } from 'src/components/iconify';
import { Form, Field } from 'src/components/hook-form';
import { requestPasswordResetCode } from 'src/services/sign/sign.service';

import { getErrorMessage } from '../../utils';
import { FormHead } from '../../components/form-head';
import { useAuthI18n } from '../../i18n/auth-i18n';

// ----------------------------------------------------------------------

export type ResetPasswordSchemaType = {
  memberId: string;
  email: string;
};

const createResetPasswordSchema = (t: (key: string) => string) =>
  zod.object({
    memberId: zod.string().min(1, { message: t('signIn.validation.idRequired') }),
    email: zod
      .string()
      .min(1, { message: t('resetPassword.validation.emailRequired') })
      .email({ message: t('resetPassword.validation.emailInvalid') }),
  });

// ----------------------------------------------------------------------

export function JwtResetPasswordView() {
  const router = useRouter();
  const { t } = useAuthI18n();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const defaultValues: ResetPasswordSchemaType = {
    memberId: '',
    email: '',
  };

  const ResetPasswordSchema = useMemo(() => createResetPasswordSchema(t), [t]);

  const methods = useForm<ResetPasswordSchemaType>({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      setErrorMessage(null);

      const memberId = data.memberId.trim();
      const email = data.email.trim();

      await requestPasswordResetCode({
        memberId,
        memberEmail: email,
      });

      // 인증 코드 입력 페이지로 이동
      router.push(
        `${paths.auth.jwt.verifyCode}?email=${encodeURIComponent(email)}&memberId=${encodeURIComponent(memberId)}&type=resetPassword`
      );
    } catch (error) {
      console.error(error);
      const feedbackMessage = getErrorMessage(error);
      setErrorMessage(feedbackMessage);
    }
  });

  const renderForm = () => (
    <Box sx={{ gap: 3, display: 'flex', flexDirection: 'column' }}>
      <Field.Text
        name="memberId"
        label={t('common.id')}
        placeholder="your-id"
        slotProps={{
          inputLabel: { shrink: true, required: true },
        }}
      />

      <Field.Text
        name="email"
        label={t('common.email')}
        placeholder="example@gmail.com"
        slotProps={{
          inputLabel: { shrink: true, required: true },
        }}
      />

      <Button
        fullWidth
        color="inherit"
        size="large"
        type="submit"
        variant="contained"
        loading={isSubmitting}
        loadingIndicator={t('resetPassword.sending')}
      >
        {t('resetPassword.sendCode')}
      </Button>
    </Box>
  );

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
            width: 68,
            height: 56,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 2,
          }}
        >
          <img
            alt={t('resetPassword.title')}
            src={`${CONFIG.assetsDir}/auth/jwt.svg`}
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        </Box>

        <FormHead
          title={t('resetPassword.title')}
          sx={{ textAlign: { xs: 'center', md: 'left' } }}
        />

        <Typography
          variant="body2"
          sx={{
            fontSize: 14,
            lineHeight: '22px',
            color: 'text.secondary',
            textAlign: 'center',
            mt: 1.5,
            mb: 0,
            whiteSpace: 'pre-line',
          }}
        >
          {t('resetPassword.description')}
        </Typography>
      </Box>

      {!!errorMessage && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errorMessage}
        </Alert>
      )}

      <Form methods={methods} onSubmit={onSubmit}>
        {renderForm()}
      </Form>

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
          {t('common.back')}
        </Link>
      </Box>
    </>
  );
}
