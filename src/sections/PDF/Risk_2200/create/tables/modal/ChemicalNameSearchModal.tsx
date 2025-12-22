import { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';
import { useChemicalSummary } from './hooks/use-chemical-search';
import type { ChemicalSummaryData } from 'src/services/safety-system/safety-system.types';

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: (chemicalData: ChemicalSummaryData) => void;
  initialValue?: string;
};

export default function ChemicalNameSearchModal({
  open,
  onClose,
  onConfirm,
  initialValue = '',
}: Props) {
  const [searchValue, setSearchValue] = useState<string>(initialValue);
  const [inputValue, setInputValue] = useState<string>('');

  // 화학물질 검색 API 호출
  const {
    data: chemicalResponse,
    isLoading,
    isError,
    error,
  } = useChemicalSummary({
    search: inputValue,
  });

  // axios interceptor가 평탄화하므로 직접 접근
  const chemicalData = chemicalResponse as any as ChemicalSummaryData | undefined;

  const handleConfirm = () => {
    if (searchValue && chemicalData) {
      // API 응답 데이터를 그대로 전달
      onConfirm(chemicalData);
      handleClose();
    }
  };

  const handleClose = () => {
    setSearchValue(initialValue);
    setInputValue('');
    onClose();
  };

  // 검색어가 변경되면 선택값도 업데이트
  const handleInputChange = (newInputValue: string) => {
    setInputValue(newInputValue);
    // 검색어가 변경되면 선택값 초기화
    if (newInputValue !== searchValue) {
      setSearchValue('');
    }
  };

  // 검색 결과가 있으면 자동으로 선택값 설정
  const handleAutocompleteChange = (_: any, newValue: string | null) => {
    if (newValue && chemicalData) {
      setSearchValue(chemicalData.chemicalName);
    } else {
      setSearchValue('');
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontSize: 18, fontWeight: 600, pb: 2 }}>화학물질명 검색</DialogTitle>

      <DialogContent>
        <Box sx={{ pt: 1 }}>
          <Autocomplete
            freeSolo
            options={chemicalData ? [chemicalData.chemicalName] : []}
            value={searchValue || null}
            inputValue={inputValue}
            onInputChange={(_, newInputValue) => {
              handleInputChange(newInputValue);
            }}
            onChange={handleAutocompleteChange}
            loading={isLoading}
            getOptionLabel={(option) => (typeof option === 'string' ? option : '')}
            isOptionEqualToValue={(option, value) => option === value}
            renderInput={(params) => (
              <TextField
                {...params}
                label="화학물질명"
                placeholder="화학물질명을 검색하세요 (2자 이상)"
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {isLoading ? (
                        <CircularProgress size={20} sx={{ mr: 1 }} />
                      ) : (
                        <InputAdornment position="end">
                          <IconButton size="small" edge="end" sx={{ mr: 1 }}>
                            <Iconify icon="eva:search-fill" width={24} />
                          </IconButton>
                        </InputAdornment>
                      )}
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
              inputValue.length < 2
                ? '2자 이상 입력해주세요.'
                : isError
                  ? `검색 중 오류가 발생했습니다: ${error?.message || '알 수 없는 오류'}`
                  : '검색 결과가 없습니다.'
            }
            sx={{ width: '100%' }}
          />
          {chemicalData && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                검색 결과
              </Typography>
              <Typography variant="body2" color="text.secondary">
                화학물질명: {chemicalData.chemicalName}
              </Typography>
              {chemicalData.casNo && (
                <Typography variant="body2" color="text.secondary">
                  CAS No: {chemicalData.casNo}
                </Typography>
              )}
            </Box>
          )}
          {isError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              검색 중 오류가 발생했습니다. 다시 시도해주세요.
            </Alert>
          )}
        </Box>
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
            disabled={!searchValue || !chemicalData || isLoading}
          >
            확인
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}
