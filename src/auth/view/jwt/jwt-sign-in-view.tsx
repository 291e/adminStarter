import { z as zod } from 'zod';
import { useState, useEffect, useMemo, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useBoolean } from 'minimal-shared/hooks';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { Iconify } from 'src/components/iconify';
import { Form, Field } from 'src/components/hook-form';

import { useAuthContext } from '../../hooks';
import { getErrorMessage } from '../../utils';
import { FormHead } from '../../components/form-head';
import { signInWithPassword } from '../../context/jwt';
import { useAuthI18n } from '../../i18n/auth-i18n';

// ----------------------------------------------------------------------

export type SignInSchemaType = {
  email: string;
  password: string;
};

const createSignInSchema = (t: (key: string) => string) =>
  zod.object({
    email: zod.string().min(1, { message: t('signIn.validation.idRequired') }),
    password: zod
      .string()
      .min(1, { message: t('signIn.validation.passwordRequired') })
      .min(6, { message: t('signIn.validation.passwordMin') }),
  });

// ----------------------------------------------------------------------

export function JwtSignInView() {
  const router = useRouter();
  const { t, locale } = useAuthI18n();

  const showPassword = useBoolean();
  const saveId = useBoolean();

  const { checkUserSession } = useAuthContext();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // localStorage에서 저장된 아이디 불러오기
  const getSavedEmail = () => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('savedEmail');
      if (saved) {
        saveId.onTrue();
        return saved;
      }
    }
    return '';
  };

  const defaultValues: SignInSchemaType = {
    email: getSavedEmail(),
    password: '',
  };

  const signInSchema = useMemo(() => createSignInSchema(t), [t]);

  const methods = useForm<SignInSchemaType>({
    resolver: zodResolver(signInSchema),
    defaultValues,
  });

  // 저장된 아이디로 초기값 설정
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('savedEmail');
      if (saved) {
        saveId.onTrue();
        methods.setValue('email', saved);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hasMountedRef = useRef(false);

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }
    methods.trigger();
  }, [locale, methods]);

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      await signInWithPassword({ email: data.email, password: data.password });
      await checkUserSession?.();

      // 아이디 저장 처리
      if (saveId.value) {
        localStorage.setItem('savedEmail', data.email);
      } else {
        localStorage.removeItem('savedEmail');
      }

      router.refresh();
    } catch (error) {
      console.error(error);
      const feedbackMessage = getErrorMessage(error);
      setErrorMessage(feedbackMessage);
    }
  });

  const renderForm = () => (
    <Box sx={{ gap: 3, display: 'flex', flexDirection: 'column' }}>
      <Field.Text
        name="email"
        label={t('signIn.emailLabel')}
        slotProps={{
          inputLabel: { shrink: true, required: true },
        }}
      />

      <Box sx={{ gap: 1.5, display: 'flex', flexDirection: 'column' }}>
        <Field.Text
          name="password"
          label={t('signIn.passwordLabel')}
          placeholder={t('signIn.passwordPlaceholder')}
          type={showPassword.value ? 'text' : 'password'}
          slotProps={{
            inputLabel: { shrink: true, required: true },
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={showPassword.onToggle} edge="end">
                    <Iconify
                      icon={showPassword.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'}
                    />
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
          }}
        >
          <FormControlLabel
            control={
              <Checkbox
                checked={saveId.value}
                onChange={saveId.onToggle}
                size="small"
                sx={{ p: 1 }}
              />
            }
            label={t('signIn.saveId')}
            sx={{
              m: 0,
              '& .MuiFormControlLabel-label': {
                fontSize: 14,
                fontWeight: 400,
              },
            }}
          />

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Link
              component={RouterLink}
              href={paths.auth.jwt.findId}
              sx={{
                fontSize: 14,
                fontWeight: 600,
                color: 'primary.main',
                textDecoration: 'none',
                cursor: 'pointer',
                '&:hover': {
                  textDecoration: 'underline',
                },
              }}
            >
              {t('signIn.findId')}
            </Link>
            <Link
              component={RouterLink}
              href={paths.auth.jwt.resetPassword}
              sx={{
                fontSize: 14,
                fontWeight: 600,
                color: 'primary.main',
                textDecoration: 'none',
                cursor: 'pointer',
                '&:hover': {
                  textDecoration: 'underline',
                },
              }}
            >
              {t('signIn.resetPassword')}
            </Link>
          </Box>
        </Box>
      </Box>

      <Button
        fullWidth
        color="inherit"
        size="large"
        type="submit"
        variant="contained"
        loading={isSubmitting}
        loadingIndicator={t('signIn.loading')}
      >
        {t('signIn.submit')}
      </Button>
    </Box>
  );

  return (
    <>
      <FormHead title={t('signIn.title')} sx={{ textAlign: { xs: 'center', md: 'left' } }} />

      {!!errorMessage && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errorMessage}
        </Alert>
      )}

      <Form methods={methods} onSubmit={onSubmit}>
        {renderForm()}
      </Form>
    </>
  );
}
