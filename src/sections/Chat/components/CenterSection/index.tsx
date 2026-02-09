import NormalChatView from './NormalChatView';
import EmergencyChatView from './EmergencyChatView';
import ChatbotView from './ChatbotView';
import type { ChatInputPayload } from '../ui/ChatInput';
import type { ChatRoom2 } from '../../chat2.types';

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
  room: ChatRoom2;
  messages: ChatMessage[];
  conversationDate?: string;
  messageInput?: string;
  onMessageInputChange?: (value: string) => void;
  onSendMessage?: (payload?: ChatInputPayload) => void;
  emergencyStats?: { month: number; count: number };
  onFileMessageClick?: (sharedDocumentIdx: number) => void;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
};

export default function CenterSection({
  room,
  messages,
  conversationDate,
  messageInput,
  onMessageInputChange,
  onSendMessage,
  emergencyStats,
  onFileMessageClick,
  hasMore,
  isLoadingMore,
  onLoadMore,
}: Props) {
  if (!room) {
    return null;
  }

  switch (room.type) {
    case 'CHATBOT':
      return (
        <ChatbotView
          messages={messages}
          conversationDate={conversationDate}
          messageInput={messageInput}
          onMessageInputChange={onMessageInputChange}
          onSendMessage={onSendMessage}
          roomId={room.chatRoomId}
        />
      );
    case 'EMERGENCY':
      return (
        <EmergencyChatView
          messages={messages}
          conversationDate={conversationDate}
          emergencyStats={emergencyStats}
          messageInput={messageInput}
          onMessageInputChange={onMessageInputChange}
          onSendMessage={onSendMessage}
          roomId={room.chatRoomId}
          hasMore={hasMore}
          isLoadingMore={isLoadingMore}
          onLoadMore={onLoadMore}
        />
      );
    case 'GROUP':
    case 'DIRECT':
    default:
      return (
        <NormalChatView
          messages={messages}
          conversationDate={conversationDate}
          messageInput={messageInput}
          onMessageInputChange={onMessageInputChange}
          onSendMessage={onSendMessage}
          roomId={room.chatRoomId}
          onFileMessageClick={onFileMessageClick}
          hasMore={hasMore}
          isLoadingMore={isLoadingMore}
          onLoadMore={onLoadMore}
        />
      );
  }
}
