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
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';

import { Iconify } from 'src/components/iconify';
import { fDateTime } from 'src/utils/format-time';

// ----------------------------------------------------------------------

export type PaymentHistoryItem = {
  id: string | number;
  order: number;
  paymentDate: string; // ISO date string
  paymentNumber: string;
  serviceName: string;
  amount: number;
  paymentMethod: string; // e.g., "국민카드 ****-3912" or "계좌이체"
  status: 'COMPLETED' | 'CANCELLED' | 'PENDING';
  receiptUrl?: string;
};

type PaymentHistoryTableProps = {
  rows: PaymentHistoryItem[];
  onViewReceipt?: (row: PaymentHistoryItem) => void;
};

export default function PaymentHistoryTable({ rows, onViewReceipt }: PaymentHistoryTableProps) {
  const formatPrice = (price: number) => String(price).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  const getStatusChip = (status: PaymentHistoryItem['status']) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <Chip
            label="완료"
            size="small"
            sx={{
              bgcolor: 'rgba(0, 167, 111, 0.16)',
              color: '#007867',
              fontWeight: 700,
              fontSize: 12,
              height: 24,
            }}
          />
        );
      case 'CANCELLED':
        return (
          <Chip
            label="취소"
            size="small"
            sx={{
              bgcolor: 'rgba(255, 86, 48, 0.16)',
              color: '#b71d18',
              fontWeight: 700,
              fontSize: 12,
              height: 24,
            }}
          />
        );
      case 'PENDING':
        return (
          <Chip
            label="대기"
            size="small"
            sx={{
              bgcolor: 'rgba(255, 193, 7, 0.16)',
              color: '#f57c00',
              fontWeight: 700,
              fontSize: 12,
              height: 24,
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Card
      sx={{
        borderRadius: 0,
        boxShadow: 'none',
        overflow: 'hidden',
      }}
    >
      <CardHeader
        title={
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            결제 내역
          </Typography>
        }
      />

      <TableContainer
        component={Paper}
        sx={{
          overflowX: 'auto',
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
          boxShadow: 'none',
        }}
      >
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell
                align="center"
                sx={{
                  bgcolor: 'grey.100',
                  minWidth: 68,
                  width: 68,
                  fontWeight: 600,
                  fontSize: 14,
                  color: 'text.secondary',
                }}
              >
                순번
              </TableCell>
              <TableCell
                sx={{
                  bgcolor: 'grey.100',
                  minWidth: 120,
                  width: 120,
                  fontWeight: 600,
                  fontSize: 14,
                  color: 'text.secondary',
                }}
              >
                결제일
              </TableCell>
              <TableCell
                sx={{
                  bgcolor: 'grey.100',
                  minWidth: 200,
                  width: 200,
                  fontWeight: 600,
                  fontSize: 14,
                  color: 'text.secondary',
                }}
              >
                결제 번호
              </TableCell>
              <TableCell
                sx={{
                  bgcolor: 'grey.100',
                  minWidth: 392,
                  width: 392,
                  fontWeight: 600,
                  fontSize: 14,
                  color: 'text.secondary',
                }}
              >
                구독 서비스
              </TableCell>
              <TableCell
                sx={{
                  bgcolor: 'grey.100',
                  minWidth: 140,
                  width: 140,
                  fontWeight: 600,
                  fontSize: 14,
                  color: 'text.secondary',
                }}
              >
                결제금액
              </TableCell>
              <TableCell
                sx={{
                  bgcolor: 'grey.100',
                  minWidth: 200,
                  width: 200,
                  fontWeight: 600,
                  fontSize: 14,
                  color: 'text.secondary',
                }}
              >
                결제수단
              </TableCell>
              <TableCell
                align="center"
                sx={{
                  bgcolor: 'grey.100',
                  minWidth: 100,
                  width: 100,
                  fontWeight: 600,
                  fontSize: 14,
                  color: 'text.secondary',
                }}
              >
                상태
              </TableCell>
              <TableCell
                align="center"
                sx={{
                  bgcolor: 'grey.100',
                  minWidth: 100,
                  width: 100,
                  fontWeight: 600,
                  fontSize: 14,
                  color: 'text.secondary',
                }}
              >
                영수증
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    결제 내역이 없습니다.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => {
                // paymentDate를 'YYYY-MM-DD HH:mm:ss' 형식으로 포맷팅
                const paymentDateTime = fDateTime(row.paymentDate, 'YYYY-MM-DD HH:mm:ss');
                // 날짜와 시간 분리
                const [date, time] = paymentDateTime.split(' ');

                return (
                  <TableRow
                    key={row.id}
                    hover
                    sx={{
                      borderBottom: '1px dashed',
                      borderColor: 'divider',
                    }}
                  >
                    <TableCell align="center">
                      <Typography variant="body2">{row.order}</Typography>
                    </TableCell>

                    <TableCell>
                      <Stack spacing={0.25}>
                        <Typography variant="body2" sx={{ color: 'text.primary' }}>
                          {date}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: 14 }}>
                          {time}
                        </Typography>
                      </Stack>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2">{row.paymentNumber}</Typography>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2">{row.serviceName}</Typography>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2">{formatPrice(row.amount)}원</Typography>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2">{row.paymentMethod}</Typography>
                    </TableCell>

                    <TableCell align="center">{getStatusChip(row.status)}</TableCell>

                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={() => onViewReceipt?.(row)}
                        disabled={!row.receiptUrl}
                        sx={{
                          color: row.receiptUrl ? 'text.secondary' : 'text.disabled',
                          '&:hover': {
                            bgcolor: row.receiptUrl ? 'action.hover' : 'transparent',
                          },
                        }}
                      >
                        <Iconify icon="solar:eye-bold" width={20} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  );
}
