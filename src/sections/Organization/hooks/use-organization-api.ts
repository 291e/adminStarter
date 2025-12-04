import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import {
  getOrganizations,
  createOrganization,
  updateOrganization,
  deactivateOrganization,
  deleteOrganization,
  getOrganizationDetail,
  upgradeService,
  cancelSubscription,
  cardAction,
  getAccidentFree,
  updateAccidentFree,
  getCompanyMembers,
  inviteMember,
  getServicePlans,
  getCurrentSubscription,
  getRegisteredCards,
  registerCard,
  updateCard,
  deleteCard,
  subscribe,
  createBillingKey,
  getPaymentHistory,
} from 'src/services/organization/organization.service';
import type {
  GetOrganizationsParams,
  CreateOrganizationParams,
  UpdateOrganizationParams,
  GetOrganizationDetailParams,
  UpgradeServiceParams,
  CancelSubscriptionParams,
  CardActionParams,
  UpdateAccidentFreeParams,
  GetCompanyMembersParams,
  InviteMemberParams,
  SubscribeParams,
  RegisterCardParams,
  UpdateCardParams,
  CreateBillingKeyParams,
  GetPaymentHistoryParams,
} from 'src/services/organization/organization.types';

// ----------------------------------------------------------------------

/**
 * 조직 목록 조회 Hook
 */
export function useOrganizations(params: GetOrganizationsParams) {
  return useQuery({
    queryKey: ['organizations', params],
    queryFn: () => getOrganizations(params),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * 조직 상세 정보 조회 Hook
 */
export function useOrganizationDetail(params: GetOrganizationDetailParams) {
  return useQuery({
    queryKey: ['organizationDetail', params.companyIdx],
    queryFn: () => getOrganizationDetail(params),
    enabled: !!params.companyIdx,
  });
}

/**
 * 조직 등록 Mutation Hook
 */
export function useCreateOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: CreateOrganizationParams) => createOrganization(params),
    onSuccess: (response) => {
      // 성공 메시지 표시
      const resultMessage = response?.header?.resultMessage || '조직이 등록되었습니다.';
      if (resultMessage && resultMessage !== 'SUCCESS') {
        toast.success(resultMessage);
      } else {
        toast.success('조직이 등록되었습니다.');
      }
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
    },
    onError: (error: any) => {
      if (import.meta.env.DEV) {
        console.error('❌ [useCreateOrganization] 조직 등록 실패', {
          error,
          errorMessage: error?.message,
          errorResponse: error?.response?.data,
        });
      }
      // 에러 메시지 표시
      const resultMessage =
        error?.response?.data?.header?.resultMessage ||
        error?.message ||
        '조직 등록에 실패했습니다.';
      toast.error(resultMessage);
    },
  });
}

/**
 * 조직 수정 Mutation Hook
 */
export function useUpdateOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ companyIdx, ...params }: UpdateOrganizationParams & { companyIdx: number }) => {
      if (import.meta.env.DEV) {
        console.log('📤 [useUpdateOrganization] API 호출 시작', {
          companyIdx,
          params,
        });
      }
      return updateOrganization(companyIdx, params);
    },
    onSuccess: (response, variables) => {
      if (import.meta.env.DEV) {
        console.log('✅ [useUpdateOrganization] API 호출 성공', {
          response,
          variables,
        });
      }
      // 성공 메시지 표시
      const resultMessage = response?.header?.resultMessage || '조직 정보가 수정되었습니다.';
      if (resultMessage && resultMessage !== 'SUCCESS') {
        toast.success(resultMessage);
      } else {
        toast.success('조직 정보가 수정되었습니다.');
      }
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      queryClient.invalidateQueries({ queryKey: ['organizationDetail', variables.companyIdx] });
    },
    onError: (error: any, variables) => {
      if (import.meta.env.DEV) {
        console.error('❌ [useUpdateOrganization] API 호출 실패', {
          error,
          errorMessage: error?.message,
          errorResponse: error?.response?.data,
          variables,
        });
      }
      // 에러 메시지 표시
      const resultMessage =
        error?.response?.data?.header?.resultMessage ||
        error?.message ||
        '조직 수정에 실패했습니다.';
      toast.error(resultMessage);
    },
  });
}

/**
 * 조직 비활성화 Mutation Hook
 */
