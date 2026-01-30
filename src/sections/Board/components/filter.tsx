import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputAdornment from '@mui/material/InputAdornment';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type Props = {
  filters: {
    category: string;
    startDate: any;
    endDate: any;
    searchFilter: string;
    searchValue: string;
  };
  categories: Array<{ postCategoryIdx?: number; postCategoryTitle?: string }>;
  onFilters: (filters: any) => void;
};

export default function BoardFilter({ filters, categories, onFilters }: Props) {
  const handleChange = (field: string, value: any) => {
    onFilters({ ...filters, [field]: value });
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{
          p: 2.5,
          bgcolor: 'white',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Select
          size="small"
          value={filters.category}
          onChange={(e) => handleChange('category', e.target.value)}
          displayEmpty
          sx={{ minWidth: 160, borderRadius: 1.5 }}
        >
          <MenuItem value="">카테고리</MenuItem>
          {categories.map((category) => (
            <MenuItem
              key={category.postCategoryIdx ?? category.postCategoryTitle}
              value={category.postCategoryIdx ? String(category.postCategoryIdx) : ''}
            >
              {category.postCategoryTitle || '-'}
            </MenuItem>
          ))}
        </Select>

        <DatePicker
          label="시작일"
          value={filters.startDate}
          onChange={(date) => handleChange('startDate', date)}
          format="YYYY-MM-DD"
          slotProps={{
            textField: {
              size: 'small',
              sx: { maxWidth: 160, '& .MuiOutlinedInput-root': { borderRadius: 1.5 } },
            },
          }}
        />

        <DatePicker
          label="종료일"
          value={filters.endDate}
          onChange={(date) => handleChange('endDate', date)}
          format="YYYY-MM-DD"
          slotProps={{
            textField: {
              size: 'small',
              sx: { maxWidth: 160, '& .MuiOutlinedInput-root': { borderRadius: 1.5 } },
            },
          }}
        />

        <Select
          size="small"
          value={filters.searchFilter}
          onChange={(e) => handleChange('searchFilter', e.target.value)}
          displayEmpty
          sx={{ minWidth: 160, borderRadius: 1.5 }}
        >
          <MenuItem value="">검색어 필터</MenuItem>
          <MenuItem value="title">제목</MenuItem>
          <MenuItem value="author">등록자</MenuItem>
        </Select>

        <TextField
          size="small"
          placeholder="검색어"
          value={filters.searchValue}
          onChange={(e) => handleChange('searchValue', e.target.value)}
          sx={{
            flexGrow: 1,
            minWidth: 200,
            '& .MuiOutlinedInput-root': { borderRadius: 1.5 },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify
                  icon="eva:search-fill"
                  sx={{ color: 'text.disabled', width: 20, height: 20 }}
                />
              </InputAdornment>
            ),
          }}
        />
      </Stack>
    </LocalizationProvider>
  );
}
