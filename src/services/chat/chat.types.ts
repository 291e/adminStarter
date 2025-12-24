import type { BaseResponseDto } from '../common';

// ----------------------------------------------------------------------

export type ChatRoomType = 'NORMAL' | 'GROUP' | 'EMERGENCY' | 'CHATBOT';

// 채팅방 정보 DTO
export type ChatRoomDto = {
  chatRoomIdx: number;
  chatRoomId: string; // Firebase Realtime Database ID (UUID)
  name: string;
  type: ChatRoomType;
  isGroup: number; // 0 or 1
  createdAt?: string;
  updatedAt?: string;
  lastMessage?:
    | string
    | {
        text: string;
        senderId?: string;
        translations?: Record<string, string>;
      };
  lastMessageAt?: string;
  lastSenderMemberIdx?: number;
  unreadCount?: number;
  participants?: ChatParticipantDto[];
};

// 참가자 정보 DTO
export type ChatParticipantDto = {
  memberIdx: number;
  name: string;
  profileImage?: string;
  unreadCount?: number;
  joinedAt?: string | number;
  lastSeen?: string | number;
  online?: number;
  customRoomName?: string; // 참가자별 커스텀 채팅방 이름
  memberRole?: string;
  position?: string;
  positionName?: string;
  department?: string;
  // 기타 필요한 필드
};

// ==========================================
// API Request/Response Types
// ==========================================

// GET /safeyoui/api/chat/rooms
export type GetChatRoomsParams = {
  page?: number;
  pageSize?: number;
};

export type GetChatRoomsResponse = BaseResponseDto<{
  chatRoomList: ChatRoomDto[];
  totalCount: number;
}>;

// POST /safeyoui/api/chat/rooms
export type CreateChatRoomParams = {
  memberIndexes: number[]; // 상대방 참가자 Index 배열
};

export type CreateChatRoomResponse = BaseResponseDto<{
  chatRoomIdx: number;
  chatRoomId: string;
}>;

// GET /safeyoui/api/chat/rooms/{chatRoomIdx}
export type GetChatRoomParams = {
  chatRoomIdx: number;
};

export type GetChatRoomResponse = BaseResponseDto<ChatRoomDto>;

// PUT /safeyoui/api/chat/rooms/{chatRoomIdx}
export type UpdateChatRoomParams = {
  chatRoomIdx: number;
  name: string;
};

export type UpdateChatRoomResponse = BaseResponseDto<{
  chatRoomIdx: number;
  name: string;
}>;

// GET /safeyoui/api/chat/rooms/{chatRoomIdx}/participants
export type GetParticipantsParams = {
  chatRoomIdx: number;
};

export type GetParticipantsResponse = BaseResponseDto<{
  participants: ChatParticipantDto[];
}>;

// POST /safeyoui/api/chat/rooms/{chatRoomIdx}/participants
export type InviteParticipantsParams = {
  chatRoomIdx: number;
  memberIndexes: number[];
};

export type InviteParticipantsResponse = BaseResponseDto<void>;

// DELETE /safeyoui/api/chat/rooms/{chatRoomIdx}/participants
export type RemoveParticipantsParams = {
  chatRoomIdx: number;
  memberIndexes: number[];
};

export type RemoveParticipantsResponse = BaseResponseDto<void>;

// DELETE /safeyoui/api/chat/rooms/{chatRoomIdx}/leave
export type LeaveChatRoomParams = {
  chatRoomIdx: number;
};

export type LeaveChatRoomResponse = BaseResponseDto<void>;

// POST /safeyoui/api/chat/messages/backup
export type BackupMessageParams = {
  id: string; // Message UUID
  chatRoomId: string;
  senderMemberIdx: number;
  message: string;
  messageType: string; // 'TEXT', 'IMAGE', 'FILE', 'SYSTEM'
  signalType?: string | null;
  attachments?: string[] | null;
  timestamp: string;
};

export type BackupMessageResponse = BaseResponseDto<void>;

// POST /safeyoui/api/chat/rooms/{chatRoomIdx}/share-document
export type ShareDocumentParams = {
  chatRoomIdx: number;
  documentId: string; // or relevant info
  // 공유할 문서 정보 등 정의 필요. 현재는 swagger 기반 추론.
  // swagger.json에 share-document body가 정의되어 있다면 확인 필요.
  // 임시로 any로 두고 나중에 수정하거나 swagger 확인.
  [key: string]: any;
};

export type ShareDocumentResponse = BaseResponseDto<void>;

// PATCH /safeyoui/api/chat/rooms/{chatRoomIdx}/read
export type UpdateLastReadAtParams = {
  chatRoomIdx: number;
  timestamp: string; // ISO string or timestamp string
};

export type UpdateLastReadAtResponse = BaseResponseDto<void>;

// GET /safeyoui/api/chat/rooms/{chatRoomIdx}/unread-count
export type GetUnreadCountParams = {
  chatRoomIdx: number;
};

export type GetUnreadCountResponse = BaseResponseDto<{
  unreadCount: number;
}>;

// POST /safeyoui/api/chat/rooms/{chatRoomIdx}/statistics
export type GetEmergencyStatisticsParams = {
  chatRoomIdx: number;
  startDate?: string;
  endDate?: string;
};

export type GetEmergencyStatisticsResponse = BaseResponseDto<{
  statistics: Array<{
    month: number;
    year: number;
    count: number;
  }>;
}>;

// GET /safeyoui/api/chat/rooms/{chatRoomIdx}/attachments
export type GetAttachmentsParams = {
  chatRoomIdx: number;
};

export type ChatAttachmentDto = {
  id: string;
  name: string;
  url: string;
  type: string;
  createdAt: string;
};

export type GetAttachmentsResponse = BaseResponseDto<{
  attachments: ChatAttachmentDto[];
}>;

// POST /safeyoui/api/chat/emergency-rooms/{companyIdx}/join
export type CreateOrJoinEmergencyRoomParams = {
  companyIdx: number;
};

export type CreateOrJoinEmergencyRoomResponse = BaseResponseDto<{
  chatRoomIdx: number;
  chatRoomId: string;
}>;
