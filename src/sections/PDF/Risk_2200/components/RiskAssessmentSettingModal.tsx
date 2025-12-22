import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
import CircularProgress from '@mui/material/CircularProgress';
import { toast } from 'sonner';

import { Iconify } from 'src/components/iconify';
import SaveConfirmModal from './SaveConfirmModal';
import {
  getRiskAssessmentCriteria,
  createRiskAssessmentCriteria,
  updateRiskAssessmentCriteria,
  deleteRiskAssessmentLevel,
  toggleRiskAssessmentLevel,
} from 'src/services/safety-system/safety-system.service';
import type {
  RiskAssessmentCriteriaResponseDto,
  FrequencyItemDto,
  SeverityItemDto,
  RiskLevelItemDto,
  CreateRiskAssessmentCriteriaDto,
} from 'src/services/safety-system/safety-system.types';

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
  riskAssessmentLevelIdx?: number; // 위험도 레벨 Index (API 응답에 포함)
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
  { value: 1, label: '경상 수준' },
  { value: 2, label: '휴업 수준' },
  { value: 3, label: '중대재해' },
  { value: 4, label: '사망사고 가능' },
];

const defaultRiskRanges: RiskRange[] = [
  { min: 1, max: 4, label: '허용 가능', enabled: true },
  { min: 5, max: 8, label: '관리 필요', enabled: true },
  { min: 9, max: 16, label: '즉시 개선', enabled: true },
];

// API 응답을 RiskAssessmentData로 변환 (export하여 다른 컴포넌트에서도 사용 가능)
export const convertApiResponseToRiskAssessmentData = (
  apiData: RiskAssessmentCriteriaResponseDto
): RiskAssessmentData => {
  // frequencyList와 severityList가 문자열 배열인 경우 파싱
  const parseFrequencyList = (
    list: string[] | FrequencyItemDto[] | undefined | null
  ): FrequencySeverityRange[] => {
    if (!list || list.length === 0) return defaultFrequencyRanges;
    if (typeof list[0] === 'string') {
      return (list as string[]).map((item, index) => {
        try {
          const parsed = JSON.parse(item);
          return { value: parsed.value || index + 1, label: parsed.label || '' };
        } catch {
          return { value: index + 1, label: item };
        }
      });
    }
    return (list as FrequencyItemDto[]).map((item) => ({
      value: item.value,
      label: item.label,
    }));
  };

  const parseSeverityList = (
    list: string[] | SeverityItemDto[] | undefined | null
  ): FrequencySeverityRange[] => {
    if (!list || list.length === 0) return defaultSeverityRanges;
    if (typeof list[0] === 'string') {
      return (list as string[]).map((item, index) => {
        try {
          const parsed = JSON.parse(item);
          return { value: parsed.value || index + 1, label: parsed.label || '' };
        } catch {
          return { value: index + 1, label: item };
        }
      });
    }
    return (list as SeverityItemDto[]).map((item) => ({
      value: item.value,
      label: item.label,
    }));
  };

  const parseRiskLevelList = (
    list: string[] | RiskLevelItemDto[] | undefined | null
  ): RiskRange[] => {
    if (!list || list.length === 0) return defaultRiskRanges;
    if (typeof list[0] === 'string') {
      return (list as string[]).map((item) => {
        try {
          const parsed = JSON.parse(item);
          return {
            min: parsed.minValue ?? parsed.min ?? 1,
            max: parsed.maxValue ?? parsed.max ?? 4,
            label: parsed.label || '',
            enabled: parsed.isActive !== undefined ? parsed.isActive === 1 : true,
            riskAssessmentLevelIdx: parsed.riskAssessmentLevelIdx,
          };
        } catch {
          return { min: 1, max: 4, label: item, enabled: true };
        }
      });
    }
    return (list as RiskLevelItemDto[]).map((item) => ({
      min: item.minValue ?? 1,
      max: item.maxValue ?? 4,
      label: item.label,
      enabled: item.isActive !== undefined ? item.isActive === 1 : true,
      riskAssessmentLevelIdx: item.riskAssessmentLevelIdx,
    }));
  };

  return {
    frequency: {
      min: apiData?.frequencyMin ?? 1,
      max: apiData?.frequencyMax ?? 5,
      ranges: parseFrequencyList(apiData?.frequencyList),
    },
    severity: {
      min: apiData?.severityMin ?? 1,
      max: apiData?.severityMax ?? 5,
      ranges: parseSeverityList(apiData?.severityList),
    },
    riskRanges: parseRiskLevelList(apiData?.riskLevelList),
  };
};

// RiskAssessmentData를 API 요청 형식으로 변환
const convertRiskAssessmentDataToApiRequest = (
  data: RiskAssessmentData
): CreateRiskAssessmentCriteriaDto => ({
  frequencyMin: data.frequency.min,
  frequencyMax: data.frequency.max,
  severityMin: data.severity.min,
  severityMax: data.severity.max,
  frequencyList: data.frequency.ranges.map((range) => ({
    value: range.value,
    label: range.label,
  })),
  severityList: data.severity.ranges.map((range) => ({
    value: range.value,
    label: range.label,
  })),
  riskLevelList: data.riskRanges.map((range) => ({
    minValue: range.min,
    maxValue: range.max,
    label: range.label,
    isActive: range.enabled ? 1 : 0,
  })),
});

