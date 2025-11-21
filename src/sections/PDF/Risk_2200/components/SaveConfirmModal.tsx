import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export default function SaveConfirmModal({ open, onClose, onConfirm }: Props) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxWidth: 565,
          width: '100%',
        },
      }}
    >
      <DialogContent sx={{ px: 9, py: 6 }}>
        <Stack spacing={4} alignItems="center">
          <Box
            sx={{
              width: 64,
              height: 64,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Iconify icon="solar:info-circle-bold" width={64} sx={{ color: 'info.main' }} />
          </Box>
          <Typography
            variant="h5"
            sx={{
              fontSize: 20,
              fontWeight: 700,
              lineHeight: '30px',
              textAlign: 'center',
              letterSpacing: '-0.4px',
            }}
          >
            작성된 문서에 영향을 줄 수 있습니다.
            <br />
            변경 내용을 저장하시겠습니까?
          </Typography>
          <Stack direction="row" spacing={1.5}>
            <Button onClick={onClose} variant="outlined" sx={{ minWidth: 64 }}>
              취소
            </Button>
            <Button onClick={onConfirm} variant="contained" sx={{ minWidth: 64 }}>
              확인
            </Button>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}




