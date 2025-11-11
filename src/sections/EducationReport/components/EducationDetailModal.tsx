import { useState } from 'react';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Pagination from '@mui/material/Pagination';
import { Iconify } from 'src/components/iconify';

import type { EducationReport, EducationRecord } from 'src/_mock/_education-report';

// ----------------------------------------------------------------------

export type EducationDetailData = {
  report: EducationReport;
  mandatoryEducationRecords: EducationRecord[];
  regularEducationRecords: EducationRecord[];
  joinDate?: string; // 입사일
};

type Props = {
  open: boolean;
  onClose: () => void;
  onSave?: () => void;
  data?: EducationDetailData | null;
};

export default function EducationDetailModal({ open, onClose, onSave, data }: Props) {
  const [mandatoryPage, setMandatoryPage] = useState(1);
  const [regularPage, setRegularPage] = useState(1);
  const rowsPerPage = 5;

  if (!data) {
    return null;
  }

  const { report, mandatoryEducationRecords, regularEducationRecords, joinDate } = data;

  const mandatoryTotalPages = Math.ceil(mandatoryEducationRecords.length / rowsPerPage);
  const regularTotalPages = Math.ceil(regularEducationRecords.length / rowsPerPage);

  const mandatoryPaginated = mandatoryEducationRecords.slice(
    (mandatoryPage - 1) * rowsPerPage,
    mandatoryPage * rowsPerPage
  );
  const regularPaginated = regularEducationRecords.slice(
    (regularPage - 1) * rowsPerPage,
    regularPage * rowsPerPage
  );

  const mandatoryTotal = mandatoryEducationRecords.reduce((sum, r) => sum + r.educationTime, 0);
  const regularTotal = regularEducationRecords.reduce((sum, r) => sum + r.educationTime, 0);
  const totalTime = mandatoryTotal + regularTotal;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          교육 상세 현황
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ pb: 3 }}>
        <Stack spacing={3} sx={{ mt: 1 }}>
          {/* 사용자 정보 섹션 */}
          <Box
            sx={{
              bgcolor: 'grey.100',
              borderRadius: 2,
              p: 3,
            }}
          >
            <Stack spacing={2}>
              <Stack direction="row" justifyContent="flex-start" gap={9} spacing={8}>
                <Stack direction="row" spacing={4} alignItems="center" sx={{ minWidth: 200 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, minWidth: 64 }}>
                    이름
                  </Typography>
                  <Typography variant="body2">{report.name}</Typography>
                </Stack>
                <Stack direction="row" spacing={4} alignItems="center" sx={{ minWidth: 200 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, minWidth: 64 }}>
                    입사일
                  </Typography>
                  <Typography variant="body2">{joinDate || '2025-10-31'}</Typography>
                </Stack>
              </Stack>
              <Stack direction="row" justifyContent="flex-start" gap={9} spacing={8}>
                <Stack direction="row" spacing={4} alignItems="center" sx={{ minWidth: 200 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, minWidth: 64 }}>
                    소속
                  </Typography>
                  <Typography variant="body2">{report.department}</Typography>
                </Stack>
                <Stack direction="row" spacing={4} alignItems="center" sx={{ minWidth: 200 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, minWidth: 64 }}>
                    역할
                  </Typography>
                  <Typography variant="body2">{report.role}</Typography>
                </Stack>
              </Stack>
            </Stack>
          </Box>

          {/* 교육 기록 섹션 */}
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2.5 }}>
              교육 기록
            </Typography>

            {/* 의무교육 */}
            <Box sx={{ mb: 5 }}>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 600,
                  color: 'primary.darker',
                  mb: 2.5,
                }}
              >
                의무교육 이수: {mandatoryTotal}분
              </Typography>

              <TableContainer
                component={Paper}
                sx={{
                  borderRadius: 2,
                  overflow: 'hidden',
                  boxShadow: (theme) => theme.customShadows.card,
                }}
              >
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ bgcolor: 'grey.100', minWidth: 83 }}>방식</TableCell>
                      <TableCell sx={{ bgcolor: 'grey.100', minWidth: 222 }}>교육명</TableCell>
                      <TableCell align="center" sx={{ bgcolor: 'grey.100', minWidth: 73 }}>
                        교육시간
                      </TableCell>
                      <TableCell align="center" sx={{ bgcolor: 'grey.100', minWidth: 107 }}>
                        교육일자
                      </TableCell>
                      <TableCell sx={{ bgcolor: 'grey.100', minWidth: 215 }}>파일</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {mandatoryPaginated.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>
                          <Typography variant="body2">
                            {record.method === 'online' ? '온라인' : '집체'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{record.educationName}</Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body2">{record.educationTime}</Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body2">{record.educationDate}</Typography>
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Typography
                              variant="body2"
                              sx={{
                                textDecoration: 'underline',
                                color: 'text.primary',
                                flex: 1,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {record.fileName || '파일명을 입력해주세요.'}
                            </Typography>
                            <IconButton size="small" sx={{ p: 0.5 }}>
                              <Iconify icon="solar:file-text-bold" width={22} />
                            </IconButton>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {mandatoryTotalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                  <Pagination
                    count={mandatoryTotalPages}
                    page={mandatoryPage}
                    onChange={(_, page) => setMandatoryPage(page)}
                    size="small"
                    color="standard"
                  />
                </Box>
              )}
            </Box>

            {/* 정기교육 */}
            <Box>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 600,
                  color: 'primary.darker',
                  mb: 2.5,
                }}
              >
                정기교육 이수: {regularTotal}분
              </Typography>

              <TableContainer
                component={Paper}
                sx={{
                  borderRadius: 2,
                  overflow: 'hidden',
                  boxShadow: (theme) => theme.customShadows.card,
                }}
              >
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ bgcolor: 'grey.100', minWidth: 83 }}>방식</TableCell>
                      <TableCell sx={{ bgcolor: 'grey.100', minWidth: 222 }}>교육명</TableCell>
                      <TableCell align="center" sx={{ bgcolor: 'grey.100', minWidth: 73 }}>
                        교육시간
                      </TableCell>
                      <TableCell align="center" sx={{ bgcolor: 'grey.100', minWidth: 107 }}>
                        교육일자
                      </TableCell>
                      <TableCell sx={{ bgcolor: 'grey.100', minWidth: 215 }}>파일</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {regularPaginated.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>
                          <Typography variant="body2">
                            {record.method === 'online' ? '온라인' : '집체'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{record.educationName}</Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body2">{record.educationTime}</Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body2">{record.educationDate}</Typography>
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Typography
                              variant="body2"
                              sx={{
                                textDecoration: 'underline',
                                color: 'text.primary',
                                flex: 1,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {record.fileName || '파일명을 입력해주세요.'}
                            </Typography>
                            <IconButton size="small" sx={{ p: 0.5 }}>
                              <Iconify icon="solar:download-bold" width={22} />
                            </IconButton>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {regularTotalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                  <Pagination
                    count={regularTotalPages}
                    page={regularPage}
                    onChange={(_, page) => setRegularPage(page)}
                    size="small"
                    color="standard"
                  />
                </Box>
              )}
            </Box>
          </Box>

          {/* 이수 시간 */}
          <Box>
            <TextField
              label="이수 시간"
              value={`총 ${totalTime}분`}
              fullWidth
              InputProps={{
                readOnly: true,
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: 'grey.50',
                },
              }}
            />
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <Button onClick={onClose} variant="outlined">
          닫기
        </Button>
        <Button onClick={onSave} variant="contained">
          저장
        </Button>
      </DialogActions>
    </Dialog>
  );
}
