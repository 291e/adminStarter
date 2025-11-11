import Box from '@mui/material/Box';

import EmergencyStatsHeader from '../ui/EmergencyStatsHeader';
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
  emergencyStats?: { month: number; count: number };
  messageInput?: string;
  onMessageInputChange?: (value: string) => void;
  onSendMessage?: () => void;
};

export default function EmergencyChatView({
  messages,
  emergencyStats,
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
      {emergencyStats && (
        <EmergencyStatsHeader month={emergencyStats.month} count={emergencyStats.count} />
      )}
      <MessageList messages={messages} />
      <ChatInput
        isEmergency
        value={messageInput}
        onChange={onMessageInputChange}
        onSend={onSendMessage}
      />
    </Box>
  );
}
