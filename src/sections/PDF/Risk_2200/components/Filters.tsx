import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';

import { Iconify } from 'src/components/iconify';
import InputAdornment from '@mui/material/InputAdornment';

// ----------------------------------------------------------------------

type Props = {
  filterType: string;
  searchField: string;
  searchValue: string;
  onChangeFilterType: (value: string) => void;
  onChangeSearchField: (value: string) => void;
  onChangeSearchValue: (value: string) => void;
};

export default function Risk_2200Filters({
  filterType,
  searchField,
  searchValue,
  onChangeFilterType,
  onChangeSearchField,
  onChangeSearchValue,
}: Props) {
  return (
    <Box
      sx={{
        display: 'flex',
        gap: 2,
        alignItems: 'center',
        p: 2.5,
      }}
    >
      <FormControl size="small" sx={{ width: 160 }}>
        <InputLabel>필터</InputLabel>
        <Select value={filterType} onChange={(e) => onChangeFilterType(e.target.value)} label="필터">
          <MenuItem value="all">전체</MenuItem>
          <MenuItem value="pending">진행중</MenuItem>
          <MenuItem value="completed">완료</MenuItem>
          <MenuItem value="draft">임시저장</MenuItem>
        </Select>
      </FormControl>

      <FormControl size="small" sx={{ width: 160 }}>
        <InputLabel>검색어</InputLabel>
        <Select value={searchField} onChange={(e) => onChangeSearchField(e.target.value)} label="검색어">
          <MenuItem value="title">제목</MenuItem>
          <MenuItem value="organization">조직명</MenuItem>
          <MenuItem value="documentNumber">문서번호</MenuItem>
        </Select>
      </FormControl>

      <TextField
        size="small"
        placeholder="검색어"
        value={searchValue}
        onChange={(e) => onChangeSearchValue(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Iconify icon="eva:search-fill" width={24} />
            </InputAdornment>
          ),
        }}
        sx={{ flex: 1 }}
      />
    </Box>
  );
}

