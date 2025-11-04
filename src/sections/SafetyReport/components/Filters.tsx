import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import InputAdornment from '@mui/material/InputAdornment';

import { Iconify } from 'src/components/iconify';

type Props = {
  documentType: string;
  onChangeDocumentType: (value: string) => void;
  searchField: 'all' | 'documentName';
  onChangeSearchField: (value: 'all' | 'documentName') => void;
  searchValue: string;
  onChangeSearchValue: (value: string) => void;
};

export default function SafetyReportFilters({
  documentType,
  onChangeDocumentType,
  searchField,
  onChangeSearchField,
  searchValue,
  onChangeSearchValue,
}: Props) {
  return (
    <Stack
      direction="row"
      spacing={2}
      sx={{
        px: 2.5,
        py: 2.5,
        gap: 2,
      }}
    >
      <FormControl size="small" sx={{ minWidth: 160 }}>
        <InputLabel id="document-type-label">필터</InputLabel>
        <Select
          labelId="document-type-label"
          label="필터"
          value={documentType}
          onChange={(e) => onChangeDocumentType(e.target.value)}
        >
          <MenuItem value="all">전체</MenuItem>
          <MenuItem value="정책/방침">정책/방침</MenuItem>
          <MenuItem value="매뉴얼">매뉴얼</MenuItem>
          <MenuItem value="가이드라인">가이드라인</MenuItem>
          <MenuItem value="안전규정">안전규정</MenuItem>
          <MenuItem value="교육자료">교육자료</MenuItem>
        </Select>
      </FormControl>
      <FormControl size="small" sx={{ minWidth: 160 }}>
        <InputLabel id="search-field-label">검색어</InputLabel>
        <Select
          labelId="search-field-label"
          label="검색어"
          value={searchField}
          onChange={(e) => onChangeSearchField(e.target.value as 'all' | 'documentName')}
        >
          <MenuItem value="all">전체</MenuItem>
          <MenuItem value="documentName">제목</MenuItem>
        </Select>
      </FormControl>
      <TextField
        size="small"
        placeholder="검색어"
        value={searchValue}
        onChange={(e) => onChangeSearchValue(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Iconify icon="eva:search-fill" width={24} sx={{ color: 'primary.main' }} />
            </InputAdornment>
          ),
        }}
        sx={{ flexGrow: 1, minWidth: 200 }}
      />
    </Stack>
  );
}
