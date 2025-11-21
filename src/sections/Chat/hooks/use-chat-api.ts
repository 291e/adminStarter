import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import {
  getChatRooms,
  createChatRoom,
  getChatRoom,
  updateChatRoom,
  getParticipants,
  inviteParticipants,
  removeParticipants,
  backupMessage,
  shareDocument,
  updateLastReadAt,
  getUnreadCount,
  getEmergencyStatistics,
  getAttachments,
  createOrJoinEmergencyRoom,
} from 'src/services/chat/chat.service';
import type {
  GetChatRoomsParams,
  CreateChatRoomParams,
  GetChatRoomParams,
  UpdateChatRoomParams,
  GetParticipantsParams,
  InviteParticipantsParams,
  RemoveParticipantsParams,
  BackupMessageParams,
  ShareDocumentParams,
  UpdateLastReadAtParams,
  GetUnreadCountParams,
  GetEmergencyStatisticsParams,
  GetAttachmentsParams,
  CreateOrJoinEmergencyRoomParams,
} from 'src/services/chat/chat.types';

// ----------------------------------------------------------------------

/**
 * 채팅방 목록 조회 Hook
 */
export function useChatRooms(params?: GetChatRoomsParams) {
  return useQuery({
    queryKey: ['chatRooms', params],
    queryFn: () => getChatRooms(params),
  });
}

/**
 * 채팅방 생성 Mutation Hook
 */
export function useCreateChatRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: CreateChatRoomParams) => createChatRoom(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatRooms'] });
    },
  });
}

/**
 * 채팅방 정보 조회 Hook
 */
export function useChatRoom(params: GetChatRoomParams) {
  return useQuery({
    queryKey: ['chatRoom', params.chatRoomId],
    queryFn: () => getChatRoom(params),
    enabled: !!params.chatRoomId,
  });
}

/**
 * 채팅방 이름 변경 Mutation Hook
 */
export function useUpdateChatRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: UpdateChatRoomParams) => updateChatRoom(params),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['chatRooms'] });
      queryClient.invalidateQueries({ queryKey: ['chatRoom', variables.chatRoomId] });
    },
  });
}

/**
 * 참가자 목록 조회 Hook
 */
export function useParticipants(params: GetParticipantsParams) {
  return useQuery({
    queryKey: ['chatParticipants', params.chatRoomId],
    queryFn: () => getParticipants(params),
    enabled: !!params.chatRoomId,
  });
}

/**
 * 참가자 초대 Mutation Hook
 */
export function useInviteParticipants() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: InviteParticipantsParams) => inviteParticipants(params),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['chatParticipants', variables.chatRoomId] });
    },
  });
}

/**
 * 참가자 내보내기 Mutation Hook
 */
export function useRemoveParticipants() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: RemoveParticipantsParams) => removeParticipants(params),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['chatParticipants', variables.chatRoomId] });
    },
  });
}

/**
 * 메시지 백업 Mutation Hook
 */
export function useBackupMessage() {
  return useMutation({
    mutationFn: (params: BackupMessageParams) => backupMessage(params),
  });
}

/**
 * 공유 문서 채팅방 공유 Mutation Hook
 */
export function useShareDocument() {
  return useMutation({
    mutationFn: (params: ShareDocumentParams) => shareDocument(params),
  });
}

/**
 * 마지막 읽은 시간 업데이트 Mutation Hook
 */
export function useUpdateLastReadAt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: UpdateLastReadAtParams) => updateLastReadAt(params),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['chatRooms'] });
      queryClient.invalidateQueries({ queryKey: ['chatRoom', variables.chatRoomId] });
    },
  });
}

/**
 * 안 읽은 메시지 수 조회 Hook
 */
export function useUnreadCount(params: GetUnreadCountParams) {
  return useQuery({
    queryKey: ['chatUnreadCount', params.chatRoomId],
    queryFn: () => getUnreadCount(params),
    enabled: !!params.chatRoomId,
  });
}

/**
 * 응급 통계 조회 Hook
 */
export function useEmergencyStatistics(params: GetEmergencyStatisticsParams) {
  return useQuery({
    queryKey: ['emergencyStatistics', params.chatRoomId, params.startDate, params.endDate],
    queryFn: () => getEmergencyStatistics(params),
    enabled: !!params.chatRoomId,
  });
}

/**
 * 첨부 파일 목록 조회 Hook
 */
export function useAttachments(params: GetAttachmentsParams) {
  return useQuery({
    queryKey: ['chatAttachments', params.chatRoomId],
    queryFn: () => getAttachments(params),
    enabled: !!params.chatRoomId,
  });
}

/**
 * 사고 발생 현황 채팅방 자동 생성/참가 Mutation Hook
 */
export function useCreateOrJoinEmergencyRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: CreateOrJoinEmergencyRoomParams) => createOrJoinEmergencyRoom(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatRooms'] });
    },
  });
}
