import { z as zod } from 'zod';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useBoolean } from 'minimal-shared/hooks';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
import CircularProgress from '@mui/material/CircularProgress';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import FormHelperText from '@mui/material/FormHelperText';

import { paths } from 'src/routes/paths';
import { useRouter, useSearchParams } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { Iconify } from 'src/components/iconify';
import { Form, Field } from 'src/components/hook-form';
import { Controller } from 'react-hook-form';

import { useAuthContext } from '../../hooks';
import { getErrorMessage } from '../../utils';
import { FormHead } from '../../components/form-head';
import {
  verifyInvitationCode,
  acceptInvitation,
} from 'src/services/organization/organization.service';
import type { AcceptInvitationParams } from 'src/services/organization/organization.types';

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

// ----------------------------------------------------------------------

export type SignUpSchemaType = zod.infer<typeof SignUpSchema>;

export const SignUpSchema = zod
  .object({
    memberId: zod.string().min(1, { message: '아이디를 입력해주세요.' }),
    password: zod
      .string()
      .min(1, { message: '비밀번호를 입력해주세요.' })
      .min(6, { message: '비밀번호는 최소 6자 이상이어야 합니다.' })
      .max(10, { message: '비밀번호는 10자 이내여야 합니다.' })
      .regex(/^[a-zA-Z0-9]+$/, {
        message: '영문 소문자, 대문자, 숫자만 사용 가능합니다.',
      }),
    confirmPassword: zod.string().min(1, { message: '비밀번호 확인을 입력해주세요.' }),
    memberName: zod.string().min(1, { message: '이름을 입력해주세요.' }),
    memberPhone: zod.string().min(1, { message: '핸드폰 번호를 입력해주세요.' }),
    memberLang: zod.string().min(1, { message: '국적을 선택해주세요.' }),
    memberNameOrg: zod.string().optional(),
    agreeToTerms: zod.boolean().refine((val) => val === true, {
      message: '이용약관에 동의해주세요.',
    }),
    agreeToPrivacy: zod.boolean().refine((val) => val === true, {
      message: '개인정보처리방침에 동의해주세요.',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: '비밀번호가 일치하지 않습니다.',
    path: ['confirmPassword'],
  });

// ----------------------------------------------------------------------

export function JwtSignUpView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const invitationCode = searchParams.get('code');

  const showPassword = useBoolean();
  const showConfirmPassword = useBoolean();

  const { checkUserSession } = useAuthContext();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 초대 코드 검증 (초대 정보 표시용)
  const { data: verifyData, isLoading: isLoadingVerify } = useQuery({
    queryKey: ['verifyInvitationCode', invitationCode],
    queryFn: () => verifyInvitationCode({ code: invitationCode! }),
    enabled: !!invitationCode,
    retry: false,
  });

  const defaultValues: SignUpSchemaType = {
    memberId: '',
    password: '',
    confirmPassword: '',
    memberName: '',
    memberPhone: '',
    memberLang: 'ko', // 기본값: 한국
    memberNameOrg: '',
    agreeToTerms: false,
    agreeToPrivacy: false,
  };

  const methods = useForm<SignUpSchemaType>({
    resolver: zodResolver(SignUpSchema),
    defaultValues,
  });

  const { handleSubmit } = methods;

  // 핸드폰 번호 포맷팅 함수
  const formatPhoneNumber = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.startsWith('02')) {
      if (digits.length <= 2) return digits;
      if (digits.length <= 5) return `${digits.slice(0, 2)}-${digits.slice(2)}`;
      const middle = digits.slice(2, digits.length - 4);
      const last = digits.slice(-4);
      return `${digits.slice(0, 2)}-${middle}-${last}`;
    }
    if (digits.length <= 3) return digits;
    if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    const middle = digits.slice(3, digits.length - 4);
    const last = digits.slice(-4);
    return `${digits.slice(0, 3)}-${middle}-${last}`;
  };

  // 초대 정보가 있으면 이메일을 기본값으로 설정
  useEffect(() => {
    // axios 인터셉터가 평탄화하므로 data에 직접 접근
    const invitation = (verifyData as any)?.invitation ?? verifyData?.body?.invitation;
    if (invitation?.invitedEmail) {
      const email = invitation.invitedEmail;
      // 이메일에서 @ 앞부분을 아이디 기본값으로 사용
      const defaultId = email.split('@')[0];
      methods.setValue('memberId', defaultId);
    }
  }, [verifyData, methods]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (!invitationCode) {
        setErrorMessage('초대 코드가 필요합니다. 초대 링크를 통해 접근해주세요.');
        return;
      }

      setIsSubmitting(true);
      setErrorMessage(null);

      // 초대 수락 및 가입 API 호출
      const params: AcceptInvitationParams = {
        code: invitationCode,
        memberId: data.memberId,
        memberName: data.memberName,
        memberLang: data.memberLang,
        password: data.password,
        ...(data.memberPhone && { memberPhone: data.memberPhone }),
        ...(data.memberNameOrg && { memberNameOrg: data.memberNameOrg }),
      };

      const response = await acceptInvitation(params);

      // 로그인 처리 (토큰 저장)
      if (response.body?.accessToken && response.body?.refreshToken) {
        localStorage.setItem('accessToken', response.body.accessToken);
        localStorage.setItem('refreshToken', response.body.refreshToken);
      }

      await checkUserSession?.();

      // 회원가입 성공 후 로그인 페이지로 리다이렉트
      router.push(paths.auth.jwt.signIn);
    } catch (error) {
      console.error(error);
      const feedbackMessage = getErrorMessage(error);
      setErrorMessage(feedbackMessage);
    } finally {
      setIsSubmitting(false);
    }
  });

  const renderForm = () => {
    // axios 인터셉터가 평탄화하므로 data에 직접 접근
    const invitation = (verifyData as any)?.invitation ?? verifyData?.body?.invitation;
    const { watch } = methods;
    const memberId = watch('memberId');

    return (
      <Box sx={{ gap: 3, display: 'flex', flexDirection: 'column' }}>
        {/* 헤더 정보 (읽기 전용) */}
        {invitation && (
          <Stack spacing={2}>
            <TextField
              label="회사명"
              value={invitation.companyName || ''}
              disabled
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              label="역할"
              value={getRoleLabel(invitation.memberRole || '')}
              disabled
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              label="이메일"
              value={invitation.invitedEmail || ''}
              disabled
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Stack>
        )}

        {/* 아이디 필드 (중복검사 버튼 포함) */}
        <Field.Text
          name="memberId"
          label="아이디*"
          placeholder="아이디*"
          slotProps={{
            inputLabel: { shrink: true },
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      // TODO: 중복검사 API 호출
                      console.log('중복검사:', memberId);
                    }}
                  >
                    중복검사
                  </Button>
                </InputAdornment>
              ),
            },
          }}
        />

        {/* 비밀번호 필드 (한 줄로 배치) */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Field.Text
              name="password"
              label="비밀번호*"
              placeholder="비밀번호*"
              type={showPassword.value ? 'text' : 'password'}
              slotProps={{
                inputLabel: { shrink: true },
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
            <FormHelperText sx={{ mt: 0.5, fontSize: 11 }}>
              - 10자 이내의 영문 소문자, 대문자, 숫자
            </FormHelperText>
          </Box>
          <Box sx={{ flex: 1 }}>
            <Field.Text
              name="confirmPassword"
              label="비밀번호 확인*"
              placeholder="비밀번호 확인*"
              type={showConfirmPassword.value ? 'text' : 'password'}
              slotProps={{
                inputLabel: { shrink: true },
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={showConfirmPassword.onToggle} edge="end">
                        <Iconify
                          icon={
                            showConfirmPassword.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'
                          }
                        />
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Box>
        </Box>

        {/* 한글 이름 필드 */}
        <Field.Text
          name="memberName"
          label="한글 이름*"
          placeholder="한글 이름을 입력해주세요"
          slotProps={{ inputLabel: { shrink: true } }}
        />

        {/* 핸드폰 번호 필드 (자동 하이픈 처리) */}
        <Controller
          name="memberPhone"
          control={methods.control}
          render={({ field, fieldState: { error } }) => (
            <TextField
              {...field}
              fullWidth
              label="핸드폰 번호*"
              placeholder="핸드폰 번호를 입력해주세요"
              error={!!error}
              helperText={error?.message}
              slotProps={{
                inputLabel: { shrink: true },
                htmlInput: {
                  inputMode: 'numeric',
                  maxLength: 13, // 010-1234-5678 형식 (하이픈 포함)
                },
              }}
              onChange={(e) => {
                const formatted = formatPhoneNumber(e.target.value);
                field.onChange(formatted);
              }}
            />
          )}
        />

        {/* 국적 필드 */}
        <Field.Select name="memberLang" label="국적" slotProps={{ inputLabel: { shrink: true } }}>
          <MenuItem value="ko">한국</MenuItem>
          <MenuItem value="zh">중국</MenuItem>
          <MenuItem value="vi">베트남</MenuItem>
          <MenuItem value="en">영어</MenuItem>
          <MenuItem value="ne">네팔</MenuItem>
        </Field.Select>

        {/* 원어 이름 필드 */}
        <Field.Text
          name="memberNameOrg"
          label="원어 이름"
          placeholder="원어 이름을 입력해주세요"
          slotProps={{ inputLabel: { shrink: true } }}
        />

        {/* 약관 동의 체크박스 */}
        <Stack>
          <Field.Checkbox
            name="agreeToTerms"
            label="이용약관 동의"
            slotProps={{
              checkbox: { size: 'small' },
            }}
          />
          <Field.Checkbox
            name="agreeToPrivacy"
            label="개인정보처리방침 동의"
            slotProps={{
              checkbox: { size: 'small' },
            }}
          />
        </Stack>

        {/* 가입하기 버튼 */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Button
            variant="contained"
            color="inherit"
            size="medium"
            type="submit"
            disabled={isSubmitting || isLoadingVerify}
            sx={{ minWidth: 120 }}
          >
            {isSubmitting ? '가입 중...' : '가입하기'}
          </Button>
        </Box>
      </Box>
    );
  };

  if (!invitationCode) {
    return (
      <>
        <FormHead
          title="초대 코드가 필요합니다"
          description="초대 링크를 통해 접근해주세요."
          sx={{ textAlign: { xs: 'center', md: 'left' } }}
        />
        <Alert severity="error" sx={{ mb: 3 }}>
          초대 코드가 없습니다. 초대 링크를 통해 접근해주세요.
        </Alert>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Link component={RouterLink} href={paths.auth.jwt.signIn} variant="subtitle2">
            로그인 페이지로 이동
          </Link>
        </Box>
      </>
    );
  }

  if (isLoadingVerify) {
    return (
      <>
        <FormHead
          title="초대 정보 확인 중"
          description="초대 정보를 확인하고 있습니다."
          sx={{ textAlign: { xs: 'center', md: 'left' } }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      </>
    );
  }

  // axios 인터셉터가 평탄화하므로 data에 직접 접근
  const isValid = (verifyData as any)?.isValid ?? verifyData?.body?.isValid;
  const invitation = (verifyData as any)?.invitation ?? verifyData?.body?.invitation;

  if (!isValid || !invitation) {
    return (
      <>
        <FormHead
          title="초대 링크 오류"
          description="초대 링크가 유효하지 않거나 만료되었습니다."
          sx={{ textAlign: { xs: 'center', md: 'left' } }}
        />
        <Alert severity="error" sx={{ mb: 3 }}>
          초대 링크가 유효하지 않거나 만료되었습니다.
        </Alert>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Link component={RouterLink} href={paths.auth.jwt.signIn} variant="subtitle2">
            로그인 페이지로 이동
          </Link>
        </Box>
      </>
    );
  }

  return (
    <>
      <FormHead title="회원 가입" sx={{ textAlign: { xs: 'center', md: 'left' } }} />

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
