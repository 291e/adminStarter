import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { DocumentData, QueryDocumentSnapshot, Unsubscribe } from 'firebase/firestore';
import {
  collection,
  doc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  startAfter,
  Timestamp,
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

import { auth, firestore } from 'src/config/firebase';
import { useAuthContext } from 'src/auth/hooks';
import * as chat2Service from 'src/services/chat2/chat2.service';
import type { Chat2ReplyToPayload } from 'src/services/chat2/chat2.types';

// ----------------------------------------------------------------------

type MessageMetadata = {
  type?: string;
  replyTo?: Chat2ReplyToPayload;
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

export type Chat2Message = {
  id: string;
  chatRoomId: string;
  senderId: string;
  senderName?: string;
  senderLang?: string;
  message: string;
  messageType: 'TEXT' | 'IMAGE' | 'VIDEO' | 'FILE' | 'SYSTEM' | 'EMERGENCY';
  translations?: Record<string, string>;
  metadata?: MessageMetadata;
  createdAtMs: number;
  timestamp: string;
  sharedDocumentIdx?: number;
  attachments?: string[] | null;
  _pending?: boolean;
  [key: string]: any;
};

export type RoomParticipantDoc = {
  userId: string;
  joinedAt?: number;
  leftAt?: number | null;
  customRoomName?: string;
  customRoomNameAuto?: boolean;
  notificationsEnabled?: boolean;
  lastReadAt?: number;
  unreadCount?: number;
  mutedUntil?: number | null;
};

export type PresenceDoc = {
  state?: 'active' | 'away' | string;
  activeRoomId?: string | null;
  lastActiveAt?: number;
};

export type ChatAttachmentMeta = {
  fileName?: string;
  mimeType?: string;
};

type SendMessageOptions = {
  replyTo?: Chat2ReplyToPayload;
};

type UseChatRoomFirestoreProps = {
  chatRoomId?: string;
};

const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'];
const videoExtensions = ['.mp4', '.mov', '.avi', '.webm', '.mkv', '.m4v', '.3gp'];

const normalizeLang = (lang: string) => {
  const lower = lang.toLowerCase().trim();
  if (lower === 'vn') return 'vi';
  if (lower === 'cn') return 'zh';
  if (lower === 'np') return 'ne';
  if (lower === 'kh') return 'km';
  if (lower === 'kr') return 'ko';
  return lower;
};

const emptyTranslations = (): Record<string, string> => ({
  ko: '',
  en: '',
  vi: '',
  uz: '',
});

const resolveAttachmentType = (
  url: string,
  mimeType?: string,
  fileName?: string
): Chat2Message['messageType'] => {
  if (mimeType?.startsWith('image/')) return 'IMAGE';
  if (mimeType?.startsWith('video/')) return 'VIDEO';

  const candidate = (fileName || url).split('?')[0].toLowerCase();
  if (imageExtensions.some((ext) => candidate.endsWith(ext))) return 'IMAGE';
  if (videoExtensions.some((ext) => candidate.endsWith(ext))) return 'VIDEO';
  return 'FILE';
};

const extractFileName = (url?: string | null) => {
  if (!url) return '';
  const cleaned = url.split('?')[0].trim();
  if (!cleaned) return '';
  const parts = cleaned.split('/');
  return parts[parts.length - 1] || '';
};

const buildLastMessagePreview = (
  messageType: Chat2Message['messageType'],
  message: string,
  metadata?: MessageMetadata
) => {
  const trimmed = message.trim();
  let preview = trimmed;
  if (messageType === 'IMAGE') preview = '[이미지]';
  if (messageType === 'VIDEO') preview = '[동영상]';
  if (messageType === 'FILE') preview = trimmed || metadata?.fileName || '[파일]';
  if (messageType === 'SYSTEM') preview = trimmed || '시스템 메시지';
  if (messageType === 'EMERGENCY') preview = trimmed || metadata?.address || '긴급 메시지';
  if (metadata?.replyTo?.messageId) {
    return preview ? `답글: ${preview}` : '답글';
  }
  return preview;
};

const toMillisOrUndefined = (value: unknown): number | undefined => {
  if (!value) return undefined;
  if (value instanceof Timestamp) return value.toMillis();
  if (typeof value === 'object' && value !== null) {
    const maybe = value as { toMillis?: () => number };
    if (typeof maybe.toMillis === 'function') {
      try {
        return maybe.toMillis();
      } catch {
        return undefined;
      }
    }
  }
  return undefined;
};

const resolveSenderName = (user: ReturnType<typeof useAuthContext>['user']) =>
  (user as any)?.memberName ||
  (user as any)?.name ||
  (user as any)?.displayName ||
  (user as any)?.memberNameOrg ||
  (user as any)?.member?.memberName ||
  (user as any)?.member?.name ||
  (user as any)?.companyMember?.memberName ||
  '';

const createClientMessageId = () => `c_${Date.now()}_${Math.floor(Math.random() * 10000000000)}`;

const mapMessageDoc = (docSnap: QueryDocumentSnapshot<DocumentData>): Chat2Message => {
  const data = docSnap.data() ?? {};
  const createdAtMs =
    toMillisOrUndefined(data.createdAt) ??
    // pending writes may not have server timestamp yet
    (typeof data.clientCreatedAt === 'number' ? data.clientCreatedAt : Date.now());
  return {
    id: String(data.id || docSnap.id),
    chatRoomId: String(data.chatRoomId || ''),
    senderId: String(data.senderId || data.senderMemberIdx || ''),
    senderName: data.senderName ? String(data.senderName) : undefined,
    senderLang: data.senderLang ? String(data.senderLang) : undefined,
    message: String(data.message || ''),
    messageType: String(data.messageType || 'TEXT') as Chat2Message['messageType'],
    translations:
      data.translations && typeof data.translations === 'object'
        ? Object.fromEntries(
            Object.entries(data.translations as Record<string, unknown>).map(([k, v]) => [
              String(k),
              String(v ?? ''),
            ])
          )
        : undefined,
    metadata:
      data.metadata && typeof data.metadata === 'object' && !Array.isArray(data.metadata)
        ? (data.metadata as MessageMetadata)
        : undefined,
    createdAtMs,
    timestamp: String(createdAtMs),
    sharedDocumentIdx:
      typeof data.sharedDocumentIdx === 'number' ? data.sharedDocumentIdx : undefined,
    attachments: Array.isArray(data.attachments)
      ? (data.attachments as unknown[]).map((v) => String(v)).filter((v) => v.trim().length > 0)
      : null,
    _pending: docSnap.metadata.hasPendingWrites,
  };
};

const mapParticipantDoc = (docSnap: QueryDocumentSnapshot<DocumentData>): RoomParticipantDoc => {
  const data = docSnap.data() ?? {};
  return {
    userId: String(data.userId || docSnap.id),
    joinedAt: toMillisOrUndefined(data.joinedAt),
    leftAt: data.leftAt ? (toMillisOrUndefined(data.leftAt) ?? null) : null,
    customRoomName: data.customRoomName ? String(data.customRoomName) : undefined,
    customRoomNameAuto:
      typeof data.customRoomNameAuto === 'boolean' ? data.customRoomNameAuto : undefined,
    notificationsEnabled:
      typeof data.notificationsEnabled === 'boolean' ? data.notificationsEnabled : undefined,
    lastReadAt: toMillisOrUndefined(data.lastReadAt),
    unreadCount: typeof data.unreadCount === 'number' ? data.unreadCount : undefined,
    mutedUntil: data.mutedUntil ? (toMillisOrUndefined(data.mutedUntil) ?? null) : null,
  };
};

export function useChat2RoomFirestore({ chatRoomId }: UseChatRoomFirestoreProps) {
  const { user } = useAuthContext();

  const [liveMessages, setLiveMessages] = useState<Chat2Message[]>([]);
  const [olderMessages, setOlderMessages] = useState<Chat2Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);

  const [participants, setParticipants] = useState<RoomParticipantDoc[]>([]);
  const [presenceByUserId, setPresenceByUserId] = useState<Record<string, PresenceDoc>>({});

  const paginationCursorRef = useRef<QueryDocumentSnapshot<DocumentData> | null>(null);
  const hasMoreRef = useRef<boolean>(false);
  const hasLoadedOlderRef = useRef<boolean>(false);

  const [uid, setUid] = useState<string | null>(() => auth.currentUser?.uid ?? null);

  useEffect(() => onAuthStateChanged(auth, (u) => setUid(u?.uid ?? null)), []);

  // Presence: set active room for current user
  useEffect(() => {
    if (!chatRoomId || !uid) return undefined;

    const setActive = async (activeRoomId: string | null) => {
      try {
        await setDoc(
          doc(firestore, 'presence', uid),
          {
            state: 'active',
            activeRoomId,
            lastActiveAt: serverTimestamp(),
          },
          { merge: true }
        );
      } catch (error) {
        if (import.meta.env.DEV) {
          console.warn('[presence] update failed', error);
        }
      }
    };

    setActive(chatRoomId);

    return () => {
      // Best-effort cleanup
      setActive(null);
    };
  }, [chatRoomId, uid]);

  // Messages: subscribe to latest chunk
  useEffect(() => {
    if (!chatRoomId || !uid) {
      setLiveMessages([]);
      setOlderMessages([]);
      setHasMore(false);
      paginationCursorRef.current = null;
      hasMoreRef.current = false;
      return undefined;
    }

    setIsLoading(true);
    setLiveMessages([]);
    setOlderMessages([]);
    setHasMore(false);
    paginationCursorRef.current = null;
    hasMoreRef.current = false;
    hasLoadedOlderRef.current = false;

    const col = collection(firestore, 'chatRooms', chatRoomId, 'messages');
    const q = query(col, orderBy('createdAt', 'desc'), limit(50));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const docs = snapshot.docs;
        const mapped = docs.map(mapMessageDoc);
        // reverse to ascending for UI
        const asc = [...mapped].sort((a, b) => a.createdAtMs - b.createdAtMs);
        setLiveMessages(asc);

        if (!hasLoadedOlderRef.current) {
          paginationCursorRef.current = docs.length > 0 ? docs[docs.length - 1] : null;
          hasMoreRef.current = docs.length >= 50;
          setHasMore(docs.length >= 50);
        } else {
          setHasMore(hasMoreRef.current);
        }

        setIsLoading(false);
      },
      (error) => {
        if (import.meta.env.DEV) {
          console.error('[chat] message subscribe failed', error);
        }
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [chatRoomId, uid]);

  const messages = useMemo(() => {
    const map = new Map<string, Chat2Message>();
    for (const msg of [...olderMessages, ...liveMessages]) {
      map.set(msg.id, msg);
    }
    return Array.from(map.values()).sort((a, b) => a.createdAtMs - b.createdAtMs);
  }, [olderMessages, liveMessages]);

  const loadMore = useCallback(async () => {
    if (!chatRoomId) return;
    const cursor = paginationCursorRef.current;
    if (!cursor) {
      setHasMore(false);
      hasMoreRef.current = false;
      return;
    }
    if (isLoadingMore) return;
    setIsLoadingMore(true);

    try {
      const col = collection(firestore, 'chatRooms', chatRoomId, 'messages');
      const q = query(col, orderBy('createdAt', 'desc'), startAfter(cursor), limit(20));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        setHasMore(false);
        hasMoreRef.current = false;
        return;
      }

      const older = snapshot.docs.map(mapMessageDoc);
      const asc = [...older].sort((a, b) => a.createdAtMs - b.createdAtMs);
      setOlderMessages((prev) => {
        const merged = [...asc, ...prev];
        const unique = new Map<string, Chat2Message>();
        for (const m of merged) unique.set(m.id, m);
        return Array.from(unique.values()).sort((a, b) => a.createdAtMs - b.createdAtMs);
      });

      hasLoadedOlderRef.current = true;
      paginationCursorRef.current = snapshot.docs[snapshot.docs.length - 1];
      const more = snapshot.docs.length >= 20;
      setHasMore(more);
      hasMoreRef.current = more;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('[chat] loadMore failed', error);
      }
    } finally {
      setIsLoadingMore(false);
    }
  }, [chatRoomId, isLoadingMore]);

  // Participants: subscribe
  useEffect(() => {
    if (!chatRoomId || !uid) {
      setParticipants([]);
      return undefined;
    }

    const col = collection(firestore, 'chatRooms', chatRoomId, 'participants');
    const unsubscribe = onSnapshot(
      col,
      (snapshot) => {
        const items = snapshot.docs.map(mapParticipantDoc);
        setParticipants(items);
      },
      (error) => {
        if (import.meta.env.DEV) {
          console.error('[chat] participants subscribe failed', error);
        }
      }
    );

    return () => unsubscribe();
  }, [chatRoomId, uid]);

  // Presence: subscribe per participant
  useEffect(() => {
    if (!participants.length) {
      setPresenceByUserId({});
      return undefined;
    }

    const unsubscribers: Unsubscribe[] = [];
    const next: Record<string, PresenceDoc> = {};

    const upsert = (userId: string, patch: PresenceDoc) => {
      next[userId] = { ...next[userId], ...patch };
      setPresenceByUserId((prev) => ({ ...prev, [userId]: next[userId] }));
    };

    for (const p of participants) {
      const userId = p.userId;
      if (!userId) continue;

      const unsubscribe = onSnapshot(
        doc(firestore, 'presence', userId),
        (snap) => {
          const data = snap.data() ?? {};
          upsert(userId, {
            state: data.state,
            activeRoomId: data.activeRoomId ?? null,
            lastActiveAt: toMillisOrUndefined(data.lastActiveAt),
          });
        },
        () => {}
      );
      unsubscribers.push(unsubscribe);
    }

    return () => {
      unsubscribers.forEach((fn) => fn());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [participants.map((p) => p.userId).join(',')]);

  const sendMessage = useCallback(
    async (
      content: string,
      messageType: Chat2Message['messageType'] = 'TEXT',
      attachments?: string[],
      signalType?: string | null,
      sharedDocumentIdx?: number,
      attachmentMeta?: ChatAttachmentMeta,
      options?: SendMessageOptions
    ) => {
      if (!chatRoomId) {
        throw new Error('채팅방이 선택되지 않았습니다.');
      }
      const senderId = uid || auth.currentUser?.uid || '';
      if (!senderId) {
        throw new Error('Firebase 인증이 필요합니다. 다시 로그인 후 시도해주세요.');
      }

      const senderName = resolveSenderName(user) || '사용자';
      const senderLang = normalizeLang((user as any)?.memberLang || (user as any)?.lang || 'ko');

      const attachmentUrl = attachments && attachments.length > 0 ? attachments[0] : undefined;
      const resolvedType =
        attachmentUrl && attachmentUrl.trim()
          ? resolveAttachmentType(attachmentUrl, attachmentMeta?.mimeType, attachmentMeta?.fileName)
          : messageType;

      const messageId = createClientMessageId();
      const metadata: MessageMetadata = {};

      if (resolvedType === 'TEXT') {
        metadata.type = 'text';
      } else if (resolvedType === 'IMAGE') {
        metadata.type = 'image';
        if (attachmentUrl) metadata.imageUrl = attachmentUrl;
        if (attachmentMeta?.fileName) metadata.fileName = attachmentMeta.fileName;
      } else if (resolvedType === 'VIDEO') {
        metadata.type = 'video';
        if (attachmentUrl) metadata.videoUrl = attachmentUrl;
        if (attachmentMeta?.fileName) metadata.fileName = attachmentMeta.fileName;
      } else if (resolvedType === 'FILE') {
        metadata.type = 'file';
        if (attachmentUrl) metadata.fileUrl = attachmentUrl;
        metadata.fileName =
          attachmentMeta?.fileName || extractFileName(attachmentUrl) || '첨부파일';
      } else if (resolvedType === 'EMERGENCY' && signalType) {
        metadata.type = signalType;
      }
      if (options?.replyTo) {
        metadata.replyTo = options.replyTo;
      }
      if (sharedDocumentIdx != null) {
        metadata.sharedDocumentIdx = sharedDocumentIdx;
      }

      const translations = emptyTranslations();
      const trimmed = content.trim();
      if (trimmed) {
        const key = Object.prototype.hasOwnProperty.call(translations, senderLang)
          ? senderLang
          : 'ko';
        translations[key] = trimmed;
      }

      try {
        await chat2Service.createMessage({
          chatRoomId,
          message: trimmed,
          messageType: resolvedType,
          clientMessageId: messageId,
          ...(Object.keys(metadata).length > 0 ? { metadata } : {}),
        });
        return;
      } catch (backendError) {
        if (import.meta.env.DEV) {
          console.warn(
            '[chat2] createMessage failed, fallback to direct Firestore write',
            backendError
          );
        }
      }

      const payload: Record<string, any> = {
        id: messageId,
        clientMessageId: messageId,
        chatRoomId,
        senderId,
        senderName,
        senderLang,
        message: trimmed,
        messageType: resolvedType,
        createdAt: serverTimestamp(),
        clientCreatedAt: Date.now(),
        deletedAt: null,
        deletedBy: null,
        translations,
      };

      if (Object.keys(metadata).length > 0) {
        payload.metadata = metadata;
      }
      if (sharedDocumentIdx != null) {
        payload.sharedDocumentIdx = sharedDocumentIdx;
      }

      await setDoc(doc(firestore, 'chatRooms', chatRoomId, 'messages', messageId), payload);

      const preview = buildLastMessagePreview(
        resolvedType,
        trimmed || metadata.fileName || '',
        metadata
      );
      await setDoc(
        doc(firestore, 'userRooms', senderId, 'rooms', chatRoomId),
        {
          lastMessagePreview: preview,
          lastMessageAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          unreadCount: 0,
        },
        { merge: true }
      );

      chat2Service
        .notifyMessageSent({ chatRoomId, messageId })
        .catch((error) => console.warn('[chat2] notifyMessageSent failed', error));
    },
    [chatRoomId, uid, user]
  );

  return {
    messages,
    sendMessage,
    isLoading,
    hasMore,
    loadMore,
    isLoadingMore,
    participants,
    presenceByUserId,
  };
}
