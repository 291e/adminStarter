import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';

import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useParams } from 'react-router';

import { Iconify } from 'src/components/iconify';
import { CONFIG } from 'src/global-config';
import {
  useRegisteredCards,
  useSubscribe,
  useCancelService,
  usePaymentHistory,
  useCreateBillingKey,
  useRegisterCard,
  useUpdateCard,
  useDeleteCard,
} from '../../hooks/use-organization-api';
import { useServices } from 'src/sections/ServiceSetting/hooks/use-service-setting-api';
import type { RegisteredCard as ApiRegisteredCard } from 'src/services/organization/organization.types';
import type { ServiceSetting } from 'src/services/service-setting/service-setting.types';
import { PaypleSdkLoader } from './payple/PaypleSdkLoader';
import { usePaypleCardRegister } from './payple/usePaypleCardRegister';
import { ServicePlanCard } from './ServicePlanCard';
import { RegisteredCard } from './RegisteredCard';
import { PaymentInfo } from './PaymentInfo';
import PaymentHistoryTable, { type PaymentHistoryItem } from './PaymentHistoryTable';
import PaymentHistoryPagination from './PaymentHistoryPagination';
import type { PaypleCallbackParams } from './payple/types';

// ----------------------------------------------------------------------

type Props = {
  organizationId?: string;
};

