import Box from '@mui/material/Box';

import MessageList from '../ui/MessageList';
import ChatInput, { type ChatInputPayload } from '../ui/ChatInput';

type ChatMessage = {
  id: string;
  sender: string;
  message: string;
  timestamp: string;
  dateLabel?: string;
  avatarUrl?: string;
  isOwn?: boolean;
  messageType?: 'TEXT' | 'IMAGE' | 'VIDEO' | 'FILE' | 'SYSTEM' | 'EMERGENCY';
  sharedDocumentIdx?: number;
  attachments?: string[] | null;
  metadata?: {
    type?: string;
    location?: {
      latitude: number;
      longitude: number;
      address?: string;
    };
  };
};

type Props = {
  messages: ChatMessage[];
  conversationDate?: string;
  messageInput?: string;
  onMessageInputChange?: (value: string) => void;
  onSendMessage?: (payload?: ChatInputPayload) => void;
  roomId?: string | number;
  onFileMessageClick?: (sharedDocumentIdx: number) => void;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
};

export default function NormalChatView({
  messages,
  conversationDate,
  messageInput,
  onMessageInputChange,
  onSendMessage,
  roomId,
  onFileMessageClick,
  hasMore,
  isLoadingMore,
  onLoadMore,
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
      <MessageList
        messages={messages}
        conversationDate={conversationDate}
        roomId={roomId}
        onFileMessageClick={onFileMessageClick}
        hasMore={hasMore}
        isLoadingMore={isLoadingMore}
        onLoadMore={onLoadMore}
      />
      <ChatInput
        value={messageInput}
        onChange={onMessageInputChange}
        onSend={onSendMessage}
      />
    </Box>
  );
}
