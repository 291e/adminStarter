import { useState, useEffect, useCallback } from 'react';
import {
  ref,
  push,
  update,
  onChildAdded,
  onValue,
  query,
  orderByChild,
  limitToLast,
  startAt,
  endAt,
  get,
  runTransaction,
} from 'firebase/database';
import { database } from 'src/config/firebase';
import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------

type MessageMetadata = {
  type?: string;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  imageUrl?: string;
  imageUrls?: string[];
  videoUrl?: string;
  fileUrl?: string;
  fileName?: string;
  address?: string;
  addressTranslations?: Record<string, string>;
  [key: string]: any;
};

export type FirebaseMessage = {
  id: string;
  chatRoomId: string;
  senderMemberIdx: string; // Firebase auth.uid 기준 문자열
  senderId?: string;
  senderName?: string;
  message: string;
  text?: string;
  messageType: 'TEXT' | 'IMAGE' | 'VIDEO' | 'FILE' | 'SYSTEM' | 'EMERGENCY';
  signalType?: string | null;
  attachments?: string[] | null;
  sharedDocumentIdx?: number;
  translations?: Record<string, string>;
  metadata?: MessageMetadata;
  timestamp: string;
  createdAt?: number;
  isRead: boolean;
  [key: string]: any;
};

export type ChatAttachmentMeta = {
  fileName?: string;
  mimeType?: string;
};

type ParticipantPresence = {
  online?: number | boolean;
  lastSeen?: number | string;
  unreadCount?: number;
  [key: string]: any;
};

const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'];
const videoExtensions = ['.mp4', '.mov', '.avi', '.webm', '.mkv', '.m4v', '.3gp'];

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

const normalizeLang = (lang: string) => {
  const lower = lang.toLowerCase().trim();
  if (lower === 'vn') return 'vi';
  if (lower === 'cn') return 'zh';
  if (lower === 'np') return 'ne';
  if (lower === 'kh') return 'km';
  if (lower === 'kr') return 'ko';
  return lower;
};

const toTranslationKey = (lang: string) => {
  const normalized = normalizeLang(lang);
  if (normalized === 'vi') return 'vn';
  return normalized;
};

const seedTranslations = (text: string, sourceLang?: string) => {
  const base = sourceLang && sourceLang.trim() ? sourceLang : 'ko';
  const key = toTranslationKey(base);
  return { [key]: text } as Record<string, string>;
};

const extractFileName = (url?: string | null) => {
  if (!url) return '';
  const cleaned = url.split('?')[0].trim();
  if (!cleaned) return '';
  const parts = cleaned.split('/');
  return parts[parts.length - 1] || '';
};

const resolveAttachmentType = (
  url: string,
  mimeType?: string,
  fileName?: string
): FirebaseMessage['messageType'] => {
  if (mimeType?.startsWith('image/')) return 'IMAGE';
  if (mimeType?.startsWith('video/')) return 'VIDEO';

  const candidate = (fileName || url).split('?')[0].toLowerCase();
  if (imageExtensions.some((ext) => candidate.endsWith(ext))) return 'IMAGE';
  if (videoExtensions.some((ext) => candidate.endsWith(ext))) return 'VIDEO';
  return 'FILE';
};

const resolveSenderName = (user: ReturnType<typeof useAuthContext>['user']) => {
  return (
    user?.memberName ||
    user?.name ||
    user?.member?.memberName ||
    user?.member?.name ||
    user?.companyMember?.memberName ||
    ''
  );
};

