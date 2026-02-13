import type { AdminDashboardMemberCompany } from 'src/services/admin-dashboard/admin-dashboard.types';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import CardHeader from '@mui/material/CardHeader';
import TableContainer from '@mui/material/TableContainer';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Tooltip from '@mui/material/Tooltip';
import TablePagination from '@mui/material/TablePagination';
import Chip from '@mui/material/Chip';

import { Scrollbar } from 'src/components/scrollbar';
import { Iconify } from 'src/components/iconify';
import { fNumber } from 'src/utils/format-number';

// ----------------------------------------------------------------------

type Props = {
  title?: string;
  subheader?: string;
  tableData: AdminDashboardMemberCompany[];
  tableLabels: { id: string; label: string; align?: 'left' | 'center' | 'right' }[];
  totalCount: number;
  page: number;
  pageSize: number;
  search: string;
  isActive?: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onSearchChange: (search: string) => void;
  onIsActiveChange: (isActive?: number) => void;
  onEducationStatusClick?: (companyIdx: number) => void;
  onViewAll?: () => void;
};

export default function AdminOrganizationList({
  title,
  subheader,
  tableData,
  tableLabels,
  totalCount,
  page,
  pageSize,
  search,
  isActive,
  onPageChange,
  onPageSizeChange,
  onSearchChange,
  onIsActiveChange,
  onEducationStatusClick,
  onViewAll,
  ...other
}: Props) {
  return (
    <Card {...other}>
      <CardHeader
        title={title}
        subheader={subheader}
        action={
          <Button
            size="small"
            color="inherit"
            endIcon={<Iconify icon="eva:arrow-ios-forward-fill" width={18} />}
            onClick={onViewAll}
            sx={{
              bgcolor: 'grey.100',
              borderRadius: 1,
              px: 1.5,
              '&:hover': { bgcolor: 'grey.200' },
            }}
          >
            전체 보기
          </Button>
        }
        sx={{ mb: 2 }}
      />

      <Stack
        direction={{ xs: 'column', md: 'row' }}
        alignItems={{ md: 'center' }}
        justifyContent="space-between"
        sx={{ px: 3, py: 2, gap: 2 }}
      >
        <Stack direction="row" alignItems="center" spacing={2.5}>
          <Typography variant="subtitle2" sx={{ color: 'text.secondary', mr: 1 }}>
            교육 이수 현황 상태값
          </Typography>
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'error.main' }} />
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              미진행
            </Typography>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'warning.main' }} />
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              진행 중
            </Typography>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'success.main' }} />
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              교육 충족
            </Typography>
          </Stack>
        </Stack>

        <Stack direction="row" spacing={1} sx={{ width: { xs: 1, md: 'auto' } }}>
          <Select
            size="small"
            value={typeof isActive === 'number' ? String(isActive) : 'all'}
            onChange={(event) => {
              const value = event.target.value;
              if (value === '1') {
                onIsActiveChange(1);
                onPageChange(1);
                return;
              }
              if (value === '0') {
                onIsActiveChange(0);
                onPageChange(1);
                return;
              }
              onIsActiveChange(undefined);
              onPageChange(1);
            }}
            sx={{ minWidth: 100 }}
          >
            <MenuItem value="all">전체</MenuItem>
            <MenuItem value="1">활성</MenuItem>
            <MenuItem value="0">비활성</MenuItem>
          </Select>

          <TextField
            placeholder="조직명을 검색해 주세요."
            size="small"
            value={search}
            onChange={(event) => {
              onSearchChange(event.target.value);
              onPageChange(1);
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                </InputAdornment>
              ),
            }}
            sx={{ width: { xs: 1, md: 320 } }}
          />
        </Stack>
      </Stack>

      <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
        <Scrollbar>
          <Table sx={{ minWidth: 1200 }}>
            <TableHead>
              <TableRow sx={{ bgcolor: 'background.neutral' }}>
                {tableLabels.map((headCell) => (
                  <TableCell
                    key={headCell.id}
                    align={headCell.align || 'left'}
                    sx={{ color: 'text.secondary', fontWeight: 'fontWeightSemiBold' }}
                  >
                    {headCell.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {tableData.map((row) => (
                <AdminOrganizationTableRow
                  key={row.companyIdx}
                  row={row}
                  onEducationStatusClick={onEducationStatusClick}
                />
              ))}

              {tableData.length === 0 && (
                <TableRow>
                  <TableCell align="center" colSpan={tableLabels.length} sx={{ py: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                      데이터가 없습니다.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Scrollbar>
      </TableContainer>

      <Box sx={{ borderTop: 'dashed 1px', borderColor: 'divider' }}>
        <TablePagination
          component="div"
          count={totalCount}
          page={Math.max(page - 1, 0)}
          rowsPerPage={pageSize}
          onPageChange={(_, nextPage) => onPageChange(nextPage + 1)}
          onRowsPerPageChange={(event) => {
            onPageSizeChange(parseInt(event.target.value, 10));
            onPageChange(1);
          }}
          rowsPerPageOptions={[10, 20, 30]}
          labelRowsPerPage="표시 행 수 :"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count}`}
        />
      </Box>
    </Card>
  );
}

// ----------------------------------------------------------------------

type RowProps = {
  row: AdminDashboardMemberCompany;
  onEducationStatusClick?: (companyIdx: number) => void;
};

function AdminOrganizationTableRow({ row, onEducationStatusClick }: RowProps) {
  const eduNotStarted = row.educationStatus?.notStarted ?? 0;
  const eduInProgress = row.educationStatus?.inProgress ?? 0;
  const eduCompleted = row.educationStatus?.completed ?? 0;
  const eduTotal = eduNotStarted + eduInProgress + eduCompleted;

  const notStartedRatio = eduTotal > 0 ? (eduNotStarted / eduTotal) * 100 : 0;
  const inProgressRatio = eduTotal > 0 ? (eduInProgress / eduTotal) * 100 : 0;
  const completedRatio = eduTotal > 0 ? (eduCompleted / eduTotal) * 100 : 0;

  const isAccidentFree = Number((row as any).isAccidentFreeWorksite) === 1;

  return (
    <TableRow hover>
      <TableCell sx={{ fontWeight: 'fontWeightMedium' }}>{row.companyName}</TableCell>

      <TableCell align="center">{row.representativeName || '-'}</TableCell>

      <TableCell align="center">{row.totalMembers}</TableCell>

      <TableCell
        align="center"
        sx={{ minWidth: 200, cursor: 'pointer' }}
        onClick={() => onEducationStatusClick?.(row.companyIdx)}
      >
        <Stack spacing={0.5} sx={{ alignItems: 'center' }}>
          <Tooltip
            title={
              <Stack spacing={0.5}>
                <Typography variant="caption">미진행 {eduNotStarted}명</Typography>
                <Typography variant="caption">진행 중 {eduInProgress}명</Typography>
                <Typography variant="caption">교육 충족 {eduCompleted}명</Typography>
              </Stack>
            }
            arrow
            placement="top"
          >
            <Box
              sx={{
                display: 'flex',
                height: 8,
                width: 160,
                borderRadius: 1,
                overflow: 'hidden',
                bgcolor: 'grey.100',
              }}
            >
              <Box sx={{ width: `${notStartedRatio}%`, bgcolor: 'error.main' }} />
              <Box sx={{ width: `${inProgressRatio}%`, bgcolor: 'warning.main' }} />
              <Box sx={{ width: `${completedRatio}%`, bgcolor: 'success.main' }} />
            </Box>
          </Tooltip>
          <Typography variant="caption" sx={{ color: 'text.disabled', width: 160, textAlign: 'right' }}>
            총 {eduTotal}명
          </Typography>
        </Stack>
      </TableCell>

      <TableCell align="center">
        {isAccidentFree ? (
          <Chip color="info" variant="outlined" size="small" label="무재해 사업장" sx={{ fontWeight: 600 }} />
        ) : (
          <Typography variant="body2">-</Typography>
        )}
      </TableCell>

      <TableCell align="center">
        <Chip
          size="small"
          variant="outlined"
          color={row.isActive === 1 ? 'success' : 'default'}
          label={row.isActive === 1 ? '활성' : '비활성'}
          sx={{ borderRadius: 0.75 }}
        />
      </TableCell>

      <TableCell>
        <Typography variant="body2" sx={{ whiteSpace: 'nowrap' }}>
          {row.hasActiveSubscription === 1 ? '활성 구독' : '-'}
        </Typography>
      </TableCell>

      <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
        {fNumber(row.totalSalesAmount || 0)}원
      </TableCell>

      <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
        {row.recentPaymentDate ? (
          <Typography variant="body2">{new Date(row.recentPaymentDate).toLocaleDateString()}</Typography>
        ) : (
          <Typography variant="body2">-</Typography>
        )}
      </TableCell>
    </TableRow>
  );
}
