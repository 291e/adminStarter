import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';

// ----------------------------------------------------------------------

const formatPrice = (price: number) => String(price).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

type PaymentInfoProps = {
  organizationName: string;
  memberCount?: number;
  estimatedMonthlyFee: number | null;
  hasCard: boolean;
  billingType: string;
  billingCardName?: string;
  billingCardNo?: string;
  billingAmount?: string;
  membershipExpireDate?: string;
  activeService?: string;
  payerName?: string;
  billingAddress?: string;
  billingContact?: string;
  paymentMethodLabel?: string;
  onDeleteCard?: () => void;
  isDeleting?: boolean;
};

export function PaymentInfo({
  organizationName,
  memberCount,
  estimatedMonthlyFee,
  hasCard,
  billingType,
  billingCardName,
  billingCardNo,
  billingAmount,
  membershipExpireDate,
  activeService,
  payerName,
  billingAddress,
  billingContact,
  paymentMethodLabel,
  onDeleteCard,
  isDeleting = false,
}: PaymentInfoProps) {
  const feeLabel =
    estimatedMonthlyFee === null ? '요금제 변경 필요' : `${estimatedMonthlyFee.toLocaleString()}원`;

  const renderInfoRow = (
    label: string,
    value: string | number | undefined | null,
    isChip = false
  ) => (
    <Stack direction="row" spacing={2} alignItems="center">
      <Typography variant="subtitle2" sx={{ fontWeight: 600, minWidth: 130 }}>
        {label}
      </Typography>
      {isChip ? (
        <Chip
          size="small"
          label={String(value || '미등록')}
          color={value ? 'success' : 'default'}
          variant={value ? 'soft' : 'outlined'}
        />
      ) : (
        <Typography variant="body2">{String(value || '-')}</Typography>
      )}
    </Stack>
  );

  return (
    <Box>
      <Stack spacing={2.5}>
        {renderInfoRow('이용중인 서비스', activeService || '-', false)}

        <Divider />

        <Stack spacing={2.0}>
          {renderInfoRow('결제자', payerName)}
          {renderInfoRow('청구지 주소', billingAddress)}
          {renderInfoRow('청구 연락처', billingContact)}
          {renderInfoRow('결제 수단', paymentMethodLabel, true)}
        </Stack>

        {renderInfoRow('결제 방식', hasCard ? billingType : '미등록', true)}

        {renderInfoRow(
          '결제 금액(예상)',
          estimatedMonthlyFee === null ? '문의' : `${feeLabel} / 1개월`
        )}

        {renderInfoRow('등록 인원', memberCount == null ? '-' : `${memberCount}명`)}

        {membershipExpireDate && renderInfoRow('구독 만료일', membershipExpireDate)}

        {renderInfoRow(
          '카드',
          hasCard ? `${billingCardName || '-'} ${billingCardNo || ''}`.trim() || '-' : '미등록'
        )}

        {billingAmount && (
          <Stack direction="row" spacing={2} alignItems="center">
            <Typography variant="subtitle2" sx={{ fontWeight: 600, minWidth: 130 }}>
              결제 승인 금액
            </Typography>
            <Typography variant="body2">{`₩${formatPrice(Number(billingAmount))}`}</Typography>
          </Stack>
        )}
      </Stack>

      <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ mt: 3 }}>
        {onDeleteCard && hasCard && (
          <Button variant="outlined" color="error" onClick={onDeleteCard} disabled={isDeleting}>
            {isDeleting ? '삭제 중...' : '결제수단 삭제'}
          </Button>
        )}
      </Stack>
    </Box>
  );
}
