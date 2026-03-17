import type { BaseResponseDto } from '../common';

export type Chat2RoomType = 'DIRECT' | 'GROUP' | 'EMERGENCY';
export type Chat2MessageType =
  | 'TEXT'
  | 'IMAGE'
  | 'VIDEO'
  | 'FILE'
  | 'SYSTEM'
  | 'EMERGENCY'
  | 'DELETED';

export type Chat2ReplyToPayload = {
  messageId: string;
  senderId?: string;
  senderName: string;
  messageType: Chat2MessageType | string;
  message: string;
  translations?: Record<string, string>;
  metadata?: Record<string, any>;
};

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

export type RemoveParticipantsParams = {
  roomId: string;
  participantIds: string[];
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

export type CreateMessageParams = {
  chatRoomId: string;
  message: string;
  messageType?: Chat2MessageType | string;
  clientMessageId?: string;
  metadata?: Record<string, any>;
};

export type CreateMessageResponse = BaseResponseDto<{
  messageId: string;
}>;

export type DeleteMessageParams = {
  chatRoomId: string;
  messageId: string;
};
