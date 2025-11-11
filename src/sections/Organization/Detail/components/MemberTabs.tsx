import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';

type Props = {
  value: 'all' | 'active' | 'inactive';
  onChange: (value: 'all' | 'active' | 'inactive') => void;
  counts: {
    all: number;
    active: number;
    inactive: number;
  };
};

export default function MemberTabs({ value, onChange, counts }: Props) {
  const handleChange = (_: React.SyntheticEvent, newValue: string) => {
    onChange(newValue as 'all' | 'active' | 'inactive');
  };

  return (
    <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3 }}>
      <Tabs value={value} onChange={handleChange} aria-label="member tabs">
        <Tab
          value="all"
          label={
            <Stack direction="row" alignItems="center" spacing={1} sx={{ p: 0 }}>
              <span>전체</span>
              <Chip
                label={counts.all}
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
              <Chip label={counts.active} size="small" color="success" variant="soft" />
            </Stack>
          }
        />
        <Tab
          value="inactive"
          label={
            <Stack direction="row" alignItems="center" spacing={1}>
              <span>비활성</span>
              <Chip label={counts.inactive} size="small" sx={{ bgcolor: 'grey.300' }} />
            </Stack>
          }
        />
      </Tabs>
    </Box>
  );
}
