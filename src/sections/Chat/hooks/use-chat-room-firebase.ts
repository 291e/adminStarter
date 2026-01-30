import { useState, useEffect, useCallback } from 'react';
import {
  ref,
  push,
  update,
  onChildAdded,
  query,
  orderByChild,
  limitToLast,
  startAt,
  endAt,
  get,
} from 'firebase/database';
import { database } from 'src/config/firebase';
import { useAuthContext } from 'src/auth/hooks';
import { backupMessage } from 'src/services/chat/chat.service';
import { useQueryClient } from '@tanstack/react-query';

// ----------------------------------------------------------------------

export type FirebaseMessage = {
  id: string;
  chatRoomId: string;
  senderMemberIdx: string; // Firebase auth.uid 기준 문자열
  senderId?: string;
  senderName?: string;
  message: string;
  text?: string; // 앱에서 보낸 메시지는 text 필드 사용
  messageType: 'TEXT' | 'IMAGE' | 'FILE' | 'SYSTEM' | 'EMERGENCY';
  signalType?: 'RISK' | 'RESCUE' | 'EVACUATION' | null;
  attachments?: string[] | null;
  sharedDocumentIdx?: number; // FILE 타입 메시지의 공유 문서 인덱스
  translations?: Record<string, string>;
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

const getMessageTimestamp = (message: FirebaseMessage) => {
  const rawTimestamp = message.timestamp || message.createdAt?.toString() || '0';
  const numeric = Number(rawTimestamp);
  if (!Number.isNaN(numeric)) return numeric;
  const parsed = new Date(rawTimestamp).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
};

const removeUndefinedFields = <T extends Record<string, any>>(obj: T): T => {
  const entries = Object.entries(obj).filter(([, value]) => value !== undefined);
  return Object.fromEntries(entries) as T;
};

type UseChatRoomFirebaseProps = {
  chatRoomId?: string; // Firebase UUID
  chatRoomIdx?: number; // Backend ID (for backup)
  memberIdx?: number | null; // 명시적으로 전달받은 사용자 memberIdx
};

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

export function useChatRoomFirebase({
  chatRoomId,
  chatRoomIdx,
  memberIdx,
}: UseChatRoomFirebaseProps) {
  const { user } = useAuthContext();
  const queryClient = useQueryClient();
  const [messages, setMessages] = useState<FirebaseMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [oldestTimestamp, setOldestTimestamp] = useState<number | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // 실시간 메시지 수신 (초기 로딩 + 신규 구독)
  useEffect(() => {
    if (!chatRoomId || !database) {
      setMessages([]);
      return undefined;
    }

    // 방이 변경되면 기존 메시지 초기화 및 로딩 시작
    setMessages([]);
    setIsLoading(true);
    setHasMore(false);
    setOldestTimestamp(null);
    setIsLoadingMore(false);

    const db = database;
    const messagesRef = ref(db, `chatRooms/${chatRoomId}/messages`);
    const initialQuery = query(messagesRef, orderByChild('timestamp'), limitToLast(50));

    let unsubscribe: (() => void) | null = null;
    let cancelled = false;

    const loadInitial = async () => {
      try {
        const snapshot = await get(initialQuery);
        const loaded: FirebaseMessage[] = [];
        snapshot.forEach((child) => {
          loaded.push(child.val() as FirebaseMessage);
        });

        loaded.sort((a, b) => getMessageTimestamp(a) - getMessageTimestamp(b));

        if (cancelled) return;

        setMessages(loaded);
        setIsLoading(false);

        if (loaded.length > 0) {
          setOldestTimestamp(getMessageTimestamp(loaded[0]));
        }
        setHasMore(loaded.length >= 50);

        const lastTimestamp = loaded.length
          ? getMessageTimestamp(loaded[loaded.length - 1])
          : 0;
        const liveQuery = query(
          messagesRef,
          orderByChild('timestamp'),
          startAt((lastTimestamp + 1).toString())
        );

        unsubscribe = onChildAdded(liveQuery, (snap) => {
          const newMessage = snap.val() as FirebaseMessage;
          if (newMessage.chatRoomId && newMessage.chatRoomId !== chatRoomId) {
            return;
          }

          setMessages((prev) => {
            if (prev.some((msg) => msg.id === newMessage.id)) {
              return prev;
            }
            return [...prev, newMessage].sort(
              (a, b) => getMessageTimestamp(a) - getMessageTimestamp(b)
            );
          });
        });
      } catch (error) {
        console.error('Failed to load messages:', error);
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadInitial();

    return () => {
      cancelled = true;
      if (unsubscribe) unsubscribe();
    };
  }, [chatRoomId, database]);

  // 구형 memberIdx 해결 로직은 유지

  const markRoomSeen = useCallback(async () => {
    if (!chatRoomId || !database) return;
    const resolvedMemberIdx = resolveMemberIdx(memberIdx, user);
    if (!resolvedMemberIdx) return;

    const db = database;
    const now = Date.now();
    await update(ref(db), {
      [`chatRooms/${chatRoomId}/participants/${String(resolvedMemberIdx)}/lastSeen`]: now,
      [`chatRooms/${chatRoomId}/participants/${String(resolvedMemberIdx)}/unreadCount`]: 0,
    });
  }, [chatRoomId, database, memberIdx, user]);

  useEffect(() => {
    if (!chatRoomId || !database) return undefined;
    const resolvedMemberIdx = resolveMemberIdx(memberIdx, user);
    if (!resolvedMemberIdx) return undefined;

    const db = database;
    const now = Date.now();
    update(ref(db), {
      [`chatRooms/${chatRoomId}/participants/${String(resolvedMemberIdx)}/online`]: 1,
      [`chatRooms/${chatRoomId}/participants/${String(resolvedMemberIdx)}/lastSeen`]: now,
    });

    return () => {
      update(ref(db), {
        [`chatRooms/${chatRoomId}/participants/${String(resolvedMemberIdx)}/online`]: 0,
      });
    };
  }, [chatRoomId, database, memberIdx, user]);

  useEffect(() => {
    if (!chatRoomId || !database || messages.length === 0) return;
    markRoomSeen();
  }, [chatRoomId, database, messages.length, markRoomSeen]);

  const loadMore = useCallback(async () => {
    if (!chatRoomId || !database || oldestTimestamp === null) return;

    if (isLoadingMore) return;
    setIsLoadingMore(true);

    const messagesRef = ref(database, `chatRooms/${chatRoomId}/messages`);
    const moreQuery = query(
      messagesRef,
      orderByChild('timestamp'),
      endAt((oldestTimestamp - 1).toString()),
      limitToLast(20)
    );

    try {
      const snapshot = await get(moreQuery);
      const older: FirebaseMessage[] = [];
      snapshot.forEach((child) => {
        older.push(child.val() as FirebaseMessage);
      });
      older.sort((a, b) => getMessageTimestamp(a) - getMessageTimestamp(b));

      if (older.length > 0) {
        setMessages((prev) => [...older, ...prev]);
        setOldestTimestamp(getMessageTimestamp(older[0]));
      }

      setHasMore(older.length >= 20);
    } finally {
      setIsLoadingMore(false);
    }
  }, [chatRoomId, database, oldestTimestamp, isLoadingMore]);

  // 메시지 전송
  const sendMessage = useCallback(
    async (
      content: string,
      messageType: FirebaseMessage['messageType'] = 'TEXT',
      attachments?: string[],
      signalType?: FirebaseMessage['signalType'],
      sharedDocumentIdx?: number
    ) => {
      console.debug('[chat] sendMessage called', {
        chatRoomId,
        messageType,
        hasAttachments: Boolean(attachments?.length),
        contentLength: content.length,
      });
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

      const createdAt = Date.now();
      const timestamp = createdAt.toString();
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

      const senderId = String(senderMemberIdx);
      const messageData: FirebaseMessage = removeUndefinedFields({
        id: messageId,
        chatRoomId,
        senderMemberIdx: senderId,
        senderId,
        message: messageContent,
        text: messageContent,
        messageType,
        signalType: signalType || null,
        attachments: attachments || null,
        sharedDocumentIdx,
        timestamp,
        createdAt,
        isRead: false,
      }) as FirebaseMessage;

      try {
        console.debug('[chat] sendMessage prepared', {
          chatRoomId,
          messageId,
          senderMemberIdx,
        });
        // 1. Firebase RTDB 멀티 업데이트
        const participantsSnap = await get(ref(db, `chatRooms/${chatRoomId}/participants`));
        const participants = participantsSnap.val() || {};
        console.debug('[chat] sendMessage participants', {
          chatRoomId,
          participantKeys: Object.keys(participants).length,
        });

        const lastMessage = removeUndefinedFields({
          message: messageContent,
          text: messageContent,
          timestamp,
          createdAt,
          senderMemberIdx: senderId,
          senderId,
          senderName: messageData.senderName,
          messageType,
          signalType: signalType || null,
          sharedDocumentIdx: messageData.sharedDocumentIdx,
        });

        const updates: Record<string, any> = {};
        updates[`chatRooms/${chatRoomId}/messages/${messageId}`] = messageData;
        updates[`chatRooms/${chatRoomId}/lastMessage`] = lastMessage;
        updates[`chatRooms/${chatRoomId}/lastMessageAt`] = timestamp;
        updates[`chatRooms/${chatRoomId}/updatedAt`] = createdAt;

        const participantMap = new Map<string, { key: string; data: any }>();
        Object.entries(participants).forEach(([pid, p]: [string, any]) => {
          const normalizedId = Number(p?.memberIdx ?? pid);
          if (Number.isNaN(normalizedId)) {
            if (!participantMap.has(pid)) participantMap.set(pid, { key: pid, data: p });
            return;
          }

          const normalizedKey = String(normalizedId);
          const existing = participantMap.get(normalizedKey);
          const isExactKey = pid === normalizedKey;
          if (!existing || isExactKey) {
            participantMap.set(normalizedKey, { key: pid, data: p });
          }
        });

        participantMap.forEach(({ key: pid, data: p }) => {
          if (pid === senderId || pid === 'chatbot') return;
          // TEMP: disable client-side unread increment to avoid double counting
          updates[`chatRooms/${chatRoomId}/participants/${pid}/lastSeen`] =
            p?.lastSeen ?? createdAt;
        });

        updates[`chatRooms/${chatRoomId}/participants/${senderId}/unreadCount`] = 0;
        updates[`chatRooms/${chatRoomId}/participants/${senderId}/lastSeen`] = createdAt;

        await update(ref(db), updates);

        // 2. 백엔드 백업 API 호출 (chatRoomIdx가 필요)
        if (chatRoomId) {
          await backupMessage({
            id: messageData.id,
            chatRoomId: messageData.chatRoomId,
            senderMemberIdx: Number(senderMemberIdx),
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
    [chatRoomId, user, memberIdx, queryClient, database]
  );

  return {
    messages,
    sendMessage,
    isLoading,
    hasMore,
    loadMore,
    isLoadingMore,
  };
}
