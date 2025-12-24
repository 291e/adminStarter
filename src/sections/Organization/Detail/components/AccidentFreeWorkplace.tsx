import type { ChangeEvent } from 'react';
import React, { useState, useMemo, useEffect, useCallback } from 'react';
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
import Tooltip from '@mui/material/Tooltip';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

import { Iconify } from 'src/components/iconify';
import Button from '@mui/material/Button';
import Badge from 'src/components/safeyoui/badge';

import { useAccidentFree } from '../../hooks/use-organization-api';
import AccidentFreeWorkplacePagination from './AccidentFreeWorkplacePagination';
import UpdateCertificationModal from './UpdateCertificationModal';
import EditCertificationRecordModal from './EditCertificationRecordModal';

// 적용 연도에서 연도 추출 (예: "2026년" -> 2026)
const extractYear = (applicationYear: string | undefined): number | null => {
  if (!applicationYear) return null;
  const match = applicationYear.match(/(\d{4})년/);
  return match ? parseInt(match[1], 10) : null;
};

// ----------------------------------------------------------------------

type CertificationRecord = {
  id: string;
  registrationDate: string; // YYYY-MM-DD HH:mm:ss
  certificationDate: string; // YYYY-MM-DD HH:mm:ss
  applicationYear?: string; // YYYY년 (없으면 검토 대기)
  certificateFileName?: string;
  accidentFreeYear?: number | null;
  status?: string; // API 응답의 status 필드 (PENDING, APPROVED, REJECTED 등)
  fileUrl?: string; // 원본 파일 URL
};

type StatusType = 'valid' | 'pending' | 'expired';

type Props = {
  organizationId?: string;
};

