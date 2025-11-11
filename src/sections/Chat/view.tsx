import { useState } from 'react';

import type { SxProps, Theme } from '@mui/material/styles';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { DashboardContent } from 'src/layouts/dashboard';
import ChatBreadcrumbs from './components/Breadcrumbs';
import LeftSection from './components/LeftSection';
import CenterSection from './components/CenterSection';
import RightSection from './components/RightSection';
import ChatHeader from './components/ui/ChatHeader';

// ----------------------------------------------------------------------

type ChatRoom = {
  id: string;
  name: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount?: number;
  avatar?: string;
  isGroup?: boolean;
  members?: string[];
  type?: 'chatbot' | 'emergency' | 'normal' | 'group';
  organizationName?: string;
};

type ChatMessage = {
  id: string;
  sender: string;
  senderAvatar?: string;
  message: string;
  timestamp: string;
  isOwn?: boolean;
};

type Props = {
  title?: string;
  description?: string;
  sx?: SxProps<Theme>;
};

// TODO: TanStack Query Hook(useQuery)으로 채팅방 목록 가져오기
// const { data: chatRooms, isLoading: roomsLoading } = useQuery({
//   queryKey: ['chatRooms'],
//   queryFn: () => getChatRooms(),
// });
// 목업 데이터 사용
const mockChatRooms: ChatRoom[] = [
  {
    id: 'chatbot',
    name: '챗봇',
    lastMessage: '',
    lastMessageTime: '',
    type: 'chatbot',
  },
  {
    id: 'emergency',
    name: '사고 발생 현황',
    lastMessage: '응급신고',
    lastMessageTime: '4:56 PM',
    unreadCount: 2,
    type: 'emergency',
    organizationName: '이편한자동화기술 물류팀',
  },
  {
    id: '1',
    name: '홍길동',
    lastMessage: '새로 온 분들께 안전 장비 착용법 알려줬습니다.',
    lastMessageTime: '4:56 PM',
    unreadCount: 2,
  },
  {
    id: '2',
    name: '리처드',
    lastMessage: '새로 온 분들께 안전 장비 착용법 알려줬습니다.',
    lastMessageTime: '2025-08-27',
  },
  {
    id: 'group1',
    name: '도르지 바르볼드, 응우옌우옌, 리처드',
    lastMessage: '새로 온 분들께 안전 장비 착용법 알려줬습니다.',
    lastMessageTime: '9:23 PM',
    unreadCount: 2,
    isGroup: true,
    members: ['도르지 바르볼드', '응우옌우옌', '리처드', '외 4명'],
  },
  {
    id: 'group2',
    name: '홍반장, 조지, 리처드',
    lastMessage: '작업자 분들은 신속히 이동 바랍니다.',
    lastMessageTime: '10:30 AM',
    isGroup: true,
    members: ['홍반장', '조지', '리처드'],
  },
  {
    id: 'group3',
    name: '조지, 홍반장',
    lastMessage: '아직 서명하지 않은분들 서명해주세요.',
    lastMessageTime: '어제',
    isGroup: true,
    members: ['조지', '홍반장'],
  },
  {
    id: 'group4',
    name: '도르지 바르볼드, 응우옌우옌, 리처드',
    lastMessage: '가스안전관련 교육이 있습니다.',
    lastMessageTime: '2025-08-27',
    isGroup: true,
    members: ['도르지 바르볼드', '응우옌우옌', '리처드', '외 4명'],
  },
];

// TODO: TanStack Query Hook(useQuery)으로 메시지 목록 가져오기
// const { data: messages, isLoading: messagesLoading } = useQuery({
//   queryKey: ['chatMessages', selectedRoom?.id],
//   queryFn: () => getChatMessages(selectedRoom!.id),
//   enabled: !!selectedRoom?.id,
// });
// 목업 데이터 사용
const mockMessages: ChatMessage[] = [
  {
    id: '1',
    sender: '홍길동',
    message: '안녕하세요. 오늘 작업 일정 확인 부탁드립니다.',
    timestamp: '9:00 AM',
  },
  {
    id: '2',
    sender: '리처드',
    message: '네, 확인했습니다. 오후 2시부터 시작하겠습니다.',
    timestamp: '9:01 AM',
  },
  {
    id: '3',
    sender: '홍길동',
    message: '감사합니다.',
    timestamp: '9:02 AM',
    isOwn: true,
  },
];

