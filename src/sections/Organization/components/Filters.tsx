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

type DivisionType =
  | 'all'
  | 'operator'
  | 'member'
  | 'distributor'
  | 'agency'
  | 'dealer'
  | 'nonmember';

type Props = {
  division: DivisionType;
  onChangeDivision: (value: DivisionType) => void;
  startDate: Dayjs | null;
  onChangeStartDate: (value: Dayjs | null) => void;
  endDate: Dayjs | null;
  onChangeEndDate: (value: Dayjs | null) => void;
  searchField: 'all' | 'orgName' | 'manager';
  onChangeSearchField: (value: 'all' | 'orgName' | 'manager') => void;
  searchValue: string;
  onChangeSearchValue: (value: string) => void;
};

export default function OrganizationFilters({
  division,
  onChangeDivision,
  startDate,
  onChangeStartDate,
  endDate,
  onChangeEndDate,
  searchField,
  onChangeSearchField,
  searchValue,
  onChangeSearchValue,
}: Props) {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ p: 2.5 }}>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel id="division-label">구분</InputLabel>
          <Select
            labelId="division-label"
            label="구분"
            value={division}
            onChange={(e) => onChangeDivision(e.target.value as DivisionType)}
          >
            <MenuItem value="all">전체</MenuItem>
            <MenuItem value="operator">운영사</MenuItem>
            <MenuItem value="member">회원사</MenuItem>
            <MenuItem value="distributor">총판</MenuItem>
            <MenuItem value="agency">대리점</MenuItem>
            <MenuItem value="dealer">딜러</MenuItem>
            <MenuItem value="nonmember">비회원</MenuItem>
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
          <InputLabel id="search-field-label">검색어 필터</InputLabel>
          <Select
            labelId="search-field-label"
            label="검색어 필터"
            value={searchField}
            onChange={(e) => onChangeSearchField(e.target.value as 'all' | 'orgName' | 'manager')}
          >
            <MenuItem value="all">전체</MenuItem>
            <MenuItem value="orgName">조직명</MenuItem>
            <MenuItem value="manager">담당자</MenuItem>
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
