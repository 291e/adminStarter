import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import InputAdornment from '@mui/material/InputAdornment';

import { Iconify } from 'src/components/iconify';

type Props = {
  status: string;
  onChangeStatus: (value: string) => void;
  searchFilter: string;
  onChangeSearchFilter: (value: string) => void;
  searchValue: string;
  onChangeSearchValue: (value: string) => void;
};

const statusOptions = ['전체', '활성', '비활성'];
const searchOptions = ['전체', '서비스명'];

export default function ServiceSettingFilters({
  status,
  onChangeStatus,
  searchFilter,
  onChangeSearchFilter,
  searchValue,
  onChangeSearchValue,
}: Props) {
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={2}
      sx={{
        pl: 2.5,
        pr: 2.5,
        py: 2.5,
        gap: 2,
        alignItems: 'center',
      }}
    >
      <FormControl size="small" sx={{ minWidth: 160 }}>
        <InputLabel id="status-filter-label">상태</InputLabel>
        <Select
          labelId="status-filter-label"
          label="상태"
          value={status || 'all'}
          onChange={(e) => onChangeStatus(e.target.value === '' ? 'all' : e.target.value)}
        >
          <MenuItem value="all">전체</MenuItem>
          {statusOptions
            .filter((option) => option !== '전체')
            .map((option) => (
              <MenuItem key={option} value={option === '활성' ? 'active' : 'inactive'}>
                {option}
              </MenuItem>
            ))}
        </Select>
      </FormControl>

      <FormControl size="small" sx={{ minWidth: 160 }}>
        <InputLabel id="search-filter-label">검색어 필터</InputLabel>
        <Select
          labelId="search-filter-label"
          label="검색어 필터"
          value={searchFilter || 'all'}
          onChange={(e) => onChangeSearchFilter(e.target.value === '' ? 'all' : e.target.value)}
        >
          <MenuItem value="all">전체</MenuItem>
          {searchOptions
            .filter((option) => option !== '전체')
            .map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
        </Select>
      </FormControl>

      <TextField
        size="small"
        placeholder="검색어"
        value={searchValue}
        onChange={(e) => onChangeSearchValue(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start" sx={{ mr: 1 }}>
              <Iconify icon="eva:search-fill" width={24} sx={{ color: 'primary.main' }} />
            </InputAdornment>
          ),
        }}
        sx={{
          flex: 1,
          minWidth: 200,
          '& .MuiInputBase-input': {
            fontSize: 15,
            lineHeight: '24px',
            '&::placeholder': {
              opacity: 1,
              color: 'text.disabled',
            },
          },
        }}
      />
    </Stack>
  );
}