// TODO: TanStack Query Hook(useQuery)으로 참가자 목록 가져오기
// const { data: participants, isLoading: participantsLoading } = useQuery({
//   queryKey: ['chatParticipants', selectedRoom?.id],
//   queryFn: () => getChatParticipants(selectedRoom!.id),
//   enabled: !!selectedRoom?.id,
// });
// 목업 데이터 사용
const mockParticipants = [
  { name: '유승언', role: 'CEO' },
  { name: '최유연', role: 'CTO' },
  { name: '김하루', role: '대리' },
  { name: '박하나', role: '팀장' },
  { name: '이철수', role: '사원' },
  { name: '정영희', role: '과장' },
  { name: '강민수', role: '대리' },
  { name: '윤지영', role: '주임' },
];

export function ChatView({ title = '채팅', description, sx }: Props) {
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [messageInput, setMessageInput] = useState('');

  // TODO: TanStack Query Hook(useMutation)으로 메시지 전송
  // const sendMessageMutation = useMutation({
  //   mutationFn: (message: string) => sendChatMessage(selectedRoom!.id, message),
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({ queryKey: ['chatMessages', selectedRoom!.id] });
  //     setMessageInput('');
  //   },
  // });
  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedRoom) return;
    // sendMessageMutation.mutate(messageInput);
    console.log('메시지 전송:', messageInput);
    setMessageInput('');
  };

  // TODO: TanStack Query Hook(useMutation)으로 참가자 초대
  // const inviteParticipantMutation = useMutation({
  //   mutationFn: (email: string) => inviteChatParticipant(selectedRoom!.id, email),
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({ queryKey: ['chatParticipants', selectedRoom!.id] });
  //   },
  // });
  const handleInviteParticipant = () => {
    // 참가자 초대 모달 열기 또는 직접 초대
    // inviteParticipantMutation.mutate(email);
    console.log('참가자 초대');
  };

  // TODO: TanStack Query Hook(useMutation)으로 참가자 내보내기
  // const removeParticipantMutation = useMutation({
  //   mutationFn: (participantIds: string[]) => removeChatParticipants(selectedRoom!.id, participantIds),
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({ queryKey: ['chatParticipants', selectedRoom!.id] });
  //   },
  // });
  const handleRemoveParticipants = (participantIds: string[]) => {
    // removeParticipantMutation.mutate(participantIds);
    console.log('참가자 내보내기:', participantIds);
  };

  const renderContent = () => (
    <>
      <Box
        sx={{
          mt: 3,
          display: 'flex',
          flexDirection: { xs: 'column', lg: 'row' },
          height: { xs: 'auto', lg: 'calc(100vh - 300px)' },
          minHeight: { xs: 'auto', lg: 600 },
          bgcolor: 'background.paper',
          borderRadius: 2,
          overflow: 'hidden',
          boxShadow: (theme) => theme.customShadows.card,
          gap: 0,
        }}
      >
        {/* 좌측 채팅 목록 */}
        <LeftSection
          rooms={mockChatRooms}
          selectedRoomId={selectedRoom?.id || null}
          onSelectRoom={(room) => {
            setSelectedRoom(room);
            // TODO: 채팅방 선택 시 TanStack Query로 메시지 목록 자동 새로고침
            // queryClient.invalidateQueries({ queryKey: ['chatMessages', room.id] });
            // queryClient.invalidateQueries({ queryKey: ['chatParticipants', room.id] });
            // queryClient.invalidateQueries({ queryKey: ['chatAttachments', room.id] });
          }}
        />

        {/* 중앙 채팅 메시지 영역 + 우측 상세 정보 */}
        <Box
          sx={{
            flex: { xs: 'none', lg: 1 },
            display: 'flex',
            flexDirection: 'column',
            minWidth: 0,
            height: { xs: 'auto', lg: '100%' },
            overflow: 'hidden',
          }}
        >
          {selectedRoom ? (
            <>
              {/* 채팅 헤더 (전체 너비 - 중앙 + 우측을 모두 포함) */}
              <Box
                sx={{
                  width: '100%',
                  flexShrink: 0,
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <ChatHeader room={selectedRoom} />
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', lg: 'row' },
                  flex: 1,
                  overflow: 'hidden',
                  minHeight: 0,
                  width: '100%',
                }}
              >
                {/* 중앙 메시지 영역 */}
                <Box
                  sx={{
                    flex: { xs: 'none', lg: 1 },
                    display: 'flex',
                    flexDirection: 'column',
                    minWidth: 0,
                    height: { xs: 'auto', lg: '100%' },
                    overflow: 'hidden',
                  }}
                >
                  <CenterSection
                    room={selectedRoom}
                    messages={mockMessages}
                    messageInput={messageInput}
                    onMessageInputChange={setMessageInput}
                    onSendMessage={handleSendMessage}
                    emergencyStats={
                      // TODO: TanStack Query Hook(useQuery)으로 응급 통계 가져오기
                      // const { data: stats } = useQuery({
                      //   queryKey: ['emergencyStats', selectedRoom.id],
                      //   queryFn: () => getEmergencyStats(selectedRoom.id),
                      //   enabled: selectedRoom.type === 'emergency',
                      // });
                      selectedRoom.type === 'emergency' ? { month: 8, count: 3 } : undefined
                    }
                  />
                </Box>

                {/* 우측 채팅 상세 정보 */}
                <RightSection
                  participants={mockParticipants}
                  onInvite={handleInviteParticipant}
                  onRemove={handleRemoveParticipants}
                  attachments={
                    // TODO: TanStack Query Hook(useQuery)으로 첨부 파일 목록 가져오기
                    // const { data: attachments } = useQuery({
                    //   queryKey: ['chatAttachments', selectedRoom.id],
                    //   queryFn: () => getChatAttachments(selectedRoom.id),
                    //   enabled: !!selectedRoom.id,
                    // });
                    [
                      {
                        name: '사고 현장 보고',
                        type: 'image',
                        date: '2025-10-28 화요일 16:45:35',
                      },
                      {
                        name: '포크레인 사고 현장',
                        type: 'image',
                        date: '2025-10-27 월요일 12:45:35',
                      },
                      {
                        name: 'money-popup-crack.pdf',
                        type: 'pdf',
                        date: '2025-10-25 토요일 12:45:35',
                      },
                      {
                        name: 'fraction-health-sao-tome-...',
                        type: 'txt',
                        date: '2025-10-20 월요일 10:45:35',
                      },
                      {
                        name: 'large-news.txt',
                        type: 'txt',
                        date: '2025-10-20 월요일 09:45:35',
                      },
                    ]
                  }
                />
              </Box>
            </>
          ) : (
            <Box
              sx={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'text.secondary',
              }}
            >
              <Typography variant="h6">채팅방을 선택해주세요</Typography>
            </Box>
          )}
        </Box>
      </Box>
    </>
  );

  return (
    <DashboardContent maxWidth="xl">
      <Typography variant="h4">{title}</Typography>
      {description && <Typography sx={{ mt: 1 }}>{description}</Typography>}

      <ChatBreadcrumbs
        items={[
          { label: '대시보드', href: '/dashboard' },
          { label: '현장 운영 관리', href: '/dashboard/operation' },
          { label: '채팅' },
        ]}
      />

      <Box sx={[(theme) => ({ mt: 2, width: 1 }), ...(Array.isArray(sx) ? sx : [sx])]}>
        {renderContent()}
      </Box>
    </DashboardContent>
  );
}
