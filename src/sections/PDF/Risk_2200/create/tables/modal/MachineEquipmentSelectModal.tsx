import { useState } from 'react';
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

// ----------------------------------------------------------------------

// 기계 설비명 옵션 (프레스, 펀치 프레스만)
const MACHINE_EQUIPMENT_OPTIONS = ['프레스', '펀치 프레스'] as const;

// 검사 대상 옵션 목록
const INSPECTION_TARGET_OPTIONS = [
  '산업안전보건법',
  '건설기계관리법',
  '전기안전관리법',
  '소방시설법',
  '고압가스안전관리법',
  '대기환경보전법',
  '물환경보전법',
  '원자력안전법',
  '승강기 안전관리법',
  '직접입력',
  '비대상',
] as const;

// ----------------------------------------------------------------------

type MachineEquipmentData = {
  name: string; // 기계·설비명
  id: string; // 관리번호
  capacity: string; // 용량
  location: string; // 단위작업장소
  quantity: string; // 수량
  inspectionTarget: string; // 검사대상
  safetyDevice: string; // 방호장치
  inspectionCycle: string; // 점검주기
  accidentForm: string; // 발생가능 재해형태
  remark: string; // 비고
};

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: (data: MachineEquipmentData) => void;
  initialData?: Partial<MachineEquipmentData>;
};

export default function MachineEquipmentSelectModal({
  open,
  onClose,
  onConfirm,
  initialData,
}: Props) {
  const [formData, setFormData] = useState<MachineEquipmentData>({
    name: initialData?.name || '',
    id: initialData?.id || '',
    capacity: initialData?.capacity || '',
    location: initialData?.location || '',
    quantity: initialData?.quantity || '',
    inspectionTarget: initialData?.inspectionTarget || '산업안전보건법',
    safetyDevice: initialData?.safetyDevice || '',
    inspectionCycle: initialData?.inspectionCycle || '',
    accidentForm: initialData?.accidentForm || '',
    remark: initialData?.remark || '',
  });

  const [searchValue, setSearchValue] = useState<string>('');
  const [inputValue, setInputValue] = useState<string>('');

  // 검색 필터링
  const filteredOptions = MACHINE_EQUIPMENT_OPTIONS.filter((option) =>
    option.toLowerCase().includes(inputValue.toLowerCase())
  );

  const handleFieldChange = (field: keyof MachineEquipmentData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleConfirm = () => {
    // TODO: API 호출하여 기계 설비 정보 검증 및 저장
    onConfirm(formData);
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      name: initialData?.name || '',
      id: initialData?.id || '',
      capacity: initialData?.capacity || '',
      location: initialData?.location || '',
      quantity: initialData?.quantity || '',
      inspectionTarget: initialData?.inspectionTarget || '산업안전보건법',
      safetyDevice: initialData?.safetyDevice || '',
      inspectionCycle: initialData?.inspectionCycle || '',
      accidentForm: initialData?.accidentForm || '',
      remark: initialData?.remark || '',
    });
    setSearchValue('');
    setInputValue('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontSize: 18, fontWeight: 600, pb: 2 }}>기계·설비 검색</DialogTitle>

      <DialogContent>
        <Stack spacing={3} sx={{ pt: 1 }}>
          {/* 기계·설비명 (오토컴플리트) */}
          <Autocomplete
            options={MACHINE_EQUIPMENT_OPTIONS}
            value={searchValue || null}
            inputValue={inputValue}
            onInputChange={(_, newInputValue) => {
              setInputValue(newInputValue);
            }}
            onChange={(_, newValue) => {
              setSearchValue(newValue || '');
              handleFieldChange('name', newValue || '');
            }}
            renderInput={(params) => (
              <TextField {...params} label="기계·설비명" placeholder="기계·설비명을 검색하세요" />
            )}
            noOptionsText="검색 결과가 없습니다."
            sx={{
              '& .MuiOutlinedInput-root': {
                fontSize: 15,
              },
            }}
          />

          {/* 관리번호 (필수) */}
          <TextField
            label={<>관리번호</>}
            value={formData.id}
            onChange={(e) => handleFieldChange('id', e.target.value)}
            fullWidth
            required
          />

          {/* 용량 (필수) */}
          <TextField
            label={<>용량</>}
            value={formData.capacity}
            onChange={(e) => handleFieldChange('capacity', e.target.value)}
            fullWidth
            required
          />

          {/* 단위작업장소 (필수) */}
          <TextField
            label={<>단위작업장소</>}
            value={formData.location}
            onChange={(e) => handleFieldChange('location', e.target.value)}
            fullWidth
            required
          />

          {/* 수량 (필수) */}
          <TextField
            label={<>수량</>}
            value={formData.quantity}
            onChange={(e) => handleFieldChange('quantity', e.target.value)}
            fullWidth
            required
          />

          {/* 검사 대상 */}
          <FormControl fullWidth>
            <InputLabel>검사 대상</InputLabel>
            <Select
              value={formData.inspectionTarget}
              onChange={(e) => handleFieldChange('inspectionTarget', e.target.value)}
              label="검사 대상"
              sx={{
                fontSize: 15,
              }}
            >
              {INSPECTION_TARGET_OPTIONS.map((option) => (
                <MenuItem key={option} value={option} sx={{ fontSize: 15 }}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* 방호장치 */}
          <TextField
            label="방호장치"
            value={formData.safetyDevice}
            onChange={(e) => handleFieldChange('safetyDevice', e.target.value)}
            fullWidth
            sx={{
              '& .MuiOutlinedInput-root': {
                fontSize: 14,
              },
            }}
          />

          {/* 점검주기 */}
          <TextField
            label="점검주기"
            value={formData.inspectionCycle}
            onChange={(e) => handleFieldChange('inspectionCycle', e.target.value)}
            fullWidth
            sx={{
              '& .MuiOutlinedInput-root': {
                fontSize: 14,
              },
            }}
          />

          {/* 발생가능 재해형태 */}
          <TextField
            label="발생가능 재해형태"
            value={formData.accidentForm}
            onChange={(e) => handleFieldChange('accidentForm', e.target.value)}
            fullWidth
            multiline
            maxRows={3}
            sx={{
              '& .MuiOutlinedInput-root': {
                fontSize: 14,
              },
            }}
          />

          {/* 비고 */}
          <TextField
            label="비고"
            value={formData.remark}
            onChange={(e) => handleFieldChange('remark', e.target.value)}
            fullWidth
            sx={{
              '& .MuiOutlinedInput-root': {
                fontSize: 15,
              },
            }}
          />
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2.5 }}>
        <Box sx={{ display: 'flex', gap: 1, width: '100%', justifyContent: 'flex-end' }}>
          <Button onClick={handleClose} variant="outlined" sx={{ minWidth: 64 }}>
            닫기
          </Button>
          <Button onClick={handleConfirm} variant="contained" sx={{ minWidth: 64 }}>
            등록
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}



