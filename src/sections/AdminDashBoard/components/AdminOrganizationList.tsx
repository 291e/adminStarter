import type { Organization } from 'src/services/organization/organization.types';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import CardHeader from '@mui/material/CardHeader';
import TableContainer from '@mui/material/TableContainer';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';

import Stack from '@mui/material/Stack';

import { Label } from 'src/components/label';
import { Scrollbar } from 'src/components/scrollbar';
import { Iconify } from 'src/components/iconify';
import { fNumber } from 'src/utils/format-number';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Tooltip from '@mui/material/Tooltip';

// ----------------------------------------------------------------------

type Props = {
  title?: string;
  subheader?: string;
  tableData: Organization[];
  tableLabels: { id: string; label: string; align?: 'left' | 'center' | 'right' }[];
};

export default function AdminOrganizationList({
  title,
  subheader,
  tableData,
  tableLabels,
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

        <TextField
          placeholder="조직명을 검색해 주세요."
          size="small"
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
                <AdminOrganizationTableRow key={row.companyIdx} row={row} />
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

      <Box
        sx={{
          p: 2,
          display: 'flex',
          justifyContent: 'flex-end',
          borderTop: 'dashed 1px',
          borderColor: 'divider',
        }}
      >
        <Stack direction="row" alignItems="center" spacing={2}>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            표시행 수
          </Typography>
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
              5
            </Typography>
            <Iconify icon={'eva:chevron-down-fill' as any} width={16} />
          </Stack>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            1-10 of 2
          </Typography>
          <Stack direction="row" spacing={1}>
            <Iconify
              icon={'eva:chevron-left-fill' as any}
              width={18}
              sx={{ color: 'text.disabled' }}
            />
            <Iconify icon={'eva:chevron-right-fill' as any} width={18} />
          </Stack>
        </Stack>
      </Box>
    </Card>
  );
}

// ----------------------------------------------------------------------

type RowProps = {
  row: Organization;
};

function AdminOrganizationTableRow({ row }: RowProps) {
  // Dummy data for missing fields
  const totalMembers = 120;
  const subscription = (row as any).subscriptionType || '안전해YOU 스타터';
  const revenue = 56315000;
  const lastPaymentAt = '2025-09-30T16:45:35';

  // Education breakdown (dummy)
  const eduTotal = 50;
  const eduNotStarted = 15;
  const eduInProgress = 20;
  const eduCompleted = 15;

  return (
    <TableRow hover>
      <TableCell sx={{ fontWeight: 'fontWeightMedium' }}>{row.companyName}</TableCell>

      <TableCell align="center">{row.representativeName || '-'}</TableCell>

      <TableCell align="center">{totalMembers}</TableCell>

      <TableCell align="center" sx={{ minWidth: 200 }}>
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
              <Box sx={{ width: `${(eduNotStarted / eduTotal) * 100}%`, bgcolor: 'error.main' }} />
              <Box
                sx={{ width: `${(eduInProgress / eduTotal) * 100}%`, bgcolor: 'warning.main' }}
              />
              <Box sx={{ width: `${(eduCompleted / eduTotal) * 100}%`, bgcolor: 'success.main' }} />
            </Box>
          </Tooltip>
          <Typography
            variant="caption"
            sx={{ color: 'text.disabled', width: 160, textAlign: 'right' }}
          >
            총 {eduTotal}명
          </Typography>
        </Stack>
      </TableCell>

      <TableCell align="center">
        {(() => {
          const accidentStatus = row.accidentFreeStatus || 'APPROVED'; // Dummy status for demo
          const accidentLabel = '2024년 무재해 사업장';

          if (!row.isAccidentFreeWorksite && accidentStatus === 'none') {
            return <Typography variant="body2">-</Typography>;
          }

          if (accidentStatus === 'APPROVED') {
            return (
              <Chip
                color="info"
                variant="outlined"
                size="small"
                label={accidentLabel}
                sx={{ fontWeight: 600, pointerEvents: 'none' }}
              />
            );
          }

          if (accidentStatus === 'PENDING') {
            return (
              <Button
                variant="outlined"
                color="inherit"
                size="small"
                endIcon={<Iconify icon={'eva:arrow-forward-fill' as any} width={16} />}
                sx={{
                  height: 24,
                  minHeight: 24,
                  px: 0.75,
                  py: 0,
                  fontSize: 12,
                  fontWeight: 700,
                  lineHeight: '20px',
                  borderRadius: 0.75,
                  borderWidth: 1,
                  borderColor: 'grey.900',
                  color: 'grey.900',
                  textTransform: 'none',
                  '&:hover': {
                    borderColor: 'grey.800',
                    bgcolor: 'action.hover',
                  },
                }}
              >
                검토 대기
              </Button>
            );
          }

          return <Typography variant="body2">-</Typography>;
        })()}
      </TableCell>

      <TableCell align="center">
        <Label
          variant="soft"
          color={row.status === 'active' ? 'success' : 'default'}
          sx={{ textTransform: 'none', borderRadius: 0.75 }}
        >
          {row.status === 'active' ? '활성' : '비활성'}
        </Label>
      </TableCell>

      <TableCell>
        <Typography variant="body2" sx={{ whiteSpace: 'nowrap' }}>
          {subscription}
        </Typography>
      </TableCell>

      <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
        {fNumber(revenue)}원
      </TableCell>

      <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
        <Typography variant="body2">{new Date(lastPaymentAt).toLocaleDateString()}</Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
          {new Date(lastPaymentAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
          })}
        </Typography>
      </TableCell>
    </TableRow>
  );
}
