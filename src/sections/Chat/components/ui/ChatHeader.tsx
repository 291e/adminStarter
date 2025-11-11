import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

import { Iconify } from 'src/components/iconify';

type ChatRoom = {
  id: string;
  name: string;
  type?: 'chatbot' | 'emergency' | 'normal' | 'group';
  isGroup?: boolean;
  organizationName?: string;
};

type Props = {
  room: ChatRoom;
};

export default function ChatHeader({ room }: Props) {
  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      sx={{
        p: { xs: 2, lg: 2.5 },
        borderBottom: '1px solid',
        borderColor: 'divider',
        maxHeight: { xs: 64, lg: 72 },
        width: '100%',
        flexShrink: 0,
      }}
    >
      <Stack direction="row" spacing={2} alignItems="center">
        {room.type === 'emergency' ? (
          <Avatar
            sx={{
              width: 40,
              height: 40,
              bgcolor: 'rgba(255, 86, 48, 0.24)',
              color: 'error.main',
            }}
          >
            <Iconify icon={'mingcute:warning-fill' as any} width={24} />
          </Avatar>
        ) : (
          <Avatar sx={{ width: 40, height: 40 }} />
        )}
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            {room.name}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {room.type === 'emergency'
              ? room.organizationName || '이편한자동화기술 물류팀'
              : room.isGroup
                ? '이편한자동화기술 물류팀'
                : '온라인'}
          </Typography>
        </Box>
      </Stack>
      {room.type !== 'emergency' && (
        <IconButton size="small">
          <Iconify icon="eva:more-vertical-fill" width={20} />
        </IconButton>
      )}
    </Stack>
  );
}
