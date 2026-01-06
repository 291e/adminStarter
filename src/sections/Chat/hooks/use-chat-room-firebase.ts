import { useState, useEffect, useCallback } from 'react';
import {
  ref,
  push,
  set,
  onChildAdded,
  query,
  orderByChild,
  limitToLast,
  get,
  off,
} from 'firebase/database';
import { database } from 'src/config/firebase';
import { useAuthContext } from 'src/auth/hooks';
import { backupMessage } from 'src/services/chat/chat.service';
import { useQueryClient } from '@tanstack/react-query';

// ----------------------------------------------------------------------

export type FirebaseMessage = {
  id: string;
  chatRoomId: string;
  senderMemberIdx: number | string; // 문자열로 올 수도 있음
  senderId?: string;
  senderName?: string;
  message: string;
  text?: string; // 앱에서 보낸 메시지는 text 필드 사용
  messageType: 'TEXT' | 'IMAGE' | 'FILE' | 'SYSTEM' | 'EMERGENCY';
  signalType?: 'RISK' | 'RESCUE' | 'EVACUATION' | null;
  attachments?: string[] | null;
  sharedDocumentIdx?: number; // FILE 타입 메시지의 공유 문서 인덱스
  metadata?: {
    type?: 'rescue_request' | 'evacuation' | 'risk_report' | string;
    location?: {
      latitude: number;
      longitude: number;
      address?: string;
    };
  };
  timestamp: string;
  createdAt?: number;
  isRead: boolean;
};

type UseChatRoomFirebaseProps = {
  chatRoomId?: string; // Firebase UUID
  chatRoomIdx?: number; // Backend ID (for backup)
  memberIdx?: number | null; // 명시적으로 전달받은 사용자 memberIdx
};

