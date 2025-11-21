import { z as zod } from 'zod';
import { useState, useEffect } from 'react';
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

// ----------------------------------------------------------------------

export type SignInSchemaType = zod.infer<typeof SignInSchema>;

export const SignInSchema = zod.object({
  email: zod.string().min(1, { message: 'Email is required!' }),
  password: zod
    .string()
    .min(1, { message: 'Password is required!' })
    .min(6, { message: 'Password must be at least 6 characters!' }),
});

// ----------------------------------------------------------------------

export function JwtSignInView() {
  const router = useRouter();

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
    return 'member10';
  };

  const defaultValues: SignInSchemaType = {
    email: getSavedEmail(),
    password: 'Safeyou123!',
  };

  const methods = useForm<SignInSchemaType>({
    resolver: zodResolver(SignInSchema),
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
        label="아이디"
        slotProps={{
          inputLabel: { shrink: true, required: true },
        }}
      />

      <Box sx={{ gap: 1.5, display: 'flex', flexDirection: 'column' }}>
        <Field.Text
          name="password"
          label="비밀번호"
          placeholder="6+ characters"
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
            label="아이디 저장"
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
              아이디 찾기
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
              비밀번호 재설정
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
        loadingIndicator="로그인 중..."
      >
        로그인
      </Button>
    </Box>
  );

  return (
    <>
      <FormHead title="로그인" sx={{ textAlign: { xs: 'center', md: 'left' } }} />

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
