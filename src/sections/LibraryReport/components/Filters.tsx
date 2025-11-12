import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import InputAdornment from '@mui/material/InputAdornment';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import type { Dayjs } from 'dayjs';

import { Iconify } from 'src/components/iconify';
import type { CategoryItem } from './CategorySettingsModal';

type Props = {
  categories: CategoryItem[];
  category: string;
  onChangeCategory: (value: string) => void;
  startDate: Dayjs | null;
  onChangeStartDate: (value: Dayjs | null) => void;
  endDate: Dayjs | null;
  onChangeEndDate: (value: Dayjs | null) => void;
  searchFilter: string;
  onChangeSearchFilter: (value: string) => void;
  searchValue: string;
  onChangeSearchValue: (value: string) => void;
};

export default function LibraryReportFilters({
  categories,
  category,
  onChangeCategory,
  startDate,
  onChangeStartDate,
  endDate,
  onChangeEndDate,
  searchFilter,
  onChangeSearchFilter,
  searchValue,
  onChangeSearchValue,
}: Props) {
  // 활성화된 카테고리만 필터 옵션으로 표시
  const activeCategories = categories.filter((cat) => cat.isActive);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ p: 2.5 }}>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel id="category-label">카테고리</InputLabel>
          <Select
            labelId="category-label"
            label="카테고리"
            value={category}
            onChange={(e) => onChangeCategory(e.target.value)}
          >
            <MenuItem value="all">전체</MenuItem>
            {activeCategories.map((cat) => (
              <MenuItem key={cat.id} value={cat.name}>
                {cat.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <DatePicker
          label="시작일"
          value={startDate}
          onChange={onChangeStartDate}
          format="YYYY-MM-DD"
          slotProps={{
            textField: {
              size: 'small',
              sx: { maxWidth: 160 },
            },
          }}
        />

        <DatePicker
          label="종료일"
          value={endDate}
          onChange={onChangeEndDate}
          format="YYYY-MM-DD"
          slotProps={{
            textField: {
              size: 'small',
              sx: { maxWidth: 160 },
            },
          }}
        />

        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel id="search-filter-label">검색어 필터</InputLabel>
          <Select
            labelId="search-filter-label"
            label="검색어 필터"
            value={searchFilter}
            onChange={(e) => onChangeSearchFilter(e.target.value)}
          >
            <MenuItem value="all">전체</MenuItem>
            <MenuItem value="organizationName">조직명</MenuItem>
            <MenuItem value="category">카테고리</MenuItem>
            <MenuItem value="title">제목</MenuItem>
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
    </LocalizationProvider>
  );
}
