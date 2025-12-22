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
  hazardCategories?: Array<{ name: string }>; // 실제 카테고리 목록
};

const statusOptions = ['활성', '비활성'];

const machineSearchOptions = ['기계·설비 코드', '기계·설비명'];
const hazardSearchOptions = ['유해인자 코드', '유해인자명'];

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
  hazardCategories = [],
}: Props) {
  const searchOptions = category === 'hazard' ? hazardSearchOptions : machineSearchOptions;

  // 유해인자 카테고리 옵션 (실제 카테고리 목록 + 전체)
  const hazardCategoryOptions = ['전체', ...hazardCategories.map((cat) => cat.name)];

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
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
        {category === 'hazard' && categoryFilter !== undefined && onChangeCategoryFilter && (
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel id="category-filter-label">카테고리</InputLabel>
            <Select
              labelId="category-filter-label"
              label="카테고리"
              value={categoryFilter || 'all'}
              onChange={(e) =>
                onChangeCategoryFilter(e.target.value === '' ? 'all' : e.target.value)
              }
            >
              <MenuItem value="all">전체</MenuItem>
              {hazardCategoryOptions
                .filter((option) => option !== '전체')
                .map((option) => (
                  <MenuItem key={option} value={option}>
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
            value={status || 'all'}
            onChange={(e) => onChangeStatus(e.target.value === '' ? 'all' : e.target.value)}
          >
            <MenuItem value="all">전체</MenuItem>
            {statusOptions.map((option) => (
              <MenuItem key={option} value={option === '활성' ? 'active' : 'inactive'}>
                {option}
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
            value={searchFilter || 'all'}
            onChange={(e) => onChangeSearchFilter(e.target.value === '' ? 'all' : e.target.value)}
          >
            <MenuItem value="all">전체</MenuItem>
            {searchOptions.map((option) => (
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
    </LocalizationProvider>
  );
}
