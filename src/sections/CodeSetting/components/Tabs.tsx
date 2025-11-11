import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

type Props = {
  value: string;
  onChange: (value: string) => void;
};

const TAB_OPTIONS = [
  { value: 'machine', label: '기계.기구.설비' },
  { value: 'hazard', label: '유해인자' },
];

export default function CodeSettingTabs({ value, onChange }: Props) {
  return (
    <Box sx={{ px: 3 }}>
      <Tabs
        value={value}
        onChange={(_, newValue) => onChange(newValue)}
        sx={{
          '& .MuiTab-root': {
            minHeight: 48,
            fontSize: 14,
            fontWeight: 500,
          },
        }}
      >
        {TAB_OPTIONS.map((tab) => (
          <Tab key={tab.value} label={tab.label} value={tab.value} />
        ))}
      </Tabs>
    </Box>
  );
}
