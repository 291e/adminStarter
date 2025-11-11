import { z as zod } from 'zod';
import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSearchParams } from 'react-router';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';
import { CONFIG } from 'src/global-config';

import { Iconify } from 'src/components/iconify';
import { Form } from 'src/components/hook-form';

import { getErrorMessage } from '../../utils';
import { FormHead } from '../../components/form-head';

// ----------------------------------------------------------------------

export type VerifyCodeSchemaType = zod.infer<typeof VerifyCodeSchema>;

export const VerifyCodeSchema = zod.object({
  code: zod
    .string()
    .min(6, { message: '인증 코드 6자리를 입력해주세요.' })
    .max(6, { message: '인증 코드는 6자리입니다.' }),
});

// ----------------------------------------------------------------------

export function JwtVerifyCodeView() {
  const router = useRouter();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || 'example@gmail.com';
  const type = searchParams.get('type') || 'findId'; // findId 또는 resetPassword

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [codeValues, setCodeValues] = useState<string[]>(['', '', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(300); // 5분 = 300초
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const defaultValues: VerifyCodeSchemaType = {
    code: '',
  };

  const methods = useForm<VerifyCodeSchemaType>({
    resolver: zodResolver(VerifyCodeSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  // 타이머
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
    return undefined;
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // 인증 코드 입력 핸들러
  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value.slice(-1); // 마지막 문자만 사용
    }

    const newValues = [...codeValues];
    newValues[index] = value;
    setCodeValues(newValues);

    // 전체 코드를 form에 업데이트
    const fullCode = newValues.join('');
    methods.setValue('code', fullCode);

    // 다음 입력 필드로 포커스 이동
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !codeValues[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    const newValues = [...codeValues];
    for (let i = 0; i < 6; i++) {
      newValues[i] = pastedData[i] || '';
    }
    setCodeValues(newValues);
    const fullCode = newValues.join('');
    methods.setValue('code', fullCode);
    inputRefs.current[Math.min(pastedData.length, 5)]?.focus();
  };

  const onSubmit = handleSubmit(async (data) => {
    try {
      setErrorMessage(null);

      // TODO: API 호출 - 인증 코드 확인
      // await verifyCode({ email, code: data.code });

      // 임시 로직: 111111은 성공, 그 외는 실패
      if (data.code === '111111') {
        // 성공 시 타입에 따라 적절한 페이지로 이동
        if (type === 'findId') {
          // 아이디 찾기 성공 페이지로 이동 (실제 아이디는 API 응답에서 받아올 것)
          router.push(`${paths.auth.jwt.findIdSuccess}?email=${encodeURIComponent(email)}`);
        } else if (type === 'resetPassword') {
          // 비밀번호 재설정 페이지로 이동
          router.push(`${paths.auth.jwt.resetPasswordNew}?email=${encodeURIComponent(email)}`);
        }
      } else {
        // 실패 시 타입에 따라 적절한 페이지로 이동
        if (type === 'findId') {
          router.push(`${paths.auth.jwt.findIdFail}?email=${encodeURIComponent(email)}`);
        } else if (type === 'resetPassword') {
          // TODO: 비밀번호 재설정 실패 페이지로 이동
          // router.push(`${paths.auth.jwt.resetPasswordFail}?email=${encodeURIComponent(email)}`);
        }
      }
    } catch (error) {
      console.error(error);
      const feedbackMessage = getErrorMessage(error);
      setErrorMessage(feedbackMessage);
    }
  });

  const handleResend = () => {
    // TODO: API 호출 - 인증 코드 재전송
    // await resendVerificationCode({ email });
    setTimeLeft(300); // 타이머 리셋
    setCodeValues(['', '', '', '', '', '']);
    methods.setValue('code', '');
    inputRefs.current[0]?.focus();
  };

  const renderForm = () => (
    <Box sx={{ gap: 3, display: 'flex', flexDirection: 'column' }}>
      {/* 이메일 필드 (비활성화) */}
      <TextField
        label="이메일"
        value={email}
        disabled
        fullWidth
        slotProps={{
          inputLabel: { shrink: true, required: true },
        }}
        sx={{
          '& .MuiInputBase-root': {
            bgcolor: 'grey.200',
          },
        }}
      />

      {/* 인증 코드 입력 필드 */}
      <Box>
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            justifyContent: 'space-between',
            mb: 2,
          }}
        >
          {codeValues.map((value, index) => (
            <TextField
              key={index}
              inputRef={(el) => {
                inputRefs.current[index] = el;
              }}
              value={value}
              onChange={(e) => handleCodeChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e as React.KeyboardEvent<HTMLInputElement>)}
              onPaste={index === 0 ? handlePaste : undefined}
              placeholder={value ? '' : '-'}
              inputProps={{
                maxLength: 1,
                style: {
                  textAlign: 'center',
                  fontSize: 14,
                  fontWeight: 400,
                  padding: 0,
                },
              }}
              slotProps={{
                inputLabel: { shrink: false },
              }}
              sx={{
                flex: 1,
                '& .MuiOutlinedInput-root': {
                  aspectRatio: '53.33/53.33',
                  minHeight: 53.33,
                  height: 53.33,
                  '& input': {
                    textAlign: 'center',
                    fontSize: 14,
                    fontWeight: 400,
                  },
                  '& input::placeholder': {
                    color: 'text.disabled',
                    opacity: 1,
                  },
                },
              }}
            />
          ))}
        </Box>

        {/* 타이머 */}
        <Typography
          variant="subtitle2"
          sx={{
            textAlign: 'center',
            color: 'grey.600',
            fontSize: 14,
            fontWeight: 600,
            mb: 2,
          }}
        >
          {formatTime(timeLeft)}
        </Typography>
      </Box>

      <Button
        fullWidth
        color="inherit"
        size="large"
        type="submit"
        variant="contained"
        loading={isSubmitting}
        loadingIndicator="확인 중..."
      >
        확인
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
            width: 104,
            height: 104,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 2,
          }}
        >
          <img
            alt="인증 코드"
            src={`${CONFIG.assetsDir}/auth/jwt5.svg`}
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        </Box>

        <FormHead
          title="인증번호가 전송되었습니다."
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
            maxWidth: 380,
          }}
        >
          입력하신 이메일로 전송된 인증 코드 6자리를 입력해 주세요.
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

      {/* 인증 코드 재전송 */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5, mt: 3 }}>
        <Typography variant="body2" sx={{ fontSize: 14, color: 'text.primary' }}>
          인증코드를 받지 못하셨나요?
        </Typography>
        <Link
          component="button"
          type="button"
          onClick={handleResend}
          sx={{
            fontSize: 14,
            fontWeight: 600,
            color: 'primary.main',
            textDecoration: 'underline',
            cursor: 'pointer',
            border: 'none',
            background: 'none',
            padding: 0,
            '&:hover': {
              textDecoration: 'underline',
            },
          }}
        >
          인증 코드 재전송
        </Link>
      </Box>

      {/* 돌아가기 링크 */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
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