export default function AccidentFreeWorkplace({ organizationId }: Props) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [uploadedFiles, setUploadedFiles] = useState<{ [key: string]: File | null }>({});
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<CertificationRecord | null>(null);

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
  const industrialAccidents = accidentFreeInfo?.industrialAccidentCount || 0;
  const nearMissAccidents = accidentFreeInfo?.nearMissCount || 0;

  // 현재 연도 가져오기
  const currentYear = useMemo(() => new Date().getFullYear(), []);

  // 상태 계산 함수
  const getStatus = useCallback(
    (record: CertificationRecord): StatusType => {
      // API 응답의 status 필드가 있으면 우선 사용
      if (record.status) {
        const statusUpper = record.status.toUpperCase();

        // PENDING 상태는 항상 검토 대기
        if (statusUpper === 'PENDING') {
          return 'pending';
        }

        // REJECTED 상태는 항상 만료
        if (statusUpper === 'REJECTED') {
          return 'expired';
        }

        // APPROVED인 경우 적용 연도로 유효/만료 판단
        if (statusUpper === 'APPROVED') {
          // 적용 연도가 없으면 검토 대기
          if (!record.applicationYear) {
            return 'pending';
          }

          const applicationYearNum = extractYear(record.applicationYear);

          // 적용 연도를 추출할 수 없으면 검토 대기
          if (applicationYearNum === null) {
            return 'pending';
          }

          // 적용 연도가 현재 연도와 같거나 미래이면 유효
          if (applicationYearNum >= currentYear) {
            return 'valid';
          }

          // 적용 연도가 현재 연도보다 과거이면 만료
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

      // 적용 연도가 현재 연도와 같거나 미래이면 유효
      if (applicationYearNum >= currentYear) {
        return 'valid';
      }

      // 적용 연도가 현재 연도보다 과거이면 만료
      return 'expired';
    },
    [currentYear]
  );

  // 인증 상태 표시
  const currentStatus = useMemo(() => {
    if (accidentFreeStatus === 'APPROVED' && accidentFreeCertifiedAt) {
      const year = accidentFreeCertifiedAt.year();
      return `${year}년 무재해 사업장`;
    }
    return null;
  }, [accidentFreeStatus, accidentFreeCertifiedAt]);

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
      const computedAppliedYear = (() => {
        if (history.certifiedAt) {
          const oneYearLater = dayjs(history.certifiedAt).add(1, 'year');
          if (oneYearLater.isValid()) {
            return `${oneYearLater.year()}년`;
          }
        }
        if (history.appliedYear && history.appliedYear > 0) {
          return `${history.appliedYear}년`;
        }
        return undefined;
      })();

      // 파일명 추출 (fileUrl에서)
      const certificateFileName = history.fileUrl
        ? history.fileUrl.split('/').pop() || undefined
        : undefined;

      return {
        id: `history-${index}`,
        registrationDate: registeredAt,
        certificationDate: certifiedAt,
        applicationYear: computedAppliedYear,
        certificateFileName,
        accidentFreeYear:
          history.appliedYear && history.appliedYear > 0 ? history.appliedYear : null,
        status: history.status || 'PENDING',
        fileUrl: history.fileUrl,
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

  const isCurrentlyValid = useMemo(() => {
    if (certificationRecords.length === 0) return false;
    // 최신 기록 중 하나라도 유효한 상태가 있으면 감면 중으로 판단
    return certificationRecords.some((record) => getStatus(record) === 'valid');
  }, [certificationRecords, getStatus]);

  const paginatedRecords = certificationRecords.slice(page * rowsPerPage, (page + 1) * rowsPerPage);

  const handleChangePage = (newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (rows: number) => {
    setRowsPerPage(rows);
    setPage(0);
  };

  const handleUpdate = () => {
    setUpdateModalOpen(true);
  };

  const handleEditRecord = (record: CertificationRecord) => {
    setSelectedRecord(record);
    setEditModalOpen(true);
  };

  const handleUpdateSave = (data: { certificationDate: Dayjs | null; file: File | null }) => {
    console.log('인증 이력 업데이트:', data);
  };

  const fileInputRefs: { [key: string]: HTMLInputElement | null } = {};

  const handleFileUpload = (recordId: string) => {
    fileInputRefs[recordId]?.click();
  };

  const handleFileSelect = (recordId: string, event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFiles((prev) => ({ ...prev, [recordId]: file }));
      console.log('파일 업로드:', recordId, file.name);
    }
  };

  const handleDownload = (recordId: string) => {
    console.log('다운로드:', recordId);
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
          <Stack spacing={2.5}>
            {/* 첫 번째 행 - 인증 상태 단독 */}
            <Stack direction="row" spacing={2} alignItems="center" height={40}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, minWidth: 100 }}>
                인증 상태
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                {currentStatus ? (
                  <Chip label={currentStatus} variant="outlined" color="info" size="medium" />
                ) : accidentFreeStatus === 'PENDING' ? (
                  renderStatusBadge('pending')
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    인증 정보 없음
                  </Typography>
                )}
                <Tooltip
                  title={
                    isCurrentlyValid
                      ? '무재해 감면 혜택을 받고 있어 업데이트가 불가능합니다.'
                      : '무재해 인증 정보를 업데이트합니다.'
                  }
                  arrow
                  placement="top"
                >
                  <Box component="span" sx={{ display: 'inline-flex' }}>
                    <IconButton
                      onClick={handleUpdate}
                      size="small"
                      sx={{ color: 'text.secondary' }}
                      disabled={isCurrentlyValid}
                    >
                      <Iconify icon="solar:pen-bold" width={18} />
                    </IconButton>
                  </Box>
                </Tooltip>
              </Stack>
            </Stack>

            {/* 두 번째 행 - 산업재해 및 아차사고 나란히 배치 */}
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ flex: 1 }}>
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
              <Stack direction="row" spacing={2} alignItems="center" sx={{ flex: 1 }}>
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
              <Tooltip
                title={
                  isCurrentlyValid
                    ? '무재해 감면 혜택을 받고 있어 업데이트가 불가능합니다.'
                    : '무재해 인증 정보를 업데이트합니다.'
                }
                arrow
                placement="top"
              >
                <Box component="span" sx={{ display: 'inline-flex' }}>
                  <Button
                    variant="contained"
                    onClick={handleUpdate}
                    size="medium"
                    disabled={isCurrentlyValid}
                  >
                    업데이트
                  </Button>
                </Box>
              </Tooltip>
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
                    <TableCell
                      align="center"
                      sx={{
                        bgcolor: 'grey.100',
                        fontWeight: 600,
                        fontSize: 14,
                        p: 2,
                        width: 48,
                        minWidth: 48,
                        maxWidth: 48,
                      }}
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
                        <TableCell align="center">
                          <IconButton
                            onClick={() => handleEditRecord(record)}
                            size="small"
                            sx={{ color: 'text.secondary' }}
                          >
                            <Iconify icon="solar:pen-bold" width={18} />
                          </IconButton>
                        </TableCell>
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
        companyIdx={companyIdx}
        defaultCertifiedAt={accidentFreeInfo?.accidentFreeCertifiedAt ?? null}
        defaultExpiresAt={accidentFreeInfo?.accidentFreeExpiresAt ?? null}
        defaultStatus={accidentFreeInfo?.accidentFreeStatus ?? 'APPROVED'}
        defaultFileUrl={accidentFreeInfo?.accidentFreeFileUrl ?? null}
        onSave={handleUpdateSave}
        onUpdated={() => setUpdateModalOpen(false)}
      />

      {/* 인증 이력 수정 모달 */}
      <EditCertificationRecordModal
        open={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedRecord(null);
        }}
        companyIdx={companyIdx}
        record={selectedRecord}
        onUpdated={() => {
          setEditModalOpen(false);
          setSelectedRecord(null);
        }}
      />
    </LocalizationProvider>
  );
}
