import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';

import { Iconify } from 'src/components/iconify';
import type { Organization } from 'src/services/organization/organization.types';

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  organization: Organization | null;
};

export default function DeleteMemberModal({ open, onClose, onConfirm, organization }: Props) {
  const handleConfirm = () => {
    // TODO: TanStack Query Hook(useMutation)으로 조직원 삭제
    // const deleteMutation = useMutation({
    //   mutationFn: () => deleteMember(member?.memberIdx),
    //   onSuccess: () => {
    //     queryClient.invalidateQueries({ queryKey: ['members'] });
    //     onClose();
    //     // 성공 토스트 메시지 표시
    //   },
    //   onError: (error) => {
    //     console.error('조직원 삭제 실패:', error);
    //     // 에러 토스트 메시지 표시
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
              조직 정보에 속한 사용자 및 데이터가 함께 삭제됩니다.
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
