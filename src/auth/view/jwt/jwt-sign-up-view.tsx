import { z as zod } from 'zod';
import { useState, useEffect, useMemo, useRef } from 'react';
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
import Typography from '@mui/material/Typography';
import FormHelperText from '@mui/material/FormHelperText';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

import { paths } from 'src/routes/paths';
import { useRouter, useSearchParams } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { Iconify } from 'src/components/iconify';
import { Form, Field } from 'src/components/hook-form';
import { Controller } from 'react-hook-form';

import { useAuthContext } from '../../hooks';
import { getErrorMessage } from '../../utils';
import { FormHead } from '../../components/form-head';
import TermsModal from '../../components/TermsModal';
import { setSession } from '../../context/jwt';
import {
  verifyInvitationCode,
  acceptInvitation,
} from 'src/services/organization/organization.service';
import type { AcceptInvitationParams } from 'src/services/organization/organization.types';
import { checkId } from 'src/services/member/member.service';
import { useAuthI18n } from '../../i18n/auth-i18n';

// ----------------------------------------------------------------------

// 역할 한글 맵핑 함수
const getRoleLabel = (role: string, t: (key: string) => string): string => {
  if (!role) return '';

  const roleUpper = role.toUpperCase();
  const roleMap: { [key: string]: string } = {
    OPERATOR_MANAGER: t('roles.operatorManager'),
    MANAGEMENT_SUPERVISOR: t('roles.managementSupervisor'),
    SAFETY_MANAGER: t('roles.safetyManager'),
    WORKER: t('roles.worker'),
    ADMIN: t('roles.operatorManager'),
    MEMBER: t('roles.worker'),
    // 소문자 키 (하위 호환성)
    operator_manager: t('roles.operatorManager'),
    management_supervisor: t('roles.managementSupervisor'),
    safety_manager: t('roles.safetyManager'),
    worker: t('roles.worker'),
    admin: t('roles.operatorManager'),
    member: t('roles.worker'),
  };

  return roleMap[roleUpper] || roleMap[role] || role;
};

// ----------------------------------------------------------------------

export type SignUpSchemaType = {
  memberId: string;
  password: string;
  confirmPassword: string;
  memberName: string;
  memberPhone: string;
  memberLang: string;
  memberNameOrg?: string;
  department?: string;
  joinedAt?: any;
  agreeToTerms: boolean;
  agreeToPrivacy: boolean;
};

const createSignUpSchema = (t: (key: string) => string) =>
  zod
    .object({
      memberId: zod.string().min(1, { message: t('signUp.validation.idRequired') }),
      password: zod
        .string()
        .min(1, { message: t('signUp.validation.passwordRequired') })
        .min(6, { message: t('signUp.validation.passwordMin') })
        .max(10, { message: t('signUp.validation.passwordMax') })
        .regex(/^[a-zA-Z0-9]+$/, {
          message: t('signUp.validation.passwordRegex'),
        }),
      confirmPassword: zod
        .string()
        .min(1, { message: t('signUp.validation.confirmPasswordRequired') }),
      memberName: zod.string().min(1, { message: t('signUp.validation.nameRequired') }),
      memberPhone: zod.string().min(1, { message: t('signUp.validation.phoneRequired') }),
      memberLang: zod.string().min(1, { message: t('signUp.validation.nationalityRequired') }),
      memberNameOrg: zod.string().optional(),
      department: zod.string().optional(),
      joinedAt: zod.any().optional(), // Dayjs 객체
      agreeToTerms: zod.boolean().refine((val) => val === true, {
        message: t('signUp.validation.agreeTerms'),
      }),
      agreeToPrivacy: zod.boolean().refine((val) => val === true, {
        message: t('signUp.validation.agreePrivacy'),
      }),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t('signUp.validation.passwordMismatch'),
      path: ['confirmPassword'],
    });

// ----------------------------------------------------------------------

