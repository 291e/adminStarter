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

import React from 'react';
import { useNavigate } from 'react-router';

import { Iconify } from 'src/components/iconify';

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

export type SubscriptionPlan = {
  id: string;
  name: string;
  price: number;
  period: string;
  icon: string;
  isSubscribed?: boolean;
  isRecommended?: boolean;
};

export type PaymentInfo = {
  serviceName: string;
  payer: string;
  billingAddress: string;
  billingContact: string;
  paymentMethod: string;
};

export type RegisteredCard = {
  id: string;
  type: 'visa' | 'mastercard' | 'amex';
  number: string;
  isPrimary?: boolean;
};

type Props = {
  plans?: SubscriptionPlan[];
  paymentInfo?: PaymentInfo;
  registeredCards?: RegisteredCard[];
  onUpgrade?: (planId: string) => void;
  onCancel?: () => void;
  onAddCard?: () => void;
  onCardMenuClick?: (cardId: string, action: string) => void;
};

const defaultPlans: SubscriptionPlan[] = [
  {
    id: 'starter',
    name: '안전해YOU 스타터',
    price: 0,
    period: '1개월',
    icon: 'solar:pin-bold',
  },
  {
    id: 'lite',
    name: '안전해YOU 라이트',
    price: 30000,
    period: '1개월',
    icon: 'solar:box-bold',
    isSubscribed: true,
  },
  {
    id: 'standard',
    name: '안전해YOU 스탠다드',
    price: 70000,
    period: '1개월',
    icon: 'solar:crane-bold',
  },
  {
    id: 'plus',
    name: '안전해YOU 플러스',
    price: 100000,
    period: '1개월',
    icon: 'solar:buildings-bold',
  },
  {
    id: 'premium',
    name: '안전해YOU 프리미엄',
    price: 150000,
    period: '1개월',
    icon: 'solar:skyscraper-bold',
  },
];

const defaultPaymentInfo: PaymentInfo = {
  serviceName: '안전해YOU 라이트',
  payer: '이편한 자동화기술',
  billingAddress: '대전광역시 동구 안골로28번길 15-4 (구도동) 이편한자동화기술',
  billingContact: '1588-6752',
  paymentMethod: '**** **** **** 5678',
};

const defaultCards: RegisteredCard[] = [
  {
    id: '1',
    type: 'mastercard',
    number: '**** **** **** 5678',
  },
  {
    id: '2',
    type: 'visa',
    number: '**** **** **** 1234',
    isPrimary: true,
  },
  {
    id: '3',
    type: 'visa',
    number: '**** **** **** 7892',
  },
  {
    id: '4',
    type: 'visa',
    number: '**** **** **** 4433',
  },
];

