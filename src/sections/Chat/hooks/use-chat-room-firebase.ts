import { useState, useEffect, useCallback } from 'react';
import { ref, push, set, onChildAdded, query, orderByChild, limitToLast } from 'firebase/database';
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
  // 앱 호환성을 위해 추가될 수 있는 필드들
  [key: string]: any;
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

  // 실시간 메시지 수신 (일원화된 로직)
  useEffect(() => {
    if (!chatRoomId || !database) {
      setMessages([]);
      return undefined;
    }

    // 방이 변경되면 기존 메시지 초기화 및 로딩 시작
    setMessages([]);
    setIsLoading(true);

    const db = database;
    const messagesRef = ref(db, `chatRooms/${chatRoomId}/messages`);
    // 타임스탬프 기준 정렬 및 마지막 100개 가져오기
    const messagesQuery = query(messagesRef, orderByChild('timestamp'), limitToLast(100));

    const handleNewMessage = (snapshot: any) => {
      const newMessage = snapshot.val() as FirebaseMessage;

      // 현재 보고 있는 방의 메시지가 아니면 무시 (이전 리스너 잔재 등 방지)
      if (newMessage.chatRoomId && newMessage.chatRoomId !== chatRoomId) {
        return;
      }

      setMessages((prev) => {
        // 이미 존재하는 메시지면 업데이트하지 않음
        if (prev.some((msg) => msg.id === newMessage.id)) {
          return prev;
        }

        // 새 메시지 추가 후 타임스탬프로 정렬
        const updated = [...prev, newMessage];
        return updated.sort((a, b) => {
          const timeA = Number(a.timestamp) || 0;
          const timeB = Number(b.timestamp) || 0;
          return timeA - timeB;
        });
      });

      // 데이터가 들어오면 로딩 해제
      setIsLoading(false);
    };

    // onChildAdded는 unsubscribe 함수를 반환함
    const unsubscribe = onChildAdded(messagesQuery, handleNewMessage);

    // 데이터가 없는 경우를 대비해 타임아웃으로 로딩 해제
    const loadingTimeout = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => {
      clearTimeout(loadingTimeout);
      // 반환된 unsubscribe 함수 호출이 더 안전함 (off 대신)
      unsubscribe();
    };
  }, [chatRoomId]);

  // 구형 memberIdx 해결 로직은 유지
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
