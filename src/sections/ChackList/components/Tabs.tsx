import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

import type { Checklist } from 'src/services/checklist/checklist.types';

type Props = {
  value: string;
  onChange: (value: string) => void;
  checklists?: Checklist[];
};

export default function ChecklistTabs({ value, onChange, checklists = [] }: Props) {
  const industryNames = new Set<string>();

  checklists.forEach((checklist) => {
    if (checklist.industryName) {
      industryNames.add(checklist.industryName);
    }
  });

  const sortedIndustries = Array.from(industryNames).sort();

  const tabOptions = [
    { value: 'all', label: '전체' },
    ...sortedIndustries.map((industryName) => ({
      value: industryName,
      label: industryName,
    })),
  ];

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
        {tabOptions.map((tab) => (
          <Tab key={tab.value} label={tab.label} value={tab.value} />
        ))}
      </Tabs>
    </Box>
  );
}
