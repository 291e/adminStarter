import Box from '@mui/material/Box';
import InputBase from '@mui/material/InputBase';
import IconButton from '@mui/material/IconButton';

import { Iconify } from 'src/components/iconify';

type Props = {
  value?: string;
  onChange?: (value: string) => void;
  onSend?: () => void;
  isEmergency?: boolean;
};

export default function ChatInput({ value = '', onChange, onSend, isEmergency = false }: Props) {
  return (
    <Box
      sx={{
        p: { xs: 1.5, lg: 2 },
        borderTop: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        alignItems: 'center',
        gap: { xs: 0.5, lg: 1 },
        bgcolor: isEmergency ? '#F26221' : 'transparent',
      }}
    >
      <IconButton
        size="small"
        sx={{ bgcolor: 'white' }}
        onClick={() => {
          // TODO: TanStack Query Hook(useMutation)으로 이미지 파일 업로드
          // const uploadMutation = useMutation({
          //   mutationFn: (file: File) => uploadChatFile(selectedRoomId, file, 'image'),
          //   onSuccess: () => {
          //     queryClient.invalidateQueries({ queryKey: ['chatAttachments', selectedRoomId] });
          //   },
          // });
        }}
      >
        <Iconify icon={'mdi:camera' as any} width={24} />
      </IconButton>
      <IconButton
        size="small"
        sx={{ bgcolor: 'white' }}
        onClick={() => {
          // TODO: TanStack Query Hook(useMutation)으로 음성 파일 업로드
          // const uploadMutation = useMutation({
          //   mutationFn: (file: File) => uploadChatFile(selectedRoomId, file, 'audio'),
          //   onSuccess: () => {
          //     queryClient.invalidateQueries({ queryKey: ['chatAttachments', selectedRoomId] });
          //   },
          // });
        }}
      >
        <Iconify icon={'material-symbols:mic' as any} width={24} />
      </IconButton>
      <InputBase
        fullWidth
        placeholder="메시지를 입력하세요..."
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        onKeyPress={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onSend?.();
          }
        }}
        sx={{
          bgcolor: isEmergency ? 'white' : 'grey.100',
          borderRadius: 9999,
          px: 2,
          py: 0.125,
          color: isEmergency ? 'white' : 'text.primary',
          '&::placeholder': {
            color: isEmergency ? 'rgba(255, 255, 255, 0.7)' : 'text.disabled',
          },
        }}
      />
      <IconButton size="small" color="primary" onClick={onSend} sx={{ bgcolor: 'white' }}>
        <Iconify icon={'solar:plain-2-bold' as any} width={24} />
      </IconButton>
    </Box>
  );
}
