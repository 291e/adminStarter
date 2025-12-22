import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

import { Iconify } from 'src/components/iconify';
import type { ChatRoomDto } from 'src/services/chat/chat.types';

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  room: ChatRoomDto | null;
};

export default function LeaveChatRoomModal({ open, onClose, onConfirm, room }: Props) {
  const handleConfirm = () => {
    // TODO: TanStack Query Hook(useMutation)으로 채팅방 나가기 API 호출
    // const leaveMutation = useMutation({
    //   mutationFn: (roomId: string) => leaveChatRoom(roomId),
    //   onSuccess: () => {
    //     queryClient.invalidateQueries({ queryKey: ['chatRooms'] });
    //     // 성공 토스트 메시지 표시
    //     // 채팅방 목록에서 제거되거나 선택된 방을 null로 설정
    //     onConfirm();
    //     onClose();
    //   },
    //   onError: (error) => {
    //     console.error('채팅방 나가기 실패:', error);
    //     // 에러 토스트 메시지 표시
    //   },
    // });
    // leaveMutation.mutate(room?.id || '');

    onConfirm();
    onClose();
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
            <Typography sx={{ fontWeight: 700, textAlign: 'center' }}>
              채팅방을 나가시겠습니까?
            </Typography>
            <Typography sx={{ fontWeight: 700, textAlign: 'center', mt: 1 }}>
              나가면 채팅방 목록에서 삭제되고,
              <br />
              대화 내용은 복원할 수 없습니다.
            </Typography>
          </Stack>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, justifyContent: 'center', gap: 1 }}>
        <Button variant="outlined" onClick={onClose} sx={{ minWidth: 64 }}>
          취소
        </Button>
        <Button variant="contained" onClick={handleConfirm} sx={{ minWidth: 64 }}>
          나가기
        </Button>
      </DialogActions>
    </Dialog>
  );
}
