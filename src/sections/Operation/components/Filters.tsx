import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
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
  tab: string;
  onChangeTab: (value: string) => void;
  startDate: Dayjs | null;
  onChangeStartDate: (value: Dayjs | null) => void;
  endDate: Dayjs | null;
  onChangeEndDate: (value: Dayjs | null) => void;
  countAll: number;
  countActive: number;
  countInactive: number;
  searchField: 'reporter' | 'author' | '';
  setSearchField: (v: 'reporter' | 'author' | '') => void;
  searchValue: string;
  onChangeSearchValue: (value: string) => void;
};

export default function OperationFilters({
  tab,
  onChangeTab,
  startDate,
  onChangeStartDate,
  endDate,
  onChangeEndDate,
  countAll,
  countActive,
  countInactive,
  searchField,
  setSearchField,
  searchValue,
  onChangeSearchValue,
}: Props) {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Stack>
        <Tabs value={tab} onChange={(_, v) => onChangeTab(v)}>
          <Tab
            value="all"
            label={
              <Stack direction="row" alignItems="center" spacing={1} sx={{ p: 0 }}>
                <span>전체</span>
                <Chip
                  label={countAll}
                  size="small"
                  sx={{ bgcolor: 'text.primary', color: 'common.white' }}
                />
              </Stack>
            }
          />
          <Tab
            value="confirmed"
            label={
              <Stack direction="row" alignItems="center" spacing={1}>
                <span>확인</span>
                <Chip label={countActive} size="small" color="success" variant="soft" />
              </Stack>
            }
          />
          <Tab
            value="unconfirmed"
            label={
              <Stack direction="row" alignItems="center" spacing={1}>
                <span>미확인</span>
                <Chip label={countInactive} size="small" sx={{ bgcolor: 'grey.300' }} />
              </Stack>
            }
          />
        </Tabs>

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
          <DatePicker
            label="시작일"
            value={startDate}
            onChange={(value) => {
              onChangeStartDate(value);
            }}
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
            onChange={(value) => {
              onChangeEndDate(value);
            }}
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
              onChange={(e) => {
                setSearchField((e.target.value || '') as 'reporter' | 'author' | '');
              }}
            >
              <MenuItem value="">전체</MenuItem>
              <MenuItem value="reporter">보고자</MenuItem>
              <MenuItem value="author">작성자</MenuItem>
            </Select>
          </FormControl>

          <TextField
            size="small"
            placeholder="검색어"
            value={searchValue}
            onChange={(e) => {
              onChangeSearchValue(e.target.value);
            }}
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
      </Stack>
    </LocalizationProvider>
  );
}
