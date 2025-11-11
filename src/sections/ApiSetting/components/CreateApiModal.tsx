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
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { type Dayjs } from 'dayjs';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export type ApiFormData = {
  name: string;
  provider: string;
  apiUrl: string;
  apiKey: string;
  expirationDate: Dayjs | null;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onSave: (data: ApiFormData) => void;
};

export default function CreateApiModal({ open, onClose, onSave }: Props) {
  const [formData, setFormData] = useState<ApiFormData>({
    name: '',
    provider: '',
    apiUrl: '',
    apiKey: '',
    expirationDate: null,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ApiFormData, string>>>({});

  const handleChange = (field: keyof ApiFormData, value: string | Dayjs | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // 에러 초기화
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof ApiFormData, string>> = {};

    if (!formData.apiUrl.trim()) {
      newErrors.apiUrl = 'API URL을 입력해주세요.';
    }

    if (!formData.apiKey.trim()) {
      newErrors.apiKey = 'API Key를 입력해주세요.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) {
      return;
    }

    // TODO: TanStack Query Hook(useMutation)으로 API 등록 (view.tsx의 handleSaveApi에서 처리)
    // 실제 API 호출은 view.tsx의 handleSaveApi에서 수행됩니다.

    onSave(formData);
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      name: '',
      provider: '',
      apiUrl: '',
      apiKey: '',
      expirationDate: null,
    });
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          API 등록
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
          {/* API 이름 */}
          <TextField
            fullWidth
            label="API 이름"
            placeholder="API 이름을 입력하세요"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            error={!!errors.name}
            helperText={errors.name}
          />

          {/* 제공기관 */}
          <TextField
            fullWidth
            label="제공기관"
            placeholder="제공기관을 입력하세요"
            value={formData.provider}
            onChange={(e) => handleChange('provider', e.target.value)}
            error={!!errors.provider}
            helperText={errors.provider}
          />

          {/* API URL */}
          <TextField
            fullWidth
            label={
              <>
                API URL
                <Typography component="span" sx={{ color: 'info.main', ml: 0.5 }}>
                  *
                </Typography>
              </>
            }
            placeholder="API URL을 입력하세요"
            value={formData.apiUrl}
            onChange={(e) => handleChange('apiUrl', e.target.value)}
            error={!!errors.apiUrl}
            helperText={errors.apiUrl}
          />

          {/* API Key */}
          <TextField
            fullWidth
            label={
              <>
                API Key
                <Typography component="span" sx={{ color: 'info.main', ml: 0.5 }}>
                  *
                </Typography>
              </>
            }
            placeholder="API Key를 입력하세요"
            value={formData.apiKey}
            onChange={(e) => handleChange('apiKey', e.target.value)}
            error={!!errors.apiKey}
            helperText={errors.apiKey}
          />

          {/* Key 만료일 */}
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Key 만료일"
              value={formData.expirationDate}
              onChange={(newValue) => handleChange('expirationDate', newValue)}
              format="YYYY-MM-DD"
              slotProps={{
                textField: {
                  fullWidth: true,
                  placeholder: '날짜 선택',
                  error: !!errors.expirationDate,
                  helperText: errors.expirationDate,
                },
              }}
            />
          </LocalizationProvider>
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
