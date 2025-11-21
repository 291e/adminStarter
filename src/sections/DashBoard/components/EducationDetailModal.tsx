import { useState, useEffect, useMemo } from 'react';

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
import FormHelperText from '@mui/material/FormHelperText';

import { Iconify } from 'src/components/iconify';
import DialogBtn from 'src/components/safeyoui/button/dialogBtn';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import {
  getEducationDetail,
  updateEducationRecord,
} from 'src/services/education-report/education-report.service';
import type { UpdateEducationRecordParams } from 'src/services/education-report/education-report.types';
import { useUserProfile } from '../hooks/use-dashboard-api';

// ----------------------------------------------------------------------

export type UserProfile = {
  id: string;
  name: string;
  department: string;
  joinDate: string; // YYYY-MM-DD
  role: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onSave?: () => void;
  user: UserProfile | null;
};

export default function EducationDetailModal({ open, onClose, onSave, user }: Props) {
  const queryClient = useQueryClient();
  const [mandatoryPage, setMandatoryPage] = useState(1);
  const [regularPage, setRegularPage] = useState(1);
  const [fileNames, setFileNames] = useState<{ [key: string]: string }>({});

  const rowsPerPage = 5;

  // memberIdx 추출 (user.id를 숫자로 변환)
  // user.id는 문자열이므로 숫자로 변환 필요
  const memberIdx = user?.id ? Number(user.id) : undefined;

  // 사용자 프로필 정보 조회 (조직 정보 포함)
  const { data: profileData } = useUserProfile();

  // 디버깅: memberIdx 확인
  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('🔍 EducationDetailModal - user:', user);
      console.log('🔍 EducationDetailModal - memberIdx:', memberIdx);
    }
  }, [user, memberIdx]);

  // 교육 상세 현황 조회
  const {
    data: educationDetailData,
    isLoading,
    error: educationError,
  } = useQuery({
    queryKey: ['educationDetail', memberIdx],
    queryFn: () => {
      if (import.meta.env.DEV) {
        console.log('📡 Calling getEducationDetail with memberIdx:', memberIdx);
      }
      return getEducationDetail({ memberIdx: memberIdx! });
    },
    enabled: open && !!memberIdx && !isNaN(memberIdx),
  });

  // 파일명 저장 Mutation
  const saveFileNameMutation = useMutation({
    mutationFn: (params: UpdateEducationRecordParams) => updateEducationRecord(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['educationDetail', memberIdx] });
    },
  });

  useEffect(() => {
    if (open) {
      setMandatoryPage(1);
      setRegularPage(1);
      setFileNames({});
    }
  }, [open, user]);

  // 디버깅: API 응답 로그
  useEffect(() => {
    if (import.meta.env.DEV && educationDetailData) {
      console.log('📚 Education Detail API Response:', educationDetailData);
    }
  }, [educationDetailData]);

  // 에러 처리
  useEffect(() => {
    if (educationError) {
      console.error('❌ Education Detail API Error:', educationError);
    }
  }, [educationError]);

  // 데이터 변환 (axios 인터셉터에서 평탄화됨)
  const educationDetail = useMemo(() => {
    if (!educationDetailData?.header?.isSuccess || !educationDetailData?.educationDetail) {
      if (import.meta.env.DEV && educationDetailData) {
        console.warn('⚠️ Education Detail: Invalid response structure', educationDetailData);
      }
      return {
        mandatoryEducation: [],
        regularEducation: [],
        mandatoryTotal: 0,
        regularTotal: 0,
        totalTime: 0,
      };
    }

    const detail = educationDetailData.educationDetail as any;

    // 디버깅: 실제 응답 구조 확인
    if (import.meta.env.DEV) {
      console.log('🔍 Education Detail Structure:', detail);
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
    const mandatoryTotal =
      typeof detail.mandatoryEducation === 'number' ? detail.mandatoryEducation : 0;
    const regularTotal = typeof detail.regularEducation === 'number' ? detail.regularEducation : 0;
    const totalTime = mandatoryTotal + regularTotal;
    // 이수 기준시간 (standardEducation 또는 totalEducation 사용)
    const standardTime =
      typeof detail.standardEducation === 'number'
        ? detail.standardEducation
        : typeof detail.totalEducation === 'number'
          ? detail.totalEducation
          : 0;

    return {
      mandatoryEducation: mandatoryRecords,
      regularEducation: regularRecords,
      mandatoryTotal,
      regularTotal,
      totalTime,
      standardTime,
    };
  }, [educationDetailData]);

  // 무재해 사업장 여부 확인 (프로필 데이터에서 가져오기)
  const isAccidentFreeWorksite = useMemo(() => {
    if (profileData?.header?.isSuccess && profileData?.member) {
      return profileData.member.isAccidentFreeWorksite === 1;
    }
    return false;
  }, [profileData]);

  const handleFileNameChange = (recordId: string, value: string) => {
    setFileNames((prev) => ({ ...prev, [recordId]: value }));
  };

  const handleSave = async () => {
    try {
      // 변경된 파일명들을 저장
      const updates = Object.entries(fileNames)
        .filter(([recordId, fileName]) => fileName.trim() !== '')
        .map(([recordId, fileName]) => ({
          educationRecordId: recordId,
          fileName: fileName.trim(),
        }));

      // 각 교육 기록의 파일명 업데이트
      await Promise.all(
        updates.map((update) =>
          saveFileNameMutation.mutateAsync({
            educationRecordId: update.educationRecordId,
            fileName: update.fileName,
          })
        )
      );

      if (onSave) {
        onSave();
      }
    } catch (error) {
      console.error('❌ Error saving file names:', error);
    }
  };

  // 페이지네이션 계산
  const mandatoryStartIndex = (mandatoryPage - 1) * rowsPerPage;
  const mandatoryEndIndex = mandatoryStartIndex + rowsPerPage;
  const mandatoryDisplayed = educationDetail.mandatoryEducation.slice(
    mandatoryStartIndex,
    mandatoryEndIndex
  );
  const mandatoryTotalPages = Math.ceil(educationDetail.mandatoryEducation.length / rowsPerPage);

  const regularStartIndex = (regularPage - 1) * rowsPerPage;
  const regularEndIndex = regularStartIndex + rowsPerPage;
  const regularDisplayed = educationDetail.regularEducation.slice(
    regularStartIndex,
    regularEndIndex
  );
  const regularTotalPages = Math.ceil(educationDetail.regularEducation.length / rowsPerPage);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Typography variant="h6" component="span" sx={{ fontWeight: 600 }}>
          교육 상세 현황
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ pb: 3, px: 0 }}>
        {isLoading && (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              데이터를 불러오는 중...
            </Typography>
          </Box>
        )}
        {educationError && (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="error">
              데이터를 불러오는 중 오류가 발생했습니다.
            </Typography>
          </Box>
        )}
        {!isLoading && !educationError && (
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
                      {user?.name || '-'}
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
                      {user?.joinDate || '-'}
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
                      {user?.department || '-'}
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
                      {user?.role || '-'}
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
                    의무교육 이수: {educationDetail.mandatoryTotal}분
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
                      {mandatoryDisplayed.map((record: any) => (
                        <TableRow
                          key={record.id}
                          sx={{ borderBottom: '1px dashed', borderColor: 'divider' }}
                        >
                          <TableCell sx={{ fontSize: 14 }}>{record.method || '온라인'}</TableCell>
                          <TableCell sx={{ fontSize: 14 }}>{record.educationName}</TableCell>
                          <TableCell align="center" sx={{ fontSize: 14 }}>
                            {record.educationTime}
                          </TableCell>
                          <TableCell sx={{ fontSize: 14 }}>
                            {record.educationDate
                              ? new Date(record.educationDate).toLocaleDateString('ko-KR', {
                                  year: 'numeric',
                                  month: '2-digit',
                                  day: '2-digit',
                                })
                              : ''}
                          </TableCell>
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
                      }}
                      color="primary"
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
                  정기교육 이수: {educationDetail.regularTotal}분
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
                      {regularDisplayed.map((record: any) => (
                        <TableRow
                          key={record.id}
                          sx={{ borderBottom: '1px dashed', borderColor: 'divider' }}
                        >
                          <TableCell sx={{ fontSize: 14 }}>{record.method || '온라인'}</TableCell>
                          <TableCell sx={{ fontSize: 14 }}>{record.educationName}</TableCell>
                          <TableCell align="center" sx={{ fontSize: 14 }}>
                            {record.educationTime}
                          </TableCell>
                          <TableCell sx={{ fontSize: 14 }}>
                            {record.educationDate
                              ? new Date(record.educationDate).toLocaleDateString('ko-KR', {
                                  year: 'numeric',
                                  month: '2-digit',
                                  day: '2-digit',
                                })
                              : ''}
                          </TableCell>
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
                      }}
                      color="primary"
                    />
                  </Box>
                )}
              </Stack>

              {/* 이수 시간 요약 - Figma 디자인에 맞게 변경 */}
              <Stack spacing={3} sx={{ pt: 2 }}>
                {/* 현재 이수시간 */}
                <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-end' }}>
                  <TextField
                    label="현재 이수시간"
                    value={educationDetail.totalTime}
                    disabled
                    fullWidth
                    size="medium"
                    sx={{
                      '& .MuiInputBase-input': {
                        fontSize: 15,
                        lineHeight: '24px',
                        py: 2,
                      },
                      '& .MuiInputLabel-root': {
                        fontSize: 12,
                        lineHeight: '18px',
                      },
                    }}
                  />
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontSize: 14,
                      fontWeight: 600,
                      lineHeight: '22px',
                      mb: 2,
                      minWidth: 'fit-content',
                    }}
                  >
                    분
                  </Typography>
                </Box>

                {/* 이수 기준시간 */}
                <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-end' }}>
                  <TextField
                    label="이수 기준시간"
                    value={educationDetail.standardTime}
                    disabled
                    fullWidth
                    size="medium"
                    sx={{
                      '& .MuiInputBase-input': {
                        fontSize: 15,
                        lineHeight: '24px',
                        py: 2,
                      },
                      '& .MuiInputLabel-root': {
                        fontSize: 12,
                        lineHeight: '18px',
                      },
                    }}
                  />
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontSize: 14,
                      fontWeight: 600,
                      lineHeight: '22px',
                      mb: 2,
                      minWidth: 'fit-content',
                    }}
                  >
                    분
                  </Typography>
                </Box>

                {/* Helper Text - 무재해 사업장인 경우에만 표시 */}
                {isAccidentFreeWorksite && (
                  <FormHelperText
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      fontSize: 12,
                      lineHeight: '18px',
                      color: 'text.secondary',
                    }}
                  >
                    <Iconify icon="solar:info-circle-bold" width={16} sx={{ opacity: 0.4 }} />
                    무재해 사업장 감면 혜택이 적용되었습니다.
                  </FormHelperText>
                )}
              </Stack>
            </Stack>
          </Stack>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 3 }}>
        <Box sx={{ flex: 1 }} />
        <Stack direction="row" spacing={1.5}>
          <DialogBtn variant="outlined" onClick={onClose} sx={{ minHeight: 36, fontSize: 14 }}>
            닫기
          </DialogBtn>
          <DialogBtn
            variant="contained"
            onClick={handleSave}
            disabled={saveFileNameMutation.isPending}
            sx={{ minHeight: 36, fontSize: 14 }}
          >
            {saveFileNameMutation.isPending ? '저장 중...' : '저장'}
          </DialogBtn>
        </Stack>
      </DialogActions>
    </Dialog>
  );
}
