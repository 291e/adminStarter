export type ChatRoomType2 = 'DIRECT' | 'GROUP' | 'EMERGENCY' | 'CHATBOT';

export type ChatRoom2 = {
  // Firestore doc id
  roomId: string;

  // Backward-friendly alias (legacy code used chatRoomId)
  chatRoomId: string;

  // Keep for compatibility with legacy UI flows (no longer used in chat2)
  chatRoomIdx?: number;

  type: ChatRoomType2;
  name: string;

  participantIds: string[];
  participantCount?: number;

  lastMessagePreview: string;
  lastMessageTranslations?: Record<string, string>;
  lastMessageAt?: number;
  lastMessageId?: string;

  unreadCount: number;
  notificationsEnabled: boolean;
  pinned: boolean;
  archived: boolean;
  updatedAt?: number;

  // Optional enriched data for UI (derived from participantIds + member map).
  participants?: ChatParticipant2[];
};

export type ChatParticipant2 = {
  memberIdx: number;
  name: string;
  profileImage?: string;
  unreadCount?: number;
  joinedAt?: number | string;
  lastSeen?: number | string;
  online?: number | boolean;
  customRoomName?: string;
  memberRole?: string;
  position?: string;
  positionName?: string;
  department?: string;
  leftAt?: number | string | null;
  notificationsEnabled?: boolean;
  mutedUntil?: number | string | null;
};

export type ChatAttachment2 = {
  id: string;
  name: string;
  url: string;
  type: string;
  createdAt: string;
};
