import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

type Props = {
  value: string;
  onChange: (value: string) => void;
};

const TAB_OPTIONS = [
  { value: 'manufacturing', label: '제조업' },
  { value: 'transport', label: '운수·창고·통신업' },
  { value: 'forestry', label: '임업' },
  { value: 'building', label: '건물 등의 종합관리사업' },
  { value: 'sanitation', label: '위생 및 유사서비스업' },
];

export default function ChecklistTabs({ value, onChange }: Props) {
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
