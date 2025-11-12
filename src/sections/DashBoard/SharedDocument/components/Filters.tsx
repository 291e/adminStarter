import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputAdornment from '@mui/material/InputAdornment';
import Typography from '@mui/material/Typography';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import type { Dayjs } from 'dayjs';

import { Iconify } from 'src/components/iconify';

type Props = {
  priority: 'urgent' | 'important' | 'reference' | '';
  onChangePriority: (value: 'urgent' | 'important' | 'reference' | '') => void;
  startDate: Dayjs | null;
  onChangeStartDate: (value: Dayjs | null) => void;
  endDate: Dayjs | null;
  onChangeEndDate: (value: Dayjs | null) => void;
  searchValue: string;
  onChangeSearchValue: (value: string) => void;
};

export default function SharedDocumentFilters({
  priority,
  onChangePriority,
  startDate,
  onChangeStartDate,
  endDate,
  onChangeEndDate,
  searchValue,
  onChangeSearchValue,
}: Props) {
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
        <FormControl size="small" sx={{ width: 160 }}>
          <Select
            displayEmpty
            value={priority}
            onChange={(e) => {
              onChangePriority((e.target.value || '') as 'urgent' | 'important' | 'reference' | '');
              // TODO: 중요도 필터 변경 시 TanStack Query로 공유 문서 목록 새로고침
              // queryClient.invalidateQueries({ queryKey: ['sharedDocuments'] });
            }}
            renderValue={(selected) => {
              if (!selected) {
                return (
                  <Typography
                    component="span"
                    sx={{
                      color: 'text.disabled',
                      fontSize: 15,
                      lineHeight: '24px',
                    }}
                  >
                    중요도
                  </Typography>
                );
              }
              const labels = {
                urgent: '긴급',
                important: '중요',
                reference: '참고',
              };
              return (
                <Typography
                  component="span"
                  sx={{
                    fontSize: 15,
                    lineHeight: '24px',
                    color: 'text.primary',
                  }}
                >
                  {labels[selected]}
                </Typography>
              );
            }}
            sx={{
              bgcolor: 'background.paper',
              fontSize: 15,
              lineHeight: '24px',
              '& .MuiSelect-select': {
                fontSize: 15,
                lineHeight: '24px',
                py: 1,
              },
              '& .MuiSelect-icon': {
                width: 18,
                height: 18,
                right: 10,
              },
            }}
          >
            <MenuItem value="urgent">긴급</MenuItem>
            <MenuItem value="important">중요</MenuItem>
            <MenuItem value="reference">참고</MenuItem>
          </Select>
        </FormControl>

        <DatePicker
          value={startDate}
          onChange={(value) => {
            onChangeStartDate(value);
            // TODO: 시작일 변경 시 TanStack Query로 공유 문서 목록 새로고침
            // queryClient.invalidateQueries({ queryKey: ['sharedDocuments'] });
          }}
          format="YYYY-MM-DD"
          slotProps={{
            textField: {
              size: 'small',
              placeholder: '시작일',
              sx: {
                width: 160,
                '& .MuiInputBase-input': {
                  fontSize: 15,
                  lineHeight: '24px',
                  color: startDate ? 'text.primary' : 'text.disabled',
                  '&::placeholder': {
                    opacity: 1,
                    color: 'text.disabled',
                  },
                },
              },
            },
            openPickerIcon: {
              sx: {
                width: 24,
                height: 24,
                color: 'text.secondary',
              },
            },
          }}
        />

        <DatePicker
          value={endDate}
          onChange={(value) => {
            onChangeEndDate(value);
            // TODO: 종료일 변경 시 TanStack Query로 공유 문서 목록 새로고침
            // queryClient.invalidateQueries({ queryKey: ['sharedDocuments'] });
          }}
          format="YYYY-MM-DD"
          slotProps={{
            textField: {
              size: 'small',
              placeholder: '종료일',
              sx: {
                width: 160,
                '& .MuiInputBase-input': {
                  fontSize: 15,
                  lineHeight: '24px',
                  color: endDate ? 'text.primary' : 'text.disabled',
                  '&::placeholder': {
                    opacity: 1,
                    color: 'text.disabled',
                  },
                },
              },
            },
            openPickerIcon: {
              sx: {
                width: 24,
                height: 24,
                color: 'text.secondary',
              },
            },
          }}
        />

        <TextField
          size="small"
          placeholder="검색어"
          value={searchValue}
          onChange={(e) => {
            onChangeSearchValue(e.target.value);
            // TODO: 검색 값 변경 시 TanStack Query로 공유 문서 목록 새로고침
            // queryClient.invalidateQueries({ queryKey: ['sharedDocuments'] });
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
    </LocalizationProvider>
  );
}

