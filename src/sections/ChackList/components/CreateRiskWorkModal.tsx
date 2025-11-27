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
import type { IndustryItem } from 'src/services/checklist/checklist.types';

// ----------------------------------------------------------------------

export type RiskWorkFormData = {
  industry: string; // industryIdx를 문자열로 변환한 값 또는 name
  highRiskWork: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onSave: (data: RiskWorkFormData) => void;
  industries?: IndustryItem[];
};

export default function CreateRiskWorkModal({
  open,
  onClose,
  onSave,
  industries = [],
}: Props) {
  const [formData, setFormData] = useState<RiskWorkFormData>({
    industry: '',
    highRiskWork: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof RiskWorkFormData, string>>>({});

  // 활성화된 업종만 필터링
  const activeIndustries = industries.filter((industry) => industry.isActive);

  const handleChange = (field: keyof RiskWorkFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // 에러 초기화
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof RiskWorkFormData, string>> = {};

    if (!formData.industry.trim()) {
      newErrors.industry = '업종을 선택해주세요.';
    }

    if (!formData.highRiskWork.trim()) {
      newErrors.highRiskWork = '고위험작업 및 상황을 입력해주세요.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) {
      return;
    }

    onSave(formData);
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      industry: '',
      highRiskWork: '',
    });
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography component="div" variant="h6" sx={{ fontWeight: 600 }}>
          위험작업/상황 등록
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
          {/* 업종 선택 */}
          <FormControl fullWidth error={!!errors.industry}>
            <InputLabel id="industry-select-label">업종</InputLabel>
            <Select
              labelId="industry-select-label"
              label="업종"
              value={formData.industry}
              onChange={(e) => handleChange('industry', e.target.value)}
            >
              {activeIndustries.map((industry) => (
                <MenuItem key={industry.industryIdx ?? industry.name} value={industry.name}>
                  {industry.name}
                </MenuItem>
              ))}
            </Select>
            {errors.industry && (
              <Typography variant="caption" sx={{ color: 'error.main', mt: 0.5, ml: 1.75 }}>
                {errors.industry}
              </Typography>
            )}
          </FormControl>

          {/* 고위험작업 및 상황 */}
          <TextField
            fullWidth
            label={
              <>
                고위험작업 및 상황
                <Typography component="span" sx={{ color: 'info.main', ml: 0.5 }}>
                  *
                </Typography>
              </>
            }
            value={formData.highRiskWork}
            onChange={(e) => handleChange('highRiskWork', e.target.value)}
            error={!!errors.highRiskWork}
            helperText={errors.highRiskWork}
            multiline
            rows={4}
            placeholder="고위험작업 및 상황을 입력하세요"
          />
        </Stack>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ px: 3, py: 2.5 }}>
        <Button variant="outlined" onClick={handleClose} sx={{ minWidth: 64 }}>
          취소
        </Button>
        <Button variant="contained" onClick={handleSave} sx={{ minWidth: 64 }}>
          저장
        </Button>
      </DialogActions>
    </Dialog>
  );
}
