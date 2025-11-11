import { useState } from 'react';

import type { Theme, SxProps } from '@mui/material/styles';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { DashboardContent } from 'src/layouts/dashboard';
import CodeSettingBreadcrumbs from './components/Breadcrumbs';
import CodeSettingTabs from './components/Tabs';
import CodeSettingFilters from './components/Filters';
import CodeSettingTable from './components/Table';
import CodeSettingPagination from './components/Pagination';
import CreateMachineModal, { type MachineFormData } from './components/CreateMachineModal';
import CreateHazardModal, { type HazardFormData } from './components/CreateHazardModal';
import EditMachineModal, { type MachineEditFormData } from './components/EditMachineModal';
import EditHazardModal, { type HazardEditFormData } from './components/EditHazardModal';
import CategorySettingsModal, { type CategoryItem } from './components/CategorySettingsModal';
import { useCodeSetting } from './hooks/use-code-setting';
import { mockCodeSettings, type CodeSetting } from 'src/_mock/_code-setting';

// ----------------------------------------------------------------------

type Props = {
  title?: string;
  description?: string;
  sx?: SxProps<Theme>;
};

export function CodeSettingView({ title = '코드 관리', description, sx }: Props) {
  // TODO: TanStack Query Hook(useQuery)으로 코드 목록 가져오기
  // const { data: codes, isLoading, error } = useQuery({
  //   queryKey: ['codeSettings', category, logic.filters],
  //   queryFn: () => getCodeSettings({ category, filters: logic.filters }),
  // });
  // 목업 데이터 사용
  const codes = mockCodeSettings(20);
  const [category, setCategory] = useState<string>('machine');
  const logic = useCodeSetting(codes, category);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createHazardModalOpen, setCreateHazardModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedCode, setSelectedCode] = useState<CodeSetting | null>(null);
  const [categorySettingsModalOpen, setCategorySettingsModalOpen] = useState(false);
  const [categories, setCategories] = useState<CategoryItem[]>([]);

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
      <CodeSettingTabs
        value={category}
        onChange={(newCategory) => {
          setCategory(newCategory);
          // TODO: 탭 변경 시 TanStack Query로 코드 목록 새로고침
          // queryClient.invalidateQueries({ queryKey: ['codeSettings'] });
        }}
      />

      <CodeSettingFilters
        status={logic.filters.status}
        onChangeStatus={(status) => {
          logic.onChangeStatus(status);
          // TODO: 상태 필터 변경 시 TanStack Query로 코드 목록 새로고침
          // queryClient.invalidateQueries({ queryKey: ['codeSettings'] });
        }}
        startDate={logic.filters.startDate}
        onChangeStartDate={(date) => {
          logic.onChangeStartDate(date);
          // TODO: 시작일 변경 시 TanStack Query로 코드 목록 새로고침
          // queryClient.invalidateQueries({ queryKey: ['codeSettings'] });
        }}
        endDate={logic.filters.endDate}
        onChangeEndDate={(date) => {
          logic.onChangeEndDate(date);
          // TODO: 종료일 변경 시 TanStack Query로 코드 목록 새로고침
          // queryClient.invalidateQueries({ queryKey: ['codeSettings'] });
        }}
        searchFilter={logic.filters.searchFilter}
        onChangeSearchFilter={(filter) => {
          logic.onChangeSearchFilter(filter);
          // TODO: 검색 필터 변경 시 TanStack Query로 코드 목록 새로고침
          // queryClient.invalidateQueries({ queryKey: ['codeSettings'] });
        }}
        searchValue={logic.filters.searchValue}
        onChangeSearchValue={(value) => {
          logic.onChangeSearchValue(value);
          // TODO: 검색 값 변경 시 TanStack Query로 코드 목록 새로고침
          // queryClient.invalidateQueries({ queryKey: ['codeSettings'] });
        }}
        category={category as 'machine' | 'hazard'}
        categoryFilter={logic.filters.categoryFilter}
        onChangeCategoryFilter={(filter) => {
          logic.onChangeCategoryFilter?.(filter);
          // TODO: 카테고리 필터 변경 시 TanStack Query로 코드 목록 새로고침
          // queryClient.invalidateQueries({ queryKey: ['codeSettings'] });
        }}
      />

      <CodeSettingTable
        rows={logic.filtered}
        onEdit={(row) => {
          setSelectedCode(row);
          setEditModalOpen(true);
          // TODO: TanStack Query Hook(useQuery)으로 코드 상세 정보 가져오기 (수정 모달용)
          // const { data: detail } = useQuery({
          //   queryKey: ['codeDetail', row.id],
          //   queryFn: () => getCodeDetail(row.id),
          // });
        }}
        category={category as 'machine' | 'hazard'}
      />

      <CodeSettingPagination
        count={logic.total}
        page={logic.page}
        rowsPerPage={logic.rowsPerPage}
        onChangePage={(page) => {
          logic.onChangePage(page);
          // TODO: 페이지 변경 시 TanStack Query로 코드 목록 새로고침
          // queryClient.invalidateQueries({ queryKey: ['codeSettings'] });
        }}
        onChangeRowsPerPage={(rowsPerPage) => {
          logic.onChangeRowsPerPage(rowsPerPage);
          // TODO: 페이지 크기 변경 시 TanStack Query로 코드 목록 새로고침
          // queryClient.invalidateQueries({ queryKey: ['codeSettings'] });
        }}
      />
    </Box>
  );

  const handleCreate = () => {
    if (category === 'hazard') {
      setCreateHazardModalOpen(true);
    } else {
      setCreateModalOpen(true);
    }
  };

  const handleSaveMachine = (data: MachineFormData) => {
    // TODO: TanStack Query Hook(useMutation)으로 기계·설비 등록
    // const mutation = useMutation({
    //   mutationFn: (formData: MachineFormData) => createMachine({
    //     code: formData.code,
    //     name: formData.name,
    //     inspectionCycle: formData.inspectionCycle,
    //     protectiveDevices: formData.protectiveDevices,
    //     riskTypes: formData.riskTypes,
    //   }),
    //   onSuccess: () => {
    //     queryClient.invalidateQueries({ queryKey: ['codeSettings'] });
    //     setCreateModalOpen(false);
    //   },
    // });
    // mutation.mutate(data);
    console.log('기계·설비 등록:', data);
  };

  const handleSaveEditMachine = (data: MachineEditFormData) => {
    if (!selectedCode) return;

    // TODO: TanStack Query Hook(useMutation)으로 기계·설비 수정
    // const mutation = useMutation({
    //   mutationFn: (formData: MachineEditFormData) => updateMachine(selectedCode.id, {
    //     code: formData.code,
    //     name: formData.name,
    //     inspectionCycle: formData.inspectionCycle,
    //     protectiveDevices: formData.protectiveDevices,
    //     riskTypes: formData.riskTypes,
    //     status: formData.status,
    //   }),
    //   onSuccess: () => {
    //     queryClient.invalidateQueries({ queryKey: ['codeSettings'] });
    //     queryClient.invalidateQueries({ queryKey: ['codeDetail', selectedCode.id] });
    //     setEditModalOpen(false);
    //     setSelectedCode(null);
    //   },
    // });
    // mutation.mutate(data);
    console.log('기계·설비 수정:', data);
  };

  const handleSaveEditHazard = (data: HazardEditFormData) => {
    if (!selectedCode) return;

    // TODO: TanStack Query Hook(useMutation)으로 유해인자 수정
    // const mutation = useMutation({
    //   mutationFn: (formData: HazardEditFormData) => updateHazard(selectedCode.id, {
    //     category: formData.category,
    //     code: formData.code,
    //     name: formData.name,
    //     formAndType: formData.formAndType,
    //     location: formData.location,
    //     exposureRisk: formData.exposureRisk,
    //     managementStandard: formData.managementStandard,
    //     managementMeasures: formData.managementMeasures,
    //     status: formData.status,
    //   }),
    //   onSuccess: () => {
    //     queryClient.invalidateQueries({ queryKey: ['codeSettings'] });
    //     queryClient.invalidateQueries({ queryKey: ['codeDetail', selectedCode.id] });
    //     setEditModalOpen(false);
    //     setSelectedCode(null);
    //   },
    // });
    // mutation.mutate(data);
    console.log('유해인자 수정:', data);
  };

  const handleSaveHazard = (data: HazardFormData) => {
    // TODO: TanStack Query Hook(useMutation)으로 유해인자 등록
    // const mutation = useMutation({
    //   mutationFn: (formData: HazardFormData) => createHazard({
    //     category: formData.category,
    //     code: formData.code,
    //     name: formData.name,
    //     formAndType: formData.formAndType,
    //     location: formData.location,
    //     exposureRisk: formData.exposureRisk,
    //     managementStandard: formData.managementStandard,
    //     managementMeasures: formData.managementMeasures,
    //   }),
    //   onSuccess: () => {
    //     queryClient.invalidateQueries({ queryKey: ['codeSettings'] });
    //     setCreateHazardModalOpen(false);
    //   },
    // });
    // mutation.mutate(data);
    console.log('유해인자 등록:', data);
  };

  return (
    <DashboardContent maxWidth="xl">
      <Typography variant="h4">{title}</Typography>
      {description && <Typography sx={{ mt: 1 }}>{description}</Typography>}

      <CodeSettingBreadcrumbs
        items={[
          { label: '대시보드', href: '/dashboard' },
          { label: '설정 및 관리', href: '/dashboard/system-setting' },
          { label: title },
        ]}
        onCreate={handleCreate}
        onCategorySettings={
          category === 'hazard' ? () => setCategorySettingsModalOpen(true) : undefined
        }
        category={category as 'machine' | 'hazard'}
      />

      <Box sx={[(theme) => ({ mt: 2, width: 1 }), ...(Array.isArray(sx) ? sx : [sx])]}>
        {renderContent()}
      </Box>

      <CreateMachineModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSave={handleSaveMachine}
      />

      <CreateHazardModal
        open={createHazardModalOpen}
        onClose={() => setCreateHazardModalOpen(false)}
        onSave={handleSaveHazard}
        categories={categories}
      />

      {category === 'machine' ? (
        <EditMachineModal
          open={editModalOpen}
          onClose={() => {
            setEditModalOpen(false);
            setSelectedCode(null);
          }}
          onSave={handleSaveEditMachine}
          initialData={selectedCode}
        />
      ) : (
        <EditHazardModal
          open={editModalOpen}
          onClose={() => {
            setEditModalOpen(false);
            setSelectedCode(null);
          }}
          onSave={handleSaveEditHazard}
          initialData={selectedCode}
          categories={categories}
        />
      )}

      <CategorySettingsModal
        open={categorySettingsModalOpen}
        onClose={() => setCategorySettingsModalOpen(false)}
        onSave={(updatedCategories) => {
          // TODO: TanStack Query Hook(useMutation)으로 카테고리 목록 저장
          // const mutation = useMutation({
          //   mutationFn: (categories: CategoryItem[]) => saveHazardCategories(categories),
          //   onSuccess: () => {
          //     queryClient.invalidateQueries({ queryKey: ['hazardCategories'] });
          //     setCategories(updatedCategories);
          //     setCategorySettingsModalOpen(false);
          //   },
          // });
          // mutation.mutate(updatedCategories);
          setCategories(updatedCategories);
        }}
        initialCategories={categories}
      />
    </DashboardContent>
  );
}
