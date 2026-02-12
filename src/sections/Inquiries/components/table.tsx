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
import { fDateTime } from 'src/utils/format-time';

// ----------------------------------------------------------------------

import type { BoardCommentInformation } from 'src/services/board/board.types';

export type InquiryRow = {
  id: string;
  sequence: number;
  inquirerName?: string; // 문의자 이름
  inquirerEmail?: string; // 문의자 이메일
  inquirerId?: string; // 회원 ID
  inquirerPhone?: string; // 전화번호
  inquiryAt: string;
  category: string;
  postCategoryIdx?: number;
  title: string;
  status: 'completed' | 'pending';
  answeredAt?: string;
  postIdx?: number;
  content?: string;
  answer?: string;
  commentInformation?: BoardCommentInformation; // 답변 정보
};

type Props = {
  rows: InquiryRow[];
  isSuperAdmin?: boolean;
  onEdit?: (row: InquiryRow) => void;
  onReply?: (row: InquiryRow) => void; // 답변하기
  onViewAnswer?: (row: InquiryRow) => void;
};

export default function InquiriesTable({
  rows,
  isSuperAdmin = false,
  onEdit,
  onReply,
  onViewAnswer,
}: Props) {
  return (
    <TableContainer sx={{ overflow: 'unset' }}>
      <Scrollbar>
        <Table sx={{ minWidth: 1000 }}>
          <TableHead sx={{ bgcolor: 'background.neutral' }}>
            <TableRow>
              <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>순번</TableCell>
              <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>이름</TableCell>
              <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>이메일</TableCell>
              <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>문의일</TableCell>
              <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>카테고리</TableCell>
              <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>제목</TableCell>
              <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }} align="center">
                상태
              </TableCell>
              <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>답변일</TableCell>
              <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }} align="center">
                &nbsp;
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {rows.map((row) => {
              // 문의일 파싱 (YYYY-MM-DD 밑에 HH:mm:ss)
              const inquiryDateStr =
                row.inquiryAt && row.inquiryAt !== '-'
                  ? fDateTime(row.inquiryAt, 'YYYY-MM-DD')
                  : '-';
              const inquiryTimeStr =
                row.inquiryAt && row.inquiryAt !== '-' ? fDateTime(row.inquiryAt, 'HH:mm:ss') : '';

              // 답변일 파싱
              const answerDateStr = row.answeredAt ? fDateTime(row.answeredAt, 'YYYY-MM-DD') : null;
              const answerTimeStr = row.answeredAt ? fDateTime(row.answeredAt, 'HH:mm:ss') : null;

              return (
                <TableRow key={row.id} hover>
                  <TableCell sx={{ py: 2.5 }}>{row.sequence}</TableCell>
                  <TableCell>
                    <Typography variant="body2">{row.inquirerName || '-'}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{row.inquirerEmail || '-'}</Typography>
                  </TableCell>
                  <TableCell>
                    {inquiryDateStr !== '-' ? (
                      <>
                        <Typography variant="body2">{inquiryDateStr}</Typography>
                        {inquiryTimeStr && (
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            {inquiryTimeStr}
                          </Typography>
                        )}
                      </>
                    ) : (
                      <Typography variant="body2">-</Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {row.category !== '-' ? row.category : '-'}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ maxWidth: 350 }}>
                    <Typography variant="body2" noWrap sx={{ fontWeight: 500 }}>
                      {row.title}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Label
                      variant="soft"
                      color={row.status === 'completed' ? 'success' : 'default'}
                    >
                      {row.status === 'completed' ? '답변 완료' : '미답변'}
                    </Label>
                  </TableCell>
                  <TableCell>
                    {answerDateStr ? (
                      <>
                        <Typography variant="body2">{answerDateStr}</Typography>
                        {answerTimeStr && (
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            {answerTimeStr}
                          </Typography>
                        )}
                      </>
                    ) : (
                      <Typography variant="body2">-</Typography>
                    )}
                  </TableCell>
                  <TableCell align="center">
                    {isSuperAdmin ? (
                      <Button
                        size="small"
                        variant="outlined"
                        color={row.status === 'pending' ? 'success' : 'inherit'}
                        onClick={() => {
                          if (row.status === 'pending') onReply?.(row);
                          else onViewAnswer?.(row);
                        }}
                        startIcon={<Iconify icon="solar:letter-bold" width={16} />}
                        sx={{
                          borderRadius: 1,
                          ...(row.status === 'pending'
                            ? {
                                bgcolor: 'rgba(34, 197, 94, 0.08)',
                                borderColor: 'transparent',
                                '&:hover': {
                                  bgcolor: 'rgba(34, 197, 94, 0.16)',
                                  borderColor: 'transparent',
                                },
                              }
                            : {
                                borderColor: 'divider',
                                fontWeight: 600,
                              }),
                        }}
                      >
                        {row.status === 'pending' ? '답변하기' : '상세보기'}
                      </Button>
                    ) : (
                      <Button
                        size="small"
                        variant="outlined"
                        color={row.status === 'pending' ? 'success' : 'inherit'}
                        onClick={() => {
                          if (row.status === 'pending') onEdit?.(row);
                          else onViewAnswer?.(row);
                        }}
                        endIcon={<Iconify icon={'solar:alt-arrow-right-bold' as any} width={16} />}
                        sx={{
                          borderRadius: 1,
                          ...(row.status === 'pending'
                            ? {
                                bgcolor: 'rgba(34, 197, 94, 0.08)',
                                borderColor: 'transparent',
                                '&:hover': {
                                  bgcolor: 'rgba(34, 197, 94, 0.16)',
                                  borderColor: 'transparent',
                                },
                              }
                            : {
                                borderColor: 'divider',
                                fontWeight: 600,
                              }),
                        }}
                      >
                        {row.status === 'pending' ? '수정하기' : '답변보기'}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Scrollbar>
    </TableContainer>
  );
}
