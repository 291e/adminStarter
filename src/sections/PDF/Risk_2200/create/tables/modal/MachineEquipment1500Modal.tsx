import { useState, useEffect, useMemo } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';

import { Iconify } from 'src/components/iconify';
import { useCodes } from 'src/sections/CodeSetting/hooks/use-code-setting-api';
import type { CodeSetting } from 'src/services/code-setting/code-setting.types';
import type { RiskAssessmentData } from '../../../components/RiskAssessmentSettingModal';

// ----------------------------------------------------------------------

type MachineEquipment1500Data = {
  machine: string; // 관련기계·기구·설비명
  machineId: string; // 관리번호
  accidentForm: string; // 발생가능 재해형태
  freq: number | string; // 위험성 평가 빈도
  sev: number | string; // 위험성 평가 심각도
  evalLabel: string; // 위험성 평가
  remark: string; // 비고
};

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: (data: MachineEquipment1500Data) => void;
  initialData?: Partial<MachineEquipment1500Data>;
  riskAssessmentData: RiskAssessmentData;
};

export default function MachineEquipment1500Modal({
  open,
  onClose,
  onConfirm,
  initialData,
  riskAssessmentData,
}: Props) {
  const [formData, setFormData] = useState<MachineEquipment1500Data>({
    machine: initialData?.machine || '',
    machineId: initialData?.machineId || '',
    accidentForm: initialData?.accidentForm || '',
    freq: initialData?.freq || '',
    sev: initialData?.sev || '',
    evalLabel: initialData?.evalLabel || '',
    remark: initialData?.remark || '',
  });

  const [searchValue, setSearchValue] = useState<CodeSetting | null>(null);
  const [inputValue, setInputValue] = useState<string>('');

  // 기계 설비 목록 조회
  const codesQuery = useCodes({
    categoryType: 'machine',
    status: 'active',
    page: 1,
    pageSize: 1000, // 전체 데이터 조회
  });

  // 기계 설비 목록
  const machineList = useMemo(() => codesQuery.data?.codeSettingList ?? [], [codesQuery.data]);

  // 검색 필터링
  const filteredOptions = useMemo(() => {
    if (!inputValue) return machineList;
    const lowerInput = inputValue.toLowerCase();
    return machineList.filter(
      (machine) =>
        machine.name?.toLowerCase().includes(lowerInput) ||
        machine.code?.toLowerCase().includes(lowerInput)
    );
  }, [machineList, inputValue]);

  // 초기 데이터가 변경되면 폼 데이터 업데이트
  useEffect(() => {
    if (initialData) {
      setFormData({
        machine: initialData.machine || '',
        machineId: initialData.machineId || '',
        accidentForm: initialData.accidentForm || '',
        freq: initialData.freq || '',
        sev: initialData.sev || '',
        evalLabel: initialData.evalLabel || '',
        remark: initialData.remark || '',
      });
      // 초기 데이터의 machine과 일치하는 기계 설비 찾기
      if (initialData.machine && machineList.length > 0) {
        const matchedMachine = machineList.find(
          (m) => m.name === initialData.machine || m.code === initialData.machineId
        );
        setSearchValue(matchedMachine || null);
      } else {
        setSearchValue(null);
      }
    }
  }, [initialData, machineList]);

  // 기계 설비 선택 시 자동 입력
  useEffect(() => {
    if (searchValue) {
      const machine = searchValue;
      setFormData((prev) => ({
        ...prev,
        machine: machine.name || prev.machine,
        machineId: machine.code || prev.machineId,
        accidentForm: Array.isArray(machine.riskTypes)
          ? machine.riskTypes.join(', ')
          : typeof machine.riskTypes === 'string'
            ? machine.riskTypes
            : prev.accidentForm,
        // freq, sev, evalLabel, remark는 API에 없으므로 기존 값 유지
      }));
    }
  }, [searchValue]);

  // riskAssessmentData에서 빈도, 심각도, 평가 옵션 생성
  const freqOptions = useMemo(
    () => riskAssessmentData.frequency.ranges.map((range) => range.value),
    [riskAssessmentData.frequency.ranges]
  );

  const sevOptions = useMemo(
    () => riskAssessmentData.severity.ranges.map((range) => range.value),
    [riskAssessmentData.severity.ranges]
  );

  const evalOptions = useMemo(() => {
    const enabledRanges = riskAssessmentData.riskRanges.filter((range) => range.enabled);

    // 빈도와 심각도의 실제 값들을 기반으로 가능한 모든 조합 계산
    const possibleValues = new Set<number>();
    for (const freqVal of freqOptions) {
      for (const sevVal of sevOptions) {
        possibleValues.add(freqVal * sevVal);
      }
    }

    // 가능한 값들에 대해 위험도 레이블 매핑
    const options: string[] = [];
    Array.from(possibleValues)
      .sort((a, b) => a - b)
      .forEach((evalValue) => {
        const matchingRange = enabledRanges.find(
          (range) => evalValue >= range.min && evalValue <= range.max
        );
        if (matchingRange) {
          options.push(`${evalValue} (${matchingRange.label})`);
        } else {
          options.push(`${evalValue}`);
        }
      });

    return options;
  }, [riskAssessmentData.riskRanges, freqOptions, sevOptions]);

  // 빈도와 심각도가 변경되면 평가 계산
  useEffect(() => {
    const freq = typeof formData.freq === 'number' ? formData.freq : Number(formData.freq) || 0;
    const sev = typeof formData.sev === 'number' ? formData.sev : Number(formData.sev) || 0;

    if (freq > 0 && sev > 0) {
      const evalValue = freq * sev;
      // 활성화된 위험도 범위에서 해당 값 찾기
      const enabledRanges = riskAssessmentData.riskRanges.filter((range) => range.enabled);
      const matchingRange = enabledRanges.find(
        (range) => evalValue >= range.min && evalValue <= range.max
      );
      if (matchingRange) {
        setFormData((prev) => ({ ...prev, evalLabel: `${evalValue} (${matchingRange.label})` }));
      } else {
        // 범위에 없는 경우 직접 입력 형식으로
        setFormData((prev) => ({ ...prev, evalLabel: `${evalValue}` }));
      }
    }
  }, [formData.freq, formData.sev, riskAssessmentData.riskRanges]);

  const handleFieldChange = (field: keyof MachineEquipment1500Data, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleConfirm = () => {
    // searchValue가 있으면 최신 데이터를 기반으로 formData 업데이트
    let finalFormData = { ...formData };

    if (searchValue) {
      const machine = searchValue;

      finalFormData = {
        ...formData,
        machine: machine.name || formData.machine,
        machineId: machine.code || formData.machineId,
        accidentForm: Array.isArray(machine.riskTypes)
          ? machine.riskTypes.join(', ')
          : typeof machine.riskTypes === 'string'
            ? machine.riskTypes
            : formData.accidentForm,
      };
    }

    onConfirm(finalFormData);
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      machine: initialData?.machine || '',
      machineId: initialData?.machineId || '',
      accidentForm: initialData?.accidentForm || '',
      freq: initialData?.freq || '',
      sev: initialData?.sev || '',
      evalLabel: initialData?.evalLabel || '',
      remark: initialData?.remark || '',
    });
    setSearchValue(null);
    setInputValue('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontSize: 18, fontWeight: 600, pb: 2 }}>
        관련기계·기구·설비명 검색
      </DialogTitle>

      <DialogContent>
        <Stack spacing={3} sx={{ pt: 1 }}>
          {/* 관련기계•기구•설비명 (오토컴플리트, 검색 아이콘 포함) */}
          <Autocomplete
            options={filteredOptions}
            value={searchValue}
            inputValue={inputValue}
            onInputChange={(_, newInputValue) => {
              setInputValue(newInputValue);
            }}
            onChange={(_, newValue) => {
              setSearchValue(newValue);
            }}
            getOptionLabel={(option) => option.name || ''}
            isOptionEqualToValue={(option, value) => option.codeSettingIdx === value.codeSettingIdx}
            loading={codesQuery.isLoading}
            renderInput={(params) => (
              <TextField
                {...params}
                label="관련기계·기구·설비명"
                placeholder="관련기계·기구·설비명을 검색하세요"
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {codesQuery.isLoading ? <CircularProgress color="inherit" size={20} /> : null}
                      <InputAdornment position="end">
                        <IconButton size="small" edge="end" sx={{ mr: 1 }}>
                          <Iconify icon="eva:search-fill" width={24} />
                        </IconButton>
                      </InputAdornment>
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    fontSize: 15,
                  },
                }}
              />
            )}
            noOptionsText={
              codesQuery.isLoading
                ? '로딩 중...'
                : inputValue
                  ? '검색 결과가 없습니다.'
                  : '기계·설비를 검색하세요'
            }
            sx={{ width: '100%' }}
          />

          {/* 관리번호 (필수) */}
          <TextField
            label={<>관리번호</>}
            value={formData.machineId}
            onChange={(e) => handleFieldChange('machineId', e.target.value)}
            fullWidth
            required
            sx={{
              '& .MuiOutlinedInput-root': {
                fontSize: 14,
              },
            }}
          />

          {/* 발생가능 재해형태 */}
          <TextField
            label="발생가능 재해형태 "
            value={formData.accidentForm}
            onChange={(e) => handleFieldChange('accidentForm', e.target.value)}
            fullWidth
            sx={{
              '& .MuiOutlinedInput-root': {
                fontSize: 14,
              },
            }}
          />

          {/* 위험성 평가 빈도 */}
          <FormControl fullWidth>
            <InputLabel sx={{ fontSize: 12 }}>위험성 평가 빈도</InputLabel>
            <Select
              value={formData.freq || ''}
              onChange={(e) => {
                const value = e.target.value === '' ? '' : Number(e.target.value);
                handleFieldChange('freq', value);
              }}
              label="위험성 평가 빈도"
              displayEmpty
              sx={{
                fontSize: 14,
              }}
            >
              <MenuItem value="" sx={{ fontSize: 14 }}>
                <em />
              </MenuItem>
              {freqOptions.map((option) => {
                const range = riskAssessmentData.frequency.ranges.find((r) => r.value === option);
                return (
                  <MenuItem key={option} value={option} sx={{ fontSize: 14 }}>
                    {option} {range ? `(${range.label})` : ''}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>

          {/* 위험성 평가 심각도 */}
          <FormControl fullWidth>
            <InputLabel sx={{ fontSize: 12 }}>위험성 평가 심각도</InputLabel>
            <Select
              value={formData.sev || ''}
              onChange={(e) => {
                const value = e.target.value === '' ? '' : Number(e.target.value);
                handleFieldChange('sev', value);
              }}
              label="위험성 평가 심각도"
              displayEmpty
              sx={{
                fontSize: 14,
              }}
            >
              <MenuItem value="" sx={{ fontSize: 14 }}>
                <em />
              </MenuItem>
              {sevOptions.map((option) => {
                const range = riskAssessmentData.severity.ranges.find((r) => r.value === option);
                return (
                  <MenuItem key={option} value={option} sx={{ fontSize: 14 }}>
                    {option} {range ? `(${range.label})` : ''}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>

          {/* 위험성 평가 */}
          <FormControl fullWidth>
            <InputLabel sx={{ fontSize: 12 }}>위험성 평가</InputLabel>
            <Select
              value={formData.evalLabel || ''}
              onChange={(e) => handleFieldChange('evalLabel', e.target.value)}
              label="위험성 평가"
              displayEmpty
              sx={{
                fontSize: 14,
              }}
            >
              <MenuItem value="" sx={{ fontSize: 14 }}>
                <em />
              </MenuItem>
              {evalOptions.map((option) => (
                <MenuItem key={option} value={option} sx={{ fontSize: 14 }}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* 비고 */}
          <TextField
            label="비고"
            value={formData.remark}
            onChange={(e) => handleFieldChange('remark', e.target.value)}
            fullWidth
            multiline
            maxRows={3}
            sx={{
              '& .MuiOutlinedInput-root': {
                fontSize: 14,
              },
            }}
          />
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2.5 }}>
        <Box sx={{ display: 'flex', gap: 1, width: '100%', justifyContent: 'flex-end' }}>
          <Button onClick={handleClose} variant="outlined" sx={{ minWidth: 64 }}>
            취소
          </Button>
          <Button
            onClick={handleConfirm}
            variant="contained"
            sx={{ minWidth: 64 }}
            disabled={!formData.machineId}
          >
            확인
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}
