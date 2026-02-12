import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import ButtonBase from '@mui/material/ButtonBase';

import { Scrollbar } from 'src/components/scrollbar';
import { fDateTime } from 'src/utils/format-time';
import { fNumber } from 'src/utils/format-number';

// ----------------------------------------------------------------------

export type CompanySalesRow = {
  companyIdx: number;
  sequence: number;
  registeredAt?: string;
  companyName: string;
  managerName?: string;
  phone?: string;
  email?: string;
  accidentFreeLabel?: string;
  accidentFreePending?: boolean;
  status: 'active' | 'inactive';
  subscriptionName?: string;
  cumulativeSales?: number;
  lastPaymentAt?: string;
  nextPaymentAt?: string;
};

type Props = {
  rows: CompanySalesRow[];
  onClickCompany?: (companyIdx: number) => void;
};

export default function CompanySalesTable({ rows, onClickCompany }: Props) {
  return (
    <TableContainer sx={{ overflow: 'unset' }}>
      <Scrollbar>
        <Table sx={{ minWidth: 1400 }}>
          <TableHead sx={{ bgcolor: 'background.neutral' }}>
            <TableRow>
              <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>순번</TableCell>
              <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>등록일</TableCell>
              <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>조직명</TableCell>
              <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>담당자</TableCell>
              <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>전화번호 / 이메일</TableCell>
              <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }} align="center">
                무재해 사업장
              </TableCell>
              <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }} align="center">
                상태
              </TableCell>
              <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>구독 서비스</TableCell>
              <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }} align="right">
                누적 매출
              </TableCell>
              <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }} align="right">
                최근 결제일
              </TableCell>
              <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }} align="right">
                다음 결제일
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {rows.map((row) => (
              <TableRow
                key={row.companyIdx}
                hover
                onClick={() => onClickCompany?.(row.companyIdx)}
                sx={{ cursor: onClickCompany ? 'pointer' : 'default' }}
              >
                <TableCell>{row.sequence}</TableCell>
                <TableCell>
                  {row.registeredAt ? (
                    <Stack spacing={0.25}>
                      <Typography variant="body2">{fDateTime(row.registeredAt, 'YYYY-MM-DD')}</Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {fDateTime(row.registeredAt, 'HH:mm:ss')}
                      </Typography>
                    </Stack>
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell>
                  <ButtonBase
                    onClick={(event) => {
                      event.stopPropagation();
                      onClickCompany?.(row.companyIdx);
                    }}
                    sx={{
                      fontWeight: 600,
                      color: 'text.primary',
                      textAlign: 'left',
                      '&:hover': { textDecoration: 'underline' },
                    }}
                  >
                    {row.companyName}
                  </ButtonBase>
                </TableCell>
                <TableCell>{row.managerName || '-'}</TableCell>
                <TableCell>
                  <Stack spacing={0.25}>
                    <Typography variant="body2">{row.phone || '-'}</Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {row.email || '-'}
                    </Typography>
                  </Stack>
                </TableCell>
                <TableCell align="center">
                  {row.accidentFreeLabel ? (
                    row.accidentFreePending ? (
                      <Chip
                        size="small"
                        variant="outlined"
                        label={row.accidentFreeLabel}
                        sx={{ fontWeight: 700 }}
                      />
                    ) : (
                      <Chip
                        size="small"
                        color="info"
                        variant="outlined"
                        label={row.accidentFreeLabel}
                        sx={{ fontWeight: 700 }}
                      />
                    )
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell align="center">
                  <Chip
                    size="small"
                    color={row.status === 'active' ? 'success' : 'default'}
                    label={row.status === 'active' ? '활성' : '비활성'}
                    sx={{ fontWeight: 700 }}
                  />
                </TableCell>
                <TableCell>{row.subscriptionName || '-'}</TableCell>
                <TableCell align="right">
                  {typeof row.cumulativeSales === 'number' ? `${fNumber(row.cumulativeSales)}원` : '-'}
                </TableCell>
                <TableCell align="right">
                  {row.lastPaymentAt ? fDateTime(row.lastPaymentAt, 'YYYY-MM-DD') : '-'}
                </TableCell>
                <TableCell align="right">
                  {row.nextPaymentAt ? fDateTime(row.nextPaymentAt, 'YYYY-MM-DD') : '-'}
                </TableCell>
              </TableRow>
            ))}

            {rows.length === 0 && (
              <TableRow>
                <TableCell align="center" colSpan={11} sx={{ py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    데이터가 없습니다.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Scrollbar>
    </TableContainer>
  );
}
