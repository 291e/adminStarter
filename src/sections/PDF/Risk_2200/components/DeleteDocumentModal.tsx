import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';

import { Iconify } from 'src/components/iconify';
import type { Risk_2200Row } from './Table';

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  document: Risk_2200Row | null;
  isDeleting?: boolean;
};

export default function DeleteDocumentModal({
  open,
  onClose,
  onConfirm,
  document,
  isDeleting = false,
}: Props) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogContent>
        <Stack spacing={2} alignItems="center" sx={{ pt: 2 }}>
          {/* 경고 아이콘 */}
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

          {/* 메시지 */}
          <Stack alignItems="center">
            <Typography sx={{ fontWeight: 700, textAlign: 'center' }}>삭제하시겠습니까?</Typography>
            <Typography sx={{ fontWeight: 700, textAlign: 'center', mt: 1 }}>
              삭제 후 &quot;{document?.documentName || '문서'}&quot; 문서는 복구할 수 없습니다.
            </Typography>
          </Stack>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, justifyContent: 'center', gap: 1 }}>
        <Button
          variant="outlined"
          onClick={onClose}
          disabled={isDeleting}
          sx={{ minWidth: 64 }}
        >
          취소
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={onConfirm}
          disabled={isDeleting}
          sx={{ minWidth: 64 }}
        >
          {isDeleting ? <CircularProgress size={20} /> : '삭제하기'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
