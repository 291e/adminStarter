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

import { Iconify } from 'src/components/iconify';

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
    isRecommended: true,
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
  const [cardMenuAnchor, setCardMenuAnchor] = React.useState<{
    [key: string]: HTMLElement | null;
  }>({});

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
                  // 구독 중이 아닌 경우 업그레이드
                  onUpgrade?.(plan.id);
                }
              }}
              sx={{
                flex: '1 1 200px',
                minWidth: 200,
                maxWidth: 250,
                position: 'relative',
                border: plan.isRecommended
                  ? '2px solid'
                  : plan.isSubscribed
                    ? '1px solid'
                    : '1px solid',
                borderColor: plan.isRecommended
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
                      {formatPrice(plan.price)}원
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      / {plan.period}
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
            서비스 취소
          </Button>
          <Button variant="contained" onClick={() => onUpgrade?.('premium')}>
            서비스 업그레이드
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
            variant="outlined"
            size="small"
            onClick={onAddCard}
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
