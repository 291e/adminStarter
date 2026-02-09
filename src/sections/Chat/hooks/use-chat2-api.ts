import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

import * as chat2Service from 'src/services/chat2/chat2.service';
import type {
  CreateRoomParams,
  InviteParticipantsParams,
  LeaveRoomParams,
  MarkReadParams,
  RenameRoomParams,
} from 'src/services/chat2/chat2.types';

export function useCreateChat2Room() {
  return useMutation({
    mutationFn: (params: CreateRoomParams) => chat2Service.createRoom(params),
    onError: (error: any) => {
      const message = error?.message || '채팅방 생성에 실패했습니다.';
      toast.error(message);
    },
  });
}

export function useRenameChat2Room() {
  return useMutation({
    mutationFn: (params: RenameRoomParams) => chat2Service.renameRoom(params),
    onSuccess: () => toast.success('채팅방 이름이 변경되었습니다.'),
    onError: (error: any) => {
      const message = error?.message || '채팅방 이름 변경에 실패했습니다.';
      toast.error(message);
    },
  });
}

export function useInviteChat2Participants() {
  return useMutation({
    mutationFn: (params: InviteParticipantsParams) => chat2Service.inviteParticipants(params),
    onSuccess: () => toast.success('참가자가 초대되었습니다.'),
    onError: (error: any) => {
      const message = error?.message || '참가자 초대에 실패했습니다.';
      toast.error(message);
    },
  });
}

export function useLeaveChat2Room() {
  return useMutation({
    mutationFn: (params: LeaveRoomParams) => chat2Service.leaveRoom(params),
    onSuccess: () => toast.success('채팅방을 나갔습니다.'),
    onError: (error: any) => {
      const message = error?.message || '채팅방 나가기에 실패했습니다.';
      toast.error(message);
    },
  });
}

export function useMarkChat2Read() {
  return useMutation({
    mutationFn: (params: MarkReadParams) => chat2Service.markRead(params),
  });
}

