import { useMemo, useState } from 'react';
import type { Theme, SxProps } from '@mui/material/styles';
import { useLocation } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';

import { DashboardContent } from 'src/layouts/dashboard';
import Risk_2200Filters from 'src/sections/PDF/Risk_2200/components/Filters';
import Risk_2200Table from 'src/sections/PDF/Risk_2200/components/Table';
import type { Risk_2200Row } from 'src/sections/PDF/Risk_2200/components/Table';
import Risk_2200Pagination from 'src/sections/PDF/Risk_2200/components/Pagination';
import Risk_2200Breadcrumbs from 'src/sections/PDF/Risk_2200/components/Breadcrumbs';
import { paths } from 'src/routes/paths';
import { getAdminDashboardDocumentStatusDetails } from 'src/services/admin-dashboard/admin-dashboard.service';
import type { DocumentStatusDetailRow } from 'src/services/admin-dashboard/admin-dashboard.types';

// ----------------------------------------------------------------------

type Props = {
  title?: string;
  sx?: SxProps<Theme>;
};

const formatDate = (value?: string) => (value ? dayjs(value).format('YYYY-MM-DD') : '');
const formatTime = (value?: string) => (value ? dayjs(value).format('HH:mm:ss') : '');

const toRiskRow = (row: DocumentStatusDetailRow): Risk_2200Row => {
  const registeredAt = formatDate(row.createAt);
  const writtenAt = formatDate(row.documentWrittenAt || row.updateAt);

  return {
    id: String(row.safetySystemDocumentIdx),
    sequence: row.safetySystemDocumentIdx,
    registeredAt,
    registeredTime: formatTime(row.createAt),
    organizationName: row.organizationName,
    documentName: row.documentName,
    writtenAt,
    approvalDeadline: row.approvalDeadline || '',
    approvalProgress: row.status === 'COMPLETED' ? 100 : 0,
    status: row.status as Risk_2200Row['status'],
    published: row.isPublished === 1,
    safetySystemDocumentIdx: row.safetySystemDocumentIdx,
    safetySystemItemIdx: 0,
    isPublished: row.isPublished,
    createAt: row.createAt,
    updateAt: row.updateAt,
    publishedAt: null,
    signatureList: [],
    workerSignatureList: [],
    approvalStep: row.approvalStep ?? null,
  };
};

export function DocumentStatusDetailView({ title = '문서 작성 현황', sx }: Props) {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const code = queryParams.get('code') || '';

  const [dateFilterType, setDateFilterType] = useState('written');
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState('');

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: [
      'adminDashboard',
      'documentStatusDetails',
      code,
      page,
      rowsPerPage,
      dateFilterType,
      startDate,
      endDate,
      searchValue,
    ],
    queryFn: () =>
      getAdminDashboardDocumentStatusDetails({
        code,
        page: page + 1,
        pageSize: rowsPerPage,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        search: searchValue.trim() || undefined,
      }),
    enabled: Boolean(code),
    staleTime: 30 * 1000,
  });

  const payload = (data as any)?.body?.data || (data as any)?.body || data;
  const rows = ((payload?.rows as DocumentStatusDetailRow[] | undefined) || []).map(toRiskRow);
  const total = payload?.totalCount ?? 0;

  const breadcrumbItems = useMemo(
    () => [{ label: '대시보드', href: paths.dashboard.root }, { label: title }],
    [title]
  );

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(rows.map((row) => row.id));
      return;
    }
    setSelectedIds([]);
  };

  const handleSelectRow = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  return (
    <DashboardContent maxWidth="xl">
      <Typography variant="h4" sx={{ mb: 1 }}>
        {title}
      </Typography>

      <Risk_2200Breadcrumbs items={breadcrumbItems} />

      <Box sx={[(theme) => ({ width: 1, mt: 3 }), ...(Array.isArray(sx) ? sx : [sx])]}>
        <Box
          sx={{
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: (theme) => theme.customShadows.z20,
            overflow: 'hidden',
          }}
        >
          <Risk_2200Filters
            dateFilterType={dateFilterType}
            startDate={startDate ? dayjs(startDate) : null}
            endDate={endDate ? dayjs(endDate) : null}
            searchValue={searchValue}
            onChangeDateFilterType={(value) => {
              setDateFilterType(value);
              setPage(0);
            }}
            onChangeStartDate={(value) => {
              setStartDate(value ? value.format('YYYY-MM-DD') : null);
              setPage(0);
            }}
            onChangeEndDate={(value) => {
              setEndDate(value ? value.format('YYYY-MM-DD') : null);
              setPage(0);
            }}
            onChangeSearchValue={(value) => {
              setSearchValue(value);
              setPage(0);
            }}
          />

          {(isLoading || isFetching) && (
            <Box sx={{ px: 2.5, pb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <CircularProgress size={16} />
              <Typography variant="caption" color="text.secondary">
                목록을 불러오는 중입니다.
              </Typography>
            </Box>
          )}

          <Risk_2200Table
            rows={rows}
            selectedIds={selectedIds}
            onSelectAll={handleSelectAll}
            onSelectRow={handleSelectRow}
          />

          <Divider sx={{ borderStyle: 'dashed' }} />

          <Risk_2200Pagination
            count={total}
            page={page}
            rowsPerPage={rowsPerPage}
            onChangePage={setPage}
            onChangeRowsPerPage={(value) => {
              setRowsPerPage(value);
              setPage(0);
            }}
          />
        </Box>
      </Box>
    </DashboardContent>
  );
}
