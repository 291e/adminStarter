import Box from '@mui/material/Box';

import MessageList from '../ui/MessageList';
import ChatInput from '../ui/ChatInput';

type ChatMessage = {
  id: string;
  sender: string;
  message: string;
  timestamp: string;
  isOwn?: boolean;
};

type Props = {
  messages: ChatMessage[];
  messageInput?: string;
  onMessageInputChange?: (value: string) => void;
  onSendMessage?: () => void;
};

export default function NormalChatView({
  messages,
  messageInput,
  onMessageInputChange,
  onSendMessage,
}: Props) {
  return (
    <Box
      sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        borderRight: { xs: 'none', lg: '1px solid #E0E0E0' },
        borderBottom: { xs: '1px solid #E0E0E0', lg: 'none' },
        minWidth: 0,
        minHeight: { xs: 400, lg: 500 },
      }}
    >
      <MessageList messages={messages} />
      <ChatInput
        value={messageInput}
        onChange={onMessageInputChange}
        onSend={onSendMessage}
      />
    </Box>
  );
}
