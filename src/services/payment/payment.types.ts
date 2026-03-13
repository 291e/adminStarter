// 결제 관리 API 타입 정의

import type { BaseResponseDto } from '../common';

// ----------------------------------------------------------------------

// 빌링키 등록 요청
export type CreateBillingKeyParams = {
  PCD_PAYER_ID: string; // 빌링키
  memberBillingType: 'card' | 'transfer'; // 빌링타입
  memberBillingInfo: string; // 빌링 등록정보 (JSON 문자열)
};

// 빌링키 등록 응답
export type CreateBillingKeyResponse = BaseResponseDto;

// 빌링키 삭제 요청 (사용자)
export type DeleteBillingKeyResponse = BaseResponseDto;

// 빌링키 삭제 요청 (관리자)
export type DeleteBillingKeyForAdminParams = {
  companyIdx: number;
};

export type DeleteBillingKeyForAdminResponse = BaseResponseDto;

// 단건 결제 사전 요청
export type PaymentBeforeParams = {
  amount: number;
  orderName?: string;
  [key: string]: any;
};

export type PaymentBeforeResponse = BaseResponseDto<{
  PCD_PAY_OID: string; // 주문번호
  [key: string]: any;
}>;

// 단건 결제 승인 확정
export type PaymentAfterParams = {
  PCD_PAY_OID: string;
  [key: string]: any;
};

export type PaymentAfterResponse = BaseResponseDto;

// 결제 내역 조회 파라미터
export type GetPaymentHistoryParams = {
  filterPaymentStatus?: string; // 결제상태
  searchingDateKey: 'paymentRequestDate'; // 검색컬럼명
  searchingStartDate?: string; // 검색 시작일(YYYY-MM-DD)
  searchingEndDate?: string; // 검색 종료일(YYYY-MM-DD)
  searchingKey?: string; // 검색컬럼명
  searchingVal?: string; // 검색값
  sortBy?: string; // sorting 컬럼명
  sortOrder?: 'ASC' | 'DESC'; // sorting (기본: DESC)
  page: number; // page (기본: 1)
  pageSize: number; // rows per page (기본: 25)
  paymentPeriodMonths?: number; // 결제 주기(개월), 기본 1
};

// 결제 내역 항목
export type PaymentHistory = {
  paymentIdx: number;
  companySubscriptionIdx?: number;
  companyIdx: number;
  serviceSettingIdx?: number;
  serviceName: string;
  paymentAmount: number;
  paymentDate: Date | string; // ISO date string or Date
  paymentStatus: 'SUCCESS' | 'FAILED' | 'CANCELLED';
  paymentMethod: 'card' | 'transfer';
  failureReason: string | null;
  retryDate: Date | string | null; // ISO date string or Date
  createAt: Date | string; // ISO date string or Date
  // Payple 정보
  paypleReceipt: string | null; // 영수증 URL 또는 번호
  payplePaymentNumber: string | null; // 결제 번호
  payplePaymentDate: string | null; // 결제일
};

// 결제 내역 조회 응답
export type GetPaymentHistoryResponse = BaseResponseDto<{
  paymentList: PaymentHistory[];
  totalCount: number;
  page: number;
  pageSize: number;
}>;

// 결제 취소 요청 (관리자)
export type CancelPaymentParams = {
  paymentIdx: number;
  [key: string]: any;
};

export type CancelPaymentResponse = BaseResponseDto;

