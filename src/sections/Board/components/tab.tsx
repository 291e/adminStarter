import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';

import { Label } from 'src/components/label';

// ----------------------------------------------------------------------

type Props = {
  currentTab: string;
  onChangeTab: (event: React.SyntheticEvent, newValue: string) => void;
  counts: {
    all: number;
    active: number;
    inactive: number;
  };
};

export default function BoardTabs({ currentTab, onChangeTab, counts }: Props) {
  return (
    <Box
      sx={{
        px: 2,
        borderBottom: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper',
        borderRadius: '8px 8px 0 0',
      }}
    >
      <Tabs
        value={currentTab}
        onChange={onChangeTab}
        sx={{
          '& .MuiTabs-indicator': {
            backgroundColor: 'text.primary',
          },
        }}
      >
        <Tab
          value="all"
          label="전체"
          icon={
            <Label
              variant={currentTab === 'all' ? 'filled' : 'soft'}
              color="default"
              sx={{ ml: 1 }}
            >
              {counts.all}
            </Label>
          }
          iconPosition="end"
          sx={{
            minHeight: 48,
            fontSize: 14,
            fontWeight: 500,
            '&.Mui-selected': { color: 'text.primary' },
          }}
        />
        <Tab
          value="active"
          label="활성"
          icon={
            <Label
              variant={currentTab === 'active' ? 'filled' : 'soft'}
              color="success"
              sx={{ ml: 1 }}
            >
              {counts.active}
            </Label>
          }
          iconPosition="end"
          sx={{
            minHeight: 48,
            fontSize: 14,
            fontWeight: 500,
            '&.Mui-selected': { color: 'text.primary' },
          }}
        />
        <Tab
          value="inactive"
          label="비활성"
          icon={
            <Label
              variant={currentTab === 'inactive' ? 'filled' : 'soft'}
              color="default"
              sx={{ ml: 1 }}
            >
              {counts.inactive}
            </Label>
          }
          iconPosition="end"
          sx={{
            minHeight: 48,
            fontSize: 14,
            fontWeight: 500,
            '&.Mui-selected': { color: 'text.primary' },
          }}
        />
      </Tabs>
    </Box>
  );
}
