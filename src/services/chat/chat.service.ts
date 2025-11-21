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
  BackupMessageParams,
  ShareDocumentParams,
  UpdateLastReadAtParams,
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
 * GET /chat/rooms
 */
export async function getChatRooms(
  params?: GetChatRoomsParams
): Promise<GetChatRoomsResponse> {
  const response = await axiosInstance.get<GetChatRoomsResponse>(endpoints.chat.rooms, {
    params,
  });
  return response.data;
}

/**
 * 채팅방 생성
 * POST /chat/rooms
 */
export async function createChatRoom(
  params: CreateChatRoomParams
): Promise<CreateChatRoomResponse> {
  const response = await axiosInstance.post<CreateChatRoomResponse>(
    endpoints.chat.rooms,
    params
  );
  return response.data;
}

/**
 * 채팅방 정보 조회
 * GET /chat/rooms/{chatRoomId}
 */
export async function getChatRoom(params: GetChatRoomParams): Promise<GetChatRoomResponse> {
  const response = await axiosInstance.get<GetChatRoomResponse>(
    `${endpoints.chat.rooms}/${params.chatRoomId}`
  );
  return response.data;
}

/**
 * 채팅방 이름 변경
 * PUT /chat/rooms/{chatRoomId}
 */
export async function updateChatRoom(
  params: UpdateChatRoomParams
): Promise<UpdateChatRoomResponse> {
  const response = await axiosInstance.put<UpdateChatRoomResponse>(
    `${endpoints.chat.rooms}/${params.chatRoomId}`,
    { name: params.name }
  );
  return response.data;
}

/**
 * 참가자 목록 조회
 * GET /chat/rooms/{chatRoomId}/participants
 */
export async function getParticipants(
  params: GetParticipantsParams
): Promise<GetParticipantsResponse> {
  const response = await axiosInstance.get<GetParticipantsResponse>(
    `${endpoints.chat.rooms}/${params.chatRoomId}/participants`
  );
  return response.data;
}

/**
 * 참가자 초대
 * POST /chat/rooms/{chatRoomId}/participants
 */
export async function inviteParticipants(
  params: InviteParticipantsParams
): Promise<InviteParticipantsResponse> {
  const response = await axiosInstance.post<InviteParticipantsResponse>(
    `${endpoints.chat.rooms}/${params.chatRoomId}/participants`,
    { memberIndexes: params.memberIndexes }
  );
  return response.data;
}

/**
 * 참가자 내보내기
 * DELETE /chat/rooms/{chatRoomId}/participants
 */
export async function removeParticipants(
  params: RemoveParticipantsParams
): Promise<RemoveParticipantsResponse> {
  const response = await axiosInstance.delete<RemoveParticipantsResponse>(
    `${endpoints.chat.rooms}/${params.chatRoomId}/participants`,
    { data: { memberIndexes: params.memberIndexes } }
  );
  return response.data;
}

/**
 * 메시지 백업
 * POST /chat/messages/backup
 */
export async function backupMessage(params: BackupMessageParams): Promise<void> {
  await axiosInstance.post(`${endpoints.chat.messages}/backup`, params);
}

/**
 * 공유 문서 채팅방 공유
 * POST /chat/rooms/{chatRoomId}/share-document
 */
export async function shareDocument(params: ShareDocumentParams): Promise<void> {
  await axiosInstance.post(
    `${endpoints.chat.rooms}/${params.chatRoomId}/share-document`,
    { chatRoomIdList: params.chatRoomIdList }
  );
}

/**
 * 마지막 읽은 시간 업데이트
 * PATCH /chat/rooms/{chatRoomId}/read
 */
export async function updateLastReadAt(params: UpdateLastReadAtParams): Promise<void> {
  await axiosInstance.patch(`${endpoints.chat.rooms}/${params.chatRoomId}/read`);
}

/**
 * 안 읽은 메시지 수 계산
 * GET /chat/rooms/{chatRoomId}/unread-count
 */
export async function getUnreadCount(
  params: GetUnreadCountParams
): Promise<GetUnreadCountResponse> {
  const response = await axiosInstance.get<GetUnreadCountResponse>(
    `${endpoints.chat.rooms}/${params.chatRoomId}/unread-count`
  );
  return response.data;
}

/**
 * 응급 통계 조회
 * POST /chat/rooms/{chatRoomId}/statistics
 */
export async function getEmergencyStatistics(
  params: GetEmergencyStatisticsParams
): Promise<GetEmergencyStatisticsResponse> {
  const response = await axiosInstance.post<GetEmergencyStatisticsResponse>(
    `${endpoints.chat.rooms}/${params.chatRoomId}/statistics`,
    params
  );
  return response.data;
}

/**
 * 첨부 파일 목록 조회
 * GET /chat/rooms/{chatRoomId}/attachments
 */
export async function getAttachments(
  params: GetAttachmentsParams
): Promise<GetAttachmentsResponse> {
  const response = await axiosInstance.get<GetAttachmentsResponse>(
    `${endpoints.chat.rooms}/${params.chatRoomId}/attachments`
  );
  return response.data;
}

/**
 * 사고 발생 현황 채팅방 자동 생성/참가
 * POST /chat/emergency-rooms/{companyIdx}/join
 */
export async function createOrJoinEmergencyRoom(
  params: CreateOrJoinEmergencyRoomParams
): Promise<CreateOrJoinEmergencyRoomResponse> {
  const response = await axiosInstance.post<CreateOrJoinEmergencyRoomResponse>(
    `${endpoints.chat.emergencyRooms}/${params.companyIdx}/join`
  );
  return response.data;
}

