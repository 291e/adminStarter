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
import Stack from '@mui/material/Stack';

import type { LibraryReport } from 'src/services/library-report/library-report.types';
import { Iconify } from 'src/components/iconify';
import Badge from 'src/components/safeyoui/badge';
import { fDateTime } from 'src/utils/format-time';

type Props = {
  rows: LibraryReport[];
  selectedIds: string[];
  onSelectAll: (rows: LibraryReport[], checked: boolean) => void;
  onSelectRow: (id: string, checked: boolean) => void;
  onEdit?: (row: LibraryReport) => void;
};

export default function LibraryReportTable({
  rows,
  selectedIds,
  onSelectAll,
  onSelectRow,
  onEdit,
}: Props) {
  const allSelected = rows.length > 0 && selectedIds.length === rows.length;
  const someSelected = selectedIds.length > 0 && selectedIds.length < rows.length;

  return (
    <TableContainer
      component={Paper}
      sx={{ overflowX: 'auto', borderTopLeftRadius: 0, borderTopRightRadius: 0 }}
    >
      <Table size="small" stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell padding="checkbox" sx={{ bgcolor: 'grey.100', width: 56 }}>
              <Checkbox
                checked={allSelected}
                indeterminate={someSelected}
                onChange={(e) => onSelectAll(rows, e.target.checked)}
              />
            </TableCell>
            <TableCell sx={{ bgcolor: 'grey.100', minWidth: 80 }}>순번</TableCell>
            <TableCell sx={{ bgcolor: 'grey.100', minWidth: 180 }}>등록일</TableCell>
            <TableCell sx={{ bgcolor: 'grey.100', minWidth: 140 }}>조직명</TableCell>
            <TableCell sx={{ bgcolor: 'grey.100', minWidth: 160 }}>카테고리</TableCell>
            <TableCell sx={{ bgcolor: 'grey.100', minWidth: 444 }}>제목</TableCell>
            <TableCell align="center" sx={{ bgcolor: 'grey.100', minWidth: 100 }}>
              재생시간
            </TableCell>
            <TableCell align="center" sx={{ bgcolor: 'grey.100', minWidth: 68 }}>
              자막
            </TableCell>
            <TableCell align="center" sx={{ bgcolor: 'grey.100', minWidth: 100 }}>
              상태
            </TableCell>
            <TableCell align="center" sx={{ bgcolor: 'grey.100', minWidth: 68 }}>
              액션
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {rows.map((row, index) => {
            const rowId = row.id ?? String(row.libraryReportIdx ?? index);
            const isSelected = selectedIds.includes(rowId);
            const status = row.status ?? (row.isActive === 0 ? 'inactive' : 'active');
            const hasRegistrationDate = Boolean(row.registrationDate);
            const registrationDate = row.registrationDate || '';
            const displayOrg = row.organizationName || '-';
            // libraryReportCategoryInformation에서 카테고리 정보 가져오기
            const displayCategory = row.libraryReportCategoryInformation?.name || '-';
            const displayTitle = row.title || '-';
            const displayTime = row.playbackTime || '-';
            return (
              <TableRow key={rowId} hover selected={isSelected}>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={isSelected}
                    onChange={(e) => onSelectRow(rowId, e.target.checked)}
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{row.id}</Typography>
                </TableCell>
                <TableCell>
                  {hasRegistrationDate ? (
                    <Stack spacing={0.25}>
                      <Typography variant="body2" sx={{ color: 'text.primary' }}>
                        {fDateTime(registrationDate, 'YYYY-MM-DD')}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: 14 }}>
                        {fDateTime(registrationDate, 'HH:mm:ss')}
                      </Typography>
                    </Stack>
                  ) : (
                    <Typography variant="body2">-</Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{displayOrg}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{displayCategory}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{displayTitle}</Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography variant="body2">{displayTime}</Typography>
                </TableCell>
                <TableCell align="center">
                  {row.hasSubtitles ? (
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Iconify
                        icon="solar:check-circle-bold"
                        width={24}
                        sx={{ color: 'info.main' }}
                      />
                    </Box>
                  ) : (
                    <Box sx={{ width: 24, height: 24 }} />
                  )}
                </TableCell>
                <TableCell align="center">
                  <Badge
                    label={status === 'active' ? '활성' : '비활성'}
                    variant={status === 'active' ? 'active' : 'inactive'}
                  />
                </TableCell>
                <TableCell align="center">
                  <IconButton
                    size="small"
                    onClick={() => onEdit?.(row)}
                    sx={{
                      bgcolor: 'grey.200',
                      '&:hover': {
                        bgcolor: 'grey.300',
                      },
                    }}
                  >
                    <Iconify icon="solar:pen-bold" width={20} />
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
