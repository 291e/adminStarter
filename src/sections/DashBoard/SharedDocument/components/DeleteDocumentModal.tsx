import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';

import { Iconify } from 'src/components/iconify';
import type { SharedDocument as ApiSharedDocument } from 'src/services/dashboard/dashboard.types';

// ----------------------------------------------------------------------

// API 타입 직접 사용
export type SharedDocument = ApiSharedDocument;

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  document: SharedDocument | null;
};

export default function DeleteDocumentModal({ open, onClose, onConfirm, document }: Props) {
  const handleConfirm = () => {
    // TODO: TanStack Query Hook(useMutation)으로 문서 삭제
    // const deleteMutation = useMutation({
    //   mutationFn: () => deleteSharedDocument(document?.id),
    //   onSuccess: () => {
    //     queryClient.invalidateQueries({ queryKey: ['sharedDocuments'] });
    //     onClose();
    //   },
    // });
    // deleteMutation.mutate();

    onConfirm();
  };

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
              삭제 후 &quot;{document?.documentName || '문서'}&quot;문서는 공유 문서함에서
              사라집니다.
            </Typography>
          </Stack>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, justifyContent: 'center', gap: 1 }}>
        <Button variant="outlined" onClick={onClose} sx={{ minWidth: 64 }}>
          취소
        </Button>
        <Button variant="contained" onClick={handleConfirm} sx={{ minWidth: 64 }}>
          삭제하기
        </Button>
      </DialogActions>
    </Dialog>
  );
}
