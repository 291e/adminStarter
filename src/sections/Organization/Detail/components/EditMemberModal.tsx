import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import type { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Switch from '@mui/material/Switch';
import InputAdornment from '@mui/material/InputAdornment';
import FormHelperText from '@mui/material/FormHelperText';
import Divider from '@mui/material/Divider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';

import { Iconify } from 'src/components/iconify';
import DialogBtn from 'src/components/safeyoui/button/dialogBtn';
import { updateMember, deleteMember } from 'src/services/member/member.service';
import type { UpdateMemberDto } from 'src/services/member/member.types';
import type { Member } from 'src/sections/Organization/types/member';
import { fDateTime } from 'src/utils/format-time';

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  onClose: () => void;
  member: Member | null;
  onUpdated?: () => void;
  onDeleted?: () => void;
  currentUserRole?:
    | 'OPERATOR_MANAGER'
    | 'MANAGEMENT_SUPERVISOR'
    | 'SAFETY_MANAGER'
    | 'WORKER'
    | null;
  isSuperAdmin?: boolean;
  organization?: {
    isAccidentFreeWorksite?: number;
    accidentFreeStatus?: string;
    accidentFreeCertifiedAt?: string | null;
    accidentFreeExpiresAt?: string | null;
  } | null;
};

type EditFormState = {
  memberId: string;
  memberName: string;
  memberEmail: string;
  memberPhone: string;
  memberAddress: string;
  memberAddressDetail: string;
  position: string;
  department: string;
  memberStatus: 'ACTIVE' | 'INACTIVE';
  memberRole: 'OPERATOR_MANAGER' | 'MANAGEMENT_SUPERVISOR' | 'SAFETY_MANAGER' | 'WORKER';
  memberThumbnail: string;
  password: string;
  passwordConfirm: string;
  workType: 'PRODUCTION' | 'OFFICE' | '';
  joinedAt: Dayjs | null;
  memberLang: string;
  memberNameOrg: string;
  mandatoryHours: string;
  regularHours: string;
  companyIdx: number | '';
  companyBranchIdx: number | '';
};

const DEFAULT_ROLES = [
  { value: 'OPERATOR_MANAGER', label: '조직 관리자' },
  { value: 'MANAGEMENT_SUPERVISOR', label: '관리 감독자' },
  { value: 'SAFETY_MANAGER', label: '안전보건 담당자' },
  { value: 'WORKER', label: '근로자' },
];

const WORK_TYPES = [
  { value: 'PRODUCTION', label: '생산직' },
  { value: 'OFFICE', label: '사무직' },
];

const NATIONALITIES = [
  { value: 'ko', label: '한국' },
  { value: 'en', label: '미국' },
  { value: 'ne', label: '네팔' },
  { value: 'vn', label: '베트남' },
  { value: 'zh', label: '중국' },
  { value: 'uz', label: '우즈베키스탄' },
];

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

// 역할과 직종에 따른 교육 이수 기준시간 계산 함수
const calculateMandatoryHours = (
  role: 'OPERATOR_MANAGER' | 'MANAGEMENT_SUPERVISOR' | 'SAFETY_MANAGER' | 'WORKER',
  workType: 'PRODUCTION' | 'OFFICE' | '',
  isAccidentFree: boolean
): { mandatory: number; regular: number } => {
  let mandatory = 0;
  let regular = 0;

  // 역할별 기본 기준시간
  switch (role) {
    case 'OPERATOR_MANAGER':
      mandatory = 12; // 연 12시간
      regular = 0;
      break;
    case 'MANAGEMENT_SUPERVISOR':
      mandatory = 16; // 연 16시간
      regular = 0;
      break;
    case 'SAFETY_MANAGER':
      mandatory = 24; // 연 24시간
      regular = 0;
      break;
    case 'WORKER':
      // 근로자는 직종에 따라 다름
      if (workType === 'PRODUCTION') {
        mandatory = 6; // 분기 6시간
        regular = 24; // 연 24시간
      } else if (workType === 'OFFICE') {
        mandatory = 3; // 분기 3시간
        regular = 12; // 연 12시간
      } else {
        mandatory = 0;
        regular = 0;
      }
      break;
    default:
      mandatory = 0;
      regular = 0;
  }

  // 무재해 사업장이면 50% 감면
  if (isAccidentFree) {
    mandatory = Math.round(mandatory * 0.5);
    regular = Math.round(regular * 0.5);
  }

  return { mandatory, regular };
};

