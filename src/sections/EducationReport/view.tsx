import { useState, useMemo } from 'react';

import type { Theme, SxProps } from '@mui/material/styles';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';

import { DashboardContent } from 'src/layouts/dashboard';
import EducationReportBreadcrumbs from './components/Breadcrumbs';
import EducationReportFilters from './components/Filters';
import EducationReportTable from './components/Table';
import EducationReportPagination from './components/Pagination';
import AddEducationModal from './components/AddEducationModal';
import EducationDetailModal from './components/EducationDetailModal';
import { useEducationReport } from './hooks/use-education-report';
import { useEducationReports } from './hooks/use-education-report-api';
import type { EducationReport } from 'src/services/education-report/education-report.types';

// ----------------------------------------------------------------------

type Props = {
  title?: string;
  description?: string;
  sx?: SxProps<Theme>;
};

export function EducationReportView({ title = '교육 이수 현황', description, sx }: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedMemberIdx, setSelectedMemberIdx] = useState<number | null>(null);
  const [selectedEducationReportIdx, setSelectedEducationReportIdx] = useState<number | null>(null);
  const [selectedEducationReportIdxes, setSelectedEducationReportIdxes] = useState<number[] | null>(
    null
  );

  // 필터 및 페이지네이션 상태
  const [filters, setFilters] = useState({
    role: 'all',
    searchFilter: 'all',
    searchValue: '',
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // API 파라미터 구성
  // role 필터를 클라이언트에서 처리하므로 모든 데이터를 가져와야 함
  const queryParams = useMemo(() => {
    const params: any = {
      page: 1, // 클라이언트 페이지네이션을 위해 항상 1페이지부터
      pageSize: 1000, // 충분히 큰 값으로 모든 데이터 가져오기
    };

    // 검색어가 있으면 search 파라미터로 전달
    if (filters.searchValue) {
      params.search = filters.searchValue;
    }

    // role 필터는 클라이언트에서 처리 (API에 전달하지 않음)
    // 필요시 서버에서도 필터링하도록 추가 가능

    return params;
  }, [filters.searchValue]);

  // 교육 이수 현황 목록 조회
  const { data, isLoading, isError } = useEducationReports(queryParams);

  // EducationDetailModal에서 직접 API 호출하므로 여기서는 제거

  // API 응답에서 데이터 추출
  const reports: EducationReport[] = useMemo(() => {
    if (!data?.body?.educationReports) return [];
    return data.body.educationReports;
  }, [data]);

  // 클라이언트 필터링 (role 필터)
  const filteredReports = useMemo(() => {
    if (filters.role === 'all') return reports;
    return reports.filter((r) => r.role === filters.role);
  }, [reports, filters.role]);

  // 필터링된 전체 개수
  const filteredTotalCount = filteredReports.length;

  // 페이지네이션 적용 (클라이언트에서 처리)
  const paginatedReports = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredReports.slice(start, start + rowsPerPage);
  }, [filteredReports, page, rowsPerPage]);

  const logic = useEducationReport(paginatedReports);

  const renderContent = () => (
    <Box
      sx={{
        bgcolor: 'background.paper',
        borderRadius: 2,
        boxShadow: 3,
        width: '100%',
        overflow: 'hidden',
      }}
    >
      <EducationReportFilters
        role={filters.role}
        onChangeRole={(role) => {
          setFilters((prev) => ({ ...prev, role }));
          setPage(0);
        }}
        searchFilter={filters.searchFilter}
        onChangeSearchFilter={(filter) => {
          setFilters((prev) => ({ ...prev, searchFilter: filter }));
          setPage(0);
        }}
        searchValue={filters.searchValue}
        onChangeSearchValue={(value) => {
          setFilters((prev) => ({ ...prev, searchValue: value }));
          setPage(0);
        }}
      />

      {isLoading ? (
        <Stack alignItems="center" justifyContent="center" sx={{ py: 8 }}>
          <CircularProgress />
        </Stack>
      ) : isError ? (
        <Alert severity="error" sx={{ m: 2 }}>
          교육 이수 현황을 불러오는 중 오류가 발생했습니다.
        </Alert>
      ) : paginatedReports.length === 0 ? (
        <Alert severity="info" sx={{ m: 2 }}>
          조회된 교육 이수 현황이 없습니다. 조건을 변경해보세요.
        </Alert>
      ) : (
        <EducationReportTable
          rows={paginatedReports}
          selectedIds={logic.selectedIds}
          onSelectAll={logic.onSelectAll}
          onSelectRow={logic.onSelectRow}
          onViewDetail={(row) => {
            // educationReportIdx를 사용하여 상세 정보 조회
            const reportIdx =
              row.educationReportId || row.id ? Number(row.educationReportId || row.id) : null;
            if (reportIdx) {
              setSelectedMemberIdx(row.memberIdx || null);
              setSelectedEducationReportIdx(reportIdx);
              setDetailModalOpen(true);
            } else {
              console.error('❌ [EducationReportView] educationReportIdx를 찾을 수 없습니다:', row);
            }
          }}
        />
      )}

      <EducationReportPagination
        count={filteredTotalCount}
        page={page}
        rowsPerPage={rowsPerPage}
        onChangePage={(newPage) => {
          setPage(newPage);
        }}
        onChangeRowsPerPage={(newRowsPerPage) => {
          setRowsPerPage(newRowsPerPage);
          setPage(0);
        }}
        onCreate={() => {
          // 체크박스로 선택된 멤버들 확인
          if (logic.selectedIds.length === 0) {
            alert('교육 기록을 추가하려면 먼저 멤버를 선택해주세요.');
            return;
          }

          // 선택된 모든 멤버의 educationReportIdx 찾기
          const selectedReportIdxes: number[] = [];
          let firstMemberIdx: number | null = null;

          logic.selectedIds.forEach((selectedId) => {
            const selectedReport = reports.find(
              (r) => String(r.id || r.educationReportId || r.memberIdx || '') === selectedId
            );

            if (selectedReport) {
              const reportIdx =
                selectedReport.educationReportId || selectedReport.id
                  ? Number(selectedReport.educationReportId || selectedReport.id)
                  : null;
              if (reportIdx) {
                selectedReportIdxes.push(reportIdx);
                if (!firstMemberIdx) {
                  firstMemberIdx = selectedReport.memberIdx || null;
                }
              }
            }
          });

          if (selectedReportIdxes.length === 0) {
            console.warn(
              '❌ [EducationReportView] 선택된 멤버의 educationReportIdx를 찾을 수 없습니다.'
            );
            return;
          }

          // 여러 멤버가 선택된 경우 educationReportIdxes 사용, 단일 멤버인 경우 educationReportIdx 사용
          setSelectedMemberIdx(firstMemberIdx);
          if (selectedReportIdxes.length === 1) {
            setSelectedEducationReportIdx(selectedReportIdxes[0]);
          } else {
            setSelectedEducationReportIdx(null); // 여러 멤버인 경우 null로 설정
          }
          setSelectedEducationReportIdxes(
            selectedReportIdxes.length > 1 ? selectedReportIdxes : null
          );
          setModalOpen(true);
        }}
      />
    </Box>
  );

  return (
    <DashboardContent maxWidth="xl">
      <Typography variant="h4"> {title} </Typography>
      {description && <Typography sx={{ mt: 1 }}> {description} </Typography>}

      <EducationReportBreadcrumbs
        items={[
          { label: '대시보드', href: '/admin/dashboard' },
          { label: '현장 운영 관리', href: '/admin/dashboard/operation' },
          { label: title },
        ]}
      />

      <Box sx={[(theme) => ({ mt: 2, width: 1 }), ...(Array.isArray(sx) ? sx : [sx])]}>
        {renderContent()}
      </Box>

      <AddEducationModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedEducationReportIdx(null);
          setSelectedEducationReportIdxes(null);
        }}
        memberIdx={selectedMemberIdx || undefined}
        educationReportIdx={selectedEducationReportIdx || undefined}
        educationReportIdxes={selectedEducationReportIdxes || undefined}
        onSave={(formData) => {
          // API 연동은 AddEducationModal 내부에서 처리
          if (import.meta.env.DEV) {
            console.log('✅ [EducationReportView] 교육 기록 저장 완료', {
              formData,
              count: selectedEducationReportIdxes?.length || 1,
            });
          }
        }}
      />

      <EducationDetailModal
        open={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false);
          setSelectedMemberIdx(null);
          setSelectedEducationReportIdx(null);
        }}
        educationReportIdx={selectedEducationReportIdx}
      />
    </DashboardContent>
  );
}
