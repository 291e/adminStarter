import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router';

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

type Props = {
  title?: string;
  description?: string;
  sx?: SxProps<Theme>;
};

import {
  mockChatRooms,
  mockChatMessagesByRoom,
  mockChatParticipants,
  mockChatbotParticipants,
  mockEmergencyParticipants,
} from 'src/_mock/_chat';
import type { ChatRoom } from 'src/_mock/_chat';

export function ChatView({ title = '채팅', description, sx }: Props) {
  const [searchParams] = useSearchParams();
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [messageInput, setMessageInput] = useState('');

  // URL 쿼리 파라미터에서 roomId를 읽어서 초기 채팅방 선택
  useEffect(() => {
    const roomId = searchParams.get('roomId');
    if (roomId) {
      const room = mockChatRooms.find((r) => r.id === roomId);
      if (room) {
        setSelectedRoom(room);
      }
    }
  }, [searchParams]);

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
        rooms={mockChatRooms.map((room) => {
          // 채팅방별 메시지 목록에서 마지막 메시지 정보 가져오기
          const roomMessages = mockChatMessagesByRoom[room.id] || [];
          const lastMessage =
            roomMessages.length > 0 ? roomMessages[roomMessages.length - 1] : null;

          // 채팅방 타입 자동 설정
          let roomType = room.type;
          if (!roomType) {
            if (room.isGroup) {
              roomType = 'group';
            } else {
              roomType = 'normal';
            }
          }

          return {
            ...room,
            type: roomType,
            lastMessage: lastMessage?.message || room.lastMessage || '',
            lastMessageTime: lastMessage?.timestamp || room.lastMessageTime || '',
          };
        })}
        selectedRoomId={selectedRoom?.id || null}
        onSelectRoom={(room) => {
          // 채팅방 타입 자동 설정
          let roomType = room.type;
          if (!roomType) {
            if (room.isGroup) {
              roomType = 'group';
            } else {
              roomType = 'normal';
            }
          }
          setSelectedRoom({ ...room, type: roomType });
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
                  messages={
                    // TODO: TanStack Query Hook(useQuery)으로 채팅방별 메시지 목록 조회
                    // const { data: messages } = useQuery({
                    //   queryKey: ['chatMessages', selectedRoom.id],
                    //   queryFn: () => getChatMessages(selectedRoom.id),
                    //   enabled: !!selectedRoom.id,
                    // });
                    // 임시: 채팅방별 메시지 목록 사용
                    mockChatMessagesByRoom[selectedRoom.id] || []
                  }
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
                room={selectedRoom}
                participants={
                  // TODO: TanStack Query Hook(useQuery)으로 채팅방 타입별 참가자 목록 조회
                  // const { data: participants } = useQuery({
                  //   queryKey: ['chatParticipants', selectedRoom.id, selectedRoom.type],
                  //   queryFn: () => {
                  //     if (selectedRoom.type === 'chatbot') {
                  //       return getChatbotParticipants(selectedRoom.id);
                  //     } else if (selectedRoom.type === 'emergency') {
                  //       return getEmergencyParticipants(selectedRoom.id);
                  //     } else {
                  //       return getNormalParticipants(selectedRoom.id);
                  //     }
                  //   },
                  //   enabled: !!selectedRoom,
                  // });
                  // 임시: 채팅방 타입에 따라 다른 목업 데이터 사용
                  (() => {
                    if (selectedRoom.type === 'chatbot') {
                      return mockChatbotParticipants;
                    } else if (selectedRoom.type === 'emergency') {
                      return mockEmergencyParticipants;
                    } else if (selectedRoom.type === 'normal') {
                      // 일반 채팅(1대1): 메시지에 참여한 사람들 중에서 채팅방 이름과 일치하는 참가자만 표시
                      // TODO: API 연동 시 현재 사용자 정보로 필터링
                      // const currentUserName = user?.displayName || user?.name || '';
                      const roomMessages = mockChatMessagesByRoom[selectedRoom.id] || [];
                      // 메시지에 참여한 사람들 추출 (중복 제거)
                      const messageSenders = Array.from(
                        new Set(roomMessages.map((msg) => msg.sender))
                      );
                      // 채팅방 이름과 일치하는 참가자 찾기
                      const matchedParticipant = mockChatParticipants.find(
                        (p) => p.name === selectedRoom.name
                      );
                      if (matchedParticipant) {
                        return [matchedParticipant];
                      }
                      // 메시지에 참여한 사람 중에서 채팅방 이름과 일치하는 사람 찾기
                      const senderParticipant = mockChatParticipants.find((p) =>
                        messageSenders.includes(p.name)
                      );
                      if (senderParticipant && messageSenders.includes(selectedRoom.name)) {
                        return [senderParticipant];
                      }
                      // 일치하는 참가자가 없으면 채팅방 이름으로 참가자 생성 (임시)
                      return [{ name: selectedRoom.name, role: '사원' }];
                    } else {
                      // 그룹 채팅: 메시지에 참여한 사람들을 참가자로 표시
                      const roomMessages = mockChatMessagesByRoom[selectedRoom.id] || [];
                      const messageSenders = Array.from(
                        new Set(roomMessages.map((msg) => msg.sender))
                      );
                      // 메시지에 참여한 사람들을 참가자로 변환
                      const participantsFromMessages = messageSenders
                        .map((sender) => {
                          const existingParticipant = mockChatParticipants.find(
                            (p) => p.name === sender
                          );
                          return existingParticipant || { name: sender, role: '사원' };
                        })
                        .filter((p) => p); // null 제거
                      // 그룹 채팅 멤버 정보가 있으면 우선 사용
                      if (selectedRoom.members && selectedRoom.members.length > 0) {
                        return selectedRoom.members
                          .map((memberName) => {
                            const existingParticipant = mockChatParticipants.find(
                              (p) => p.name === memberName
                            );
                            return existingParticipant || { name: memberName, role: '사원' };
                          })
                          .filter((p) => p);
                      }
                      // 메시지 참여자가 있으면 사용, 없으면 전체 참가자 표시
                      return participantsFromMessages.length > 0
                        ? participantsFromMessages
                        : mockChatParticipants;
                    }
                  })()
                }
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
