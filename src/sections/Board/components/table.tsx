import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableContainer from '@mui/material/TableContainer';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { fDateTime } from 'src/utils/format-time';

// ----------------------------------------------------------------------

export type BoardRow = {
  id: string;
  postIdx: number;
  sequence: number;
  registeredAt: string;
  category: string;
  title: string;
  isPopup: boolean;
  isTopFixed: boolean;
  views: number;
  author: string;
  isAuthorSuperAdmin?: boolean;
  status: 'active' | 'inactive';
};

type Props = {
  rows: BoardRow[];
  isSuperAdmin?: boolean;
  canEdit?: boolean;
  onView?: (row: BoardRow) => void;
  onEdit?: (row: BoardRow) => void;
};

export default function BoardTable({
  rows,
  isSuperAdmin = false,
  canEdit = false,
  onView,
  onEdit,
}: Props) {
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
              {isSuperAdmin && (
                <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }} align="center">
                  팝업
                </TableCell>
              )}
              {isSuperAdmin && (
                <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }} align="center">
                  상단 고정
                </TableCell>
              )}
              <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }} align="center">
                조회수
              </TableCell>
              <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>등록자</TableCell>
              {isSuperAdmin && (
                <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }} align="center">
                  상태
                </TableCell>
              )}
              {canEdit && (
                <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }} align="right" />
              )}
            </TableRow>
          </TableHead>

          <TableBody>
            {rows.map((row) => {
              const registeredDateStr =
                row.registeredAt && row.registeredAt !== '-'
                  ? fDateTime(row.registeredAt, 'YYYY-MM-DD')
                  : '-';
              const registeredTimeStr =
                row.registeredAt && row.registeredAt !== '-'
                  ? fDateTime(row.registeredAt, 'HH:mm:ss')
                  : '';

              return (
                <TableRow
                  key={row.id}
                  hover
                  onClick={() => onView?.(row)}
                  sx={{
                    cursor: onView ? 'pointer' : 'default',
                    ...(row.isTopFixed
                      ? {
                          bgcolor: 'rgba(7, 141, 238, 0.06)',
                          '&:hover': {
                            bgcolor: 'rgba(7, 141, 238, 0.12)',
                          },
                        }
                      : undefined),
                  }}
                >
                  <TableCell sx={{ py: 2.5 }}>{row.sequence}</TableCell>
                  <TableCell>
                    {registeredDateStr !== '-' ? (
                      <Stack spacing={0.25}>
                        <Typography variant="body2">{registeredDateStr}</Typography>
                        {registeredTimeStr && (
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            {registeredTimeStr}
                          </Typography>
                        )}
                      </Stack>
                    ) : (
                      <Typography variant="body2">-</Typography>
                    )}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{row.category}</TableCell>
                  <TableCell sx={{ maxWidth: 300 }}>
                    <Typography variant="body2" noWrap>
                      {row.title}
                    </Typography>
                  </TableCell>
                  {isSuperAdmin && (
                    <TableCell align="center">
                      {row.isPopup && (
                        <Iconify
                          icon="eva:checkmark-fill"
                          sx={{ color: '#078DEE', width: 22, height: 22 }}
                        />
                      )}
                    </TableCell>
                  )}
                  {isSuperAdmin && (
                    <TableCell align="center">
                      {row.isTopFixed && (
                        <Iconify
                          icon="eva:checkmark-fill"
                          sx={{ color: '#078DEE', width: 22, height: 22 }}
                        />
                      )}
                    </TableCell>
                  )}
                  <TableCell align="center">{row.views}</TableCell>
                  <TableCell>{row.author || '-'}</TableCell>
                  {isSuperAdmin && (
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
                  )}
                  {canEdit && !row.isAuthorSuperAdmin && (
                    <TableCell align="right">
                      {onEdit && (
                        <IconButton
                          onClick={(event) => {
                            event.stopPropagation();
                            onEdit(row);
                          }}
                        >
                          <Iconify
                            icon="solar:pen-bold"
                            sx={{ color: 'text.disabled', width: 20, height: 20 }}
                          />
                        </IconButton>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Scrollbar>
    </TableContainer>
  );
}
