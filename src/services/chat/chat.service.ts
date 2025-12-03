import axiosInstance from 'src/lib/axios';

import { endpoints } from 'src/lib/axios';

import type {
  GetChatRoomsParams,
  GetChatRoomsResponse,
  CreateChatRoomParams,
  CreateChatRoomResponse,
  GetChatRoomParams,
  GetChatRoomResponse,
  UpdateChatRoomParams,
  UpdateChatRoomResponse,
  GetParticipantsParams,
  GetParticipantsResponse,
  InviteParticipantsParams,
  InviteParticipantsResponse,
  RemoveParticipantsParams,
  RemoveParticipantsResponse,
  LeaveChatRoomParams,
  LeaveChatRoomResponse,
  BackupMessageParams,
  BackupMessageResponse,
  ShareDocumentParams,
  ShareDocumentResponse,
  UpdateLastReadAtParams,
  UpdateLastReadAtResponse,
  GetUnreadCountParams,
  GetUnreadCountResponse,
  GetEmergencyStatisticsParams,
  GetEmergencyStatisticsResponse,
  GetAttachmentsParams,
  GetAttachmentsResponse,
  CreateOrJoinEmergencyRoomParams,
  CreateOrJoinEmergencyRoomResponse,
} from './chat.types';

// ----------------------------------------------------------------------

/**
 * 채팅방 목록 조회
 * GET /safeyoui/api/chat/rooms
 */
export async function getChatRooms(params?: GetChatRoomsParams): Promise<GetChatRoomsResponse> {
  const response = await axiosInstance.get<GetChatRoomsResponse>(endpoints.chat.rooms, {
    params,
  });
  return response.data;
}

/**
 * 채팅방 생성
 * POST /safeyoui/api/chat/rooms
 */
export async function createChatRoom(
  params: CreateChatRoomParams
): Promise<CreateChatRoomResponse> {
  const response = await axiosInstance.post<CreateChatRoomResponse>(endpoints.chat.rooms, {
    memberIndexes: params.memberIndexes,
  });
  return response.data;
}

/**
 * 채팅방 정보 조회
 * GET /safeyoui/api/chat/rooms/{chatRoomIdx}
 */
export async function getChatRoom(params: GetChatRoomParams): Promise<GetChatRoomResponse> {
  const response = await axiosInstance.get<GetChatRoomResponse>(
    `${endpoints.chat.rooms}/${params.chatRoomIdx}`
  );
  return response.data;
}

/**
 * 채팅방 이름 변경
 * PUT /safeyoui/api/chat/rooms/{chatRoomIdx}
 */
export async function updateChatRoom(
  params: UpdateChatRoomParams
): Promise<UpdateChatRoomResponse> {
  const response = await axiosInstance.put<UpdateChatRoomResponse>(
    `${endpoints.chat.rooms}/${params.chatRoomIdx}`,
    { name: params.name }
  );
  return response.data;
}

/**
 * 참가자 목록 조회
 * GET /safeyoui/api/chat/rooms/{chatRoomIdx}/participants
 */
export async function getParticipants(
  params: GetParticipantsParams
): Promise<GetParticipantsResponse> {
  const response = await axiosInstance.get<GetParticipantsResponse>(
    `${endpoints.chat.rooms}/${params.chatRoomIdx}/participants`
  );
  return response.data;
}

/**
 * 참가자 초대
 * POST /safeyoui/api/chat/rooms/{chatRoomIdx}/participants
 */
export async function inviteParticipants(
  params: InviteParticipantsParams
): Promise<InviteParticipantsResponse> {
  const response = await axiosInstance.post<InviteParticipantsResponse>(
    `${endpoints.chat.rooms}/${params.chatRoomIdx}/participants`,
    { memberIndexes: params.memberIndexes }
  );
  return response.data;
}

/**
 * 참가자 내보내기
 * DELETE /safeyoui/api/chat/rooms/{chatRoomIdx}/participants
 */
