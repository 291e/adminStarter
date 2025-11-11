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
const searchOptions = ['전체', '서비스명', '서비스 기간'];

export default function ServiceSettingFilters({
  status,
  onChangeStatus,
  searchFilter,
  onChangeSearchFilter,
  searchValue,
  onChangeSearchValue,
}: Props) {
  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ p: 2.5 }}>
      <FormControl size="small" sx={{ minWidth: 160 }}>
        <InputLabel id="status-filter-label">상태</InputLabel>
        <Select
          labelId="status-filter-label"
          label="상태"
          value={status}
          onChange={(e) => onChangeStatus(e.target.value)}
        >
          {statusOptions.map((option) => (
            <MenuItem key={option} value={option === '전체' ? 'all' : option}>
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
          value={searchFilter}
          onChange={(e) => onChangeSearchFilter(e.target.value)}
        >
          {searchOptions.map((option) => (
            <MenuItem key={option} value={option === '전체' ? 'all' : option}>
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
        sx={{ flexGrow: 1, minWidth: 200 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Iconify icon="eva:search-fill" width={24} />
            </InputAdornment>
          ),
        }}
      />
    </Stack>
  );
}

