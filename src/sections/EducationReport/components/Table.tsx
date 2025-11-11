import { useState } from 'react';

import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Checkbox from '@mui/material/Checkbox';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';

import type { EducationReport } from 'src/_mock/_education-report';
import { Iconify } from 'src/components/iconify';

type Props = {
  rows: EducationReport[];
  selectedIds: string[];
  onSelectAll: (checked: boolean) => void;
  onSelectRow: (id: string, checked: boolean) => void;
  onViewDetail?: (row: EducationReport) => void;
};

export default function EducationReportTable({
  rows,
  selectedIds,
  onSelectAll,
  onSelectRow,
  onViewDetail,
}: Props) {
  const allSelected = rows.length > 0 && selectedIds.length === rows.length;
  const someSelected = selectedIds.length > 0 && selectedIds.length < rows.length;

  return (
    <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
      <Table size="small" stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell padding="checkbox" sx={{ bgcolor: 'grey.100', width: 60 }}>
              <Checkbox
                checked={allSelected}
                indeterminate={someSelected}
                onChange={(e) => onSelectAll(e.target.checked)}
              />
            </TableCell>
            <TableCell sx={{ bgcolor: 'grey.100', minWidth: 144 }}>조직명</TableCell>
            <TableCell sx={{ bgcolor: 'grey.100', minWidth: 128 }}>이름/직급</TableCell>
            <TableCell sx={{ bgcolor: 'grey.100', minWidth: 148 }}>소속</TableCell>
            <TableCell sx={{ bgcolor: 'grey.100', minWidth: 248 }}>역할</TableCell>
            <TableCell align="center" sx={{ bgcolor: 'grey.100', minWidth: 100 }}>
              의무교육(분)
            </TableCell>
            <TableCell align="center" sx={{ bgcolor: 'grey.100', minWidth: 100 }}>
              정기교육(분)
            </TableCell>
            <TableCell align="center" sx={{ bgcolor: 'grey.100', minWidth: 100 }}>
              총 이수(분)
            </TableCell>
            <TableCell align="center" sx={{ bgcolor: 'grey.100', minWidth: 100 }}>
              이수 기준(분)
            </TableCell>
            <TableCell align="center" sx={{ bgcolor: 'grey.100', minWidth: 99 }}>
              이수율
            </TableCell>
            <TableCell align="center" sx={{ bgcolor: 'grey.100', minWidth: 93 }}>
              상세보기
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {rows.map((row) => {
            const isSelected = selectedIds.includes(row.id);
            return (
              <TableRow key={row.id} hover>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={isSelected}
                    onChange={(e) => onSelectRow(row.id, e.target.checked)}
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{row.organizationName}</Typography>
                </TableCell>
                <TableCell>
                  <Stack spacing={0.5}>
                    <Typography variant="body2">{row.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {row.position}
                    </Typography>
                  </Stack>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{row.department}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{row.role}</Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography variant="body2">{row.mandatoryEducation}</Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography variant="body2">{row.regularEducation}</Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography variant="body2">{row.totalEducation}</Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography variant="body2">{row.standardEducation}</Typography>
                </TableCell>
                <TableCell align="center">
                  <CompletionRateProgress value={row.completionRate} />
                </TableCell>
                <TableCell align="center">
                  <IconButton
                    size="small"
                    onClick={() => onViewDetail?.(row)}
                    sx={{
                      bgcolor: 'grey.200',
                      '&:hover': {
                        bgcolor: 'grey.300',
                      },
                    }}
                  >
                    <Iconify icon="solar:eye-bold" width={20} />
                  </IconButton>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

// ----------------------------------------------------------------------

type CompletionRateProgressProps = {
  value: number; // 0-100
};

function CompletionRateProgress({ value }: CompletionRateProgressProps) {
  const size = 34;
  const thickness = 4;
  const normalizedValue = Math.min(Math.max(value, 0), 100);

  return (
    <Box
      sx={{
        position: 'relative',
        display: 'inline-flex',
        width: 50,
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <CircularProgress
        variant="determinate"
        value={normalizedValue}
        size={size}
        thickness={thickness}
        sx={{
          color: 'warning.main',
          position: 'absolute',
        }}
      />
      <Typography
        variant="caption"
        sx={{
          fontSize: 10,
          fontWeight: 500,
          color: 'text.secondary',
        }}
      >
        {normalizedValue}%
      </Typography>
    </Box>
  );
}
