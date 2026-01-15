import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { useState, useEffect, useMemo } from 'react';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

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
import Pagination from '@mui/material/Pagination';
import CircularProgress from '@mui/material/CircularProgress';

import { Iconify } from 'src/components/iconify';
import DialogBtn from 'src/components/safeyoui/button/dialogBtn';

import type {
  EducationReport,
  EducationRecord,
} from 'src/services/education-report/education-report.types';
import { useEducationDetail } from 'src/sections/EducationReport/hooks/use-education-report-api';
import { useAccidentFree } from 'src/sections/Organization/hooks/use-organization-api';

// 역할 한글 맵핑 함수
const getRoleLabel = (role: string): string => {
  if (!role) return '';

  const roleUpper = role.toUpperCase();
  const roleMap: { [key: string]: string } = {
    OPERATOR_MANAGER: '조직 관리자',
    MANAGEMENT_SUPERVISOR: '관리 감독자',
    SAFETY_MANAGER: '안전보건 담당자',
    WORKER: '근로자',
    ADMIN: '조직 관리자',
    MEMBER: '근로자',
    // 소문자 키 (하위 호환성)
    operator_manager: '조직 관리자',
    management_supervisor: '관리 감독자',
    safety_manager: '안전보건 담당자',
    worker: '근로자',
    admin: '조직 관리자',
    member: '근로자',
  };

  return roleMap[roleUpper] || roleMap[role] || role;
};

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
  educationReportIdx?: number | null; // educationReportIdx를 prop으로 받아서 API 호출
};

