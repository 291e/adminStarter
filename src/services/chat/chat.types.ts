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

// 참가자 목록 조회 요청 파라미터
export type GetParticipantsParams = {
  roomId: string;
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
  roomId: string;
  participantIds: string[];
};

// 참가자 초대 응답
export type InviteParticipantsResponse = BaseResponseDto;

// 참가자 내보내기 요청 파라미터
export type RemoveParticipantsParams = {
  roomId: string;
  participantIds: string[];
};

// 참가자 내보내기 응답
export type RemoveParticipantsResponse = BaseResponseDto;

// 응급 통계 정보
export type EmergencyStats = {
  month: number;
  year: number;
  count: number;
};

// 응급 통계 조회 요청 파라미터
export type GetEmergencyStatsParams = {
  roomId: string;
};

// 응급 통계 조회 응답
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
  roomId: string;
};

// 첨부 파일 목록 조회 응답
export type GetAttachmentsResponse = BaseResponseDto<{
  attachments: Attachment[];
}>;

// 이미지 업로드 요청 파라미터
export type UploadImageParams = {
  file: File;
  roomId: string;
};

// 이미지 업로드 응답
export type UploadImageResponse = BaseResponseDto<{
  url: string;
  attachmentId: string;
}>;

// 음성 업로드 요청 파라미터
export type UploadVoiceParams = {
  file: File;
  roomId: string;
};

// 음성 업로드 응답
export type UploadVoiceResponse = BaseResponseDto<{
  url: string;
  attachmentId: string;
}>;

