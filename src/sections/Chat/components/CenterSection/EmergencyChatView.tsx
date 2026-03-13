import Box from '@mui/material/Box';

import EmergencyStatsHeader from '../ui/EmergencyStatsHeader';
import MessageList from '../ui/MessageList';
import ChatInput, { type ChatInputPayload } from '../ui/ChatInput';

type ChatMessage = {
  id: string;
  sender: string;
  senderId?: string;
  message: string;
  rawMessage?: string;
  timestamp: string;
  dateLabel?: string;
  avatarUrl?: string;
  isOwn?: boolean;
  messageType?: 'TEXT' | 'IMAGE' | 'VIDEO' | 'FILE' | 'SYSTEM' | 'EMERGENCY';
  sharedDocumentIdx?: number;
  attachments?: string[] | null;
  replyTo?: {
    messageId: string;
    senderName: string;
    preview: string;
  } | null;
  metadata?: {
    type?: string;
    location?: {
      latitude: number;
      longitude: number;
      address?: string;
    };
    [key: string]: any;
  };
};

type ReplyComposer = {
  messageId: string;
  senderId: string;
  senderName: string;
  messageType: 'TEXT' | 'IMAGE' | 'VIDEO' | 'FILE' | 'SYSTEM' | 'EMERGENCY';
  rawMessage: string;
  preview: string;
};

type Props = {
  messages: ChatMessage[];
  emergencyStats?: { month: number; count: number };
  conversationDate?: string;
  messageInput?: string;
  onMessageInputChange?: (value: string) => void;
  onSendMessage?: (payload?: ChatInputPayload) => void;
  replyingTo?: ReplyComposer | null;
  onReplyMessage?: (message: ChatMessage) => void;
  onCancelReply?: () => void;
  roomId?: string | number;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
};

export default function EmergencyChatView({
  messages,
  emergencyStats,
  conversationDate,
  messageInput,
  onMessageInputChange,
  onSendMessage,
  replyingTo,
  onReplyMessage,
  onCancelReply,
  roomId,
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
      {emergencyStats && (
        <EmergencyStatsHeader month={emergencyStats.month} count={emergencyStats.count} />
      )}
      <MessageList
        messages={messages}
        conversationDate={conversationDate}
        roomId={roomId}
        onReply={onReplyMessage}
        hasMore={hasMore}
        isLoadingMore={isLoadingMore}
        onLoadMore={onLoadMore}
      />
      <ChatInput
        isEmergency
        value={messageInput}
        onChange={onMessageInputChange}
        onSend={onSendMessage}
        replyingTo={replyingTo}
        onCancelReply={onCancelReply}
      />
    </Box>
  );
}
