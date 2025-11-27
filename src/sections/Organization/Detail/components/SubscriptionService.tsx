import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';

import React, { useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router';

import { Iconify } from 'src/components/iconify';
import {
  useRegisteredCards,
  useSubscribe,
  useCancelService,
  useCardAction,
  useRegisterCard,
} from '../../hooks/use-organization-api';
import { useServices } from 'src/sections/ServiceSetting/hooks/use-service-setting-api';
import type { RegisteredCard as ApiRegisteredCard } from 'src/services/organization/organization.types';
import type { ServiceSetting } from 'src/services/service-setting/service-setting.types';

// 페이플 SDK 타입 정의 (Payple3 문서 기준)
declare global {
  interface Window {
    PaypleCpayAuthCheck?: (config: {
      clientKey: string;
      PCD_PAY_TYPE: string;
      PCD_PAY_WORK: string;
      PCD_CARD_VER?: string;
      PCD_PAY_GOODS?: string;
      PCD_PAY_TOTAL?: number;
      PCD_RST_URL?: string;
      callbackFunction?: (params: {
        PCD_PAY_RESULT: string;
        PCD_PAY_MSG?: string;
        PCD_PAY_BILLKEY?: string;
        PCD_PAY_OID?: string;
        PCD_PAY_TOTAL?: string;
        PCD_PAY_CARDNAME?: string;
        PCD_PAY_CARDNUM?: string;
        [key: string]: any;
      }) => void;
    }) => void;
    $?: any; // jQuery
    jQuery?: any; // jQuery
  }
}

// ----------------------------------------------------------------------

type Props = {
  organizationId?: string;
};

export default function SubscriptionService({ organizationId }: Props) {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const companyIdx = organizationId ? parseInt(organizationId, 10) : id ? parseInt(id, 10) : 0;

  const [selectedServiceSettingIdx, setSelectedServiceSettingIdx] = React.useState<number | null>(
    null
  );
  const [cardMenuAnchor, setCardMenuAnchor] = React.useState<{
    [key: string]: HTMLElement | null;
  }>({});
  const [paypleSdkLoaded, setPaypleSdkLoaded] = React.useState(false);

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

  // Mutations
  const subscribeMutation = useSubscribe();
  const cancelServiceMutation = useCancelService();
  const cardActionMutation = useCardAction();
  const registerCardMutation = useRegisterCard();

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
    () => registeredCardsInfo?.cards || [],
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

  // 페이플 SDK 로드 (Payple3 문서 기준)
  React.useEffect(() => {
    // 페이플 SDK가 이미 로드되어 있는지 확인
    if (window.PaypleCpayAuthCheck) {
      setPaypleSdkLoaded(true);
      return;
    }

    // jQuery가 필요한 경우 먼저 로드
    const loadJQuery = (): Promise<void> =>
      new Promise((resolve) => {
        if (window.$ || window.jQuery) {
          resolve();
          return;
        }

        const jqueryScript = document.createElement('script');
        jqueryScript.src = 'https://code.jquery.com/jquery-3.6.0.min.js';
        jqueryScript.async = true;
        jqueryScript.onload = () => resolve();
        jqueryScript.onerror = () => {
          console.warn('jQuery 로드 실패, 페이플 SDK는 jQuery 없이 시도');
          resolve();
        };
        document.body.appendChild(jqueryScript);
      });

    // 페이플 SDK 스크립트 동적 로드
    const loadPaypleSdk = async () => {
      // jQuery 로드 대기
      await loadJQuery();

      // 중복 로드 방지
      const existingScript = document.querySelector('script[src*="payple"]');
      if (existingScript) {
        // 이미 로드 중이면 완료 대기
        const checkInterval = setInterval(() => {
          if (window.PaypleCpayAuthCheck) {
            setPaypleSdkLoaded(true);
            clearInterval(checkInterval);
          }
        }, 100);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://democpay.payple.kr/js/v1/payment.js'; // 테스트 환경
      // 운영 환경: https://cpay.payple.kr/js/v1/payment.js
      script.async = true;
      script.onload = () => {
        // SDK 로드 완료 후 약간의 지연을 두고 확인
        setTimeout(() => {
          if (window.PaypleCpayAuthCheck) {
            console.log('페이플 SDK 로드 성공');
            setPaypleSdkLoaded(true);
          } else {
            console.warn('페이플 SDK 객체를 찾을 수 없습니다.');
          }
        }, 500);
      };
      script.onerror = () => {
        console.error('페이플 SDK 스크립트 로드 실패');
      };
      document.body.appendChild(script);
    };

    loadPaypleSdk();
  }, []);

  const handleCardMenuOpen = (event: React.MouseEvent<HTMLElement>, cardId: string) => {
    setCardMenuAnchor((prev) => ({ ...prev, [cardId]: event.currentTarget }));
  };

  const handleCardMenuClose = (cardId: string) => {
    setCardMenuAnchor((prev) => ({ ...prev, [cardId]: null }));
  };

  const handleCardAction = async (cardId: string, action: string) => {
    if (import.meta.env.DEV) {
      console.log('🔍 [SubscriptionService] 카드 액션', {
        cardId,
        action,
        companyIdx,
      });
    }

    try {
      if (action === 'setPrimary') {
        await cardActionMutation.mutateAsync({
          companyIdx,
          action: 'setPrimary',
          cardData: { cardId },
        });
        if (import.meta.env.DEV) {
          console.log('✅ [대표 카드 설정 성공]', { cardId });
        }
      } else if (action === 'delete') {
        await cardActionMutation.mutateAsync({
          companyIdx,
          action: 'delete',
          cardData: { cardId },
        });
        if (import.meta.env.DEV) {
          console.log('✅ [카드 삭제 성공]', { cardId });
        }
      } else if (action === 'edit') {
        // TODO: 카드 수정 모달 열기
        if (import.meta.env.DEV) {
          console.log('📝 [카드 수정]', cardId);
        }
      }
    } catch (error: any) {
      if (import.meta.env.DEV) {
        console.error('❌ [카드 액션 실패]', {
          error,
          errorMessage: error?.message,
          errorResponse: error?.response?.data,
          cardId,
          action,
        });
      }
    }

    handleCardMenuClose(cardId);
  };

  const getCardIcon = (type: string) => {
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
  };

  const formatPrice = (price: number) => String(price).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  // 페이플 콜백 함수 (callbackFunction 방식)
  const handlePaypleCallback = React.useCallback(
    async (params: {
      PCD_PAY_RESULT: string;
      PCD_PAY_MSG?: string;
      PCD_PAY_BILLKEY?: string;
      PCD_PAY_OID?: string;
      PCD_PAY_TOTAL?: string;
      PCD_PAY_CARDNAME?: string;
      PCD_PAY_CARDNUM?: string;
      [key: string]: any;
    }) => {
      if (params.PCD_PAY_RESULT === 'success') {
        // 성공 처리
        if (import.meta.env.DEV) {
          console.log('✅ [페이플 카드 등록 성공]', {
            companyIdx,
            billingKey: params.PCD_PAY_BILLKEY,
            orderNo: params.PCD_PAY_OID,
            amount: params.PCD_PAY_TOTAL,
            cardName: params.PCD_PAY_CARDNAME,
            cardNo: params.PCD_PAY_CARDNUM,
            resultMsg: params.PCD_PAY_MSG,
          });
        }

        try {
          // 카드 등록 API 호출
          await registerCardMutation.mutateAsync({
            companyIdx,
            billingKey: params.PCD_PAY_BILLKEY || '',
            orderNo: params.PCD_PAY_OID || '',
            amount: params.PCD_PAY_TOTAL || '0',
            cardName: params.PCD_PAY_CARDNAME || '',
            cardNo: params.PCD_PAY_CARDNUM || '',
          });

          if (import.meta.env.DEV) {
            console.log('✅ [카드 등록 API 호출 성공]');
          }
          // TODO: 성공 토스트 메시지 표시
        } catch (error: any) {
          if (import.meta.env.DEV) {
            console.error('❌ [카드 등록 API 호출 실패]', {
              error,
              errorMessage: error?.message,
              errorResponse: error?.response?.data,
            });
          }
          // TODO: 에러 토스트 메시지 표시
        }
      } else {
        // 실패/취소 처리
        const isCancel = params.PCD_PAY_RESULT === 'cancel' || params.PCD_PAY_MSG?.includes('취소');
        if (import.meta.env.DEV) {
          console.warn('⚠️ [페이플 카드 등록 실패/취소]', {
            result: params.PCD_PAY_RESULT,
            resultMsg: params.PCD_PAY_MSG,
            isCancel,
          });
        }

        // TODO: 에러 처리 (Toast 메시지 등)
        if (isCancel) {
          // 취소 시 이전 페이지로 이동
          navigate(-1);
        } else {
          // 실패 시 에러 토스트 메시지 표시
          // TODO: Toast 메시지 표시
        }
      }
    },
    [navigate, companyIdx, registerCardMutation]
  );

  // 페이플 창 열기 함수
  const openPaypleWindow = React.useCallback(() => {
    // TODO: 실제 페이플 카드 등록 설정값으로 변경 필요 (Payple3 문서 참고)
    // - clientKey: 클라이언트 키 (백엔드에서 가져오기)
    // - callbackFunction: 콜백 함수로 결과 받기 (URL 리다이렉트 없음)
    const paypleConfig = {
      clientKey: 'test_DF55F29DA654A8CBC0F0A9DD4B556486', // TODO: 테스트 클라이언트 키 (실제로는 백엔드 API에서 가져오기)
      PCD_PAY_TYPE: 'card', // 카드 결제
      PCD_PAY_WORK: 'AUTH', // 카드 등록만 (결제 없이)
      PCD_CARD_VER: '01', // 정기 결제
      PCD_PAY_GOODS: '카드 등록', // 상품명
      PCD_PAY_TOTAL: 0, // 카드 등록만 하므로 금액 0
      callbackFunction: handlePaypleCallback, // 콜백 함수로 결과 받기
    };

    try {
      console.log('페이플 카드 등록창 열기:', paypleConfig);
      window.PaypleCpayAuthCheck?.(paypleConfig);
    } catch (error) {
      console.error('페이플 카드 등록창 열기 실패:', error);
    }
  }, [handlePaypleCallback]);

  const handleAddCard = React.useCallback(() => {
    if (import.meta.env.DEV) {
      console.log('🔍 [카드 추가 버튼 클릭]', { companyIdx });
    }

    // 페이플 SDK 로드 확인
    if (!paypleSdkLoaded || !window.PaypleCpayAuthCheck) {
      console.error('페이플 SDK가 로드되지 않았습니다. 잠시 후 다시 시도해주세요.');
      // SDK 로드 재시도
      const checkInterval = setInterval(() => {
        if (window.PaypleCpayAuthCheck) {
          clearInterval(checkInterval);
          setPaypleSdkLoaded(true);
          // SDK 로드 완료 후 페이플 창 열기
          openPaypleWindow();
        }
      }, 500);
      // 10초 후 타임아웃
      setTimeout(() => clearInterval(checkInterval), 10000);
      return;
    }

    openPaypleWindow();
  }, [companyIdx, paypleSdkLoaded, openPaypleWindow]);

  // 로딩 상태
  if (isLoadingServices || isLoadingCards) {
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
  if (isErrorServices || isErrorCards) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">구독 서비스 정보를 불러오는 중 오류가 발생했습니다.</Alert>
      </Box>
    );
  }

  // 플랜이 구독 중인지 확인하는 함수 (plans 배열에서 직접 확인)
  const isPlanSubscribed = (serviceSettingIdx: number) => {
    const plan = plans.find((p) => p.serviceSettingIdx === serviceSettingIdx);
    return plan?.isSubscribed || false;
  };

  // 플랜 클릭 핸들러 (카드 선택만)
  const handlePlanClick = (plan: Plan) => {
    setSelectedServiceSettingIdx(plan.serviceSettingIdx);
    if (import.meta.env.DEV) {
      console.log('🔍 [플랜 선택]', {
        serviceSettingIdx: plan.serviceSettingIdx,
        planName: plan.planName,
        isSubscribed: isPlanSubscribed(plan.serviceSettingIdx),
      });
    }
  };

  // 구독하기 핸들러
  const handleSubscribe = async (serviceSettingIdx: number) => {
    if (import.meta.env.DEV) {
      console.log('🔍 [구독하기]', {
        companyIdx,
        serviceSettingIdx,
      });
    }

    try {
      // 서비스 구독 API 호출 (하나만 구독 가능, 기존 구독은 자동 해지)
      // serviceSettingIdx를 숫자로 전송
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

  // 카드 타입 매핑 함수
  const mapCardType = (cardType: string): 'visa' | 'mastercard' | 'amex' => {
    const typeLower = cardType.toLowerCase();
    if (typeLower.includes('visa')) return 'visa';
    if (typeLower.includes('master')) return 'mastercard';
    if (typeLower.includes('amex') || typeLower.includes('american')) return 'amex';
    return 'visa'; // 기본값
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 4 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          spacing={2}
          sx={{ flexWrap: 'wrap', gap: 2 }}
        >
          {plans.map((plan) => {
            const isSubscribed = isPlanSubscribed(plan.serviceSettingIdx);
            const isSelected = selectedServiceSettingIdx === plan.serviceSettingIdx;
            return (
              <Card
                key={plan.serviceSettingIdx}
                onClick={() => handlePlanClick(plan)}
                sx={{
                  flex: '1 1 auto',
                  maxWidth: 200,
                  position: 'relative',
                  border: isSubscribed ? '2px solid' : isSelected ? '2px solid' : '1px solid',
                  borderColor: isSubscribed
                    ? 'primary.main'
                    : isSelected
                      ? 'primary.main'
                      : 'divider',
                  bgcolor: isSelected ? 'primary.lighter' : 'transparent',
                  boxShadow:
                    isSubscribed || isSelected ? (theme) => theme.customShadows.card : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    boxShadow: (theme) => theme.customShadows.card,
                    transform: 'translateY(-2px)',
                    bgcolor: isSelected ? 'primary.lighter' : 'grey.50',
                  },
                }}
              >
                {isSubscribed && (
                  <Chip
                    label="구독중"
                    size="small"
                    color="info"
                    variant="soft"
                    sx={{
                      position: 'absolute',
                      top: 12,
                      right: 12,
                      zIndex: 1,
                    }}
                  />
                )}
                <CardContent>
                  <Stack spacing={2} alignItems="center" sx={{ textAlign: 'center' }}>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 1,
                        bgcolor: isSubscribed ? 'primary.lighter' : 'grey.100',
                      }}
                    >
                      <Iconify
                        icon={(plan.icon || 'solar:card-bold') as any}
                        width={32}
                        sx={{ color: isSubscribed ? 'primary.main' : 'text.secondary' }}
                      />
                    </Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {plan.planName}
                    </Typography>
                    <Stack spacing={0.5}>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        {formatPrice(plan.price)}원
                      </Typography>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            );
          })}
        </Stack>
      </Box>

      <Divider sx={{ my: 4 }} />

      {/* 결제 정보 */}
      <Box sx={{ mb: 4 }}>
        <Stack spacing={2.5}>
          <Stack direction="row" spacing={4} alignItems="center">
            <Typography variant="subtitle2" sx={{ fontWeight: 600, minWidth: 120 }}>
              이용중인 서비스
            </Typography>
            <Typography variant="body2">{paymentInfo.serviceName}</Typography>
          </Stack>
          <Stack direction="row" spacing={4} alignItems="center">
            <Typography variant="subtitle2" sx={{ fontWeight: 600, minWidth: 120 }}>
              결제자
            </Typography>
            <Typography variant="body2">{paymentInfo.payer}</Typography>
          </Stack>
          <Stack direction="row" spacing={4} alignItems="flex-start">
            <Typography variant="subtitle2" sx={{ fontWeight: 600, minWidth: 120, pt: 0.5 }}>
              청구지 주소
            </Typography>
            <Typography variant="body2" sx={{ flex: 1 }}>
              {paymentInfo.billingAddress}
            </Typography>
          </Stack>
          <Stack direction="row" spacing={4} alignItems="center">
            <Typography variant="subtitle2" sx={{ fontWeight: 600, minWidth: 120 }}>
              청구 연락처
            </Typography>
            <Typography variant="body2">{paymentInfo.billingContact}</Typography>
          </Stack>
          <Stack direction="row" spacing={4} alignItems="center">
            <Typography variant="subtitle2" sx={{ fontWeight: 600, minWidth: 120 }}>
              결제 수단
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2">{paymentInfo.paymentMethod}</Typography>
              <Iconify icon="eva:arrow-ios-downward-fill" width={20} />
            </Box>
          </Stack>
        </Stack>

        <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ mt: 3 }}>
          {currentSubscription && (
            <Button
              variant="outlined"
              color="error"
              onClick={handleCancelSubscription}
              disabled={cancelServiceMutation.isPending}
            >
              {cancelServiceMutation.isPending ? '취소 중...' : '구독 취소'}
            </Button>
          )}
          {selectedServiceSettingIdx && !isPlanSubscribed(selectedServiceSettingIdx) && (
            <Button
              variant="contained"
              onClick={() => handleSubscribe(selectedServiceSettingIdx)}
              disabled={subscribeMutation.isPending}
            >
              {subscribeMutation.isPending ? '구독 중...' : '구독하기'}
            </Button>
          )}
        </Stack>
      </Box>

      <Divider sx={{ my: 4 }} />

      {/* 등록된 카드 */}
      <Box>
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
            registeredCards.map((card) => {
              const cardType = mapCardType(card.cardType);
              return (
                <Card
                  key={card.cardId}
                  sx={{
                    position: 'relative',
                    border: '1px solid',
                    borderColor: 'divider',
                    boxShadow: 'none',
                    minWidth: 200,
                    flex: '1 1 200px',
                  }}
                >
                  <CardContent>
                    <Stack spacing={2}>
                      {/* 상단: 아이콘, 대표카드 뱃지, 액션 버튼 */}
                      <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                        spacing={1}
                      >
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Box
                            sx={{
                              width: 40,
                              height: 28,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              borderRadius: 0.5,
                              bgcolor: 'grey.100',
                            }}
                          >
                            <Iconify icon={getCardIcon(cardType) as any} width={32} />
                          </Box>
                          {card.isPrimary && (
                            <Chip label="대표 카드" size="small" color="info" variant="soft" />
                          )}
                        </Stack>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCardMenuOpen(e, card.cardId);
                          }}
                          sx={{
                            color: 'text.secondary',
                          }}
                        >
                          <Iconify icon="eva:more-vertical-fill" width={20} />
                        </IconButton>
                        <Menu
                          anchorEl={cardMenuAnchor[card.cardId]}
                          open={Boolean(cardMenuAnchor[card.cardId])}
                          onClose={() => handleCardMenuClose(card.cardId)}
                          anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'right',
                          }}
                          transformOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                          }}
                        >
                          {!card.isPrimary && (
                            <MenuItem onClick={() => handleCardAction(card.cardId, 'setPrimary')}>
                              대표 카드로 설정
                            </MenuItem>
                          )}
                          <MenuItem onClick={() => handleCardAction(card.cardId, 'edit')}>
                            수정
                          </MenuItem>
                          <Divider />
                          <MenuItem
                            onClick={() => handleCardAction(card.cardId, 'delete')}
                            sx={{
                              color: 'error.main',
                              '&:hover': {
                                bgcolor: 'error.lighter',
                              },
                            }}
                          >
                            삭제
                          </MenuItem>
                        </Menu>
                      </Stack>

                      {/* 하단: 카드 번호 */}
                      <Stack direction="row" justifyContent="flex-start">
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {card.cardNumber}
                        </Typography>
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              );
            })
          )}
        </Stack>
      </Box>
    </Box>
  );
}
