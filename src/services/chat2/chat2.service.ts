import axiosInstance, { endpoints } from 'src/lib/axios';

import type {
  CreateMessageParams,
  CreateMessageResponse,
  CreateRoomParams,
  CreateRoomResponse,
  InviteParticipantsParams,
  LeaveRoomParams,
  MarkReadParams,
  NotifyMessageSentParams,
  RemoveParticipantsParams,
  RenameRoomParams,
  UpdateCustomNameParams,
  UpdateNotificationsParams,
} from './chat2.types';

export async function createRoom(params: CreateRoomParams): Promise<CreateRoomResponse> {
  const response = await axiosInstance.post<CreateRoomResponse>(endpoints.chat2.rooms, params);
  return response.data;
}

export async function createMessage(params: CreateMessageParams): Promise<CreateMessageResponse> {
  const response = await axiosInstance.post<CreateMessageResponse>(
    endpoints.chat2.messages,
    params
  );
  return response.data;
}

export async function inviteParticipants(params: InviteParticipantsParams): Promise<void> {
  await axiosInstance.post(`${endpoints.chat2.rooms}/${params.roomId}/invite`, {
    participantIds: params.participantIds,
  });
}

export async function leaveRoom(params: LeaveRoomParams): Promise<void> {
  await axiosInstance.post(`${endpoints.chat2.rooms}/${params.roomId}/leave`);
}

export async function removeParticipants(params: RemoveParticipantsParams): Promise<void> {
  await axiosInstance.post(`${endpoints.chat2.rooms}/${params.roomId}/remove`, {
    participantIds: params.participantIds,
  });
}

export async function renameRoom(params: RenameRoomParams): Promise<void> {
  await axiosInstance.patch(`${endpoints.chat2.rooms}/${params.roomId}/name`, {
    name: params.name,
  });
}

export async function updateCustomName(params: UpdateCustomNameParams): Promise<void> {
  await axiosInstance.patch(
    `${endpoints.chat2.rooms}/${params.roomId}/participants/${params.userId}/custom-name`,
    {
      customRoomName: params.customRoomName,
    }
  );
}

export async function updateNotifications(params: UpdateNotificationsParams): Promise<void> {
  await axiosInstance.patch(
    `${endpoints.chat2.rooms}/${params.roomId}/participants/${params.userId}/notifications`,
    {
      notificationsEnabled: params.notificationsEnabled,
    }
  );
}

export async function markRead(params: MarkReadParams): Promise<void> {
  await axiosInstance.patch(
    `${endpoints.chat2.rooms}/${params.roomId}/participants/${params.userId}/read`,
    {}
  );
}

export async function notifyMessageSent(params: NotifyMessageSentParams): Promise<void> {
  await axiosInstance.post(`${endpoints.chat2.messages}/sent`, params);
}
