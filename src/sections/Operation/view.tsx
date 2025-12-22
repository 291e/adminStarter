import type { Theme, SxProps } from '@mui/material/styles';

import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';

import { DashboardContent } from 'src/layouts/dashboard';

import { useOperation } from './hooks/use-operation';
import { useNavigate } from 'react-router';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';

import OperationBreadcrumbs from './components/Breadcrumbs';
import OperationFilters from './components/Filters';
import OperationTable from './components/Table';
import OperationPagination from './components/Pagination';
import { useRiskReports, useUpdateRiskReport } from './hooks/use-operation-api';
import type { RiskReport } from 'src/services/operation/operation.types';
import { getSafetySystemList } from 'src/services/safety-system/safety-system.service';
import type {
  SafetySystem,
  SafetySystemItem,
} from 'src/services/safety-system/safety-system.types';

// ----------------------------------------------------------------------

type Props = {
  title?: string;
  description?: string;
  sx?: SxProps<Theme>;
};

export function OperationView({ title = 'Blank', description, sx }: Props) {
  const navigate = useNavigate();
  const updateRiskReportMutation = useUpdateRiskReport();

  // 전체 데이터 가져오기 (클라이언트 사이드 페이지네이션용)
  const { data, isLoading, isError } = useRiskReports({
    page: 1,
    pageSize: 1000, // 충분히 큰 값으로 모든 데이터 가져오기
  });

  // 데이터 변환
  const allRiskReports = React.useMemo<RiskReport[]>(() => {
    const body = data?.body;
    return body?.riskReportList ?? [];
  }, [data]);

  // 클라이언트 사이드 필터링 및 페이지네이션
  const logic = useOperation(allRiskReports);

  // SafetySystem 목록 조회 (1200번대 아이템 찾기용)
  const { data: safetySystemData } = useQuery({
    queryKey: ['safety-system', 'systems'],
    queryFn: async () => {
      const response = await getSafetySystemList();
      const systemList =
        (response as any).systemList ||
        (response as any).body?.data?.systemList ||
        (response as any).body?.systemList ||
        [];
      return systemList as SafetySystem[];
    },
    staleTime: 5 * 60 * 1000,
  });

  React.useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('🔍 [OperationView] 위험 보고 목록 상태', {
        allData: allRiskReports.length,
        filtered: logic.filtered.length,
        total: logic.total,
        data,
        isLoading,
        isError,
      });
    }
  }, [data, isLoading, isError, allRiskReports.length, logic.filtered.length, logic.total]);

  const handleEdit = (row: RiskReport) => {
    if (import.meta.env.DEV) {
      console.log('🔍 [handleEdit] 수정 버튼 클릭', {
        row,
        riskReportIdx: row.riskReportIdx,
        id: row.id,
      });
    }
    const riskReportIdx = row.riskReportIdx ? String(row.riskReportIdx) : row.id;
    if (!riskReportIdx) {
      if (import.meta.env.DEV) {
        console.error('❌ [handleEdit] riskReportIdx를 찾을 수 없습니다.', row);
      }
      return;
    }
    if (import.meta.env.DEV) {
      console.log(
        '✅ [handleEdit] 네비게이션',
        `/dashboard/operation/risk-report/edit/${riskReportIdx}`
      );
    }
    navigate(`/dashboard/operation/risk-report/edit/${riskReportIdx}`);
  };

  const handleRegisterAccident = async (row: RiskReport) => {
    try {
      // 1. 위험보고 상태를 CONFIRMED로 업데이트
      const riskReportIdx = row.riskReportIdx ? Number(row.riskReportIdx) : Number(row.id);
      if (riskReportIdx) {
        await updateRiskReportMutation.mutateAsync({
          riskReportIdx,
          status: 'CONFIRMED',
        });
      }

      // 2. SafetySystem에서 safetyIdx=1, itemNumber=2인 아이템 찾기
      const targetSystem = safetySystemData?.find((system) => system.safetyIdx === 1);
      const targetItem: SafetySystemItem | undefined =
        targetSystem?.itemList?.find((item) => item.safetyIdx === 1 && item.itemNumber === 2) ||
        targetSystem?.items?.find((item) => item.safetyIdx === 1 && item.itemNumber === 2);

      if (!targetSystem || !targetItem) {
        console.error('SafetySystem 또는 Item을 찾을 수 없습니다.');
        return;
      }

      // 3. 메타정보 추출
      const registeredAt = row.registeredAt ? dayjs(row.registeredAt) : dayjs();
      const dateStr = registeredAt.format('YYYY-MM-DD');
      const timeStr = registeredAt.format('HH:mm');

      // 4. Risk_2200/create로 navigate하면서 메타정보 전달
      navigate(`/dashboard/safety-system/${targetSystem.safetyIdx}/risk-2200/create`, {
        state: {
          system: targetSystem,
          item: targetItem,
          documentType: 'near-miss' as const,
          documentData: {
            // 아차사고 폼 초기값
            workName: '',
            grade: 'A' as const,
            reporter: row.reporterName || '',
            reporterDepartment: '',
            workContent: '',
            accidentContent: row.content || '',
            accidentRiskLevel: 'A' as const,
            accidentCause: '',
            preventionMeasure: '',
            preventionRiskLevel: 'A' as const,
            siteSituation: '',
            siteImages: row.imageUrls || (row.imageUrl ? [row.imageUrl] : []),
            // 일시 정보는 별도로 전달 (registeredAt에서 추출)
            accidentDate: dateStr,
            accidentTime: timeStr,
            accidentLocation: row.location || '',
          },
        },
      });
    } catch (error) {
      console.error('아차사고 등록 실패:', error);
    }
  };

  const handleRegisterIndustrialAccident = async (row: RiskReport) => {
    try {
      // 1. 위험보고 상태를 CONFIRMED로 업데이트
      const riskReportIdx = row.riskReportIdx ? Number(row.riskReportIdx) : Number(row.id);
      if (riskReportIdx) {
        await updateRiskReportMutation.mutateAsync({
          riskReportIdx,
          status: 'CONFIRMED',
        });
      }

      // 2. SafetySystem에서 safetyIdx=1, itemNumber=2인 아이템 찾기
      const targetSystem = safetySystemData?.find((system) => system.safetyIdx === 1);
      const targetItem: SafetySystemItem | undefined =
        targetSystem?.itemList?.find((item) => item.safetyIdx === 1 && item.itemNumber === 2) ||
        targetSystem?.items?.find((item) => item.safetyIdx === 1 && item.itemNumber === 2);

      if (!targetSystem || !targetItem) {
        console.error('SafetySystem 또는 Item을 찾을 수 없습니다.');
        return;
      }

      // 3. 메타정보 추출
      const registeredAt = row.registeredAt ? dayjs(row.registeredAt) : dayjs();
      const dateStr = registeredAt.format('YYYY-MM-DD');
      const timeStr = registeredAt.format('HH:mm');

      // 4. Risk_2200/create로 navigate하면서 메타정보 전달
      navigate(`/dashboard/safety-system/${targetSystem.safetyIdx}/risk-2200/create`, {
        state: {
          system: targetSystem,
          item: targetItem,
          documentType: 'industrial-accident' as const,
          documentData: {
            // 산업재해 폼 초기값
            accidentName: '',
            accidentDate: dateStr,
            accidentTime: timeStr,
            accidentLocation: row.location || '',
            accidentType: '',
            investigationTeam: [{ department: '', name: '' }],
            humanDamage: [{ department: '', name: '', position: '', injury: '' }],
            materialDamage: '',
            accidentContent: row.content || '',
            riskAssessmentBefore: {
              possibility: '',
              severity: '',
              risk: '',
            },
            accidentCause: '',
            doctorOpinion: '',
            preventionMeasure: '',
            riskAssessmentAfter: {
              possibility: '',
              severity: '',
              risk: '',
            },
            otherContent: '',
            investigationImages: row.imageUrls || (row.imageUrl ? [row.imageUrl] : []),
          },
        },
      });
    } catch (error) {
      console.error('산업재해 등록 실패:', error);
    }
  };

  const renderTableSection = () => {
    if (isLoading) {
      return (
        <Stack alignItems="center" sx={{ py: 6 }}>
          <CircularProgress />
        </Stack>
      );
    }

    if (isError) {
      return (
        <Alert severity="error" sx={{ my: 4 }}>
          위험 보고 목록을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.
        </Alert>
      );
    }

    if (logic.filtered.length === 0) {
      return (
        <Alert severity="info" sx={{ my: 4 }}>
          조회된 위험 보고가 없습니다. 조건을 변경해보세요.
        </Alert>
      );
    }

    return (
      <OperationTable
        rows={logic.filtered}
        onEdit={handleEdit}
        onRegisterAccident={handleRegisterAccident}
        onRegisterIndustrialAccident={handleRegisterIndustrialAccident}
      />
    );
  };

  const renderContent = () => (
    <>
      <OperationFilters
        tab={logic.tab}
        onChangeTab={(tab) => {
          logic.onChangeTab(tab);
        }}
        startDate={logic.startDate}
        onChangeStartDate={logic.onChangeStartDate}
        endDate={logic.endDate}
        onChangeEndDate={logic.onChangeEndDate}
        countAll={logic.countAll}
        countActive={logic.countActive}
        countInactive={logic.countInactive}
        searchField={logic.searchField}
        setSearchField={logic.setSearchField}
        searchValue={logic.searchValue}
        onChangeSearchValue={logic.onChangeSearchValue}
      />

      {renderTableSection()}

      <Divider sx={{ mt: 2, mb: 1 }} />

      <OperationPagination
        count={logic.total}
        page={logic.page}
        rowsPerPage={logic.rowsPerPage}
        onChangePage={(page) => {
          logic.onChangePage(page);
        }}
        onChangeRowsPerPage={(rowsPerPage) => {
          logic.onChangeRowsPerPage(rowsPerPage);
        }}
      />
    </>
  );

  return (
    <DashboardContent maxWidth="xl">
      <Typography variant="h4"> {title} </Typography>
      {description && <Typography sx={{ mt: 1 }}> {description} </Typography>}

      <OperationBreadcrumbs
        items={[
          { label: '대시보드', href: '/admin/dashboard' },
          { label: '현장 운영 관리', href: '/admin/dashboard/operation' },
          { label: title },
        ]}
        onCreate={() => navigate('/dashboard/operation/risk-report/create')}
      />

      <Box sx={[(theme) => ({ mt: 2, width: 1 }), ...(Array.isArray(sx) ? sx : [sx])]}>
        {renderContent()}
      </Box>
    </DashboardContent>
  );
}
