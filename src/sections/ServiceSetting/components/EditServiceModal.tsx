import { useState, useEffect } from 'react';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';

import { Iconify } from 'src/components/iconify';
import type { ServiceSetting } from 'src/_mock/_service-setting';

// ----------------------------------------------------------------------

export type ServiceEditFormData = {
  serviceName: string;
  servicePeriod: string;
  memberCount: number | '';
  monthlyFee: number | '';
  status: 'active' | 'inactive';
};

type Props = {
  open: boolean;
  onClose: () => void;
  onSave: (data: ServiceEditFormData) => void;
  initialData?: ServiceSetting | null;
};

const SERVICE_PERIOD_OPTIONS = ['1개월', '3개월', '6개월', '12개월'];

export default function EditServiceModal({ open, onClose, onSave, initialData }: Props) {
  const [formData, setFormData] = useState<ServiceEditFormData>({
    serviceName: '',
    servicePeriod: '',
    memberCount: '',
    monthlyFee: '',
    status: 'active',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof Omit<ServiceEditFormData, 'status'>, string>>>({});

  // 초기 데이터로 폼 채우기
  useEffect(() => {
    if (initialData && open) {
      setFormData({
        serviceName: initialData.serviceName,
        servicePeriod: initialData.servicePeriod,
        memberCount: initialData.memberCount,
        monthlyFee: initialData.monthlyFee,
        status: initialData.status,
      });
      setErrors({});
    }
  }, [initialData, open]);

  const handleChange = (field: keyof ServiceEditFormData, value: string | number | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // 에러 초기화
    if (field !== 'status' && errors[field as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof Omit<ServiceEditFormData, 'status'>, string>> = {};

    if (!formData.serviceName.trim()) {
      newErrors.serviceName = '서비스명을 입력해주세요.';
    }

    if (!formData.servicePeriod) {
      newErrors.servicePeriod = '서비스 기간을 선택해주세요.';
    }

    if (formData.memberCount === '' || formData.memberCount < 0) {
      newErrors.memberCount = '조직원 수를 입력해주세요.';
    }

    if (formData.monthlyFee === '' || formData.monthlyFee < 0) {
      newErrors.monthlyFee = '월 사용료를 입력해주세요.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) {
      return;
    }

    // TODO: TanStack Query Hook(useMutation)으로 서비스 수정 (view.tsx의 handleSaveEditService에서 처리)
    // 실제 API 호출은 view.tsx의 handleSaveEditService에서 수행됩니다.

    onSave(formData);
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      serviceName: '',
      servicePeriod: '',
      memberCount: '',
      monthlyFee: '',
      status: 'active',
    });
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          서비스 수정
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
        <Stack spacing={3} sx={{ mt: 1, pb: 3 }}>
          {/* 서비스명 */}
          <TextField
            fullWidth
            label="서비스명"
            placeholder="서비스명을 입력하세요"
            value={formData.serviceName}
            onChange={(e) => handleChange('serviceName', e.target.value)}
            error={!!errors.serviceName}
            helperText={errors.serviceName}
          />

          {/* 서비스 기간 */}
          <FormControl fullWidth error={!!errors.servicePeriod}>
            <InputLabel id="service-period-label">서비스 기간</InputLabel>
            <Select
              labelId="service-period-label"
              label="서비스 기간"
              value={formData.servicePeriod}
              onChange={(e) => handleChange('servicePeriod', e.target.value)}
            >
              {SERVICE_PERIOD_OPTIONS.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
            {errors.servicePeriod && (
              <Typography variant="caption" sx={{ color: 'error.main', mt: 0.5, ml: 1.75 }}>
                {errors.servicePeriod}
              </Typography>
            )}
          </FormControl>

          {/* 조직원 수 */}
          <TextField
            fullWidth
            label="조직원 수"
            placeholder="조직원 수를 입력하세요"
            type="number"
            value={formData.memberCount}
            onChange={(e) =>
              handleChange('memberCount', e.target.value ? Number(e.target.value) : '')
            }
            error={!!errors.memberCount}
            helperText={errors.memberCount}
            inputProps={{ min: 0 }}
          />

          {/* 월 사용료 */}
          <TextField
            fullWidth
            label="월 사용료"
            placeholder="월 사용료를 입력하세요"
            type="number"
            value={formData.monthlyFee}
            onChange={(e) =>
              handleChange('monthlyFee', e.target.value ? Number(e.target.value) : '')
            }
            error={!!errors.monthlyFee}
            helperText={errors.monthlyFee}
            inputProps={{ min: 0 }}
            InputProps={{
              endAdornment: <Typography sx={{ color: 'text.secondary', mr: 1 }}>원</Typography>,
            }}
          />
        </Stack>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ px: 3, py: 2.5 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ width: '100%' }}>
          <FormControlLabel
            control={
              <Switch
                checked={formData.status === 'active'}
                onChange={(e) => handleChange('status', e.target.checked ? 'active' : 'inactive')}
                color="primary"
              />
            }
            label={
              <Typography variant="body2" sx={{ fontWeight: 400 }}>
                활성
              </Typography>
            }
            sx={{ m: 0 }}
          />
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" onClick={handleClose} sx={{ minWidth: 64 }}>
              취소
            </Button>
            <Button variant="contained" onClick={handleSave} sx={{ minWidth: 64 }}>
              저장
            </Button>
          </Stack>
        </Stack>
      </DialogActions>
    </Dialog>
  );
}

