import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import * as chatService from 'src/services/chat/chat.service';
import type {
  GetChatRoomsParams,
  CreateChatRoomParams,
  UpdateChatRoomParams,
  GetChatRoomParams,
  InviteParticipantsParams,
  RemoveParticipantsParams,
  LeaveChatRoomParams,
  UpdateLastReadAtParams,
  GetEmergencyStatisticsParams,
  CreateOrJoinEmergencyRoomParams,
} from 'src/services/chat/chat.types';

// ----------------------------------------------------------------------

export function useGetChatRooms(params?: GetChatRoomsParams) {
  return useQuery({
    queryKey: ['chatRooms', params],
    queryFn: () => chatService.getChatRooms(params),
  });
}

export function useGetChatRoom(params: GetChatRoomParams) {
  return useQuery({
    queryKey: ['chatRoom', params.chatRoomIdx],
    queryFn: () => chatService.getChatRoom(params),
    enabled: !!params.chatRoomIdx,
  });
}

export function useCreateChatRoom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: CreateChatRoomParams) => chatService.createChatRoom(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatRooms'] });
    },
  });
}

export function useUpdateChatRoom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: UpdateChatRoomParams) => chatService.updateChatRoom(params),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['chatRooms'] });
      // axios 인터셉터가 평탄화하므로 body를 거치지 않고 직접 접근
      const chatRoomIdx = (data as any).chatRoomIdx || variables.chatRoomIdx;
      queryClient.invalidateQueries({ queryKey: ['chatRoom', chatRoomIdx] });
    },
  });
}

export function useGetParticipants(chatRoomIdx: number) {
  return useQuery({
    queryKey: ['chatParticipants', chatRoomIdx],
    queryFn: () => chatService.getParticipants({ chatRoomIdx }),
    enabled: !!chatRoomIdx,
  });
}

export function useInviteParticipants() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: InviteParticipantsParams) => chatService.inviteParticipants(params),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['chatParticipants', variables.chatRoomIdx] });
    },
  });
}

export function useRemoveParticipants() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: RemoveParticipantsParams) => chatService.removeParticipants(params),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['chatParticipants', variables.chatRoomIdx] });
    },
  });
}

export function useLeaveChatRoom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: LeaveChatRoomParams) => chatService.leaveChatRoom(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatRooms'] });
    },
  });
}

export function useUpdateLastReadAt() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: UpdateLastReadAtParams) => chatService.updateLastReadAt(params),
    onSuccess: (_, variables) => {
      // 안 읽은 메시지 수 갱신을 위해 관련 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: ['chatUnreadCount', variables.chatRoomIdx] });
      queryClient.invalidateQueries({ queryKey: ['chatRooms'] });
      queryClient.invalidateQueries({ queryKey: ['chatRoom', variables.chatRoomIdx] });
    },
  });
}

export function useGetUnreadCount(chatRoomIdx: number) {
  return useQuery({
    queryKey: ['chatUnreadCount', chatRoomIdx],
    queryFn: () => chatService.getUnreadCount({ chatRoomIdx }),
    enabled: !!chatRoomIdx,
  });
}

export function useGetEmergencyStatistics(params: GetEmergencyStatisticsParams) {
  return useQuery({
    queryKey: ['chatEmergencyStatistics', params.chatRoomIdx, params.startDate, params.endDate],
    queryFn: () => chatService.getEmergencyStatistics(params),
    enabled: !!params.chatRoomIdx,
  });
}

export function useGetAttachments(chatRoomIdx: number) {
  return useQuery({
    queryKey: ['chatAttachments', chatRoomIdx],
    queryFn: () => chatService.getAttachments({ chatRoomIdx }),
    enabled: !!chatRoomIdx,
  });
}

export function useCreateOrJoinEmergencyRoom() {
  return useMutation({
    mutationFn: (params: CreateOrJoinEmergencyRoomParams) =>
      chatService.createOrJoinEmergencyRoom(params),
  });
}
