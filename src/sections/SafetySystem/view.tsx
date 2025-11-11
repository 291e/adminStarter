import type { Theme, SxProps } from '@mui/material/styles';

import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { mockSafetySystems } from 'src/_mock/_safety-system';
import { DashboardContent } from 'src/layouts/dashboard';

import { useNavigate } from 'react-router';
import React from 'react';
import { useSafetySystem } from './hooks/use-safety-system';
import SafetySystemBreadcrumbs from './components/Breadcrumbs';
import SafetySystemTable from './components/Table';

// ----------------------------------------------------------------------

type Props = {
  title?: string;
  description?: string;
  sx?: SxProps<Theme>;
};

export function SafetySystemView({ title = 'Blank', description, sx }: Props) {
  const systems = mockSafetySystems();
  const logic = useSafetySystem(systems);
  const navigate = useNavigate();

  const renderContent = () => (
    <>
      <SafetySystemTable
        rows={logic.filtered}
        onViewGuide={(system, item) => {
          // 가이드 클릭 시 Risk_2200 목록 페이지로 이동하면서 시스템/항목 정보 전달
          navigate(`/dashboard/safety-system/${system.safetyIdx}/risk-2200`, {
            state: { system, item, isGuide: true },
          });
        }}
      />
    </>
  );

  return (
    <DashboardContent maxWidth="xl">
      <Typography variant="h4"> {title} </Typography>
      {description && <Typography sx={{ mt: 1 }}> {description} </Typography>}

      <SafetySystemBreadcrumbs items={[{ label: '대시보드', href: '/' }, { label: title }]} />

      <Box sx={[(theme) => ({ mt: 2, width: 1 }), ...(Array.isArray(sx) ? sx : [sx])]}>
        {renderContent()}
      </Box>
    </DashboardContent>
  );
}
