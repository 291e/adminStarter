import { useState, useEffect } from 'react';
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
import Checkbox from '@mui/material/Checkbox';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type EducationVideo = {
  id: string;
  number: number;
  category: string;
  title: string;
  duration: string; // "16:24:22" 형식
  hasSubtitle: boolean;
  summary: string; // 교육내용에 자동 입력될 요약 내용
};

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: (video: { title: string; summary: string }) => void;
};

// TODO: TanStack Query Hook(useQuery)으로 교육영상 목록 조회
// const { data: educationVideos } = useQuery({
//   queryKey: ['education-videos'],
//   queryFn: () => getEducationVideos(),
// });

// 임시 목업 데이터 (API 연동 전까지 사용)
const MOCK_EDUCATION_VIDEOS: EducationVideo[] = [
  {
    id: '1',
    number: 1,
    category: '개인정보보호교육',
    title: '아크릴로니트릴_10분작업안전',
    duration: '16:24:22',
    hasSubtitle: true,
    summary:
      '아크릴로니트릴의 특성과 위험성, 작업 시 주의사항, 개인보호구 착용법, 비상대응 절차 등에 대한 안전 교육 내용입니다.',
  },
  {
    id: '2',
    number: 2,
    category: '화학물질 안전관리',
    title: '화학물질 안전관리',
    duration: '12:30:15',
    hasSubtitle: true,
    summary:
      '화학물질의 분류, 라벨링, 안전보관 방법, 노출 시 대응 절차, 보호구 선택 및 착용법에 대한 교육 내용입니다.',
  },
  {
    id: '3',
    number: 3,
    category: '개인보호구 착용법',
    title: '개인보호구 착용법',
    duration: '08:45:30',
    hasSubtitle: true,
    summary:
      '안전모, 안전화, 보호복, 장갑, 호흡보호구 등 각종 개인보호구의 올바른 착용 방법과 점검 사항에 대한 교육 내용입니다.',
  },
  {
    id: '4',
    number: 4,
    category: '비상대응 절차',
    title: '비상대응 절차',
    duration: '15:20:10',
    hasSubtitle: true,
    summary:
      '화재, 화학물질 누출, 인체 노출 등 각종 비상상황 발생 시 대응 절차, 신고 방법, 대피 경로 등에 대한 교육 내용입니다.',
  },
  {
    id: '5',
    number: 5,
    category: '작업안전수칙',
    title: '작업안전수칙',
    duration: '10:15:45',
    hasSubtitle: false,
    summary:
      '일반 작업 시 준수해야 할 안전수칙, 위험요인 인식, 안전작업 절차, 사고 예방 방법에 대한 교육 내용입니다.',
  },
];

export default function EducationVideoSelectModal({ open, onClose, onConfirm }: Props) {
  const [page, setPage] = useState(1);
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const rowsPerPage = 10;

  // 모달이 열릴 때 선택 상태 초기화
  useEffect(() => {
    if (open) {
      setSelectedVideoId(null);
      setCategoryFilter('');
      setSearchQuery('');
      setPage(1);
    }
  }, [open]);

  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const handleRowClick = (video: EducationVideo) => {
    setSelectedVideoId(video.id);
  };

  const handleConfirm = () => {
    if (selectedVideoId) {
      const selectedVideo = MOCK_EDUCATION_VIDEOS.find((v) => v.id === selectedVideoId);
      if (selectedVideo) {
        onConfirm(selectedVideo);
        onClose();
      }
    }
  };

  // 카테고리 목록 추출
  const categories = Array.from(new Set(MOCK_EDUCATION_VIDEOS.map((v) => v.category)));

  // 필터링된 비디오 목록
  const filteredVideos = MOCK_EDUCATION_VIDEOS.filter((video) => {
    const matchesCategory = !categoryFilter || video.category === categoryFilter;
    const matchesSearch =
      !searchQuery || video.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

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
        {/* 검색 필드 */}
        <Box sx={{ display: 'flex', gap: 2, pb: 2.5, pt: 0 }}>
          <FormControl size="medium" sx={{ minWidth: 160 }}>
            <Select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(1);
              }}
              displayEmpty
            >
              <MenuItem value="">카테고리</MenuItem>
              {categories.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            size="medium"
            placeholder="검색어"
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
                  onClick={() => handleRowClick(video)}
                  sx={{
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'action.hover' },
                    bgcolor: selectedVideoId === video.id ? 'action.selected' : 'transparent',
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
                    <Checkbox
                      checked={selectedVideoId === video.id}
                      onChange={() => handleRowClick(video)}
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
                        <Iconify icon="eva:checkmark-fill" width={20} sx={{ color: 'info.main' }} />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination count={totalPages} page={page} onChange={handlePageChange} />
        </Box>
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
