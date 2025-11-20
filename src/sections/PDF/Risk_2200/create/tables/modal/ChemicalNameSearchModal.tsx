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

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

// TODO: 한국산업안전보건공단_물질안전보건자료 API 호출
// const { data: chemicals } = useQuery({
//   queryKey: ['chemicals', searchTerm],
//   queryFn: () => getChemicalSafetyData(searchTerm),
//   enabled: !!searchTerm && searchTerm.length >= 2,
// });
// API 엔드포인트 예시: https://www.kosha.or.kr/api/chemical/search?keyword={searchTerm}

// 임시 목업 데이터 (API 연동 전까지 사용)
const MOCK_CHEMICALS = [
  '아세톤(Acetone)',
  '아세트산(Acetic acid)',
  '아세트알데하이드(Acetaldehyde)',
  '아세틸렌(Acetylene)',
  '아이소프로필알코올(Isopropyl alcohol)',
  '에탄올(Ethanol)',
  '에틸렌(Ethylene)',
  '벤젠(Benzene)',
  '톨루엔(Toluene)',
  '자일렌(Xylene)',
];

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: (chemicalName: string) => void;
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

  // TODO: 실제 API 호출 시 아래 코드로 대체
  // const filteredOptions = chemicals?.body?.chemicals || [];
  // 현재는 목업 데이터 사용
  const filteredOptions = MOCK_CHEMICALS.filter((option) =>
    option.toLowerCase().includes(inputValue.toLowerCase())
  );

  const handleConfirm = () => {
    if (searchValue) {
      onConfirm(searchValue);
      handleClose();
    }
  };

  const handleClose = () => {
    setSearchValue(initialValue);
    setInputValue('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontSize: 18, fontWeight: 600, pb: 2 }}>화학물질명 검색</DialogTitle>

      <DialogContent>
        <Box sx={{ pt: 1, pb: 8.5 }}>
          <Autocomplete
            options={filteredOptions}
            value={searchValue || null}
            inputValue={inputValue}
            onInputChange={(_, newInputValue) => {
              setInputValue(newInputValue);
            }}
            onChange={(_, newValue) => {
              setSearchValue(newValue || '');
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="화학물질명"
                placeholder="화학물질명을 검색하세요"
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
            disabled={!searchValue}
          >
            확인
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}

