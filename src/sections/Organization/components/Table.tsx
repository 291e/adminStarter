import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import type { OrganizationMember } from 'src/_mock/_organization';
import Chip from '@mui/material/Chip';
import { fDateTime } from 'src/utils/format-time';
import { Iconify } from 'src/components/iconify';

type Props = {
  rows: OrganizationMember[];
  onEdit?: (row: OrganizationMember) => void;
};

export default function OrganizationTable({ rows, onEdit }: Props) {
  return (
    <TableContainer component={Paper} sx={{ mt: 2, overflowX: 'auto' }}>
      <Table size="small" stickyHeader sx={{ minWidth: 1600 }}>
        <TableHead>
          <TableRow>
            <TableCell width={72}>순번</TableCell>
            <TableCell width={220}>등록일 / 접속일</TableCell>
            <TableCell width={200}>조직명</TableCell>
            <TableCell width={160}>이름</TableCell>
            <TableCell width={260}>전화번호 / 이메일</TableCell>
            <TableCell>주소</TableCell>
            <TableCell width={120} align="center">
              상태
            </TableCell>
            <TableCell width={60} align="right">
              {/* 액션바 여백 */}
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {rows.map((row, idx) => (
            <TableRow key={row.id} hover>
              <TableCell>{row.order}</TableCell>
              <TableCell>
                <Stack>
                  <Typography variant="body2">
                    {fDateTime(row.registeredAt, 'YYYY-MM-DD HH:mm:ss')}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {fDateTime(row.lastAccessedAt, 'YYYY-MM-DD HH:mm:ss')}
                  </Typography>
                </Stack>
              </TableCell>
              <TableCell>
                <Typography variant="subtitle2">{row.orgName}</Typography>
              </TableCell>
              <TableCell>{row.name}</TableCell>
              <TableCell>
                <Stack>
                  <Typography variant="body2">{row.phone}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {row.email}
                  </Typography>
                </Stack>
              </TableCell>
              <TableCell>
                <Typography variant="body2">{row.address}</Typography>
              </TableCell>
              <TableCell align="center">
                {row.status === 'active' ? (
                  <Chip label="활성" size="small" color="success" variant="soft" />
                ) : (
                  <Chip label="비활성" size="small" sx={{ bgcolor: 'grey.300' }} />
                )}
              </TableCell>
              <TableCell align="right">
                <IconButton size="small" onClick={() => onEdit?.(row)}>
                  <Iconify icon="solar:pen-bold" width={16} />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
