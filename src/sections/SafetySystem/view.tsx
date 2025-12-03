import type { Theme, SxProps } from '@mui/material/styles';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { DashboardContent } from 'src/layouts/dashboard';
import { useQuery } from '@tanstack/react-query';
import { getSafetySystemList } from 'src/services/safety-system/safety-system.service';
import type { SafetySystem } from 'src/services/safety-system/safety-system.types';

import { useNavigate } from 'react-router';
import React, { useMemo } from 'react';
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
  const navigate = useNavigate();

  // API에서 시스템 목록 조회
  const { data, isLoading, error } = useQuery<SafetySystem[]>({
    queryKey: ['safety-system', 'systems'],
    queryFn: async () => {
      const response = await getSafetySystemList();
      // axios 인터셉터에서 body를 평탄화하므로, response.body가 최상위로 올라옴
      // BaseResponseDto<{ systemList: SafetySystem[], totalCount: number }> 구조에서
      // 인터셉터를 거치면 { systemList: SafetySystem[], totalCount: number, header: ... } 형태가 됨
      const systems = (response as any).systemList || (response as any).body?.systemList || [];
      return systems as SafetySystem[];
    },
  });

  // API 응답을 UI 구조에 맞게 변환
  const transformedSystems = useMemo<SafetySystem[]>(() => {
    if (!data) return [];

    return data.map((system: SafetySystem) => ({
      ...system,
      // itemList를 items로 변환 (UI 호환성)
      items: (system.itemList || []).map((item) => ({
        ...item,
        // UI 호환성을 위한 필드 매핑
        documentName: item.itemName || item.documentName || '',
        documentCount: item.documentCount ?? item.documentList?.length ?? 0,
        lastWrittenAt: item.lastWrittenAt
          ? typeof item.lastWrittenAt === 'string'
            ? item.lastWrittenAt
            : new Date(item.lastWrittenAt).toISOString()
          : '',
      })),
    }));
  }, [data]);

  const logic = useSafetySystem(transformedSystems);

  const renderContent = () => {
    if (isLoading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      );
    }

    if (error) {
      return (
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <Typography color="error">데이터를 불러오는 중 오류가 발생했습니다.</Typography>
        </Box>
      );
    }

    return (
      <SafetySystemTable
        rows={logic.filtered}
        onViewGuide={(system, item) => {
          // 가이드 클릭 시 Risk_2200 목록 페이지로 이동하면서 시스템/항목 정보 전달
          navigate(`/dashboard/safety-system/${system.safetyIdx}/risk-2200`, {
            state: { system, item, isGuide: true },
          });
        }}
      />
    );
  };

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
