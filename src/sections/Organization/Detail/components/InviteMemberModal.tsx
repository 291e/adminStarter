import { useEffect, useState } from 'react';

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
import { useInviteMember } from '../../hooks/use-organization-api';

// ----------------------------------------------------------------------

export type InviteMemberFormData = {
  organizationName: string;
  role: string;
  email: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  companyIdx: number;
  onInvited?: () => void;
  organizationName?: string;
  roles?: { value: string; label: string }[];
};

const DEFAULT_ROLES = [
  { value: 'OPERATOR_MANAGER', label: '조직 관리자' },
  { value: 'MANAGEMENT_SUPERVISOR', label: '관리 감독자' },
  { value: 'SAFETY_MANAGER', label: '안전보건 담당자' },
  { value: 'WORKER', label: '근로자' },
];

export default function InviteMemberModal({
  open,
  onClose,
  companyIdx,
  onInvited,
  organizationName = '이편한 자동화기술',
  roles = DEFAULT_ROLES,
}: Props) {
  const [formData, setFormData] = useState<InviteMemberFormData>({
    organizationName,
    role: '',
    email: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof InviteMemberFormData, string>>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const inviteMemberMutation = useInviteMember();
  const isSubmitting = inviteMemberMutation.isPending;

  useEffect(() => {
    setFormData((prev) => ({ ...prev, organizationName }));
  }, [organizationName]);

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

  const handleSend = async () => {
    if (!validate()) {
      return;
    }

    const email = formData.email.trim();

    if (import.meta.env.DEV) {
      console.log('📤 [InviteMemberModal] 조직원 초대 요청', {
        companyIdx,
        email,
        memberRole: formData.role,
      });
    }

    try {
      await inviteMemberMutation.mutateAsync({
        companyIdx,
        email,
        memberRole: formData.role,
      });

      if (import.meta.env.DEV) {
        console.log('✅ [InviteMemberModal] 조직원 초대 성공');
      }
      setSubmitError(null);
      onInvited?.();
      handleClose();
    } catch (error: any) {
      console.error('❌ [InviteMemberModal] 조직원 초대 실패', error);
      setSubmitError('조직원 초대에 실패했습니다. 잠시 후 다시 시도해주세요.');
    }
  };

  const handleClose = () => {
    setFormData({
      organizationName,
      role: '',
      email: '',
    });
    setErrors({});
    setSubmitError(null);
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
          <DialogBtn
            variant="contained"
            onClick={handleSend}
            disabled={isSubmitting}
            sx={{ minHeight: 36, fontSize: 14 }}
          >
            {isSubmitting ? '발송 중...' : '발송'}
          </DialogBtn>
        </Stack>
        {submitError && (
          <Typography variant="caption" color="error" sx={{ pr: 3, pb: 2 }}>
            {submitError}
          </Typography>
        )}
      </DialogActions>
    </Dialog>
  );
}
