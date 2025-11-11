import axiosInstance from 'src/lib/axios';

import { endpoints } from 'src/lib/axios';

import type {
  GetChatRoomsParams,
  GetChatRoomsResponse,
  GetMessagesParams,
  GetMessagesResponse,
  GetParticipantsParams,
  GetParticipantsResponse,
  SendMessageParams,
  SendMessageResponse,
  InviteParticipantsParams,
  InviteParticipantsResponse,
  RemoveParticipantsParams,
  RemoveParticipantsResponse,
  GetEmergencyStatsParams,
  GetEmergencyStatsResponse,
  GetAttachmentsParams,
  GetAttachmentsResponse,
  UploadImageParams,
  UploadImageResponse,
  UploadVoiceParams,
  UploadVoiceResponse,
} from './chat.types';

// ----------------------------------------------------------------------

/**
 * 채팅방 목록 조회
 * GET /api/chat/rooms
 */
export async function getChatRooms(
  params: GetChatRoomsParams
): Promise<GetChatRoomsResponse> {
  // TODO: API 엔드포인트 구현
  throw new Error('Not implemented');
}

/**
 * 메시지 목록 조회
 * GET /api/chat/rooms/:roomId/messages
 */
export async function getMessages(
  params: GetMessagesParams
): Promise<GetMessagesResponse> {
  // TODO: API 엔드포인트 구현
  throw new Error('Not implemented');
}

/**
 * 참가자 목록 조회
 * GET /api/chat/rooms/:roomId/participants
 */
export async function getParticipants(
  params: GetParticipantsParams
): Promise<GetParticipantsResponse> {
  // TODO: API 엔드포인트 구현
  throw new Error('Not implemented');
}

/**
 * 메시지 전송
 * POST /api/chat/rooms/:roomId/messages
 */
export async function sendMessage(
  params: SendMessageParams
): Promise<SendMessageResponse> {
  // TODO: API 엔드포인트 구현
  throw new Error('Not implemented');
}

/**
 * 참가자 초대
 * POST /api/chat/rooms/:roomId/participants/invite
 */
export async function inviteParticipants(
  params: InviteParticipantsParams
): Promise<InviteParticipantsResponse> {
  // TODO: API 엔드포인트 구현
  throw new Error('Not implemented');
}

/**
 * 참가자 내보내기
 * DELETE /api/chat/rooms/:roomId/participants
 */
export async function removeParticipants(
  params: RemoveParticipantsParams
): Promise<RemoveParticipantsResponse> {
  // TODO: API 엔드포인트 구현
  throw new Error('Not implemented');
}

/**
 * 응급 통계 조회
 * GET /api/chat/rooms/:roomId/emergency-stats
 */
export async function getEmergencyStats(
  params: GetEmergencyStatsParams
): Promise<GetEmergencyStatsResponse> {
  // TODO: API 엔드포인트 구현
  throw new Error('Not implemented');
}

/**
 * 첨부 파일 목록 조회
 * GET /api/chat/rooms/:roomId/attachments
 */
export async function getAttachments(
  params: GetAttachmentsParams
): Promise<GetAttachmentsResponse> {
  // TODO: API 엔드포인트 구현
  throw new Error('Not implemented');
}

/**
 * 이미지 파일 업로드
 * POST /api/chat/upload/image
 */
export async function uploadImage(
  params: UploadImageParams
): Promise<UploadImageResponse> {
  // TODO: API 엔드포인트 구현
  throw new Error('Not implemented');
}

/**
 * 음성 파일 업로드
 * POST /api/chat/upload/voice
 */
export async function uploadVoice(
  params: UploadVoiceParams
): Promise<UploadVoiceResponse> {
  // TODO: API 엔드포인트 구현
  throw new Error('Not implemented');
}

