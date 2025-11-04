import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';

type Props = {
  tab: string;
  onChangeTab: (value: string) => void;
  q1: string;
  q2: string;
  q3: string;
  onChangeFilters: (next: { q1?: string; q2?: string; q3?: string }) => void;
  countAll: number;
  countActive: number;
  countInactive: number;
  searchField: 'all' | 'title' | 'location' | 'content' | 'author' | 'reporter';
  setSearchField: (v: 'all' | 'title' | 'location' | 'content' | 'author' | 'reporter') => void;
};

export default function OperationFilters({
  tab,
  onChangeTab,
  q1,
  q2,
  q3,
  onChangeFilters,
  countAll,
  countActive,
  countInactive,
  searchField,
  setSearchField,
}: Props) {
  return (
    <Stack sx={{ pt: 2 }} spacing={2}>
      <Tabs value={tab} onChange={(_, v) => onChangeTab(v)}>
        <Tab
          value="all"
          label={
            <Stack direction="row" alignItems="center" spacing={1}>
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

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel id="search-field-label">검색어 필터</InputLabel>
          <Select
            labelId="search-field-label"
            label="검색어 필터"
            value={searchField}
            onChange={(e) => setSearchField(e.target.value as any)}
          >
            <MenuItem value="all">전체</MenuItem>
            <MenuItem value="title">제목</MenuItem>
            <MenuItem value="location">위치</MenuItem>
            <MenuItem value="content">내용</MenuItem>
            <MenuItem value="author">작성자</MenuItem>
            <MenuItem value="reporter">보고자</MenuItem>
          </Select>
        </FormControl>
        <TextField
          size="small"
          placeholder="검색어"
          value={q2}
          onChange={(e) => onChangeFilters({ q2: e.target.value })}
          sx={{ flexGrow: 1, minWidth: 200 }}
        />
      </Stack>
    </Stack>
  );
}
