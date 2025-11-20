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

// ----------------------------------------------------------------------

type Props = {
  dateFilterType: string; // 검색일 구분: 'registered' | 'written'
  startDate: Dayjs | null;
  endDate: Dayjs | null;
  searchValue: string;
  onChangeDateFilterType: (value: string) => void;
  onChangeStartDate: (value: Dayjs | null) => void;
  onChangeEndDate: (value: Dayjs | null) => void;
  onChangeSearchValue: (value: string) => void;
};

export default function Risk_2200Filters({
  dateFilterType,
  startDate,
  endDate,
  searchValue,
  onChangeDateFilterType,
  onChangeStartDate,
  onChangeEndDate,
  onChangeSearchValue,
}: Props) {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ p: 2.5 }}>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel id="date-filter-type-label">검색일 구분</InputLabel>
          <Select
            labelId="date-filter-type-label"
            label="검색일 구분"
            value={dateFilterType}
            onChange={(e) => onChangeDateFilterType(e.target.value)}
          >
            <MenuItem value="registered">등록일</MenuItem>
            <MenuItem value="written">문서 작성일</MenuItem>
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

