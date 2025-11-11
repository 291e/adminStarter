import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import InputAdornment from '@mui/material/InputAdornment';

import { Iconify } from 'src/components/iconify';

type Props = {
  role: string;
  onChangeRole: (value: string) => void;
  searchFilter: string;
  onChangeSearchFilter: (value: string) => void;
  searchValue: string;
  onChangeSearchValue: (value: string) => void;
};

const searchOptions = ['전체', '아이디', '이름', '이메일', '전화번호'];

// 역할 옵션 (실제로는 동적으로 가져와야 함)
const roleOptions = [
  '전체',
  '조직 관리자',
  '안전보건 담당자',
  '관리 감독자',
  '근로자',
];

export default function MemberFilters({
  role,
  onChangeRole,
  searchFilter,
  onChangeSearchFilter,
  searchValue,
  onChangeSearchValue,
}: Props) {
  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ p: 2.5 }}>
      <FormControl size="small" sx={{ minWidth: 160 }}>
        <InputLabel id="role-filter-label">역할</InputLabel>
        <Select
          labelId="role-filter-label"
          label="역할"
          value={role}
          onChange={(e) => onChangeRole(e.target.value)}
        >
          {roleOptions.map((option) => (
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