export function JwtSignUpView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const invitationCode = searchParams.get('code');
  const { t, locale } = useAuthI18n();

  const showPassword = useBoolean();
  const showConfirmPassword = useBoolean();

  const { checkUserSession } = useAuthContext();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [termsModalOpen, setTermsModalOpen] = useState(false);
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false);
  const [isCheckingId, setIsCheckingId] = useState(false);
  const [idCheckMessage, setIdCheckMessage] = useState<string | null>(null);
  const [isIdAvailable, setIsIdAvailable] = useState<boolean | null>(null);

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
    department: '',
    joinedAt: null,
    agreeToTerms: false,
    agreeToPrivacy: false,
  };

  const signUpSchema = useMemo(() => createSignUpSchema(t), [t]);

  const methods = useForm<SignUpSchemaType>({
    resolver: zodResolver(signUpSchema),
    defaultValues,
  });

  const { handleSubmit } = methods;

  const hasMountedRef = useRef(false);

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }

    if (methods.formState.isSubmitted) {
      methods.trigger();
    }
  }, [locale, methods]);

  // 폼 검증 실패 시 경고 표시 핸들러
  const onError = (errors: any) => {
    const errorMessages: string[] = [];

    // 필수 필드 검증
    if (errors.memberId) {
      errorMessages.push(`• ${errors.memberId.message || t('signUp.validation.idRequired')}`);
    }
    if (errors.password) {
      errorMessages.push(`• ${errors.password.message || t('signUp.validation.passwordRequired')}`);
    }
    if (errors.confirmPassword) {
      errorMessages.push(
        `• ${errors.confirmPassword.message || t('signUp.validation.confirmPasswordRequired')}`
      );
    }
    if (errors.memberName) {
      errorMessages.push(`• ${errors.memberName.message || t('signUp.validation.nameRequired')}`);
    }
    if (errors.memberPhone) {
      errorMessages.push(`• ${errors.memberPhone.message || t('signUp.validation.phoneRequired')}`);
    }
    if (errors.memberLang) {
      errorMessages.push(
        `• ${errors.memberLang.message || t('signUp.validation.nationalityRequired')}`
      );
    }

    // 체크박스 검증
    if (errors.agreeToTerms) {
      errorMessages.push(`• ${errors.agreeToTerms.message || t('signUp.validation.agreeTerms')}`);
    }
    if (errors.agreeToPrivacy) {
      errorMessages.push(
        `• ${errors.agreeToPrivacy.message || t('signUp.validation.agreePrivacy')}`
      );
    }

    if (errorMessages.length > 0) {
      setErrorMessage(`${t('signUp.validation.checkListTitle')}\n${errorMessages.join('\n')}`);
    }
  };

  // 아이디 중복검사 핸들러
  const handleCheckId = async () => {
    const memberId = methods.getValues('memberId');
    if (!memberId || memberId.trim() === '') {
      setIdCheckMessage(t('signUp.checkIdMissing'));
      setIsIdAvailable(false);
      return;
    }

    setIsCheckingId(true);
    setIdCheckMessage(null);
    setIsIdAvailable(null);

    try {
      const response = await checkId({ memberId });
      // axios 인터셉터가 평탄화하므로 data에 직접 접근
      const data = (response as any)?.body ?? response;
      setIsIdAvailable(data.isAvailable);
      setIdCheckMessage(data.message);
    } catch (error) {
      console.error('아이디 중복검사 실패:', error);
      setIsIdAvailable(false);
      setIdCheckMessage(t('signUp.checkIdFail'));
    } finally {
      setIsCheckingId(false);
    }
  };

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

  // 초대 정보가 있으면 이메일 및 초대 시 저장된 정보를 기본값으로 설정
  useEffect(() => {
    // axios 인터셉터가 평탄화하므로 data에 직접 접근
    const invitation = (verifyData as any)?.invitation ?? verifyData?.body?.invitation;
    if (invitation) {
      // 이메일에서 @ 앞부분을 아이디 기본값으로 사용
      if (invitation.invitedEmail) {
        const email = invitation.invitedEmail;
        const defaultId = email.split('@')[0];
        methods.setValue('memberId', defaultId);
      }

      // 초대 시 저장된 정보를 기본값으로 설정 (API 응답에 직접 포함됨)
      if (invitation.memberName) {
        methods.setValue('memberName', invitation.memberName);
      }
      if (invitation.department) {
        methods.setValue('department', invitation.department);
      }
      if (invitation.joinedAt) {
        const joinedAtDate = dayjs(invitation.joinedAt);
        if (joinedAtDate.isValid()) {
          methods.setValue('joinedAt', joinedAtDate);
        }
      }

      // 하위 호환성: description JSON 파싱 (새 API 응답에 필드가 없을 경우)
      if (!invitation.memberName && invitation.description) {
        try {
          const metaInfo = JSON.parse(invitation.description);
          if (metaInfo.memberName) {
            methods.setValue('memberName', metaInfo.memberName);
          }
          if (metaInfo.department) {
            methods.setValue('department', metaInfo.department);
          }
          if (metaInfo.joinedAt) {
            const joinedAtDate = dayjs(metaInfo.joinedAt);
            if (joinedAtDate.isValid()) {
              methods.setValue('joinedAt', joinedAtDate);
            }
          }
        } catch (error) {
          console.warn('초대 메타 정보 파싱 실패:', error);
        }
      }
    }
  }, [verifyData, methods]);

  const onSubmit = handleSubmit(
    async (data) => {
      try {
        if (!invitationCode) {
          setErrorMessage(`${t('signUp.inviteRequiredTitle')} ${t('signUp.inviteRequiredDesc')}`);
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
          ...(data.department && { department: data.department }),
          ...(data.joinedAt &&
            dayjs.isDayjs(data.joinedAt) && { joinedAt: data.joinedAt.format('YYYY-MM-DD') }),
        };

        const response = await acceptInvitation(params);

        // 로그인 처리 (토큰 저장)
        // axios 인터셉터가 평탄화하므로 data에 직접 접근
        const responseData = (response as any)?.body ?? response;
        if (responseData?.accessToken && responseData?.refreshToken) {
          await setSession(responseData.accessToken, responseData.refreshToken);
        }

        await checkUserSession?.();

        // 회원가입 성공 후 리다이렉트
        // memberRole이 WORKER이면 safeyou365.com으로, 그 외에는 로그인 페이지로
        // axios 인터셉터가 평탄화하므로 invitation도 직접 접근
        const invitationData = (verifyData as any)?.invitation ?? verifyData?.body?.invitation;
        const memberRole = responseData?.memberRole || invitationData?.memberRole;

        if (memberRole === 'WORKER') {
          // WORKER 역할이면 외부 사이트로 리다이렉트
          window.location.href = 'https://safeyou365.com';
        } else {
          // 그 외 역할이면 로그인 페이지로 리다이렉트
          router.push(paths.auth.jwt.signIn);
        }
      } catch (error) {
        console.error(error);
        const feedbackMessage = getErrorMessage(error);
        setErrorMessage(feedbackMessage);
      } finally {
        setIsSubmitting(false);
      }
    },
    onError // 검증 실패 시 호출
  );

  const renderForm = () => {
    // axios 인터셉터가 평탄화하므로 data에 직접 접근
    const invitation = (verifyData as any)?.invitation ?? verifyData?.body?.invitation;
    const { watch } = methods;
    const memberId = watch('memberId');

    // 직종 한글 변환 함수
    const getWorkTypeLabel = (workType?: string) => {
      if (!workType) return '';
      return workType === 'PRODUCTION'
        ? t('signUp.workTypeProduction')
        : t('signUp.workTypeOffice');
    };

    return (
      <Box sx={{ gap: 2, display: 'flex', flexDirection: 'column' }}>
        {/* 헤더 정보 (읽기 전용, 2개씩 한 줄) */}
        {invitation && (
          <Stack spacing={2}>
            {/* 회사명 + 이메일 */}
            <Stack direction="row" spacing={2}>
              <TextField
                label={t('signUp.companyName')}
                value={invitation.companyName || ''}
                disabled
                fullWidth
                variant="filled"
                slotProps={{ inputLabel: { shrink: true } }}
                size="small"
              />
              <TextField
                label={t('signUp.invitedEmail')}
                value={invitation.invitedEmail || ''}
                disabled
                fullWidth
                variant="filled"
                slotProps={{ inputLabel: { shrink: true } }}
                size="small"
              />
            </Stack>

            {/* 소속팀 + 역할 */}
            <Stack direction="row" spacing={2}>
              <TextField
                label={t('signUp.department')}
                value={invitation.department || ''}
                disabled
                fullWidth
                variant="filled"
                slotProps={{ inputLabel: { shrink: true } }}
                size="small"
              />
              <TextField
                label={t('signUp.role')}
                value={getRoleLabel(invitation.memberRole || '', t)}
                disabled
                fullWidth
                variant="filled"
                slotProps={{ inputLabel: { shrink: true } }}
                size="small"
              />
            </Stack>

            {/* 직종 + 입사일 */}
            <Stack direction="row" spacing={2}>
              <TextField
                label={t('signUp.workType')}
                value={getWorkTypeLabel(invitation.workType)}
                disabled
                fullWidth
                variant="filled"
                slotProps={{ inputLabel: { shrink: true } }}
                size="small"
              />
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label={t('signUp.joinedAt')}
                  value={invitation.joinedAt ? dayjs(invitation.joinedAt) : null}
                  disabled
                  format="YYYY-MM-DD"
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      variant: 'filled',
                      slotProps: {
                        inputLabel: { shrink: true },
                      },
                      size: 'small',
                    },
                  }}
                />
              </LocalizationProvider>
            </Stack>
          </Stack>
        )}

        {/* 안내 문구 */}
        <Typography
          variant="subtitle2"
          sx={{ fontWeight: 600, fontSize: 14, color: 'text.primary' }}
        >
          {t('signUp.guide')}
        </Typography>

        {/* 아이디 필드 (중복검사 버튼 포함, 전체 너비) */}
        <Box>
          <Controller
            name="memberId"
            control={methods.control}
            render={({ field, fieldState: { error } }) => (
              <TextField
                {...field}
                fullWidth
                variant="outlined"
                placeholder={t('signUp.memberIdPlaceholder')}
                error={!!error || isIdAvailable === false}
                helperText={
                  error?.message ||
                  (idCheckMessage && (
                    <Box
                      component="span"
                      sx={{
                        color: isIdAvailable ? 'success.main' : 'error.main',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                      }}
                    >
                      {idCheckMessage}
                    </Box>
                  ))
                }
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
                            handleCheckId();
                          }}
                          disabled={isCheckingId || !memberId || memberId.trim() === ''}
                          sx={{ minHeight: 36, fontSize: 14 }}
                        >
                          {isCheckingId ? t('signUp.checkingId') : t('signUp.checkId')}
                        </Button>
                      </InputAdornment>
                    ),
                  },
                }}
                size="medium"
                onChange={(e) => {
                  field.onChange(e);
                  // 아이디 변경 시 중복검사 결과 초기화
                  if (idCheckMessage) {
                    setIdCheckMessage(null);
                    setIsIdAvailable(null);
                  }
                }}
              />
            )}
          />
          <FormHelperText sx={{ fontSize: 10, display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Iconify icon="solar:info-circle-bold" width={10} sx={{ color: 'text.secondary' }} />
            {t('signUp.idCheckHelp')}
          </FormHelperText>
        </Box>

        {/* 비밀번호 필드 (2개 한 줄) */}
        <Stack direction="row" spacing={2}>
          <Box sx={{ flex: 1 }}>
            <Controller
              name="password"
              control={methods.control}
              render={({ field, fieldState: { error } }) => (
                <TextField
                  {...field}
                  fullWidth
                  variant="outlined"
                  placeholder={t('signUp.passwordPlaceholder')}
                  type={showPassword.value ? 'text' : 'password'}
                  error={!!error}
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
                  size="medium"
                />
              )}
            />
            <FormHelperText sx={{ fontSize: 10, display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Iconify icon="solar:info-circle-bold" width={10} sx={{ color: 'text.secondary' }} />
              {t('signUp.passwordHint')}
            </FormHelperText>
          </Box>
          <Box sx={{ flex: 1 }}>
            <Controller
              name="confirmPassword"
              control={methods.control}
              render={({ field, fieldState: { error } }) => (
                <TextField
                  {...field}
                  fullWidth
                  variant="outlined"
                  placeholder={t('signUp.confirmPasswordPlaceholder')}
                  type={showConfirmPassword.value ? 'text' : 'password'}
                  error={!!error}
                  helperText={error?.message}
                  slotProps={{
                    inputLabel: { shrink: true },
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={showConfirmPassword.onToggle} edge="end">
                            <Iconify
                              icon={
                                showConfirmPassword.value
                                  ? 'solar:eye-bold'
                                  : 'solar:eye-closed-bold'
                              }
                            />
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                  size="medium"
                />
              )}
            />
          </Box>
        </Stack>

        {/* 한글 이름 + 핸드폰 번호 (2개 한 줄) */}
        <Stack direction="row" spacing={2}>
          <Controller
            name="memberName"
            control={methods.control}
            render={({ field, fieldState: { error } }) => (
              <TextField
                {...field}
                fullWidth
                variant="outlined"
                placeholder={t('signUp.memberNamePlaceholder')}
                error={!!error}
                helperText={error?.message}
                slotProps={{
                  inputLabel: { shrink: true },
                }}
                size="medium"
              />
            )}
          />
          <Controller
            name="memberPhone"
            control={methods.control}
            render={({ field, fieldState: { error } }) => (
              <TextField
                {...field}
                fullWidth
                variant="outlined"
                placeholder={t('signUp.memberPhonePlaceholder')}
                error={!!error}
                helperText={error?.message}
                slotProps={{
                  inputLabel: { shrink: true },
                  htmlInput: {
                    inputMode: 'numeric',
                    maxLength: 13,
                  },
                }}
                onChange={(e) => {
                  const formatted = formatPhoneNumber(e.target.value);
                  field.onChange(formatted);
                }}
                size="medium"
              />
            )}
          />
        </Stack>

        {/* 국적 + 원어 이름 (2개 한 줄) */}
        <Stack direction="row" spacing={2}>
          <Field.Select
            name="memberLang"
            label={t('signUp.nationalityLabel')}
            slotProps={{ inputLabel: { shrink: true } }}
            sx={{
              '& .MuiOutlinedInput-root': {
                height: 56,
                '& input': {
                  py: 2,
                  fontSize: 15,
                  lineHeight: '24px',
                },
              },
            }}
          >
            <MenuItem value="ko">{t('signUp.nationality.ko')}</MenuItem>
            <MenuItem value="zh">{t('signUp.nationality.zh')}</MenuItem>
            <MenuItem value="vi">{t('signUp.nationality.vi')}</MenuItem>
            <MenuItem value="en">{t('signUp.nationality.en')}</MenuItem>
            <MenuItem value="ne">{t('signUp.nationality.ne')}</MenuItem>
            <MenuItem value="uz">{t('signUp.nationality.uz')}</MenuItem>
            <MenuItem value="th">{t('signUp.nationality.th')}</MenuItem>
            <MenuItem value="km">{t('signUp.nationality.km')}</MenuItem>
          </Field.Select>
          <Field.Text
            name="memberNameOrg"
            label={t('signUp.nativeNameLabel')}
            placeholder={t('signUp.nativeNamePlaceholder')}
            slotProps={{ inputLabel: { shrink: true } }}
            sx={{
              '& .MuiOutlinedInput-root': {
                height: 56,
                '& input': {
                  py: 2,
                  fontSize: 15,
                  lineHeight: '24px',
                },
                '& input::placeholder': {
                  color: 'text.disabled',
                  opacity: 1,
                },
              },
            }}
          />
        </Stack>

        {/* 약관 동의 체크박스 */}
        <Stack>
          <FormControlLabel
            control={
              <Checkbox
                checked={methods.watch('agreeToTerms')}
                size="small"
                onChange={(e) => {
                  if (!e.target.checked) {
                    // 체크 해제는 바로 가능
                    methods.setValue('agreeToTerms', false);
                  } else {
                    // 체크 시 모달 열기
                    setTermsModalOpen(true);
                  }
                }}
              />
            }
            label={t('signUp.agreeTerms')}
            sx={{
              '& .MuiFormControlLabel-label': {
                fontSize: 14,
              },
            }}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={methods.watch('agreeToPrivacy')}
                size="small"
                onChange={(e) => {
                  if (!e.target.checked) {
                    // 체크 해제는 바로 가능
                    methods.setValue('agreeToPrivacy', false);
                  } else {
                    // 체크 시 모달 열기
                    setPrivacyModalOpen(true);
                  }
                }}
              />
            }
            label={t('signUp.agreePrivacy')}
            sx={{
              '& .MuiFormControlLabel-label': {
                fontSize: 14,
              },
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
            sx={{ minHeight: 36, fontSize: 14 }}
          >
            {isSubmitting ? t('signUp.submitLoading') : t('signUp.submit')}
          </Button>
        </Box>
      </Box>
    );
  };

  if (!invitationCode) {
    return (
      <>
        <FormHead
          title={t('signUp.inviteRequiredTitle')}
          description={t('signUp.inviteRequiredDesc')}
          sx={{ textAlign: { xs: 'center', md: 'left' } }}
        />
        <Alert severity="error" sx={{ mb: 3 }}>
          {t('signUp.inviteRequiredAlert')}
        </Alert>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Link component={RouterLink} href={paths.auth.jwt.signIn} variant="subtitle2">
            {t('common.goToLogin')}
          </Link>
        </Box>
      </>
    );
  }

  if (isLoadingVerify) {
    return (
      <>
        <FormHead
          title={t('signUp.inviteLoadingTitle')}
          description={t('signUp.inviteLoadingDesc')}
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
          title={t('signUp.inviteInvalidTitle')}
          description={t('signUp.inviteInvalidDesc')}
          sx={{ textAlign: { xs: 'center', md: 'left' } }}
        />
        <Alert severity="error" sx={{ mb: 3 }}>
          {t('signUp.inviteInvalidDesc')}
        </Alert>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Link component={RouterLink} href={paths.auth.jwt.signIn} variant="subtitle2">
            {t('common.goToLogin')}
          </Link>
        </Box>
      </>
    );
  }

  return (
    <>
      <FormHead title={t('signUp.title')} sx={{ textAlign: { xs: 'center', md: 'left' } }} />

      {!!errorMessage && (
        <Alert severity="error" sx={{ mb: 3, whiteSpace: 'pre-line' }}>
          {errorMessage}
        </Alert>
      )}

      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Form methods={methods} onSubmit={onSubmit}>
          {renderForm()}
        </Form>
      </LocalizationProvider>

      {/* 약관 모달 */}
      <TermsModal
        open={termsModalOpen}
        onClose={() => setTermsModalOpen(false)}
        onAgree={() => methods.setValue('agreeToTerms', true)}
        type="terms"
      />
      <TermsModal
        open={privacyModalOpen}
        onClose={() => setPrivacyModalOpen(false)}
        onAgree={() => methods.setValue('agreeToPrivacy', true)}
        type="privacy"
      />
    </>
  );
}
