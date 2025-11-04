import Box from '@mui/material/Box';
import Button from '@mui/material/Button';

// ----------------------------------------------------------------------

type Props = {
  onDownloadPDF?: () => void;
  onClose?: () => void;
};

export default function FooterButtons({ onDownloadPDF, onClose }: Props) {
  return (
    <Box
      sx={{
        display: 'flex',
        gap: 2,
        justifyContent: 'flex-end',
        width: '100%',
        maxWidth: 1320,
      }}
    >
      <Button
        variant="contained"
        size="large"
        onClick={onDownloadPDF}
        sx={{
          bgcolor: '#1c252e',
          color: 'white',
          minHeight: 48,
          fontSize: 15,
          fontWeight: 700,
          lineHeight: '26px',
          px: 2,
          py: 1,
        }}
      >
        PDF 다운로드
      </Button>
      <Button
        variant="outlined"
        size="large"
        onClick={onClose}
        sx={{
          minHeight: 48,
          fontSize: 15,
          fontWeight: 700,
          lineHeight: '26px',
          px: 2,
          py: 1,
        }}
      >
        닫기
      </Button>
    </Box>
  );
}
