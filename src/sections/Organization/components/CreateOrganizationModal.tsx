import { useState, useEffect, useRef } from 'react';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import InputAdornment from '@mui/material/InputAdornment';
import Alert from '@mui/material/Alert';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';

import { Iconify } from 'src/components/iconify';
import { useCreateOrganization, useInviteMember } from '../hooks/use-organization-api';

// 다음 주소 API 타입 정의
declare global {
  interface Window {
    daum: {
      Postcode: new (options: {
        oncomplete: (data: {
          address: string;
          addressType: string;
          bname: string;
          buildingName: string;
        }) => void;
        width?: string;
        height?: string;
      }) => {
        open: () => void;
      };
    };
  }
}

// ----------------------------------------------------------------------

import type { CompanyType } from 'src/services/organization/organization.types';

export type OrganizationFormData = {
  companyType: CompanyType;
  companyName: string;
  businessType: string;
  businessNumber: string;
  representativeName: string;
  representativePhone: string;
  representativeEmail: string;
  businessCategory: string;
  businessItem: string;
  address: string;
  detailAddress: string;
  sendInvitationEmail: boolean;
};

type Props = {
  open: boolean;
  onClose: () => void;
};

// 조직 구분 옵션 (한글 표시 -> API enum 값 매핑)
const COMPANY_TYPE_OPTIONS: Array<{ label: string; value: CompanyType }> = [
  { label: '운영사', value: 'OPERATOR' },
  { label: '회원사', value: 'MEMBER' },
  { label: '총판', value: 'DISTRIBUTOR' },
  { label: '대리점', value: 'AGENCY' },
  { label: '딜러', value: 'DEALER' },
  { label: '비회원', value: 'NON_MEMBER' },
];

type BusinessTypeOption = {
  label: string;
  value: 0 | 1;
};

const BUSINESS_TYPE_OPTIONS: BusinessTypeOption[] = [
  { label: '법인사업자', value: 0 },
  { label: '개인사업자', value: 1 },
];

const DEFAULT_FORM_DATA: OrganizationFormData = {
  companyType: 'MEMBER',
  companyName: '',
  businessType: String(BUSINESS_TYPE_OPTIONS[0]?.value ?? ''),
  businessNumber: '',
  representativeName: '',
  representativePhone: '',
  representativeEmail: '',
  businessCategory: '',
  businessItem: '',
  address: '',
  detailAddress: '',
  sendInvitationEmail: false,
};

const REQUIRED_FIELDS: Array<keyof OrganizationFormData> = [
  'companyType',
  'companyName',
  'representativeName',
  'representativePhone',
  'representativeEmail',
  'businessNumber',
  'businessCategory',
  'businessItem',
  'address',
  'detailAddress',
];

