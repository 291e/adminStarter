import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { collection, getDocs, query, Timestamp, where } from 'firebase/firestore';
import { auth, firestore } from 'src/config/firebase';
import { CONFIG } from 'src/global-config';

import type { SxProps, Theme } from '@mui/material/styles';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

import { DashboardContent } from 'src/layouts/dashboard';
import { useAuthContext } from 'src/auth/hooks/use-auth-context';

import ChatBreadcrumbs from './components/Breadcrumbs';
import LeftSection from './components/LeftSection';
import CenterSection from './components/CenterSection';
import RightSection from './components/RightSection';
import ChatHeader from './components/ui/ChatHeader';
import SharedDocumentDetailModal from './components/SharedDocumentDetailModal';
import type { ChatInputPayload } from './components/ui/ChatInput';

import { useChat2RoomsFirestore } from './hooks/use-chat2-rooms-firestore';
import { useChat2RoomFirestore } from './hooks/use-chat2-room-firestore';
import {
  useCreateChat2Room,
  useLeaveChat2Room,
  useMarkChat2Read,
  useRemoveChat2Participants,
  useRenameChat2Room,
} from './hooks/use-chat2-api';
import { useMyInfo } from './hooks/use-my-info';
import { fDate, fTime } from 'src/utils/format-time';
import { sendChatbotMessage } from 'src/services/member/member.service';
import { getChatAvatarUrl } from 'src/sections/Chat/utils/avatar';
import { resolveFileUrl } from 'src/sections/Chat/utils/file-url';
import { getCompanyMembers } from 'src/services/organization/organization.service';
import type { ChatAttachment2, ChatParticipant2, ChatRoom2 } from './chat2.types';
import type { Chat2ReplyToPayload } from 'src/services/chat2/chat2.types';

// ----------------------------------------------------------------------

type Props = {
  title?: string;
  description?: string;
  sx?: SxProps<Theme>;
};

type ChatMessageItem = {
  id: string;
  sender: string;
  senderId: string;
  message: string;
  rawMessage: string;
  timestamp: string;
  dateLabel?: string;
  avatarUrl?: string;
  isOwn: boolean;
  messageType?: 'TEXT' | 'IMAGE' | 'VIDEO' | 'FILE' | 'SYSTEM' | 'EMERGENCY';
  sharedDocumentIdx?: number;
  attachments?: string[] | null;
  translations?: Record<string, string>;
  replyTo?: {
    messageId: string;
    senderName: string;
    preview: string;
  } | null;
  replyToRaw?: Chat2ReplyToPayload | null;
  metadata?: {
    type?: string;
    location?: {
      latitude: number;
      longitude: number;
      address?: string;
    };
    replyTo?: Chat2ReplyToPayload;
    [key: string]: any;
  };
};

type ReplyComposerState = {
  messageId: string;
  senderId: string;
  senderName: string;
  messageType: NonNullable<ChatMessageItem['messageType']>;
  rawMessage: string;
  translations?: Record<string, string>;
  metadata?: Record<string, any>;
  preview: string;
};

type ReplyableMessage = {
  id: string;
  sender: string;
  senderId?: string;
  message: string;
  rawMessage?: string;
  messageType?: 'TEXT' | 'IMAGE' | 'VIDEO' | 'FILE' | 'SYSTEM' | 'EMERGENCY';
  translations?: Record<string, string>;
  metadata?: Record<string, any>;
};

