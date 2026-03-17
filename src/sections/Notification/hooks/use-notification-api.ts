import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import {
  getNotificationHistory,
  markNotificationAsRead,
} from 'src/services/notification/notification.service';
import type {
  GetNotificationHistoryParams,
  NotificationHistoryItem,
  Notification,
} from 'src/services/notification/notification.types';

// ----------------------------------------------------------------------

/**
 * 알림 타입을 UI 타입으로 변환
 */
function mapNotificationTypeToUIType(notificationType: string): string {
  const typeMap: Record<string, string> = {
    APPROVAL_REQUEST: 'order',
    SIGNATURE_REQUEST: 'mail',
    DEADLINE_REMINDER: 'delivery',
    APPROVAL_DEADLINE_15: 'delivery',
    APPROVAL_DEADLINE_7: 'delivery',
    APPROVAL_DEADLINE_3: 'delivery',
    APPROVAL_DEADLINE_1: 'delivery',
    SHARED_DOCUMENT_REGISTERED: 'order',
    APPROVAL_COMPLETED: 'order',
    SIGNATURE_COMPLETED: 'mail',
    DOCUMENT_STATUS_CHANGED: 'order',
    APPROVAL_PENDING_3: 'delivery',
    APPROVAL_PENDING_1: 'delivery',
    ACCIDENT_FREE_CERT_UPLOADED: 'order',
    SUBSCRIPTION_CHANGED: 'order',
    SUBSCRIPTION_SERVICE_CHANGED: 'order',
    SUBSCRIPTION_BILLING_REMINDER: 'order',
    SUBSCRIPTION_PAYMENT_SUCCESS: 'order',
    SUBSCRIPTION_PAYMENT_FAILED: 'order',
  };
  return typeMap[notificationType] || 'order';
}

/**
 * 알림 타입에 따른 제목 생성
 */
function generateNotificationTitle(item: NotificationHistoryItem): string {
  const { notificationType, safetySystemDocumentInformation } = item;
  const docName = safetySystemDocumentInformation?.documentName || '문서';
  const message = item.message || item.notificationMessage;

  if (message) {
    return message;
  }

  const titleMap: Record<string, string> = {
    APPROVAL_REQUEST: `<strong>${docName}</strong>에 대한 결재 요청이 있습니다.`,
    SIGNATURE_REQUEST: `<strong>${docName}</strong>에 대한 서명 요청이 있습니다.`,
    DEADLINE_REMINDER: `<strong>${docName}</strong>의 마감일이 임박했습니다.`,
    APPROVAL_DEADLINE_15: `<strong>${docName}</strong>의 결재 마감일이 15일 남았습니다.`,
    APPROVAL_DEADLINE_7: `<strong>${docName}</strong>의 결재 마감일이 7일 남았습니다.`,
    APPROVAL_DEADLINE_3: `<strong>${docName}</strong>의 결재 마감일이 3일 남았습니다.`,
    APPROVAL_DEADLINE_1: `<strong>${docName}</strong>의 결재 마감일이 1일 남았습니다.`,
    SHARED_DOCUMENT_REGISTERED: `<strong>${docName}</strong>이(가) 공유 문서함에 등록되었습니다.`,
    APPROVAL_COMPLETED: `<strong>${docName}</strong>의 결재가 완료되었습니다.`,
    SIGNATURE_COMPLETED: `<strong>${docName}</strong>의 서명이 완료되었습니다.`,
    DOCUMENT_STATUS_CHANGED: `<strong>${docName}</strong>의 상태가 변경되었습니다.`,
    APPROVAL_PENDING_3: `<strong>${docName}</strong>의 결재가 3일 전까지 완료되지 않았습니다.`,
    APPROVAL_PENDING_1: `<strong>${docName}</strong>의 결재가 1일 전까지 완료되지 않았습니다.`,
    ACCIDENT_FREE_CERT_UPLOADED: '무재해 사업장 인증 파일이 업로드되었습니다.',
    SUBSCRIPTION_CHANGED: '구독 서비스가 변경되었습니다.',
    SUBSCRIPTION_SERVICE_CHANGED: '구독 서비스가 변경되었습니다.',
    SUBSCRIPTION_BILLING_REMINDER: '구독 결제 예정 알림입니다.',
    SUBSCRIPTION_PAYMENT_SUCCESS: '구독 결제가 승인되었습니다.',
    SUBSCRIPTION_PAYMENT_FAILED: '구독 결제가 승인되지 않았습니다.',
  };

  return titleMap[notificationType] || `<strong>${docName}</strong>에 대한 알림이 있습니다.`;
}

