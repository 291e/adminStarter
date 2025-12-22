import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';

import { Iconify } from 'src/components/iconify';

import type { DocumentSettingItem } from '../hooks/use-document-setting';

type Props = {
  rows: DocumentSettingItem[];
  onViewGuide?: (row: DocumentSettingItem) => void;
  onViewSample?: (row: DocumentSettingItem) => void;
  onEdit?: (row: DocumentSettingItem) => void;
};

export default function DocumentSettingTable({ rows, onViewGuide, onViewSample, onEdit }: Props) {
  return (
    <TableContainer
      component={Paper}
      sx={{ overflowX: 'auto', borderTopLeftRadius: 0, borderTopRightRadius: 0, minHeight: 600 }}
    >
      <Table size="small" stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell align="center" sx={{ bgcolor: 'grey.100', minWidth: 68 }}>
              순번
            </TableCell>
            <TableCell sx={{ bgcolor: 'grey.100', minWidth: 120 }}>등록일</TableCell>
            <TableCell sx={{ bgcolor: 'grey.100', minWidth: 480 }}>문서명</TableCell>
            <TableCell align="center" sx={{ bgcolor: 'grey.100', minWidth: 100 }}>
              작성주기
            </TableCell>
            <TableCell align="center" sx={{ bgcolor: 'grey.100', minWidth: 100 }}>
              가이드
            </TableCell>
            <TableCell align="center" sx={{ bgcolor: 'grey.100', minWidth: 100 }}>
              샘플
            </TableCell>
            <TableCell align="center" sx={{ bgcolor: 'grey.100', minWidth: 84 }}>
              상태
            </TableCell>
            <TableCell align="center" sx={{ bgcolor: 'grey.100', minWidth: 76 }}>
              &nbsp;
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id} hover>
              <TableCell align="center">
                <Typography variant="body2">{row.order}</Typography>
              </TableCell>

              <TableCell>
                <Stack spacing={0.25}>
                  <Typography variant="body2" sx={{ color: 'text.primary' }}>
                    {row.createdDate}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: 14 }}>
                    {row.createdTime}
                  </Typography>
                </Stack>
              </TableCell>

              <TableCell>
                <Typography variant="body2">{row.name}</Typography>
              </TableCell>

              <TableCell align="center">
                <Typography variant="body2">{row.period || '-'}</Typography>
              </TableCell>

              <TableCell align="center">
                <IconButton
                  size="small"
                  onClick={() => onViewGuide?.(row)}
                  disabled={!row.hasGuide}
                  sx={{
                    color: row.hasGuide ? 'text.secondary' : 'text.disabled',
                    '&:hover': {
                      bgcolor: row.hasGuide ? 'action.hover' : 'transparent',
                    },
                  }}
                >
                  <Iconify
                    icon={row.hasGuide ? 'solar:eye-bold' : 'solar:close-circle-bold'}
                    width={20}
                  />
                </IconButton>
              </TableCell>

              <TableCell align="center">
                <IconButton
                  size="small"
                  onClick={() => onViewSample?.(row)}
                  disabled={!row.hasSample}
                  sx={{
                    color: row.hasSample ? 'text.secondary' : 'text.disabled',
                    '&:hover': {
                      bgcolor: row.hasSample ? 'action.hover' : 'transparent',
                    },
                  }}
                >
                  <Iconify
                    icon={row.hasSample ? 'solar:eye-bold' : 'solar:close-circle-bold'}
                    width={20}
                  />
                </IconButton>
              </TableCell>

              <TableCell align="center">
                {row.isActive ? (
                  <Chip label="활성" size="small" color="success" variant="soft" />
                ) : (
                  <Chip label="비활성" size="small" sx={{ bgcolor: 'grey.300' }} />
                )}
              </TableCell>

              <TableCell align="center">
                <IconButton
                  size="small"
                  onClick={() => onEdit?.(row)}
                  sx={{
                    color: 'text.secondary',
                    '&:hover': {
                      bgcolor: 'action.hover',
                    },
                  }}
                >
                  <Iconify icon="solar:pen-bold" width={20} />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
