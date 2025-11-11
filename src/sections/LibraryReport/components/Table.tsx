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

import type { LibraryReport } from 'src/_mock/_library-report';
import { Iconify } from 'src/components/iconify';
import Badge from 'src/components/safeyoui/badge';

type Props = {
  rows: LibraryReport[];
  selectedIds: string[];
  onSelectAll: (checked: boolean) => void;
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
            <TableCell sx={{ bgcolor: 'grey.100', minWidth: 80 }}>순번</TableCell>
            <TableCell sx={{ bgcolor: 'grey.100', minWidth: 180 }}>등록일</TableCell>
            <TableCell sx={{ bgcolor: 'grey.100', minWidth: 120 }}>조직명</TableCell>
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
          {rows.map((row) => {
            const isSelected = selectedIds.includes(row.id);
            return (
              <TableRow key={row.id} hover>
                <TableCell>
                  <Typography variant="body2">{row.order}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{row.registrationDate}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{row.organizationName}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{row.category}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{row.title}</Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography variant="body2">{row.playbackTime}</Typography>
                </TableCell>
                <TableCell align="center">
                  {row.hasSubtitles ? (
                    <Iconify
                      icon="solar:check-circle-bold"
                      width={24}
                      sx={{ color: 'info.main' }}
                    />
                  ) : (
                    <Box sx={{ width: 24, height: 24 }} />
                  )}
                </TableCell>
                <TableCell align="center">
                  <Badge
                    label={row.status === 'active' ? '활성' : '비활성'}
                    variant={row.status === 'active' ? 'active' : 'inactive'}
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
