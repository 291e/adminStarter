import { z as zod } from 'zod';
import { useState } from 'react';
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

import { getErrorMessage } from '../../utils';
import { FormHead } from '../../components/form-head';

// ----------------------------------------------------------------------

export type FindIdSchemaType = zod.infer<typeof FindIdSchema>;

export const FindIdSchema = zod.object({
  email: zod
    .string()
    .min(1, { message: '이메일을 입력해주세요.' })
    .email({ message: '올바른 이메일 주소를 입력해주세요.' }),
});

// ----------------------------------------------------------------------

export function JwtFindIdView() {
  const router = useRouter();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const defaultValues: FindIdSchemaType = {
    email: '',
  };

  const methods = useForm<FindIdSchemaType>({
    resolver: zodResolver(FindIdSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      setErrorMessage(null);

      // TODO: API 호출 - 인증 코드 전송
      // await sendVerificationCode({ email: data.email });

      // 인증 코드 입력 페이지로 이동
      router.push(
        `${paths.auth.jwt.verifyCode}?email=${encodeURIComponent(data.email)}&type=findId`
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
        name="email"
        label="이메일"
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
        loadingIndicator="전송 중..."
      >
        인증 코드 전송
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
            alt="아이디 찾기"
            src={`${CONFIG.assetsDir}/auth/jwt.svg`}
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        </Box>

        <FormHead title="아이디 찾기" sx={{ textAlign: { xs: 'center', md: 'left' } }} />

        <Typography
          variant="body2"
          sx={{
            fontSize: 14,
            lineHeight: '22px',
            color: 'text.secondary',
            textAlign: 'center',
            mt: 1.5,
            mb: 0,
          }}
        >
          등록한 이메일을 입력해 주세요.
          <br />
          해당 이메일로 인증코드를 보내드립니다.
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
          돌아가기
        </Link>
      </Box>
    </>
  );
}
