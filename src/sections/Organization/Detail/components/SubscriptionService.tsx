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
import { useCreateBillingKey, usePaymentHistory } from '../../hooks/use-payment-api';
import { useServices } from 'src/sections/ServiceSetting/hooks/use-service-setting-api';
import type { ServiceSetting } from 'src/services/service-setting/service-setting.types';
import { PaypleSdkLoader } from './payple/PaypleSdkLoader';
import { usePaypleCardRegister } from './payple/usePaypleCardRegister';
import { ServicePlanCard } from './ServicePlanCard';
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
  const [paymentHistoryPage, setPaymentHistoryPage] = useState(0);
  const [paymentHistoryRowsPerPage, setPaymentHistoryRowsPerPage] = useState(5);

  // 등록된 카드 정보
  const [registeredCard, setRegisteredCard] = useState<{
    cardName: string;
    cardNo: string;
    billingKey: string;
    registeredAt: Date;
  } | null>(null);

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

  // 결제 내역 조회 (모든 데이터를 한 번에 불러온 후 클라이언트에서 페이지네이션)
  const {
    data: paymentHistoryData,
    isLoading: isLoadingPaymentHistory,
    isError: isErrorPaymentHistory,
  } = usePaymentHistory({
    searchingDateKey: 'paymentRequestDate',
    page: 1,
    pageSize: 1000, // 모든 데이터 불러오기
  });

  // API 응답 데이터 추출 (axios interceptor가 평탄화하므로 직접 접근)
  const servicesInfo = servicesData as any;

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
        isLoadingServices,
        isErrorServices,
      });
    }
  }, [
    companyIdx,
    servicesData,
    servicesInfo,
    plans,
    currentSubscription,
    paymentInfo,
    isLoadingServices,
    isErrorServices,
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

      // 빌링키와 선택된 서비스가 없으면 에러
      if (!billingKey) {
        throw new Error('빌링키를 받지 못했습니다.');
      }

      if (!selectedServiceSettingIdx) {
        throw new Error('서비스를 선택해주세요.');
      }

      try {
        // 빌링키 등록 + serviceSettingIdx로 첫 결제/구독 생성
        // POST /payment/billingKey
        await createBillingKeyMutation.mutateAsync({
          PCD_PAYER_ID: billingKey,
          memberBillingType: 'card',
          memberBillingInfo: JSON.stringify({
            cardName,
            cardNo,
            orderNo: params.PCD_PAY_OID || '',
            amount: params.PCD_PAY_TOTAL || '0',
          }),
          serviceSettingIdx: selectedServiceSettingIdx,
        });

        if (import.meta.env.DEV) {
          console.log('✅ [빌링키 등록 및 구독 생성 성공]', {
            billingKey,
            serviceSettingIdx: selectedServiceSettingIdx,
          });
        }

        // 등록된 카드 정보 저장
        setRegisteredCard({
          cardName,
          cardNo,
          billingKey,
          registeredAt: new Date(),
        });

        // 구독 성공 후 선택 해제
        setSelectedServiceSettingIdx(null);
      } catch (error: any) {
        if (import.meta.env.DEV) {
          console.error('❌ [빌링키 등록 및 구독 생성 실패]', {
            error,
            errorMessage: error?.message,
            errorResponse: error?.response?.data,
          });
        }
        throw error;
      }
    },
    [selectedServiceSettingIdx, createBillingKeyMutation]
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

  const formatPrice = useCallback(
    (price: number) => String(price).replace(/\B(?=(\d{3})+(?!\d))/g, ','),
    []
  );

  // 결제 내역 데이터 변환
  const paymentHistory: PaymentHistoryItem[] = useMemo(() => {
    const paymentHistoryInfo = paymentHistoryData as any;

    // 디버깅: 원본 데이터 확인
    if (import.meta.env.DEV) {
      console.log('🔍 [SubscriptionService] 결제 내역 원본 데이터', {
        paymentHistoryData,
        paymentHistoryInfo,
        dataArray: paymentHistoryInfo?.data,
        paymentList: paymentHistoryInfo?.paymentList,
      });
    }

    // 결제 내역 데이터 추출
    // axios 인터셉터가 응답을 평탄화하면서 배열이 {0: {...}, 1: {...}, header: {...}} 형태로 올 수 있음
    let paymentList: any[] = [];

    if (Array.isArray(paymentHistoryInfo?.data)) {
      // 형태 1: { data: [...] }
      paymentList = paymentHistoryInfo.data;
    } else if (Array.isArray(paymentHistoryInfo?.paymentList)) {
      // 형태 2: { paymentList: [...] }
      paymentList = paymentHistoryInfo.paymentList;
    } else if (Array.isArray(paymentHistoryInfo)) {
      // 형태 3: 직접 배열
      paymentList = paymentHistoryInfo;
    } else if (paymentHistoryInfo && typeof paymentHistoryInfo === 'object') {
      // 형태 4: 숫자 키로 된 객체 (0, 1, 2, ... + header)
      // header 등 메타 필드를 제외하고 숫자 키만 추출
      const numericKeys = Object.keys(paymentHistoryInfo)
        .filter((key) => !isNaN(Number(key)))
        .sort((a, b) => Number(a) - Number(b));

      if (numericKeys.length > 0) {
        paymentList = numericKeys.map((key) => paymentHistoryInfo[key]);
      }
    }

    const totalCount = paymentHistoryInfo?.totalCount || paymentList.length;

    if (import.meta.env.DEV) {
      console.log('🔍 [SubscriptionService] 결제 내역 변환 전', {
        paymentList,
        totalCount,
        paymentListLength: paymentList.length,
      });
    }

    const result: PaymentHistoryItem[] = paymentList.map((payment: any, index: number) => {
      // 상태 매핑: 한글 문자열로 오는 paymentStatus 처리
      let status: PaymentHistoryItem['status'] = 'PENDING';
      const paymentStatus = payment.paymentStatus || '';
      if (paymentStatus.includes('완료') || paymentStatus === 'SUCCESS') {
        status = 'COMPLETED';
      } else if (
        paymentStatus.includes('실패') ||
        paymentStatus.includes('취소') ||
        paymentStatus === 'FAILED' ||
        paymentStatus === 'CANCELLED'
      ) {
        status = 'CANCELLED';
      }

      // 결제수단 매핑: paypleResponse JSON에서 추출 시도
      let paymentMethod = '미등록';
      try {
        if (payment.paypleResponse) {
          const paypleData = JSON.parse(payment.paypleResponse);
          if (paypleData.PCD_PAY_TYPE === 'card') {
            const cardName = paypleData.PCD_PAY_CARDNAME || '';
            const cardNum = paypleData.PCD_PAY_CARDNUM || '';
            if (cardName) {
              paymentMethod = cardName;
            } else if (cardNum) {
              // 카드번호 마스킹 처리 (뒤 4자리만 표시)
              const maskedCardNum = cardNum.replace(
                /(\d{4})-?(\d{4})-?(\d{4})-?(\d{4})/,
                '****-****-****-$4'
              );
              paymentMethod = `카드 ${maskedCardNum}`;
            } else {
              paymentMethod = '카드';
            }
          } else if (paypleData.PCD_PAY_TYPE === 'transfer') {
            paymentMethod = '계좌이체';
          }
        }
      } catch {
        // JSON 파싱 실패 시 기본값 사용
      }

      // 결제수단이 여전히 미등록이면 paymentMethod 필드 확인
      if (paymentMethod === '미등록') {
        if (payment.paymentMethod === 'card') {
          paymentMethod = '카드';
        } else if (payment.paymentMethod === 'transfer') {
          paymentMethod = '계좌이체';
        }
      }

      // 결제일: paymentDate 우선, 없으면 paymentRequestDate 사용
      const finalPaymentDate = payment.paymentDate || payment.paymentRequestDate || '';

      // 결제 번호: paymentId 우선, 없으면 paymentIdx 사용
      const finalPaymentNumber = payment.paymentId || String(payment.paymentIdx);

      // 서비스명: paypleResponse에서 추출 시도
      let serviceName = '';
      try {
        if (payment.paypleResponse) {
          const paypleData = JSON.parse(payment.paypleResponse);
          serviceName = paypleData.PCD_PAY_GOODS || '';
        }
      } catch {
        // JSON 파싱 실패 시 기본값 사용
      }
      // paypleResponse에서 추출 실패 시 기본값 사용
      if (!serviceName) {
        serviceName = payment.serviceName || '서비스명 없음';
      }

      // 결제 금액: paymentAmount 우선, 없으면 paymentRequestAmount 사용
      const finalAmount = payment.paymentAmount || payment.paymentRequestAmount || 0;

      // 영수증 URL: paypleResponse에서 추출 시도
      let receiptUrl: string | undefined;
      try {
        if (payment.paypleResponse) {
          const paypleData = JSON.parse(payment.paypleResponse);
          receiptUrl = paypleData.PCD_PAY_CARDRECEIPT || undefined;
        }
      } catch {
        // JSON 파싱 실패 시 기본값 사용
      }
      // paypleReceipt 필드도 확인
      if (!receiptUrl) {
        receiptUrl = payment.paypleReceipt || undefined;
      }

      return {
        id: payment.paymentIdx,
        order: index + 1,
        paymentDate: finalPaymentDate,
        paymentNumber: finalPaymentNumber,
        serviceName,
        amount: finalAmount,
        paymentMethod,
        status,
        receiptUrl,
      };
    });

    // 최신순으로 정렬 (paymentDate 기준 내림차순)
    return result
      .sort((a, b) => {
        const dateA = new Date(a.paymentDate || 0).getTime();
        const dateB = new Date(b.paymentDate || 0).getTime();
        return dateB - dateA; // 최신이 앞에 오도록
      })
      .map((item, idx) => ({
        ...item,
        order: idx + 1, // 정렬 후 순번 재할당
      }));
  }, [paymentHistoryData]);

  // 클라이언트 측 페이지네이션 적용
  const paginatedPaymentHistory = useMemo(() => {
    const startIndex = paymentHistoryPage * paymentHistoryRowsPerPage;
    const endIndex = startIndex + paymentHistoryRowsPerPage;
    return paymentHistory.slice(startIndex, endIndex);
  }, [paymentHistory, paymentHistoryPage, paymentHistoryRowsPerPage]);

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

  // 로딩 상태
  if (isLoadingServices || isLoadingPaymentHistory) {
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

  // 에러 상태
  if (isErrorServices || isErrorPaymentHistory) {
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
          justifyContent="flex-start"
          sx={{
            flexWrap: 'wrap',
            columnGap: 1.5,
            rowGap: 2,
          }}
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
          onCancelSubscription={undefined} // 구독 취소는 빌링키 삭제로 처리 (추후 구현)
          onSubscribe={undefined} // 구독은 빌링키 등록 시 자동으로 처리됨
          isCancelling={false}
          isSubscribing={createBillingKeyMutation.isPending}
        />
      </Box>

      <Divider />

      {/* 카드 등록 */}
      <Box sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2.5 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            결제 카드 등록
          </Typography>
          <Button
            variant="text"
            size="small"
            onClick={handleAddCard}
            startIcon={<Iconify icon="solar:add-circle-bold" width={20} />}
            disabled={!selectedServiceSettingIdx}
          >
            {registeredCard ? '카드 변경' : '카드 추가'}
          </Button>
        </Stack>

        {/* 등록된 카드 표시 */}
        {registeredCard ? (
          <Box
            sx={{
              p: 2.5,
              borderRadius: 2,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              maxWidth: 360,
              boxShadow: '0 8px 24px rgba(102, 126, 234, 0.35)',
            }}
          >
            {/* 카드 상단 - 아이콘과 등록일 */}
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mb: 3 }}
            >
              <Iconify icon={'ic:baseline-credit-card' as any} width={40} />
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                등록일: {registeredCard.registeredAt.toLocaleDateString('ko-KR')}
              </Typography>
            </Stack>

            {/* 카드 번호 */}
            <Typography
              variant="h5"
              sx={{
                fontFamily: 'monospace',
                letterSpacing: 2,
                mb: 2,
                fontWeight: 500,
              }}
            >
              {registeredCard.cardNo}
            </Typography>

            {/* 카드사 */}
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="caption" sx={{ opacity: 0.7, display: 'block' }}>
                  CARD TYPE
                </Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {registeredCard.cardName}
                </Typography>
              </Box>
              {/* 카드사 로고 (간단한 표시) */}
              <Box
                sx={{
                  width: 50,
                  height: 30,
                  bgcolor: 'rgba(255,255,255,0.2)',
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography variant="caption" sx={{ fontWeight: 700 }}>
                  {registeredCard.cardName.slice(0, 2)}
                </Typography>
              </Box>
            </Stack>
          </Box>
        ) : !selectedServiceSettingIdx ? (
          <Box sx={{ py: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              먼저 구독할 서비스를 선택해주세요.
            </Typography>
          </Box>
        ) : (
          <Box sx={{ py: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              등록된 카드가 없습니다. 카드를 추가해주세요.
            </Typography>
          </Box>
        )}
      </Box>

      <Divider />

      {/* 결제 내역 */}
      <Box sx={{ p: 3 }}>
        <PaymentHistoryTable rows={paginatedPaymentHistory} onViewReceipt={handleViewReceipt} />
        {paymentHistory.length > 0 && (
          <PaymentHistoryPagination
            count={paymentHistory.length}
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
