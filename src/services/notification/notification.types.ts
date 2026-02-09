// Notification API 타입 정의

import type { BaseResponseDto } from '../common';

// 푸시 알림 전송 요청 (백엔드 SendNotificationByMemberIndexesDto)
export type SendPushNotificationDto = {
  /** 멤버 인덱스들 (쉼표 구분 문자열, 예: "1,2,3") */
  memberIndexes: string;
  /** 알림 제목 */
  message: string;
  /** 클릭 시 이동할 링크 (선택) */
  link?: string;
};

// 알림 이력 조회 파라미터
export type GetNotificationHistoryParams = {
  page?: number;
  pageSize?: number;
  startDate?: string;
  endDate?: string;
};

// 알림 타입
export type NotificationType =
  | 'APPROVAL_REQUEST' // 결재 요청
  | 'SIGNATURE_REQUEST' // 서명 요청
  | 'DEADLINE_REMINDER' // 마감일 알림
  | 'APPROVAL_DEADLINE_15' // 결재 마감일 15일 전
  | 'APPROVAL_DEADLINE_7' // 결재 마감일 7일 전
  | 'APPROVAL_DEADLINE_3' // 결재 마감일 3일 전
  | 'APPROVAL_DEADLINE_1' // 결재 마감일 1일 전
  | 'SHARED_DOCUMENT_REGISTERED' // 공유 문서 등록
  | 'APPROVAL_COMPLETED' // 문서 결재 완료
  | 'SIGNATURE_COMPLETED' // 문서 서명 완료
  | 'DOCUMENT_STATUS_CHANGED' // 문서 상태 변경
  | 'APPROVAL_PENDING_3' // 결재 미완료 (3일 전)
  | 'APPROVAL_PENDING_1' // 결재 미완료 (1일 전)
  | 'ACCIDENT_FREE_CERT_UPLOADED' // 무재해 사업장 인증 파일 업로드
  | 'SUBSCRIPTION_CHANGED'; // 구독 서비스 변경

// 문서 정보
export type SafetySystemDocumentInformation = {
  safetySystemDocumentIdx: number;
  documentName: string;
  organizationName: string;
  approvalDeadline: string;
  isPublished: number;
};

// 알림 이력 항목 (API 응답)
export type NotificationHistoryItem = {
  documentNotificationIdx: number;
  notificationType: NotificationType;
  message?: string; // 알림 메시지 (백엔드에서 제공될 수 있음)
  notificationMessage?: string; // 다른 필드명 호환
  senderName?: string; // 완료/발송자 이름 등
  scheduledAt: string;
  sentAt: string | null;
  reminderDays: number | null;
  createAt: string;
  safetySystemDocumentInformation: SafetySystemDocumentInformation;
};

// 알림 이력 조회 응답 (실제 API 응답 구조)
// axios 인터셉터가 body.data를 평탄화하므로 최상위에 notificationHistoryList와 totalCount가 있음
export type NotificationHistoryResponseDto = {
  header: {
    isSuccess: boolean;
    resultCode: string;
    resultMessage: string;
    timestamp: string;
  };
  notificationHistoryList: NotificationHistoryItem[];
  totalCount: number;
};

// UI에서 사용하는 알림 타입 (변환 후)
export type Notification = {
  id: string; // documentNotificationIdx를 문자열로 변환
  type: string; // notificationType을 UI 타입으로 변환
  title: string; // 알림 제목 (생성)
  category: string; // 카테고리 (예: "문서", "결재" 등)
  isUnRead: boolean; // sentAt이 null이면 미읽음
  avatarUrl: string | null;
  createdAt: string | number | null; // createAt
  documentInfo?: SafetySystemDocumentInformation; // 문서 정보
};

// 알림 읽음 처리 응답
export type MarkNotificationReadResponseDto = BaseResponseDto<{
  success: boolean;
}>;