export default function SubscriptionService({ organizationId }: Props) {
  const { id } = useParams<{ id: string }>();
  const companyIdx = organizationId ? parseInt(organizationId, 10) : id ? parseInt(id, 10) : 0;

  const [selectedServiceSettingIdx, setSelectedServiceSettingIdx] = useState<number | null>(null);
  const [cardMenuAnchor, setCardMenuAnchor] = useState<{
    [key: number]: HTMLElement | null;
  }>({});
  const [paymentHistoryPage, setPaymentHistoryPage] = useState(0);
  const [paymentHistoryRowsPerPage, setPaymentHistoryRowsPerPage] = useState(5);

  // API 호출
  // 서비스 목록 조회 (구독할 서비스들)
  const {
    data: servicesData,
    isLoading: isLoadingServices,
    isError: isErrorServices,
  } = useServices({
    page: 1,
    pageSize: 100, // 모든 서비스 가져오기
    status: 'ACTIVE', // 활성화된 서비스만
  });

  const {
    data: registeredCardsData,
    isLoading: isLoadingCards,
    isError: isErrorCards,
  } = useRegisteredCards(companyIdx);

  // 결제 내역 조회
  const {
    data: paymentHistoryData,
    isLoading: isLoadingPaymentHistory,
    isError: isErrorPaymentHistory,
  } = usePaymentHistory({
    companyIdx,
    page: paymentHistoryPage + 1, // API는 1부터 시작
    pageSize: paymentHistoryRowsPerPage,
  });

  // Mutations
  const subscribeMutation = useSubscribe();
  const cancelServiceMutation = useCancelService();
  const registerCardMutation = useRegisterCard();
  const updateCardMutation = useUpdateCard();
  const deleteCardMutation = useDeleteCard();

  // API 응답 데이터 추출 (axios interceptor가 평탄화하므로 직접 접근)
  const servicesInfo = servicesData as any;
  const registeredCardsInfo = registeredCardsData as any;

  // 서비스 설정 목록을 ServicePlan 형태로 변환
  type Plan = {
    serviceSettingIdx: number;
    planName: string;
    price: number;
    icon: string;
    isSubscribed: boolean;
    serviceSetting: ServiceSetting; // 원본 서비스 설정 정보 보관
  };

  const plans: Plan[] = useMemo(() => {
    const serviceSettingList: ServiceSetting[] = servicesInfo?.serviceSettingList || [];
    return serviceSettingList
      .filter((service) => service.serviceSettingIdx != null) // serviceSettingIdx가 있는 것만 필터링
      .map((service) => {
        // 현재 조직이 구독 중인지 확인 (subscribedCompanies에 companyIdx가 있는지 확인)
        const subscribedCompany = service.subscribedCompanies.find(
          (company) => company.companyIdx === companyIdx
        );
        const isSubscribed = subscribedCompany?.subscriptionStatus === 'ACTIVE';

        return {
          serviceSettingIdx: service.serviceSettingIdx!,
          planName: service.serviceName,
          price:
            typeof service.monthlyFee === 'string'
              ? parseFloat(service.monthlyFee) || 0
              : service.monthlyFee || 0,
          icon: 'solar:card-bold', // 기본 아이콘 (필요시 서비스별로 매핑)
          isSubscribed,
          serviceSetting: service, // 원본 정보 보관
        };
      });
  }, [servicesInfo, companyIdx]);

  // 현재 구독 중인 서비스 찾기
  const currentSubscription = useMemo(
    () => plans.find((plan) => plan.isSubscribed)?.serviceSetting || null,
    [plans]
  );

  // 결제 정보 (서비스 목록에서 가져오기)
  const paymentInfo = useMemo(() => {
    if (!currentSubscription) {
      return {
        serviceName: '',
        payer: '',
        billingAddress: '',
        billingContact: '',
        paymentMethod: '',
      };
    }

    const subscribedCompany = currentSubscription.subscribedCompanies.find(
      (company) => company.companyIdx === companyIdx
    );

    return {
      serviceName: currentSubscription.serviceName,
      payer: subscribedCompany?.companyName || '',
      billingAddress: '', // 서비스 목록 API에 없음
      billingContact: '', // 서비스 목록 API에 없음
      paymentMethod: '', // 서비스 목록 API에 없음
    };
  }, [currentSubscription, companyIdx]);

  // 등록된 카드 목록
  const registeredCards: ApiRegisteredCard[] = useMemo(
    () => registeredCardsInfo?.cardList || [],
    [registeredCardsInfo]
  );

  // 디버깅
  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('🔍 [SubscriptionService] 구독 서비스 정보', {
        companyIdx,
        servicesData,
        servicesInfo,
        plans,
        currentSubscription,
        paymentInfo,
        registeredCardsData,
        registeredCardsInfo,
        registeredCards,
        isLoadingServices,
        isLoadingCards,
        isErrorServices,
        isErrorCards,
      });
    }
  }, [
    companyIdx,
    servicesData,
    servicesInfo,
    plans,
    currentSubscription,
    paymentInfo,
    registeredCardsData,
    registeredCardsInfo,
    registeredCards,
    isLoadingServices,
    isLoadingCards,
    isErrorServices,
    isErrorCards,
  ]);

  // 빌링키 등록 Mutation
  const createBillingKeyMutation = useCreateBillingKey();

  // 페이플 카드 등록 콜백
  const handlePaypleSuccess = useCallback(
    async (params: PaypleCallbackParams) => {
      // Payple 문서에 따르면 빌링키는 PCD_PAYER_ID입니다
      const billingKey = params.PCD_PAYER_ID || '';
      const cardName = params.PCD_PAY_CARDNAME || '';
      const cardNo = params.PCD_PAY_CARDNUM || '';
      const isAlreadyAuthenticated = params.PCD_PAY_MSG?.includes('기 인증고객');
      const isCardAuthCompleted = params.PCD_PAY_MSG?.includes('카드인증완료');

      // 카드 정보가 있는 경우에만 처리
      if (!cardName && !cardNo && !billingKey) {
        throw new Error('카드 정보를 받지 못했습니다.');
      }

      try {
        // 1. 빌링키 등록 (회사 단위) - POST /companies/billing-key
        // 빌링키가 있는 경우에만 등록 시도
        if (billingKey) {
          try {
            await createBillingKeyMutation.mutateAsync({
              PCD_PAYER_ID: billingKey,
              memberBillingType: 'card',
              memberBillingInfo: JSON.stringify({
                cardName,
                cardNo,
                orderNo: params.PCD_PAY_OID || '',
                amount: params.PCD_PAY_TOTAL || '0',
              }),
            });

            if (import.meta.env.DEV) {
              console.log('✅ [빌링키 등록 성공]', { billingKey });
            }
          } catch (error: any) {
            // 이미 등록된 빌링키인 경우 에러가 발생할 수 있지만,
            // "기 인증고객 입니다." 또는 "카드인증완료" 메시지가 있으면 계속 진행
            if (isAlreadyAuthenticated || isCardAuthCompleted) {
              if (import.meta.env.DEV) {
                console.log('⚠️ [빌링키 등록 스킵 - 이미 등록됨]', {
                  billingKey,
                  errorMessage: error?.message,
                });
              }
            } else {
              throw error;
            }
          }
        }

        // 2. 카드 등록 (등록된 카드 목록에 추가) - POST /companies/{companyIdx}/cards
        // 카드 정보가 있으면 등록된 카드 목록에 추가
        if (cardName && cardNo) {
          try {
            await registerCardMutation.mutateAsync({
              companyIdx,
              billingKey: billingKey || undefined, // 빌링키가 없으면 undefined
              cardName,
              cardNo,
              orderNo: params.PCD_PAY_OID || undefined,
              amount: params.PCD_PAY_TOTAL || undefined,
              isCardAuthCompleted: isCardAuthCompleted ? 1 : 0,
              isAlreadyAuthenticated: isAlreadyAuthenticated ? 1 : 0,
              resultMsg: params.PCD_PAY_MSG || undefined,
            });

            if (import.meta.env.DEV) {
              console.log('✅ [카드 등록 성공]', { cardName, cardNo });
            }
          } catch (error: any) {
            if (import.meta.env.DEV) {
              console.error('❌ [카드 등록 실패]', {
                error,
                errorMessage: error?.message,
                errorResponse: error?.response?.data,
              });
            }
            // 카드 등록 실패는 에러로 처리하지 않고 경고만 (빌링키는 이미 등록됨)
          }
        }
      } catch (error: any) {
        if (import.meta.env.DEV) {
          console.error('❌ [카드/빌링키 등록 실패]', {
            error,
            errorMessage: error?.message,
            errorResponse: error?.response?.data,
          });
        }
        throw error;
      }
    },
    [companyIdx, createBillingKeyMutation, registerCardMutation]
  );

  // 페이플 카드 등록 훅
  const { handleAddCard } = usePaypleCardRegister({
    companyIdx,
    clientKey: CONFIG.payple.clientKey,
    onSuccess: handlePaypleSuccess,
  });

  // 플랜이 구독 중인지 확인하는 함수 (plans 배열에서 직접 확인)
  const isPlanSubscribed = useCallback(
    (serviceSettingIdx: number) => {
      const plan = plans.find((p) => p.serviceSettingIdx === serviceSettingIdx);
      return plan?.isSubscribed || false;
    },
    [plans]
  );

  const handleCardMenuOpen = useCallback(
    (event: React.MouseEvent<HTMLElement>, companyCardIdx: number) => {
      setCardMenuAnchor((prev) => ({ ...prev, [companyCardIdx]: event.currentTarget }));
    },
    []
  );

  const handleCardMenuClose = useCallback((companyCardIdx: number) => {
    setCardMenuAnchor((prev) => ({ ...prev, [companyCardIdx]: null }));
  }, []);

  const getCardIcon = useCallback((type: string) => {
    switch (type) {
      case 'visa':
        return 'logos:visa';
      case 'mastercard':
        return 'logos:mastercard';
      case 'amex':
        return 'logos:american-express';
      default:
        return 'solar:card-bold';
    }
  }, []);

  const formatPrice = useCallback(
    (price: number) => String(price).replace(/\B(?=(\d{3})+(?!\d))/g, ','),
    []
  );

  // 결제 내역 데이터 변환
  const paymentHistory: PaymentHistoryItem[] = useMemo(() => {
    const paymentHistoryInfo = paymentHistoryData as any;
    const paymentList = paymentHistoryInfo?.paymentList || [];
    const totalCount = paymentHistoryInfo?.totalCount || 0;

    return paymentList.map((payment: any, index: number) => {
      // 상태 매핑: SUCCESS -> COMPLETED, FAILED/CANCELLED -> CANCELLED, 그 외 -> PENDING
      let status: PaymentHistoryItem['status'] = 'PENDING';
      if (payment.paymentStatus === 'SUCCESS') {
        status = 'COMPLETED';
      } else if (payment.paymentStatus === 'FAILED' || payment.paymentStatus === 'CANCELLED') {
        status = 'CANCELLED';
      }

      // 결제수단 매핑
      let paymentMethod = '미등록';
      if (payment.paymentMethod === 'card') {
        paymentMethod = '카드';
      } else if (payment.paymentMethod === 'transfer') {
        paymentMethod = '계좌이체';
      }

      // 결제일: payplePaymentDate 우선, 없으면 paymentDate, 없으면 createAt 사용
      const finalPaymentDate = payment.payplePaymentDate || payment.paymentDate || payment.createAt;

      // 결제 번호: payplePaymentNumber 우선, 없으면 paymentIdx 사용
      const finalPaymentNumber = payment.payplePaymentNumber || String(payment.paymentIdx);

      return {
        id: payment.paymentIdx,
        order: totalCount
          ? totalCount - (paymentHistoryPage * paymentHistoryRowsPerPage + index)
          : index + 1,
        paymentDate: finalPaymentDate,
        paymentNumber: finalPaymentNumber,
        serviceName: payment.serviceName,
        amount: payment.paymentAmount || 0,
        paymentMethod,
        status,
        receiptUrl: payment.paypleReceipt || undefined, // Payple 영수증 URL
      };
    });
  }, [paymentHistoryData, paymentHistoryPage, paymentHistoryRowsPerPage]);

  const handleViewReceipt = useCallback((row: PaymentHistoryItem) => {
    if (row.receiptUrl) {
      window.open(row.receiptUrl, '_blank');
    }
  }, []);

  // 플랜 클릭 핸들러 (카드 선택만)
  const handlePlanClick = useCallback(
    (plan: Plan) => {
      setSelectedServiceSettingIdx(plan.serviceSettingIdx);
      if (import.meta.env.DEV) {
        console.log('🔍 [플랜 선택]', {
          serviceSettingIdx: plan.serviceSettingIdx,
          planName: plan.planName,
          isSubscribed: isPlanSubscribed(plan.serviceSettingIdx),
        });
      }
    },
    [isPlanSubscribed]
  );

  const handleCardAction = async (companyCardIdx: number, action: string) => {
    if (import.meta.env.DEV) {
      console.log('🔍 [SubscriptionService] 카드 액션', {
        companyCardIdx,
        action,
        companyIdx,
      });
    }

    try {
      if (action === 'setPrimary') {
        // 대표 카드 설정 - PATCH /companies/{companyIdx}/cards/{companyCardIdx}
        await updateCardMutation.mutateAsync({
          companyIdx,
          companyCardIdx,
          isDefaultCard: 1,
        });
        if (import.meta.env.DEV) {
          console.log('✅ [대표 카드 설정 성공]', { companyCardIdx });
        }
      } else if (action === 'delete') {
        // 카드 삭제 - DELETE /companies/{companyIdx}/cards/{companyCardIdx}
        await deleteCardMutation.mutateAsync({
          companyIdx,
          companyCardIdx,
        });
        if (import.meta.env.DEV) {
          console.log('✅ [카드 삭제 성공]', { companyCardIdx });
        }
      } else if (action === 'edit') {
        // TODO: 카드 수정 모달 열기
        if (import.meta.env.DEV) {
          console.log('📝 [카드 수정]', companyCardIdx);
        }
      }
    } catch (error: any) {
      if (import.meta.env.DEV) {
        console.error('❌ [카드 액션 실패]', {
          error,
          errorMessage: error?.message,
          errorResponse: error?.response?.data,
          companyCardIdx,
          action,
        });
      }
    }

    handleCardMenuClose(companyCardIdx);
  };

  // 로딩 상태
  if (isLoadingServices || isLoadingCards || isLoadingPaymentHistory) {
    return (
      <Box sx={{ p: 3 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: 400,
          }}
        >
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  // 구독하기 핸들러
  const handleSubscribe = async (serviceSettingIdx: number) => {
    if (import.meta.env.DEV) {
      console.log('🔍 [구독하기]', {
        companyIdx,
        serviceSettingIdx,
      });
    }

    try {
      // 3단계: 구독 신청
      // 빌링키는 백엔드에서 자동으로 조회하므로 프론트엔드에서는 serviceSettingIdx만 전송
      // 빌링키가 없으면 백엔드에서 "먼저 빌링키를 등록해주세요." 에러 반환
      await subscribeMutation.mutateAsync({
        companyIdx,
        serviceSettingIdx,
      });
      if (import.meta.env.DEV) {
        console.log('✅ [구독 성공]', {
          companyIdx,
          serviceSettingIdx,
        });
      }
      setSelectedServiceSettingIdx(null); // 구독 성공 후 선택 해제
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('❌ [구독 실패]', error);
      }
    }
  };

  // 구독 취소 핸들러
  const handleCancelSubscription = async () => {
    // currentSubscription에서 serviceSettingIdx 가져오기
    if (!currentSubscription || !currentSubscription.serviceSettingIdx) {
      if (import.meta.env.DEV) {
        console.error('❌ [구독 취소] 구독 정보를 찾을 수 없습니다.', {
          currentSubscription,
          companyIdx,
        });
      }
      alert('구독 정보를 찾을 수 없습니다. 페이지를 새로고침한 후 다시 시도해주세요.');
      return;
    }

    const serviceSettingIdx = currentSubscription.serviceSettingIdx;

    if (import.meta.env.DEV) {
      console.log('🔍 [구독 취소]', {
        companyIdx,
        serviceSettingIdx,
        currentSubscription,
      });
    }

    try {
      await cancelServiceMutation.mutateAsync({
        companyIdx,
        serviceSettingIdx,
      });
      if (import.meta.env.DEV) {
        console.log('✅ [구독 취소 성공]');
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('❌ [구독 취소 실패]', error);
      }
    }
  };

  // 에러 상태
  if (isErrorServices || isErrorCards || isErrorPaymentHistory) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">구독 서비스 정보를 불러오는 중 오류가 발생했습니다.</Alert>
      </Box>
    );
  }

  return (
    <Box>
      {/* 페이플 SDK 로더 */}
      <PaypleSdkLoader />

      {/* 서비스 플랜 목록 */}
      <Box sx={{ p: 3 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          spacing={2}
          sx={{ flexWrap: 'wrap', gap: 2 }}
        >
          {plans.map((plan) => {
            const isSelected = selectedServiceSettingIdx === plan.serviceSettingIdx;
            return (
              <ServicePlanCard
                key={plan.serviceSettingIdx}
                plan={plan}
                isSelected={isSelected}
                onClick={() => handlePlanClick(plan)}
                formatPrice={formatPrice}
              />
            );
          })}
        </Stack>
      </Box>

      <Divider />

      {/* 결제 정보 */}
      <Box sx={{ mb: 4, p: 3 }}>
        <PaymentInfo
          serviceName={paymentInfo.serviceName}
          payer={paymentInfo.payer}
          billingAddress={paymentInfo.billingAddress}
          billingContact={paymentInfo.billingContact}
          paymentMethod={paymentInfo.paymentMethod}
          hasSubscription={!!currentSubscription}
          hasSelectedPlan={
            !!selectedServiceSettingIdx && !isPlanSubscribed(selectedServiceSettingIdx)
          }
          onCancelSubscription={currentSubscription ? handleCancelSubscription : undefined}
          onSubscribe={
            selectedServiceSettingIdx && !isPlanSubscribed(selectedServiceSettingIdx)
              ? () => handleSubscribe(selectedServiceSettingIdx)
              : undefined
          }
          isCancelling={cancelServiceMutation.isPending}
          isSubscribing={subscribeMutation.isPending}
        />
      </Box>

      <Divider />

      {/* 등록된 카드 */}
      <Box sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2.5 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            등록된 카드
          </Typography>
          <Button
            variant="text"
            size="small"
            onClick={handleAddCard}
            startIcon={<Iconify icon="solar:add-circle-bold" width={20} />}
          >
            카드 추가
          </Button>
        </Stack>

        <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', gap: 2 }}>
          {registeredCards.length === 0 ? (
            <Box sx={{ width: '100%', py: 4, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                등록된 카드가 없습니다.
              </Typography>
            </Box>
          ) : (
            registeredCards.map((card) => (
              <RegisteredCard
                key={card.companyCardIdx}
                card={card}
                cardMenuAnchor={cardMenuAnchor[card.companyCardIdx] || null}
                onMenuOpen={(e) => handleCardMenuOpen(e, card.companyCardIdx)}
                onMenuClose={() => handleCardMenuClose(card.companyCardIdx)}
                onCardAction={handleCardAction}
                getCardIcon={getCardIcon}
              />
            ))
          )}
        </Stack>
      </Box>

      <Divider />

      {/* 결제 내역 */}
      <Box sx={{ p: 3 }}>
        <PaymentHistoryTable rows={paymentHistory} onViewReceipt={handleViewReceipt} />
        {paymentHistoryData && (paymentHistoryData as any)?.totalCount > 0 && (
          <PaymentHistoryPagination
            count={(paymentHistoryData as any).totalCount}
            page={paymentHistoryPage}
            rowsPerPage={paymentHistoryRowsPerPage}
            onChangePage={setPaymentHistoryPage}
            onChangeRowsPerPage={(rows) => {
              setPaymentHistoryRowsPerPage(rows);
              setPaymentHistoryPage(0);
            }}
          />
        )}
      </Box>
    </Box>
  );
}
