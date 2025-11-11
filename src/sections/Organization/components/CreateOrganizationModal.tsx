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
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import InputAdornment from '@mui/material/InputAdornment';

import { Iconify } from 'src/components/iconify';

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

export type OrganizationFormData = {
  division: string; // 구분
  organizationName: string; // 조직명
  businessType: string; // 사업자 유형
  businessNumber: string; // 사업자 번호
  representativeName: string; // 대표자명
  representativePhone: string; // 대표 전화번호
  representativeEmail: string; // 대표 이메일
  businessCategory: string; // 업태
  businessItem: string; // 종목
  address: string; // 사업장 주소
  detailAddress: string; // 상세주소
  manager: string; // 담당자
  subscriptionService: string; // 구독 서비스
  sendInvitationEmail: boolean; // 초대 이메일 발송 여부
};

type Props = {
  open: boolean;
  onClose: () => void;
  onSave: (data: OrganizationFormData) => void;
};

const DIVISION_OPTIONS = ['운영사', '회원사', '총판', '대리점', '딜러', '비회원'];
const BUSINESS_TYPE_OPTIONS = ['개인사업자', '법인사업자'];
const SUBSCRIPTION_SERVICE_OPTIONS = ['기본', '프리미엄', '엔터프라이즈'];

export default function CreateOrganizationModal({ open, onClose, onSave }: Props) {
  const [formData, setFormData] = useState<OrganizationFormData>({
    division: '',
    organizationName: '',
    businessType: '',
    businessNumber: '',
    representativeName: '',
    representativePhone: '',
    representativeEmail: '',
    businessCategory: '',
    businessItem: '',
    address: '',
    detailAddress: '',
    manager: '',
    subscriptionService: '',
    sendInvitationEmail: false,
  });

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
      setFormData({
        division: '',
        organizationName: '',
        businessType: '',
        businessNumber: '',
        representativeName: '',
        representativePhone: '',
        representativeEmail: '',
        businessCategory: '',
        businessItem: '',
        address: '',
        detailAddress: '',
        manager: '',
        subscriptionService: '',
        sendInvitationEmail: false,
      });
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

  const handleSubmit = () => {
    // 필수 필드 검증
    if (
      !formData.division ||
      !formData.organizationName ||
      !formData.representativeName ||
      !formData.representativePhone ||
      !formData.representativeEmail ||
      !formData.manager
    ) {
      alert('필수 항목을 모두 입력해주세요.');
      return;
    }
    onSave(formData);
    onClose();
  };

  const handleClose = () => {
    setFormData({
      division: '',
      organizationName: '',
      businessType: '',
      businessNumber: '',
      representativeName: '',
      representativePhone: '',
      representativeEmail: '',
      businessCategory: '',
      businessItem: '',
      address: '',
      detailAddress: '',
      manager: '',
      subscriptionService: '',
      sendInvitationEmail: false,
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
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
        <Box>
          <Stack spacing={3}>
            {/* 첫 번째 행: 구분, 조직명 */}
            <Stack direction="row" spacing={2}>
              <FormControl fullWidth>
                <InputLabel id="division-label">
                  구분
                  <Typography component="span" sx={{ color: 'info.main', ml: 0.5 }}>
                    *
                  </Typography>
                </InputLabel>
                <Select
                  labelId="division-label"
                  label="구분 *"
                  value={formData.division}
                  onChange={(e) => handleChange('division', e.target.value)}
                >
                  {DIVISION_OPTIONS.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
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
                placeholder="조직명"
                value={formData.organizationName}
                onChange={(e) => handleChange('organizationName', e.target.value)}
              />
            </Stack>

            {/* 두 번째 행: 사업자 유형, 사업자 번호 */}
            <Stack direction="row" spacing={2}>
              <FormControl fullWidth>
                <InputLabel id="business-type-label">사업자 유형</InputLabel>
                <Select
                  labelId="business-type-label"
                  label="사업자 유형"
                  value={formData.businessType}
                  onChange={(e) => handleChange('businessType', e.target.value)}
                >
                  {BUSINESS_TYPE_OPTIONS.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="사업자 번호"
                placeholder="사업자 번호"
                value={formData.businessNumber}
                onChange={(e) => handleChange('businessNumber', e.target.value)}
              />
            </Stack>

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
              placeholder="대표자명"
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
              placeholder="대표 전화번호"
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
              placeholder="대표 이메일"
              type="email"
              value={formData.representativeEmail}
              onChange={(e) => handleChange('representativeEmail', e.target.value)}
            />

            {/* 업태, 종목 */}
            <Stack direction="row" spacing={2}>
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
                placeholder="사업장 주소"
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

            {/* 담당자 */}
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
              placeholder="담당자"
              value={formData.manager}
              onChange={(e) => handleChange('manager', e.target.value)}
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
                {SUBSCRIPTION_SERVICE_OPTIONS.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* 초대 이메일 발송 체크박스 */}
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.sendInvitationEmail}
                  onChange={(e) => handleChange('sendInvitationEmail', e.target.checked)}
                />
              }
              label="초대 이메일을 발송합니다."
            />
          </Stack>
        </Box>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ p: 3 }}>
        <Button variant="outlined" onClick={handleClose}>
          취소
        </Button>
        <Button variant="contained" onClick={handleSubmit}>
          등록
        </Button>
      </DialogActions>
    </Dialog>
  );
}
