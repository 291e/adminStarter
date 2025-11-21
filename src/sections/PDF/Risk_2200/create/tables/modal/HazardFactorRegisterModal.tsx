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
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

// 카테고리 옵션
const CATEGORY_OPTIONS = ['물리적', '생물학적', '인간공학적'] as const;

// TODO: 유해인자명 목록 API 호출
// const { data: hazardFactors } = useQuery({
//   queryKey: ['hazardFactors', searchTerm],
//   queryFn: () => getHazardFactors(searchTerm),
//   enabled: !!searchTerm && searchTerm.length >= 2,
// });

// 임시 목업 데이터 (API 연동 전까지 사용)
const MOCK_HAZARD_FACTORS = [
  '소음',
  '진동',
  '방사선',
  '자외선',
  '적외선',
  '전자기파',
  '고온',
  '저온',
  '고압',
  '저압',
  '진공',
  '미생물',
  '바이러스',
  '곰팡이',
  '부적절한 작업자세',
  '반복작업',
  '무리한 힘',
];

type HazardFactorData = {
  factorName: string; // 유해인자명
  category: '물리적' | '생물학적' | '인간공학적'; // 카테고리
  formOrType: string; // 형태 및 유형
  location: string; // 위치
  department: string; // 대상부서
  exposureRisk: string; // 노출위험
  managementStandard: string; // 관리기준
  managementMeasure: string; // 관리대책
};

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: (data: HazardFactorData) => void;
  initialData?: Partial<HazardFactorData>;
};

export default function HazardFactorRegisterModal({
  open,
  onClose,
  onConfirm,
  initialData,
}: Props) {
  const [formData, setFormData] = useState<HazardFactorData>({
    factorName: initialData?.factorName || '',
    category: initialData?.category || '물리적',
    formOrType: initialData?.formOrType || '',
    location: initialData?.location || '',
    department: initialData?.department || '',
    exposureRisk: initialData?.exposureRisk || '',
    managementStandard: initialData?.managementStandard || '',
    managementMeasure: initialData?.managementMeasure || '',
  });

  const [searchValue, setSearchValue] = useState<string>(initialData?.factorName || '');
  const [inputValue, setInputValue] = useState<string>('');

  // 검색 필터링
  const filteredOptions = MOCK_HAZARD_FACTORS.filter((option) =>
    option.toLowerCase().includes(inputValue.toLowerCase())
  );

  const handleFieldChange = (field: keyof HazardFactorData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleConfirm = () => {
    // TODO: API 호출하여 유해인자 정보 검증 및 저장
    onConfirm(formData);
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      factorName: initialData?.factorName || '',
      category: initialData?.category || '물리적',
      formOrType: initialData?.formOrType || '',
      location: initialData?.location || '',
      department: initialData?.department || '',
      exposureRisk: initialData?.exposureRisk || '',
      managementStandard: initialData?.managementStandard || '',
      managementMeasure: initialData?.managementMeasure || '',
    });
    setSearchValue(initialData?.factorName || '');
    setInputValue('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontSize: 18, fontWeight: 600, pb: 2 }}>유해인자 등록</DialogTitle>

      <DialogContent>
        <Stack spacing={3} sx={{ pt: 1, pb: 8.5 }}>
          {/* 유해인자명 (오토컴플리트) */}
          <Autocomplete
            options={filteredOptions}
            value={searchValue || null}
            inputValue={inputValue}
            onInputChange={(_, newInputValue) => {
              setInputValue(newInputValue);
            }}
            onChange={(_, newValue) => {
              setSearchValue(newValue || '');
              handleFieldChange('factorName', newValue || '');
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="유해인자명"
                placeholder="유해인자명을 검색하세요"
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

          {/* 카테고리 (필수) */}
          <FormControl fullWidth required>
            <InputLabel>카테고리</InputLabel>
            <Select
              value={formData.category}
              onChange={(e) => handleFieldChange('category', e.target.value)}
              label="카테고리"
              sx={{
                fontSize: 15,
              }}
            >
              {CATEGORY_OPTIONS.map((option) => (
                <MenuItem key={option} value={option} sx={{ fontSize: 15 }}>
                  {option} 인자
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* 형태 및 유형 (필수) */}
          <TextField
            label={
              <>
                형태 및 유형
                <Typography component="span" sx={{ color: 'primary.main', ml: 0.5 }}>
                  *
                </Typography>
              </>
            }
            value={formData.formOrType}
            onChange={(e) => handleFieldChange('formOrType', e.target.value)}
            fullWidth
            required
            sx={{
              '& .MuiOutlinedInput-root': {
                fontSize: 15,
              },
            }}
          />

          {/* 위치 (필수) */}
          <TextField
            label={
              <>
                위치
                <Typography component="span" sx={{ color: 'primary.main', ml: 0.5 }}>
                  *
                </Typography>
              </>
            }
            value={formData.location}
            onChange={(e) => handleFieldChange('location', e.target.value)}
            fullWidth
            required
            sx={{
              '& .MuiOutlinedInput-root': {
                fontSize: 15,
              },
            }}
          />

          {/* 대상부서 (필수) */}
          <TextField
            label={
              <>
                대상부서
                <Typography component="span" sx={{ color: 'primary.main', ml: 0.5 }}>
                  *
                </Typography>
              </>
            }
            value={formData.department}
            onChange={(e) => handleFieldChange('department', e.target.value)}
            fullWidth
            required
            sx={{
              '& .MuiOutlinedInput-root': {
                fontSize: 14,
              },
            }}
          />

          {/* 노출위험 (필수) */}
          <TextField
            label={
              <>
                노출위험
                <Typography component="span" sx={{ color: 'primary.main', ml: 0.5 }}>
                  *
                </Typography>
              </>
            }
            value={formData.exposureRisk}
            onChange={(e) => handleFieldChange('exposureRisk', e.target.value)}
            fullWidth
            required
            multiline
            maxRows={3}
            sx={{
              '& .MuiOutlinedInput-root': {
                fontSize: 15,
              },
            }}
          />

          {/* 관리기준 (필수) */}
          <TextField
            label={
              <>
                관리기준
                <Typography component="span" sx={{ color: 'primary.main', ml: 0.5 }}>
                  *
                </Typography>
              </>
            }
            value={formData.managementStandard}
            onChange={(e) => handleFieldChange('managementStandard', e.target.value)}
            fullWidth
            required
            sx={{
              '& .MuiOutlinedInput-root': {
                fontSize: 15,
              },
            }}
          />

          {/* 관리대책 (필수) */}
          <TextField
            label={
              <>
                관리대책
                <Typography component="span" sx={{ color: 'primary.main', ml: 0.5 }}>
                  *
                </Typography>
              </>
            }
            value={formData.managementMeasure}
            onChange={(e) => handleFieldChange('managementMeasure', e.target.value)}
            fullWidth
            required
            multiline
            maxRows={3}
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