export default function EducationDetailModal({ open, onClose, educationReportIdx }: Props) {
  const [mandatoryPage, setMandatoryPage] = useState(1);
  const [regularPage, setRegularPage] = useState(1);
  const [selectedYearRange, setSelectedYearRange] = useState('current');

  const rowsPerPage = 5;

  // 교육 리포트 상세 정보 조회 (educationReportIdx 사용)
  const {
    data: educationDetailData,
    isLoading,
    error: educationError,
  } = useEducationDetail({
    educationReportIdx: educationReportIdx || 0,
  });

  useEffect(() => {
    if (open) {
      setMandatoryPage(1);
      setRegularPage(1);
      setSelectedYearRange('current');
    }
  }, [open, educationReportIdx]);

  // 디버깅: API 응답 로그
  useEffect(() => {
    if (import.meta.env.DEV && educationDetailData) {
      console.log('📚 [EducationDetailModal] Education Detail API Response:', educationDetailData);
    }
  }, [educationDetailData]);

  // 에러 처리
  useEffect(() => {
    if (educationError) {
      console.error('❌ [EducationDetailModal] Education Detail API Error:', educationError);
    }
  }, [educationError]);

  // 데이터 변환 (axios 인터셉터에서 평탄화됨)
  const educationDetail = useMemo(() => {
    // axios 인터셉터가 응답을 평탄화하므로 body가 없고 모든 필드가 최상위 레벨에 있음
    if (!educationDetailData?.header?.isSuccess || !educationDetailData) {
      if (import.meta.env.DEV && educationDetailData) {
        console.warn('⚠️ [EducationDetailModal] Invalid response structure', educationDetailData);
      }
      return {
        mandatoryEducation: [],
        regularEducation: [],
        mandatoryTotal: 0,
        regularTotal: 0,
        totalTime: 0,
        standardEducation: 0,
        report: null,
        joinDate: undefined,
        isAccidentFreeWorkplace: false,
      };
    }

    // axios 인터셉터가 평탄화했으므로 body가 아닌 최상위 레벨에서 데이터 가져오기
    const detail = educationDetailData as any;

    // 디버깅: 실제 응답 구조 확인
    if (import.meta.env.DEV) {
      console.log('🔍 [EducationDetailModal] Education Detail Structure:', detail);
    }

    // 실제 응답 구조:
    // educationRecordList: 교육 기록 배열
    // mandatoryEducation: 의무교육 총 시간 (숫자)
    // regularEducation: 정기교육 총 시간 (숫자)
    // educationType: "MANDATORY" | "REGULAR"

    const educationRecordList = Array.isArray(detail.educationRecordList)
      ? detail.educationRecordList
      : [];

    // educationType으로 의무교육과 정기교육 분리
    const mandatoryRecords = educationRecordList.filter(
      (record: any) => record.educationType === 'MANDATORY' || record.educationType === 'mandatory'
    );

    const regularRecords = educationRecordList.filter(
      (record: any) => record.educationType === 'REGULAR' || record.educationType === 'regular'
    );

    // 총 시간은 API에서 제공하는 숫자 값 사용
    const joinDate = detail.joinDate;
    // 이수 기준시간 (standardEducation 또는 totalEducation 사용)
    const standardTime =
      typeof detail.standardEducation === 'number'
        ? detail.standardEducation
        : typeof detail.totalEducation === 'number'
          ? detail.totalEducation
          : 0;

    // 리포트 정보 (사용자 정보 포함)
    const report: EducationReport | null = detail.report || {
      educationReportIdx: detail.educationReportIdx,
      memberIdx: detail.memberIdx,
      companyIdx: detail.companyIdx,
      mandatoryEducation: detail.mandatoryEducation || 0,
      regularEducation: detail.regularEducation || 0,
      totalEducation: detail.totalEducation || 0,
      standardEducation: standardTime,
      completionRate: detail.completionRate || 0,
      createAt: detail.createAt,
      memberInformation: detail.memberInformation || {
        memberIdx: detail.memberIdx || 0,
        memberName: detail.name || '',
        position: detail.position || null,
        department: detail.department || null,
        memberRole: (detail.role as any) || 'WORKER',
      },
      companyInformation: detail.companyInformation || {
        companyIdx: detail.companyIdx || 0,
        companyName: detail.organizationName || '',
      },
      // 하위 호환성
      organizationName: detail.companyInformation?.companyName || detail.organizationName,
      name: detail.memberInformation?.memberName || detail.name,
      position: detail.memberInformation?.position || detail.position,
      department: detail.memberInformation?.department || detail.department,
      role: detail.memberInformation?.memberRole || detail.role,
    };

    return {
      mandatoryEducation: mandatoryRecords,
      regularEducation: regularRecords,
      joinDate,
      standardEducation: standardTime,
      report,
      isAccidentFreeWorkplace: detail.isAccidentFreeWorkplace || false,
      companyIdx: detail.companyIdx,
    };
  }, [educationDetailData]);

  // 무재해 사업장 정보 조회 (companyIdx가 있는 경우)
  const companyIdx = educationDetail?.companyIdx;
  const { data: accidentFreeData } = useAccidentFree(companyIdx || 0);

  // 무재해 사업장 여부 확인 (API 응답 또는 교육 리포트 응답에서)
  const isAccidentFreeWorksite = useMemo(() => {
    // 1. 교육 리포트 응답에 isAccidentFreeWorkplace가 있으면 사용
    if (educationDetail?.isAccidentFreeWorkplace) {
      return true;
    }
    // 2. 무재해 인증 정보 API 응답 확인
    if (accidentFreeData) {
      const accidentFreeInfo = accidentFreeData as any;
      return accidentFreeInfo?.isAccidentFreeWorksite === 1;
    }
    return false;
  }, [educationDetail?.isAccidentFreeWorkplace, accidentFreeData]);

  const {
    report,
    mandatoryEducation: mandatoryEducationRecords,
    regularEducation: regularEducationRecords,
    joinDate,
  } = educationDetail;

  // 시간대 변환 문제 방지를 위해 날짜 부분만 추출
  const joinDateFormatted = joinDate
    ? joinDate.includes('T')
      ? joinDate.split('T')[0]
      : joinDate
    : null;
  const joinDateDayjs = joinDateFormatted ? dayjs(joinDateFormatted) : null;

  const yearOptions = useMemo(() => {
    if (!joinDateDayjs) {
      return [{ value: 'current', label: '현재' }];
    }
    return [
      { value: 'current', label: '현재' },
      { value: 'year-1', label: '1년차' },
      { value: 'year-2', label: '2년차' },
      { value: 'year-3', label: '3년차' },
    ];
  }, [joinDateDayjs]);

  type YearRange = { start: Dayjs | null; end: Dayjs | null };

  const selectedDateRange = useMemo<YearRange>(() => {
    if (!joinDateDayjs || selectedYearRange === 'current') {
      return { start: null, end: null };
    }
    const yearNumber = Number(selectedYearRange.split('-')[1]) || 1;
    const start = joinDateDayjs.startOf('day').add(yearNumber - 1, 'year');
    const end = joinDateDayjs.startOf('day').add(yearNumber, 'year').subtract(1, 'day');
    return { start, end };
  }, [joinDateDayjs, selectedYearRange]);

  const filterRecordsByRange = (records: EducationRecord[]) => {
    if (!selectedDateRange.start || !selectedDateRange.end) {
      return records;
    }
    return records.filter((record) => {
      if (!record.educationDate) return false;
      const date = dayjs(record.educationDate);
      return (
        date.isSameOrAfter(selectedDateRange.start, 'day') &&
        date.isSameOrBefore(selectedDateRange.end, 'day')
      );
    });
  };

  const filteredMandatoryRecords = filterRecordsByRange(mandatoryEducationRecords);
  const filteredRegularRecords = filterRecordsByRange(regularEducationRecords);

  const mandatoryTotalPages = Math.ceil(filteredMandatoryRecords.length / rowsPerPage);
  const regularTotalPages = Math.ceil(filteredRegularRecords.length / rowsPerPage);

  const mandatoryPaginated = filteredMandatoryRecords.slice(
    (mandatoryPage - 1) * rowsPerPage,
    mandatoryPage * rowsPerPage
  );
  const regularPaginated = filteredRegularRecords.slice(
    (regularPage - 1) * rowsPerPage,
    regularPage * rowsPerPage
  );

  const mandatoryTotal = filteredMandatoryRecords.reduce(
    (sum, record) => sum + (record.educationTime || record.educationHours || 0),
    0
  );
  const regularTotal = filteredRegularRecords.reduce(
    (sum, record) => sum + (record.educationTime || record.educationHours || 0),
    0
  );
  const totalTime = mandatoryTotal + regularTotal;
  const remainingTime = Math.max(0, (report?.standardEducation || 0) - totalTime);

  if (!educationReportIdx && !isLoading) {
    return null;
  }

  if (isLoading) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogContent sx={{ py: 8 }}>
          <Stack alignItems="center" justifyContent="center">
            <CircularProgress />
            <Typography variant="body2" sx={{ mt: 2 }}>
              교육 상세 정보를 불러오는 중...
            </Typography>
          </Stack>
        </DialogContent>
      </Dialog>
    );
  }

  if (!report) {
    return null;
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Typography component="div" variant="h6" sx={{ fontWeight: 600 }}>
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
                    {report?.memberInformation?.memberName || report?.name || '-'}
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
                    {joinDateFormatted || '-'}
                  </Typography>
                </Stack>
              </Stack>
              <Stack direction="row" justifyContent="flex-start" gap={9} spacing={8}>
                <Stack direction="row" spacing={4} alignItems="center" sx={{ minWidth: 200 }}>
                  <Typography
                    variant="subtitle2"
                    sx={{ fontSize: 14, fontWeight: 600, minWidth: 64 }}
                  >
                    소속팀
                  </Typography>
                  <Typography variant="body2" sx={{ fontSize: 14 }}>
                    {report?.memberInformation?.department || report?.department || '-'}
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
                    {getRoleLabel(report?.memberInformation?.memberRole || report?.role || '')}
                  </Typography>
                </Stack>
              </Stack>
            </Stack>
          </Box>

          {/* 교육 기록 섹션 */}
          <Stack spacing={5} sx={{ px: 3 }}>
            {/* 의무교육 이수 */}
            <Stack spacing={2.5}>
              <Stack
                spacing={1.25}
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                flexWrap="wrap"
                gap={2}
              >
                <Typography variant="h6" sx={{ fontSize: 18, fontWeight: 600 }}>
                  교육 기록
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="body2" sx={{ fontSize: 14, fontWeight: 500 }}>
                    기간 필터
                  </Typography>
                  <Select
                    size="small"
                    value={selectedYearRange}
                    onChange={(e) => {
                      setSelectedYearRange(e.target.value);
                      setMandatoryPage(1);
                      setRegularPage(1);
                    }}
                    sx={{ minWidth: 120 }}
                  >
                    {yearOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </Stack>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: 'primary.darker',
                    width: '100%',
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
                    {mandatoryPaginated.map((record: EducationRecord) => {
                      const recordId =
                        (record as any).educationRecordIdx ||
                        record.id ||
                        record.educationRecordId ||
                        String(record.memberIdx || '');
                      const currentFileName = record.fileName || '';

                      return (
                        <TableRow
                          key={recordId}
                          sx={{ borderBottom: '1px dashed', borderColor: 'divider' }}
                        >
                          <TableCell sx={{ fontSize: 14 }}>
                            {record.method || record.educationMethod || '-'}
                          </TableCell>
                          <TableCell sx={{ fontSize: 14 }}>{record.educationName || '-'}</TableCell>
                          <TableCell align="center" sx={{ fontSize: 14 }}>
                            {record.educationTime || record.educationHours || 0}
                          </TableCell>
                          <TableCell sx={{ fontSize: 14 }}>{record.educationDate || '-'}</TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography
                                sx={{
                                  flex: 1,
                                  fontSize: 14,
                                  color: currentFileName ? 'text.primary' : 'text.secondary',
                                }}
                              >
                                {currentFileName || '파일이 없습니다.'}
                              </Typography>
                              {record.fileUrl && (
                                <IconButton
                                  size="small"
                                  sx={{ width: 22, height: 22 }}
                                  onClick={() => window.open(record.fileUrl, '_blank')}
                                >
                                  <Iconify icon="solar:download-bold" width={22} />
                                </IconButton>
                              )}
                            </Box>
                          </TableCell>
                        </TableRow>
                      );
                    })}
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
                    {regularPaginated.map((record: EducationRecord) => {
                      const recordId =
                        (record as any).educationRecordIdx ||
                        record.id ||
                        record.educationRecordId ||
                        String(record.memberIdx || '');
                      const currentFileName = record.fileName || '';

                      return (
                        <TableRow
                          key={recordId}
                          sx={{ borderBottom: '1px dashed', borderColor: 'divider' }}
                        >
                          <TableCell sx={{ fontSize: 14 }}>
                            {record.method || record.educationMethod || '-'}
                          </TableCell>
                          <TableCell sx={{ fontSize: 14 }}>{record.educationName || '-'}</TableCell>
                          <TableCell align="center" sx={{ fontSize: 14 }}>
                            {record.educationTime || record.educationHours || 0}
                          </TableCell>
                          <TableCell sx={{ fontSize: 14 }}>{record.educationDate || '-'}</TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography
                                sx={{
                                  flex: 1,
                                  fontSize: 14,
                                  color: currentFileName ? 'text.primary' : 'text.secondary',
                                }}
                              >
                                {currentFileName || '파일명이 없습니다.'}
                              </Typography>
                              {record.fileUrl && (
                                <IconButton
                                  size="small"
                                  sx={{ width: 22, height: 22 }}
                                  onClick={() => window.open(record.fileUrl, '_blank')}
                                >
                                  <Iconify icon="solar:download-bold" width={22} />
                                </IconButton>
                              )}
                            </Box>
                          </TableCell>
                        </TableRow>
                      );
                    })}
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
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 3,
                  }}
                >
                  <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flex: 1 }}>
                    <TextField
                      label="총 이수시간"
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
                    <Typography
                      variant="subtitle2"
                      sx={{ fontSize: 14, fontWeight: 600, mb: 0.5 }}
                    >
                      분
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flex: 1 }}>
                    <TextField
                      label="잔여 시간"
                      value={remainingTime}
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
                    <Typography
                      variant="subtitle2"
                      sx={{ fontSize: 14, fontWeight: 600, mb: 0.5 }}
                    >
                      분
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                  <TextField
                    label="이수 기준시간"
                    value={report.standardEducation || 0}
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
              {isAccidentFreeWorksite && (
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
        </Stack>
      </DialogActions>
    </Dialog>
  );
}
