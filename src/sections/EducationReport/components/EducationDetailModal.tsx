import { useState, useEffect } from 'react';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Pagination from '@mui/material/Pagination';

import { Iconify } from 'src/components/iconify';
import DialogBtn from 'src/components/safeyoui/button/dialogBtn';

import type { EducationReport, EducationRecord } from 'src/_mock/_education-report';

// ----------------------------------------------------------------------

export type EducationDetailData = {
  report: EducationReport;
  mandatoryEducationRecords: EducationRecord[];
  regularEducationRecords: EducationRecord[];
  joinDate?: string; // 입사일
  isAccidentFreeWorkplace?: boolean; // 무재해 사업장 인증 여부
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
  const [fileNames, setFileNames] = useState<{ [key: string]: string }>({});

  const rowsPerPage = 5;

  useEffect(() => {
    if (open && data) {
      // TODO: TanStack Query Hook(useQuery)으로 사용자 교육 상세 정보 가져오기
      // const { data: educationDetail } = useQuery({
      //   queryKey: ['educationDetail', data.report.id],
      //   queryFn: () => fetchEducationDetail(data.report.id),
      // });

      setMandatoryPage(1);
      setRegularPage(1);
      setFileNames({});
    }
  }, [open, data]);

  const handleFileNameChange = (recordId: string, value: string) => {
    setFileNames((prev) => ({ ...prev, [recordId]: value }));
  };

  const handleSave = () => {
    // TODO: TanStack Query Hook(useMutation)으로 교육 기록 파일명 저장
    // const saveMutation = useMutation({
    //   mutationFn: (data: { recordId: string; fileName: string }[]) => saveEducationFileNames(data),
    //   onSuccess: () => {
    //     queryClient.invalidateQueries({ queryKey: ['educationDetail', data?.report.id] });
    //   },
    // });
    // saveMutation.mutate(Object.entries(fileNames).map(([recordId, fileName]) => ({ recordId, fileName })));

    if (onSave) {
      onSave();
    }
  };

  if (!data) {
    return null;
  }

  const {
    report,
    mandatoryEducationRecords,
    regularEducationRecords,
    joinDate,
    isAccidentFreeWorkplace,
  } = data;

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

      <DialogContent sx={{ pb: 3, px: 0 }}>
        <Stack spacing={3} sx={{ mt: 1 }}>
          {/* 사용자 정보 섹션 */}
          <Box
            sx={{
              bgcolor: 'grey.100',
              p: 2,
            }}
          >
            <Stack spacing={2}>
              <Stack direction="row" justifyContent="flex-start" gap={9} spacing={8}>
                <Stack direction="row" spacing={4} alignItems="center" sx={{ minWidth: 200 }}>
                  <Typography
                    variant="subtitle2"
                    sx={{ fontSize: 14, fontWeight: 600, minWidth: 64 }}
                  >
                    이름
                  </Typography>
                  <Typography variant="body2" sx={{ fontSize: 14 }}>
                    {report.name}
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={4} alignItems="center" sx={{ minWidth: 200 }}>
                  <Typography
                    variant="subtitle2"
                    sx={{ fontSize: 14, fontWeight: 600, minWidth: 64 }}
                  >
                    입사일
                  </Typography>
                  <Typography variant="body2" sx={{ fontSize: 14 }}>
                    {joinDate || '2025-10-31'}
                  </Typography>
                </Stack>
              </Stack>
              <Stack direction="row" justifyContent="flex-start" gap={9} spacing={8}>
                <Stack direction="row" spacing={4} alignItems="center" sx={{ minWidth: 200 }}>
                  <Typography
                    variant="subtitle2"
                    sx={{ fontSize: 14, fontWeight: 600, minWidth: 64 }}
                  >
                    소속
                  </Typography>
                  <Typography variant="body2" sx={{ fontSize: 14 }}>
                    {report.department}
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={4} alignItems="center" sx={{ minWidth: 200 }}>
                  <Typography
                    variant="subtitle2"
                    sx={{ fontSize: 14, fontWeight: 600, minWidth: 64 }}
                  >
                    역할
                  </Typography>
                  <Typography variant="body2" sx={{ fontSize: 14 }}>
                    {report.role}
                  </Typography>
                </Stack>
              </Stack>
            </Stack>
          </Box>

          {/* 교육 기록 섹션 */}
          <Stack spacing={5} sx={{ px: 3 }}>
            {/* 의무교육 이수 */}
            <Stack spacing={2.5}>
              <Stack spacing={1.25}>
                <Typography variant="h6" sx={{ fontSize: 18, fontWeight: 600 }}>
                  교육 기록
                </Typography>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: 'primary.darker',
                  }}
                >
                  의무교육 이수: {mandatoryTotal}분
                </Typography>
              </Stack>

              <TableContainer
                component={Paper}
                sx={{
                  borderRadius: 2,
                  boxShadow: (theme) => theme.customShadows.card,
                  overflow: 'hidden',
                }}
              >
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell
                        sx={{
                          bgcolor: 'grey.50',
                          fontWeight: 600,
                          fontSize: 14,
                          color: 'text.secondary',
                          width: 83,
                        }}
                      >
                        방식
                      </TableCell>
                      <TableCell
                        sx={{
                          bgcolor: 'grey.50',
                          fontWeight: 600,
                          fontSize: 14,
                          color: 'text.secondary',
                          width: 222,
                        }}
                      >
                        교육명
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{
                          bgcolor: 'grey.50',
                          fontWeight: 600,
                          fontSize: 14,
                          color: 'text.secondary',
                          width: 73,
                        }}
                      >
                        교육시간
                      </TableCell>
                      <TableCell
                        sx={{
                          bgcolor: 'grey.50',
                          fontWeight: 600,
                          fontSize: 14,
                          color: 'text.secondary',
                          width: 107,
                        }}
                      >
                        교육일자
                      </TableCell>
                      <TableCell
                        sx={{
                          bgcolor: 'grey.50',
                          fontWeight: 600,
                          fontSize: 14,
                          color: 'text.secondary',
                          width: 215,
                        }}
                      >
                        파일
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {mandatoryPaginated.map((record) => (
                      <TableRow
                        key={record.id}
                        sx={{ borderBottom: '1px dashed', borderColor: 'divider' }}
                      >
                        <TableCell sx={{ fontSize: 14 }}>{record.method}</TableCell>
                        <TableCell sx={{ fontSize: 14 }}>{record.educationName}</TableCell>
                        <TableCell align="center" sx={{ fontSize: 14 }}>
                          {record.educationTime}
                        </TableCell>
                        <TableCell sx={{ fontSize: 14 }}>{record.educationDate}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <TextField
                              value={fileNames[record.id] || record.fileName || ''}
                              onChange={(e) => handleFileNameChange(record.id, e.target.value)}
                              placeholder="파일명을 입력해주세요."
                              size="small"
                              sx={{
                                flex: 1,
                                '& .MuiInputBase-input': {
                                  fontSize: 14,
                                  py: 1,
                                  textDecoration: 'underline',
                                },
                              }}
                            />
                            <IconButton size="small" sx={{ width: 22, height: 22 }}>
                              <Iconify icon="solar:download-bold" width={22} />
                            </IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {mandatoryTotalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  <Pagination
                    count={mandatoryTotalPages}
                    page={mandatoryPage}
                    onChange={(_, page) => {
                      setMandatoryPage(page);
                      // TODO: 페이지 변경 시 TanStack Query로 의무교육 목록 새로고침
                      // queryClient.invalidateQueries({ queryKey: ['mandatoryEducation', data?.report.id, page] });
                    }}
                    color="standard"
                    size="small"
                  />
                </Box>
              )}
            </Stack>

            {/* 정기교육 이수 */}
            <Stack spacing={2.5}>
              <Typography
                variant="subtitle2"
                sx={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: 'primary.darker',
                }}
              >
                정기교육 이수: {regularTotal}분
              </Typography>

              <TableContainer
                component={Paper}
                sx={{
                  borderRadius: 2,
                  boxShadow: (theme) => theme.customShadows.card,
                  overflow: 'hidden',
                }}
              >
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell
                        sx={{
                          bgcolor: 'grey.50',
                          fontWeight: 600,
                          fontSize: 14,
                          color: 'text.secondary',
                          width: 83,
                        }}
                      >
                        방식
                      </TableCell>
                      <TableCell
                        sx={{
                          bgcolor: 'grey.50',
                          fontWeight: 600,
                          fontSize: 14,
                          color: 'text.secondary',
                          width: 222,
                        }}
                      >
                        교육명
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{
                          bgcolor: 'grey.50',
                          fontWeight: 600,
                          fontSize: 14,
                          color: 'text.secondary',
                          width: 73,
                        }}
                      >
                        교육시간
                      </TableCell>
                      <TableCell
                        sx={{
                          bgcolor: 'grey.50',
                          fontWeight: 600,
                          fontSize: 14,
                          color: 'text.secondary',
                          width: 107,
                        }}
                      >
                        교육일자
                      </TableCell>
                      <TableCell
                        sx={{
                          bgcolor: 'grey.50',
                          fontWeight: 600,
                          fontSize: 14,
                          color: 'text.secondary',
                          width: 215,
                        }}
                      >
                        파일
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {regularPaginated.map((record) => (
                      <TableRow
                        key={record.id}
                        sx={{ borderBottom: '1px dashed', borderColor: 'divider' }}
                      >
                        <TableCell sx={{ fontSize: 14 }}>{record.method}</TableCell>
                        <TableCell sx={{ fontSize: 14 }}>{record.educationName}</TableCell>
                        <TableCell align="center" sx={{ fontSize: 14 }}>
                          {record.educationTime}
                        </TableCell>
                        <TableCell sx={{ fontSize: 14 }}>{record.educationDate}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <TextField
                              value={fileNames[record.id] || record.fileName || ''}
                              onChange={(e) => handleFileNameChange(record.id, e.target.value)}
                              placeholder="파일명을 입력해주세요."
                              size="small"
                              sx={{
                                flex: 1,
                                '& .MuiInputBase-input': {
                                  fontSize: 14,
                                  py: 1,
                                  textDecoration: 'underline',
                                },
                              }}
                            />
                            <IconButton size="small" sx={{ width: 22, height: 22 }}>
                              <Iconify icon="solar:download-bold" width={22} />
                            </IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {regularTotalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  <Pagination
                    count={regularTotalPages}
                    page={regularPage}
                    onChange={(_, page) => {
                      setRegularPage(page);
                      // TODO: 페이지 변경 시 TanStack Query로 정기교육 목록 새로고침
                      // queryClient.invalidateQueries({ queryKey: ['regularEducation', data?.report.id, page] });
                    }}
                    color="standard"
                    size="small"
                  />
                </Box>
              )}
            </Stack>

            {/* 이수 시간 요약 */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'flex-end',
                gap: 3,
                pb: 2,
              }}
            >
              <Stack spacing={3} sx={{ minWidth: 300 }}>
                <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                  <TextField
                    label="현재 이수시간"
                    value={totalTime}
                    disabled
                    size="small"
                    sx={{
                      flex: 1,
                      '& .MuiInputBase-input': {
                        fontSize: 15,
                        fontWeight: 400,
                      },
                    }}
                  />
                  <Typography variant="subtitle2" sx={{ fontSize: 14, fontWeight: 600, mb: 0.5 }}>
                    분
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                  <TextField
                    label="이수 기준시간"
                    value={report.standardEducation}
                    disabled
                    size="small"
                    sx={{
                      flex: 1,
                      '& .MuiInputBase-input': {
                        fontSize: 15,
                        fontWeight: 400,
                      },
                    }}
                  />
                  <Typography variant="subtitle2" sx={{ fontSize: 14, fontWeight: 600, mb: 0.5 }}>
                    분
                  </Typography>
                </Box>
              </Stack>
              {isAccidentFreeWorkplace && (
                <Box
                  sx={{
                    display: 'flex',
                    gap: 0.5,
                    alignItems: 'center',
                    pb: 2,
                    pt: 3,
                    px: 2.5,
                  }}
                >
                  <Iconify
                    icon="solar:info-circle-bold"
                    width={16}
                    sx={{ color: 'text.secondary' }}
                  />
                  <Typography
                    variant="caption"
                    sx={{
                      fontSize: 12,
                      color: 'text.secondary',
                      lineHeight: 1.5,
                    }}
                  >
                    무재해 사업장 감면 혜택이 적용되었습니다.
                  </Typography>
                </Box>
              )}
            </Box>
          </Stack>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 3 }}>
        <Box sx={{ flex: 1 }} />
        <Stack direction="row" spacing={1.5}>
          <DialogBtn variant="outlined" onClick={onClose} sx={{ minHeight: 36, fontSize: 14 }}>
            닫기
          </DialogBtn>
          <DialogBtn variant="contained" onClick={handleSave} sx={{ minHeight: 36, fontSize: 14 }}>
            저장
          </DialogBtn>
        </Stack>
      </DialogActions>
    </Dialog>
  );
}
