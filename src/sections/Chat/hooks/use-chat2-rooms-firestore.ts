import { useEffect, useMemo, useState } from 'react';

import type { DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

import { auth, firestore } from 'src/config/firebase';
import { useAuthContext } from 'src/auth/hooks';

import type { ChatRoom2 } from '../chat2.types';

type HookState = {
  rooms: ChatRoom2[];
  isLoading: boolean;
  error: string | null;
};

const compareRoomsByLastMessage = (a: ChatRoom2, b: ChatRoom2) => {
  if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;

  const aLastMessageAt = a.lastMessageAt ?? 0;
  const bLastMessageAt = b.lastMessageAt ?? 0;
  if (aLastMessageAt !== bLastMessageAt) return bLastMessageAt - aLastMessageAt;

  return a.roomId.localeCompare(b.roomId);
};

const toStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item)).filter((v) => v.trim().length > 0);
};

const toStringMap = (value: unknown): Record<string, string> => {
  if (!value || typeof value !== 'object') return {};
  if (Array.isArray(value)) return {};
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([k, v]) => [String(k), String(v ?? '')])
  );
};

const toMillisOrUndefined = (value: unknown): number | undefined => {
  if (!value) return undefined;
  if (typeof value === 'number') return Number.isFinite(value) ? value : undefined;
  if (typeof value === 'string') {
    const n = Number(value);
    if (!Number.isNaN(n) && Number.isFinite(n)) return n;
    const dt = new Date(value).getTime();
    return Number.isNaN(dt) ? undefined : dt;
  }
  // Firestore Timestamp
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

const toBool = (value: unknown, fallback: boolean): boolean => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (!normalized) return fallback;
    return normalized === 'true' || normalized === '1' || normalized === 'yes';
  }
  return fallback;
};

const toInt = (value: unknown, fallback: number = 0): number => {
  if (typeof value === 'number') return Number.isFinite(value) ? Math.trunc(value) : fallback;
  if (typeof value === 'string') {
    const n = Number(value);
    return Number.isNaN(n) ? fallback : Math.trunc(n);
  }
  return fallback;
};

const mapUserRoomDoc = (doc: QueryDocumentSnapshot<DocumentData>): ChatRoom2 => {
  const data = doc.data() ?? {};
  const roomId = String(data.roomId || doc.id);
  const type = String(data.type || '').toUpperCase() as ChatRoom2['type'];

  const lastMessageTranslations = toStringMap(
    data.lastMessageTranslations ?? data.Translations ?? data.translations
  );

  return {
    roomId,
    chatRoomId: roomId,
    chatRoomIdx: 0,
    type: (type || 'DIRECT') as ChatRoom2['type'],
    name: String(data.roomName || data.name || ''),
    participantIds: toStringArray(data.participantIds),
    participantCount:
      typeof data.participantCount === 'number'
        ? data.participantCount
        : typeof data.participantCount === 'string'
          ? Number(data.participantCount) || undefined
          : undefined,
    lastMessagePreview: String(data.lastMessagePreview || ''),
    lastMessageTranslations:
      Object.keys(lastMessageTranslations).length > 0 ? lastMessageTranslations : undefined,
    lastMessageAt: toMillisOrUndefined(data.lastMessageAt),
    lastMessageId: String(data.lastMessageId || '').trim() || undefined,
    unreadCount: toInt(data.unreadCount, 0),
    notificationsEnabled: toBool(data.notificationsEnabled, true),
    pinned: toBool(data.pinned, false),
    archived: toBool(data.archived, false),
    updatedAt: toMillisOrUndefined(data.updatedAt),
  };
};

export function useChat2RoomsFirestore(enabled: boolean = true): HookState {
  const { user } = useAuthContext();
  const [firebaseUid, setFirebaseUid] = useState<string | null>(
    () => auth.currentUser?.uid ?? null
  );
  const [state, setState] = useState<HookState>({
    rooms: [],
    isLoading: false,
    error: null,
  });

  useEffect(() => onAuthStateChanged(auth, (u) => setFirebaseUid(u?.uid ?? null)), []);

  // Note: Firestore Security Rules require Firebase Auth.
  // We only start listeners after Firebase auth state is ready to avoid PERMISSION_DENIED flakiness.
  const isAppUserKnown = useMemo(() => Boolean(user), [user]);

  useEffect(() => {
    if (!enabled) {
      setState({ rooms: [], isLoading: false, error: null });
      return undefined;
    }

    if (!firebaseUid) {
      setState({ rooms: [], isLoading: isAppUserKnown, error: null });
      return undefined;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    const col = collection(firestore, 'userRooms', firebaseUid, 'rooms');
    const q = query(col, orderBy('updatedAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        // Do not rely on `updatedAt` ordering because mark-read can update it and make the list jump.
        // Keep rooms ordered by last message time (and pinned first) for stable UX.
        const rooms = snapshot.docs.map(mapUserRoomDoc).sort(compareRoomsByLastMessage);
        setState({ rooms, isLoading: false, error: null });
      },
      (error) => {
        setState({ rooms: [], isLoading: false, error: error.message || String(error) });
      }
    );

    return () => unsubscribe();
  }, [enabled, firebaseUid, isAppUserKnown]);

  return state;
}
