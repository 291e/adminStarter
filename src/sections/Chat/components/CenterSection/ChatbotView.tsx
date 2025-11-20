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

export default function ChatbotView({
  messages,
  messageInput,
  onMessageInputChange,
  onSendMessage,
}: Props) {
  // TODO: 챗봇 API 연동
  // - Firebase Realtime Database는 사용하지 않음
  // - 챗봇 API로 HTTP 통신하여 질문/답변 처리
  // - onSendMessage에서 챗봇 API 호출 후 응답을 메시지로 추가
  // 예시:
  // const handleSendMessage = async () => {
  //   if (!messageInput?.trim()) return;
  //   // 사용자 메시지 추가
  //   // 챗봇 API 호출
  //   // const response = await axios.post('/api/chatbot', { message: messageInput });
  //   // 챗봇 응답 메시지 추가
  // };

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
      <ChatInput value={messageInput} onChange={onMessageInputChange} onSend={onSendMessage} />
    </Box>
  );
}
