import axiosInstance from 'src/lib/axios';

import { endpoints } from 'src/lib/axios';

import type {
  SendPushNotificationDto,
  GetNotificationHistoryParams,
  NotificationHistoryResponseDto,
  MarkNotificationReadResponseDto,
} from './notification.types';

// ----------------------------------------------------------------------

/**
 * 여러 명에게 푸시 알림 전송
 * POST /notification/push
 */
export async function sendPushNotification(params: SendPushNotificationDto): Promise<void> {
  await axiosInstance.post(endpoints.notification.push, params);
}

/**
 * 알림 이력 조회
 * GET /notification/history
 */
export async function getNotificationHistory(
  params: GetNotificationHistoryParams = {}
): Promise<NotificationHistoryResponseDto> {
  const response = await axiosInstance.get<NotificationHistoryResponseDto>(
    endpoints.notification.history,
    {
      params,
    }
  );
  // axios가 자동으로 response.data를 반환하지만, 실제 API는 body.data 구조이므로 그대로 반환
  return response.data;
}

/**
 * 알림 읽음 처리
 * PUT /notification/history/{notificationId}/read
 */
export async function markNotificationAsRead(
  notificationId: string
): Promise<MarkNotificationReadResponseDto> {
  const response = await axiosInstance.put<MarkNotificationReadResponseDto>(
    `${endpoints.notification.history}/${notificationId}/read`
  );
  return response.data;
}