// 무재해 사업장 여부 확인 함수
const isAccidentFreeWorksite = (
  organization?: {
    isAccidentFreeWorksite?: number;
    accidentFreeStatus?: string;
    accidentFreeCertifiedAt?: string | null;
    accidentFreeExpiresAt?: string | null;
  } | null
): boolean => {
  if (!organization) return false;

  // isAccidentFreeWorksite가 1이면 무재해 사업장
  if (organization.isAccidentFreeWorksite === 1) {
    // 상태가 APPROVED이고 현재 연도에 유효한지 확인
    if (organization.accidentFreeStatus === 'APPROVED') {
      const currentYear = new Date().getFullYear();
      if (organization.accidentFreeCertifiedAt) {
        const certifiedYear = new Date(organization.accidentFreeCertifiedAt).getFullYear();
        if (certifiedYear === currentYear) {
          return true;
        }
      }
      // 만료일이 있고 현재 날짜가 만료일 이전이면 유효
      if (organization.accidentFreeExpiresAt) {
        const expiresAt = new Date(organization.accidentFreeExpiresAt);
        if (expiresAt > new Date()) {
          return true;
        }
      }
    }
  }

  return false;
};

export default function EditMemberModal({
  open,
  onClose,
  member,
  onUpdated,
  onDeleted,
  currentUserRole,
  isSuperAdmin,
  organization,
}: Props) {
  const queryClient = useQueryClient();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [formData, setFormData] = useState<EditFormState>({
    memberId: '',
    memberName: '',
    memberEmail: '',
    memberPhone: '',
    memberAddress: '',
    memberAddressDetail: '',
    position: '',
    department: '',
    memberStatus: 'ACTIVE',
    memberRole: 'WORKER',
    memberThumbnail: '',
    password: '',
    passwordConfirm: '',
    workType: '',
    joinedAt: null,
    memberLang: 'ko',
    memberNameOrg: '',
    mandatoryHours: '',
    regularHours: '',
    companyIdx: '',
    companyBranchIdx: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof EditFormState, string>>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  // 초기 데이터 로드
  useEffect(() => {
    // 이미 현재 멤버를 편집 중이라면(formData.memberId === member.memberId) 초기화하지 않음
    // 단, member 객체가 변경되었고(예: standardHours 업데이트 등) 새로 열린 경우(open)는 초기화
    // 여기서는 간단히 open이 true가 될 때 member 정보를 로드하도록 함.
    // 추가로 memberId가 변경되었을 때도 로드.
    if (member && open && (!formData.memberId || formData.memberId !== member.memberId)) {
      const memberRole = (member.memberRole || 'WORKER') as
        | 'OPERATOR_MANAGER'
        | 'MANAGEMENT_SUPERVISOR'
        | 'SAFETY_MANAGER'
        | 'WORKER';
      const workType = (member.workType || '') as 'PRODUCTION' | 'OFFICE' | '';
      const isAccidentFree = isAccidentFreeWorksite(organization);
      const { mandatory, regular } = calculateMandatoryHours(memberRole, workType, isAccidentFree);

      const calculatedHours = memberRole === 'WORKER' ? regular : mandatory;

      // standardHours가 있으면 그것을 사용 (분 -> 시간), 없으면 계산된 값 사용
      let initialMandatoryHours = calculatedHours.toString();
      if (member.standardHours !== undefined && member.standardHours !== null) {
        initialMandatoryHours = (member.standardHours / 60).toString();
      }

      setFormData({
        memberId: member.memberId || '',
        memberName: member.memberName || '',
        memberEmail: member.memberEmail || '',
        memberPhone: member.memberPhone || '',
        memberAddress: member.memberAddress || '',
        memberAddressDetail: member.memberAddressDetail || '',
        position: member.position || '',
        department: member.department || '',
        memberStatus: member.memberStatus === 'active' ? 'ACTIVE' : 'INACTIVE',
        memberRole,
        memberThumbnail: member.memberThumbnail || '',
        password: '',
        passwordConfirm: '',
        workType,
        joinedAt: member.joinedAt ? dayjs(member.joinedAt) : null,
        memberLang: member.memberLang || 'ko',
        memberNameOrg: member.memberNameOrg || '',
        mandatoryHours: initialMandatoryHours,
        regularHours: regular.toString(),
        companyIdx: member.companyIdx || '',
        companyBranchIdx: member.companyBranchIdx || '',
      });
      setErrors({});
      setSubmitError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [member, open, organization]);

  // 역할 또는 직종 변경 시 기준시간 자동 업데이트 useEffect 제거 (handleChange에서 처리)

  const updateMemberMutation = useMutation({
    mutationFn: ({ memberIdx, params }: { memberIdx: number; params: UpdateMemberDto }) =>
      updateMember(memberIdx, params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      queryClient.invalidateQueries({ queryKey: ['organizationDetail'] });
      queryClient.invalidateQueries({ queryKey: ['companyMembers'] });
      // 교육 현황 관련 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: ['educationCompletionRate'] });
      queryClient.invalidateQueries({ queryKey: ['educationDetail'] });
      queryClient.invalidateQueries({ queryKey: ['educationReports'] });
      onUpdated?.();
      onClose();
    },
    onError: (error: any) => {
      setSubmitError(error?.response?.data?.resultMessage || '멤버 수정에 실패했습니다.');
    },
  });

  const deleteMemberMutation = useMutation({
    mutationFn: (memberIdx: number) => deleteMember(memberIdx),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      queryClient.invalidateQueries({ queryKey: ['organizationDetail'] });
      queryClient.invalidateQueries({ queryKey: ['companyMembers'] });
      // 교육 현황 관련 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: ['educationCompletionRate'] });
      queryClient.invalidateQueries({ queryKey: ['educationDetail'] });
      queryClient.invalidateQueries({ queryKey: ['educationReports'] });
      onDeleted?.();
      onClose();
    },
    onError: (error: any) => {
      setSubmitError(error?.response?.data?.resultMessage || '멤버 삭제에 실패했습니다.');
    },
  });

  // 조직 관리자 또는 슈퍼 어드민인 경우 수정/삭제 가능
  const canEdit = currentUserRole === 'OPERATOR_MANAGER' || isSuperAdmin === true;

  const handleChange =
    (field: keyof EditFormState) =>
    (event: React.ChangeEvent<HTMLInputElement | { value: unknown }> | SelectChangeEvent) => {
      const value = typeof event.target.value === 'string' ? event.target.value : '';
      let processedValue = value;

      // 핸드폰 번호 자동 포맷팅
      if (field === 'memberPhone') {
        processedValue = formatPhoneNumber(value);
      }

      setFormData((prev) => {
        const newData = { ...prev, [field]: processedValue };

        // 역할 또는 직종 변경 시 기준시간 재계산
        if (field === 'memberRole' || field === 'workType') {
          const newRole = field === 'memberRole' ? (processedValue as any) : prev.memberRole;
          const newWorkType = field === 'workType' ? (processedValue as any) : prev.workType;

          const isAccidentFree = isAccidentFreeWorksite(organization);
          const workTypeForCalc = newRole === 'WORKER' ? newWorkType : '';

          const { mandatory, regular } = calculateMandatoryHours(
            newRole,
            workTypeForCalc,
            isAccidentFree
          );

          const displayHours = newRole === 'WORKER' ? regular : mandatory;

          newData.mandatoryHours = displayHours.toString();
          newData.regularHours = regular.toString();
        }

        return newData;
      });

      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
      setSubmitError(null);
    };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof EditFormState, string>> = {};

    if (!formData.memberName.trim()) {
      newErrors.memberName = '이름을 입력해주세요.';
    }

    if (!formData.memberEmail.trim()) {
      newErrors.memberEmail = '이메일을 입력해주세요.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.memberEmail)) {
      newErrors.memberEmail = '올바른 이메일 형식을 입력해주세요.';
    }

    if (!formData.memberPhone.trim()) {
      newErrors.memberPhone = '전화번호를 입력해주세요.';
    }

    if (!formData.memberId.trim()) {
      newErrors.memberId = '아이디를 입력해주세요.';
    }

    if (!formData.memberRole) {
      newErrors.memberRole = '역할을 선택해주세요.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!member) return;

    if (!validate()) {
      return;
    }

    // 현재 입력된 시간 (분 단위 변환)
    const currentHoursMinutes = formData.mandatoryHours
      ? Number(formData.mandatoryHours) * 60
      : undefined;

    let standardHoursToSend: number | null | undefined = undefined;

    if (currentHoursMinutes !== undefined && !Number.isNaN(currentHoursMinutes)) {
      standardHoursToSend = currentHoursMinutes;
    }

    const params: UpdateMemberDto = {
      memberId: formData.memberId.trim(),
      memberName: formData.memberName.trim() || undefined,
      memberEmail: formData.memberEmail.trim() || undefined,
      memberPhone: formData.memberPhone.trim() || undefined,
      memberAddress: formData.memberAddress.trim() || undefined,
      memberAddressDetail: formData.memberAddressDetail.trim() || undefined,
      position: formData.position.trim() || undefined,
      department: formData.department.trim() || undefined,
      memberStatus: formData.memberStatus,
      memberRole: formData.memberRole,
      memberThumbnail: formData.memberThumbnail.trim() || undefined,
      memberNameOrg: formData.memberNameOrg.trim() || undefined,
      ...(formData.password && { password: formData.password }),
      ...(formData.companyIdx && { companyIdx: Number(formData.companyIdx) }),
      ...(formData.companyBranchIdx && { companyBranchIdx: Number(formData.companyBranchIdx) }),
      ...(standardHoursToSend !== undefined && { standardHours: standardHoursToSend }),
      ...(formData.joinedAt && { joinedAt: formData.joinedAt.format('YYYY-MM-DD') }),
      workType: formData.workType || undefined,
      memberLang: formData.memberLang || undefined,
    };

    updateMemberMutation.mutate({
      memberIdx: member.memberIdx,
      params,
    });
  };

  const handleClose = () => {
    setFormData({
      memberId: '',
      memberName: '',
      memberEmail: '',
      memberPhone: '',
      memberAddress: '',
      memberAddressDetail: '',
      position: '',
      department: '',
      memberStatus: 'ACTIVE',
      memberRole: 'WORKER',
      memberThumbnail: '',
      password: '',
      passwordConfirm: '',
      workType: '',
      joinedAt: null,
      memberLang: 'ko',
      memberNameOrg: '',
      mandatoryHours: '',
      regularHours: '',
      companyIdx: '',
      companyBranchIdx: '',
    });
    setErrors({});
    setSubmitError(null);
    setShowPassword(false);
    setShowPasswordConfirm(false);
    onClose();
  };

  if (!member) return null;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 3,
            py: 3,
          }}
        >
          직원 정보 수정
        </DialogTitle>

        <DialogContent sx={{ p: 0 }}>
          {submitError && (
            <Alert severity="error" onClose={() => setSubmitError(null)} sx={{ m: 3, mb: 0 }}>
              {submitError}
            </Alert>
          )}

          {/* 회색 배경 정보 섹션 */}
          <Box
            sx={{
              bgcolor: 'background.neutral',
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
            }}
          >
            <Stack direction="row" spacing={5}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="subtitle2" sx={{ minWidth: 80 }}>
                  등록일
                </Typography>
                <Typography variant="body2">
                  {member.createAt ? fDateTime(member.createAt, 'YYYY-MM-DD HH:mm:ss') : '-'}
                </Typography>
              </Stack>
            </Stack>
            <Stack direction="row" spacing={12.5}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="subtitle2" sx={{ minWidth: 80 }}>
                  접속일
                </Typography>
                <Typography variant="body2">
                  {member.lastSigninDate
                    ? fDateTime(member.lastSigninDate, 'YYYY-MM-DD HH:mm:ss')
                    : '-'}
                </Typography>
              </Stack>
            </Stack>
          </Box>

          <Stack spacing={2} sx={{ p: 3 }}>
            {/* 계정 정보 섹션 */}
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              계정 정보
            </Typography>

            <TextField
              fullWidth
              label={
                <>
                  아이디
                  <Typography component="span" sx={{ color: 'info.main', ml: 0.5 }}>
                    *
                  </Typography>
                </>
              }
              value={formData.memberId}
              onChange={handleChange('memberId')}
              error={!!errors.memberId}
              helperText={errors.memberId}
              disabled
              slotProps={{
                inputLabel: { shrink: true },
                input: {
                  sx: { bgcolor: 'grey.50' },
                },
              }}
            />

            <Stack direction="row" spacing={2} alignItems="flex-start">
              <Box sx={{ flex: 1 }}>
                <TextField
                  fullWidth
                  label="비밀번호"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange('password')}
                  slotProps={{
                    inputLabel: { shrink: true },
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                            size="small"
                          >
                            <Iconify
                              icon={showPassword ? 'solar:eye-bold' : 'solar:eye-closed-bold'}
                              width={20}
                            />
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                />
                <FormHelperText sx={{ mt: 0.5, mx: 1.75 }}>
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <Iconify
                      icon="solar:info-circle-bold"
                      width={16}
                      sx={{ color: 'text.secondary' }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      10자 이내의 영문 소문자, 대문자, 숫자
                    </Typography>
                  </Stack>
                </FormHelperText>
              </Box>

              <Box sx={{ flex: 1 }}>
                <TextField
                  fullWidth
                  label="비밀번호 확인"
                  type={showPasswordConfirm ? 'text' : 'password'}
                  value={formData.passwordConfirm}
                  onChange={handleChange('passwordConfirm')}
                  slotProps={{
                    inputLabel: { shrink: true },
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                            edge="end"
                            size="small"
                          >
                            <Iconify
                              icon={
                                showPasswordConfirm ? 'solar:eye-bold' : 'solar:eye-closed-bold'
                              }
                              width={20}
                            />
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </Box>
            </Stack>

            {/* 개인 정보 섹션 */}
            <Typography variant="subtitle2" sx={{ mt: 3, mb: 1 }}>
              개인 정보
            </Typography>

            <Stack direction="row" spacing={2}>
              <TextField
                fullWidth
                label={
                  <>
                    이름
                    <Typography component="span" sx={{ color: 'info.main', ml: 0.5 }}>
                      *
                    </Typography>
                  </>
                }
                value={formData.memberName}
                onChange={handleChange('memberName')}
                error={!!errors.memberName}
                helperText={errors.memberName}
                slotProps={{ inputLabel: { shrink: true } }}
              />
              <TextField
                fullWidth
                label="원어 성명"
                value={formData.memberNameOrg}
                onChange={handleChange('memberNameOrg')}
                placeholder="예: Nguyen Van A"
                slotProps={{ inputLabel: { shrink: true } }}
              />
              <TextField
                fullWidth
                label="직급"
                value={formData.position}
                onChange={handleChange('position')}
                placeholder="예: 과장, 대리, 사원"
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Stack>

            <Stack direction="row" spacing={2}>
              <TextField
                fullWidth
                label="소속팀"
                value={formData.department}
                onChange={handleChange('department')}
                slotProps={{ inputLabel: { shrink: true } }}
              />
              <FormControl fullWidth>
                <InputLabel id="memberRole-label" shrink>
                  역할
                  <Typography component="span" sx={{ color: 'info.main', ml: 0.5 }}>
                    *
                  </Typography>
                </InputLabel>
                <Select
                  labelId="memberRole-label"
                  label={
                    <>
                      역할
                      <Typography component="span" sx={{ color: 'info.main', ml: 0.5 }}>
                        *
                      </Typography>
                    </>
                  }
                  value={formData.memberRole}
                  onChange={handleChange('memberRole')}
                  error={!!errors.memberRole}
                >
                  {DEFAULT_ROLES.map((role) => (
                    <MenuItem key={role.value} value={role.value}>
                      {role.label}
                    </MenuItem>
                  ))}
                </Select>
                {errors.memberRole && <FormHelperText error>{errors.memberRole}</FormHelperText>}
              </FormControl>
            </Stack>

            <Stack direction="row" spacing={2}>
              <FormControl fullWidth>
                <InputLabel id="workType-label" shrink>
                  직종
                  {formData.memberRole === 'WORKER' && (
                    <Typography component="span" sx={{ color: 'info.main', ml: 0.5 }}>
                      *
                    </Typography>
                  )}
                </InputLabel>
                <Select
                  labelId="workType-label"
                  label={
                    <>
                      직종
                      {formData.memberRole === 'WORKER' && (
                        <Typography component="span" sx={{ color: 'info.main', ml: 0.5 }}>
                          *
                        </Typography>
                      )}
                    </>
                  }
                  value={formData.workType}
                  onChange={handleChange('workType')}
                  error={!!errors.workType}
                >
                  {WORK_TYPES.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
                {errors.workType && <FormHelperText error>{errors.workType}</FormHelperText>}
              </FormControl>
              <DatePicker
                value={formData.joinedAt}
                label="입사일"
                onChange={(newValue) => {
                  setFormData((prev) => ({ ...prev, joinedAt: newValue }));
                }}
                format="YYYY-MM-DD"
              />
            </Stack>

            <TextField
              fullWidth
              label={
                <>
                  핸드폰 번호
                  <Typography component="span" sx={{ color: 'info.main', ml: 0.5 }}>
                    *
                  </Typography>
                </>
              }
              value={formData.memberPhone}
              onChange={handleChange('memberPhone')}
              error={!!errors.memberPhone}
              helperText={errors.memberPhone}
              slotProps={{
                inputLabel: { shrink: true },
                htmlInput: {
                  inputMode: 'numeric',
                  maxLength: 13,
                },
              }}
            />

            <TextField
              fullWidth
              label={
                <>
                  이메일
                  <Typography component="span" sx={{ color: 'info.main', ml: 0.5 }}>
                    *
                  </Typography>
                </>
              }
              type="email"
              value={formData.memberEmail}
              onChange={handleChange('memberEmail')}
              error={!!errors.memberEmail}
              helperText={errors.memberEmail}
              slotProps={{ inputLabel: { shrink: true } }}
            />

            <Stack direction="row" spacing={2}>
              <FormControl fullWidth>
                <InputLabel id="memberLang-label" shrink>
                  국적
                </InputLabel>
                <Select
                  labelId="memberLang-label"
                  label="국적"
                  value={formData.memberLang}
                  onChange={handleChange('memberLang')}
                >
                  {NATIONALITIES.map((nat) => (
                    <MenuItem key={nat.value} value={nat.value}>
                      {nat.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="원어 이름"
                value={formData.memberNameOrg}
                onChange={handleChange('memberNameOrg')}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Stack>

            {/* 교육 이수 기준시간 섹션 */}
            <Typography variant="subtitle2" sx={{ mt: 2 }}>
              교육 이수 기준시간
            </Typography>

            <Stack direction="row" spacing={2} alignItems="center">
              <Typography variant="subtitle2" sx={{ minWidth: 24 }}>
                연
              </Typography>
              <TextField
                size="small"
                type="number"
                value={formData.mandatoryHours}
                onChange={handleChange('mandatoryHours')}
                slotProps={{
                  input: {
                    sx: { bgcolor: 'grey.50', width: 100 },
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton size="small" edge="end">
                          <Iconify icon="solar:pen-bold" width={20} />
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />
              <Typography variant="subtitle2" sx={{ minWidth: 36 }}>
                시간
              </Typography>
              <IconButton
                size="small"
                onClick={() => {
                  const isAccidentFree = isAccidentFreeWorksite(organization);
                  const { mandatory, regular } = calculateMandatoryHours(
                    formData.memberRole,
                    formData.workType,
                    isAccidentFree
                  );
                  // 근로자의 경우 연 시간(regularHours)을 표시, 그 외는 mandatoryHours 표시
                  const displayHours = formData.memberRole === 'WORKER' ? regular : mandatory;
                  setFormData((prev) => ({
                    ...prev,
                    mandatoryHours: displayHours.toString(),
                    regularHours: regular.toString(),
                  }));
                }}
              >
                <Iconify icon="solar:restart-bold" width={20} />
              </IconButton>
            </Stack>
            <FormHelperText>
              <Stack direction="row" spacing={0.5} alignItems="center">
                <Iconify
                  icon="solar:info-circle-bold"
                  width={16}
                  sx={{ color: 'text.secondary' }}
                />
                <Typography variant="caption" color="text.secondary">
                  기본 기준시간이 적용되었습니다. 조직 운영 정책에 맞게 변경 가능합니다.
                  {isAccidentFreeWorksite(organization) && ' (무재해 사업장 50% 감면 적용)'}
                </Typography>
              </Stack>
            </FormHelperText>

            {/* 활성 스위치 */}
            <Stack direction="row" spacing={1} alignItems="center">
              <Switch
                checked={formData.memberStatus === 'ACTIVE'}
                onChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    memberStatus: e.target.checked ? 'ACTIVE' : 'INACTIVE',
                  }));
                }}
              />
              <Typography variant="body2">활성</Typography>
            </Stack>
          </Stack>
        </DialogContent>

        <Divider />

        <DialogActions sx={{ px: 3, py: 3, justifyContent: 'space-between' }}>
          <DialogBtn
            variant="outlined"
            onClick={() => setDeleteConfirmOpen(true)}
            disabled={!canEdit || deleteMemberMutation.isPending}
            sx={{ color: 'error.main', fontWeight: 700, borderColor: 'transparent' }}
          >
            {deleteMemberMutation.isPending ? '삭제 중...' : '삭제'}
          </DialogBtn>
          <Stack direction="row" spacing={1.5}>
            <DialogBtn variant="outlined" onClick={handleClose}>
              취소
            </DialogBtn>
            <DialogBtn
              variant="contained"
              onClick={handleSave}
              disabled={!canEdit || updateMemberMutation.isPending}
            >
              {updateMemberMutation.isPending ? '저장 중...' : '저장'}
            </DialogBtn>
          </Stack>
        </DialogActions>
      </Dialog>

      {/* 삭제 확인 다이얼로그 */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>회원 삭제</DialogTitle>
        <DialogContent>
          <Typography>
            <strong>{member?.memberName}</strong> 회원을 정말 삭제하시겠습니까?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            삭제된 회원은 복구할 수 없습니다.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <DialogBtn variant="outlined" onClick={() => setDeleteConfirmOpen(false)}>
            취소
          </DialogBtn>
          <DialogBtn
            variant="contained"
            color="error"
            onClick={() => {
              if (member) {
                deleteMemberMutation.mutate(member.memberIdx);
              }
              setDeleteConfirmOpen(false);
            }}
          >
            삭제
          </DialogBtn>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
}
