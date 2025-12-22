import { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router';
import { useQueryClient } from '@tanstack/react-query';

import type { SxProps, Theme } from '@mui/material/styles';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

import { DashboardContent } from 'src/layouts/dashboard';

import ChatBreadcrumbs from './components/Breadcrumbs';
import LeftSection from './components/LeftSection';
import CenterSection from './components/CenterSection';
import RightSection from './components/RightSection';
import ChatHeader from './components/ui/ChatHeader';
import SharedDocumentDetailModal from './components/SharedDocumentDetailModal';

import {
  useGetChatRooms,
  useUpdateChatRoom,
  useCreateChatRoom,
  useRemoveParticipants,
  useLeaveChatRoom,
  useGetAttachments,
  useGetParticipants,
  useUpdateLastReadAt,
} from './hooks/use-chat-api';
import { useChatRoomFirebase } from './hooks/use-chat-room-firebase';
import { useMyInfo } from './hooks/use-my-info';
import { fDate, fTime } from 'src/utils/format-time';
import type {
  ChatRoomDto,
  ChatParticipantDto,
  ChatAttachmentDto,
} from 'src/services/chat/chat.types';
import { sendChatbotMessage } from 'src/services/member/member.service';

// ----------------------------------------------------------------------

type Props = {
  title?: string;
  description?: string;
  sx?: SxProps<Theme>;
};

type ChatbotMessage = {
  id: string;
  sender: string;
  message: string;
  timestamp: string;
  dateLabel?: string;
  avatarUrl?: string;
  isOwn: boolean;
};

export function ChatView({ title = '채팅', description, sx }: Props) {
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const [selectedRoom, setSelectedRoom] = useState<ChatRoomDto | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [isChatbotRoom, setIsChatbotRoom] = useState(false);
  const [chatbotMessages, setChatbotMessages] = useState<ChatbotMessage[]>([]);
  const [errorSnackbar, setErrorSnackbar] = useState<{ open: boolean; message: string }>({
    open: false,
    message: '',
  });
  const [documentDetailModalOpen, setDocumentDetailModalOpen] = useState(false);
  const [selectedDocumentIdx, setSelectedDocumentIdx] = useState<number | null>(null);

  // 백엔드 API에서 채팅방 목록 조회
  const { data: chatRoomsData, isLoading: isRoomsLoading } = useGetChatRooms();
  // axios 인터셉터가 평탄화하므로 body를 거치지 않고 직접 접근
  const rooms = useMemo(() => {
    const list =
      (chatRoomsData as any)?.chatRoomList || (chatRoomsData as any)?.body?.chatRoomList || [];
    return Array.isArray(list) ? list : [];
  }, [chatRoomsData]);

  // 내 정보 (Firebase 메시지 전송 시 memberIdx 사용)
  const { data: myInfoData } = useMyInfo();
  const currentMemberIdx = useMemo(() => {
    if (!myInfoData) {
      return null;
    }

    const candidates = [
      (myInfoData as any)?.memberIdx,
      (myInfoData as any)?.memberIndex,
      (myInfoData as any)?.member?.memberIdx,
      (myInfoData as any)?.member?.memberIndex,
    ];

    for (const candidate of candidates) {
      const parsed = Number(candidate);
      if (!Number.isNaN(parsed) && parsed > 0) {
        return parsed;
      }
    }
    return null;
  }, [myInfoData]);

  // 채팅방 변이 훅
  const updateChatRoomMutation = useUpdateChatRoom();
  const createChatRoomMutation = useCreateChatRoom();
  const removeParticipantsMutation = useRemoveParticipants();
  const leaveChatRoomMutation = useLeaveChatRoom();
  const updateLastReadAtMutation = useUpdateLastReadAt();

  // 선택된 채팅방의 Firebase 메시지 수신 (챗봇방이 아닐 때만)
  const { messages: firebaseMessages, sendMessage } = useChatRoomFirebase({
    chatRoomId: !isChatbotRoom ? selectedRoom?.chatRoomId : undefined,
    chatRoomIdx: !isChatbotRoom ? selectedRoom?.chatRoomIdx : undefined,
    memberIdx: currentMemberIdx ?? undefined,
  });

  const normalizeParticipants = (
    participants?: ChatParticipantDto[] | Record<string, ChatParticipantDto>
  ): ChatParticipantDto[] => {
    if (!participants) {
      return [];
    }

    if (Array.isArray(participants)) {
      return participants.map((p) => {
        const avatar = (p as any).avatar;
        return {
          ...p,
          profileImage: p.profileImage || avatar || undefined,
        };
      });
    }

    return Object.entries(participants).map(([key, value]) => {
      const avatar = (value as any).avatar;
      return {
        ...(value as ChatParticipantDto),
        memberIdx: (value as any)?.memberIdx ?? (value as any)?.memberIndex ?? Number(key),
        profileImage: (value as ChatParticipantDto).profileImage || avatar || undefined,
      };
    });
  };

  // 참가자 목록 API 조회 (챗봇방이 아닐 때만)
  const { data: participantsData } = useGetParticipants(
    !isChatbotRoom && selectedRoom?.chatRoomIdx ? selectedRoom.chatRoomIdx : 0
  );

  // API 응답에서 참가자 목록 추출
  const participantsFromAPI: ChatParticipantDto[] = useMemo(() => {
    if (!participantsData) return [];

    // axios 인터셉터가 평탄화하므로 body를 거치지 않고 직접 접근
    // 응답 구조: { header: {...}, participantList: [...], totalCount: 3 }
    const rawParticipants =
      (participantsData as any).participantList ||
      (participantsData as any).participants ||
      (participantsData as any).body?.participantList ||
      (participantsData as any).body?.participants ||
      [];

    // API 응답 구조를 ChatParticipantDto로 매핑 (memberRole도 함께 저장)
    return rawParticipants.map((p: any): ChatParticipantDto & { memberRole?: string } => {
      const avatar = p.avatar || p.memberThumbnail || p.profileImage;
      return {
        memberIdx: p.memberIdx,
        name: p.memberName || p.name || `사용자 ${p.memberIdx}`,
        profileImage: avatar || undefined,
        unreadCount: p.unreadCount,
        joinedAt: p.joinedAt,
        lastSeen: p.lastReadAt,
        online: p.isActive === 1 ? 1 : 0,
        memberRole: p.memberRole, // 원본 memberRole 저장
      };
    });
  }, [participantsData]);

  // 참가자 목록: API 응답 우선, 없으면 selectedRoom.participants 사용
  const participantsFromRoom: ChatParticipantDto[] = useMemo(() => {
    if (participantsFromAPI.length > 0) {
      return participantsFromAPI;
    }
    return normalizeParticipants(selectedRoom?.participants);
  }, [participantsFromAPI, selectedRoom]);

  const participantLookup = useMemo(() => {
    const map = new Map<number, { name: string; avatarUrl?: string }>();

    participantsFromRoom.forEach((participant) => {
      const idx = Number((participant as any)?.memberIdx ?? (participant as any)?.memberIndex);
      if (!Number.isNaN(idx)) {
        map.set(idx, {
          name: participant.name || (participant as any)?.memberName || `사용자 ${idx}`,
          avatarUrl: participant.profileImage || (participant as any)?.memberThumbnail,
        });
      }
    });

    return map;
  }, [participantsFromRoom]);

  const parseTimestamp = (value: string) => {
    const numeric = Number(value);
    if (!Number.isNaN(numeric)) {
      return new Date(numeric);
    }
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
    return null;
  };

  const chatMessages = useMemo(() => {
    // 챗봇방이면 챗봇 메시지 반환
    if (isChatbotRoom) {
      return chatbotMessages;
    }

    // 일반 채팅방이면 Firebase 메시지 반환
    return firebaseMessages.map((msg) => {
      const senderInfo = participantLookup.get(msg.senderMemberIdx);
      const senderName = senderInfo?.name || `사용자 ${msg.senderMemberIdx}`;
      const avatarUrl = senderInfo?.avatarUrl;
      const dateValue = parseTimestamp(msg.timestamp);
      const dateLabel = dateValue ? fDate(dateValue, 'YYYY년 M월 D일') : undefined;
      const timeLabel = dateValue ? fTime(dateValue, 'HH:mm') : msg.timestamp;

      return {
        id: msg.id,
        sender: senderName,
        avatarUrl,
        message: msg.message,
        timestamp: timeLabel,
        dateLabel,
        isOwn: currentMemberIdx === msg.senderMemberIdx,
        messageType: msg.messageType,
        sharedDocumentIdx: msg.sharedDocumentIdx,
      };
    });
  }, [firebaseMessages, chatbotMessages, isChatbotRoom, participantLookup, currentMemberIdx]);

  const conversationDateLabel = chatMessages[0]?.dateLabel;

  // URL 쿼리 파라미터에서 roomId를 읽어서 초기 채팅방 선택
  useEffect(() => {
    const roomId = searchParams.get('roomId');
    if (roomId && rooms.length > 0) {
      const room = rooms.find((r: ChatRoomDto) => r.chatRoomId === roomId);
      if (room) {
        setSelectedRoom(room);
      }
    }
  }, [searchParams, rooms]);

  // 이전 chatRoomIdx 추적 (무한 루프 방지)
  const prevChatRoomIdxRef = useRef<number | undefined>(undefined);
  // mutation 함수를 ref에 저장 (의존성 배열 문제 해결)
  const updateLastReadAtRef = useRef(updateLastReadAtMutation.mutate);
  updateLastReadAtRef.current = updateLastReadAtMutation.mutate;

  // 채팅방 선택 시 마지막 읽은 시간 업데이트 (챗봇방 제외)
  useEffect(() => {
    const currentChatRoomIdx = selectedRoom?.chatRoomIdx;

    // 챗봇방이 아니고, chatRoomIdx가 있고, 이전 값과 다를 때만 호출
    if (!isChatbotRoom && currentChatRoomIdx && currentChatRoomIdx !== prevChatRoomIdxRef.current) {
      prevChatRoomIdxRef.current = currentChatRoomIdx;
      const timestamp = new Date().toISOString();
      updateLastReadAtRef.current({
        chatRoomIdx: currentChatRoomIdx,
        timestamp,
      });
    }
  }, [selectedRoom?.chatRoomIdx, isChatbotRoom]);

  const handleSendMessage = async (attachments?: string[]) => {
    // 메시지가 없고 첨부파일도 없으면 전송하지 않음
    if (!messageInput.trim() && !attachments?.length) return;

    // 챗봇방인 경우 (이미지는 지원하지 않음)
    if (isChatbotRoom) {
      if (!currentMemberIdx) {
        console.error('현재 사용자 식별자를 확인할 수 없습니다.');
        return;
      }

      try {
        const userMessage: ChatbotMessage = {
          id: `chatbot-${Date.now()}-user`,
          sender: '나',
          message: messageInput.trim(),
          timestamp: fTime(new Date(), 'HH:mm'),
          dateLabel: fDate(new Date(), 'YYYY년 M월 D일'),
          isOwn: true,
        };

        // 사용자 메시지 추가
        setChatbotMessages((prev) => [...prev, userMessage]);
        setMessageInput('');

        // 챗봇 API 호출
        await sendChatbotMessage({
          memberIndexes: [currentMemberIdx],
          message: messageInput.trim(),
        });

        // 챗봇 응답 메시지 (일단 임시로 추가, 나중에 API 응답으로 교체)
        // TODO: API 응답에서 실제 챗봇 응답을 받아서 추가
        const botMessage: ChatbotMessage = {
          id: `chatbot-${Date.now()}-bot`,
          sender: '챗봇',
          message: '메시지를 전송했습니다. 챗봇 응답은 백엔드에서 처리됩니다.',
          timestamp: fTime(new Date(), 'HH:mm'),
          dateLabel: fDate(new Date(), 'YYYY년 M월 D일'),
          isOwn: false,
        };

        setTimeout(() => {
          setChatbotMessages((prev) => [...prev, botMessage]);
        }, 500);
      } catch (error) {
        console.error('Failed to send chatbot message:', error);
      }
      return;
    }

    // 일반 채팅방인 경우
    if (!selectedRoom) return;

    try {
      // 첨부파일이 있으면 IMAGE 타입으로, 없으면 TEXT 타입으로 전송
      const messageType = attachments?.length ? 'IMAGE' : 'TEXT';
      await sendMessage(messageInput.trim() || '', messageType, attachments);
      setMessageInput('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleInviteParticipant = async () => {
    // ParticipantList의 InviteParticipantModal에서 직접 API 호출하므로 여기서는 빈 함수
  };

  const handleRemoveParticipants = async (participantIds: string[]) => {
    if (!selectedRoom?.chatRoomIdx || participantIds.length === 0) return;

    try {
      // participantIds를 memberIndexes로 변환
      const memberIndexes = participantIds
        .map((id) => {
          const parsed = Number(id);
          if (!Number.isNaN(parsed)) return parsed;

          const participant = participantsFromRoom.find((p) => {
            const pId = (p as any)?.memberIdx?.toString() || (p as any)?.id;
            return pId === id;
          });
          return participant?.memberIdx ? Number(participant.memberIdx) : null;
        })
        .filter((idx): idx is number => idx !== null && !Number.isNaN(idx));

      if (memberIndexes.length === 0) {
        console.error('유효한 참가자 인덱스를 찾을 수 없습니다.');
        return;
      }

      await removeParticipantsMutation.mutateAsync({
        chatRoomIdx: selectedRoom.chatRoomIdx,
        memberIndexes,
      });
    } catch (error) {
      console.error('참가자 내보내기 실패:', error);
    }
  };

  const handleRoomNameChange = async (newName: string) => {
    if (selectedRoom) {
      try {
        await updateChatRoomMutation.mutateAsync({
          chatRoomIdx: selectedRoom.chatRoomIdx,
          name: newName,
        });
        // 성공 시 selectedRoom 업데이트는 useUpdateChatRoom의 onSuccess에서 쿼리 무효화로 처리됨
        // 하지만 UI 즉각 반영을 위해 로컬 상태 업데이트도 가능
        setSelectedRoom((prev) => (prev ? { ...prev, name: newName } : null));
      } catch (error) {
        console.error('Failed to rename room:', error);
      }
    }
  };

  const handleLeaveRoom = () => {
    if (!selectedRoom?.chatRoomIdx) return;

    leaveChatRoomMutation.mutate(
      { chatRoomIdx: selectedRoom.chatRoomIdx },
      {
        onSuccess: () => {
          setSelectedRoom(null);
        },
        onError: (error: any) => {
          // 에러 처리 (필요시 Toast 메시지 표시)
          console.error('채팅방 나가기 실패:', error);
        },
      }
    );
  };

  const handleFileMessageClick = (sharedDocumentIdx: number) => {
    setSelectedDocumentIdx(sharedDocumentIdx);
    setDocumentDetailModalOpen(true);
  };

  const handleCloseDocumentDetailModal = () => {
    setDocumentDetailModalOpen(false);
    setSelectedDocumentIdx(null);
  };

  const handleCreateRoom = async (roomName: string, memberIndexes: number[]) => {
    try {
      // 채팅방 생성
      const createResponse = await createChatRoomMutation.mutateAsync({
        memberIndexes,
      });

      // axios 인터셉터가 평탄화하므로 body를 거치지 않고 직접 접근
      // 응답 구조: { header: {...}, chatRoomIdx: number, chatRoomId: string }
      const chatRoomIdx =
        (createResponse as any).chatRoomIdx ||
        (createResponse as any).body?.chatRoomIdx ||
        (createResponse as any).data?.chatRoomIdx;

      if (!chatRoomIdx) {
        console.warn('채팅방 생성 응답에서 chatRoomIdx를 찾을 수 없습니다:', createResponse);
        return;
      }

      // 채팅방 생성 후 쿼리 무효화가 완료될 때까지 기다림
      await queryClient.invalidateQueries({ queryKey: ['chatRooms'] });
      // 쿼리 리패치 완료 대기
      await queryClient.refetchQueries({ queryKey: ['chatRooms'] });

      // 생성 성공 후 채팅방 이름이 있으면 이름 변경
      if (roomName.trim()) {
        // 추가 지연을 두어 트랜잭션이 완전히 커밋되도록 함
        await new Promise((resolve) => setTimeout(resolve, 500));

        try {
          await updateChatRoomMutation.mutateAsync({
            chatRoomIdx: Number(chatRoomIdx),
            name: roomName.trim(),
          });
        } catch (updateError: any) {
          // 이름 변경 실패는 별도로 처리 (채팅방은 이미 생성됨)
          console.error('채팅방 이름 변경 실패:', updateError);
          const updateErrorMessage =
            updateError?.response?.data?.header?.resultMessage ||
            updateError?.message ||
            '채팅방은 생성되었지만 이름 변경에 실패했습니다.';
          setErrorSnackbar({
            open: true,
            message: updateErrorMessage,
          });
        }
      }
    } catch (error: any) {
      // API 응답에서 에러 메시지 추출
      const errorMessage =
        error?.response?.data?.header?.resultMessage ||
        error?.response?.data?.resultMessage ||
        error?.message ||
        '채팅방 생성에 실패했습니다.';

      // resultCode가 500이면 중복 채팅방 생성 시도로 간주
      const resultCode =
        error?.response?.data?.header?.resultCode || error?.response?.data?.resultCode;
      const isDuplicateError = resultCode === 500;

      setErrorSnackbar({
        open: true,
        message: isDuplicateError
          ? '이미 존재하는 채팅방입니다. 중복 채팅방을 생성할 수 없습니다.'
          : errorMessage,
      });
    }
  };

  // LeftSection용 ChatRoomDto 배열 (customRoomName 우선 사용)
  const leftSectionRooms: ChatRoomDto[] = rooms.map((room: ChatRoomDto) => {
    const participants = normalizeParticipants(room.participants);
    const currentParticipant = participants.find(
      (participant) =>
        Number(participant.memberIdx ?? (participant as any)?.memberIndex) === currentMemberIdx
    );

    // customRoomName 우선 사용, 없으면 room.name 사용
    const displayName = currentParticipant?.customRoomName || room.name;

    return {
      ...room,
      name: displayName, // 표시용 이름으로 교체
      unreadCount: currentParticipant?.unreadCount ?? room.unreadCount ?? 0,
      participants,
    };
  });

  // RightSection용 참가자 목록 변환 (본인 제외)
  const rightSectionParticipants: ChatParticipantDto[] = useMemo(() => {
    if (!currentMemberIdx) return [];

    // 본인을 제외한 모든 참가자 반환
    return participantsFromRoom.filter((p: ChatParticipantDto) => {
      const participantIdx = Number(p.memberIdx ?? (p as any)?.memberIndex);
      return participantIdx !== currentMemberIdx;
    });
  }, [participantsFromRoom, currentMemberIdx]);

  // 첨부파일 조회
  const { data: attachmentsData } = useGetAttachments(selectedRoom?.chatRoomIdx || 0);
  const attachments: ChatAttachmentDto[] = useMemo(() => {
    if (!attachmentsData) return [];

    const rawAttachments =
      (attachmentsData as any)?.attachments || (attachmentsData as any)?.body?.attachments || [];

    return rawAttachments.map(
      (att: any): ChatAttachmentDto => ({
        id: att.id || '',
        name: att.name || '',
        type: att.type || 'txt',
        url: att.url || '',
        createdAt: att.createdAt || '',
      })
    );
  }, [attachmentsData]);

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
        rooms={leftSectionRooms}
        selectedRoomId={isChatbotRoom ? 'chatbot' : selectedRoom?.chatRoomId || null}
        onSelectRoom={(room) => {
          // 챗봇방 선택
          if (room.chatRoomId === 'chatbot' || room.type === 'CHATBOT') {
            setIsChatbotRoom(true);
            setSelectedRoom(null);
            return;
          }

          // 일반 채팅방 선택
          setIsChatbotRoom(false);
          setSelectedRoom(room);
        }}
        onCreateRoom={handleCreateRoom}
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
        {selectedRoom || isChatbotRoom ? (
          <>
            {/* 채팅 헤더 */}
            <Box sx={{ width: '100%', flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
              <ChatHeader
                room={
                  isChatbotRoom
                    ? {
                        chatRoomIdx: 0,
                        chatRoomId: 'chatbot',
                        name: '챗봇',
                        type: 'CHATBOT',
                        isGroup: 0,
                      }
                    : (() => {
                        // selectedRoom의 participants에서 현재 사용자의 customRoomName 찾기
                        const participants = normalizeParticipants(selectedRoom?.participants);
                        const currentParticipant = participants.find(
                          (p) => Number(p.memberIdx ?? (p as any)?.memberIndex) === currentMemberIdx
                        );
                        const displayName =
                          currentParticipant?.customRoomName || selectedRoom?.name || '';
                        return {
                          ...selectedRoom!,
                          name: displayName,
                        };
                      })()
                }
                participants={isChatbotRoom ? [] : rightSectionParticipants}
                onRoomNameChange={handleRoomNameChange}
                onLeaveRoom={handleLeaveRoom}
              />
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
                  room={
                    isChatbotRoom
                      ? {
                          chatRoomIdx: 0,
                          chatRoomId: 'chatbot',
                          name: '챗봇',
                          type: 'CHATBOT',
                          isGroup: 0,
                        }
                      : selectedRoom!
                  }
                  messages={chatMessages}
                  conversationDate={conversationDateLabel}
                  messageInput={messageInput}
                  onMessageInputChange={setMessageInput}
                  onSendMessage={handleSendMessage}
                  emergencyStats={
                    selectedRoom?.type === 'EMERGENCY' ? { month: 8, count: 3 } : undefined
                  }
                  onFileMessageClick={handleFileMessageClick}
                />
              </Box>

              {/* 우측 채팅 상세 정보 (챗봇방이 아닐 때만 표시) */}
              {!isChatbotRoom && selectedRoom && (
                <RightSection
                  room={selectedRoom}
                  participants={rightSectionParticipants}
                  onInvite={handleInviteParticipant}
                  onRemove={handleRemoveParticipants}
                  attachments={attachments}
                />
              )}
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

  if (isRoomsLoading) {
    return (
      <DashboardContent maxWidth="xl">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
          <CircularProgress />
        </Box>
      </DashboardContent>
    );
  }

  return (
    <DashboardContent maxWidth="xl">
      <Typography variant="h4">{title}</Typography>
      {description && <Typography sx={{ mt: 1 }}>{description}</Typography>}

      <ChatBreadcrumbs
        items={[
          { label: '대시보드', href: '/admin/dashboard' },
          { label: '현장 운영 관리', href: '/admin/dashboard/operation' },
          { label: '채팅' },
        ]}
      />

      <Box sx={[(theme) => ({ mt: 2, width: 1 }), ...(Array.isArray(sx) ? sx : [sx])]}>
        {renderContent()}
      </Box>
      <Snackbar
        open={errorSnackbar.open}
        autoHideDuration={6000}
        onClose={() => setErrorSnackbar({ open: false, message: '' })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setErrorSnackbar({ open: false, message: '' })}
          severity="error"
          variant="filled"
          sx={{ width: '100%' }}
        >
          {errorSnackbar.message}
        </Alert>
      </Snackbar>

      {/* 공유 문서 상세 모달 */}
      {selectedDocumentIdx && (
        <SharedDocumentDetailModal
          open={documentDetailModalOpen}
          onClose={handleCloseDocumentDetailModal}
          sharedDocumentIdx={selectedDocumentIdx}
        />
      )}
    </DashboardContent>
  );
}
