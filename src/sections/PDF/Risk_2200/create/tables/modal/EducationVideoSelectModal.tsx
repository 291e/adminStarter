import { useState, useEffect, useMemo } from 'react';
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
import IconButton from '@mui/material/IconButton';
import Pagination from '@mui/material/Pagination';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputAdornment from '@mui/material/InputAdornment';
import Radio from '@mui/material/Radio';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';

import { Iconify } from 'src/components/iconify';
import { useLibraryReports } from 'src/sections/LibraryReport/hooks/use-library-report-api';
import type { LibraryReport } from 'src/services/library-report/library-report.types';

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: (video: { title: string; summary: string; vodIdx?: number }) => void;
};

export default function EducationVideoSelectModal({ open, onClose, onConfirm }: Props) {
  const [page, setPage] = useState(1);
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const rowsPerPage = 10;

  // 라이브러리 리포트 목록 조회
  const {
    data: reportsData,
    isLoading,
    isError,
  } = useLibraryReports({
    status: 'active', // 활성화된 항목만 조회
  });

  // 모달이 열릴 때 선택 상태 초기화
  useEffect(() => {
    if (open) {
      setSelectedVideoId(null);
      setCategoryFilter('');
      setSearchQuery('');
      setPage(1);
    }
  }, [open]);

  // 라이브러리 리포트를 EducationVideo 형식으로 변환
  const educationVideos = useMemo(() => {
    if (!reportsData?.libraryReports) return [];
    return reportsData.libraryReports.map((report: LibraryReport, index: number) => ({
      id: report.id || String(report.libraryReportIdx || index),
      libraryReportIdx: report.libraryReportIdx,
      vodIdx: report.vodIdx, // VOD Index 추가
      number: index + 1,
      category: report.libraryReportCategoryInformation?.name || '미분류',
      title: report.title || '',
      duration: report.playbackTime || '00:00:00',
      hasSubtitle: report.hasSubtitles || false,
      summary: report.description || report.memo || '',
    }));
  }, [reportsData]);

  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const handleRowClick = (videoId: string) => {
    setSelectedVideoId(videoId);
  };

  const handleConfirm = () => {
    if (selectedVideoId) {
      const selectedVideo = educationVideos.find((v) => v.id === selectedVideoId);
      if (selectedVideo) {
        onConfirm({
          title: selectedVideo.title,
          summary: selectedVideo.summary,
          vodIdx: selectedVideo.vodIdx,
        });
        onClose();
      }
    }
  };

  // 카테고리 목록 추출
  const categories = useMemo(
    () => Array.from(new Set(educationVideos.map((v) => v.category))).sort(),
    [educationVideos]
  );

  // 필터링된 비디오 목록
  const filteredVideos = useMemo(
    () =>
      educationVideos.filter((video) => {
        const matchesCategory = !categoryFilter || video.category === categoryFilter;
        const matchesSearch =
          !searchQuery || video.title.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
      }),
    [educationVideos, categoryFilter, searchQuery]
  );

  const startIndex = (page - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedVideos = filteredVideos.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredVideos.length / rowsPerPage);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle
        sx={{
          fontSize: 18,
          fontWeight: 600,
          pb: 2,
          px: 3,
          pt: 3,
        }}
      >
        교육 영상 선택하기
      </DialogTitle>

      <DialogContent sx={{ px: 3, pt: 0 }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
            <CircularProgress />
          </Box>
        ) : isError ? (
          <Alert severity="error" sx={{ my: 2 }}>
            교육영상 목록을 불러오는 중 오류가 발생했습니다.
          </Alert>
        ) : (
          <>
            {/* 검색 필드 */}
            <Box sx={{ display: 'flex', gap: 2, pb: 2.5, pt: 0 }}>
              <FormControl size="small" sx={{ minWidth: 160 }}>
                <Select
                  value={categoryFilter}
                  onChange={(e) => {
                    setCategoryFilter(e.target.value);
                    setPage(1);
                  }}
                  displayEmpty
                >
                  <MenuItem value="">전체 카테고리</MenuItem>
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                size="small"
                placeholder="제목 검색"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Iconify icon="eva:search-fill" width={24} sx={{ color: 'primary.main' }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            {filteredVideos.length === 0 ? (
              <Alert severity="info" sx={{ my: 2 }}>
                조회된 교육영상이 없습니다.
              </Alert>
            ) : (
              <>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell
                          sx={{
                            bgcolor: 'grey.100',
                            fontSize: 14,
                            fontWeight: 600,
                            color: 'text.secondary',
                            width: 72,
                            minWidth: 72,
                            py: 2,
                            px: 1,
                          }}
                        >
                          &nbsp;
                        </TableCell>
                        <TableCell
                          sx={{
                            bgcolor: 'grey.100',
                            fontSize: 14,
                            fontWeight: 600,
                            color: 'text.secondary',
                            width: 51,
                            minWidth: 51,
                            py: 2,
                            px: 1,
                          }}
                          align="center"
                        >
                          순번
                        </TableCell>
                        <TableCell
                          sx={{
                            bgcolor: 'grey.100',
                            fontSize: 14,
                            fontWeight: 600,
                            color: 'text.secondary',
                            width: 123,
                            minWidth: 123,
                            py: 2,
                            px: 1,
                          }}
                          align="center"
                        >
                          카테고리
                        </TableCell>
                        <TableCell
                          sx={{
                            bgcolor: 'grey.100',
                            fontSize: 14,
                            fontWeight: 600,
                            color: 'text.secondary',
                            flex: 1,
                            py: 2,
                            px: 1,
                          }}
                          align="center"
                        >
                          제목
                        </TableCell>
                        <TableCell
                          sx={{
                            bgcolor: 'grey.100',
                            fontSize: 14,
                            fontWeight: 600,
                            color: 'text.secondary',
                            width: 88,
                            minWidth: 88,
                            py: 2,
                            px: 1,
                          }}
                          align="center"
                        >
                          재생 시간
                        </TableCell>
                        <TableCell
                          sx={{
                            bgcolor: 'grey.100',
                            fontSize: 14,
                            fontWeight: 600,
                            color: 'text.secondary',
                            width: 67,
                            minWidth: 67,
                            py: 2,
                            px: 1,
                          }}
                          align="center"
                        >
                          자막
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedVideos.map((video) => (
                        <TableRow
                          key={video.id}
                          onClick={() => handleRowClick(video.id)}
                          sx={{
                            cursor: 'pointer',
                            '&:hover': { bgcolor: 'action.hover' },
                            bgcolor:
                              selectedVideoId === video.id ? 'action.selected' : 'transparent',
                          }}
                        >
                          <TableCell
                            sx={{
                              py: 1,
                              px: 1,
                              textAlign: 'center',
                            }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Radio
                              checked={selectedVideoId === video.id}
                              onChange={() => handleRowClick(video.id)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell
                            sx={{
                              fontSize: 15,
                              py: 1,
                              px: 1,
                              textAlign: 'center',
                            }}
                          >
                            {video.number}
                          </TableCell>
                          <TableCell
                            sx={{
                              fontSize: 14,
                              py: 1,
                              px: 1,
                              textAlign: 'center',
                            }}
                          >
                            {video.category}
                          </TableCell>
                          <TableCell
                            sx={{
                              fontSize: 14,
                              py: 1,
                              px: 1,
                              textAlign: 'center',
                            }}
                          >
                            {video.title}
                          </TableCell>
                          <TableCell
                            sx={{
                              fontSize: 14,
                              py: 1,
                              px: 1,
                              textAlign: 'center',
                            }}
                          >
                            {video.duration}
                          </TableCell>
                          <TableCell
                            sx={{
                              fontSize: 14,
                              py: 1,
                              px: 1,
                              textAlign: 'center',
                            }}
                          >
                            {video.hasSubtitle && (
                              <IconButton size="small" sx={{ p: 1 }}>
                                <Iconify
                                  icon="eva:checkmark-fill"
                                  width={20}
                                  sx={{ color: 'info.main' }}
                                />
                              </IconButton>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                {totalPages > 1 && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                    <Pagination count={totalPages} page={page} onChange={handlePageChange} />
                  </Box>
                )}
              </>
            )}
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 3 }}>
        <Box sx={{ display: 'flex', gap: 1, width: '100%', justifyContent: 'flex-end' }}>
          <Button onClick={onClose} variant="outlined" sx={{ minWidth: 64 }}>
            닫기
          </Button>
          <Button
            variant="contained"
            sx={{ minWidth: 64 }}
            onClick={handleConfirm}
            disabled={!selectedVideoId}
          >
            확인
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}
