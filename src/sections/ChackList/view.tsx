import { useState } from 'react';

import type { Theme, SxProps } from '@mui/material/styles';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { DashboardContent } from 'src/layouts/dashboard';
import ChecklistBreadcrumbs from './components/Breadcrumbs';
import ChecklistTabs from './components/Tabs';
import ChecklistFilters from './components/Filters';
import ChecklistTable from './components/Table';
import ChecklistPagination from './components/Pagination';
import IndustrySettingsModal, { type IndustryItem } from './components/IndustrySettingsModal';
import CreateRiskWorkModal, { type RiskWorkFormData } from './components/CreateRiskWorkModal';
import DisasterFactorsModal, { type DisasterFactorItem } from './components/DisasterFactorsModal';
import { useChecklist } from './hooks/use-checklist';
import { mockChecklists, type Checklist } from 'src/_mock/_checklist';

// ----------------------------------------------------------------------

type Props = {
  title?: string;
  description?: string;
  sx?: SxProps<Theme>;
};

export function ChecklistView({ title = '업종별 체크리스트', description, sx }: Props) {
  // TODO: TanStack Query Hook(useQuery)으로 체크리스트 목록 가져오기
  // const { data: checklists, isLoading, error } = useQuery({
  //   queryKey: ['checklists', industry, logic.filters],
  //   queryFn: () => getChecklists({ industry, filters: logic.filters }),
  // });
  // 목업 데이터 사용
  const checklists = mockChecklists(30);
  const [industry, setIndustry] = useState('manufacturing');
  const logic = useChecklist(checklists, industry);
  const [industrySettingsModalOpen, setIndustrySettingsModalOpen] = useState(false);
  const [createRiskWorkModalOpen, setCreateRiskWorkModalOpen] = useState(false);
  const [disasterFactorsModalOpen, setDisasterFactorsModalOpen] = useState(false);
  const [selectedChecklist, setSelectedChecklist] = useState<Checklist | null>(null);
  const [industries, setIndustries] = useState<IndustryItem[]>([]);

  const renderContent = () => (
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
          // TODO: 업종 변경 시 TanStack Query로 체크리스트 목록 새로고침
          // queryClient.invalidateQueries({ queryKey: ['checklists'] });
        }}
      />

      <ChecklistFilters
        status={logic.filters.status}
        onChangeStatus={(status) => {
          logic.onChangeStatus(status);
          // TODO: 상태 필터 변경 시 TanStack Query로 체크리스트 목록 새로고침
          // queryClient.invalidateQueries({ queryKey: ['checklists'] });
        }}
        startDate={logic.filters.startDate}
        onChangeStartDate={(date) => {
          logic.onChangeStartDate(date);
          // TODO: 시작일 변경 시 TanStack Query로 체크리스트 목록 새로고침
          // queryClient.invalidateQueries({ queryKey: ['checklists'] });
        }}
        endDate={logic.filters.endDate}
        onChangeEndDate={(date) => {
          logic.onChangeEndDate(date);
          // TODO: 종료일 변경 시 TanStack Query로 체크리스트 목록 새로고침
          // queryClient.invalidateQueries({ queryKey: ['checklists'] });
        }}
        searchFilter={logic.filters.searchFilter}
        onChangeSearchFilter={(filter) => {
          logic.onChangeSearchFilter(filter);
          // TODO: 검색 필터 변경 시 TanStack Query로 체크리스트 목록 새로고침
          // queryClient.invalidateQueries({ queryKey: ['checklists'] });
        }}
        searchValue={logic.filters.searchValue}
        onChangeSearchValue={(value) => {
          logic.onChangeSearchValue(value);
          // TODO: 검색 값 변경 시 TanStack Query로 체크리스트 목록 새로고침
          // queryClient.invalidateQueries({ queryKey: ['checklists'] });
        }}
      />

      <ChecklistTable
        rows={logic.filtered}
        onSave={(rowId, newValue) => {
          // TODO: TanStack Query Hook(useMutation)으로 고위험작업/상황 업데이트
          // const mutation = useMutation({
          //   mutationFn: ({ id, value }: { id: string; value: string }) =>
          //     updateChecklist(id, { highRiskWork: value }),
          //   onSuccess: () => {
          //     queryClient.invalidateQueries({ queryKey: ['checklists'] });
          //   },
          // });
          // mutation.mutate({ id: rowId, value: newValue });
          console.log('저장:', rowId, newValue);
        }}
        onViewDisasterFactors={(row) => {
          setSelectedChecklist(row);
          setDisasterFactorsModalOpen(true);
          // TODO: TanStack Query Hook(useQuery)으로 재해유발요인 목록 가져오기 (모달용)
          // const { data: factors } = useQuery({
          //   queryKey: ['disasterFactors', row.id],
          //   queryFn: () => getDisasterFactors(row.id),
          // });
        }}
      />

      <ChecklistPagination
        count={logic.total}
        page={logic.page}
        rowsPerPage={logic.rowsPerPage}
        onChangePage={(event, newPage) => {
          logic.onChangePage(event, newPage);
          // TODO: 페이지 변경 시 TanStack Query로 체크리스트 목록 새로고침
          // queryClient.invalidateQueries({ queryKey: ['checklists'] });
        }}
        onChangeRowsPerPage={(event) => {
          logic.onChangeRowsPerPage(event);
          // TODO: 페이지 크기 변경 시 TanStack Query로 체크리스트 목록 새로고침
          // queryClient.invalidateQueries({ queryKey: ['checklists'] });
        }}
      />
    </Box>
  );

  const handleIndustrySettings = () => {
    setIndustrySettingsModalOpen(true);
  };

  const handleSaveIndustries = (newIndustries: IndustryItem[]) => {
    // TODO: TanStack Query Hook(useMutation)으로 업종 목록 저장
    // const mutation = useMutation({
    //   mutationFn: (industries: IndustryItem[]) => saveIndustries(industries),
    //   onSuccess: () => {
    //     queryClient.invalidateQueries({ queryKey: ['industries'] });
    //     setIndustrySettingsModalOpen(false);
    //   },
    // });
    // mutation.mutate(newIndustries);
    console.log('업종 저장:', newIndustries);
  };

  const handleCreate = () => {
    setCreateRiskWorkModalOpen(true);
  };

  const handleSaveRiskWork = (data: RiskWorkFormData) => {
    // TODO: TanStack Query Hook(useMutation)으로 위험작업/상황 등록
    // const mutation = useMutation({
    //   mutationFn: (formData: RiskWorkFormData) => createRiskWork({
    //     industry: formData.industry,
    //     highRiskWork: formData.highRiskWork,
    //   }),
    //   onSuccess: () => {
    //     queryClient.invalidateQueries({ queryKey: ['checklists'] });
    //     setCreateRiskWorkModalOpen(false);
    //   },
    // });
    // mutation.mutate(data);
    console.log('위험작업/상황 등록:', data);
  };

  const handleSaveDisasterFactors = (factors: DisasterFactorItem[], isActive: boolean) => {
    if (!selectedChecklist) return;

    // TODO: TanStack Query Hook(useMutation)으로 재해유발요인 목록 저장
    // const mutation = useMutation({
    //   mutationFn: ({ checklistId, factors, isActive }: {
    //     checklistId: string;
    //     factors: DisasterFactorItem[];
    //     isActive: boolean;
    //   }) => saveDisasterFactors(checklistId, { factors, isActive }),
    //   onSuccess: () => {
    //     queryClient.invalidateQueries({ queryKey: ['checklists'] });
    //     queryClient.invalidateQueries({ queryKey: ['disasterFactors', selectedChecklist.id] });
    //     setDisasterFactorsModalOpen(false);
    //     setSelectedChecklist(null);
    //   },
    // });
    // mutation.mutate({ checklistId: selectedChecklist.id, factors, isActive });
    console.log('재해유발요인 저장:', factors, isActive);
  };

  return (
    <DashboardContent maxWidth="xl">
      <Typography variant="h4">{title}</Typography>
      {description && <Typography sx={{ mt: 1 }}>{description}</Typography>}

      <ChecklistBreadcrumbs
        items={[
          { label: '대시보드', href: '/dashboard' },
          { label: '설정 및 관리', href: '/dashboard/system-setting' },
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
        onSave={handleSaveIndustries}
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
