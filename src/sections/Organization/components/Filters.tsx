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
  searchField: 'all' | 'orgName' | 'name' | 'phone' | 'email' | 'address';
  setSearchField: (v: 'all' | 'orgName' | 'name' | 'phone' | 'email' | 'address') => void;
};

export default function OrganizationFilters({
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
          value="active"
          label={
            <Stack direction="row" alignItems="center" spacing={1}>
              <span>활성</span>
              <Chip label={countActive} size="small" color="success" variant="soft" />
            </Stack>
          }
        />
        <Tab
          value="inactive"
          label={
            <Stack direction="row" alignItems="center" spacing={1}>
              <span>비활성</span>
              <Chip label={countInactive} size="small" sx={{ bgcolor: 'grey.300' }} />
            </Stack>
          }
        />
      </Tabs>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel id="filter-label">필터</InputLabel>
          <Select
            labelId="filter-label"
            label="필터"
            value={tab}
            onChange={(e) => onChangeTab(e.target.value)}
          >
            <MenuItem value="all">전체</MenuItem>
            <MenuItem value="active">활성</MenuItem>
            <MenuItem value="inactive">비활성</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel id="search-field-label">검색어 필터</InputLabel>
          <Select
            labelId="search-field-label"
            label="검색어 필터"
            value={searchField}
            onChange={(e) => setSearchField(e.target.value as any)}
          >
            <MenuItem value="all">전체</MenuItem>
            <MenuItem value="orgName">조직명</MenuItem>
            <MenuItem value="name">이름</MenuItem>
            <MenuItem value="phone">전화번호</MenuItem>
            <MenuItem value="email">이메일</MenuItem>
            <MenuItem value="address">주소</MenuItem>
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
