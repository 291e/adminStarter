import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';

import { Scrollbar } from 'src/components/scrollbar';
import MessageBubble from './MessageBubble';

type ChatMessage = {
  id: string;
  sender: string;
  message: string;
  timestamp: string;
  isOwn?: boolean;
};

type Props = {
  messages: ChatMessage[];
};

export default function MessageList({ messages }: Props) {
  return (
    <Scrollbar sx={{ flex: 1, p: { xs: 2, lg: 2.5 } }}>
      <Stack spacing={2}>
        {/* 날짜 구분선 */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Divider sx={{ flex: 1 }} />
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            2025년 8월 26일
          </Typography>
          <Divider sx={{ flex: 1 }} />
        </Box>

        {messages.map((message) => (
          <Box key={message.id} sx={{ mb: 2 }}>
            <MessageBubble
              sender={message.sender}
              message={message.message}
              timestamp={message.timestamp}
              isOwn={message.isOwn || false}
            />
          </Box>
        ))}
      </Stack>
    </Scrollbar>
  );
}
