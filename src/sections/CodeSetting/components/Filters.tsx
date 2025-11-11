import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import InputAdornment from '@mui/material/InputAdornment';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { type Dayjs } from 'dayjs';

import { Iconify } from 'src/components/iconify';

type Props = {
  status: string;
  onChangeStatus: (value: string) => void;
  startDate: Dayjs | null;
  onChangeStartDate: (value: Dayjs | null) => void;
  endDate: Dayjs | null;
  onChangeEndDate: (value: Dayjs | null) => void;
  searchFilter: string;
  onChangeSearchFilter: (value: string) => void;
  searchValue: string;
  onChangeSearchValue: (value: string) => void;
  category?: 'machine' | 'hazard';
  categoryFilter?: string;
  onChangeCategoryFilter?: (value: string) => void;
};

const statusOptions = ['전체', '활성', '비활성'];
const machineSearchOptions = ['전체', '기계·설비 코드', '기계·설비명'];
const hazardSearchOptions = ['전체', '유해인자 코드', '유해인자명'];
const hazardCategoryOptions = [
  '전체',
  '화학물질',
  '물리적 요인',
  '생물학적 요인',
  '인간공학적 요인',
];

export default function CodeSettingFilters({
  status,
  onChangeStatus,
  startDate,
  onChangeStartDate,
  endDate,
  onChangeEndDate,
  searchFilter,
  onChangeSearchFilter,
  searchValue,
  onChangeSearchValue,
  category = 'machine',
  categoryFilter,
  onChangeCategoryFilter,
}: Props) {
  const searchOptions = category === 'hazard' ? hazardSearchOptions : machineSearchOptions;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ p: 2.5 }}>
        {category === 'hazard' && categoryFilter !== undefined && onChangeCategoryFilter && (
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel id="category-filter-label">카테고리</InputLabel>
            <Select
              labelId="category-filter-label"
              label="카테고리"
              value={categoryFilter}
              onChange={(e) => onChangeCategoryFilter(e.target.value)}
            >
              {hazardCategoryOptions.map((option) => (
                <MenuItem key={option} value={option === '전체' ? 'all' : option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

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

        <DatePicker
          label="시작일"
          value={startDate}
          onChange={onChangeStartDate}
          slotProps={{
            textField: {
              size: 'small',
              sx: { minWidth: 160 },
            },
          }}
        />

        <DatePicker
          label="종료일"
          value={endDate}
          onChange={onChangeEndDate}
          slotProps={{
            textField: {
              size: 'small',
              sx: { minWidth: 160 },
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
    </LocalizationProvider>
  );
}