export function useChatRoomFirebase({
  chatRoomId,
  chatRoomIdx,
  memberIdx,
}: UseChatRoomFirebaseProps) {
  const { user } = useAuthContext();
  const queryClient = useQueryClient();
  const [messages, setMessages] = useState<FirebaseMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 메시지 목록 초기 로드
  useEffect(() => {
    if (!chatRoomId || !database) return;

    const loadInitialMessages = async () => {
      if (!database) return; // 타입 가드
      setIsLoading(true);
      try {
        const messagesRef = ref(database, `chatRooms/${chatRoomId}/messages`);
        const messagesQuery = query(messagesRef, orderByChild('timestamp'), limitToLast(50));

        const snapshot = await get(messagesQuery);
        const loadedMessages: FirebaseMessage[] = [];

        snapshot.forEach((child) => {
          loadedMessages.push(child.val());
        });

        setMessages(loadedMessages);
      } catch (error) {
        console.error('Failed to load messages:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialMessages();
  }, [chatRoomId]);

  // 실시간 메시지 수신
  useEffect(() => {
    if (!chatRoomId || !database) return undefined;

    // 타입 가드: database가 undefined가 아님을 보장
    const db = database;
    if (!db) return undefined;

    const messagesRef = ref(db, `chatRooms/${chatRoomId}/messages`);

    // 새 메시지가 추가될 때마다 호출
    // 주의: 초기 로드된 메시지 이후에 추가된 것만 처리하거나,
    // 이미 로드된 것과 중복되지 않게 처리해야 함.
    // onChildAdded는 기존 데이터에 대해서도 호출될 수 있으므로 limitToLast를 쿼리에 적용하거나
    // timestamp 기준으로 필터링하는 것이 좋음.
    // 여기서는 간단히 마지막 메시지 시간 이후의 것만 받거나,
    // state 업데이트 시 중복 체크를 함.

    const unsubscribe = onChildAdded(messagesRef, (snapshot) => {
      const newMessage = snapshot.val() as FirebaseMessage;

      setMessages((prev) => {
        // 이미 존재하는 메시지면 무시
        if (prev.some((msg) => msg.id === newMessage.id)) {
          return prev;
        }
        return [...prev, newMessage];
      });
    });

    return () => {
      off(messagesRef, 'child_added', unsubscribe);
    };
  }, [chatRoomId]);

  const resolveMemberIdx = (
    overrideIdx: number | null | undefined,
    authUser: ReturnType<typeof useAuthContext>['user']
  ) => {
    const candidates = [
      overrideIdx,
      authUser?.memberIdx,
      authUser?.memberIndex,
      authUser?.member?.memberIdx,
      authUser?.member?.memberIndex,
      authUser?.companyMember?.memberIdx,
      authUser?.companyMember?.memberIndex,
      authUser?.member?.id,
      authUser?.id,
    ];

    for (const candidate of candidates) {
      const parsed = Number(candidate);
      if (!Number.isNaN(parsed) && parsed > 0) {
        return parsed;
      }
    }

    return null;
  };

  // 메시지 전송
  const sendMessage = useCallback(
    async (
      content: string,
      messageType: FirebaseMessage['messageType'] = 'TEXT',
      attachments?: string[],
      signalType?: FirebaseMessage['signalType']
    ) => {
      if (!chatRoomId) {
        throw new Error('채팅방이 선택되지 않았습니다.');
      }
      if (!user) {
        throw new Error('사용자 정보가 없습니다. 다시 로그인해주세요.');
      }
      if (!database) {
        throw new Error('Firebase Database 인스턴스를 찾을 수 없습니다.');
      }

      // 타입 가드: database가 undefined가 아님을 보장
      const db = database;
      if (!db) {
        throw new Error('Firebase Database가 초기화되지 않았습니다.');
      }

      const messagesRef = ref(db, `chatRooms/${chatRoomId}/messages`);
      const newMessageRef = push(messagesRef);
      const messageId = newMessageRef.key;

      if (!messageId) return;

      const timestamp = Date.now().toString();
      const senderMemberIdx = resolveMemberIdx(memberIdx, user);

      if (!senderMemberIdx) {
        throw new Error('현재 사용자 식별자를 확인할 수 없습니다.');
      }

      // 이미지 메시지인 경우 앱과 동일한 형식으로 메시지 구성
      // 형식: [이미지]|URL 또는 텍스트와 함께 사용 시 "텍스트 [이미지]|URL"
      let messageContent = content;
      if (messageType === 'IMAGE' && attachments && attachments.length > 0) {
        const imageUrl = attachments[0];
        if (content.trim()) {
          // 텍스트가 있으면 함께 보내기
          messageContent = `${content.trim()} [이미지]|${imageUrl}`;
        } else {
          // 이미지만 보내기
          messageContent = `[이미지]|${imageUrl}`;
        }
      }

      const messageData: FirebaseMessage = {
        id: messageId,
        chatRoomId,
        senderMemberIdx,
        message: messageContent,
        messageType,
        signalType: signalType || null,
        attachments: attachments || null,
        timestamp,
        isRead: false,
      };

      try {
        // 1. Firebase RTDB 저장
        await set(newMessageRef, messageData);

        // 2. 백엔드 백업 API 호출 (chatRoomIdx가 필요)
        // 백업 실패해도 RTDB에는 저장됨. 에러 처리는 필요에 따라 추가.
        // chatRoomIdx가 없는 경우(예: 아직 생성되지 않은 방?)는 호출 불가하지만
        // 여기서는 이미 방이 있다고 가정.
        // 백엔드 API가 UUID(chatRoomId)를 받을 수도 있고 Idx를 받을 수도 있는데,
        // chat.service.ts의 backupMessage는 chatRoomId(UUID)를 받도록 정의했음.
        // swagger.json을 보면 `POST /safeyoui/api/chat/messages/backup` Body에 `chatRoomId`가 있음.
        // 이 `chatRoomId`가 UUID인지 Idx인지 확인 필요.
        // 보통 Firebase 연동이면 UUID일 가능성이 높음.
        // 하지만 chat.types.ts에서 BackupMessageParams에 chatRoomId: string으로 정의함.

        if (chatRoomId) {
          await backupMessage({
            id: messageData.id,
            chatRoomId: messageData.chatRoomId,
            senderMemberIdx: Number(messageData.senderMemberIdx),
            message: messageData.message,
            messageType: messageData.messageType,
            signalType: messageData.signalType,
            attachments: messageData.attachments,
            timestamp: messageData.timestamp,
          });

          queryClient.invalidateQueries({ queryKey: ['chatRooms'] });
          // EMERGENCY 메시지인 경우 대시보드 사고 발생 카운트 최신화
          if (messageType === 'EMERGENCY') {
            queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
            queryClient.invalidateQueries({ queryKey: ['riskReports'] });
          }
        }
      } catch (error) {
        console.error('Failed to send message:', error);
        throw error;
      }
    },
    [chatRoomId, user, memberIdx, queryClient]
  );

  return {
    messages,
    sendMessage,
    isLoading,
  };
}
