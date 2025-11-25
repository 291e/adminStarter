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
import { useCreateOrganization } from '../hooks/use-organization-api';

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
  companyCode: string;
  businessType: string;
  businessNumber: string;
  representativeName: string;
  representativePhone: string;
  representativeEmail: string;
  businessCategory: string;
  businessItem: string;
  address: string;
  detailAddress: string;
  subscriptionService: string;
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

const DEFAULT_FORM_DATA: OrganizationFormData = {
  companyType: 'MEMBER',
  companyName: '',
  companyCode: '',
  businessType: '',
  businessNumber: '',
  representativeName: '',
  representativePhone: '',
  representativeEmail: '',
  businessCategory: '',
  businessItem: '',
  address: '',
  detailAddress: '',
  subscriptionService: '',
  sendInvitationEmail: false,
};

const REQUIRED_FIELDS: Array<keyof OrganizationFormData> = [
  'companyType',
  'companyName',
  'representativeName',
  'representativePhone',
  'representativeEmail',
];

export default function CreateOrganizationModal({ open, onClose }: Props) {
  const [formData, setFormData] = useState<OrganizationFormData>({ ...DEFAULT_FORM_DATA });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const createOrganizationMutation = useCreateOrganization();

  const addressInputRef = useRef<HTMLInputElement>(null);

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

    try {
      setErrorMessage(null);
      await createOrganizationMutation.mutateAsync({
        companyName: formData.companyName,
        companyCode: formData.companyCode || undefined,
        businessNumber: formData.businessNumber || undefined,
        address:
          [formData.address, formData.detailAddress].filter(Boolean).join(' ').trim() || undefined,
        phone: formData.representativePhone || undefined,
        email: formData.representativeEmail || undefined,
        companyType: formData.companyType,
      });
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
        {errorMessage && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorMessage}
          </Alert>
        )}
        <Box sx={{ py: 1 }}>
          <Stack spacing={3}>
            {/* 첫 번째 행: 구분, 조직명 */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <FormControl fullWidth>
                <InputLabel id="company-type-label">
                  구분
                  <Typography component="span" sx={{ color: 'info.main', ml: 0.5 }}>
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
                    <MenuItem key={option.value} value={option.value}>
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
                    <Typography component="span" sx={{ color: 'info.main', ml: 0.5 }}>
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
                <InputLabel id="business-type-label">사업자 유형</InputLabel>
                <Select
                  labelId="business-type-label"
                  label="사업자 유형"
                  value={formData.businessType}
                  onChange={(e) => handleChange('businessType', e.target.value)}
                >
                  {['개인사업자', '법인사업자', '기타'].map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="사업자 번호"
                placeholder="123-45-67890"
                value={formData.businessNumber}
                onChange={(e) => handleChange('businessNumber', e.target.value)}
              />
            </Stack>

            {/* 회사 코드 */}
            <TextField
              fullWidth
              label="회사 코드"
              placeholder="SAFE001"
              value={formData.companyCode}
              onChange={(e) => handleChange('companyCode', e.target.value)}
            />

            {/* 대표자명 */}
            <TextField
              fullWidth
              label={
                <>
                  대표자명
                  <Typography component="span" sx={{ color: 'info.main', ml: 0.5 }}>
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
                  <Typography component="span" sx={{ color: 'info.main', ml: 0.5 }}>
                    *
                  </Typography>
                </>
              }
              placeholder="02-1234-5678"
              value={formData.representativePhone}
              onChange={(e) => handleChange('representativePhone', e.target.value)}
            />

            {/* 대표 이메일 */}
            <TextField
              fullWidth
              label={
                <>
                  대표 이메일
                  <Typography component="span" sx={{ color: 'info.main', ml: 0.5 }}>
                    *
                  </Typography>
                </>
              }
              placeholder="contact@company.com"
              type="email"
              value={formData.representativeEmail}
              onChange={(e) => handleChange('representativeEmail', e.target.value)}
            />

            {/* 업태, 종목 */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth
                label="업태"
                placeholder="업태"
                value={formData.businessCategory}
                onChange={(e) => handleChange('businessCategory', e.target.value)}
              />
              <TextField
                fullWidth
                label="종목"
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
                label="사업장 주소"
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
              label="상세주소"
              placeholder="상세주소"
              value={formData.detailAddress}
              onChange={(e) => handleChange('detailAddress', e.target.value)}
            />

            {/* 구독 서비스 */}
            <FormControl fullWidth>
              <InputLabel id="subscription-service-label">구독 서비스</InputLabel>
              <Select
                labelId="subscription-service-label"
                label="구독 서비스"
                value={formData.subscriptionService}
                onChange={(e) => handleChange('subscriptionService', e.target.value)}
              >
                {['기본', '프리미엄', '엔터프라이즈'].map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

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
        <Button
          variant="outlined"
          onClick={handleClose}
          disabled={createOrganizationMutation.isPending}
        >
          취소
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={createOrganizationMutation.isPending}
        >
          {createOrganizationMutation.isPending ? '등록 중...' : '등록'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