/**
 * 알림 타입에 따른 카테고리 생성
 */
function generateNotificationCategory(notificationType: string): string {
  const categoryMap: Record<string, string> = {
    APPROVAL_REQUEST: '결재',
    SIGNATURE_REQUEST: '서명',
    DEADLINE_REMINDER: '마감일',
    APPROVAL_DEADLINE_15: '마감일',
    APPROVAL_DEADLINE_7: '마감일',
    APPROVAL_DEADLINE_3: '마감일',
    APPROVAL_DEADLINE_1: '마감일',
    SHARED_DOCUMENT_REGISTERED: '공유 문서',
    APPROVAL_COMPLETED: '결재',
    SIGNATURE_COMPLETED: '서명',
    DOCUMENT_STATUS_CHANGED: '문서',
    APPROVAL_PENDING_3: '결재',
    APPROVAL_PENDING_1: '결재',
    ACCIDENT_FREE_CERT_UPLOADED: '인증',
    SUBSCRIPTION_CHANGED: '서비스',
    SUBSCRIPTION_SERVICE_CHANGED: '서비스',
    SUBSCRIPTION_BILLING_REMINDER: '결제',
    SUBSCRIPTION_PAYMENT_SUCCESS: '결제',
    SUBSCRIPTION_PAYMENT_FAILED: '결제',
  };
  return categoryMap[notificationType] || '알림';
}

/**
 * API 응답을 UI 타입으로 변환
 */
function transformNotificationItem(item: NotificationHistoryItem): Notification {
  return {
    id: String(item.documentNotificationIdx),
    type: mapNotificationTypeToUIType(item.notificationType),
    title: generateNotificationTitle(item),
    category: generateNotificationCategory(item.notificationType),
    isUnRead: item.sentAt === null, // sentAt이 null이면 미읽음
    avatarUrl: null,
    createdAt: item.createAt,
    documentInfo: item.safetySystemDocumentInformation,
  };
}

/**
 * 알림 이력 조회 Hook
 */
export function useNotificationHistory(params?: GetNotificationHistoryParams) {
  return useQuery({
    queryKey: ['notificationHistory', params],
    queryFn: async () => {
      const response = await getNotificationHistory(params);
      // axios 인터셉터가 body.data를 평탄화하므로 최상위에 있음
      const notificationHistoryList = response.notificationHistoryList || [];
      const totalCount = response.totalCount || 0;

      // UI 타입으로 변환
      const notifications = notificationHistoryList.map(transformNotificationItem);

      return {
        notifications,
        totalCount,
        page: params?.page || 1,
        pageSize: params?.pageSize || 10,
      };
    },
    staleTime: 5 * 60 * 1000, // 5분
    refetchInterval: false, // 주기적 자동 갱신 비활성화
    refetchOnWindowFocus: true, // 창 포커스 시에만 갱신
  });
}

/**
 * 알림 읽음 처리 Hook
 */
export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => markNotificationAsRead(notificationId),
    onSuccess: () => {
      // 알림 목록 쿼리 무효화하여 다시 조회
      queryClient.invalidateQueries({ queryKey: ['notificationHistory'] });
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.header?.resultMessage ||
        error?.message ||
        '알림 읽음 처리에 실패했습니다.';
      toast.error(errorMessage);
    },
  });
}
