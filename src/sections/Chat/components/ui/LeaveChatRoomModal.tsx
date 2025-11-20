import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import DialogBtn from 'src/components/safeyoui/button/dialogBtn';
import warningIcon from 'src/assets/icons/safeyoui/warning.svg';
import type { ChatRoom } from 'src/_mock/_chat';

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  room: ChatRoom | null;
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
      <DialogContent
        sx={{
          px: 4.5,
          py: 3,
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
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
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
            채팅방을 나가시겠습니까?
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
            나가면 채팅방 목록에서 삭제되고,
            <br />
            대화 내용은 복원할 수 없습니다.
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
            나가기
          </DialogBtn>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

