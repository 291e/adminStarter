import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  label?: string;
};

export default function DeleteContentModal({ open, onClose, onConfirm, label }: Props) {
  const displayLabel = label?.trim() ? label : '영상';

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogContent>
        <Stack spacing={2} alignItems="center" sx={{ pt: 2 }}>
          <Box
            sx={{
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Iconify
              icon={'solar:danger-circle-bold' as any}
              width={64}
              sx={{ color: 'error.main' }}
            />
          </Box>

          <Stack alignItems="center">
            <Typography sx={{ fontWeight: 700, textAlign: 'center' }}>삭제하시겠습니까?</Typography>
            <Typography sx={{ fontWeight: 700, textAlign: 'center', mt: 1 }}>
              삭제 후 &quot;{displayLabel}&quot; 영상은 라이브러리에서 사라집니다.
            </Typography>
          </Stack>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, justifyContent: 'center', gap: 1 }}>
        <Button variant="outlined" onClick={onClose} sx={{ minWidth: 64 }}>
          취소
        </Button>
        <Button variant="contained" onClick={onConfirm} sx={{ minWidth: 64 }}>
          삭제하기
        </Button>
      </DialogActions>
    </Dialog>
  );
}
