import { useMemo } from 'react';
import type { Theme, SxProps } from '@mui/material/styles';
import { useLocation } from 'react-router';
import dayjs from 'dayjs';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';

import { DashboardContent } from 'src/layouts/dashboard';
import Risk_2200Filters from 'src/sections/PDF/Risk_2200/components/Filters';
import Risk_2200Table, { type Risk_2200Row } from 'src/sections/PDF/Risk_2200/components/Table';
import Risk_2200Pagination from 'src/sections/PDF/Risk_2200/components/Pagination';
import { useRisk_2200 } from 'src/sections/PDF/Risk_2200/hooks/use-risk-2200';
import Risk_2200Breadcrumbs from 'src/sections/PDF/Risk_2200/components/Breadcrumbs';
import { paths } from 'src/routes/paths';

// ----------------------------------------------------------------------

type Props = {
  title?: string;
  sx?: SxProps<Theme>;
};

const DUMMY_ROWS: Risk_2200Row[] = [
  {
    id: '1010-1',
    sequence: 1010,
    registeredAt: '2025-09-30',
    registeredTime: '16:45:25',
    organizationName: '이편한자동화기술',
    documentName: '1-1. 위험요인 파악',
    writtenAt: '2025-09-30',
    approvalDeadline: '2025-09-30',
    approvalProgress: 100,
    status: 'COMPLETED',
    published: true,
    safetySystemDocumentIdx: 1010,
    safetySystemItemIdx: 1,
    isPublished: 1,
    createAt: '2025-09-30T16:45:25',
    updateAt: '2025-09-30T16:45:25',
    publishedAt: '2025-09-30T16:45:25',
    signatureList: [],
    workerSignatureList: [],
  },
  {
    id: '1010-2',
    sequence: 1010,
    registeredAt: '2025-09-30',
    registeredTime: '16:45:25',
    organizationName: '이편한자동화기술',
    documentName: '1-1. 위험요인 파악',
    writtenAt: '2025-09-30',
    approvalDeadline: '2025-09-30',
    approvalProgress: 0,
    status: 'PENDING',
    published: false,
    safetySystemDocumentIdx: 1011,
    safetySystemItemIdx: 1,
    isPublished: 0,
    createAt: '2025-09-30T16:45:25',
    updateAt: '2025-09-30T16:45:25',
    publishedAt: null,
    signatureList: [],
    workerSignatureList: [],
  },
];

export function DocumentStatusDetailView({ title = '문서 작성 현황', sx }: Props) {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialCode = queryParams.get('code') || '';

  const rows = useMemo(() => {
    if (!initialCode) return DUMMY_ROWS;
    // In real app, filter DUMMY_ROWS or fetch from API
    return DUMMY_ROWS;
  }, [initialCode]);

  const logic = useRisk_2200(rows);

  const breadcrumbItems = [{ label: '대시보드', href: paths.dashboard.root }, { label: title }];

  return (
    <DashboardContent maxWidth="xl">
      <Typography variant="h4" sx={{ mb: 1 }}>
        {' '}
        {title}{' '}
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
            dateFilterType={logic.dateFilterType}
            startDate={logic.startDate ? dayjs(logic.startDate) : null}
            endDate={logic.endDate ? dayjs(logic.endDate) : null}
            searchValue={logic.searchValue}
            onChangeDateFilterType={logic.onChangeDateFilterType}
            onChangeStartDate={logic.onChangeStartDate}
            onChangeEndDate={logic.onChangeEndDate}
            onChangeSearchValue={logic.onChangeSearchValue}
          />

          <Risk_2200Table
            rows={logic.filtered}
            selectedIds={logic.selectedIds}
            onSelectAll={logic.onSelectAll}
            onSelectRow={logic.onSelectRow}
          />

          <Divider sx={{ borderStyle: 'dashed' }} />

          <Risk_2200Pagination
            count={logic.total}
            page={logic.page}
            rowsPerPage={logic.rowsPerPage}
            onChangePage={logic.onChangePage}
            onChangeRowsPerPage={logic.onChangeRowsPerPage}
          />
        </Box>
      </Box>
    </DashboardContent>
  );
}
