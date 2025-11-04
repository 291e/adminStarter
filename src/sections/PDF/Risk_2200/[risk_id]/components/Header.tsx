import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type Props = {
  title?: string;
  onBack?: () => void;
  onSampleView?: () => void;
};

export default function DetailHeader({ title, onBack, onSampleView }: Props) {
  return (
    <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end', width: '100%' }}>
      <IconButton
        size="small"
        onClick={onBack}
        sx={{
          width: 36,
          height: 36,
          minWidth: 36,
        }}
      >
        <Iconify icon="eva:arrow-ios-back-fill" width={20} />
      </IconButton>
      <Typography
        variant="h4"
        sx={{
          flex: 1,
          fontSize: 24,
          fontWeight: 700,
          lineHeight: '36px',
        }}
      >
        {title || '위험요인 제거·대체 및 통제 등록'}
      </Typography>
      <Button
        variant="contained"
        size="small"
        onClick={onSampleView}
        sx={{
          bgcolor: '#2563e9',
          minHeight: 30,
          fontSize: 13,
          fontWeight: 700,
          px: 1,
          py: 0.5,
        }}
      >
        샘플 보기
      </Button>
    </Box>
  );
}
