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
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import Box from '@mui/material/Box';
import InputAdornment from '@mui/material/InputAdornment';
import Link from '@mui/material/Link';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { type Dayjs } from 'dayjs';

import { Iconify } from 'src/components/iconify';
import type { ApiSetting } from 'src/_mock/_api-setting';
import { fDateTime } from 'src/utils/format-time';

// ----------------------------------------------------------------------

export type ApiEditFormData = {
  name: string;
  provider: string;
  apiUrl: string;
  apiKey: string;
  expirationDate: Dayjs | null;
  status: 'active' | 'inactive';
};

type Props = {
  open: boolean;
  onClose: () => void;
  onSave: (data: ApiEditFormData) => void;
  initialData?: ApiSetting | null;
};

export default function EditApiModal({ open, onClose, onSave, initialData }: Props) {
  const [formData, setFormData] = useState<ApiEditFormData>({
    name: '',
    provider: '',
    apiUrl: '',
    apiKey: '',
    expirationDate: null,
    status: 'active',
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof Omit<ApiEditFormData, 'status'>, string>>
  >({});

  const [showApiKey, setShowApiKey] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  // 초기 데이터로 폼 채우기
  useEffect(() => {
    if (initialData && open) {
      setFormData({
        name: initialData.name,
        provider: initialData.provider,
        apiUrl: '', // TODO: TanStack Query Hook(useQuery)으로 API URL 가져오기
        apiKey: '', // 마스킹된 값이므로 빈 문자열로 시작
        expirationDate: initialData.expirationDate ? dayjs(initialData.expirationDate) : null,
        status: initialData.status,
      });
      setErrors({});
      setShowApiKey(false);
    }
  }, [initialData, open]);

  const handleChange = (
    field: keyof ApiEditFormData,
    value: string | Dayjs | null | boolean | 'active' | 'inactive'
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // 에러 초기화
    if (field !== 'status' && errors[field as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleReplaceKey = () => {
    setShowApiKey(true);
    setFormData((prev) => ({ ...prev, apiKey: '' }));
    // TODO: TanStack Query Hook(useMutation)으로 새 Key 생성 또는 입력 모드로 전환
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof Omit<ApiEditFormData, 'status'>, string>> = {};

    if (!formData.apiUrl.trim()) {
      newErrors.apiUrl = 'API URL을 입력해주세요.';
    }

    if (showApiKey && !formData.apiKey.trim()) {
      newErrors.apiKey = 'API Key를 입력해주세요.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) {
      return;
    }

    if (!initialData) return;

    // 확인 모달 열기
    setConfirmModalOpen(true);
  };

  const handleConfirmSave = () => {
    if (!initialData) return;

    // TODO: TanStack Query Hook(useMutation)으로 API 수정 (view.tsx의 handleSaveEditApi에서 처리)
    // 실제 API 호출은 view.tsx의 handleSaveEditApi에서 수행됩니다.
    // await updateApi(initialData.id, {
    //   name: formData.name,
    //   provider: formData.provider,
    //   apiUrl: formData.apiUrl,
    //   apiKey: showApiKey ? formData.apiKey : undefined, // Key 교체 시에만 전송
    //   expirationDate: formData.expirationDate ? formData.expirationDate.format('YYYY-MM-DD') : null,
    //   status: formData.status,
    // });

    onSave(formData);
    setConfirmModalOpen(false);
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      name: '',
      provider: '',
      apiUrl: '',
      apiKey: '',
      expirationDate: null,
      status: 'active',
    });
    setErrors({});
    setShowApiKey(false);
    onClose();
  };

  const registrationDate = initialData?.registrationDate
    ? fDateTime(initialData.registrationDate)
    : '-';
  const modificationDate = initialData?.registrationDate
    ? fDateTime(initialData.registrationDate)
    : '-'; // TODO: TanStack Query Hook(useQuery)으로 수정일 가져오기

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          API 설정
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

      {/* 등록일/수정일 정보 */}
      <Box
        sx={{
          bgcolor: 'grey.50',
          px: 3,
          py: 2,
          display: 'flex',
          gap: 3,
        }}
      >
        <Stack spacing={0.5}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="subtitle2" sx={{ minWidth: 100 }}>
              등록일
            </Typography>
            <Typography variant="body2">{registrationDate}</Typography>
          </Stack>
        </Stack>
        <Stack spacing={0.5}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="subtitle2" sx={{ minWidth: 100 }}>
              수정일
            </Typography>
            <Typography variant="body2">{modificationDate}</Typography>
          </Stack>
        </Stack>
      </Box>

      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1, pb: 3 }}>
          {/* API 이름 */}
          <TextField
            fullWidth
            label="API 이름"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            error={!!errors.name}
            helperText={errors.name}
          />

          {/* 제공기관 */}
          <TextField
            fullWidth
            label="제공기관"
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
            value={formData.apiUrl}
            onChange={(e) => handleChange('apiUrl', e.target.value)}
            error={!!errors.apiUrl}
            helperText={errors.apiUrl}
            InputProps={{
              endAdornment: formData.apiUrl ? (
                <InputAdornment position="end">
                  <Link href={formData.apiUrl} target="_blank" rel="noopener noreferrer">
                    <Iconify icon="eva:external-link-fill" width={20} />
                  </Link>
                </InputAdornment>
              ) : null,
            }}
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
            type={showApiKey ? 'text' : 'password'}
            value={showApiKey ? formData.apiKey : '**********'}
            onChange={(e) => handleChange('apiKey', e.target.value)}
            error={!!errors.apiKey}
            helperText={errors.apiKey}
            disabled={!showApiKey}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Button
                    variant="contained"
                    color="info"
                    size="small"
                    onClick={handleReplaceKey}
                    sx={{ minWidth: 80 }}
                  >
                    Key 교체
                  </Button>
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiInputBase-root': {
                bgcolor: showApiKey ? 'background.paper' : 'grey.50',
              },
            }}
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
        <FormControlLabel
          control={
            <Switch
              checked={formData.status === 'active'}
              onChange={(e) => handleChange('status', e.target.checked ? 'active' : 'inactive')}
              color="primary"
            />
          }
          label="활성"
        />
        <Box sx={{ flex: 1 }} />
        <Button variant="outlined" onClick={handleClose} sx={{ minWidth: 64 }}>
          취소
        </Button>
        <Button variant="contained" onClick={handleSave} sx={{ minWidth: 64 }}>
          저장
        </Button>
      </DialogActions>

      {/* 확인 모달 */}
      <Dialog
        open={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogContent>
          <Stack spacing={2} alignItems="center" sx={{ pt: 2 }}>
            {/* 경고 아이콘 */}
            <Box
              sx={{
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Iconify
                icon={'solar:danger-circle-bold' as any}
                width={64}
                sx={{ color: 'warning.main' }}
              />
            </Box>

            {/* 메시지 */}
            <Stack alignItems="center">
              <Typography sx={{ fontWeight: 700, textAlign: 'center' }}>
                API 설정 변경 시 유해인자 검색에 영향을 줄 수 있습니다.
              </Typography>
              <Typography sx={{ fontWeight: 700, textAlign: 'center' }}>
                변경 내용을 저장하시겠습니까?
              </Typography>
            </Stack>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, justifyContent: 'center', gap: 1 }}>
          <Button
            variant="outlined"
            onClick={() => setConfirmModalOpen(false)}
            sx={{ minWidth: 64 }}
          >
            취소
          </Button>
          <Button variant="contained" onClick={handleConfirmSave} sx={{ minWidth: 64 }}>
            확인
          </Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
}
