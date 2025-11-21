// 채팅 API 타입 정의

import type { BaseResponseDto } from '../common';

// ----------------------------------------------------------------------

// 채팅방 타입
export type ChatRoomType = 'normal' | 'group' | 'chatbot' | 'emergency';

// 채팅방 정보
export type ChatRoom = {
  id: string;
  name: string;
  type: ChatRoomType;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
  // ... 기타 필드
};

// 채팅방 목록 조회 요청 파라미터
export type GetChatRoomsParams = {
  userId?: string;
};

// 채팅방 목록 조회 응답
export type GetChatRoomsResponse = BaseResponseDto<{
  rooms: ChatRoom[];
}>;

// 메시지 정보
export type Message = {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  attachments?: string[];
  // ... 기타 필드
};

// 메시지 목록 조회 요청 파라미터
export type GetMessagesParams = {
  roomId: string;
  page?: number;
  pageSize?: number;
};

// 메시지 목록 조회 응답
export type GetMessagesResponse = BaseResponseDto<{
  messages: Message[];
  total: number;
}>;

// 참가자 정보
export type Participant = {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  // ... 기타 필드
};

// 채팅방 생성 요청
export type CreateChatRoomParams = {
  name: string;
  memberIndexes?: number[];
};

// 채팅방 생성 응답
export type CreateChatRoomResponse = BaseResponseDto<{
  chatRoomId: string;
  name: string;
}>;

// 채팅방 정보 조회 요청
export type GetChatRoomParams = {
  chatRoomId: string;
};

// 채팅방 정보 조회 응답
export type GetChatRoomResponse = BaseResponseDto<ChatRoom>;

// 채팅방 이름 변경 요청
export type UpdateChatRoomParams = {
  chatRoomId: string;
  name: string;
};

// 채팅방 이름 변경 응답
export type UpdateChatRoomResponse = BaseResponseDto<ChatRoom>;

// 참가자 목록 조회 요청 파라미터
export type GetParticipantsParams = {
  chatRoomId: string;
};

// 참가자 목록 조회 응답
export type GetParticipantsResponse = BaseResponseDto<{
  participants: Participant[];
}>;

// 메시지 전송 요청 파라미터
export type SendMessageParams = {
  roomId: string;
  content: string;
  attachments?: string[];
};

// 메시지 전송 응답
export type SendMessageResponse = BaseResponseDto<{
  message: Message;
}>;

// 참가자 초대 요청 파라미터
export type InviteParticipantsParams = {
  chatRoomId: string;
  memberIndexes: number[];
};

// 참가자 초대 응답
export type InviteParticipantsResponse = BaseResponseDto;

// 참가자 내보내기 요청 파라미터
export type RemoveParticipantsParams = {
  chatRoomId: string;
  memberIndexes: number[];
};

// 참가자 내보내기 응답
export type RemoveParticipantsResponse = BaseResponseDto;

// 응급 통계 정보
export type EmergencyStats = {
  month: number;
  year: number;
  count: number;
};

// 메시지 백업 요청
export type BackupMessageParams = {
  chatRoomId: string;
  messageIds?: string[];
};

// 공유 문서 채팅방 공유 요청
export type ShareDocumentParams = {
  chatRoomId: string;
  chatRoomIdList: string[];
};

// 마지막 읽은 시간 업데이트 요청
export type UpdateLastReadAtParams = {
  chatRoomId: string;
};

// 안 읽은 메시지 수 조회 요청
export type GetUnreadCountParams = {
  chatRoomId: string;
};

// 안 읽은 메시지 수 조회 응답
export type GetUnreadCountResponse = BaseResponseDto<{
  unreadCount: number;
}>;

// 응급 통계 조회 요청 파라미터
export type GetEmergencyStatisticsParams = {
  chatRoomId: string;
  startDate?: string;
  endDate?: string;
};

// 응급 통계 조회 응답
export type GetEmergencyStatisticsResponse = BaseResponseDto<{
  statistics: Array<{
    month: number;
    year: number;
    count: number;
  }>;
}>;

// 기존 호환성을 위한 타입 (deprecated)
export type GetEmergencyStatsParams = {
  roomId: string;
};
export type GetEmergencyStatsResponse = BaseResponseDto<EmergencyStats>;

// 첨부 파일 정보
export type Attachment = {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  // ... 기타 필드
};

// 첨부 파일 목록 조회 요청 파라미터
export type GetAttachmentsParams = {
  chatRoomId: string;
};

// 첨부 파일 목록 조회 응답
export type GetAttachmentsResponse = BaseResponseDto<{
  attachments: Attachment[];
}>;

// 사고 발생 현황 채팅방 자동 생성/참가 요청
export type CreateOrJoinEmergencyRoomParams = {
  companyIdx: number;
};

// 사고 발생 현황 채팅방 자동 생성/참가 응답
export type CreateOrJoinEmergencyRoomResponse = BaseResponseDto<{
  chatRoomId: string;
  name: string;
}>;