export function useDeactivateOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (companyIdx: number) => deactivateOrganization(companyIdx),
    onSuccess: (_, variables) => {
      // 성공 메시지 표시
      toast.success('조직이 비활성화되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      queryClient.invalidateQueries({ queryKey: ['organizationDetail', variables] });
    },
    onError: (error: any) => {
      if (import.meta.env.DEV) {
        console.error('❌ [useDeactivateOrganization] 조직 비활성화 실패', {
          error,
          errorMessage: error?.message,
          errorResponse: error?.response?.data,
        });
      }
      // 에러 메시지 표시
      const resultMessage =
        error?.response?.data?.header?.resultMessage ||
        error?.message ||
        '조직 비활성화에 실패했습니다.';
      toast.error(resultMessage);
    },
  });
}

/**
 * 조직 삭제 Mutation Hook
 */
export function useDeleteOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (companyIdx: number) => deleteOrganization(companyIdx),
    onSuccess: (_, variables) => {
      // 성공 메시지 표시
      toast.success('조직이 삭제되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      queryClient.invalidateQueries({ queryKey: ['organizationDetail', variables] });
    },
    onError: (error: any) => {
      if (import.meta.env.DEV) {
        console.error('❌ [useDeleteOrganization] 조직 삭제 실패', {
          error,
          errorMessage: error?.message,
          errorResponse: error?.response?.data,
        });
      }
      // 에러 메시지 표시
      const resultMessage =
        error?.response?.data?.header?.resultMessage ||
        error?.message ||
        '조직 삭제에 실패했습니다.';
      toast.error(resultMessage);
    },
  });
}

/**
 * 서비스 업그레이드 Mutation Hook
 */
export function useUpgradeService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ companyIdx, ...params }: UpgradeServiceParams & { companyIdx: number }) =>
      upgradeService(companyIdx, params),
    onSuccess: (response, variables) => {
      // 성공 메시지 표시
      const resultMessage = response?.header?.resultMessage || '서비스가 업그레이드되었습니다.';
      if (resultMessage && resultMessage !== 'SUCCESS') {
        toast.success(resultMessage);
      } else {
        toast.success('서비스가 업그레이드되었습니다.');
      }
      queryClient.invalidateQueries({ queryKey: ['organizationDetail', variables.companyIdx] });
    },
    onError: (error: any, variables) => {
      if (import.meta.env.DEV) {
        console.error('❌ [useUpgradeService] 서비스 업그레이드 실패', {
          error,
          errorMessage: error?.message,
          errorResponse: error?.response?.data,
          companyIdx: variables.companyIdx,
        });
      }
      // 에러 메시지 표시
      const resultMessage =
        error?.response?.data?.header?.resultMessage ||
        error?.message ||
        '서비스 업그레이드에 실패했습니다.';
      toast.error(resultMessage);
    },
  });
}

/**
 * 구독 취소 Mutation Hook
 */
export function useCancelService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: CancelSubscriptionParams) => cancelSubscription(params),
    onSuccess: async (_, variables) => {
      if (import.meta.env.DEV) {
        console.log('✅ [useCancelService] 구독 취소 성공', {
          companyIdx: variables.companyIdx,
          serviceSettingIdx: variables.serviceSettingIdx,
        });
      }
      // 성공 메시지 표시
      toast.success('구독이 취소되었습니다.');
      // 관련 쿼리 무효화 및 재조회
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['currentSubscription', variables.companyIdx] }),
        queryClient.invalidateQueries({ queryKey: ['subscriptions', variables.companyIdx] }),
        queryClient.invalidateQueries({ queryKey: ['organizationDetail', variables.companyIdx] }),
        queryClient.invalidateQueries({ queryKey: ['services'] }), // 서비스 목록도 갱신
        queryClient.invalidateQueries({ queryKey: ['paymentHistory', variables.companyIdx] }), // 결제 내역 갱신
      ]);
      // 쿼리 재조회
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ['currentSubscription', variables.companyIdx] }),
        queryClient.refetchQueries({ queryKey: ['subscriptions', variables.companyIdx] }),
        queryClient.refetchQueries({ queryKey: ['organizationDetail', variables.companyIdx] }),
        queryClient.refetchQueries({ queryKey: ['services'] }),
      ]);
    },
    onError: (error: any, variables) => {
      if (import.meta.env.DEV) {
        console.error('❌ [useCancelService] 구독 취소 실패', {
          error,
          errorMessage: error?.message,
          errorResponse: error?.response?.data,
          companyIdx: variables.companyIdx,
          serviceSettingIdx: variables.serviceSettingIdx,
        });
      }
      // 에러 메시지 표시
      const resultMessage =
        error?.response?.data?.header?.resultMessage ||
        error?.message ||
        '구독 취소에 실패했습니다.';
      toast.error(resultMessage);
    },
  });
}

