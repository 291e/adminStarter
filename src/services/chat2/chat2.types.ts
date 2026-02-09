import type { BaseResponseDto } from '../common';

export type Chat2RoomType = 'DIRECT' | 'GROUP' | 'EMERGENCY';

export type CreateRoomParams = {
  type: Chat2RoomType;
  name?: string;
  participantIds: string[];
};

export type CreateRoomResponse = BaseResponseDto<{
  roomId: string;
}>;

export type InviteParticipantsParams = {
  roomId: string;
  participantIds: string[];
};

export type LeaveRoomParams = {
  roomId: string;
};

export type RenameRoomParams = {
  roomId: string;
  name: string;
};

export type UpdateCustomNameParams = {
  roomId: string;
  userId: string;
  customRoomName: string;
};

export type UpdateNotificationsParams = {
  roomId: string;
  userId: string;
  notificationsEnabled: boolean;
};

export type MarkReadParams = {
  roomId: string;
  userId: string;
};

export type NotifyMessageSentParams = {
  chatRoomId: string;
  messageId: string;
};

