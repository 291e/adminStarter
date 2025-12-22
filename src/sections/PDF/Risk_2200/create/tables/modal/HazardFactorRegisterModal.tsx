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
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { Iconify } from 'src/components/iconify';
import { useCodes } from 'src/sections/CodeSetting/hooks/use-code-setting-api';
import type { CodeSetting } from 'src/services/code-setting/code-setting.types';

// ----------------------------------------------------------------------

// 카테고리 옵션
const CATEGORY_OPTIONS = ['물리적', '생물학적', '인간공학적'] as const;

type HazardFactorData = {
  factorName: string; // 유해인자명
  category: '물리적' | '생물학적' | '인간공학적'; // 카테고리
  formOrType: string; // 형태 및 유형
  location: string; // 위치
  department: string; // 대상소속팀
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

  const [searchValue, setSearchValue] = useState<CodeSetting | null>(null);
  const [inputValue, setInputValue] = useState<string>('');

  // 유해인자 목록 조회
  const codesQuery = useCodes({
    categoryType: 'hazard',
    status: 'active',
    page: 1,
    pageSize: 1000, // 전체 데이터 조회
  });

  // 유해인자 목록
  const hazardList = useMemo(() => codesQuery.data?.codeSettingList ?? [], [codesQuery.data]);

  // 검색 필터링
  const filteredOptions = useMemo(() => {
    if (!inputValue) return hazardList;
    const lowerInput = inputValue.toLowerCase();
    return hazardList.filter(
      (hazard) =>
        hazard.name?.toLowerCase().includes(lowerInput) ||
        hazard.code?.toLowerCase().includes(lowerInput)
    );
  }, [hazardList, inputValue]);

  // 유해인자 선택 시 자동 입력
  useEffect(() => {
    if (searchValue) {
      const hazard = searchValue;

      setFormData((prev) => ({
        ...prev,
        factorName: hazard.name || prev.factorName,
        formOrType: hazard.formAndType || prev.formOrType,
        location: hazard.location || prev.location,
        exposureRisk: hazard.exposureRisk || prev.exposureRisk,
        managementStandard: hazard.managementStandard || prev.managementStandard,
        managementMeasure: hazard.managementMeasures || prev.managementMeasure,
        // department는 API에 없으므로 기존 값 유지
        // category는 유해인자 카테고리 정보에서 매핑할 수 있지만, 일단 기존 값 유지
      }));
    }
  }, [searchValue]);

  const handleFieldChange = (field: keyof HazardFactorData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleConfirm = () => {
    // searchValue가 있으면 최신 데이터를 기반으로 formData 업데이트
    let finalFormData = { ...formData };

    if (searchValue) {
      const hazard = searchValue;

      finalFormData = {
        ...formData,
        factorName: hazard.name || formData.factorName,
        formOrType: hazard.formAndType || formData.formOrType,
        location: hazard.location || formData.location,
        exposureRisk: hazard.exposureRisk || formData.exposureRisk,
        managementStandard: hazard.managementStandard || formData.managementStandard,
        managementMeasure: hazard.managementMeasures || formData.managementMeasure,
      };
    }

    onConfirm(finalFormData);
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
    setSearchValue(null);
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
            value={searchValue}
            inputValue={inputValue}
            onInputChange={(_, newInputValue) => {
              setInputValue(newInputValue);
            }}
            onChange={(_, newValue) => {
              setSearchValue(newValue);
            }}
            getOptionLabel={(option) => option.name || ''}
            isOptionEqualToValue={(option, value) => {
              if (!option || !value) return false;
              return option.codeSettingIdx === value.codeSettingIdx;
            }}
            renderOption={(props, option) => (
              <li {...props} key={option.codeSettingIdx}>
                {option.name || ''}
              </li>
            )}
            loading={codesQuery.isLoading}
            renderInput={(params) => (
              <TextField
                {...params}
                label="유해인자명"
                placeholder="유해인자명을 검색하세요"
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
                  : '유해인자를 검색하세요'
            }
            sx={{ width: '100%' }}
          />

          {/* 카테고리 (필수) */}
          <FormControl fullWidth>
            <InputLabel>
              카테고리
              <Typography component="span" sx={{ color: 'info.main', ml: 0.5 }}>
                *
              </Typography>
            </InputLabel>
            <Select
              value={formData.category}
              onChange={(e) => handleFieldChange('category', e.target.value)}
              label={
                <>
                  카테고리
                  <Typography component="span" sx={{ color: 'info.main', ml: 0.5 }}>
                    *
                  </Typography>
                </>
              }
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
                <Typography component="span" sx={{ color: 'info.main', ml: 0.5 }}>
                  *
                </Typography>
              </>
            }
            value={formData.formOrType}
            onChange={(e) => handleFieldChange('formOrType', e.target.value)}
            fullWidth
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
                <Typography component="span" sx={{ color: 'info.main', ml: 0.5 }}>
                  *
                </Typography>
              </>
            }
            value={formData.location}
            onChange={(e) => handleFieldChange('location', e.target.value)}
            fullWidth
            sx={{
              '& .MuiOutlinedInput-root': {
                fontSize: 15,
              },
            }}
          />

          {/* 대상소속팀 (필수) */}
          <TextField
            label={
              <>
                대상소속팀
                <Typography component="span" sx={{ color: 'info.main', ml: 0.5 }}>
                  *
                </Typography>
              </>
            }
            value={formData.department}
            onChange={(e) => handleFieldChange('department', e.target.value)}
            fullWidth
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
                <Typography component="span" sx={{ color: 'info.main', ml: 0.5 }}>
                  *
                </Typography>
              </>
            }
            value={formData.exposureRisk}
            onChange={(e) => handleFieldChange('exposureRisk', e.target.value)}
            fullWidth
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
                <Typography component="span" sx={{ color: 'info.main', ml: 0.5 }}>
                  *
                </Typography>
              </>
            }
            value={formData.managementStandard}
            onChange={(e) => handleFieldChange('managementStandard', e.target.value)}
            fullWidth
            sx={{
              '& .MuiOutlinedInput-root': {
                fontSize: 15,
              },
            }}
          />

          {/* 관리대책 (필수) - 자동 입력 */}
          <TextField
            label={
              <>
                관리대책
                <Typography component="span" sx={{ color: 'info.main', ml: 0.5 }}>
                  *
                </Typography>
              </>
            }
            value={formData.managementMeasure}
            onChange={(e) => handleFieldChange('managementMeasure', e.target.value)}
            fullWidth
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
