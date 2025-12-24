import { useState, useCallback, useRef } from 'react';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Slider from '@mui/material/Slider';

import { Iconify } from 'src/components/iconify';
import { CONFIG } from 'src/global-config';

// ----------------------------------------------------------------------

type SampleItem = {
  url: string;
  name: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  samples: SampleItem[];
};

const getFullFileUrl = (url: string | null | undefined): string | null => {
  if (!url) return null;
  if (
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('blob:') ||
    url.startsWith('data:')
  ) {
    return url;
  }
  const baseUrl = CONFIG.serverUrl.replace(/\/$/, '');
  const path = url.startsWith('/') ? url : `/${url}`;
  return `${baseUrl}${path}`;
};

/**
 * 샘플 URL 문자열을 파싱하여 SampleItem 배열로 변환
 * 지원 형식:
 * 1. 단일 URL: "http://example.com/file.pdf"
 * 2. 콤마 구분 URL: "url1,url2,url3"
 * 3. JSON 배열: '["url1", "url2"]'
 */
export function parseSampleUrls(sampleUrl: string | null | undefined): SampleItem[] {
  if (!sampleUrl) return [];

  // JSON 배열 형식 시도
  if (sampleUrl.startsWith('[')) {
    try {
      const parsed = JSON.parse(sampleUrl);
      if (Array.isArray(parsed)) {
        return parsed.map((url: string, index: number) => ({
          url,
          name: url.split('/').pop() || `샘플 ${index + 1}`,
        }));
      }
    } catch {
      // JSON 파싱 실패시 다른 형식 시도
    }
  }

  // 콤마 구분 형식 시도
  const urls = sampleUrl
    .split(',')
    .map((u) => u.trim())
    .filter(Boolean);

  return urls.map((url, index) => ({
    url,
    name: url.split('/').pop() || `샘플 ${index + 1}`,
  }));
}

const MIN_ZOOM = 50;
const MAX_ZOOM = 300;
const ZOOM_STEP = 25;

