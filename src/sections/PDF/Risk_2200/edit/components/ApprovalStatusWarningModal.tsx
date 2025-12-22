import { useState } from 'react';

import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: (resendNotification: boolean) => void;
  approvalProgress?: number;
  status?: string;
};

export default function ApprovalStatusWarningModal({ open, onClose, onConfirm }: Props) {
  const [resendNotification, setResendNotification] = useState(false);

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
            <Typography sx={{ fontWeight: 700, textAlign: 'center' }}>
              결재 요청된 문서입니다. <br /> 수정 시 결재 알림이 다시 발송됩니다.
            </Typography>
          </Stack>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, justifyContent: 'center', gap: 1 }}>
        <Button variant="outlined" onClick={onClose} sx={{ minWidth: 64 }}>
          취소
        </Button>
        <Button
          variant="contained"
          onClick={() => onConfirm(resendNotification)}
          sx={{ minWidth: 64 }}
        >
          확인
        </Button>
      </DialogActions>
    </Dialog>
  );
}