export async function removeParticipants(
  params: RemoveParticipantsParams
): Promise<RemoveParticipantsResponse> {
  const response = await axiosInstance.delete<RemoveParticipantsResponse>(
    `${endpoints.chat.rooms}/${params.chatRoomIdx}/participants`,
    { data: { memberIndexes: params.memberIndexes } }
  );
  return response.data;
}

/**
 * 채팅방 나가기
 * DELETE /safeyoui/api/chat/rooms/{chatRoomIdx}/leave
 */
export async function leaveChatRoom(
  params: LeaveChatRoomParams
): Promise<LeaveChatRoomResponse> {
  const response = await axiosInstance.delete<LeaveChatRoomResponse>(
    `${endpoints.chat.rooms}/${params.chatRoomIdx}/leave`
  );
  return response.data;
}

/**
 * 메시지 백업
 * POST /safeyoui/api/chat/messages/backup
 */
export async function backupMessage(params: BackupMessageParams): Promise<BackupMessageResponse> {
  const response = await axiosInstance.post<BackupMessageResponse>(
    `${endpoints.chat.messages}/backup`,
    params
  );
  return response.data;
}

/**
 * 공유 문서 채팅방 공유
 * POST /safeyoui/api/chat/rooms/{chatRoomIdx}/share-document
 */
export async function shareDocument(params: ShareDocumentParams): Promise<ShareDocumentResponse> {
  const { chatRoomIdx, ...body } = params;
  const response = await axiosInstance.post<ShareDocumentResponse>(
    `${endpoints.chat.rooms}/${chatRoomIdx}/share-document`,
    body
  );
  return response.data;
}

/**
 * 마지막 읽은 시간 업데이트
 * PATCH /safeyoui/api/chat/rooms/{chatRoomIdx}/read
 */
export async function updateLastReadAt(
  params: UpdateLastReadAtParams
): Promise<UpdateLastReadAtResponse> {
  const response = await axiosInstance.patch<UpdateLastReadAtResponse>(
    `${endpoints.chat.rooms}/${params.chatRoomIdx}/read`,
    { timestamp: params.timestamp }
  );
  return response.data;
}

/**
 * 안 읽은 메시지 수 계산
 * GET /safeyoui/api/chat/rooms/{chatRoomIdx}/unread-count
 */
export async function getUnreadCount(
  params: GetUnreadCountParams
): Promise<GetUnreadCountResponse> {
  const response = await axiosInstance.get<GetUnreadCountResponse>(
    `${endpoints.chat.rooms}/${params.chatRoomIdx}/unread-count`
  );
  return response.data;
}

/**
 * 응급 통계 조회
 * POST /safeyoui/api/chat/rooms/{chatRoomIdx}/statistics
 */
export async function getEmergencyStatistics(
  params: GetEmergencyStatisticsParams
): Promise<GetEmergencyStatisticsResponse> {
  const { chatRoomIdx, ...body } = params;
  const response = await axiosInstance.post<GetEmergencyStatisticsResponse>(
    `${endpoints.chat.rooms}/${chatRoomIdx}/statistics`,
    body
  );
  return response.data;
}

/**
 * 첨부 파일 목록 조회
 * GET /safeyoui/api/chat/rooms/{chatRoomIdx}/attachments
 */
export async function getAttachments(
  params: GetAttachmentsParams
): Promise<GetAttachmentsResponse> {
  const response = await axiosInstance.get<GetAttachmentsResponse>(
    `${endpoints.chat.rooms}/${params.chatRoomIdx}/attachments`
  );
  return response.data;
}

/**
 * 사고 발생 현황 채팅방 자동 생성/참가
 * POST /safeyoui/api/chat/emergency-rooms/{companyIdx}/join
 */
export async function createOrJoinEmergencyRoom(
  params: CreateOrJoinEmergencyRoomParams
): Promise<CreateOrJoinEmergencyRoomResponse> {
  const response = await axiosInstance.post<CreateOrJoinEmergencyRoomResponse>(
    `${endpoints.chat.emergencyRooms}/${params.companyIdx}/join`
  );
  return response.data;
}