/**
 * 카드 액션 Mutation Hook
 */
export function useCardAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ companyIdx, ...params }: CardActionParams & { companyIdx: number }) =>
      cardAction(companyIdx, params),
    onSuccess: (response, variables) => {
      // 성공 메시지 표시
      const resultMessage = response?.header?.resultMessage || '카드 액션이 완료되었습니다.';
      if (resultMessage && resultMessage !== 'SUCCESS') {
        toast.success(resultMessage);
      } else {
        toast.success('카드 액션이 완료되었습니다.');
      }
      queryClient.invalidateQueries({ queryKey: ['organizationDetail', variables.companyIdx] });
    },
    onError: (error: any, variables) => {
      if (import.meta.env.DEV) {
        console.error('❌ [useCardAction] 카드 액션 실패', {
          error,
          errorMessage: error?.message,
          errorResponse: error?.response?.data,
          companyIdx: variables.companyIdx,
        });
      }
      // 에러 메시지 표시
      const resultMessage =
        error?.response?.data?.header?.resultMessage ||
        error?.message ||
        '카드 액션에 실패했습니다.';
      toast.error(resultMessage);
    },
  });
}

/**
 * 무재해 인증 정보 조회 Hook
 */
export function useAccidentFree(companyIdx: number) {
  return useQuery({
    queryKey: ['accidentFree', companyIdx],
    queryFn: () => getAccidentFree(companyIdx),
    enabled: !!companyIdx,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * 무재해 인증 정보 수정 Mutation Hook
 */
export function useUpdateAccidentFree() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ companyIdx, ...params }: UpdateAccidentFreeParams & { companyIdx: number }) =>
      updateAccidentFree(companyIdx, params),
    onSuccess: (_, variables) => {
      // 성공 메시지 표시
      toast.success('무재해 인증 정보가 수정되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      queryClient.invalidateQueries({ queryKey: ['organizationDetail', variables.companyIdx] });
      queryClient.invalidateQueries({ queryKey: ['accidentFree', variables.companyIdx] });
    },
    onError: (error: any, variables) => {
      if (import.meta.env.DEV) {
        console.error('❌ [useUpdateAccidentFree] 무재해 인증 정보 수정 실패', {
          error,
          errorMessage: error?.message,
          errorResponse: error?.response?.data,
          companyIdx: variables.companyIdx,
        });
      }
      // 에러 메시지 표시
      const resultMessage =
        error?.response?.data?.header?.resultMessage ||
        error?.message ||
        '무재해 인증 정보 수정에 실패했습니다.';
      toast.error(resultMessage);
    },
  });
}

/**
 * 회사/지점별 역할별 멤버 조회 Hook
 */
export function useCompanyMembers(companyIdx: number, params?: GetCompanyMembersParams) {
  return useQuery({
    queryKey: ['companyMembers', companyIdx, params],
    queryFn: () => getCompanyMembers(companyIdx, params),
    enabled: !!companyIdx,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * 조직원 초대 Mutation Hook
 */
export function useInviteMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ companyIdx, ...params }: InviteMemberParams & { companyIdx: number }) =>
      inviteMember(companyIdx, params),
    onSuccess: (response, variables) => {
      // 성공 메시지 표시
      const resultMessage = response?.header?.resultMessage || '조직원 초대가 완료되었습니다.';
      if (resultMessage && resultMessage !== 'SUCCESS') {
        toast.success(resultMessage);
      } else {
        toast.success('조직원 초대가 완료되었습니다.');
      }
      queryClient.invalidateQueries({ queryKey: ['companyMembers', variables.companyIdx] });
      queryClient.invalidateQueries({ queryKey: ['organizationDetail', variables.companyIdx] });
    },
    onError: (error: any, variables) => {
      if (import.meta.env.DEV) {
        console.error('❌ [useInviteMember] 조직원 초대 실패', {
          error,
          errorMessage: error?.message,
          errorResponse: error?.response?.data,
          companyIdx: variables.companyIdx,
        });
      }
      // 에러 메시지 표시
      const resultMessage =
        error?.response?.data?.header?.resultMessage ||
        error?.message ||
        '조직원 초대에 실패했습니다.';
      toast.error(resultMessage);
    },
  });
}