export default function RiskAssessmentSettingModal({ open, onClose, onSave, initialData }: Props) {
  const queryClient = useQueryClient();

  // 위험성 평가 기준 조회
  const { data: apiData, isLoading } = useQuery({
    queryKey: ['riskAssessmentCriteria'],
    queryFn: () => getRiskAssessmentCriteria(),
    enabled: open, // 모달이 열릴 때만 조회
    staleTime: 5 * 60 * 1000, // 5분
  });

  // API 데이터를 RiskAssessmentData로 변환
  const convertedData = useMemo(() => {
    if (apiData) {
      return convertApiResponseToRiskAssessmentData(apiData);
    }
    return null;
  }, [apiData]);

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

  // API 데이터 또는 initialData가 변경되거나 모달이 열릴 때 state 업데이트
  useEffect(() => {
    if (open) {
      if (convertedData) {
        setData(convertedData);
      } else if (initialData) {
        setData(initialData);
      } else {
        setData({
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
        });
      }
    }
  }, [open, initialData, convertedData]);

  // 위험성 평가 기준 생성/수정 Mutation
  const saveMutation = useMutation({
    mutationFn: (params: CreateRiskAssessmentCriteriaDto) => {
      // 기존 데이터가 있으면 수정, 없으면 생성
      if (apiData?.riskAssessmentCriteriaIdx) {
        return updateRiskAssessmentCriteria(params);
      }
      return createRiskAssessmentCriteria(params);
    },
    onSuccess: () => {
      toast.success('위험성 평가 기준이 저장되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['riskAssessmentCriteria'] });
      onSave(data);
      setShowSaveConfirm(false);
      handleClose();
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.header?.resultMessage || error?.message || '저장에 실패했습니다.';
      toast.error(errorMessage);
    },
  });

  // 위험도 레벨 삭제 Mutation
  const deleteLevelMutation = useMutation({
    mutationFn: (riskAssessmentLevelIdx: number) =>
      deleteRiskAssessmentLevel(riskAssessmentLevelIdx),
    onSuccess: () => {
      toast.success('위험도 레벨이 삭제되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['riskAssessmentCriteria'] });
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.header?.resultMessage || error?.message || '삭제에 실패했습니다.';
      toast.error(errorMessage);
    },
  });

  // 위험도 레벨 토글 Mutation
  const toggleLevelMutation = useMutation({
    mutationFn: (riskAssessmentLevelIdx: number) =>
      toggleRiskAssessmentLevel(riskAssessmentLevelIdx),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['riskAssessmentCriteria'] });
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.header?.resultMessage || error?.message || '토글에 실패했습니다.';
      toast.error(errorMessage);
    },
  });

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
    const range = data.riskRanges[index];
    // API에서 가져온 데이터이고 riskAssessmentLevelIdx가 있으면 API 삭제 호출
    if (range.riskAssessmentLevelIdx !== undefined) {
      deleteLevelMutation.mutate(range.riskAssessmentLevelIdx);
    } else {
      // 로컬에서만 삭제
      const newRanges = data.riskRanges.filter((_, i) => i !== index);
      setData((prev) => ({
        ...prev,
        riskRanges: newRanges,
      }));
    }
  };

  const handleSave = () => {
    setShowSaveConfirm(true);
  };

  const handleSaveConfirm = () => {
    const apiRequest = convertRiskAssessmentDataToApiRequest(data);
    saveMutation.mutate(apiRequest);
  };

  const handleSaveCancel = () => {
    setShowSaveConfirm(false);
  };

  const handleClose = () => {
    // 모달이 닫힐 때는 state를 리셋하지 않고 그대로 유지
    // 다음에 열릴 때 useEffect에서 initialData로 업데이트됨
    setShowSaveConfirm(false);
    onClose();
  };

  return (
    <>
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontSize: 18, fontWeight: 600, pb: 2 }}>
          위험성 평가 기준 설정
        </DialogTitle>

        <DialogContent>
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Stack spacing={3} sx={{ pt: 1, pb: 2 }}>
              <Stack direction="row" spacing={3} sx={{ width: '100%' }}>
                {/* 빈도 설정 */}
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" sx={{ mb: 2, fontSize: 13, fontWeight: 700 }}>
                    빈도 설정
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
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
                      sx={{ width: 60 }}
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
                      sx={{ width: 60 }}
                    />
                    <Button
                      variant="contained"
                      onClick={handleFrequencyAutoGenerate}
                      sx={{
                        flex: 1,
                        height: 40,
                        fontSize: 12,
                        fontWeight: 700,
                        bgcolor: '#2863E1',
                        '&:hover': { bgcolor: '#1e4db7' },
                        whiteSpace: 'nowrap',
                      }}
                    >
                      구간 자동 생성
                    </Button>
                  </Stack>
                  <Stack spacing={1}>
                    {data.frequency.ranges.map((range, index) => (
                      <Stack key={index} direction="row" spacing={1} alignItems="center">
                        <TextField
                          type="number"
                          size="small"
                          value={range.value}
                          disabled
                          sx={{
                            width: 60,
                            bgcolor: 'grey.100',
                            '& .MuiInputBase-root': {
                              bgcolor: 'grey.100',
                              height: 40,
                            },
                            borderRadius: 1,
                          }}
                          inputProps={{ style: { textAlign: 'center' } }}
                        />
                        <TextField
                          size="small"
                          value={range.label}
                          onChange={(e) =>
                            handleFrequencyRangeChange(index, 'label', e.target.value)
                          }
                          fullWidth
                          placeholder="레이블 입력"
                          sx={{
                            '& .MuiInputBase-root': { height: 40 },
                          }}
                        />
                      </Stack>
                    ))}
                  </Stack>
                </Box>

                {/* 심각도 설정 */}
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" sx={{ mb: 2, fontSize: 13, fontWeight: 700 }}>
                    심각도 설정
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
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
                      sx={{ width: 60 }}
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
                      sx={{ width: 60 }}
                    />
                    <Button
                      variant="contained"
                      onClick={handleSeverityAutoGenerate}
                      sx={{
                        flex: 1,
                        height: 40,
                        fontSize: 12,
                        fontWeight: 700,
                        bgcolor: '#2863E1',
                        '&:hover': { bgcolor: '#1e4db7' },
                        whiteSpace: 'nowrap',
                      }}
                    >
                      구간 자동 생성
                    </Button>
                  </Stack>
                  <Stack spacing={1}>
                    {data.severity.ranges.map((range, index) => (
                      <Stack key={index} direction="row" spacing={1} alignItems="center">
                        <TextField
                          type="number"
                          size="small"
                          value={range.value}
                          disabled
                          sx={{
                            width: 60,
                            bgcolor: 'grey.100',
                            '& .MuiInputBase-root': {
                              bgcolor: 'grey.100',
                              height: 40,
                            },
                            borderRadius: 1,
                          }}
                          inputProps={{ style: { textAlign: 'center' } }}
                        />
                        <TextField
                          size="small"
                          value={range.label}
                          onChange={(e) =>
                            handleSeverityRangeChange(index, 'label', e.target.value)
                          }
                          fullWidth
                          placeholder="레이블 입력"
                          sx={{
                            '& .MuiInputBase-root': { height: 40 },
                          }}
                        />
                      </Stack>
                    ))}
                  </Stack>
                </Box>
              </Stack>

              {/* 위험도(빈도x심각도) 설정 */}
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 2, fontSize: 14, fontWeight: 600 }}>
                  위험도(빈도x심각도) 설정
                </Typography>
                <Stack spacing={1}>
                  {data.riskRanges.map((range, index) => (
                    <Stack key={index} direction="row" spacing={2} alignItems="center">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
                        <TextField
                          type="number"
                          size="small"
                          value={range.min}
                          onChange={(e) =>
                            handleRiskRangeChange(index, 'min', Number(e.target.value))
                          }
                          sx={{ width: 70 }}
                        />
                        <Typography sx={{ fontSize: 14 }}>~</Typography>
                        <TextField
                          type="number"
                          size="small"
                          value={range.max}
                          onChange={(e) =>
                            handleRiskRangeChange(index, 'max', Number(e.target.value))
                          }
                          sx={{ width: 70 }}
                        />
                      </Box>
                      <TextField
                        size="small"
                        value={range.label}
                        onChange={(e) => handleRiskRangeChange(index, 'label', e.target.value)}
                        fullWidth
                        placeholder="위험도 레이블 (예: 허용 가능)"
                        sx={{ flex: 1 }}
                      />
                      <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                        <Switch
                          checked={range.enabled}
                          onChange={(e) => {
                            const newEnabled = e.target.checked;
                            if (range.riskAssessmentLevelIdx !== undefined) {
                              toggleLevelMutation.mutate(range.riskAssessmentLevelIdx);
                            } else {
                              handleRiskRangeChange(index, 'enabled', newEnabled);
                            }
                          }}
                          disabled={toggleLevelMutation.isPending}
                        />
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteRiskRange(index)}
                          sx={{ color: 'text.secondary' }}
                        >
                          <Iconify icon="solar:trash-bin-trash-bold" width={24} />
                        </IconButton>
                      </Box>
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
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2.5 }}>
          <Box sx={{ display: 'flex', gap: 1, width: '100%', justifyContent: 'flex-end' }}>
            <Button onClick={handleClose} variant="outlined" sx={{ minWidth: 64 }}>
              닫기
            </Button>
            <Button
              onClick={handleSave}
              variant="contained"
              sx={{ minWidth: 64 }}
              disabled={saveMutation.isPending || isLoading}
            >
              {saveMutation.isPending ? '저장 중...' : '저장'}
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