export function useChatRoomFirebase({
  chatRoomId,
  memberIdx,
}: UseChatRoomFirebaseProps) {
  const { user } = useAuthContext();
  const [messages, setMessages] = useState<FirebaseMessage[]>([]);
  const [participantsMeta, setParticipantsMeta] = useState<
    Record<string, ParticipantPresence>
  >({});
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

  useEffect(() => {
    if (!chatRoomId || !database) {
      setParticipantsMeta({});
      return undefined;
    }

    const participantsRef = ref(database, `chatRooms/${chatRoomId}/participants`);
    const unsubscribe = onValue(participantsRef, (snapshot) => {
      const data = snapshot.val();
      if (data && typeof data === 'object') {
        setParticipantsMeta(data as Record<string, ParticipantPresence>);
      } else {
        setParticipantsMeta({});
      }
    });

    return () => {
      unsubscribe();
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
      [`chatRooms/${chatRoomId}/participants/${String(resolvedMemberIdx)}/visible`]: true,
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
    if (!chatRoomId || !database) return;
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
      sharedDocumentIdx?: number,
      attachmentMeta?: ChatAttachmentMeta
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

      const senderId = String(senderMemberIdx);
      const senderName = resolveSenderName(user);
      const sourceLang =
        (user as any)?.memberLang ||
        (user as any)?.language ||
        (user as any)?.lang ||
        (user as any)?.member?.memberLang ||
        'ko';

      const attachmentUrl = attachments && attachments.length > 0 ? attachments[0] : undefined;
      const attachmentName = attachmentMeta?.fileName || extractFileName(attachmentUrl);
      const attachmentMime = attachmentMeta?.mimeType;

      let resolvedType = messageType;
      let messageContent = content.trim();

      if (attachmentUrl) {
        resolvedType = resolveAttachmentType(attachmentUrl, attachmentMime, attachmentName);
        if (resolvedType === 'IMAGE') {
          messageContent = `[이미지]|${attachmentUrl}`;
        } else if (resolvedType === 'VIDEO') {
          messageContent = `[동영상]|${attachmentUrl}`;
        } else {
          messageContent = attachmentName || messageContent || '파일';
        }
      }

      if (!messageContent) {
        throw new Error('메시지 내용이 없습니다.');
      }

      const metadata: MessageMetadata = {};
      if (resolvedType === 'TEXT') {
        metadata.type = 'text';
      } else if (resolvedType === 'IMAGE') {
        metadata.type = 'image';
        if (attachmentUrl) metadata.imageUrl = attachmentUrl;
      } else if (resolvedType === 'VIDEO') {
        metadata.type = 'video';
        if (attachmentUrl) metadata.videoUrl = attachmentUrl;
        if (attachmentName) metadata.fileName = attachmentName;
      } else if (resolvedType === 'FILE') {
        metadata.type = 'file';
        if (attachmentUrl) metadata.fileUrl = attachmentUrl;
        if (attachmentName) metadata.fileName = attachmentName;
      } else if (resolvedType === 'EMERGENCY' && signalType) {
        metadata.type = signalType;
      }

      const translations = seedTranslations(messageContent, sourceLang);

      const messageData: FirebaseMessage = removeUndefinedFields({
        id: messageId,
        chatRoomId,
        senderMemberIdx: senderId,
        senderName,
        message: messageContent,
        messageType: resolvedType,
        timestamp,
        createdAt,
        translations,
        metadata: metadata ? metadata : undefined,
        isRead: false,
        sharedDocumentIdx,
      }) as FirebaseMessage;

      try {
        console.debug('[chat] sendMessage prepared', {
          chatRoomId,
          messageId,
          senderMemberIdx,
        });

        await newMessageRef.set(messageData);
        await update(ref(db, `chatRooms/${chatRoomId}`), {
          lastMessage: messageData,
          lastMessageAt: timestamp,
        });

        const participantsSnap = await get(ref(db, `chatRooms/${chatRoomId}/participants`));
        const participants = participantsSnap.val();
        if (participants && typeof participants === 'object') {
          const updates = Object.keys(participants).map((pid) => {
            if (pid === 'chatbot') return null;
            const participantRef = ref(db, `chatRooms/${chatRoomId}/participants/${pid}`);
            return runTransaction(participantRef, (current) => {
              const map =
                current && typeof current === 'object'
                  ? Object.fromEntries(Object.entries(current))
                  : ({} as Record<string, any>);

              if (String(map.lastMessageId || '') === messageId) {
                return;
              }

              if (pid === senderId) {
                map.unreadCount = 0;
                map.lastSeen = createdAt;
              } else {
                const currentUnread = Number(map.unreadCount || 0);
                map.unreadCount = Number.isNaN(currentUnread) ? 1 : currentUnread + 1;
              }
              map.lastMessageId = messageId;
              return map;
            });
          });
          await Promise.all(updates.filter(Boolean));
        }
      } catch (error) {
        console.error('Failed to send message:', error);
        throw error;
      }
    },
    [chatRoomId, user, memberIdx, database]
  );

  return {
    messages,
    sendMessage,
    isLoading,
    hasMore,
    loadMore,
    isLoadingMore,
    participantsMeta,
  };
}
