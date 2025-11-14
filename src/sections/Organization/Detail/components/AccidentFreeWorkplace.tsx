import { useState, useMemo } from 'react';

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
import Chip from '@mui/material/Chip';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import type { Dayjs } from 'dayjs';

import { Iconify } from 'src/components/iconify';
import Button from '@mui/material/Button';
import Badge from 'src/components/safeyoui/badge';

import { mockCompanies } from 'src/_mock/_company';
import type { Company } from 'src/_mock/_company';
import AccidentFreeWorkplacePagination from './AccidentFreeWorkplacePagination';
import UpdateCertificationModal from './UpdateCertificationModal';

// ----------------------------------------------------------------------

type CertificationRecord = {
  id: string;
  registrationDate: string; // YYYY-MM-DD HH:mm:ss
  certificationDate: string; // YYYY-MM-DD HH:mm:ss
  applicationYear?: string; // YYYY년 (없으면 검토 대기)
  certificateFileName?: string;
  accidentFreeYear?: number | null;
};

type StatusType = 'valid' | 'pending' | 'expired';

type Props = {
  organizationId?: string;
};

export default function AccidentFreeWorkplace({ organizationId }: Props) {
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [achievementDate, setAchievementDate] = useState<Dayjs | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [uploadedFiles, setUploadedFiles] = useState<{ [key: string]: File | null }>({});
  const [updateModalOpen, setUpdateModalOpen] = useState(false);

  // TODO: TanStack Query Hook(useQuery)으로 무재해 사업장 정보 가져오기
  // const { data: workplaceInfo } = useQuery({
  //   queryKey: ['accidentFreeWorkplace', organizationId],
  //   queryFn: () => getAccidentFreeWorkplaceInfo(organizationId),
  // });

  // _company 목업 데이터와 연동
  const companies = mockCompanies();
  const organization: Company | undefined = useMemo(() => {
    if (!organizationId) return undefined;
    return companies.find((c) => c.companyIdx.toString() === organizationId);
  }, [organizationId, companies]);

  // 목업 데이터 - organization의 accidentFreeYear를 기반으로 설정
  const accidentFreeYear = organization ? 2024 : null; // TODO: API에서 가져온 실제 값으로 교체
  const currentStatus = accidentFreeYear ? `${accidentFreeYear}년 무재해 사업장` : null;
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
      registrationDate: '2025-09-30 16:45:35',
      certificationDate: '2025-09-30',
      applicationYear: '2026년',
      accidentFreeYear: 2024,
    },
    {
      id: '2',
      registrationDate: '2025-09-30 16:45:35',
      certificationDate: '2025-09-30',
      applicationYear: '2025년',
      accidentFreeYear: null,
    },
    {
      id: '3',
      registrationDate: '2025-09-30 16:45:35',
      certificationDate: '2025-09-30',
      applicationYear: '2024년',
      accidentFreeYear: 2024,
    },
    {
      id: '4',
      registrationDate: '2025-09-30 16:45:35',
      certificationDate: '2025-09-30',
      applicationYear: '2023년',
      accidentFreeYear: 2023,
    },
    {
      id: '5',
      registrationDate: '2025-09-30 16:45:35',
      certificationDate: '2025-09-30',
      // 적용 연도 없음 - 검토 대기
      accidentFreeYear: null,
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
    setUpdateModalOpen(true);
  };

  const handleUpdateSave = (data: { certificationDate: Dayjs | null; file: File | null }) => {
    // TODO: TanStack Query Hook(useMutation)으로 인증 이력 업데이트 API 호출
    // const updateMutation = useMutation({
    //   mutationFn: (data: { certificationDate: string; file: File | null }) =>
    //     updateCertificationRecord(organizationId, data),
    //   onSuccess: () => {
    //     queryClient.invalidateQueries({ queryKey: ['certificationRecords', organizationId] });
    //     // 성공 토스트 메시지 표시
    //   },
    //   onError: (error) => {
    //     console.error('인증 이력 업데이트 실패:', error);
    //     // 에러 토스트 메시지 표시
    //   },
    // });
    // updateMutation.mutate({
    //   certificationDate: data.certificationDate?.format('YYYY-MM-DD') || '',
    //   file: data.file,
    // });
    console.log('인증 이력 업데이트:', data);
  };

  const fileInputRefs: { [key: string]: HTMLInputElement | null } = {};

  const handleFileUpload = (recordId: string) => {
    fileInputRefs[recordId]?.click();
  };

  const handleFileSelect = (recordId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // TODO: TanStack Query Hook(useMutation)으로 인증서 파일 업로드
      // const uploadMutation = useMutation({
      //   mutationFn: (file: File) => uploadCertificateFile(organizationId, recordId, file),
      //   onSuccess: () => {
      //     queryClient.invalidateQueries({ queryKey: ['certificationRecords', organizationId] });
      //   },
      // });
      // uploadMutation.mutate(file);
      setUploadedFiles((prev) => ({ ...prev, [recordId]: file }));
      console.log('파일 업로드:', recordId, file.name);
    }
  };

  const handleDownload = (recordId: string) => {
    // TODO: 인증서 파일 다운로드
    // const downloadMutation = useMutation({
    //   mutationFn: () => downloadCertificateFile(organizationId, recordId),
    // });
    // downloadMutation.mutate();
    console.log('다운로드:', recordId);
  };

  // 현재 연도 가져오기
  const currentYear = new Date().getFullYear();

  // 적용 연도에서 연도 추출 (예: "2026년" -> 2026)
  const extractYear = (applicationYear: string | undefined): number | null => {
    if (!applicationYear) return null;
    const match = applicationYear.match(/(\d{4})년/);
    return match ? parseInt(match[1], 10) : null;
  };

  // 상태 계산 함수
  const getStatus = (record: CertificationRecord): StatusType => {
    // 적용 연도가 없으면 검토 대기
    if (!record.applicationYear) {
      return 'pending';
    }

    const applicationYearNum = extractYear(record.applicationYear);

    // 적용 연도를 추출할 수 없으면 검토 대기
    if (applicationYearNum === null) {
      return 'pending';
    }

    // 적용 연도와 현재 연도가 같으면 유효
    if (applicationYearNum === currentYear) {
      return 'valid';
    }

    // 그 외는 만료
    return 'expired';
  };

  // 상태 Badge 렌더링 함수
  const renderStatusBadge = (status: StatusType) => {
    switch (status) {
      case 'valid':
        return <Badge label="유효" variant="success" />;
      case 'expired':
        return <Badge label="만료" variant="error" />;
      case 'pending':
      default:
        return <Badge label="검토 대기" variant="default" />;
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box bgcolor="grey.50">
        <Stack spacing={3} p={3}>
          {/* 상단 입력 필드 섹션 */}
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
            {/* 왼쪽 열 */}
            <Stack spacing={2} sx={{ flex: 1 }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Typography variant="subtitle2" sx={{ fontWeight: 600, minWidth: 100 }}>
                  무재해 시작일
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
              <Stack direction="row" spacing={2} alignItems="center" height={40}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, minWidth: 100 }}>
                  인증 상태
                </Typography>
                {currentStatus ? (
                  <Chip label={currentStatus} variant="outlined" color="info" size="medium" />
                ) : (
                  renderStatusBadge('pending')
                )}
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

          {/* 안내 문구 */}
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Iconify icon="solar:info-circle-bold" width={24} sx={{ color: 'grey.600', mt: 0.5 }} />
            <Typography variant="subtitle2" sx={{ fontSize: 14, lineHeight: '22px' }}>
              인증 다음 연도부터 전 직원 교육 시간이 50% 감면됩니다. <br /> 업로드한 인증서는 기관
              발급 사실과 일치해야 하며, 허위 제출 시 감면이 제한될 수 있습니다.
            </Typography>
          </Stack>

          {/* 인증 이력 테이블 섹션 */}
          <Box>
            <Box
              bgcolor="white"
              sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                인증 이력
              </Typography>
              <Button variant="contained" onClick={handleUpdate} size="medium">
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
                      등록일
                    </TableCell>
                    <TableCell sx={{ bgcolor: 'grey.100', fontWeight: 600, fontSize: 14, p: 2 }}>
                      인증일자
                    </TableCell>
                    <TableCell sx={{ bgcolor: 'grey.100', fontWeight: 600, fontSize: 14, p: 2 }}>
                      적용연도
                    </TableCell>
                    <TableCell sx={{ bgcolor: 'grey.100', fontWeight: 600, fontSize: 14, p: 2 }}>
                      인증 파일
                    </TableCell>
                    <TableCell sx={{ bgcolor: 'grey.100', fontWeight: 600, fontSize: 14, p: 2 }}>
                      상태
                    </TableCell>
                    <TableCell
                      sx={{ bgcolor: 'grey.100', fontWeight: 600, fontSize: 14, p: 2, width: 68 }}
                    >
                      &nbsp;
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedRecords.map((record) => {
                    const [regDate, regTime] = record.registrationDate.split(' ');
                    return (
                      <TableRow
                        key={record.id}
                        sx={{ borderBottom: '1px dashed', borderColor: 'divider' }}
                      >
                        <TableCell sx={{ fontSize: 14, px: 2 }}>
                          <Stack>
                            <Typography variant="body2">{regDate}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {regTime}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell sx={{ fontSize: 14, px: 2 }}>
                          <Typography variant="body2">{record.certificationDate}</Typography>
                        </TableCell>
                        <TableCell sx={{ fontSize: 14, px: 2 }}>
                          <Typography variant="body2">{record.applicationYear}</Typography>
                        </TableCell>
                        <TableCell sx={{ px: 2 }}>
                          <Stack direction="row" spacing={1} alignItems="center">
                            {uploadedFiles[record.id] || record.certificateFileName ? (
                              <Typography
                                variant="body2"
                                sx={{
                                  fontSize: 14,
                                  textDecoration: 'underline',
                                  color: 'primary.main',
                                  cursor: 'pointer',
                                }}
                                onClick={() => handleDownload(record.id)}
                              >
                                {uploadedFiles[record.id]?.name || record.certificateFileName}
                              </Typography>
                            ) : (
                              <Button
                                variant="outlined"
                                size="small"
                                onClick={() => handleFileUpload(record.id)}
                                sx={{
                                  fontSize: 14,
                                  fontWeight: 400,
                                  textTransform: 'none',
                                  borderStyle: 'dashed',
                                }}
                              >
                                파일명을 입력해주세요.
                              </Button>
                            )}
                            <input
                              ref={(el) => {
                                fileInputRefs[record.id] = el;
                              }}
                              type="file"
                              hidden
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={(e) => handleFileSelect(record.id, e)}
                            />
                            {uploadedFiles[record.id] || record.certificateFileName ? (
                              <IconButton
                                size="small"
                                onClick={() => handleDownload(record.id)}
                                sx={{ width: 22, height: 22 }}
                              >
                                <Iconify icon="solar:download-bold" width={22} />
                              </IconButton>
                            ) : null}
                          </Stack>
                        </TableCell>
                        <TableCell sx={{ px: 2 }}>{renderStatusBadge(getStatus(record))}</TableCell>
                        <TableCell sx={{ px: 2, width: 68 }}>
                          <IconButton
                            size="small"
                            onClick={() => handleDownload(record.id)}
                            sx={{ width: 22, height: 22 }}
                          >
                            <Iconify icon="solar:download-bold" width={22} />
                          </IconButton>
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

      {/* 인증 이력 업데이트 모달 */}
      <UpdateCertificationModal
        open={updateModalOpen}
        onClose={() => setUpdateModalOpen(false)}
        onSave={handleUpdateSave}
      />
    </LocalizationProvider>
  );
}
