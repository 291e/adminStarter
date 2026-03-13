import axiosInstance from 'src/lib/axios';

import { endpoints } from 'src/lib/axios';

import type {
  CreateBillingKeyParams,
  CreateBillingKeyResponse,
  DeleteBillingKeyResponse,
  DeleteBillingKeyForAdminParams,
  DeleteBillingKeyForAdminResponse,
  PaymentBeforeParams,
  PaymentBeforeResponse,
  PaymentAfterParams,
  PaymentAfterResponse,
  GetPaymentHistoryParams,
  GetPaymentHistoryResponse,
  CancelPaymentParams,
  CancelPaymentResponse,
} from './payment.types';

// ----------------------------------------------------------------------

/**
 * 빌링키 등록 (정액제 연동 없이 빌링키 기준 결제 연동)
 * POST /payment/billingKey
 */
export async function createBillingKey(
  params: CreateBillingKeyParams
): Promise<CreateBillingKeyResponse> {
  const response = await axiosInstance.post<CreateBillingKeyResponse>(
    endpoints.payment.billingKey,
    params
  );
  return response.data;
}

/**
 * 빌링키 삭제 (사용자)
 * DELETE /payment/billingKey
 */
export async function deleteBillingKey(): Promise<DeleteBillingKeyResponse> {
  const response = await axiosInstance.delete<DeleteBillingKeyResponse>(
    endpoints.payment.billingKey
  );
  return response.data;
}

/**
 * 빌링키 삭제 (관리자, body에 companyIdx)
 * DELETE /payment/billingKeyForAdmin
 */
export async function deleteBillingKeyForAdmin(
  params: DeleteBillingKeyForAdminParams
): Promise<DeleteBillingKeyForAdminResponse> {
  const response = await axiosInstance.delete<DeleteBillingKeyForAdminResponse>(
    endpoints.payment.billingKeyForAdmin,
    {
      data: params,
    }
  );
  return response.data;
}

/**
 * 단건 결제 사전 요청 (PCD_PAY_OID 발급, 선택적)
 * POST /payment/before
 */
export async function paymentBefore(
  params: PaymentBeforeParams
): Promise<PaymentBeforeResponse> {
  const response = await axiosInstance.post<PaymentBeforeResponse>(
    endpoints.payment.before,
    params
  );
  return response.data;
}

/**
 * 단건 결제 승인 확정 (선택적; 구독 자동결제에는 불필요)
 * POST /payment/after
 */
export async function paymentAfter(params: PaymentAfterParams): Promise<PaymentAfterResponse> {
  const response = await axiosInstance.post<PaymentAfterResponse>(
    endpoints.payment.after,
    params
  );
  return response.data;
}

/**
 * 결제 내역 조회 (일반은 자기 회사, 관리자는 전체)
 * GET /payment
 */
export async function getPaymentHistory(
  params: GetPaymentHistoryParams
): Promise<GetPaymentHistoryResponse> {
  const response = await axiosInstance.get<GetPaymentHistoryResponse>(
    endpoints.payment.base,
    {
      params,
    }
  );
  return response.data;
}

/**
 * 결제 취소 (관리자)
 * PUT /payment/:paymentIdx
 */
export async function cancelPayment(
  params: CancelPaymentParams
): Promise<CancelPaymentResponse> {
  const response = await axiosInstance.put<CancelPaymentResponse>(
    `${endpoints.payment.cancel}/${params.paymentIdx}`,
    params
  );
  return response.data;
}


