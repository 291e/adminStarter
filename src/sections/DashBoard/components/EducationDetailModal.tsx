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

import {
  mockMandatoryEducationRecords,
  mockRegularEducationRecords,
} from 'src/_mock/_education-report';

export default function EducationDetailModal({ open, onClose, onSave, user }: Props) {
  const [mandatoryPage, setMandatoryPage] = useState(1);
  const [regularPage, setRegularPage] = useState(1);
  const [fileNames, setFileNames] = useState<{ [key: string]: string }>({});

  const rowsPerPage = 5;

  useEffect(() => {
    if (open) {
      // TODO: TanStack Query Hook(useQuery)으로 사용자 교육 상세 정보 가져오기
      // const { data: educationDetail } = useQuery({
      //   queryKey: ['educationDetail', user?.id],
      //   queryFn: () => fetchEducationDetail(user?.id),
      // });

      setMandatoryPage(1);
      setRegularPage(1);
      setFileNames({});
    }
  }, [open, user]);

  const handleFileNameChange = (recordId: string, value: string) => {
    setFileNames((prev) => ({ ...prev, [recordId]: value }));
  };

  const handleSave = () => {
    // TODO: TanStack Query Hook(useMutation)으로 교육 기록 파일명 저장
    // const saveMutation = useMutation({
    //   mutationFn: (data: { recordId: string; fileName: string }[]) => saveEducationFileNames(data),
    //   onSuccess: () => {
    //     queryClient.invalidateQueries({ queryKey: ['educationDetail', user?.id] });
    //   },
    // });
    // saveMutation.mutate(Object.entries(fileNames).map(([recordId, fileName]) => ({ recordId, fileName })));

    if (onSave) {
      onSave();
    }
  };

  // 목업 데이터 가져오기
  const MOCK_MANDATORY_EDUCATION = mockMandatoryEducationRecords(5);
  const MOCK_REGULAR_EDUCATION = mockRegularEducationRecords(5);

  // 의무교육 계산
  const mandatoryTotal = MOCK_MANDATORY_EDUCATION.reduce(
    (sum, record) => sum + record.educationTime,
    0
  );
  const mandatoryStartIndex = (mandatoryPage - 1) * rowsPerPage;
  const mandatoryEndIndex = mandatoryStartIndex + rowsPerPage;
  const mandatoryDisplayed = MOCK_MANDATORY_EDUCATION.slice(mandatoryStartIndex, mandatoryEndIndex);
  const mandatoryTotalPages = Math.ceil(MOCK_MANDATORY_EDUCATION.length / rowsPerPage);

  // 정기교육 계산
  const regularTotal = MOCK_REGULAR_EDUCATION.reduce(
    (sum, record) => sum + record.educationTime,
    0
  );
  const regularStartIndex = (regularPage - 1) * rowsPerPage;
  const regularEndIndex = regularStartIndex + rowsPerPage;
  const regularDisplayed = MOCK_REGULAR_EDUCATION.slice(regularStartIndex, regularEndIndex);
  const regularTotalPages = Math.ceil(MOCK_REGULAR_EDUCATION.length / rowsPerPage);

  // 총 이수 시간
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
                    {mandatoryDisplayed.map((record) => (
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
                      // queryClient.invalidateQueries({ queryKey: ['mandatoryEducation', user?.id, page] });
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
                    {regularDisplayed.map((record) => (
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
                      // queryClient.invalidateQueries({ queryKey: ['regularEducation', user?.id, page] });
                    }}
                    color="primary"
                  />
                </Box>
              )}
            </Stack>

            {/* 이수 시간 요약 */}
            <Box
              sx={{
                bgcolor: 'grey.50',
                border: '1px solid',
                borderColor: 'grey.200',
                borderRadius: 1,
                p: 1.5,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Typography variant="subtitle2" sx={{ fontSize: 14, fontWeight: 600 }}>
                이수 시간
              </Typography>
              <Typography variant="body1" sx={{ fontSize: 16, fontWeight: 600 }}>
                총 {totalTime}분
              </Typography>
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
