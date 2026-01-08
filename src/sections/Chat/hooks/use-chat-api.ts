import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

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
    refetchInterval: 3000,
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
    onSuccess: (response) => {
      const resultMessage = response?.header?.resultMessage || '채팅방이 생성되었습니다.';
      if (resultMessage && resultMessage !== 'SUCCESS') {
        toast.success(resultMessage);
      } else {
        toast.success('채팅방이 생성되었습니다.');
      }
      queryClient.invalidateQueries({ queryKey: ['chatRooms'] });
    },
    onError: (error: any) => {
      const resultMessage =
        error?.response?.data?.header?.resultMessage ||
        error?.message ||
        '채팅방 생성에 실패했습니다.';
      toast.error(resultMessage);
    },
  });
}

export function useUpdateChatRoom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: UpdateChatRoomParams) => chatService.updateChatRoom(params),
    onSuccess: (response, variables) => {
      const resultMessage = response?.header?.resultMessage || '채팅방 정보가 수정되었습니다.';
      if (resultMessage && resultMessage !== 'SUCCESS') {
        toast.success(resultMessage);
      } else {
        toast.success('채팅방 정보가 수정되었습니다.');
      }
      queryClient.invalidateQueries({ queryKey: ['chatRooms'] });
      // axios 인터셉터가 평탄화하므로 body를 거치지 않고 직접 접근
      const chatRoomIdx = (response as any).chatRoomIdx || variables.chatRoomIdx;
      queryClient.invalidateQueries({ queryKey: ['chatRoom', chatRoomIdx] });
    },
    onError: (error: any) => {
      const resultMessage =
        error?.response?.data?.header?.resultMessage ||
        error?.message ||
        '채팅방 수정에 실패했습니다.';
      toast.error(resultMessage);
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
    onSuccess: (response, variables) => {
      const resultMessage = response?.header?.resultMessage || '참가자가 초대되었습니다.';
      if (resultMessage && resultMessage !== 'SUCCESS') {
        toast.success(resultMessage);
      } else {
        toast.success('참가자가 초대되었습니다.');
      }
      queryClient.invalidateQueries({ queryKey: ['chatParticipants', variables.chatRoomIdx] });
    },
    onError: (error: any) => {
      const resultMessage =
        error?.response?.data?.header?.resultMessage ||
        error?.message ||
        '참가자 초대에 실패했습니다.';
      toast.error(resultMessage);
    },
  });
}

export function useRemoveParticipants() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: RemoveParticipantsParams) => chatService.removeParticipants(params),
    onSuccess: (response, variables) => {
      const resultMessage = response?.header?.resultMessage || '참가자가 제거되었습니다.';
      if (resultMessage && resultMessage !== 'SUCCESS') {
        toast.success(resultMessage);
      } else {
        toast.success('참가자가 제거되었습니다.');
      }
      queryClient.invalidateQueries({ queryKey: ['chatParticipants', variables.chatRoomIdx] });
    },
    onError: (error: any) => {
      const resultMessage =
        error?.response?.data?.header?.resultMessage ||
        error?.message ||
        '참가자 제거에 실패했습니다.';
      toast.error(resultMessage);
    },
  });
}

export function useLeaveChatRoom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: LeaveChatRoomParams) => chatService.leaveChatRoom(params),
    onSuccess: (response) => {
      const resultMessage = response?.header?.resultMessage || '채팅방을 나갔습니다.';
      if (resultMessage && resultMessage !== 'SUCCESS') {
        toast.success(resultMessage);
      } else {
        toast.success('채팅방을 나갔습니다.');
      }
      queryClient.invalidateQueries({ queryKey: ['chatRooms'] });
    },
    onError: (error: any) => {
      const resultMessage =
        error?.response?.data?.header?.resultMessage ||
        error?.message ||
        '채팅방 나가기에 실패했습니다.';
      toast.error(resultMessage);
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
    onError: (error: any) => {
      if (import.meta.env.DEV) {
        console.error('❌ [useUpdateLastReadAt] 마지막 읽은 시간 업데이트 실패', {
          error,
          errorMessage: error?.message,
          errorResponse: error?.response?.data,
        });
      }
      // 읽은 시간 업데이트 실패는 조용히 처리 (토스트 표시 안 함)
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
    onSuccess: (response) => {
      const resultMessage = response?.header?.resultMessage || '비상 채팅방에 참가했습니다.';
      if (resultMessage && resultMessage !== 'SUCCESS') {
        toast.success(resultMessage);
      } else {
        toast.success('비상 채팅방에 참가했습니다.');
      }
    },
    onError: (error: any) => {
      const resultMessage =
        error?.response?.data?.header?.resultMessage ||
        error?.message ||
        '비상 채팅방 참가에 실패했습니다.';
      toast.error(resultMessage);
    },
  });
}
