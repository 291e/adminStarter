import { useEffect, useRef, useState } from 'react';

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
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import InputAdornment from '@mui/material/InputAdornment';
import Alert from '@mui/material/Alert';
import Divider from '@mui/material/Divider';
import Switch from '@mui/material/Switch';

import { Iconify } from 'src/components/iconify';
import { useUpdateOrganization } from '../hooks/use-organization-api';
import DeactivateMemberModal from './DeactivateMemberModal';

import type {
  CompanyType,
  Organization,
  UpdateOrganizationParams,
} from 'src/services/organization/organization.types';

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

type Props = {
  open: boolean;
  organization: Organization | null;
  onClose: () => void;
  onUpdated?: () => void;
};

type EditFormState = {
  companyType: CompanyType | '';
  companyName: string;
  businessType: string;
  businessNumber: string;
  businessCategory: string;
  businessItem: string;
  address: string;
  detailAddress: string;
  phone: string;
  email: string;
  managerName: string;
};

const COMPANY_TYPE_OPTIONS: Array<{ label: string; value: CompanyType }> = [
  { label: '일반', value: 'MEMBER' },
  { label: '공단보조', value: 'NON_MEMBER' },
];

const BUSINESS_TYPE_OPTIONS = [
  { label: '법인사업자', value: 0 },
  { label: '개인사업자', value: 1 },
];

const DEFAULT_FORM_STATE: EditFormState = {
  companyType: '',
  companyName: '',
  businessType: '',
  businessNumber: '',
  businessCategory: '',
  businessItem: '',
  address: '',
  detailAddress: '',
  phone: '',
  email: '',
  managerName: '',
};

const REQUIRED_FIELDS: Array<keyof EditFormState> = [
  'companyName',
  'businessCategory',
  'businessItem',
];

