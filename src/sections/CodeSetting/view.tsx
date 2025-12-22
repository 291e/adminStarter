import { useState, useMemo } from 'react';

import type { Theme, SxProps } from '@mui/material/styles';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';

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
import {
  useCodes,
  useCreateMachine,
  useUpdateMachine,
  useCreateHazard,
  useUpdateHazard,
  useHazardCategories,
} from './hooks/use-code-setting-api';
import type { CodeSetting } from 'src/services/code-setting/code-setting.types';

// ----------------------------------------------------------------------

type Props = {
  title?: string;
  description?: string;
  sx?: SxProps<Theme>;
};

export function CodeSettingView({ title = '코드 관리', description, sx }: Props) {
  const [category, setCategory] = useState<'machine' | 'hazard'>('machine');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createHazardModalOpen, setCreateHazardModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedCode, setSelectedCode] = useState<CodeSetting | null>(null);
  const [categorySettingsModalOpen, setCategorySettingsModalOpen] = useState(false);

  // API Hooks
  const createMachineMutation = useCreateMachine();
  const updateMachineMutation = useUpdateMachine();
  const createHazardMutation = useCreateHazard();
  const updateHazardMutation = useUpdateHazard();

  // 코드 목록 조회
  const codesQuery = useCodes({
    categoryType: category,
    page: 1,
    pageSize: 1000, // 전체 데이터 조회 후 클라이언트 사이드 필터링
  });

  // 유해인자 카테고리 조회
  const categoriesQuery = useHazardCategories();

  // 카테고리 데이터 변환
  const categories = useMemo<CategoryItem[]>(() => {
    const apiCategories = categoriesQuery.data?.categoryList ?? [];
    return apiCategories.map((item) => ({
      hazardCategoryIdx: item.hazardCategoryIdx,
      name: item.name,
      isActive: item.status === 'ACTIVE',
    }));
  }, [categoriesQuery.data]);

  // 코드 목록 데이터
  const codes = useMemo(() => codesQuery.data?.codeSettingList ?? [], [codesQuery.data]);

  // 클라이언트 사이드 필터링 및 페이지네이션
  const logic = useCodeSetting(codes, category);

  const renderContent = () => {
    if (codesQuery.isLoading) {
      return (
        <Stack alignItems="center" justifyContent="center" sx={{ py: 5 }}>
          <CircularProgress />
        </Stack>
      );
    }

    if (codesQuery.isError) {
      return (
        <Alert severity="error" sx={{ m: 2 }}>
          코드 데이터를 불러오는 중 오류가 발생했습니다.
        </Alert>
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
        <CodeSettingTabs
          value={category}
          onChange={(newCategory) => {
            setCategory(newCategory as 'machine' | 'hazard');
          }}
        />

        <CodeSettingFilters
          status={logic.filters.status}
          onChangeStatus={logic.onChangeStatus}
          startDate={logic.filters.startDate}
          onChangeStartDate={logic.onChangeStartDate}
          endDate={logic.filters.endDate}
          onChangeEndDate={logic.onChangeEndDate}
          searchFilter={logic.filters.searchFilter}
          onChangeSearchFilter={logic.onChangeSearchFilter}
          searchValue={logic.filters.searchValue}
          onChangeSearchValue={logic.onChangeSearchValue}
          category={category}
          categoryFilter={logic.filters.categoryFilter}
          onChangeCategoryFilter={logic.onChangeCategoryFilter}
          hazardCategories={category === 'hazard' ? categories : []}
        />

        <CodeSettingTable
          rows={logic.paginated}
          onEdit={(row) => {
            setSelectedCode(row);
            setEditModalOpen(true);
          }}
          category={category}
        />

        <CodeSettingPagination
          count={logic.total}
          page={logic.page}
          rowsPerPage={logic.rowsPerPage}
          onChangePage={logic.onChangePage}
          onChangeRowsPerPage={logic.onChangeRowsPerPage}
        />
      </Box>
    );
  };

  const handleCreate = () => {
    if (category === 'hazard') {
      setCreateHazardModalOpen(true);
    } else {
      setCreateModalOpen(true);
    }
  };

  const handleSaveMachine = async (data: MachineFormData) => {
    try {
      // 문자열을 배열로 변환
      const protectiveDevicesArray = data.protectiveDevices
        ? data.protectiveDevices
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
        : [];
      const riskTypesArray = data.riskTypes
        ? data.riskTypes
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
        : [];

      await createMachineMutation.mutateAsync({
        code: data.code,
        name: data.name,
        inspectionTarget: data.inspectionTarget,
        protectiveDevices: protectiveDevicesArray,
        inspectionCycle: data.inspectionCycle,
        riskTypes: riskTypesArray,
      });
      setCreateModalOpen(false);
    } catch (error) {
      console.error('기계·설비 등록 실패:', error);
    }
  };

  const handleSaveEditMachine = async (data: MachineEditFormData) => {
    if (!selectedCode || !selectedCode.codeSettingIdx) return;

    try {
      // 문자열을 배열로 변환
      const protectiveDevicesArray =
        typeof data.protectiveDevices === 'string'
          ? data.protectiveDevices
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean)
          : Array.isArray(data.protectiveDevices)
            ? data.protectiveDevices
            : [];
      const riskTypesArray =
        typeof data.riskTypes === 'string'
          ? data.riskTypes
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean)
          : Array.isArray(data.riskTypes)
            ? data.riskTypes
            : [];

      const statusValue =
        typeof data.status === 'string'
          ? data.status.toUpperCase() === 'ACTIVE'
            ? 'ACTIVE'
            : 'INACTIVE'
          : 'ACTIVE';

      await updateMachineMutation.mutateAsync({
        codeSettingIdx: selectedCode.codeSettingIdx,
        code: data.code,
        name: data.name,
        inspectionTarget: data.inspectionTarget,
        protectiveDevices: protectiveDevicesArray,
        inspectionCycle: data.inspectionCycle,
        riskTypes: riskTypesArray,
        status: statusValue,
      });
      setEditModalOpen(false);
      setSelectedCode(null);
    } catch (error) {
      console.error('기계·설비 수정 실패:', error);
    }
  };

  const handleSaveEditHazard = async (data: HazardEditFormData) => {
    if (!selectedCode || !selectedCode.codeSettingIdx) return;

    try {
      const statusValue =
        typeof data.status === 'string'
          ? data.status.toUpperCase() === 'ACTIVE'
            ? 'ACTIVE'
            : 'INACTIVE'
          : 'ACTIVE';

      await updateHazardMutation.mutateAsync({
        codeSettingIdx: selectedCode.codeSettingIdx,
        code: data.code,
        name: data.name,
        hazardCategoryIdx: data.hazardCategoryIdx,
        formAndType: data.formAndType,
        location: data.location,
        exposureRisk: data.exposureRisk,
        managementStandard: data.managementStandard,
        managementMeasure: data.managementMeasures,
        status: statusValue,
      });
      setEditModalOpen(false);
      setSelectedCode(null);
    } catch (error) {
      console.error('유해인자 수정 실패:', error);
    }
  };

  const handleSaveHazard = async (data: HazardFormData) => {
    try {
      await createHazardMutation.mutateAsync({
        code: data.code,
        name: data.name,
        hazardCategoryIdx: data.hazardCategoryIdx,
        formAndType: data.formAndType || undefined,
        location: data.location || undefined,
        exposureRisk: data.exposureRisk || undefined,
        managementStandard: data.managementStandard || undefined,
        managementMeasure: data.managementMeasures || undefined,
      });
      setCreateHazardModalOpen(false);
    } catch (error) {
      console.error('유해인자 등록 실패:', error);
    }
  };

  return (
    <DashboardContent maxWidth="xl">
      <Typography variant="h4">{title}</Typography>
      {description && <Typography sx={{ mt: 1 }}>{description}</Typography>}

      <CodeSettingBreadcrumbs
        items={[
          { label: '대시보드', href: '/admin/dashboard' },
          { label: '설정 및 관리', href: '/admin/dashboard' },
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
      />
    </DashboardContent>
  );
}
