import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';

import type { OrganizationMember } from 'src/_mock/_organization';
import { fDateTime } from 'src/utils/format-time';

type Props = {
  rows: OrganizationMember[];
};

export default function OrganizationTableEdit({ rows }: Props) {
  return (
    <TableContainer component={Paper} sx={{ mt: 2, overflowX: 'auto' }}>
      <Table size="small" stickyHeader sx={{ minWidth: 1600 }}>
        <TableHead>
          <TableRow>
            <TableCell width={72}>순번</TableCell>
            <TableCell width={220}>등록일 / 접속일</TableCell>
            <TableCell width={260}>프로필 이미지, 이름 / 직급</TableCell>
            <TableCell width={160}>소속</TableCell>
            <TableCell width={260}>전화번호 / 이메일</TableCell>
            <TableCell width={140}>역할</TableCell>
            <TableCell width={120}>국적</TableCell>
            <TableCell width={120} align="center">
              상태
            </TableCell>
            <TableCell width={60} align="right">
              {/* 공란 */}
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
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
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Avatar src={row.avatarUrl} alt={row.name} sx={{ width: 32, height: 32 }} />
                  <Stack>
                    <Typography variant="subtitle2">{row.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {row.position}
                    </Typography>
                  </Stack>
                </Stack>
              </TableCell>
              <TableCell>{row.department}</TableCell>
              <TableCell>
                <Stack>
                  <Typography variant="body2">{row.phone}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {row.email}
                  </Typography>
                </Stack>
              </TableCell>
              <TableCell>{row.role}</TableCell>
              <TableCell>{row.nationality}</TableCell>
              <TableCell align="center">
                {row.status === 'active' ? (
                  <Chip label="활성" size="small" color="success" variant="soft" />
                ) : (
                  <Chip label="비활성" size="small" sx={{ bgcolor: 'grey.300' }} />
                )}
              </TableCell>
              <TableCell align="right">{/* 공란 */}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}