export default function CreateOrganizationModal({ open, onClose }: Props) {
  const [formData, setFormData] = useState<OrganizationFormData>({ ...DEFAULT_FORM_DATA });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [businessNumberError, setBusinessNumberError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);

  const createOrganizationMutation = useCreateOrganization();
  const inviteMemberMutation = useInviteMember();

  const addressInputRef = useRef<HTMLInputElement>(null);
  const errorAlertRef = useRef<HTMLDivElement>(null); // 에러 메시지 스크롤용 ref

  const isSubmitting = createOrganizationMutation.isPending || inviteMemberMutation.isPending;

  // 에러 메시지가 나타나면 자동으로 스크롤
  useEffect(() => {
    if (errorMessage && errorAlertRef.current) {
      errorAlertRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [errorMessage]);

  const formatBusinessNumber = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 10);
    if (digits.length <= 3) return digits;
    if (digits.length <= 5) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`;
  };

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

  const handleBusinessNumberChange = (value: string) => {
    const formatted = formatBusinessNumber(value);
    handleChange('businessNumber', formatted);
    if (!formatted) {
      setBusinessNumberError(null);
      return;
    }
    setBusinessNumberError(
      formatted.replace(/\D/g, '').length === 10 ? null : '사업자 번호는 10자리 숫자여야 합니다.'
    );
  };

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhoneNumber(value);
    handleChange('representativePhone', formatted);
    if (!formatted) {
      setPhoneError(null);
      return;
    }
    setPhoneError(
      formatted.replace(/\D/g, '').length >= 9 ? null : '전화번호 형식이 올바르지 않습니다.'
    );
  };

  const validateEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

  const handleEmailChange = (value: string) => {
    const trimmed = value.replace(/\s/g, '');
    handleChange('representativeEmail', trimmed);
    if (!trimmed) {
      setEmailError(null);
      return;
    }
    setEmailError(validateEmail(trimmed) ? null : '올바른 이메일 주소를 입력해주세요.');
  };

  const preventHyphenInput = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === '-') {
      event.preventDefault();
    }
  };

  // 다음 주소 API 스크립트 로드
  useEffect(() => {
    const script = document.createElement('script');
    script.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
    script.async = true;
    document.head.appendChild(script);

    return () => {
      const existingScript = document.querySelector('script[src*="postcode.v2.js"]');
      if (existingScript && document.head.contains(existingScript)) {
        document.head.removeChild(existingScript);
      }
    };
  }, []);

  useEffect(() => {
    if (open) {
      setFormData({ ...DEFAULT_FORM_DATA });
      setErrorMessage(null);
      setBusinessNumberError(null);
      setPhoneError(null);
      setEmailError(null);
    }
  }, [open]);

  const handleChange = (field: keyof OrganizationFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSearchAddress = () => {
    if (!window.daum) {
      alert('주소 검색 서비스를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    new window.daum.Postcode({
      oncomplete: (data) => {
        let addr = '';
        if (data.addressType === 'R') {
          addr = data.address;
        } else {
          addr = data.address;
        }
        handleChange('address', addr);
      },
      width: '100%',
      height: '100%',
    }).open();
  };

  const handleAddressFieldClick = () => {
    handleSearchAddress();
  };

  const handleSubmit = async () => {
    // 필수 필드 검증
    const missingFields: string[] = [];

    REQUIRED_FIELDS.forEach((field) => {
      const value = formData[field];
      if (typeof value === 'string') {
        if (!value.trim()) {
          missingFields.push(field);
        }
      } else if (!value) {
        missingFields.push(field);
      }
    });

    // businessType 검증
    const businessTypeNumber =
      formData.businessType !== ''
        ? Number(formData.businessType)
        : (BUSINESS_TYPE_OPTIONS[0]?.value ?? 0);

    if (typeof businessTypeNumber !== 'number' || Number.isNaN(businessTypeNumber)) {
      missingFields.push('businessType');
    }

    // 이메일 형식 검증
    if (formData.representativeEmail && !validateEmail(formData.representativeEmail)) {
      setErrorMessage('올바른 이메일 주소를 입력해주세요.');
      return;
    }

    // 전화번호 형식 검증
    if (
      formData.representativePhone &&
      formData.representativePhone.replace(/\D/g, '').length < 9
    ) {
      setErrorMessage('올바른 전화번호 형식을 입력해주세요.');
      return;
    }

    if (missingFields.length > 0) {
      setErrorMessage('모든 필수 항목을 입력해주세요.');
      return;
    }

    const sanitizeField = (value: string, maxLen = 100) => value.trim().slice(0, maxLen);

    try {
      setErrorMessage(null);
      const payload = {
        companyName: sanitizeField(formData.companyName, 100),
        businessNumber: formData.businessNumber.trim() || undefined,
        businessType: businessTypeNumber, // 필수 필드
        representativeName: sanitizeField(formData.representativeName, 100),
        phone: formData.representativePhone?.trim() || undefined,
        email: formData.representativeEmail?.trim() || undefined,
        businessCategory: sanitizeField(formData.businessCategory, 100),
        businessItem: sanitizeField(formData.businessItem, 100),
        address:
          [formData.address, formData.detailAddress].filter(Boolean).join(' ').trim() || undefined,
        companyType: formData.companyType,
        serviceSettingIdxes: undefined, // 구독 서비스 제거됨
      };

      if (import.meta.env.DEV) {
        console.log('📤 [CreateOrganizationModal] 조직 등록 요청', payload);
      }

      const result = await createOrganizationMutation.mutateAsync(payload);
      if (import.meta.env.DEV) {
        console.log('✅ [CreateOrganizationModal] 조직 등록 성공', result);
      }

      const newCompanyIdx =
        (result as any)?.companyIdx ??
        (result as any)?.data?.companyIdx ??
        (result as any)?.body?.companyIdx ??
        null;

      if (newCompanyIdx && formData.sendInvitationEmail) {
        try {
          const invitePayload = {
            companyIdx: newCompanyIdx,
            email: formData.representativeEmail?.trim() || '',
            memberRole: 'OPERATOR_MANAGER',
          } as const;

          if (import.meta.env.DEV) {
            console.log('📤 [CreateOrganizationModal] 초대 메일 요청', invitePayload);
          }

          await inviteMemberMutation.mutateAsync(invitePayload);

          if (import.meta.env.DEV) {
            console.log('✅ [CreateOrganizationModal] 초대 메일 성공');
          }
        } catch (inviteError) {
          console.error('❌ 초대 메일 발송 실패:', inviteError);
        }
      }

      setFormData({ ...DEFAULT_FORM_DATA });
      onClose();
    } catch (error) {
      console.error('❌ 조직 등록 실패:', error);
      setErrorMessage('조직 등록에 실패했습니다. 잠시 후 다시 시도해주세요.');
    }
  };

  const handleClose = () => {
    setFormData({ ...DEFAULT_FORM_DATA });
    setErrorMessage(null);
    setBusinessNumberError(null);
    setPhoneError(null);
    setEmailError(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle component="div">
        <Typography component="p" variant="h6" sx={{ fontWeight: 600 }}>
          조직 등록
        </Typography>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            position: 'absolute',
            right: 16,
            top: 16,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <Iconify icon="solar:close-circle-bold" width={24} />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ py: 1 }}>
          <Stack spacing={3}>
            {/* 에러 메시지 (상단 이동) */}
            {errorMessage && (
              <Alert severity="error" ref={errorAlertRef} sx={{ mb: 2 }}>
                {errorMessage}
              </Alert>
            )}

            {/* 첫 번째 행: 구분, 조직명 */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <FormControl fullWidth>
                <InputLabel id="company-type-label">
                  구분
                  <Typography component="span" sx={{ color: 'error.main', ml: 0.5 }}>
                    *
                  </Typography>
                </InputLabel>
                <Select
                  labelId="company-type-label"
                  label="구분 *"
                  value={formData.companyType}
                  onChange={(e) => handleChange('companyType', e.target.value as CompanyType)}
                >
                  {COMPANY_TYPE_OPTIONS.map((option) => (
                    <MenuItem
                      key={option.value}
                      value={option.value}
                      disabled={option.value === 'OPERATOR'}
                    >
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label={
                  <>
                    조직명
                    <Typography component="span" sx={{ color: 'error.main', ml: 0.5 }}>
                      *
                    </Typography>
                  </>
                }
                placeholder="세이프유아이"
                value={formData.companyName}
                onChange={(e) => handleChange('companyName', e.target.value)}
              />
            </Stack>

            {/* 사업자 유형, 사업자 번호 */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <FormControl fullWidth>
                <InputLabel id="business-type-label">
                  사업자 유형
                  <Typography component="span" sx={{ color: 'error.main', ml: 0.5 }}>
                    *
                  </Typography>
                </InputLabel>
                <Select
                  labelId="business-type-label"
                  label="사업자 유형 *"
                  value={formData.businessType}
                  onChange={(e) => handleChange('businessType', e.target.value)}
                >
                  {BUSINESS_TYPE_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={String(option.value)}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label={
                  <>
                    사업자 번호
                    <Typography component="span" sx={{ color: 'error.main', ml: 0.5 }}>
                      *
                    </Typography>
                  </>
                }
                placeholder="123-45-67890"
                value={formData.businessNumber}
                onChange={(e) => handleBusinessNumberChange(e.target.value)}
                onKeyDown={preventHyphenInput}
                inputMode="numeric"
                error={!!businessNumberError}
                helperText={businessNumberError ?? '숫자만 입력하면 자동으로 하이픈이 추가됩니다.'}
              />
            </Stack>

            {/* 대표자명 */}
            <TextField
              fullWidth
              label={
                <>
                  대표자명
                  <Typography component="span" sx={{ color: 'error.main', ml: 0.5 }}>
                    *
                  </Typography>
                </>
              }
              placeholder="홍길동"
              value={formData.representativeName}
              onChange={(e) => handleChange('representativeName', e.target.value)}
            />

            {/* 대표 전화번호 */}
            <TextField
              fullWidth
              label={
                <>
                  대표 전화번호
                  <Typography component="span" sx={{ color: 'error.main', ml: 0.5 }}>
                    *
                  </Typography>
                </>
              }
              placeholder="02 또는 010으로 시작하는 숫자만 입력"
              value={formData.representativePhone}
              onChange={(e) => handlePhoneChange(e.target.value)}
              onKeyDown={preventHyphenInput}
              inputMode="tel"
              error={!!phoneError}
              helperText={phoneError ?? '숫자만 입력하면 자동으로 하이픈이 추가됩니다.'}
            />

            {/* 대표 이메일 */}
            <TextField
              fullWidth
              label={
                <>
                  대표 이메일
                  <Typography component="span" sx={{ color: 'error.main', ml: 0.5 }}>
                    *
                  </Typography>
                </>
              }
              placeholder="contact@company.com"
              type="email"
              value={formData.representativeEmail}
              onChange={(e) => handleEmailChange(e.target.value)}
              error={!!emailError}
              helperText={emailError ?? undefined}
            />

            {/* 업태, 종목 */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth
                label={
                  <>
                    업태
                    <Typography component="span" sx={{ color: 'error.main', ml: 0.5 }}>
                      *
                    </Typography>
                  </>
                }
                placeholder="업태"
                value={formData.businessCategory}
                onChange={(e) => handleChange('businessCategory', e.target.value)}
              />
              <TextField
                fullWidth
                label={
                  <>
                    종목
                    <Typography component="span" sx={{ color: 'error.main', ml: 0.5 }}>
                      *
                    </Typography>
                  </>
                }
                placeholder="종목"
                value={formData.businessItem}
                onChange={(e) => handleChange('businessItem', e.target.value)}
              />
            </Stack>

            {/* 사업장 주소 */}
            <Box>
              <TextField
                inputRef={addressInputRef}
                fullWidth
                label={
                  <>
                    사업장 주소
                    <Typography component="span" sx={{ color: 'error.main', ml: 0.5 }}>
                      *
                    </Typography>
                  </>
                }
                placeholder="서울시 강남구 ..."
                value={formData.address}
                onClick={handleAddressFieldClick}
                InputProps={{
                  readOnly: true,
                  endAdornment: (
                    <InputAdornment position="end">
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSearchAddress();
                        }}
                        sx={{ minWidth: 80 }}
                      >
                        검색
                      </Button>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    cursor: 'pointer',
                  },
                }}
              />
            </Box>

            {/* 상세주소 */}
            <TextField
              fullWidth
              label={
                <>
                  상세주소
                  <Typography component="span" sx={{ color: 'error.main', ml: 0.5 }}>
                    *
                  </Typography>
                </>
              }
              placeholder="상세주소"
              value={formData.detailAddress}
              onChange={(e) => handleChange('detailAddress', e.target.value)}
            />

            {/* 초대 이메일 */}
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.sendInvitationEmail}
                  onChange={(e) => handleChange('sendInvitationEmail', e.target.checked)}
                />
              }
              label="초대 이메일을 발송합니다."
            />

            <Divider sx={{ borderStyle: 'dashed' }} />
          </Stack>
        </Box>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ p: 3 }}>
        <Button variant="outlined" onClick={handleClose} disabled={isSubmitting}>
          취소
        </Button>
        <Button variant="contained" onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? '등록 중...' : '등록'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
