import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import {
  createBillingKey,
  deleteBillingKey,
  deleteBillingKeyForAdmin,
  paymentBefore,
  paymentAfter,
  getPaymentHistory,
  cancelPayment,
} from 'src/services/payment/payment.service';
import type {
  CreateBillingKeyParams,
  DeleteBillingKeyForAdminParams,
  PaymentBeforeParams,
  PaymentAfterParams,
  GetPaymentHistoryParams,
  CancelPaymentParams,
} from 'src/services/payment/payment.types';

// ----------------------------------------------------------------------

/**
 * 빌링키 등록 + 구독 생성 Mutation Hook
 */
export function useCreateBillingKey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: CreateBillingKeyParams) => createBillingKey(params),
    onSuccess: (response) => {
      // 성공 메시지 표시
      const resultMessage =
        response?.header?.resultMessage || '빌링키가 등록되고 결제 정보가 반영되었습니다.';
      if (resultMessage && resultMessage !== 'SUCCESS') {
        toast.success(resultMessage);
      } else {
        toast.success('빌링키가 등록되고 결제 정보가 반영되었습니다.');
      }
      // 빌링키 등록 후 관련 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: ['paymentHistory'] });
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      queryClient.invalidateQueries({ queryKey: ['organizationDetail'] });
      queryClient.invalidateQueries({ queryKey: ['currentSubscription'] });
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
    onError: (error: any) => {
      if (import.meta.env.DEV) {
        console.error('❌ [useCreateBillingKey] 빌링키 등록 실패', {
          error,
          errorMessage: error?.message,
          errorResponse: error?.response?.data,
        });
      }
      // 에러 메시지 표시
      const resultMessage =
        error?.response?.data?.header?.resultMessage ||
        error?.message ||
        '빌링키 등록에 실패했습니다.';
      toast.error(resultMessage);
    },
  });
}

/**
 * 빌링키 삭제 Mutation Hook (사용자)
 */
export function useDeleteBillingKey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => deleteBillingKey(),
    onSuccess: () => {
      toast.success('빌링키가 삭제되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['paymentHistory'] });
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      queryClient.invalidateQueries({ queryKey: ['organizationDetail'] });
      queryClient.invalidateQueries({ queryKey: ['currentSubscription'] });
    },
    onError: (error: any) => {
      if (import.meta.env.DEV) {
        console.error('❌ [useDeleteBillingKey] 빌링키 삭제 실패', {
          error,
          errorMessage: error?.message,
          errorResponse: error?.response?.data,
        });
      }
      const resultMessage =
        error?.response?.data?.header?.resultMessage ||
        error?.message ||
        '빌링키 삭제에 실패했습니다.';
      toast.error(resultMessage);
    },
  });
}

/**
 * 빌링키 삭제 Mutation Hook (관리자)
 */
export function useDeleteBillingKeyForAdmin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: DeleteBillingKeyForAdminParams) => deleteBillingKeyForAdmin(params),
    onSuccess: () => {
      toast.success('빌링키가 삭제되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['paymentHistory'] });
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      queryClient.invalidateQueries({ queryKey: ['organizationDetail'] });
      queryClient.invalidateQueries({ queryKey: ['currentSubscription'] });
    },
    onError: (error: any) => {
      if (import.meta.env.DEV) {
        console.error('❌ [useDeleteBillingKeyForAdmin] 빌링키 삭제 실패', {
          error,
          errorMessage: error?.message,
          errorResponse: error?.response?.data,
        });
      }
      const resultMessage =
        error?.response?.data?.header?.resultMessage ||
        error?.message ||
        '빌링키 삭제에 실패했습니다.';
      toast.error(resultMessage);
    },
  });
}

/**
 * 단건 결제 사전 요청 Mutation Hook
 */
export function usePaymentBefore() {
  return useMutation({
    mutationFn: (params: PaymentBeforeParams) => paymentBefore(params),
    onError: (error: any) => {
      if (import.meta.env.DEV) {
        console.error('❌ [usePaymentBefore] 결제 사전 요청 실패', {
          error,
          errorMessage: error?.message,
          errorResponse: error?.response?.data,
        });
      }
      const resultMessage =
        error?.response?.data?.header?.resultMessage ||
        error?.message ||
        '결제 사전 요청에 실패했습니다.';
      toast.error(resultMessage);
    },
  });
}

/**
 * 단건 결제 승인 확정 Mutation Hook
 */
export function usePaymentAfter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: PaymentAfterParams) => paymentAfter(params),
    onSuccess: () => {
      toast.success('결제가 완료되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['paymentHistory'] });
    },
    onError: (error: any) => {
      if (import.meta.env.DEV) {
        console.error('❌ [usePaymentAfter] 결제 승인 확정 실패', {
          error,
          errorMessage: error?.message,
          errorResponse: error?.response?.data,
        });
      }
      const resultMessage =
        error?.response?.data?.header?.resultMessage ||
        error?.message ||
        '결제 승인 확정에 실패했습니다.';
      toast.error(resultMessage);
    },
  });
}

/**
 * 결제 내역 조회 Hook
 */
export function usePaymentHistory(params: GetPaymentHistoryParams) {
  return useQuery({
    queryKey: ['paymentHistory', params],
    queryFn: () => getPaymentHistory(params),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * 결제 취소 Mutation Hook (관리자)
 */
export function useCancelPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: CancelPaymentParams) => cancelPayment(params),
    onSuccess: () => {
      toast.success('결제가 취소되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['paymentHistory'] });
    },
    onError: (error: any) => {
      if (import.meta.env.DEV) {
        console.error('❌ [useCancelPayment] 결제 취소 실패', {
          error,
          errorMessage: error?.message,
          errorResponse: error?.response?.data,
        });
      }
      const resultMessage =
        error?.response?.data?.header?.resultMessage ||
        error?.message ||
        '결제 취소에 실패했습니다.';
      toast.error(resultMessage);
    },
  });
}
