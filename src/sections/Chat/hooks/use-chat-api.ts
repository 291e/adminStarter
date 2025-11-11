import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import {
  getChatRooms,
  getMessages,
  getParticipants,
  sendMessage,
  inviteParticipants,
  removeParticipants,
  getEmergencyStats,
  getAttachments,
  uploadImage,
  uploadVoice,
} from 'src/services/chat/chat.service';
import type {
  GetChatRoomsParams,
  GetMessagesParams,
  GetParticipantsParams,
  SendMessageParams,
  InviteParticipantsParams,
  RemoveParticipantsParams,
  GetEmergencyStatsParams,
  GetAttachmentsParams,
  UploadImageParams,
  UploadVoiceParams,
} from 'src/services/chat/chat.types';

// ----------------------------------------------------------------------

/**
 * 채팅방 목록 조회 Hook
 */
export function useChatRooms(params: GetChatRoomsParams) {
  return useQuery({
    queryKey: ['chatRooms', params],
    queryFn: () => getChatRooms(params),
  });
}

/**
 * 메시지 목록 조회 Hook
 */
export function useMessages(params: GetMessagesParams) {
  return useQuery({
    queryKey: ['chatMessages', params.roomId, params.page],
    queryFn: () => getMessages(params),
    enabled: !!params.roomId,
  });
}

/**
 * 참가자 목록 조회 Hook
 */
export function useParticipants(params: GetParticipantsParams) {
  return useQuery({
    queryKey: ['chatParticipants', params.roomId],
    queryFn: () => getParticipants(params),
    enabled: !!params.roomId,
  });
}

/**
 * 메시지 전송 Mutation Hook
 */
export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: SendMessageParams) => sendMessage(params),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['chatMessages', variables.roomId] });
    },
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
      queryClient.invalidateQueries({ queryKey: ['chatParticipants', variables.roomId] });
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
      queryClient.invalidateQueries({ queryKey: ['chatParticipants', variables.roomId] });
    },
  });
}

/**
 * 응급 통계 조회 Hook
 */
export function useEmergencyStats(params: GetEmergencyStatsParams) {
  return useQuery({
    queryKey: ['emergencyStats', params.roomId],
    queryFn: () => getEmergencyStats(params),
    enabled: !!params.roomId,
  });
}

/**
 * 첨부 파일 목록 조회 Hook
 */
export function useAttachments(params: GetAttachmentsParams) {
  return useQuery({
    queryKey: ['chatAttachments', params.roomId],
    queryFn: () => getAttachments(params),
    enabled: !!params.roomId,
  });
}

/**
 * 이미지 업로드 Mutation Hook
 */
export function useUploadImage() {
  return useMutation({
    mutationFn: (params: UploadImageParams) => uploadImage(params),
  });
}

/**
 * 음성 업로드 Mutation Hook
 */
export function useUploadVoice() {
  return useMutation({
    mutationFn: (params: UploadVoiceParams) => uploadVoice(params),
  });
}

