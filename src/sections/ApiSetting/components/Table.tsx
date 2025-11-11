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

import type { ApiSetting } from 'src/_mock/_api-setting';
import { fDateTime } from 'src/utils/format-time';
import { Iconify } from 'src/components/iconify';

type Props = {
  rows: ApiSetting[];
  onEdit?: (row: ApiSetting) => void;
};

export default function ApiSettingTable({ rows, onEdit }: Props) {
  return (
    <TableContainer
      component={Paper}
      sx={{ overflowX: 'auto', borderTopLeftRadius: 0, borderTopRightRadius: 0 }}
    >
      <Table size="small" stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell sx={{ bgcolor: 'grey.100', minWidth: 68 }}>순번</TableCell>
            <TableCell sx={{ bgcolor: 'grey.100', minWidth: 120 }}>등록일</TableCell>
            <TableCell sx={{ bgcolor: 'grey.100', minWidth: 456 }}>API 이름</TableCell>
            <TableCell sx={{ bgcolor: 'grey.100', minWidth: 128 }}>제공기관</TableCell>
            <TableCell align="center" sx={{ bgcolor: 'grey.100', minWidth: 120 }}>
              Key 상태
            </TableCell>
            <TableCell sx={{ bgcolor: 'grey.100', minWidth: 132 }}>최근 연동</TableCell>
            <TableCell sx={{ bgcolor: 'grey.100', minWidth: 131 }}>만료일</TableCell>
            <TableCell align="center" sx={{ bgcolor: 'grey.100', minWidth: 97 }}>
              상태
            </TableCell>
            <TableCell align="center" sx={{ bgcolor: 'grey.100', minWidth: 68 }}>
              액션
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id} hover>
              <TableCell>
                <Typography variant="body2">{row.order}</Typography>
              </TableCell>
              <TableCell>
                <Stack spacing={0.25}>
                  <Typography variant="body2" sx={{ color: 'text.primary' }}>
                    {fDateTime(row.registrationDate, 'YYYY-MM-DD')}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: 14 }}>
                    {fDateTime(row.registrationDate, 'HH:mm:ss')}
                  </Typography>
                </Stack>
              </TableCell>
              <TableCell>
                <Typography variant="body2">{row.name}</Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">{row.provider}</Typography>
              </TableCell>
              <TableCell align="center">
                {row.keyStatus === 'normal' ? (
                  <Chip label="정상" size="small" color="info" variant="soft" />
                ) : (
                  <Chip
                    label="비정상"
                    size="small"
                    sx={{ bgcolor: 'error.lighter', color: 'error.main' }}
                  />
                )}
              </TableCell>
              <TableCell>
                <Typography variant="body2">
                  {fDateTime(row.lastInterlocked, 'YYYY-MM-DD')}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">
                  {fDateTime(row.expirationDate, 'YYYY-MM-DD')}
                </Typography>
              </TableCell>
              <TableCell align="center">
                {row.status === 'active' ? (
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
                  <Iconify icon="solar:settings-bold" width={20} />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
