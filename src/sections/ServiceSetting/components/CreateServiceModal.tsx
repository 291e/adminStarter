import { useState } from 'react';

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

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export type ServiceFormData = {
  serviceName: string;
  servicePeriod: string;
  memberCount: number | '';
  monthlyFee: number | '';
};

type Props = {
  open: boolean;
  onClose: () => void;
  onSave: (data: ServiceFormData) => void;
};

const SERVICE_PERIOD_OPTIONS = ['1개월', '3개월', '6개월', '12개월'];

export default function CreateServiceModal({ open, onClose, onSave }: Props) {
  const [formData, setFormData] = useState<ServiceFormData>({
    serviceName: '',
    servicePeriod: '',
    memberCount: '',
    monthlyFee: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ServiceFormData, string>>>({});

  const handleChange = (field: keyof ServiceFormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // 에러 초기화
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof ServiceFormData, string>> = {};

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

    // TODO: TanStack Query Hook(useMutation)으로 서비스 등록 (view.tsx의 handleSaveService에서 처리)
    // 실제 API 호출은 view.tsx의 handleSaveService에서 수행됩니다.

    onSave(formData);
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      serviceName: '',
      servicePeriod: '',
      memberCount: '',
      monthlyFee: '',
    });
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          서비스 등록
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
        <Button variant="outlined" onClick={handleClose} sx={{ minWidth: 64 }}>
          닫기
        </Button>
        <Button variant="contained" onClick={handleSave} sx={{ minWidth: 64 }}>
          등록
        </Button>
      </DialogActions>
    </Dialog>
  );
}