const formatBusinessNumberValue = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`;
};

const sanitizeField = (value?: string, maxLen = 100) =>
  value ? value.trim().slice(0, maxLen) : undefined;

export default function EditOrganizationModal({ open, organization, onClose, onUpdated }: Props) {
  const [formData, setFormData] = useState<EditFormState>({ ...DEFAULT_FORM_STATE });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [businessNumberError, setBusinessNumberError] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(true);
  const [deactivateModalOpen, setDeactivateModalOpen] = useState(false);

  const addressInputRef = useRef<HTMLInputElement>(null);

  const updateOrganizationMutation = useUpdateOrganization();

  const loadPostcodeScript = () => {
    if (document.querySelector('script[src*="postcode.v2.js"]')) {
      return;
    }
    const script = document.createElement('script');
    script.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
    script.async = true;
    document.head.appendChild(script);
  };

  useEffect(() => {
    loadPostcodeScript();
    return () => {
      // 스크립트는 프로젝트 전역에서 재사용하므로 제거하지 않음
    };
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    if (!organization) {
      setFormData({ ...DEFAULT_FORM_STATE });
      setIsActive(true);
      setErrorMessage(null);
      setBusinessNumberError(null);
      return;
    }

    const initialBusinessNumber = formatBusinessNumberValue(organization.businessNumber || '');

    setFormData({
      companyType: organization.companyType || '',
      companyName: organization.companyName || '',
      businessType:
        organization.businessType !== undefined && organization.businessType !== null
          ? String(organization.businessType)
          : '',
      businessNumber: initialBusinessNumber,
      businessCategory: organization.businessCategory || '',
      businessItem: organization.businessItem || '',
      address: organization.address || '',
      detailAddress: organization.addressDetail || '',
      phone: organization.phone || '',
      email: organization.email || '',
      managerName: organization.manager?.memberName || '',
    });
    setIsActive(organization.isActive === 1 || organization.status === 'active');
    setErrorMessage(null);
    setBusinessNumberError(null);
  }, [open, organization]);

  const isSubmitting = updateOrganizationMutation.isPending;

  const handleChange = (field: keyof EditFormState, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleBusinessNumberChange = (value: string) => {
    const formatted = formatBusinessNumberValue(value);
    handleChange('businessNumber', formatted);
    if (!formatted) {
      setBusinessNumberError(null);
      return;
    }
    setBusinessNumberError(
      formatted.replace(/\D/g, '').length === 10 ? null : '사업자 번호는 10자리 숫자여야 합니다.'
    );
  };

  const preventHyphenInput = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === '-') {
      event.preventDefault();
    }
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
        addressInputRef.current?.focus();
      },
      width: '100%',
      height: '100%',
    }).open();
  };

  const handleStatusToggle = async (_: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
    if (!organization) return;

    if (!checked) {
      setDeactivateModalOpen(true);
      return;
    }

    try {
      await updateOrganizationMutation.mutateAsync({
        companyIdx: organization.companyIdx,
        isActive: 1, // 1: 활성
      });
      setIsActive(true);
      onUpdated?.();
    } catch (error) {
      console.error('❌ 조직 활성화 실패', error);
      setErrorMessage('조직 상태 변경에 실패했습니다. 잠시 후 다시 시도해주세요.');
    }
  };

  const handleConfirmDeactivate = async () => {
    if (!organization) return;
    try {
      // deactivateOrganization API 대신 updateOrganization API의 isActive 필드 사용
      await updateOrganizationMutation.mutateAsync({
        companyIdx: organization.companyIdx,
        isActive: 0, // 0: 비활성
      });
      setIsActive(false);
      onUpdated?.();
      setDeactivateModalOpen(false);
    } catch (error) {
      console.error('❌ 조직 비활성화 실패', error);
      setErrorMessage('조직 비활성화에 실패했습니다. 잠시 후 다시 시도해주세요.');
    }
  };

  const handleSubmit = async () => {
    if (!organization) return;

    const missingField = REQUIRED_FIELDS.find((field) => {
      const value = formData[field];
      if (typeof value === 'string') {
        return !value.trim();
      }
      return !value;
    });

    if (missingField) {
      setErrorMessage('필수 항목을 모두 입력해주세요.');
      return;
    }

    const businessTypeNumber =
      formData.businessType !== '' ? Number(formData.businessType) : undefined;

    try {
      setErrorMessage(null);

      const updatePayload: UpdateOrganizationParams & { companyIdx: number } = {
        companyIdx: organization.companyIdx,
        companyName: sanitizeField(formData.companyName),
        businessNumber: formData.businessNumber.trim() || undefined,
        businessType:
          typeof businessTypeNumber === 'number' && !Number.isNaN(businessTypeNumber)
            ? businessTypeNumber
            : undefined,
        businessCategory: sanitizeField(formData.businessCategory),
        businessItem: sanitizeField(formData.businessItem),
        address:
          [formData.address, formData.detailAddress].filter(Boolean).join(' ').trim() || undefined,
        phone: formData.phone?.trim() || undefined,
        email: formData.email?.trim() || undefined,
        isActive: isActive ? 1 : 0,
      };

      if (formData.companyType) {
        updatePayload.companyType = formData.companyType;
      }

      await updateOrganizationMutation.mutateAsync(updatePayload);

      onUpdated?.();
      handleClose();
    } catch (error) {
      console.error('❌ 조직 정보 수정 실패', error);
      setErrorMessage('조직 정보 수정에 실패했습니다. 잠시 후 다시 시도해주세요.');
    }
  };

  const handleClose = () => {
    setFormData({ ...DEFAULT_FORM_STATE });
    setErrorMessage(null);
    setBusinessNumberError(null);
    setDeactivateModalOpen(false);
    onClose();
  };

  return (
    <>
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle sx={{ pr: 6 }}>
          <Typography component="p" variant="h6" sx={{ fontWeight: 600 }}>
            조직 정보 수정
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

        <DialogContent sx={{ pt: 0 }}>
          {errorMessage && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorMessage}
            </Alert>
          )}

          <Stack spacing={3} sx={{ pt: 2 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Box sx={{ flex: 1 }}>
                <FormControl fullWidth>
                  <InputLabel id="edit-company-type-label">구분</InputLabel>
                  <Select
                    labelId="edit-company-type-label"
                    label="구분"
                    value={formData.companyType}
                    onChange={(e) => handleChange('companyType', e.target.value as CompanyType)}
                  >
                    <MenuItem value="">선택</MenuItem>
                    {COMPANY_TYPE_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
                </FormControl>
              </Box>
              <Box sx={{ flex: 1 }}>
                <TextField
                  fullWidth
                  label={
                    <>
                      조직명
                      <Typography component="span" sx={{ color: 'info.main', ml: 0.5 }}>
                        *
                      </Typography>
                    </>
                  }
                  value={formData.companyName}
                  onChange={(e) => handleChange('companyName', e.target.value)}
                />
              </Box>
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Box sx={{ flex: 1 }}>
                <FormControl fullWidth>
                  <InputLabel id="edit-business-type-label">사업자 유형</InputLabel>
                  <Select
                    labelId="edit-business-type-label"
                    label="사업자 유형"
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
              </Box>
              <Box sx={{ flex: 1 }}>
                <TextField
                  fullWidth
                  label="사업자 번호"
                  placeholder="123-45-67890"
                  value={formData.businessNumber}
                  onChange={(e) => handleBusinessNumberChange(e.target.value)}
                  onKeyDown={preventHyphenInput}
                  inputMode="numeric"
                  error={!!businessNumberError}
                  helperText={
                    businessNumberError ?? '숫자만 입력하면 자동으로 하이픈이 추가됩니다.'
                  }
                />
              </Box>
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Box sx={{ flex: 1 }}>
                <TextField
                  fullWidth
                  label="업태"
                  placeholder="업태"
                  value={formData.businessCategory}
                  onChange={(e) => handleChange('businessCategory', e.target.value)}
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <TextField
                  fullWidth
                  label="종목"
                  placeholder="종목"
                  value={formData.businessItem}
                  onChange={(e) => handleChange('businessItem', e.target.value)}
                />
              </Box>
            </Stack>

            <Box>
              <TextField
                fullWidth
                inputRef={addressInputRef}
                label="사업장 주소"
                placeholder="서울시 강남구 ..."
                value={formData.address}
                onClick={handleSearchAddress}
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

            <TextField
              fullWidth
              label="상세주소"
              placeholder="상세주소"
              value={formData.detailAddress}
              onChange={(e) => handleChange('detailAddress', e.target.value)}
            />

            <TextField
              fullWidth
              label={
                <>
                  담당자
                  <Typography component="span" sx={{ color: 'info.main', ml: 0.5 }}>
                    *
                  </Typography>
                </>
              }
              value={formData.managerName}
              disabled
              helperText="담당자 정보는 멤버 관리에서 변경할 수 있습니다."
            />

            <Divider sx={{ borderStyle: 'dashed' }} />

            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Stack direction="row" spacing={1} alignItems="center">
                <Switch
                  checked={isActive}
                  onChange={handleStatusToggle}
                  disabled={!organization || isSubmitting}
                />
                <Typography variant="body2">활성</Typography>
              </Stack>
            </Stack>
          </Stack>
        </DialogContent>

        <Divider />

        <DialogActions sx={{ p: 3 }}>
          <Button variant="outlined" onClick={handleClose} disabled={isSubmitting}>
            취소
          </Button>
          <Button variant="contained" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? '저장 중...' : '저장'}
          </Button>
        </DialogActions>
      </Dialog>

      <DeactivateMemberModal
        open={deactivateModalOpen}
        onClose={() => setDeactivateModalOpen(false)}
        onConfirm={handleConfirmDeactivate}
        organization={organization}
      />
    </>
  );
}
