import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type Props = {
  onBack?: () => void;
  onSampleView?: () => void;
  title?: string;
};

export default function EditHeader({ onBack, onSampleView, title }: Props) {
  return (
    <Box
      sx={{
        display: 'flex',
        gap: 1,
        alignItems: 'flex-end',
        width: '100%',
        maxWidth: 1320,
      }}
    >
      <IconButton onClick={onBack} sx={{ p: 1 }}>
        <Iconify icon="eva:arrow-ios-back-fill" width={20} />
      </IconButton>
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Typography variant="h4" sx={{ fontSize: 24, fontWeight: 700, lineHeight: '36px' }}>
          {title || '문서 수정'}
        </Typography>
      </Box>
      {onSampleView && (
        <Button
          variant="contained"
          size="small"
          onClick={onSampleView}
          sx={{
            bgcolor: '#2563e9',
            color: 'white',
            minHeight: 36,
            fontSize: 14,
            fontWeight: 700,
            lineHeight: '24px',
            px: 1,
            py: 0.75,
          }}
        >
          샘플 보기
        </Button>
      )}
    </Box>
  );
}