export function ChatView({ title = '채팅', description, sx }: Props) {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuthContext();
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom2 | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [replyingTo, setReplyingTo] = useState<ReplyComposerState | null>(null);
  const [isChatbotRoom, setIsChatbotRoom] = useState(false);
  const [chatbotMessages, setChatbotMessages] = useState<ChatMessageItem[]>([]);
  const [errorSnackbar, setErrorSnackbar] = useState<{ open: boolean; message: string }>({
    open: false,
    message: '',
  });
  const [documentDetailModalOpen, setDocumentDetailModalOpen] = useState(false);
  const [selectedDocumentIdx, setSelectedDocumentIdx] = useState<number | null>(null);

  const { rooms, isLoading: isRoomsLoading } = useChat2RoomsFirestore(true);

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

  const uid = useMemo(() => {
    const authUid = auth.currentUser?.uid;
    if (authUid) return authUid;
    if (currentMemberIdx) return String(currentMemberIdx);
    return null;
  }, [currentMemberIdx]);

  const companyIdx = useMemo(() => {
    const candidates = [
      (myInfoData as any)?.companyIdx,
      (myInfoData as any)?.companyIndex,
      (myInfoData as any)?.company?.companyIdx,
      (myInfoData as any)?.company?.companyIndex,
      (user as any)?.companyIdx,
      (user as any)?.companyIndex,
    ];
    for (const candidate of candidates) {
      const parsed = Number(candidate);
      if (!Number.isNaN(parsed) && parsed > 0) return parsed;
    }
    return 0;
  }, [myInfoData, user]);

  const { data: membersData } = useQuery({
    queryKey: ['companyMembers', companyIdx],
    queryFn: () => getCompanyMembers(companyIdx),
    enabled: !!companyIdx,
    staleTime: 5 * 60 * 1000,
  });

  const memberMap = useMemo(() => {
    const rawMembers =
      (membersData as any)?.memberList ||
      (membersData as any)?.members ||
      (membersData as any)?.body?.memberList ||
      (membersData as any)?.body?.members ||
      [];
    const map = new Map<string, any>();
    if (Array.isArray(rawMembers)) {
      rawMembers.forEach((m: any) => {
        const id = m.memberIdx?.toString() || m.memberIndex?.toString() || m.id?.toString();
        if (!id) return;
        map.set(id, m);
      });
    }
    return map;
  }, [membersData]);

  const roomsWithParticipants: ChatRoom2[] = useMemo(
    () =>
      (rooms || []).map((room) => {
        const participants: ChatParticipant2[] = room.participantIds.map((id) => {
          const member = memberMap.get(id);
          const memberIdx = Number(id);
          return {
            memberIdx: Number.isNaN(memberIdx) ? 0 : memberIdx,
            name: member?.memberName || member?.name || `사용자 ${id}`,
            profileImage: member?.memberThumbnail || member?.profileImage || '',
            memberRole: member?.memberRole || member?.role,
            position: member?.position,
            positionName: member?.positionName || member?.position,
            department: member?.department || member?.deptName,
          };
        });
        return { ...room, participants };
      }),
    [rooms, memberMap]
  );

  const activeSelectedRoom = useMemo(() => {
    if (isChatbotRoom || !selectedRoom) return null;
    return (
      roomsWithParticipants.find(
        (room) =>
          room.chatRoomId === selectedRoom.chatRoomId ||
          room.roomId === selectedRoom.roomId
      ) || null
    );
  }, [isChatbotRoom, roomsWithParticipants, selectedRoom]);

  // 채팅방 변이 훅 (chat2)
  const createChatRoomMutation = useCreateChat2Room();
  const renameChatRoomMutation = useRenameChat2Room();
  const leaveChatRoomMutation = useLeaveChat2Room();
  const removeParticipantsMutation = useRemoveChat2Participants();
  const markReadMutation = useMarkChat2Read();

  const {
    messages: firebaseMessages,
    sendMessage,
    hasMore,
    loadMore,
    isLoadingMore,
    participants: roomParticipantDocs,
    presenceByUserId,
  } = useChat2RoomFirestore({
    chatRoomId: activeSelectedRoom?.chatRoomId,
  });

  const participantsFromRoom: ChatParticipant2[] = useMemo(() => {
    if (!activeSelectedRoom) return [];
    const byId = new Map<string, any>();
    roomParticipantDocs.forEach((p) => byId.set(p.userId, p));
    return activeSelectedRoom.participantIds.map((id) => {
      const member = memberMap.get(id);
      const baseIdx = Number(id);
      const participantDoc = byId.get(id);
      const presence = presenceByUserId[id];
      const online = presence?.state === 'active';
      const lastSeen = presence?.lastActiveAt ?? participantDoc?.lastReadAt;
      return {
        memberIdx: Number.isNaN(baseIdx) ? 0 : baseIdx,
        name: member?.memberName || member?.name || `사용자 ${id}`,
        profileImage: member?.memberThumbnail || member?.profileImage || '',
        unreadCount: participantDoc?.unreadCount,
        joinedAt: participantDoc?.joinedAt,
        lastSeen,
        online: online ? 1 : 0,
        customRoomName: participantDoc?.customRoomName,
        memberRole: member?.memberRole || member?.role,
        position: member?.position,
        positionName: member?.positionName || member?.position,
        department: member?.department || member?.deptName,
        leftAt: participantDoc?.leftAt ?? null,
        notificationsEnabled: participantDoc?.notificationsEnabled,
        mutedUntil: participantDoc?.mutedUntil ?? null,
      };
    });
  }, [activeSelectedRoom, roomParticipantDocs, presenceByUserId, memberMap]);

  const participantLookup = useMemo(() => {
    const map = new Map<
      number,
      { name: string; avatarUrl?: string; department?: string }
    >();
    participantsFromRoom.forEach((participant) => {
      const idx = Number(participant.memberIdx);
      if (!Number.isNaN(idx) && idx > 0) {
        map.set(idx, {
          name: participant.name || `사용자 ${idx}`,
          avatarUrl: getChatAvatarUrl(participant.profileImage),
          department: participant.department,
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

  const preferredLang = useMemo(() => {
    const raw =
      (myInfoData as any)?.memberLang ||
      (myInfoData as any)?.language ||
      (myInfoData as any)?.lang ||
      (myInfoData as any)?.locale;
    if (raw) return String(raw).split('-')[0];
    if (typeof navigator !== 'undefined' && navigator.language) {
      return navigator.language.split('-')[0];
    }
    return 'ko';
  }, [myInfoData]);

  const pickTranslation = (
    translations?: Record<string, string>,
    lang?: string
  ): string | undefined => {
    if (!translations) return undefined;
    const preferred = lang || 'ko';
    if (translations[preferred]) return translations[preferred];

    const aliasMap: Record<string, string[]> = {
      ko: ['ko', 'kr'],
      en: ['en'],
      vi: ['vi', 'vn'],
      vn: ['vn', 'vi'],
      zh: ['zh', 'cn'],
      ja: ['ja', 'jp'],
      th: ['th'],
      id: ['id'],
      my: ['my'],
      ne: ['ne'],
      ru: ['ru'],
      uz: ['uz'],
    };

    const aliases = aliasMap[preferred] || [];
    for (const key of aliases) {
      if (translations[key]) return translations[key];
    }

    if (translations.ko) return translations.ko;
    if (translations.en) return translations.en;
    return undefined;
  };

  const formatMessageText = (msg: any, translatedText?: string) => {
    const base = translatedText || msg.message || msg.text || '';
    const type = msg.messageType as string | undefined;
    const metadata = msg.metadata || {};
    const metadataType = String(metadata?.type || '');

    if (type === 'DELETED' || base.trim() === '__deleted__') {
      return '삭제된 메시지입니다.';
    }

    if (
      metadataType === 'rescue_request' ||
      metadataType === 'evacuation_signal' ||
      metadataType === 'accident_report'
    ) {
      return metadata.address || base || '긴급 메시지';
    }

    if (
      metadataType === 'multi_image' &&
      Array.isArray(metadata.imageUrls) &&
      metadata.imageUrls.length > 0
    ) {
      return `사진 ${metadata.imageUrls.length}장`;
    }

    if (type === 'IMAGE') {
      if (base.includes('[이미지]|')) {
        const label = base.split('[이미지]|')[0]?.trim();
        return label ? `${label} [이미지]` : '[이미지]';
      }
      return base || '[이미지]';
    }

    if (type === 'VIDEO') {
      if (base.includes('[동영상]|')) {
        return '[동영상]';
      }
      return base || '[동영상]';
    }

    if (type === 'FILE') {
      return metadata.fileName || base || '공유 문서';
    }

    if (type === 'SYSTEM') {
      return base || '시스템 메시지';
    }

    if (type === 'EMERGENCY') {
      return base || '긴급 메시지';
    }

    if (base.includes('[이미지]|')) {
      const label = base.split('[이미지]|')[0]?.trim();
      return label ? `${label} [이미지]` : '[이미지]';
    }

    if (base.includes('[동영상]|')) {
      return '[동영상]';
    }

    return base;
  };

  const resolveTranslatedMetaText = useCallback(
    (translations: Record<string, string> | undefined, fallback?: string | null) => {
      const translated = pickTranslation(translations, preferredLang);
      const resolved = translated || fallback || '';
      return resolved.trim();
    },
    [preferredLang]
  );

  const chatMessages = useMemo<ChatMessageItem[]>(() => {
    // 챗봇방이면 챗봇 메시지 반환
    if (isChatbotRoom) {
      return chatbotMessages;
    }

    // 일반 채팅방이면 Firebase 메시지 반환
    return firebaseMessages.map((msg) => {
      const senderMemberIdxNum = Number(msg.senderId);
      const senderInfo = participantLookup.get(senderMemberIdxNum);
      // senderName 우선순위: msg.senderName > participantLookup > 기본값
      const senderName = msg.senderName || senderInfo?.name || `사용자 ${msg.senderId}`;
      const avatarUrl = senderInfo?.avatarUrl;
      const dateValue = parseTimestamp(msg.timestamp || msg.createdAt?.toString() || '');
      const dateLabel = dateValue ? fDate(dateValue, 'YYYY년 M월 D일') : undefined;
      const timeLabel = dateValue ? fTime(dateValue, 'HH:mm') : msg.timestamp;

      const translated = pickTranslation(msg.translations, preferredLang);
      const messageText = formatMessageText(msg, translated);

      const rawMetadata = (msg.metadata || undefined) as any;
      const translatedSenderLabel = resolveTranslatedMetaText(
        rawMetadata?.senderLabelTranslations,
        rawMetadata?.senderLabel
      );
      const fallbackDepartment = (
        rawMetadata?.senderDepartment ||
        senderInfo?.department ||
        ''
      )
        .toString()
        .trim();
      const senderLabel =
        translatedSenderLabel ||
        (fallbackDepartment ? `${fallbackDepartment} / ${senderName}` : senderName);
      const translatedAddress =
        rawMetadata?.addressTranslations && typeof rawMetadata.addressTranslations === 'object'
          ? pickTranslation(rawMetadata.addressTranslations, preferredLang) || rawMetadata.address
          : rawMetadata?.address;
      const translatedOrganizationName =
        rawMetadata?.organizationNameTranslations &&
        typeof rawMetadata.organizationNameTranslations === 'object'
          ? pickTranslation(rawMetadata.organizationNameTranslations, preferredLang) ||
            rawMetadata.organizationName
          : rawMetadata?.organizationName;
      const metadata = rawMetadata
        ? {
            ...rawMetadata,
            address: translatedAddress ?? rawMetadata.address,
            organizationName: translatedOrganizationName ?? rawMetadata.organizationName,
            senderLabel,
          }
        : undefined;
      const replyToRaw =
        rawMetadata?.replyTo && typeof rawMetadata.replyTo === 'object'
          ? (rawMetadata.replyTo as Chat2ReplyToPayload)
          : null;
      const replyTo = !replyToRaw?.messageId
        ? null
        : (() => {
            const replyMetadata: any =
              replyToRaw.metadata && typeof replyToRaw.metadata === 'object'
                ? {
                    ...replyToRaw.metadata,
                    address:
                      replyToRaw.metadata.addressTranslations &&
                      typeof replyToRaw.metadata.addressTranslations === 'object'
                        ? pickTranslation(replyToRaw.metadata.addressTranslations, preferredLang) ||
                          replyToRaw.metadata.address
                        : replyToRaw.metadata.address,
                  }
                : replyToRaw.metadata;
            const translatedReply = pickTranslation(replyToRaw.translations, preferredLang);
            const preview = formatMessageText(
              {
                message: replyToRaw.message,
                text: replyToRaw.message,
                messageType: replyToRaw.messageType,
                metadata: replyMetadata,
              },
              translatedReply
            );

            return {
              messageId: replyToRaw.messageId,
              senderName:
                resolveTranslatedMetaText(
                  replyMetadata?.senderLabelTranslations,
                  replyMetadata?.senderLabel
                ) ||
                replyToRaw.senderName?.trim() ||
                '알 수 없음',
              preview: preview || '메시지',
            };
          })();

      return {
        id: msg.id,
        sender: senderLabel,
        senderId: String(msg.senderId || ''),
        avatarUrl,
        message: messageText,
        rawMessage: msg.message || msg.text || '',
        timestamp: timeLabel,
        dateLabel,
        isOwn: currentMemberIdx === senderMemberIdxNum,
        messageType: msg.messageType,
        sharedDocumentIdx: msg.sharedDocumentIdx,
        attachments: msg.attachments,
        translations: msg.translations,
        replyTo,
        replyToRaw,
        metadata,
      };
    });
  }, [
    firebaseMessages,
    chatbotMessages,
    isChatbotRoom,
    participantLookup,
    currentMemberIdx,
    preferredLang,
    resolveTranslatedMetaText,
  ]);

  const conversationDateLabel = chatMessages[0]?.dateLabel;

  // URL 쿼리 파라미터에서 roomId를 읽어서 초기 채팅방 선택
  useEffect(() => {
    const roomId = searchParams.get('room') || searchParams.get('roomId');
    if (!roomId) return;

    if (roomId === 'chatbot') {
      setIsChatbotRoom(true);
      setSelectedRoom(null);
      return;
    }

    if (roomsWithParticipants.length > 0) {
      const room = roomsWithParticipants.find(
        (r) => r.chatRoomId === roomId || r.roomId === roomId
      );
      if (room) {
        setIsChatbotRoom(false);
        setSelectedRoom(room);
      }
    }
  }, [searchParams, roomsWithParticipants]);

  useEffect(() => {
    if (isChatbotRoom || !selectedRoom) return;

    const stillExists = roomsWithParticipants.some(
      (room) =>
        room.chatRoomId === selectedRoom.chatRoomId ||
        room.roomId === selectedRoom.roomId
    );
    if (stillExists) return;

    setSelectedRoom(null);
    setReplyingTo(null);
    setSearchParams({});
  }, [isChatbotRoom, roomsWithParticipants, selectedRoom, setSearchParams]);

  useEffect(() => {
    setReplyingTo(null);
  }, [selectedRoom?.chatRoomId, isChatbotRoom]);

  // 채팅방 선택 시 읽음 처리 (챗봇방 제외)
  const prevRoomIdRef = useRef<string | undefined>(undefined);
  useEffect(() => {
    const roomId = selectedRoom?.chatRoomId;
    if (!roomId || isChatbotRoom) return;
    if (!uid) return;
    if (roomId === prevRoomIdRef.current) return;
    prevRoomIdRef.current = roomId;

    markReadMutation.mutate({ roomId, userId: uid });
  }, [selectedRoom?.chatRoomId, isChatbotRoom, uid, markReadMutation]);

  const handleSendMessage = async (payload?: ChatInputPayload) => {
    const attachments = payload?.attachments;
    const attachmentMeta = {
      fileName: payload?.fileName,
      mimeType: payload?.mimeType,
    };

    console.debug('[chat] handleSendMessage', {
      chatRoomId: selectedRoom?.chatRoomId ?? 'chatbot',
      isChatbotRoom,
      hasAttachments: Boolean(attachments?.length),
      inputLength: messageInput.length,
    });
    // 메시지가 없고 첨부파일도 없으면 전송하지 않음
    if (!messageInput.trim() && !attachments?.length) return;

    if (isChatbotRoom && !messageInput.trim()) {
      return;
    }

    // 챗봇방인 경우 (이미지는 지원하지 않음)
    if (isChatbotRoom) {
      if (!currentMemberIdx) {
        console.error('현재 사용자 식별자를 확인할 수 없습니다.');
        return;
      }

      try {
        const userMessage: ChatMessageItem = {
          id: `chatbot-${Date.now()}-user`,
          sender: '나',
          senderId: String(currentMemberIdx),
          message: messageInput.trim(),
          rawMessage: messageInput.trim(),
          timestamp: fTime(new Date(), 'HH:mm'),
          dateLabel: fDate(new Date(), 'YYYY년 M월 D일'),
          isOwn: true,
        };

        // 사용자 메시지 추가
        setChatbotMessages((prev) => [...prev, userMessage]);
        setMessageInput('');

        // 챗봇 API 호출
        const response = await sendChatbotMessage({
          memberIndexes: [currentMemberIdx],
          message: messageInput.trim(),
        });

        // API 응답에서 챗봇 응답 메시지 추출
        const responseData = response as any;

        // 디버깅: 응답 구조 확인
        if (import.meta.env.DEV) {
          console.log('🤖 Chatbot API Response:', responseData);
        }

        let botResponseMessage = '응답을 받지 못했습니다.';

        // 응답 구조에 맞게 메시지 추출
        // axios 인터셉터가 response.data를 반환하므로 { result: { body: { message } } } 구조
        if (responseData?.result?.body?.message) {
          botResponseMessage = responseData.result.body.message;
        } else if (responseData?.data?.result?.body?.message) {
          botResponseMessage = responseData.data.result.body.message;
        } else if (responseData?.body?.message) {
          botResponseMessage = responseData.body.message;
        } else if (responseData?.message) {
          botResponseMessage = responseData.message;
        }

        if (import.meta.env.DEV) {
          console.log('🤖 Extracted message:', botResponseMessage);
        }

        const botMessage: ChatMessageItem = {
          id: `chatbot-${Date.now()}-bot`,
          sender: '챗봇',
          senderId: 'chatbot',
          message: botResponseMessage,
          rawMessage: botResponseMessage,
          timestamp: fTime(new Date(), 'HH:mm'),
          dateLabel: fDate(new Date(), 'YYYY년 M월 D일'),
          avatarUrl: `${CONFIG.assetsDir}/bot.png`,
          isOwn: false,
        };

        setTimeout(() => {
          setChatbotMessages((prev) => [...prev, botMessage]);
        }, 500);
      } catch (error) {
        console.error('Failed to send chatbot message:', error);

        // 에러 시 에러 메시지 표시
        const errorMessage: ChatMessageItem = {
          id: `chatbot-${Date.now()}-error`,
          sender: '챗봇',
          senderId: 'chatbot',
          message: '메시지 전송 중 오류가 발생했습니다. 다시 시도해주세요.',
          rawMessage: '메시지 전송 중 오류가 발생했습니다. 다시 시도해주세요.',
          timestamp: fTime(new Date(), 'HH:mm'),
          dateLabel: fDate(new Date(), 'YYYY년 M월 D일'),
          avatarUrl: `${CONFIG.assetsDir}/bot.png`,
          isOwn: false,
        };
        setChatbotMessages((prev) => [...prev, errorMessage]);
      }
      return;
    }

    // 일반 채팅방인 경우
    if (!selectedRoom) return;

    try {
      const trimmedMessage = messageInput.trim();
      const hasAttachments = Boolean(attachments?.length);
      const replyToPayload = replyingTo
        ? {
            messageId: replyingTo.messageId,
            senderId: replyingTo.senderId,
            senderName: replyingTo.senderName,
            messageType: replyingTo.messageType,
            message: replyingTo.rawMessage,
            ...(replyingTo.translations ? { translations: replyingTo.translations } : {}),
            ...(replyingTo.metadata ? { metadata: replyingTo.metadata } : {}),
          }
        : undefined;

      // 첨부파일이 있으면 Flutter와 동일하게 파일 메시지만 전송
      const messageContent = hasAttachments ? '' : trimmedMessage;
      await sendMessage(
        messageContent || '',
        'TEXT',
        attachments,
        undefined,
        undefined,
        attachmentMeta,
        { replyTo: replyToPayload }
      );
      setMessageInput('');
      setReplyingTo(null);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleInviteParticipant = async () => {
    // ParticipantList의 InviteParticipantModal에서 직접 API 호출하므로 여기서는 빈 함수
  };

  const handleReplyMessage = (message: ReplyableMessage) => {
    if (isChatbotRoom) return;

    setReplyingTo({
      messageId: message.id,
      senderId: message.senderId || '',
      senderName: message.sender,
      messageType: message.messageType || 'TEXT',
      rawMessage: message.rawMessage || message.message || '',
      translations: message.translations,
      metadata: message.metadata,
      preview: message.message || message.rawMessage || '메시지',
    });
  };

  const handleRemoveParticipants = async (participantIds: string[]) => {
    if (!selectedRoom || participantIds.length === 0) return;

    try {
      await removeParticipantsMutation.mutateAsync({
        roomId: selectedRoom.roomId,
        participantIds,
      });
    } catch (error) {
      console.error('Failed to remove participants:', error);
    }
  };

  const handleRoomNameChange = async (newName: string) => {
    if (selectedRoom) {
      try {
        await renameChatRoomMutation.mutateAsync({
          roomId: selectedRoom.roomId,
          name: newName,
        });
        setSelectedRoom((prev) => (prev ? { ...prev, name: newName } : null));
      } catch (error) {
        console.error('Failed to rename room:', error);
      }
    }
  };

  const handleLeaveRoom = () => {
    if (!selectedRoom) return;
    leaveChatRoomMutation.mutate(
      { roomId: selectedRoom.roomId },
      {
        onSuccess: () => {
          setSelectedRoom(null);
          setIsChatbotRoom(false);
          setSearchParams({});
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
      const participantIds = memberIndexes
        .map((id) => String(id))
        .filter((id) => id.trim().length > 0);
      const type = participantIds.length <= 1 ? 'DIRECT' : 'GROUP';

      const createResponse = await createChatRoomMutation.mutateAsync({
        type,
        name: roomName.trim() || undefined,
        participantIds,
      });

      const roomId =
        (createResponse as any)?.roomId ||
        (createResponse as any)?.data?.roomId ||
        (createResponse as any)?.body?.roomId ||
        (createResponse as any)?.body?.data?.roomId;

      if (!roomId) {
        console.warn('채팅방 생성 응답에서 roomId를 찾을 수 없습니다:', createResponse);
        return;
      }

      setIsChatbotRoom(false);
      setSearchParams({ room: roomId });
    } catch (error: any) {
      // API 응답에서 에러 메시지 추출
      const errorMessage = error?.message || '채팅방 생성에 실패했습니다.';
      setErrorSnackbar({
        open: true,
        message: errorMessage,
      });
    }
  };

  const leftSectionRooms: ChatRoom2[] = roomsWithParticipants;

  // RightSection용 참가자 목록 변환 (본인 제외)
  const rightSectionParticipants: ChatParticipant2[] = useMemo(() => {
    if (!currentMemberIdx) return [];

    // 본인을 제외한 모든 참가자 반환
    return participantsFromRoom.filter((p) => p.memberIdx !== currentMemberIdx);
  }, [participantsFromRoom, currentMemberIdx]);

  // EMERGENCY 타입의 채팅방 찾기
  const emergencyRoom = useMemo(
    () => rooms.find((room: any) => room.type === 'EMERGENCY'),
    [rooms]
  );

  // 응급 통계 집계 (Firestore 기반)
  const [emergencyCount, setEmergencyCount] = useState(0);

  useEffect(() => {
    if (!emergencyRoom?.chatRoomId) return;

    const fetchMonthlyEmergencyCount = async () => {
      if (!emergencyRoom?.chatRoomId) return;

      try {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

        const messagesCol = collection(
          firestore,
          'chatRooms',
          emergencyRoom.chatRoomId,
          'messages'
        );
        const messagesQuery = query(
          messagesCol,
          where('createdAt', '>=', Timestamp.fromDate(startOfMonth)),
          where('createdAt', '<', Timestamp.fromDate(startOfNextMonth))
        );

        const snapshot = await getDocs(messagesQuery);
        let count = 0;
        snapshot.forEach((docSnap) => {
          const val = docSnap.data() as any;
          if (String(val?.messageType || '').toUpperCase() === 'EMERGENCY') {
            count += 1;
          }
        });
        setEmergencyCount(count);
      } catch (error) {
        console.error('Failed to fetch emergency count:', error);
      }
    };

    fetchMonthlyEmergencyCount();
  }, [emergencyRoom?.chatRoomId]);

  const currentEmergencyStats = useMemo(() => {
    const now = new Date();
    return {
      month: now.getMonth() + 1,
      count: emergencyCount,
    };
  }, [emergencyCount]);

  const attachments: ChatAttachment2[] = useMemo(() => {
    const normalizeUrl = (url: string | undefined | null): string => {
      const resolved = resolveFileUrl(url);
      return resolved ?? '';
    };

    const isVideoFile = (name: string) => {
      const lower = name.toLowerCase();
      return (
        lower.endsWith('.mp4') ||
        lower.endsWith('.mov') ||
        lower.endsWith('.avi') ||
        lower.endsWith('.webm') ||
        lower.endsWith('.mkv') ||
        lower.endsWith('.m4v') ||
        lower.endsWith('.3gp')
      );
    };

    // 메시지에서 이미지와 문서 파일 추출
    const messageAttachments: ChatAttachment2[] = [];

    firebaseMessages.forEach((msg) => {
      const createdAtMs = Number(msg.timestamp);
      const createdAt = !Number.isNaN(createdAtMs)
        ? new Date(createdAtMs).toISOString()
        : new Date().toISOString();
      const metadata = (msg.metadata || {}) as any;
      const fileName =
        metadata.fileName ||
        (msg.messageType === 'FILE' ? msg.message : '') ||
        (metadata.fileUrl ? metadata.fileUrl.split('/').pop() : '');

      const videoUrl = normalizeUrl(metadata.videoUrl);
      if (videoUrl) {
        const name = videoUrl.split('/').pop() || '동영상';
        messageAttachments.push({
          id: `video-${msg.id}`,
          name,
          type: 'video',
          url: videoUrl,
          createdAt,
        });
      }

      const imageUrls = Array.isArray(metadata.imageUrls) ? metadata.imageUrls : [];
      imageUrls.forEach((imgUrl: string, idx: number) => {
        const normalizedImgUrl = normalizeUrl(imgUrl);
        if (!normalizedImgUrl) return;
        const name = normalizedImgUrl.split('/').pop() || `이미지${idx + 1}`;
        messageAttachments.push({
          id: `meta-img-${msg.id}-${idx}`,
          name,
          type: 'image',
          url: normalizedImgUrl,
          createdAt,
        });
      });

      const singleImageUrl = normalizeUrl(metadata.imageUrl);
      if (singleImageUrl && imageUrls.length === 0) {
        const name = singleImageUrl.split('/').pop() || '이미지';
        messageAttachments.push({
          id: `meta-single-img-${msg.id}`,
          name,
          type: 'image',
          url: singleImageUrl,
          createdAt,
        });
      }

      const fileUrl = normalizeUrl(metadata.fileUrl);
      if (fileUrl) {
        const name = fileName || fileUrl.split('/').pop() || '첨부파일';
        messageAttachments.push({
          id: `file-${msg.id}`,
          name,
          type: isVideoFile(name) ? 'video' : 'document',
          url: fileUrl,
          createdAt,
        });
      }

      const imageMatch = msg.message?.match(/\[이미지\]\|(.+)$/);
      if (imageMatch) {
        const imageUrl = normalizeUrl(imageMatch[1].trim());
        if (imageUrl) {
          const name = imageUrl.split('/').pop() || '이미지';
          messageAttachments.push({
            id: `img-${msg.id}`,
            name,
            type: 'image',
            url: imageUrl,
            createdAt,
          });
        }
      }

      const videoMatch = msg.message?.match(/\[동영상\]\|(.+)$/);
      if (!videoUrl && videoMatch) {
        const parsedVideoUrl = normalizeUrl(videoMatch[1].trim());
        if (parsedVideoUrl) {
          const name = parsedVideoUrl.split('/').pop() || '동영상';
          messageAttachments.push({
            id: `video-msg-${msg.id}`,
            name,
            type: 'video',
            url: parsedVideoUrl,
            createdAt,
          });
        }
      }

      if (msg.attachments && msg.attachments.length > 0) {
        msg.attachments.forEach((url, idx) => {
          const normalizedUrl = normalizeUrl(url);
          if (!normalizedUrl) return;
          const name = normalizedUrl.split('/').pop() || '첨부파일';
          const ext = name.split('.').pop()?.toLowerCase() || '';
          const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].includes(ext);
          const isVideo = ['mp4', 'mov', 'avi', 'webm', 'mkv', 'm4v', '3gp'].includes(ext);

          messageAttachments.push({
            id: `att-${msg.id}-${idx}`,
            name,
            type: isImage ? 'image' : isVideo ? 'video' : ext === 'pdf' ? 'pdf' : 'document',
            url: normalizedUrl,
            createdAt,
          });
        });
      }

      // 문서 공유 메시지 (FILE 타입): 한 메시지에 여러 문서(sharedDocumentIndexes) 또는 단일(sharedDocumentIdx)
      if (msg.messageType === 'FILE') {
        const docIndices = Array.isArray((metadata as any)?.sharedDocumentIndexes)
          ? (metadata as any).sharedDocumentIndexes.filter(
              (n: unknown) => typeof n === 'number' && !Number.isNaN(n)
            )
          : msg.sharedDocumentIdx != null && !Number.isNaN(Number(msg.sharedDocumentIdx))
            ? [Number(msg.sharedDocumentIdx)]
            : [];
        docIndices.forEach((docIdx: number) => {
          messageAttachments.push({
            id: `doc-${msg.id}-${docIdx}`,
            name: msg.message || `문서 ${docIdx}`,
            type: 'pdf',
            url: '',
            createdAt,
          });
        });
      }
    });

    // 중복 제거 (URL 기준)
    const uniqueAttachments = messageAttachments.filter(
      (att, idx, arr) =>
        arr.findIndex((other) =>
          att.url && other.url ? other.url === att.url : other.id === att.id
        ) === idx
    );

    // 최신순 정렬
    return uniqueAttachments.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA;
    });
  }, [firebaseMessages]);

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
            setSearchParams({ room: 'chatbot' });
            return;
          }

          // 일반 채팅방 선택
          setIsChatbotRoom(false);
          setSelectedRoom(room);
          setSearchParams({ room: room.chatRoomId });
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
                        roomId: 'chatbot',
                        chatRoomId: 'chatbot',
                        chatRoomIdx: 0,
                        type: 'CHATBOT',
                        name: '챗봇',
                        participantIds: [],
                        lastMessagePreview: '',
                        unreadCount: 0,
                        notificationsEnabled: true,
                        pinned: false,
                        archived: false,
                        participants: [],
                      }
                    : activeSelectedRoom ?? selectedRoom!
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
                          roomId: 'chatbot',
                          chatRoomId: 'chatbot',
                          chatRoomIdx: 0,
                          type: 'CHATBOT',
                          name: '챗봇',
                          participantIds: [],
                          lastMessagePreview: '',
                          unreadCount: 0,
                          notificationsEnabled: true,
                          pinned: false,
                          archived: false,
                          participants: [],
                        }
                      : activeSelectedRoom ?? selectedRoom!
                  }
                  messages={chatMessages}
                  conversationDate={conversationDateLabel}
                  messageInput={messageInput}
                  onMessageInputChange={setMessageInput}
                  onSendMessage={handleSendMessage}
                  replyingTo={replyingTo}
                  onReplyMessage={handleReplyMessage}
                  onCancelReply={() => setReplyingTo(null)}
                  emergencyStats={
                    (activeSelectedRoom ?? selectedRoom)?.type === 'EMERGENCY'
                      ? currentEmergencyStats
                      : undefined
                  }
                  onFileMessageClick={handleFileMessageClick}
                  hasMore={hasMore}
                  isLoadingMore={isLoadingMore}
                  onLoadMore={loadMore}
                />
              </Box>

              {/* 우측 채팅 상세 정보 (챗봇방이 아닐 때만 표시) */}
              {!isChatbotRoom && selectedRoom && (
                <RightSection
                  room={activeSelectedRoom ?? selectedRoom}
                  participants={rightSectionParticipants}
                  onInvite={handleInviteParticipant}
                  onRemove={handleRemoveParticipants}
                  attachments={attachments}
                  onFileClick={(attachment) => {
                    // 문서 파일인 경우 (doc- 접두사, id 형식: doc-{msgId}-{sharedDocumentIdx})
                    if (attachment.id.startsWith('doc-') && attachment.type === 'pdf') {
                      const withIdxMatch = attachment.id.match(/^doc-(.+)-(\d+)$/);
                      if (withIdxMatch) {
                        const sharedDocumentIdx = Number(withIdxMatch[2]);
                        if (!Number.isNaN(sharedDocumentIdx)) {
                          handleFileMessageClick(sharedDocumentIdx);
                        }
                      } else {
                        const legacyMatch = attachment.id.match(/^doc-(.+)$/);
                        const msgId = legacyMatch?.[1];
                        if (msgId) {
                          const msg = firebaseMessages.find((m) => m.id === msgId);
                          if (msg?.sharedDocumentIdx != null) {
                            handleFileMessageClick(msg.sharedDocumentIdx);
                          }
                        }
                      }
                    } else if (attachment.url) {
                      // URL이 있는 경우 새 탭에서 열기
                      window.open(attachment.url, '_blank');
                    }
                  }}
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
