import { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Switch from '@mui/material/Switch';
import IconButton from '@mui/material/IconButton';

import { Iconify } from 'src/components/iconify';
import SaveConfirmModal from './SaveConfirmModal';

// ----------------------------------------------------------------------

// 빈도/심각도 구간 타입
export type FrequencySeverityRange = {
  value: number; // 값 (1, 2, 3, 4)
  label: string; // 레이블 (거의 없음, 가끔 발생, 자주 발생, 매우 자주 발생)
};

// 위험도 구간 타입
export type RiskRange = {
  min: number; // 최솟값
  max: number; // 최댓값
  label: string; // 레이블 (허용 가능, 관리 필요, 즉시 개선 등)
  enabled: boolean; // 활성화 여부
};

export type RiskAssessmentData = {
  frequency: {
    min: number;
    max: number;
    ranges: FrequencySeverityRange[];
  };
  severity: {
    min: number;
    max: number;
    ranges: FrequencySeverityRange[];
  };
  riskRanges: RiskRange[];
};

type Props = {
  open: boolean;
  onClose: () => void;
  onSave: (data: RiskAssessmentData) => void;
  initialData?: RiskAssessmentData;
};

const defaultFrequencyRanges: FrequencySeverityRange[] = [
  { value: 1, label: '거의 없음' },
  { value: 2, label: '가끔 발생' },
  { value: 3, label: '자주 발생' },
  { value: 4, label: '매우 자주 발생' },
];

const defaultSeverityRanges: FrequencySeverityRange[] = [
  { value: 1, label: '거의 없음' },
  { value: 2, label: '가끔 발생' },
  { value: 3, label: '자주 발생' },
  { value: 4, label: '매우 자주 발생' },
];

const defaultRiskRanges: RiskRange[] = [
  { min: 1, max: 4, label: '허용 가능', enabled: true },
  { min: 5, max: 8, label: '관리 필요', enabled: true },
  { min: 9, max: 16, label: '즉시 개선', enabled: true },
];

export default function RiskAssessmentSettingModal({ open, onClose, onSave, initialData }: Props) {
  const [data, setData] = useState<RiskAssessmentData>(
    initialData || {
      frequency: {
        min: 1,
        max: 4,
        ranges: defaultFrequencyRanges,
      },
      severity: {
        min: 1,
        max: 4,
        ranges: defaultSeverityRanges,
      },
      riskRanges: defaultRiskRanges,
    }
  );

  const [showSaveConfirm, setShowSaveConfirm] = useState(false);

  const handleFrequencyAutoGenerate = () => {
    const ranges: FrequencySeverityRange[] = [];
    for (let i = data.frequency.min; i <= data.frequency.max; i++) {
      const existingRange = data.frequency.ranges.find((r) => r.value === i);
      ranges.push(
        existingRange || {
          value: i,
          label:
            i === 1
              ? '거의 없음'
              : i === 2
                ? '가끔 발생'
                : i === 3
                  ? '자주 발생'
                  : '매우 자주 발생',
        }
      );
    }
    setData((prev) => ({
      ...prev,
      frequency: { ...prev.frequency, ranges },
    }));
  };

  const handleSeverityAutoGenerate = () => {
    const ranges: FrequencySeverityRange[] = [];
    for (let i = data.severity.min; i <= data.severity.max; i++) {
      const existingRange = data.severity.ranges.find((r) => r.value === i);
      ranges.push(
        existingRange || {
          value: i,
          label:
            i === 1
              ? '거의 없음'
              : i === 2
                ? '가끔 발생'
                : i === 3
                  ? '자주 발생'
                  : '매우 자주 발생',
        }
      );
    }
    setData((prev) => ({
      ...prev,
      severity: { ...prev.severity, ranges },
    }));
  };

  const handleFrequencyRangeChange = (
    index: number,
    field: 'value' | 'label',
    newValue: string | number
  ) => {
    const newRanges = [...data.frequency.ranges];
    newRanges[index] = { ...newRanges[index], [field]: newValue };
    setData((prev) => ({
      ...prev,
      frequency: { ...prev.frequency, ranges: newRanges },
    }));
  };

  const handleSeverityRangeChange = (
    index: number,
    field: 'value' | 'label',
    newValue: string | number
  ) => {
    const newRanges = [...data.severity.ranges];
    newRanges[index] = { ...newRanges[index], [field]: newValue };
    setData((prev) => ({
      ...prev,
      severity: { ...prev.severity, ranges: newRanges },
    }));
  };

  const handleRiskRangeChange = (
    index: number,
    field: keyof RiskRange,
    newValue: number | string | boolean
  ) => {
    const newRanges = [...data.riskRanges];
    newRanges[index] = { ...newRanges[index], [field]: newValue };
    setData((prev) => ({
      ...prev,
      riskRanges: newRanges,
    }));
  };

  const handleAddRiskRange = () => {
    const newRange: RiskRange = {
      min: 1,
      max: 4,
      label: '',
      enabled: true,
    };
    setData((prev) => ({
      ...prev,
      riskRanges: [...prev.riskRanges, newRange],
    }));
  };

  const handleDeleteRiskRange = (index: number) => {
    const newRanges = data.riskRanges.filter((_, i) => i !== index);
    setData((prev) => ({
      ...prev,
      riskRanges: newRanges,
    }));
  };

  const handleSave = () => {
    // TODO: API 호출하여 위험성 평가 기준 저장
    setShowSaveConfirm(true);
  };

  const handleSaveConfirm = () => {
    onSave(data);
    setShowSaveConfirm(false);
    handleClose();
  };

  const handleSaveCancel = () => {
    setShowSaveConfirm(false);
  };

  const handleClose = () => {
    setData(
      initialData || {
        frequency: {
          min: 1,
          max: 4,
          ranges: defaultFrequencyRanges,
        },
        severity: {
          min: 1,
          max: 4,
          ranges: defaultSeverityRanges,
        },
        riskRanges: defaultRiskRanges,
      }
    );
    setShowSaveConfirm(false);
    onClose();
  };

  return (
    <>
      <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontSize: 18, fontWeight: 600, pb: 2 }}>
          위험성 평가 기준 설정
        </DialogTitle>

        <DialogContent>
          <Stack spacing={3} sx={{ pt: 1, pb: 2 }}>
            {/* 빈도 설정 */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 2, fontSize: 14, fontWeight: 600 }}>
                빈도 설정
              </Typography>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                <TextField
                  label="최솟값"
                  type="number"
                  size="small"
                  value={data.frequency.min}
                  onChange={(e) =>
                    setData((prev) => ({
                      ...prev,
                      frequency: { ...prev.frequency, min: Number(e.target.value) },
                    }))
                  }
                  sx={{ width: 130 }}
                />
                <TextField
                  label="최댓값"
                  type="number"
                  size="small"
                  value={data.frequency.max}
                  onChange={(e) =>
                    setData((prev) => ({
                      ...prev,
                      frequency: { ...prev.frequency, max: Number(e.target.value) },
                    }))
                  }
                  sx={{ width: 130 }}
                />
                <Button
                  variant="contained"
                  color="info"
                  onClick={handleFrequencyAutoGenerate}
                  sx={{ minWidth: 100 }}
                >
                  구간 자동 생성
                </Button>
              </Stack>
              <Stack spacing={2}>
                {data.frequency.ranges.map((range, index) => (
                  <Stack key={index} direction="row" spacing={2} alignItems="center">
                    <TextField
                      type="number"
                      size="small"
                      value={range.value}
                      onChange={(e) =>
                        handleFrequencyRangeChange(index, 'value', Number(e.target.value))
                      }
                      disabled
                      sx={{
                        width: 150,
                        bgcolor: 'grey.100',
                        '& .MuiInputBase-root': {
                          bgcolor: 'grey.100',
                        },
                      }}
                    />
                    <TextField
                      size="small"
                      value={range.label}
                      onChange={(e) => handleFrequencyRangeChange(index, 'label', e.target.value)}
                      fullWidth
                      sx={{ flex: 1, maxWidth: 270 }}
                    />
                  </Stack>
                ))}
              </Stack>
            </Box>

            {/* 심각도 설정 */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 2, fontSize: 14, fontWeight: 600 }}>
                심각도 설정
              </Typography>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                <TextField
                  label="최솟값"
                  type="number"
                  size="small"
                  value={data.severity.min}
                  onChange={(e) =>
                    setData((prev) => ({
                      ...prev,
                      severity: { ...prev.severity, min: Number(e.target.value) },
                    }))
                  }
                  sx={{ width: 130 }}
                />
                <TextField
                  label="최댓값"
                  type="number"
                  size="small"
                  value={data.severity.max}
                  onChange={(e) =>
                    setData((prev) => ({
                      ...prev,
                      severity: { ...prev.severity, max: Number(e.target.value) },
                    }))
                  }
                  sx={{ width: 130 }}
                />
                <Button
                  variant="contained"
                  color="info"
                  onClick={handleSeverityAutoGenerate}
                  sx={{ minWidth: 100 }}
                >
                  구간 자동 생성
                </Button>
              </Stack>
              <Stack spacing={2}>
                {data.severity.ranges.map((range, index) => (
                  <Stack key={index} direction="row" spacing={2} alignItems="center">
                    <TextField
                      type="number"
                      size="small"
                      value={range.value}
                      onChange={(e) =>
                        handleSeverityRangeChange(index, 'value', Number(e.target.value))
                      }
                      disabled
                      sx={{
                        width: 150,
                        bgcolor: 'grey.100',
                        '& .MuiInputBase-root': {
                          bgcolor: 'grey.100',
                        },
                      }}
                    />
                    <TextField
                      size="small"
                      value={range.label}
                      onChange={(e) => handleSeverityRangeChange(index, 'label', e.target.value)}
                      fullWidth
                      sx={{ flex: 1, maxWidth: 270 }}
                    />
                  </Stack>
                ))}
              </Stack>
            </Box>

            {/* 위험도(빈도x심각도) 설정 */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 2, fontSize: 14, fontWeight: 600 }}>
                위험도(빈도x심각도) 설정
              </Typography>
              <Stack spacing={2}>
                {data.riskRanges.map((range, index) => (
                  <Stack key={index} direction="row" spacing={2} alignItems="center">
                    <TextField
                      type="number"
                      size="small"
                      value={range.min}
                      onChange={(e) => handleRiskRangeChange(index, 'min', Number(e.target.value))}
                      sx={{ width: 60 }}
                    />
                    <Typography sx={{ fontSize: 14 }}>~</Typography>
                    <TextField
                      type="number"
                      size="small"
                      value={range.max}
                      onChange={(e) => handleRiskRangeChange(index, 'max', Number(e.target.value))}
                      sx={{ width: 60 }}
                    />
                    <TextField
                      size="small"
                      value={range.label}
                      onChange={(e) => handleRiskRangeChange(index, 'label', e.target.value)}
                      sx={{ width: 90 }}
                    />
                    <Switch
                      checked={range.enabled}
                      onChange={(e) => handleRiskRangeChange(index, 'enabled', e.target.checked)}
                    />
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteRiskRange(index)}
                      sx={{ color: 'text.secondary' }}
                    >
                      <Iconify icon="solar:trash-bin-trash-bold" width={24} />
                    </IconButton>
                  </Stack>
                ))}
              </Stack>
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<Iconify icon="mingcute:add-line" width={20} />}
                  onClick={handleAddRiskRange}
                >
                  항목추가
                </Button>
              </Box>
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2.5 }}>
          <Box sx={{ display: 'flex', gap: 1, width: '100%', justifyContent: 'flex-end' }}>
            <Button onClick={handleClose} variant="outlined" sx={{ minWidth: 64 }}>
              닫기
            </Button>
            <Button onClick={handleSave} variant="contained" sx={{ minWidth: 64 }}>
              저장
            </Button>
          </Box>
        </DialogActions>
      </Dialog>

      {/* 저장 확인 모달 */}
      <SaveConfirmModal
        open={showSaveConfirm}
        onClose={handleSaveCancel}
        onConfirm={handleSaveConfirm}
      />
    </>
  );
}