/**
 * 서비스 플랜 목록 조회 Hook
 */
export function useServicePlans(companyIdx: number) {
  return useQuery({
    queryKey: ['servicePlans', companyIdx],
    queryFn: () => getServicePlans(companyIdx),
    enabled: !!companyIdx,
    staleTime: 10 * 60 * 1000, // 10분
  });
}

/**
 * 현재 구독 정보 조회 Hook
 */
export function useCurrentSubscription(companyIdx: number) {
  return useQuery({
    queryKey: ['currentSubscription', companyIdx],
    queryFn: () => getCurrentSubscription(companyIdx),
    enabled: !!companyIdx,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * 등록된 카드 목록 조회 Hook
 */
export function useRegisteredCards(companyIdx: number) {
  return useQuery({
    queryKey: ['registeredCards', companyIdx],
    queryFn: () => getRegisteredCards(companyIdx),
    enabled: !!companyIdx,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * 서비스 구독 Mutation Hook
 */
export function useSubscribe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: SubscribeParams) => subscribe(params),
    onSuccess: (response, variables) => {
      if (import.meta.env.DEV) {
        console.log('✅ [useSubscribe] 구독 성공', {
          companyIdx: variables.companyIdx,
          serviceSettingIdx: variables.serviceSettingIdx,
        });
      }
      // 성공 메시지 표시
      const resultMessage = response?.header?.resultMessage || '구독이 완료되었습니다.';
      if (resultMessage && resultMessage !== 'SUCCESS') {
        toast.success(resultMessage);
      } else {
        toast.success('구독이 완료되었습니다.');
      }
      queryClient.invalidateQueries({ queryKey: ['currentSubscription', variables.companyIdx] });
      queryClient.invalidateQueries({ queryKey: ['subscriptions', variables.companyIdx] });
      queryClient.invalidateQueries({ queryKey: ['organizationDetail', variables.companyIdx] });
      queryClient.invalidateQueries({ queryKey: ['services'] }); // 서비스 목록도 갱신
      queryClient.invalidateQueries({ queryKey: ['paymentHistory', variables.companyIdx] }); // 결제 내역 갱신
    },
    onError: (error: any, variables) => {
      if (import.meta.env.DEV) {
        console.error('❌ [useSubscribe] 구독 실패', {
          error,
          errorMessage: error?.message,
          errorResponse: error?.response?.data,
          companyIdx: variables.companyIdx,
          serviceSettingIdx: variables.serviceSettingIdx,
        });
      }
      // 에러 메시지 표시
      const resultMessage =
        error?.response?.data?.header?.resultMessage || error?.message || '구독에 실패했습니다.';
      toast.error(resultMessage);
    },
  });
}

/**
 * 카드 등록 Mutation Hook
 */
export function useRegisterCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ companyIdx, ...params }: RegisterCardParams & { companyIdx: number }) =>
      registerCard(companyIdx, params),
    onSuccess: (response, variables) => {
      if (import.meta.env.DEV) {
        console.log('✅ [useRegisterCard] 카드 등록 성공', {
          companyIdx: variables.companyIdx,
          params: variables,
        });
      }
      // 성공 메시지 표시
      const resultMessage = response?.header?.resultMessage || '카드가 등록되었습니다.';
      if (resultMessage && resultMessage !== 'SUCCESS') {
        toast.success(resultMessage);
      } else {
        toast.success('카드가 등록되었습니다.');
      }
      queryClient.invalidateQueries({ queryKey: ['registeredCards', variables.companyIdx] });
      queryClient.invalidateQueries({ queryKey: ['organizationDetail', variables.companyIdx] });
    },
    onError: (error: any, variables) => {
      if (import.meta.env.DEV) {
        console.error('❌ [useRegisterCard] 카드 등록 실패', {
          error,
          errorMessage: error?.message,
          errorResponse: error?.response?.data,
          companyIdx: variables.companyIdx,
        });
      }
      // 에러 메시지 표시
      const resultMessage =
        error?.response?.data?.header?.resultMessage ||
        error?.message ||
        '카드 등록에 실패했습니다.';
      toast.error(resultMessage);
    },
  });
}

