import { useState } from 'react';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputAdornment from '@mui/material/InputAdornment';

import { Iconify } from 'src/components/iconify';
import DialogBtn from 'src/components/safeyoui/button/dialogBtn';

// ----------------------------------------------------------------------

export type InviteMemberFormData = {
  organizationName: string;
  role: string;
  email: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onSend: (data: InviteMemberFormData) => void;
  organizationName?: string;
  roles?: { value: string; label: string }[];
};

const DEFAULT_ROLES = [
  { value: 'organization_admin', label: '조직 관리자' },
  { value: 'supervisor', label: '관리 감독자' },
  { value: 'safety_manager', label: '안전보건 담당자' },
  { value: 'worker', label: '근로자' },
];

export default function InviteMemberModal({
  open,
  onClose,
  onSend,
  organizationName = '이편한 자동화기술',
  roles = DEFAULT_ROLES,
}: Props) {
  const [formData, setFormData] = useState<InviteMemberFormData>({
    organizationName,
    role: '',
    email: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof InviteMemberFormData, string>>>({});

  const handleChange =
    (field: keyof InviteMemberFormData) =>
    (event: React.ChangeEvent<HTMLInputElement | { value: unknown }>) => {
      const value = typeof event.target.value === 'string' ? event.target.value : '';
      setFormData((prev) => ({ ...prev, [field]: value }));
      // 에러 초기화
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof InviteMemberFormData, string>> = {};

    if (!formData.role) {
      newErrors.role = '역할을 선택해주세요.';
    }

    if (!formData.email) {
      newErrors.email = '이메일을 입력해주세요.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '올바른 이메일 형식을 입력해주세요.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSend = () => {
    if (!validate()) {
      return;
    }

    // TODO: TanStack Query Hook(useMutation)으로 조직원 초대 API 호출
    // const mutation = useMutation({
    //   mutationFn: (data: InviteMemberFormData) => inviteMember(data),
    //   onSuccess: () => {
    //     queryClient.invalidateQueries({ queryKey: ['organization', organizationId, 'members'] });
    //     // 성공 토스트 메시지 표시
    //     handleClose();
    //   },
    //   onError: (error) => {
    //     console.error('조직원 초대 실패:', error);
    //     // 에러 토스트 메시지 표시
    //   },
    // });
    // mutation.mutate(formData);

    onSend(formData);
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      organizationName,
      role: '',
      email: '',
    });
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography component="div" variant="h6" sx={{ fontWeight: 600, fontSize: 18 }}>
          조직원 초대
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
        <Stack spacing={3} sx={{ px: 3, pt: 3, pb: 0 }}>
          {/* 조직명 필드 (읽기 전용) */}
          <TextField
            fullWidth
            variant="filled"
            value={formData.organizationName}
            disabled
            sx={{
              '& .MuiFilledInput-root': {
                bgcolor: 'grey.100',
                height: 56,
                '&:hover': {
                  bgcolor: 'grey.100',
                },
                '&.Mui-disabled': {
                  bgcolor: 'grey.100',
                },
                '& .MuiFilledInput-input': {
                  py: 2,
                  fontSize: 15,
                  lineHeight: '24px',
                },
              },
            }}
          />

          {/* 역할 필드 */}
          <FormControl fullWidth error={!!errors.role}>
            <Select
              value={formData.role}
              onChange={(e) => handleChange('role')(e as React.ChangeEvent<HTMLInputElement>)}
              displayEmpty
              renderValue={(value) => {
                if (!value) {
                  return (
                    <Typography
                      component="span"
                      sx={{ color: 'text.disabled', fontSize: 15, lineHeight: '24px' }}
                    >
                      역할<span style={{ color: '#00a76f' }}>*</span>
                    </Typography>
                  );
                }
                return roles.find((r) => r.value === value)?.label || value;
              }}
              endAdornment={
                <InputAdornment position="end">
                  <Iconify icon={`solar:chevron-down-bold` as any} width={18} />
                </InputAdornment>
              }
            >
              {roles.map((role) => (
                <MenuItem key={role.value} value={role.value}>
                  {role.label}
                </MenuItem>
              ))}
            </Select>
            {errors.role && (
              <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                {errors.role}
              </Typography>
            )}
          </FormControl>

          {/* 이메일 필드 */}
          <TextField
            fullWidth
            variant="outlined"
            placeholder="이메일*"
            value={formData.email}
            onChange={handleChange('email')}
            error={!!errors.email}
            helperText={errors.email}
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
      </DialogContent>

      <DialogActions>
        <Stack direction="row" spacing={1.5} justifyContent="flex-end" sx={{ width: '100%' }}>
          <DialogBtn variant="outlined" onClick={handleClose} sx={{ minHeight: 36, fontSize: 14 }}>
            취소
          </DialogBtn>
          <DialogBtn variant="contained" onClick={handleSend} sx={{ minHeight: 36, fontSize: 14 }}>
            발송
          </DialogBtn>
        </Stack>
      </DialogActions>
    </Dialog>
  );
}
