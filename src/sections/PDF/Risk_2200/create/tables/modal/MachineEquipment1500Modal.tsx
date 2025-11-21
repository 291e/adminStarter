import { useState, useEffect } from 'react';
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

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

// 빈도 옵션 (1-5)
const FREQ_OPTIONS = [1, 2, 3, 4, 5] as const;

// 심각도 옵션 (1-5)
const SEV_OPTIONS = [1, 2, 3, 4, 5] as const;

// 평가 옵션 (빈도 × 심각도 결과에 따른 평가)
const EVAL_OPTIONS = [
  '1 (낮음)',
  '2 (낮음)',
  '3 (낮음)',
  '4 (낮음)',
  '5 (낮음)',
  '6 (관리필요)',
  '8 (관리필요)',
  '9 (관리필요)',
  '10 (관리필요)',
  '12 (관리필요)',
  '15 (관리필요)',
  '16 (관리필요)',
  '20 (관리필요)',
  '25 (관리필요)',
] as const;

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
};

export default function MachineEquipment1500Modal({
  open,
  onClose,
  onConfirm,
  initialData,
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

  const [searchValue, setSearchValue] = useState<string>(initialData?.machine || '');
  const [inputValue, setInputValue] = useState<string>('');

  // TODO: 설정 및 관리 > 코드 관리에서 정의된 설비 정보 API 호출
  // const { data: equipmentList } = useQuery({
  //   queryKey: ['equipment-list'],
  //   queryFn: () => getEquipmentList(),
  // });
  // const equipmentOptions = equipmentList?.body?.equipmentList || [];

  // 임시 목업 데이터 (API 연동 전까지 사용)
  const MOCK_EQUIPMENT_OPTIONS = ['지게차', '프레스', '펀치 프레스', '크레인', '용접기'];

  // 검색 필터링
  const filteredOptions = MOCK_EQUIPMENT_OPTIONS.filter((option) =>
    option.toLowerCase().includes(inputValue.toLowerCase())
  );

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
      setSearchValue(initialData.machine || '');
    }
  }, [initialData]);

  // 빈도와 심각도가 변경되면 평가 계산
  useEffect(() => {
    const freq = typeof formData.freq === 'number' ? formData.freq : Number(formData.freq) || 0;
    const sev = typeof formData.sev === 'number' ? formData.sev : Number(formData.sev) || 0;

    if (freq > 0 && sev > 0) {
      const evalValue = freq * sev;
      // 평가 옵션에서 해당 값 찾기
      const evalOption = EVAL_OPTIONS.find((opt) => {
        const num = parseInt(opt.split(' ')[0], 10);
        return num === evalValue;
      });
      if (evalOption) {
        setFormData((prev) => ({ ...prev, evalLabel: evalOption }));
      } else {
        // 옵션에 없는 경우 직접 입력 형식으로
        setFormData((prev) => ({ ...prev, evalLabel: `${evalValue}` }));
      }
    }
  }, [formData.freq, formData.sev]);

  const handleFieldChange = (field: keyof MachineEquipment1500Data, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleMachineSelect = (machineName: string) => {
    // TODO: API 호출하여 선택된 기계 설비 정보 자동 입력
    // const { data: equipmentInfo } = useQuery({
    //   queryKey: ['equipment-info', machineName],
    //   queryFn: () => getEquipmentInfo(machineName),
    //   enabled: !!machineName,
    // });
    // if (equipmentInfo?.body) {
    //   setFormData((prev) => ({
    //     ...prev,
    //     machine: equipmentInfo.body.name,
    //     machineId: equipmentInfo.body.id,
    //     accidentForm: equipmentInfo.body.accidentForm,
    //     freq: equipmentInfo.body.freq,
    //     sev: equipmentInfo.body.sev,
    //     evalLabel: equipmentInfo.body.evalLabel,
    //     remark: equipmentInfo.body.remark,
    //   }));
    // }

    // 임시: 선택된 기계명만 업데이트
    handleFieldChange('machine', machineName);
  };

  const handleConfirm = () => {
    // TODO: API 호출하여 기계 설비 정보 검증 및 저장
    onConfirm(formData);
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
    setSearchValue(initialData?.machine || '');
    setInputValue('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontSize: 18, fontWeight: 600, pb: 2 }}>
        관련기계•기구•설비명 검색
      </DialogTitle>

      <DialogContent>
        <Stack spacing={3} sx={{ pt: 1 }}>
          {/* 관련기계•기구•설비명 (오토컴플리트, 검색 아이콘 포함) */}
          <Autocomplete
            freeSolo
            options={filteredOptions}
            value={searchValue || null}
            inputValue={inputValue}
            onInputChange={(_, newInputValue) => {
              setInputValue(newInputValue);
            }}
            onChange={(_, newValue) => {
              const value = typeof newValue === 'string' ? newValue : newValue || '';
              setSearchValue(value);
              handleMachineSelect(value);
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="관련기계•기구•설비명"
                placeholder="관련기계•기구•설비명을 검색하세요"
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
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
            noOptionsText="검색 결과가 없습니다."
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
              {FREQ_OPTIONS.map((option) => (
                <MenuItem key={option} value={option} sx={{ fontSize: 14 }}>
                  {option}
                </MenuItem>
              ))}
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
              {SEV_OPTIONS.map((option) => (
                <MenuItem key={option} value={option} sx={{ fontSize: 14 }}>
                  {option}
                </MenuItem>
              ))}
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
              {EVAL_OPTIONS.map((option) => (
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