/**
 * 카드 수정 Mutation Hook (대표 카드 설정)
 */
export function useUpdateCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      companyIdx,
      companyCardIdx,
      ...params
    }: UpdateCardParams & { companyIdx: number; companyCardIdx: number }) =>
      updateCard(companyIdx, companyCardIdx, params),
    onSuccess: (response, variables) => {
      if (import.meta.env.DEV) {
        console.log('✅ [useUpdateCard] 카드 수정 성공', {
          companyIdx: variables.companyIdx,
          companyCardIdx: variables.companyCardIdx,
        });
      }
      // 성공 메시지 표시
      const resultMessage = response?.header?.resultMessage || '카드 정보가 수정되었습니다.';
      if (resultMessage && resultMessage !== 'SUCCESS') {
        toast.success(resultMessage);
      } else {
        toast.success('카드 정보가 수정되었습니다.');
      }
      queryClient.invalidateQueries({ queryKey: ['registeredCards', variables.companyIdx] });
      queryClient.invalidateQueries({ queryKey: ['organizationDetail', variables.companyIdx] });
    },
    onError: (error: any, variables) => {
      if (import.meta.env.DEV) {
        console.error('❌ [useUpdateCard] 카드 수정 실패', {
          error,
          errorMessage: error?.message,
          errorResponse: error?.response?.data,
          companyIdx: variables.companyIdx,
          companyCardIdx: variables.companyCardIdx,
        });
      }
      // 에러 메시지 표시
      const resultMessage =
        error?.response?.data?.header?.resultMessage ||
        error?.message ||
        '카드 수정에 실패했습니다.';
      toast.error(resultMessage);
    },
  });
}

/**
 * 카드 삭제 Mutation Hook
 */
export function useDeleteCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ companyIdx, companyCardIdx }: { companyIdx: number; companyCardIdx: number }) =>
      deleteCard(companyIdx, companyCardIdx),
    onSuccess: (_, variables) => {
      if (import.meta.env.DEV) {
        console.log('✅ [useDeleteCard] 카드 삭제 성공', {
          companyIdx: variables.companyIdx,
          companyCardIdx: variables.companyCardIdx,
        });
      }
      // 성공 메시지 표시
      toast.success('카드가 삭제되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['registeredCards', variables.companyIdx] });
      queryClient.invalidateQueries({ queryKey: ['organizationDetail', variables.companyIdx] });
    },
    onError: (error: any, variables) => {
      if (import.meta.env.DEV) {
        console.error('❌ [useDeleteCard] 카드 삭제 실패', {
          error,
          errorMessage: error?.message,
          errorResponse: error?.response?.data,
          companyIdx: variables.companyIdx,
          companyCardIdx: variables.companyCardIdx,
        });
      }
      // 에러 메시지 표시
      const resultMessage =
        error?.response?.data?.header?.resultMessage ||
        error?.message ||
        '카드 삭제에 실패했습니다.';
      toast.error(resultMessage);
    },
  });
}

/**
 * 빌링키 등록 Mutation Hook (회사 단위)
 */
export function useCreateBillingKey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: CreateBillingKeyParams) => createBillingKey(params),
    onSuccess: (response) => {
      // 성공 메시지 표시
      const resultMessage = response?.header?.resultMessage || '빌링키가 등록되었습니다.';
      if (resultMessage && resultMessage !== 'SUCCESS') {
        toast.success(resultMessage);
      } else {
        toast.success('빌링키가 등록되었습니다.');
      }
      // 빌링키 등록 후 관련 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
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
 * 결제 내역 조회 Hook
 */
export function usePaymentHistory(params: GetPaymentHistoryParams) {
  return useQuery({
    queryKey: ['paymentHistory', params.companyIdx, params.page, params.pageSize],
    queryFn: () => getPaymentHistory(params),
    enabled: !!params.companyIdx,
    staleTime: 5 * 60 * 1000,
  });
}
