import { useState } from 'react';

import type { Theme, SxProps } from '@mui/material/styles';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';

import { DashboardContent } from 'src/layouts/dashboard';
import ChecklistBreadcrumbs from './components/Breadcrumbs';
import ChecklistTabs from './components/Tabs';
import ChecklistFilters from './components/Filters';
import ChecklistTable from './components/Table';
import ChecklistPagination from './components/Pagination';
import IndustrySettingsModal from './components/IndustrySettingsModal';
import CreateRiskWorkModal from './components/CreateRiskWorkModal';
import DisasterFactorsModal from './components/DisasterFactorsModal';
import { useChecklist } from './hooks/use-checklist';
import {
  useChecklists,
  useIndustries,
  useCreateChecklist,
  useUpdateHighRiskWork,
  useSaveDisasterFactors,
} from './hooks/use-checklist-api';
import type {
  Checklist,
  IndustryItem,
  DisasterFactorItem,
} from 'src/services/checklist/checklist.types';

// ----------------------------------------------------------------------

type Props = {
  title?: string;
  description?: string;
  sx?: SxProps<Theme>;
};

export function ChecklistView({ title = '업종별 체크리스트', description, sx }: Props) {
  const [industry, setIndustry] = useState<string>('all');
  const [industrySettingsModalOpen, setIndustrySettingsModalOpen] = useState(false);
  const [createRiskWorkModalOpen, setCreateRiskWorkModalOpen] = useState(false);
  const [disasterFactorsModalOpen, setDisasterFactorsModalOpen] = useState(false);
  const [selectedChecklist, setSelectedChecklist] = useState<Checklist | null>(null);

  // 업종 목록 조회
  const industriesQuery = useIndustries();
  const industries: IndustryItem[] =
    industriesQuery.data?.industryList?.map((item) => ({
      industryIdx: item.industryIdx,
      name: item.name,
      status: item.status,
      isActive: item.status === 'ACTIVE',
    })) || [];

  // 전체 체크리스트 목록 조회 (탭 생성을 위해 필터링 없이 조회)
  const allChecklistsQuery = useChecklists({
    page: 1,
    pageSize: 1000, // 모든 데이터 가져오기
  });

  // 체크리스트 목록 조회 (서버 사이드 필터링은 industry만 사용, 나머지는 클라이언트 사이드)
  const checklistsQuery = useChecklists({
    page: 1,
    pageSize: 1000, // 모든 데이터 가져오기
    industry: industry !== 'all' ? industry : undefined, // industry는 industryIdx를 문자열로 변환한 값이거나 name
  });

  // 체크리스트 데이터 정규화
  const checklists: Checklist[] = (() => {
    const list = checklistsQuery.data?.checklistList;
    if (!list || !Array.isArray(list) || list.length === 0) return [];
    if (typeof list[0] === 'string') return [];
    return (list as Checklist[]).map((item, index) => ({
      ...item,
      id: item.checklistIdx?.toString() || `checklist-${index}`,
      registrationDate: item.createAt || item.updateAt || '',
      order: index + 1,
      industryName: item.industryName || item.industry,
    }));
  })();

  // 클라이언트 사이드 필터링 및 페이지네이션
  const logic = useChecklist(checklists, industry);

  // Mutations
  const createChecklistMutation = useCreateChecklist();
  const updateHighRiskWorkMutation = useUpdateHighRiskWork();
  const saveDisasterFactorsMutation = useSaveDisasterFactors();

  const renderContent = () => {
    if (checklistsQuery.isLoading) {
      return (
        <Stack alignItems="center" justifyContent="center" sx={{ py: 5 }}>
          <CircularProgress />
        </Stack>
      );
    }

    return (
      <Box
        sx={{
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: (theme) => theme.customShadows.card,
          width: '100%',
          overflow: 'hidden',
        }}
      >
        <ChecklistTabs
          value={industry}
          onChange={(newIndustry) => {
            setIndustry(newIndustry);
          }}
          checklists={(allChecklistsQuery.data?.checklistList as Checklist[]) || []}
        />

        <ChecklistFilters
          status={logic.filters.status}
          onChangeStatus={(status) => {
            logic.onChangeStatus(status);
          }}
          startDate={logic.filters.startDate}
          onChangeStartDate={(date) => {
            logic.onChangeStartDate(date);
          }}
          endDate={logic.filters.endDate}
          onChangeEndDate={(date) => {
            logic.onChangeEndDate(date);
          }}
          searchFilter={logic.filters.searchFilter}
          onChangeSearchFilter={(filter) => {
            logic.onChangeSearchFilter(filter);
          }}
          searchValue={logic.filters.searchValue}
          onChangeSearchValue={(value) => {
            logic.onChangeSearchValue(value);
          }}
        />

        <ChecklistTable
          rows={logic.filtered}
          onSave={(rowId, newValue) => {
            const checklist = checklists.find((c) => c.id === rowId);
            if (checklist?.checklistIdx) {
              updateHighRiskWorkMutation.mutate({
                checklistIdx: checklist.checklistIdx,
                highRiskWork: newValue,
              });
            }
          }}
          onViewDisasterFactors={(row) => {
            setSelectedChecklist(row);
            setDisasterFactorsModalOpen(true);
          }}
        />

        <ChecklistPagination
          count={logic.total}
          page={logic.page}
          rowsPerPage={logic.rowsPerPage}
          onChangePage={(event, newPage) => {
            logic.onChangePage(event, newPage);
          }}
          onChangeRowsPerPage={(event) => {
            logic.onChangeRowsPerPage(event);
          }}
        />
      </Box>
    );
  };

  const handleIndustrySettings = () => {
    setIndustrySettingsModalOpen(true);
  };

  const handleCreate = () => {
    setCreateRiskWorkModalOpen(true);
  };

  const handleSaveRiskWork = (data: { industry: string; highRiskWork: string }) => {
    // industry는 industryIdx로 변환 필요
    const selectedIndustry = industries.find((ind) => ind.name === data.industry);
    if (selectedIndustry?.industryIdx) {
      createChecklistMutation.mutate(
        {
          industryIdx: selectedIndustry.industryIdx,
          highRiskWork: data.highRiskWork,
        },
        {
          onSuccess: () => {
            setCreateRiskWorkModalOpen(false);
          },
        }
      );
    }
  };

  const handleSaveDisasterFactors = (factors: DisasterFactorItem[], isActive: boolean) => {
    if (!selectedChecklist?.checklistIdx) return;

    saveDisasterFactorsMutation.mutate(
      {
        checklistIdx: selectedChecklist.checklistIdx,
        disasterFactorList: factors.map((factor) => ({
          disasterFactorIdx: factor.disasterFactorIdx,
          factorName: factor.factorName,
          order: factor.order,
          isActive: factor.isActive ? 1 : 0,
        })),
      },
      {
        onSuccess: () => {
          setDisasterFactorsModalOpen(false);
          setSelectedChecklist(null);
        },
      }
    );
  };

  return (
    <DashboardContent maxWidth="xl">
      <Typography variant="h4">{title}</Typography>
      {description && <Typography sx={{ mt: 1 }}>{description}</Typography>}

      <ChecklistBreadcrumbs
        items={[
          { label: '대시보드', href: '/admin/dashboard' },
          { label: '설정 및 관리', href: '/admin/dashboard' },
          { label: title },
        ]}
        onIndustrySettings={handleIndustrySettings}
        onCreate={handleCreate}
      />

      <Box sx={[(theme) => ({ mt: 2, width: 1 }), ...(Array.isArray(sx) ? sx : [sx])]}>
        {renderContent()}
      </Box>

      <IndustrySettingsModal
        open={industrySettingsModalOpen}
        onClose={() => setIndustrySettingsModalOpen(false)}
      />

      <CreateRiskWorkModal
        open={createRiskWorkModalOpen}
        onClose={() => setCreateRiskWorkModalOpen(false)}
        onSave={handleSaveRiskWork}
        industries={industries}
      />

      <DisasterFactorsModal
        open={disasterFactorsModalOpen}
        onClose={() => {
          setDisasterFactorsModalOpen(false);
          setSelectedChecklist(null);
        }}
        onSave={handleSaveDisasterFactors}
        checklist={selectedChecklist}
      />
    </DashboardContent>
  );
}
