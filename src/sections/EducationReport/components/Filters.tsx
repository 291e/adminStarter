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

export default function EducationReportFilters({
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
        <InputLabel id="role-label">역할</InputLabel>
        <Select
          labelId="role-label"
          label="역할"
          value={role}
          onChange={(e) => onChangeRole(e.target.value)}
        >
          <MenuItem value="all">전체</MenuItem>
          <MenuItem value="조직관리자">조직관리자</MenuItem>
          <MenuItem value="관리감독자">관리감독자</MenuItem>
          <MenuItem value="안전보건 담당자">안전보건 담당자</MenuItem>
          <MenuItem value="근로자">근로자</MenuItem>
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
          <MenuItem value="all">전체</MenuItem>
          <MenuItem value="name">이름</MenuItem>
          <MenuItem value="department">소속</MenuItem>
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