export default function SubscriptionService({
  plans = defaultPlans,
  paymentInfo = defaultPaymentInfo,
  registeredCards = defaultCards,
  onUpgrade,
  onCancel,
  onAddCard,
  onCardMenuClick,
}: Props) {
  const navigate = useNavigate();
  const [selectedPlanId, setSelectedPlanId] = React.useState<string | null>(null);
  const [cardMenuAnchor, setCardMenuAnchor] = React.useState<{
    [key: string]: HTMLElement | null;
  }>({});
  const [paypleSdkLoaded, setPaypleSdkLoaded] = React.useState(false);

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

  const handleCardAction = (cardId: string, action: string) => {
    onCardMenuClick?.(cardId, action);
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
    (params: {
      PCD_PAY_RESULT: string;
      PCD_PAY_MSG?: string;
      PCD_PAY_BILLKEY?: string;
      PCD_PAY_OID?: string;
      PCD_PAY_TOTAL?: string;
      PCD_PAY_CARDNAME?: string;
      PCD_PAY_CARDNUM?: string;
      [key: string]: any;
    }) => {
      // organizationId 추출
      const organizationId = window.location.pathname.split('/').pop() || '1';

      if (params.PCD_PAY_RESULT === 'success') {
        // 성공 처리
        console.log('페이플 카드 등록 성공:', {
          billingKey: params.PCD_PAY_BILLKEY,
          orderNo: params.PCD_PAY_OID,
          amount: params.PCD_PAY_TOTAL,
          cardName: params.PCD_PAY_CARDNAME,
          cardNo: params.PCD_PAY_CARDNUM,
          resultMsg: params.PCD_PAY_MSG,
        });

        // TODO: TanStack Query Hook(useMutation)으로 카드 등록 API 호출
        // const mutation = useMutation({
        //   mutationFn: (data: {
        //     billingKey: string;
        //     orderNo: string;
        //     amount: string;
        //     cardName: string;
        //     cardNo: string;
        //     organizationId: string;
        //   }) => addBillingCard(data),
        //   onSuccess: () => {
        //     queryClient.invalidateQueries({ queryKey: ['billingCards', organizationId] });
        //     // 성공 시 카드 목록 새로고침 또는 토스트 메시지
        //   },
        //   onError: (error) => {
        //     console.error('카드 등록 실패:', error);
        //     // 에러 토스트 메시지
        //   },
        // });

        // TODO: API 호출
        // mutation.mutate({
        //   billingKey: params.PCD_PAY_BILLKEY || '',
        //   orderNo: params.PCD_PAY_OID || '',
        //   amount: params.PCD_PAY_TOTAL || '0',
        //   cardName: params.PCD_PAY_CARDNAME || '',
        //   cardNo: params.PCD_PAY_CARDNUM || '',
        //   organizationId,
        // });

        // TODO: 성공 토스트 메시지 표시
      } else {
        // 실패/취소 처리
        const isCancel = params.PCD_PAY_RESULT === 'cancel' || params.PCD_PAY_MSG?.includes('취소');
        console.warn('페이플 카드 등록 실패/취소:', {
          result: params.PCD_PAY_RESULT,
          resultMsg: params.PCD_PAY_MSG,
          isCancel,
        });

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
    [navigate]
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
    onAddCard?.();

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
  }, [onAddCard, paypleSdkLoaded, openPaypleWindow]);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', gap: 2 }}>
          {plans.map((plan) => (
            <Card
              key={plan.id}
              onClick={() => {
                if (plan.isSubscribed) {
                  // 구독 중인 경우 취소 또는 다운그레이드
                  onCancel?.();
                } else {
                  // 구독 중이 아닌 경우 선택 및 업그레이드
                  setSelectedPlanId(plan.id);
                  onUpgrade?.(plan.id);
                }
              }}
              sx={{
                flex: '1 1 auto',
                maxWidth: 200,
                position: 'relative',
                border:
                  selectedPlanId === plan.id
                    ? '2px solid'
                    : plan.isRecommended
                      ? '2px solid'
                      : plan.isSubscribed
                        ? '1px solid'
                        : '1px solid',
                borderColor:
                  selectedPlanId === plan.id
                    ? 'primary.main'
                    : plan.isRecommended
                      ? 'primary.main'
                      : plan.isSubscribed
                        ? 'primary.light'
                        : 'divider',
                boxShadow: plan.isSubscribed ? (theme) => theme.customShadows.card : 'none',
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': {
                  boxShadow: (theme) => theme.customShadows.card,
                  transform: 'translateY(-2px)',
                },
              }}
            >
              {plan.isSubscribed && (
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
                      bgcolor: plan.isSubscribed ? 'primary.lighter' : 'grey.100',
                    }}
                  >
                    <Iconify
                      icon={plan.icon as any}
                      width={32}
                      sx={{ color: plan.isSubscribed ? 'primary.main' : 'text.secondary' }}
                    />
                  </Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {plan.name}
                  </Typography>
                  <Stack spacing={0.5}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      {formatPrice(plan.price)}원{' '}
                      <span style={{ fontSize: 12, color: 'text.secondary', fontWeight: 400 }}>
                        / {plan.period}
                      </span>
                    </Typography>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          ))}
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
          <Button variant="outlined" onClick={onCancel}>
            구독 취소
          </Button>
          <Button variant="contained" onClick={() => onUpgrade?.('premium')}>
            구독 하기
          </Button>
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
          {registeredCards.map((card) => (
            <Card
              key={card.id}
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
                        <Iconify icon={getCardIcon(card.type) as any} width={32} />
                      </Box>
                      {card.isPrimary && (
                        <Chip label="대표 카드" size="small" color="info" variant="soft" />
                      )}
                    </Stack>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCardMenuOpen(e, card.id);
                      }}
                      sx={{
                        color: 'text.secondary',
                      }}
                    >
                      <Iconify icon="eva:more-vertical-fill" width={20} />
                    </IconButton>
                    <Menu
                      anchorEl={cardMenuAnchor[card.id]}
                      open={Boolean(cardMenuAnchor[card.id])}
                      onClose={() => handleCardMenuClose(card.id)}
                      anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'right',
                      }}
                      transformOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                      }}
                    >
                      <MenuItem onClick={() => handleCardAction(card.id, 'setPrimary')}>
                        대표 카드로 설정
                      </MenuItem>
                      <MenuItem onClick={() => handleCardAction(card.id, 'edit')}>수정</MenuItem>
                      <Divider />
                      <MenuItem
                        onClick={() => handleCardAction(card.id, 'delete')}
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
                      {card.number}
                    </Typography>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      </Box>
    </Box>
  );
}
