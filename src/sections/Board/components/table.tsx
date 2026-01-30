import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableContainer from '@mui/material/TableContainer';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

// ----------------------------------------------------------------------

export type BoardRow = {
  id: string;
  sequence: number;
  registeredAt: string;
  category: string;
  title: string;
  isPopup: boolean;
  isTopFixed: boolean;
  views: number;
  author: string;
  status: 'active' | 'inactive';
};

type Props = {
  rows: BoardRow[];
};

export default function BoardTable({ rows }: Props) {
  return (
    <TableContainer sx={{ overflow: 'unset' }}>
      <Scrollbar>
        <Table sx={{ minWidth: 1000 }}>
          <TableHead sx={{ bgcolor: 'background.neutral' }}>
            <TableRow>
              <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>순번</TableCell>
              <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>등록일</TableCell>
              <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>카테고리</TableCell>
              <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>제목</TableCell>
              <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }} align="center">
                팝업
              </TableCell>
              <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }} align="center">
                상단 고정
              </TableCell>
              <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }} align="center">
                조회수
              </TableCell>
              <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>등록자</TableCell>
              <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }} align="center">
                상태
              </TableCell>
              <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }} align="right" />
            </TableRow>
          </TableHead>

          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id} hover>
                <TableCell sx={{ py: 2.5 }}>{row.sequence}</TableCell>
                <TableCell>
                  <Typography variant="body2">{row.registeredAt.split(' ')[0]}</Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {row.registeredAt.split(' ')[1]}
                  </Typography>
                </TableCell>
                <TableCell sx={{ fontWeight: 600 }}>{row.category}</TableCell>
                <TableCell sx={{ maxWidth: 300 }}>
                  <Typography variant="body2" noWrap>
                    {row.title}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  {row.isPopup && (
                    <Iconify
                      icon="eva:checkmark-fill"
                      sx={{ color: '#078DEE', width: 22, height: 22 }}
                    />
                  )}
                </TableCell>
                <TableCell align="center">
                  {row.isTopFixed && (
                    <Iconify
                      icon="eva:checkmark-fill"
                      sx={{ color: '#078DEE', width: 22, height: 22 }}
                    />
                  )}
                </TableCell>
                <TableCell align="center">{row.views}</TableCell>
                <TableCell>{row.author || '-'}</TableCell>
                <TableCell align="center">
                  <Chip
                    label={row.status === 'active' ? '활성' : '비활성'}
                    size="small"
                    sx={{
                      height: 24,
                      fontWeight: 700,
                      borderRadius: 0.75,
                      ...(row.status === 'active'
                        ? {
                            bgcolor: 'rgba(34, 197, 94, 0.16)',
                            color: 'rgb(17, 141, 87)',
                          }
                        : {
                            bgcolor: 'rgba(145, 158, 171, 0.16)',
                            color: 'rgb(99, 115, 129)',
                          }),
                    }}
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButton>
                    <Iconify
                      icon="solar:pen-bold"
                      sx={{ color: 'text.disabled', width: 20, height: 20 }}
                    />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Scrollbar>
    </TableContainer>
  );
}
