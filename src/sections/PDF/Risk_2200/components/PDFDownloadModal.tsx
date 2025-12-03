import { useState, useEffect } from 'react';
import { keyframes } from '@emotion/react';

import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import { alpha, styled } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

// 펄스 애니메이션
const pulse = keyframes`
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.8;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
`;

// 페이드 인 애니메이션
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

// 스타일링된 컴포넌트
const ModalContent = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  backgroundColor: theme.palette.background.paper,
  borderRadius: typeof theme.shape.borderRadius === 'number' ? theme.shape.borderRadius * 2 : 16, // 기본값 16px
  boxShadow: theme.shadows[24],
  padding: theme.spacing(4),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: theme.spacing(2),
  minWidth: 280,
  animation: `${fadeIn} 0.3s ease-out`,
}));

const IconContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 100,
  height: 100,
}));

const PulsingIcon = styled(Box)(({ theme }) => ({
  position: 'absolute',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  animation: `${pulse} 1.5s ease-in-out infinite`,
  color: theme.palette.error.main,
}));

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  progress?: number; // 0-100 (선택적, 없으면 indeterminate)
  message?: string;
};

export default function PDFDownloadModal({
  open,
  progress,
  message = 'PDF를 생성하고 있습니다...',
}: Props) {
  const [dots, setDots] = useState('');

  // 로딩 dots 애니메이션
  useEffect(() => {
    if (!open) return undefined;

    const interval = setInterval(() => {
      setDots((prev) => {
        if (prev.length >= 3) return '';
        return `${prev}.`;
      });
    }, 500);

    return () => clearInterval(interval);
  }, [open]);

  return (
    <Modal
      open={open}
      aria-labelledby="pdf-download-modal"
      aria-describedby="pdf-download-progress"
      slotProps={{
        backdrop: {
          sx: {
            backgroundColor: (theme) => alpha(theme.palette.grey[900], 0.8),
            backdropFilter: 'blur(4px)',
          },
        },
      }}
    >
      <ModalContent>
        <IconContainer>
          {/* 배경 원형 Progress */}
          <CircularProgress
            variant={progress !== undefined ? 'determinate' : 'indeterminate'}
            value={progress}
            size={100}
            thickness={3}
            sx={{
              position: 'absolute',
              color: (theme) => alpha(theme.palette.error.main, 0.2),
            }}
          />
          {/* 전경 원형 Progress */}
          <CircularProgress
            variant={progress !== undefined ? 'determinate' : 'indeterminate'}
            value={progress}
            size={100}
            thickness={3}
            sx={{
              position: 'absolute',
              color: 'error.main',
              '& .MuiCircularProgress-circle': {
                strokeLinecap: 'round',
              },
            }}
          />
          {/* PDF 아이콘 */}
          <PulsingIcon>
            <Iconify icon="solar:file-text-bold" width={48} height={48} />
          </PulsingIcon>
        </IconContainer>

        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary', mb: 0.5 }}>
            PDF 다운로드
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {message}
            {dots}
          </Typography>
        </Box>

        {progress !== undefined && (
          <Box
            sx={{
              width: '100%',
              bgcolor: (theme) => alpha(theme.palette.grey[500], 0.16),
              borderRadius: 1,
              overflow: 'hidden',
              height: 8,
            }}
          >
            <Box
              sx={{
                width: `${progress}%`,
                height: '100%',
                bgcolor: 'error.main',
                borderRadius: 1,
                transition: 'width 0.3s ease-out',
              }}
            />
          </Box>
        )}
      </ModalContent>
    </Modal>
  );
}
