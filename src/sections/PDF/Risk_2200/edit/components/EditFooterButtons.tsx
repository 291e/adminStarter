import Box from '@mui/material/Box';
import Button from '@mui/material/Button';

// ----------------------------------------------------------------------

type Props = {
  onSave?: () => void;
  onTemporarySave?: () => void;
  onCancel?: () => void;
};

export default function EditFooterButtons({ onSave, onTemporarySave, onCancel }: Props) {
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
        onClick={onSave}
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
        수정
      </Button>
      <Button
        variant="contained"
        size="large"
        onClick={onTemporarySave}
        sx={{
          bgcolor: 'warning.main',
          color: 'warning.contrastText',
          minHeight: 48,
          fontSize: 15,
          fontWeight: 700,
          lineHeight: '26px',
          px: 2,
          py: 1,
        }}
      >
        임시 저장
      </Button>
      <Button
        variant="outlined"
        size="large"
        onClick={onCancel}
        sx={{
          minHeight: 48,
          fontSize: 15,
          fontWeight: 700,
          lineHeight: '26px',
          px: 2,
          py: 1,
        }}
      >
        취소
      </Button>
    </Box>
  );
}

