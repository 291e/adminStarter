import { useState, useEffect } from 'react';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';

import DialogBtn from 'src/components/safeyoui/button/dialogBtn';
import type { ChatRoom } from 'src/_mock/_chat';

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: (newName: string) => void;
  room: ChatRoom | null;
  currentName?: string;
};

export default function RenameChatRoomModal({
  open,
  onClose,
  onConfirm,
  room,
  currentName,
}: Props) {
  const [roomName, setRoomName] = useState('');

  useEffect(() => {
    if (open) {
      setRoomName(currentName || room?.name || '');
    }
  }, [open, currentName, room?.name]);

  const handleConfirm = () => {
    if (roomName.trim()) {
      // TODO: TanStack Query Hook(useMutation)으로 채팅방 이름 변경 API 호출
      // const mutation = useMutation({
      //   mutationFn: (data: { roomId: string; newName: string }) => {
      //     return renameChatRoom(data.roomId, data.newName);
      //   },
      //   onSuccess: () => {
      //     queryClient.invalidateQueries({ queryKey: ['chatRooms'] });
      //     queryClient.invalidateQueries({ queryKey: ['chatRoom', room?.id] });
      //     // 성공 토스트 메시지 표시
      //     handleClose();
      //   },
      //   onError: (error) => {
      //     console.error('채팅방 이름 변경 실패:', error);
      //     // 에러 토스트 메시지 표시
      //   },
      // });
      // mutation.mutate({ roomId: room?.id || '', newName: roomName.trim() });

      onConfirm(roomName.trim());
      handleClose();
    }
  };

  const handleClose = () => {
    setRoomName('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontSize: 18, fontWeight: 600, lineHeight: '28px', pb: 3 }}>
        채팅방 이름 변경
      </DialogTitle>

      <DialogContent sx={{ px: 3, py: 0 }}>
        <Stack spacing={1.5} sx={{ width: '100%' }}>
          <Typography
            variant="subtitle2"
            sx={{
              fontSize: 14,
              fontWeight: 600,
              lineHeight: '22px',
              color: 'text.primary',
            }}
          >
            채팅방 이름
          </Typography>
          <TextField
            fullWidth
            size="medium"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            placeholder="채팅방 이름을 입력하세요."
            sx={{
              '& .MuiOutlinedInput-root': {
                height: 52,
              },
            }}
          />
        </Stack>
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          justifyContent: 'flex-end',
        }}
      >
        <Stack direction="row" spacing={1.5}>
          <DialogBtn variant="outlined" onClick={handleClose} sx={{ minHeight: 36, fontSize: 14 }}>
            취소
          </DialogBtn>
          <DialogBtn
            variant="contained"
            onClick={handleConfirm}
            disabled={!roomName.trim()}
            sx={{
              minHeight: 36,
              fontSize: 14,
              bgcolor: 'grey.900',
              color: 'common.white',
              '&:hover': {
                bgcolor: 'grey.800',
              },
            }}
          >
            변경하기
          </DialogBtn>
        </Stack>
      </DialogActions>
    </Dialog>
  );
}
