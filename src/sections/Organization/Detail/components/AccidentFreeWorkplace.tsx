import { useState, useMemo, useEffect } from 'react';
import dayjs, { type Dayjs } from 'dayjs';

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
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

import { Iconify } from 'src/components/iconify';
import Button from '@mui/material/Button';
import Badge from 'src/components/safeyoui/badge';

import { useAccidentFree } from '../../hooks/use-organization-api';
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
  status?: string; // API 응답의 status 필드 (PENDING, APPROVED, REJECTED 등)
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

  const companyIdx = organizationId ? parseInt(organizationId, 10) : 0;

  // 무재해 인증 정보 조회
  const {
    data: accidentFreeData,
    isLoading: isLoadingAccidentFree,
    isError: isErrorAccidentFree,
  } = useAccidentFree(companyIdx);

  // API 응답 데이터 추출 (axios interceptor가 평탄화하므로 직접 접근)
  const accidentFreeInfo = accidentFreeData as any;

  // 디버깅
  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('🔍 [AccidentFreeWorkplace] 무재해 인증 정보', {
        companyIdx,
        accidentFreeData,
        accidentFreeInfo,
        historyList: accidentFreeInfo?.historyList,
        isLoadingAccidentFree,
        isErrorAccidentFree,
      });
    }
  }, [companyIdx, accidentFreeData, accidentFreeInfo, isLoadingAccidentFree, isErrorAccidentFree]);

  // 무재해 인증 정보에서 데이터 추출
  const accidentFreeStatus = accidentFreeInfo?.accidentFreeStatus || null;
  const accidentFreeCertifiedAt = accidentFreeInfo?.accidentFreeCertifiedAt
    ? dayjs(accidentFreeInfo.accidentFreeCertifiedAt)
    : null;
  const accidentFreeExpiresAt = accidentFreeInfo?.accidentFreeExpiresAt
    ? dayjs(accidentFreeInfo.accidentFreeExpiresAt)
    : null;
  const industrialAccidents = accidentFreeInfo?.industrialAccidentCount || 0;
  const nearMissAccidents = accidentFreeInfo?.nearMissCount || 0;

  // 무재해 시작일 설정 (인증일자 기준)
  const initialStartDate = useMemo(() => {
    if (accidentFreeCertifiedAt) {
      return accidentFreeCertifiedAt;
    }
    return null;
  }, [accidentFreeCertifiedAt]);

  // 다음 달성일 설정 (만료일 기준)
  const initialAchievementDate = useMemo(() => {
    if (accidentFreeExpiresAt) {
      return accidentFreeExpiresAt;
    }
    return null;
  }, [accidentFreeExpiresAt]);

  // 인증 상태 표시
  const currentStatus = useMemo(() => {
    if (accidentFreeStatus === 'APPROVED' && accidentFreeCertifiedAt) {
      const year = accidentFreeCertifiedAt.year();
      return `${year}년 무재해 사업장`;
    }
    return null;
  }, [accidentFreeStatus, accidentFreeCertifiedAt]);

  // 무재해 일수 계산 (시작일부터 현재 날짜까지, 단 다음 달성일이 있으면 그 날짜까지만)
  const accidentFreeDays = useMemo(() => {
    if (!startDate) return 0;

    // 현재 날짜 (자정으로 정규화)
    const today = dayjs().startOf('day');

    // 시작일을 자정으로 정규화
    const normalizedStartDate = startDate.startOf('day');

    // 다음 달성일(만료일)이 있고, 현재 날짜보다 이전이면 만료일까지만 카운트
    // 다음 달성일이 없거나 현재 날짜보다 이후면 현재 날짜까지 카운트
    const endDate =
      accidentFreeExpiresAt && accidentFreeExpiresAt.startOf('day').isBefore(today)
        ? accidentFreeExpiresAt.startOf('day')
        : today;

    const days = endDate.diff(normalizedStartDate, 'day');
    return Math.max(0, days);
  }, [startDate, accidentFreeExpiresAt]);

  // 시작일 초기화
  useEffect(() => {
    if (initialStartDate && !startDate) {
      setStartDate(initialStartDate);
    }
  }, [initialStartDate, startDate]);

  // 다음 달성일 초기화
  useEffect(() => {
    if (initialAchievementDate && !achievementDate) {
      setAchievementDate(initialAchievementDate);
    }
  }, [initialAchievementDate, achievementDate]);

  // API 응답의 historyList를 CertificationRecord 타입으로 변환
  const certificationRecords: CertificationRecord[] = useMemo(() => {
    const historyList = accidentFreeInfo?.historyList || [];

    if (!historyList || historyList.length === 0) {
      return [];
    }

    const records = historyList.map((history: any, index: number) => {
      const registeredAt = history.registeredAt
        ? dayjs(history.registeredAt).format('YYYY-MM-DD HH:mm:ss')
        : '';
      const certifiedAt = history.certifiedAt
        ? dayjs(history.certifiedAt).format('YYYY-MM-DD')
        : '';
      const appliedYear =
        history.appliedYear && history.appliedYear > 0 ? `${history.appliedYear}년` : undefined; // appliedYear가 0이거나 없으면 undefined (검토 대기)

      // 파일명 추출 (fileUrl에서)
      const certificateFileName = history.fileUrl
        ? history.fileUrl.split('/').pop() || undefined
        : undefined;

      return {
        id: `history-${index}`,
        registrationDate: registeredAt,
        certificationDate: certifiedAt,
        applicationYear: appliedYear,
        certificateFileName,
        accidentFreeYear:
          history.appliedYear && history.appliedYear > 0 ? history.appliedYear : null,
        status: history.status || 'PENDING', // API 응답의 status 필드 추가
      };
    });

    // 디버깅
    if (import.meta.env.DEV) {
      console.log('🔍 [AccidentFreeWorkplace] 인증 이력 변환', {
        historyList,
        certificationRecords: records,
      });
    }

    return records;
  }, [accidentFreeInfo?.historyList]);

  const paginatedRecords = certificationRecords.slice(page * rowsPerPage, (page + 1) * rowsPerPage);

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
    // API 응답의 status 필드가 있으면 우선 사용
    if (record.status) {
      const statusUpper = record.status.toUpperCase();
      if (statusUpper === 'APPROVED') {
        // APPROVED인 경우 적용 연도로 유효/만료 판단
        if (!record.applicationYear) {
          return 'pending';
        }
        const applicationYearNum = extractYear(record.applicationYear);
        if (applicationYearNum === null) {
          return 'pending';
        }
        if (applicationYearNum === currentYear) {
          return 'valid';
        }
        return 'expired';
      }
      if (statusUpper === 'PENDING') {
        return 'pending';
      }
      if (statusUpper === 'REJECTED') {
        return 'expired';
      }
    }

    // status 필드가 없으면 기존 로직 사용
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

  // 로딩 상태
  if (isLoadingAccidentFree) {
    return (
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Box bgcolor="grey.50">
          <Stack spacing={3} p={3}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: 200,
              }}
            >
              <CircularProgress />
            </Box>
          </Stack>
        </Box>
      </LocalizationProvider>
    );
  }

  // 에러 상태
  if (isErrorAccidentFree) {
    return (
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Box bgcolor="grey.50">
          <Stack spacing={3} p={3}>
            <Alert severity="error">무재해 인증 정보를 불러오는 중 오류가 발생했습니다.</Alert>
          </Stack>
        </Box>
      </LocalizationProvider>
    );
  }

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
                  disabled
                  slotProps={{
                    textField: {
                      size: 'small',
                      sx: {
                        flex: 1,
                        bgcolor: 'common.white',
                        pointerEvents: 'none',
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
                ) : accidentFreeStatus === 'PENDING' ? (
                  renderStatusBadge('pending')
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    인증 정보 없음
                  </Typography>
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
                  disabled
                  sx={{
                    flex: 1,
                    bgcolor: 'common.white',
                    pointerEvents: 'none',
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
                  disabled
                  sx={{
                    flex: 1,
                    bgcolor: 'common.white',
                    pointerEvents: 'none',
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
                  disabled
                  slotProps={{
                    textField: {
                      size: 'small',
                      sx: {
                        flex: 1,
                        bgcolor: 'common.white',
                        pointerEvents: 'none',
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
                  disabled
                  sx={{
                    flex: 1,
                    bgcolor: 'common.white',
                    pointerEvents: 'none',
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
                    <TableCell
                      align="left"
                      sx={{
                        bgcolor: 'grey.100',
                        fontWeight: 600,
                        fontSize: 14,
                        p: 2,
                        width: 120,
                        minWidth: 120,
                        maxWidth: 120,
                      }}
                    >
                      등록일
                    </TableCell>
                    <TableCell
                      align="left"
                      sx={{
                        bgcolor: 'grey.100',
                        fontWeight: 600,
                        fontSize: 14,
                        p: 2,
                        width: 120,
                        minWidth: 120,
                        maxWidth: 120,
                      }}
                    >
                      인증일자
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        bgcolor: 'grey.100',
                        fontWeight: 600,
                        fontSize: 14,
                        p: 2,
                        width: 100,
                        minWidth: 100,
                        maxWidth: 100,
                      }}
                    >
                      적용연도
                    </TableCell>
                    <TableCell
                      align="left"
                      sx={{
                        bgcolor: 'grey.100',
                        fontWeight: 600,
                        fontSize: 14,
                        p: 2,
                        width: 'auto',
                      }}
                    >
                      인증 파일
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        bgcolor: 'grey.100',
                        fontWeight: 600,
                        fontSize: 14,
                        p: 2,
                        width: 100,
                        minWidth: 100,
                        maxWidth: 100,
                      }}
                    >
                      상태
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
                        <TableCell align="left">
                          <Stack>
                            <Typography variant="body2">{regDate}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {regTime}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell align="left">
                          <Typography variant="body2">{record.certificationDate}</Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body2">{record.applicationYear}</Typography>
                        </TableCell>
                        <TableCell align="left" sx={{ px: 2, width: 'auto' }}>
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
                        <TableCell align="center">{renderStatusBadge(getStatus(record))}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              {/* 페이지네이션 */}
              <AccidentFreeWorkplacePagination
                count={certificationRecords.length}
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
