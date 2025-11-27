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
import Box from '@mui/material/Box';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';

import { Iconify } from 'src/components/iconify';
import type { CodeSetting } from 'src/services/code-setting/code-setting.types';
import { fDateTime } from 'src/utils/format-time';

// ----------------------------------------------------------------------

export type MachineEditFormData = {
  code: string;
  name: string;
  inspectionTarget: string;
  protectiveDevices: string;
  inspectionCycle: string;
  riskTypes: string;
  status: 'ACTIVE' | 'INACTIVE' | 'active' | 'inactive';
};

type Props = {
  open: boolean;
  onClose: () => void;
  onSave: (data: MachineEditFormData) => void;
  initialData?: CodeSetting | null;
};

const INSPECTION_TARGET_OPTIONS = ['산업안전보건법', '안전보건관리규정', '기계설비 안전관리규정'];

const INSPECTION_CYCLE_OPTIONS = ['1개월', '3개월', '6개월', '1년', '2년'];

export default function EditMachineModal({ open, onClose, onSave, initialData }: Props) {
  const [formData, setFormData] = useState<MachineEditFormData>({
    code: '',
    name: '',
    inspectionTarget: '',
    protectiveDevices: '',
    inspectionCycle: '',
    riskTypes: '',
    status: 'ACTIVE',
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof Omit<MachineEditFormData, 'status'>, string>>
  >({});

  // 초기 데이터로 폼 채우기
  useEffect(() => {
    if (initialData && open) {
      // protectiveDevices와 riskTypes가 배열이면 문자열로 변환, 아니면 그대로 사용
      const protectiveDevicesString =
        Array.isArray(initialData.protectiveDevices) && initialData.protectiveDevices.length > 0
          ? initialData.protectiveDevices.join(', ')
          : typeof initialData.protectiveDevices === 'string'
            ? initialData.protectiveDevices
            : '';

      const riskTypesString =
        Array.isArray(initialData.riskTypes) && initialData.riskTypes.length > 0
          ? initialData.riskTypes.join(', ')
          : typeof initialData.riskTypes === 'string'
            ? initialData.riskTypes
            : '';

      const statusValue =
        typeof initialData.status === 'string'
          ? initialData.status.toUpperCase() === 'ACTIVE'
            ? 'ACTIVE'
            : 'INACTIVE'
          : 'ACTIVE';

      setFormData({
        code: initialData.code,
        name: initialData.name,
        inspectionTarget: initialData.inspectionTarget || '',
        protectiveDevices: protectiveDevicesString,
        inspectionCycle: initialData.inspectionCycle || '',
        riskTypes: riskTypesString,
        status: statusValue,
      });
      setErrors({});
    }
  }, [initialData, open]);

  const handleChange = (field: keyof MachineEditFormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // 에러 초기화
    if (field !== 'status' && errors[field as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof Omit<MachineEditFormData, 'status'>, string>> = {};

    if (!formData.code.trim()) {
      newErrors.code = '기계·설비 코드를 입력해주세요.';
    }

    if (!formData.name.trim()) {
      newErrors.name = '기계·설비명을 입력해주세요.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) {
      return;
    }

    // TODO: TanStack Query Hook(useMutation)으로 기계·설비 수정 (view.tsx의 handleSaveEditMachine에서 처리)
    // 실제 API 호출은 view.tsx의 handleSaveEditMachine에서 수행됩니다.

    onSave(formData);
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      code: '',
      name: '',
      inspectionTarget: '',
      protectiveDevices: '',
      inspectionCycle: '',
      riskTypes: '',
      status: 'active',
    });
    setErrors({});
    onClose();
  };

  // 등록일/수정일 정보
  // TODO: TanStack Query Hook(useQuery)으로 등록일/수정일 정보 가져오기
  // const { data: codeDetail } = useQuery({
  //   queryKey: ['codeDetail', initialData?.id],
  //   queryFn: () => getCodeDetail(initialData?.id),
  //   enabled: !!initialData?.id,
  // });
  const registrationDate = initialData
    ? fDateTime(initialData.createAt, 'YYYY-MM-DD HH:mm:ss')
    : '-';
  const modifiedDate = initialData ? fDateTime(initialData.updateAt, 'YYYY-MM-DD HH:mm:ss') : '-';
  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography component="div" variant="h6" sx={{ fontWeight: 600 }}>
          기계·설비 수정
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

      {/* 등록일/수정일 정보 영역 */}
      <Box
        sx={{
          bgcolor: 'grey.50',
          px: 3,
          py: 2,
          display: 'flex',
          gap: 2,
        }}
      >
        <Stack spacing={0.5}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="subtitle2" sx={{ fontWeight: 600, minWidth: 100 }}>
              등록일
            </Typography>
            <Typography variant="body2">{registrationDate}</Typography>
          </Stack>
        </Stack>
        <Stack spacing={0.5}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="subtitle2" sx={{ fontWeight: 600, minWidth: 100 }}>
              수정일
            </Typography>
            <Typography variant="body2">{modifiedDate}</Typography>
          </Stack>
        </Stack>
      </Box>

      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1, pb: 3 }}>
          {/* 기계·설비 코드 */}
          <TextField
            fullWidth
            label={
              <>
                기계·설비 코드
                <Typography component="span" sx={{ color: 'info.main', ml: 0.5 }}>
                  *
                </Typography>
              </>
            }
            placeholder="기계·설비 코드를 입력하세요"
            value={formData.code}
            onChange={(e) => handleChange('code', e.target.value)}
            error={!!errors.code}
            helperText={errors.code}
          />

          {/* 기계·설비명 */}
          <TextField
            fullWidth
            label={
              <>
                기계·설비명
                <Typography component="span" sx={{ color: 'info.main', ml: 0.5 }}>
                  *
                </Typography>
              </>
            }
            placeholder="기계·설비명을 입력하세요"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            error={!!errors.name}
            helperText={errors.name}
          />

          {/* 검사 대상 */}
          <FormControl fullWidth>
            <InputLabel id="inspection-target-label">검사 대상</InputLabel>
            <Select
              labelId="inspection-target-label"
              label="검사 대상"
              value={formData.inspectionTarget}
              onChange={(e) => handleChange('inspectionTarget', e.target.value)}
            >
              {INSPECTION_TARGET_OPTIONS.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* 방호장치 */}
          <TextField
            fullWidth
            label="방호장치"
            placeholder="방호장치를 입력하세요"
            value={formData.protectiveDevices}
            onChange={(e) => handleChange('protectiveDevices', e.target.value)}
            error={!!errors.protectiveDevices}
            helperText={errors.protectiveDevices}
          />

          {/* 검사주기 */}
          <FormControl fullWidth>
            <InputLabel id="inspection-cycle-label">검사주기</InputLabel>
            <Select
              labelId="inspection-cycle-label"
              label="검사주기"
              value={formData.inspectionCycle}
              onChange={(e) => handleChange('inspectionCycle', e.target.value)}
            >
              {INSPECTION_CYCLE_OPTIONS.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* 발생가능 재해형태 */}
          <TextField
            fullWidth
            label="발생가능 재해형태"
            placeholder="발생가능 재해형태를 입력하세요"
            value={formData.riskTypes}
            onChange={(e) => handleChange('riskTypes', e.target.value)}
            error={!!errors.riskTypes}
            helperText={errors.riskTypes}
          />
        </Stack>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ px: 3, py: 2.5 }}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ width: '100%' }}
        >
          <FormControlLabel
            control={
              <Switch
                checked={formData.status?.toUpperCase() === 'ACTIVE'}
                onChange={(e) => handleChange('status', e.target.checked ? 'ACTIVE' : 'INACTIVE')}
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
