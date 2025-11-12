import { useState } from 'react';

import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import type { Dayjs } from 'dayjs';

import { Iconify } from 'src/components/iconify';
import Button from '@mui/material/Button';

import AccidentFreeWorkplacePagination from './AccidentFreeWorkplacePagination';

// ----------------------------------------------------------------------

type CertificationRecord = {
  id: string;
  certificationDate: string; // YYYY-MM-DD HH:mm:ss
  expirationDate: string; // YYYY-MM-DD HH:mm:ss
  certificateFileName?: string;
};

type Props = {
  organizationId?: string;
};

export default function AccidentFreeWorkplace({ organizationId }: Props) {
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [achievementDate, setAchievementDate] = useState<Dayjs | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [fileNames, setFileNames] = useState<{ [key: string]: string }>({});

  // TODO: TanStack Query Hook(useQuery)으로 무재해 사업장 정보 가져오기
  // const { data: workplaceInfo } = useQuery({
  //   queryKey: ['accidentFreeWorkplace', organizationId],
  //   queryFn: () => getAccidentFreeWorkplaceInfo(organizationId),
  // });

  // 목업 데이터
  const currentStatus = '2025 무재해 사업장';
  const industrialAccidents = 0;
  const accidentFreeDays = 365;
  const nearMissAccidents = 2;

  // TODO: TanStack Query Hook(useQuery)으로 인증 이력 목록 가져오기
  // const { data: certificationRecords } = useQuery({
  //   queryKey: ['certificationRecords', organizationId, page, rowsPerPage],
  //   queryFn: () => getCertificationRecords({ organizationId, page, rowsPerPage }),
  // });

  // 목업 데이터
  const mockCertificationRecords: CertificationRecord[] = [
    {
      id: '1',
      certificationDate: '2025-09-30 16:45:35',
      expirationDate: '2025-09-30 16:45:35',
    },
    {
      id: '2',
      certificationDate: '2025-09-30 16:45:35',
      expirationDate: '2025-09-30 16:45:35',
    },
    {
      id: '3',
      certificationDate: '2025-09-30 16:45:35',
      expirationDate: '2025-09-30 16:45:35',
    },
    {
      id: '4',
      certificationDate: '2025-09-30 16:45:35',
      expirationDate: '2025-09-30 16:45:35',
    },
    {
      id: '5',
      certificationDate: '2025-09-30 16:45:35',
      expirationDate: '2025-09-30 16:45:35',
    },
  ];

  const paginatedRecords = mockCertificationRecords.slice(
    page * rowsPerPage,
    (page + 1) * rowsPerPage
  );

  const handleChangePage = (newPage: number) => {
    setPage(newPage);
    // TODO: 페이지 변경 시 TanStack Query로 인증 이력 목록 새로고침
    // queryClient.invalidateQueries({ queryKey: ['certificationRecords', organizationId, newPage, rowsPerPage] });
  };

  const handleChangeRowsPerPage = (rows: number) => {
    setRowsPerPage(rows);
    setPage(0);
    // TODO: 페이지 크기 변경 시 TanStack Query로 인증 이력 목록 새로고침
    // queryClient.invalidateQueries({ queryKey: ['certificationRecords', organizationId, page, rows] });
  };

  const handleUpdate = () => {
    // TODO: TanStack Query Hook(useMutation)으로 무재해 사업장 정보 업데이트
    // const updateMutation = useMutation({
    //   mutationFn: (data: { startDate: string; achievementDate: string }) =>
    //     updateAccidentFreeWorkplace(organizationId, data),
    //   onSuccess: () => {
    //     queryClient.invalidateQueries({ queryKey: ['accidentFreeWorkplace', organizationId] });
    //   },
    // });
    // updateMutation.mutate({
    //   startDate: startDate?.format('YYYY-MM-DD') || '',
    //   achievementDate: achievementDate?.format('YYYY-MM-DD') || '',
    // });
    console.log('업데이트:', { startDate, achievementDate });
  };

  const handleFileNameChange = (recordId: string, value: string) => {
    setFileNames((prev) => ({ ...prev, [recordId]: value }));
  };

  const handleSaveFileName = (recordId: string) => {
    // TODO: TanStack Query Hook(useMutation)으로 인증서 파일명 저장
    // const saveMutation = useMutation({
    //   mutationFn: (data: { recordId: string; fileName: string }) =>
    //     saveCertificateFileName(organizationId, data),
    //   onSuccess: () => {
    //     queryClient.invalidateQueries({ queryKey: ['certificationRecords', organizationId] });
    //   },
    // });
    // saveMutation.mutate({ recordId, fileName: fileNames[recordId] });
    console.log('파일명 저장:', recordId, fileNames[recordId]);
  };

  const handleDownload = (recordId: string) => {
    // TODO: 인증서 파일 다운로드
    console.log('다운로드:', recordId);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box bgcolor="grey.100">
        <Stack>
          {/* 상단 입력 필드 섹션 */}
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} p={3}>
            {/* 왼쪽 열 */}
            <Stack spacing={2} sx={{ flex: 1 }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Typography variant="subtitle2" sx={{ fontWeight: 600, minWidth: 100 }}>
                  인증 시작일
                </Typography>
                <DatePicker
                  label="시작일"
                  value={startDate}
                  onChange={setStartDate}
                  format="YYYY-MM-DD"
                  slotProps={{
                    textField: {
                      size: 'small',
                      sx: {
                        flex: 1,
                        bgcolor: 'common.white',
                        '& .MuiOutlinedInput-root': {
                          bgcolor: 'common.white',
                        },
                      },
                    },
                  }}
                />
              </Stack>
              <Stack direction="row" spacing={2} alignItems="center">
                <Typography variant="subtitle2" sx={{ fontWeight: 600, minWidth: 100 }}>
                  현재 상태
                </Typography>
                <TextField
                  size="small"
                  value={currentStatus}
                  InputProps={{
                    readOnly: true,
                  }}
                  sx={{
                    flex: 1,
                    bgcolor: 'common.white',
                    '& .MuiOutlinedInput-root': {
                      bgcolor: 'common.white',
                    },
                  }}
                />
              </Stack>
              <Stack direction="row" spacing={2} alignItems="center">
                <Typography variant="subtitle2" sx={{ fontWeight: 600, minWidth: 100 }}>
                  산업 재해
                </Typography>
                <TextField
                  size="small"
                  value={`${industrialAccidents}건`}
                  InputProps={{
                    readOnly: true,
                  }}
                  sx={{
                    flex: 1,
                    bgcolor: 'common.white',
                    '& .MuiOutlinedInput-root': {
                      bgcolor: 'common.white',
                    },
                  }}
                />
              </Stack>
            </Stack>

            {/* 오른쪽 열 */}
            <Stack spacing={2} sx={{ flex: 1 }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Typography variant="subtitle2" sx={{ fontWeight: 600, minWidth: 100 }}>
                  무재해 일수
                </Typography>
                <TextField
                  size="small"
                  value={`${accidentFreeDays}일`}
                  InputProps={{
                    readOnly: true,
                  }}
                  sx={{
                    flex: 1,
                    bgcolor: 'common.white',
                    '& .MuiOutlinedInput-root': {
                      bgcolor: 'common.white',
                    },
                  }}
                />
              </Stack>
              <Stack direction="row" spacing={2} alignItems="center">
                <Typography variant="subtitle2" sx={{ fontWeight: 600, minWidth: 100 }}>
                  다음 달성일
                </Typography>
                <DatePicker
                  label="달성일"
                  value={achievementDate}
                  onChange={setAchievementDate}
                  format="YYYY-MM-DD"
                  slotProps={{
                    textField: {
                      size: 'small',
                      sx: {
                        flex: 1,
                        bgcolor: 'common.white',
                        '& .MuiOutlinedInput-root': {
                          bgcolor: 'common.white',
                        },
                      },
                    },
                  }}
                />
              </Stack>
              <Stack direction="row" spacing={2} alignItems="center">
                <Typography variant="subtitle2" sx={{ fontWeight: 600, minWidth: 100 }}>
                  아차 사고
                </Typography>
                <TextField
                  size="small"
                  value={`${nearMissAccidents}건`}
                  InputProps={{
                    readOnly: true,
                  }}
                  sx={{
                    flex: 1,
                    bgcolor: 'common.white',
                    '& .MuiOutlinedInput-root': {
                      bgcolor: 'common.white',
                    },
                  }}
                />
              </Stack>
            </Stack>
          </Stack>

          {/* 인증 이력 테이블 섹션 - 전체 너비 */}
          <Box>
            {/* 업데이트 버튼 - 오른쪽 열의 맨 아래 */}
            <Box
              bgcolor="white"
              sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                인증 이력
              </Typography>
              <Button variant="contained" onClick={handleUpdate} size="small">
                업데이트
              </Button>
            </Box>

            <TableContainer
              component={Paper}
              sx={{
                boxShadow: (theme) => theme.customShadows.card,
                overflow: 'hidden',
                p: 0,
                borderRadius: 0,
              }}
            >
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ bgcolor: 'grey.100', fontWeight: 600, fontSize: 14, p: 2 }}>
                      인증일자
                    </TableCell>
                    <TableCell sx={{ bgcolor: 'grey.100', fontWeight: 600, fontSize: 14, p: 2 }}>
                      만료일자
                    </TableCell>
                    <TableCell sx={{ bgcolor: 'grey.100', fontWeight: 600, fontSize: 14, p: 2 }}>
                      인증서
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedRecords.map((record) => {
                    const [certDate, certTime] = record.certificationDate.split(' ');
                    const [expDate, expTime] = record.expirationDate.split(' ');
                    return (
                      <TableRow
                        key={record.id}
                        sx={{ borderBottom: '1px dashed', borderColor: 'divider' }}
                      >
                        <TableCell sx={{ fontSize: 14, px: 2 }}>
                          <Stack>
                            <Typography variant="body2">{certDate}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {certTime}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell sx={{ fontSize: 14, px: 2 }}>
                          <Stack>
                            <Typography variant="body2">{expDate}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {expTime}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell sx={{ px: 2 }}>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <TextField
                              value={fileNames[record.id] || record.certificateFileName || ''}
                              onChange={(e) => handleFileNameChange(record.id, e.target.value)}
                              onBlur={() => handleSaveFileName(record.id)}
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
                            <IconButton
                              size="small"
                              onClick={() => handleDownload(record.id)}
                              sx={{ width: 22, height: 22 }}
                            >
                              <Iconify icon="solar:download-bold" width={22} />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleSaveFileName(record.id)}
                              sx={{ width: 22, height: 22 }}
                            >
                              <Iconify icon="solar:pen-bold" width={22} />
                            </IconButton>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              {/* 페이지네이션 */}
              <AccidentFreeWorkplacePagination
                count={mockCertificationRecords.length}
                page={page}
                rowsPerPage={rowsPerPage}
                onChangePage={handleChangePage}
                onChangeRowsPerPage={handleChangeRowsPerPage}
              />
            </TableContainer>
          </Box>
        </Stack>
      </Box>
    </LocalizationProvider>
  );
}
