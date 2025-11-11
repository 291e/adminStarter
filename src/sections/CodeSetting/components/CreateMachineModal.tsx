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
import Autocomplete from '@mui/material/Autocomplete';
import Chip from '@mui/material/Chip';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export type MachineFormData = {
  code: string;
  name: string;
  inspectionCycle: string;
  protectiveDevices: string[];
  riskTypes: string[];
};

type Props = {
  open: boolean;
  onClose: () => void;
  onSave: (data: MachineFormData) => void;
};

const INSPECTION_CYCLE_OPTIONS = ['1개월', '3개월', '6개월', '1년', '2년'];

const PROTECTIVE_DEVICE_OPTIONS = [
  '양수조작식 방호장치',
  '광전자식 방호장치',
  '권과방지장치',
  '훅 방지장치',
  '과부하방지장치',
  '안전장치',
  '비상정지장치',
  '가드',
  '인터록',
  '안전밸브',
  '압력계',
  '안전커버',
];

const RISK_TYPE_OPTIONS = [
  '협착',
  '절단',
  '끼임',
  '추락',
  '충돌',
  '충격',
  '화상',
  '폭발',
  '분진',
];

export default function CreateMachineModal({ open, onClose, onSave }: Props) {
  const [formData, setFormData] = useState<MachineFormData>({
    code: '',
    name: '',
    inspectionCycle: '',
    protectiveDevices: [],
    riskTypes: [],
  });

  const [errors, setErrors] = useState<Partial<Record<keyof MachineFormData, string>>>({});

  const handleChange = (field: keyof MachineFormData, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // 에러 초기화
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof MachineFormData, string>> = {};

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

    // TODO: TanStack Query Hook(useMutation)으로 기계·설비 등록 (view.tsx의 handleSaveMachine에서 처리)
    // 실제 API 호출은 view.tsx의 handleSaveMachine에서 수행됩니다.

    onSave(formData);
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      code: '',
      name: '',
      inspectionCycle: '',
      protectiveDevices: [],
      riskTypes: [],
    });
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          기계·설비 등록
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

          {/* 방호장치 */}
          <Autocomplete
            multiple
            options={PROTECTIVE_DEVICE_OPTIONS}
            value={formData.protectiveDevices}
            onChange={(_, newValue) => handleChange('protectiveDevices', newValue)}
            renderInput={(params) => <TextField {...params} label="방호장치" />}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  {...getTagProps({ index })}
                  key={option}
                  label={option}
                  size="small"
                  variant="outlined"
                />
              ))
            }
          />

          {/* 주요 위험유형 */}
          <Autocomplete
            multiple
            options={RISK_TYPE_OPTIONS}
            value={formData.riskTypes}
            onChange={(_, newValue) => handleChange('riskTypes', newValue)}
            renderInput={(params) => <TextField {...params} label="주요 위험유형" />}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  {...getTagProps({ index })}
                  key={option}
                  label={option}
                  size="small"
                  variant="outlined"
                />
              ))
            }
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

