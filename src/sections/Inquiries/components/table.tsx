import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableContainer from '@mui/material/TableContainer';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

// ----------------------------------------------------------------------

export type InquiryRow = {
  id: string;
  sequence: number;
  inquiryAt: string;
  category: string;
  postCategoryIdx?: number;
  title: string;
  status: 'completed' | 'pending';
  answeredAt?: string;
  postIdx?: number;
  content?: string;
  answer?: string;
};

type Props = {
  rows: InquiryRow[];
  onEdit?: (row: InquiryRow) => void;
  onViewAnswer?: (row: InquiryRow) => void;
};

export default function InquiriesTable({ rows, onEdit, onViewAnswer }: Props) {
  return (
    <TableContainer sx={{ overflow: 'unset' }}>
      <Scrollbar>
        <Table sx={{ minWidth: 1000 }}>
          <TableHead sx={{ bgcolor: 'background.neutral' }}>
            <TableRow>
              <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>순번</TableCell>
              <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>문의일</TableCell>
              <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>카테고리</TableCell>
              <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>제목</TableCell>
              <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }} align="center">
                상태
              </TableCell>
              <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>답변일</TableCell>
              <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }} align="center">
                액션
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id} hover>
                <TableCell sx={{ py: 2.5 }}>{row.sequence}</TableCell>
                <TableCell>
                  <Typography variant="body2">{row.inquiryAt.split(' ')[0]}</Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {row.inquiryAt.split(' ')[1]}
                  </Typography>
                </TableCell>
                <TableCell>{row.category}</TableCell>
                <TableCell sx={{ maxWidth: 350 }}>
                  <Typography variant="body2" noWrap sx={{ fontWeight: 500 }}>
                    {row.title}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Label variant="soft" color={row.status === 'completed' ? 'success' : 'default'}>
                    {row.status === 'completed' ? '답변 완료' : '미답변'}
                  </Label>
                </TableCell>
                <TableCell>
                  {row.answeredAt ? (
                    <>
                      <Typography variant="body2">{row.answeredAt.split(' ')[0]}</Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {row.answeredAt.split(' ')[1]}
                      </Typography>
                    </>
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell align="center">
                  {row.status === 'pending' ? (
                    <Button
                      size="small"
                      variant="outlined"
                      color="success"
                      onClick={() => onEdit?.(row)}
                      startIcon={<Iconify icon="solar:pen-bold" width={16} />}
                      sx={{
                        borderRadius: 1,
                        bgcolor: 'rgba(34, 197, 94, 0.08)',
                        borderColor: 'transparent',
                        '&:hover': {
                          bgcolor: 'rgba(34, 197, 94, 0.16)',
                          borderColor: 'transparent',
                        },
                      }}
                    >
                      수정하기
                    </Button>
                  ) : (
                    <Button
                      size="small"
                      variant="outlined"
                      color="inherit"
                      onClick={() => onViewAnswer?.(row)}
                      endIcon={<Iconify icon={'solar:alt-arrow-right-bold' as any} width={16} />}
                      sx={{
                        borderRadius: 1,
                        borderColor: 'divider',
                        fontWeight: 600,
                      }}
                    >
                      답변보기
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Scrollbar>
    </TableContainer>
  );
}
