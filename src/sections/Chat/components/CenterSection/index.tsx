import NormalChatView from './NormalChatView';
import EmergencyChatView from './EmergencyChatView';
import ChatbotView from './ChatbotView';

type ChatRoom = {
  id: string;
  name: string;
  type?: 'chatbot' | 'emergency' | 'normal' | 'group';
  isGroup?: boolean;
  organizationName?: string;
};

type ChatMessage = {
  id: string;
  sender: string;
  message: string;
  timestamp: string;
  isOwn?: boolean;
};

type Props = {
  room: ChatRoom;
  messages: ChatMessage[];
  messageInput?: string;
  onMessageInputChange?: (value: string) => void;
  onSendMessage?: () => void;
  emergencyStats?: { month: number; count: number };
};

export default function CenterSection({
  room,
  messages,
  messageInput,
  onMessageInputChange,
  onSendMessage,
  emergencyStats,
}: Props) {
  if (!room) {
    return null;
  }

  switch (room.type) {
    case 'chatbot':
      return (
        <ChatbotView
          messages={messages}
          messageInput={messageInput}
          onMessageInputChange={onMessageInputChange}
          onSendMessage={onSendMessage}
        />
      );
    case 'emergency':
      return (
        <EmergencyChatView
          messages={messages}
          emergencyStats={emergencyStats}
          messageInput={messageInput}
          onMessageInputChange={onMessageInputChange}
          onSendMessage={onSendMessage}
        />
      );
    case 'normal':
    case 'group':
    default:
      return (
        <NormalChatView
          messages={messages}
          messageInput={messageInput}
          onMessageInputChange={onMessageInputChange}
          onSendMessage={onSendMessage}
        />
      );
  }
}