export default function SampleViewModal({ open, onClose, samples }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [zoom, setZoom] = useState(100);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [scrollStart, setScrollStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : samples.length - 1));
    setZoom(100); // 페이지 변경 시 줌 리셋
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < samples.length - 1 ? prev + 1 : 0));
    setZoom(100); // 페이지 변경 시 줌 리셋
  };

  const handleClose = () => {
    setCurrentIndex(0);
    setZoom(100);
    onClose();
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + ZOOM_STEP, MAX_ZOOM));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - ZOOM_STEP, MIN_ZOOM));
  };

  const handleZoomReset = () => {
    setZoom(100);
  };

  const handleZoomChange = (_: Event, value: number | number[]) => {
    setZoom(value as number);
  };

  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      if (e.deltaY < 0) {
        setZoom((prev) => Math.min(prev + ZOOM_STEP, MAX_ZOOM));
      } else {
        setZoom((prev) => Math.max(prev - ZOOM_STEP, MIN_ZOOM));
      }
    }
  }, []);

  // 드래그 시작
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 100 && containerRef.current) {
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
      setScrollStart({
        x: containerRef.current.scrollLeft,
        y: containerRef.current.scrollTop,
      });
      e.preventDefault();
    }
  };

  // 드래그 중
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && containerRef.current) {
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;
      containerRef.current.scrollLeft = scrollStart.x - dx;
      containerRef.current.scrollTop = scrollStart.y - dy;
    }
  };

  // 드래그 종료
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const currentSample = samples[currentIndex];
  const fullUrl = currentSample ? getFullFileUrl(currentSample.url) : null;

  // 파일 확장자로 이미지 여부 판단
  const isImage = (url: string) => {
    const ext = url.split('.').pop()?.toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].includes(ext || '');
  };

  const isCurrentImage = currentSample && isImage(currentSample.url);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          maxHeight: '90vh',
          height: '90vh',
        },
      }}
    >
      <DialogTitle>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography
            variant="h6"
            component="div"
            sx={{ fontWeight: 600, lineHeight: '28px', letterSpacing: 0 }}
          >
            샘플 보기
          </Typography>
          {samples.length > 1 && (
            <Typography variant="body2" sx={{ color: 'text.secondary', mr: 4 }}>
              {currentIndex + 1} / {samples.length}
            </Typography>
          )}
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ position: 'relative', p: 0 }}>
        {samples.length === 0 ? (
          <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', py: 8 }}>
            등록된 샘플이 없습니다.
          </Typography>
        ) : (
          <Box sx={{ position: 'relative', minHeight: 400 }}>
            {/* 이전 버튼 */}
            {samples.length > 1 && (
              <IconButton
                onClick={handlePrev}
                sx={{
                  position: 'absolute',
                  left: 8,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 10,
                  bgcolor: 'rgba(255, 255, 255, 0.9)',
                  boxShadow: 2,
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 1)',
                  },
                }}
              >
                <Iconify icon="carbon:chevron-left" width={24} />
              </IconButton>
            )}

            {/* 콘텐츠 영역 */}
            <Box
              ref={containerRef}
              onWheel={handleWheel}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeave}
              sx={{
                display: 'flex',
                alignItems: zoom > 100 ? 'flex-start' : 'center',
                justifyContent: zoom > 100 ? 'flex-start' : 'center',
                minHeight: 660,
                maxHeight: 'calc(90vh - 150px)',
                overflow: zoom > 100 ? 'scroll' : 'auto',
                p: zoom > 100 ? 0 : 3,
                bgcolor: 'grey.100',
                cursor: zoom > 100 ? (isDragging ? 'grabbing' : 'grab') : 'default',
                userSelect: 'none',
                // 스크롤바 스타일링
                '&::-webkit-scrollbar': {
                  width: 8,
                  height: 8,
                },
                '&::-webkit-scrollbar-track': {
                  bgcolor: 'grey.200',
                },
                '&::-webkit-scrollbar-thumb': {
                  bgcolor: 'grey.400',
                  borderRadius: 4,
                  '&:hover': {
                    bgcolor: 'grey.500',
                  },
                },
              }}
            >
              {fullUrl && isCurrentImage ? (
                <Box
                  component="img"
                  src={fullUrl}
                  alt={currentSample.name}
                  draggable={false}
                  sx={{
                    width: `${zoom}%`,
                    minWidth: zoom > 100 ? `${zoom}%` : 'auto',
                    maxWidth: 'none',
                    objectFit: 'contain',
                    borderRadius: 1,
                    transition: isDragging ? 'none' : 'width 0.2s ease',
                    pointerEvents: 'none',
                  }}
                />
              ) : fullUrl ? (
                <Stack spacing={2} alignItems="center">
                  <Iconify
                    icon="solar:file-bold-duotone"
                    width={64}
                    sx={{ color: 'primary.main' }}
                  />
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {currentSample.name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    이미지 파일이 아닙니다. 아래 버튼으로 직접 열어주세요.
                  </Typography>
                  <IconButton
                    onClick={() => window.open(fullUrl, '_blank')}
                    sx={{
                      bgcolor: 'primary.main',
                      color: 'white',
                      '&:hover': { bgcolor: 'primary.dark' },
                      px: 3,
                      py: 1,
                      borderRadius: 1,
                    }}
                  >
                    <Iconify icon="solar:download-bold" width={20} sx={{ mr: 1 }} />
                    <Typography variant="body2">파일 열기</Typography>
                  </IconButton>
                </Stack>
              ) : null}
            </Box>

            {/* 다음 버튼 */}
            {samples.length > 1 && (
              <IconButton
                onClick={handleNext}
                sx={{
                  position: 'absolute',
                  right: 8,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 10,
                  bgcolor: 'rgba(255, 255, 255, 0.9)',
                  boxShadow: 2,
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 1)',
                  },
                }}
              >
                <Iconify icon="carbon:chevron-right" width={24} />
              </IconButton>
            )}

            {/* 줌 컨트롤 (이미지인 경우에만) */}
            {isCurrentImage && (
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 72,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  bgcolor: 'rgba(255, 255, 255, 0.95)',
                  borderRadius: 2,
                  px: 2,
                  py: 0.5,
                  boxShadow: 2,
                }}
              >
                <Tooltip title="축소" arrow>
                  <IconButton size="small" onClick={handleZoomOut} disabled={zoom <= MIN_ZOOM}>
                    <Iconify icon="carbon:zoom-out" width={20} />
                  </IconButton>
                </Tooltip>
                <Slider
                  value={zoom}
                  onChange={handleZoomChange}
                  min={MIN_ZOOM}
                  max={MAX_ZOOM}
                  step={ZOOM_STEP}
                  sx={{ width: 100 }}
                />
                <Tooltip title="확대" arrow>
                  <IconButton size="small" onClick={handleZoomIn} disabled={zoom >= MAX_ZOOM}>
                    <Iconify icon="carbon:zoom-in" width={20} />
                  </IconButton>
                </Tooltip>
                <Tooltip title="원본 크기" arrow>
                  <Typography
                    variant="caption"
                    onClick={handleZoomReset}
                    sx={{
                      minWidth: 40,
                      textAlign: 'center',
                      cursor: 'pointer',
                      fontWeight: 600,
                      color: zoom === 100 ? 'primary.main' : 'text.secondary',
                      '&:hover': { color: 'primary.main' },
                    }}
                  >
                    {zoom}%
                  </Typography>
                </Tooltip>
              </Box>
            )}

            {/* 파일명 표시 */}
            <Box
              sx={{
                p: 2,
                bgcolor: 'background.paper',
                borderTop: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Iconify icon="solar:file-bold-duotone" width={20} sx={{ color: 'primary.main' }} />
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 500,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    flex: 1,
                  }}
                >
                  {currentSample?.name}
                </Typography>
                <Tooltip title="새 탭에서 열기" arrow placement="top">
                  <IconButton
                    size="small"
                    onClick={() => fullUrl && window.open(fullUrl, '_blank')}
                    sx={{ color: 'text.secondary' }}
                  >
                    <Iconify icon="solar:export-bold" width={18} />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Box>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}
