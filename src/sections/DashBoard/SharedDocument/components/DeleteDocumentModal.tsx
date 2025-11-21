import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';

import DialogBtn from 'src/components/safeyoui/button/dialogBtn';
import warningIcon from 'src/assets/icons/safeyoui/warning.svg';
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
      <DialogContent
        sx={{
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2.5,
        }}
      >
        {/* 경고 아이콘 */}
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 0,
          }}
        >
          <img src={warningIcon} alt="warning" width={64} height={64} />
        </Box>

        {/* 텍스트 영역 */}
        <Stack spacing={1} alignItems="center" sx={{ textAlign: 'center', width: '100%' }}>
          <Typography
            variant="h5"
            sx={{
              fontSize: 20,
              fontWeight: 700,
              lineHeight: '30px',
              color: 'text.primary',
            }}
          >
            삭제하시겠습니까?
          </Typography>
          <Typography
            variant="subtitle2"
            sx={{
              fontSize: 14,
              fontWeight: 600,
              lineHeight: '22px',
              color: 'text.secondary',
            }}
          >
            삭제 후 &quot;{document?.documentName || '문서'}&quot;문서는 공유 문서함에서 사라집니다.
          </Typography>
        </Stack>

        {/* 버튼 영역 */}
        <Stack direction="row" spacing={1.5} sx={{ width: '100%', mt: 1 }}>
          <DialogBtn
            variant="outlined"
            onClick={onClose}
            sx={{ flex: 1, minHeight: 36, fontSize: 14 }}
          >
            취소
          </DialogBtn>
          <DialogBtn
            variant="contained"
            onClick={handleConfirm}
            sx={{
              flex: 1,
              minHeight: 36,
              fontSize: 14,
              bgcolor: 'grey.900',
              color: 'common.white',
              '&:hover': {
                bgcolor: 'grey.800',
              },
            }}
          >
            삭제하기
          </DialogBtn>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
