// Notification API 타입 정의

import type { BaseResponseDto } from '../common';

// 푸시 알림 전송 요청
export type SendPushNotificationDto = {
  memberIndexes: number[];
  title: string;
  message: string;
  data?: Record<string, unknown>;
};

// 알림 이력 조회 파라미터
export type GetNotificationHistoryParams = {
  page?: number;
  pageSize?: number;
  startDate?: string;
  endDate?: string;
};

// 알림 정보
export type Notification = {
  notificationId: string;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  isRead: boolean;
  createdAt: string;
  readAt?: string;
};

// 알림 이력 조회 응답
export type NotificationHistoryResponseDto = BaseResponseDto<{
  notifications: Notification[];
  total: number;
  page: number;
  pageSize: number;
}>;

// 알림 읽음 처리 응답
export type MarkNotificationReadResponseDto = BaseResponseDto<{
  success: boolean;
}>;
