import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type PaymentInfoProps = {
  serviceName: string;
  payer: string;
  billingAddress: string;
  billingContact: string;
  paymentMethod: string;
  hasSubscription: boolean;
  hasSelectedPlan: boolean;
  onCancelSubscription?: () => void;
  onSubscribe?: () => void;
  isCancelling?: boolean;
  isSubscribing?: boolean;
};

export function PaymentInfo({
  serviceName,
  payer,
  billingAddress,
  billingContact,
  paymentMethod,
  hasSubscription,
  hasSelectedPlan,
  onCancelSubscription,
  onSubscribe,
  isCancelling = false,
  isSubscribing = false,
}: PaymentInfoProps) {
  return (
    <Box>
      <Stack spacing={2.5}>
        <Stack direction="row" spacing={4} alignItems="center">
          <Typography variant="subtitle2" sx={{ fontWeight: 600, minWidth: 120 }}>
            이용중인 서비스
          </Typography>
          <Typography variant="body2">{serviceName}</Typography>
        </Stack>
        <Stack direction="row" spacing={4} alignItems="center">
          <Typography variant="subtitle2" sx={{ fontWeight: 600, minWidth: 120 }}>
            결제자
          </Typography>
          <Typography variant="body2">{payer}</Typography>
        </Stack>
        <Stack direction="row" spacing={4} alignItems="flex-start">
          <Typography variant="subtitle2" sx={{ fontWeight: 600, minWidth: 120, pt: 0.5 }}>
            청구지 주소
          </Typography>
          <Typography variant="body2" sx={{ flex: 1 }}>
            {billingAddress}
          </Typography>
        </Stack>
        <Stack direction="row" spacing={4} alignItems="center">
          <Typography variant="subtitle2" sx={{ fontWeight: 600, minWidth: 120 }}>
            청구 연락처
          </Typography>
          <Typography variant="body2">{billingContact}</Typography>
        </Stack>
        <Stack direction="row" spacing={4} alignItems="center">
          <Typography variant="subtitle2" sx={{ fontWeight: 600, minWidth: 120 }}>
            결제 수단
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2">{paymentMethod}</Typography>
            <Iconify icon="eva:arrow-ios-downward-fill" width={20} />
          </Box>
        </Stack>
      </Stack>

      <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ mt: 3 }}>
        {hasSubscription && onCancelSubscription && (
          <Button
            variant="outlined"
            color="error"
            onClick={onCancelSubscription}
            disabled={isCancelling}
          >
            {isCancelling ? '취소 중...' : '구독 취소'}
          </Button>
        )}
        {hasSelectedPlan && onSubscribe && (
          <Button variant="contained" onClick={onSubscribe} disabled={isSubscribing}>
            {isSubscribing ? '구독 중...' : '구독하기'}
          </Button>
        )}
      </Stack>
    </Box>
  );
}

