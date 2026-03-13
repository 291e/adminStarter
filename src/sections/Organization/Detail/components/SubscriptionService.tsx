import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';

import { useCallback, useMemo, useState } from 'react';
import { useParams } from 'react-router';

import { CONFIG } from 'src/global-config';
import { useMyInfo } from 'src/sections/Chat/hooks/use-my-info';
import {
  useCreateBillingKey,
  useDeleteBillingKey,
  useDeleteBillingKeyForAdmin,
  usePaymentHistory,
} from '../../hooks/use-payment-api';
import { useCurrentSubscription } from '../../hooks/use-organization-api';
import type { Organization } from 'src/services/organization/organization.types';
import { PaypleSdkLoader } from './payple/PaypleSdkLoader';
import { usePaypleCardRegister } from './payple/usePaypleCardRegister';
import { PaymentInfo } from './PaymentInfo';
import PaymentHistoryTable, { type PaymentHistoryItem } from './PaymentHistoryTable';
import PaymentHistoryPagination from './PaymentHistoryPagination';
import type { PaypleCallbackParams } from './payple/types';
import { Iconify } from 'src/components/iconify';
import type { GetCurrentSubscriptionResponse } from 'src/services/organization/organization.types';

// ----------------------------------------------------------------------

type ParsedBillingInfo = {
  cardName?: string;
  cardNo?: string;
  orderNo?: string;
  amount?: string;
  payer?: string;
  billingAddress?: string;
  billingContact?: string;
  paymentMethod?: string;
  [key: string]: unknown;
};

type CurrentSubscriptionPayload = NonNullable<GetCurrentSubscriptionResponse['body']>;

type Props = {
  organizationId?: string;
  organization?: Organization | null;
  memberCount?: number;
};

const parseBillingInfo = (value?: string | null): ParsedBillingInfo | null => {
  if (!value) {
    return null;
  }

  if (typeof value === 'object' && value !== null) {
    return value as ParsedBillingInfo;
  }

  try {
    return JSON.parse(value) as ParsedBillingInfo;
  } catch {
    return { rawValue: value };
  }
};

const toStr = (value: unknown): string | undefined => {
  if (value === null || value === undefined) {
    return undefined;
  }
  const next = String(value).trim();
  return next.length > 0 ? next : undefined;
};

const pickString = (rawValue: unknown, keys: string[]): string | undefined => {
  if (!rawValue || typeof rawValue !== 'object') {
    return undefined;
  }

  const raw = rawValue as Record<string, unknown>;
  const lowerMap = new Map<string, string>();
  Object.keys(raw).forEach((key) => {
    lowerMap.set(key.toLowerCase(), key);
  });

  for (const key of keys) {
    const directValue = toStr(raw[key]);
    if (directValue) {
      return directValue;
    }

    const targetKey = lowerMap.get(key.toLowerCase());
    if (targetKey) {
      const fallbackValue = toStr(raw[targetKey]);
      if (fallbackValue) {
        return fallbackValue;
      }
    }
  }

  return undefined;
};

const parsePaymentInfo = (input: unknown) => {
  const raw = input && typeof input === 'object' ? (input as Record<string, unknown>) : {};

  return {
    payer: pickString(raw, ['payer', 'payerName', 'memberName', 'name']),
    billingAddress: pickString(raw, [
      'billingAddress',
      'address',
      'billingAddr',
      'billing_address',
    ]),
    billingContact: pickString(raw, ['billingContact', 'contact', 'phone', 'telephone']),
    paymentMethod: pickString(raw, ['paymentMethod', 'payMethod', 'method', 'billingType']),
    serviceName: pickString(raw, ['serviceName', 'service', 'planName']),
  };
};

const extractPaymentDate = (payment: any) =>
  payment.paymentDate ||
  payment.paymentRequestDate ||
  payment.createAt ||
  payment.createAt?.replace('Z', '') ||
  '';

export default function SubscriptionService({ organizationId, organization, memberCount }: Props) {
  const { id } = useParams<{ id: string }>();
  const companyIdx = useMemo(() => {
    const sourceId = organizationId ?? id;
    const parsed = sourceId ? parseInt(sourceId, 10) : 0;
    return Number.isFinite(parsed) ? parsed : 0;
  }, [organizationId, id]);

  const { data: myInfo } = useMyInfo();
  const isSuperAdmin = myInfo?.isSuperAdmin === true;
  const isCurrentCompanyManager = Boolean(
    myInfo?.companyIdx && companyIdx > 0 && myInfo.companyIdx === companyIdx
  );
  const canManageBilling = isSuperAdmin || isCurrentCompanyManager;

  const [paymentHistoryPage, setPaymentHistoryPage] = useState(0);
  const [paymentHistoryRowsPerPage, setPaymentHistoryRowsPerPage] = useState(5);

  // 결제 내역 조회 (모든 데이터를 조회 후 화면에서 페이지네이션)
  const {
    data: paymentHistoryData,
    isLoading: isLoadingPaymentHistory,
    isError: isErrorPaymentHistory,
  } = usePaymentHistory({
    searchingDateKey: 'paymentRequestDate',
    page: 1,
    pageSize: 1000,
  });

  const createBillingKeyMutation = useCreateBillingKey();
  const deleteBillingKeyMutation = useDeleteBillingKey();
  const deleteBillingKeyForAdminMutation = useDeleteBillingKeyForAdmin();

  const billingKey = organization?.companyBillingKey || '';
  const billingType = organization?.companyBillingType || '';
  const billingInfo = parseBillingInfo(organization?.companyBillingInfo || null);
  const membershipExpireDate = organization?.membershipExpireDate || '';

  const { data: currentSubscriptionData } = useCurrentSubscription(companyIdx);
  const currentSubscriptionBody: CurrentSubscriptionPayload | undefined =
    currentSubscriptionData?.body;
  const paymentInfo = parsePaymentInfo(currentSubscriptionBody?.paymentInfo);
  const serviceNameFromSubscription = toStr(
    pickString(currentSubscriptionBody?.subscription || null, [
      'servicePlanName',
      'planName',
      'serviceName',
    ])
  );

  const resolvedServiceName = serviceNameFromSubscription || paymentInfo.serviceName || '미등록';
  const resolvedPayerName =
    paymentInfo.payer || pickString(billingInfo || {}, ['payer', 'payerName']) || '-';
  const resolvedBillingAddress =
    paymentInfo.billingAddress ||
    pickString(billingInfo || {}, ['billingAddress', 'billingAddress1']) ||
    '-';
  const resolvedBillingContact =
    paymentInfo.billingContact ||
    pickString(billingInfo || {}, ['billingContact', 'billingPhone', 'payerPhone', 'contact']) ||
    '-';
  const resolvedPaymentMethod =
    paymentInfo.paymentMethod ||
    pickString(billingInfo || {}, ['paymentMethod', 'cardType', 'payMethod']) ||
    billingType ||
    '카드';

  const estimatedMonthlyFee = useMemo(() => {
    if (typeof memberCount !== 'number' || Number.isNaN(memberCount)) {
      return null;
    }
    if (memberCount >= 50) {
      return null;
    }
    return Math.max(0, memberCount) * 15_000;
  }, [memberCount]);

  const isCardRegistered = Boolean(
    billingKey || organization?.companyBillingInfo || billingType || paymentInfo.paymentMethod
  );

  const paymentHistory: PaymentHistoryItem[] = useMemo(() => {
    let paymentList: any[] = [];
    const historyInfo: any = paymentHistoryData as any;

    if (Array.isArray(historyInfo?.data)) {
      paymentList = historyInfo.data;
    } else if (Array.isArray(historyInfo?.paymentList)) {
      paymentList = historyInfo.paymentList;
    } else if (Array.isArray(historyInfo)) {
      paymentList = historyInfo;
    } else if (historyInfo && typeof historyInfo === 'object') {
      const numericKeys = Object.keys(historyInfo)
        .filter((key) => !isNaN(Number(key)))
        .sort((a, b) => Number(a) - Number(b));

      if (numericKeys.length > 0) {
        paymentList = numericKeys.map((key) => historyInfo[key]);
      }
    }

    const historyForCompany = paymentList.filter((payment) =>
      !companyIdx ? true : Number(payment.companyIdx) === Number(companyIdx)
    );

    return historyForCompany
      .map((payment: any, index: number) => {
        const finalAmount = Number(payment.paymentAmount || payment.paymentRequestAmount || 0);
        const paymentStatus = payment.paymentStatus || payment.status || '';

        let status: PaymentHistoryItem['status'] = 'PENDING';
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

        let paymentMethod = '미등록';
        if (payment.paypleResponse) {
          try {
            const paypleData = JSON.parse(payment.paypleResponse);
            if (paypleData.PCD_PAY_TYPE === 'card') {
              paymentMethod = paypleData.PCD_PAY_CARDNAME || '카드결제';
            } else if (paypleData.PCD_PAY_TYPE === 'transfer') {
              paymentMethod = '계좌이체';
            }
          } catch {
            // 파싱 실패 시 기본값 사용
          }
        }

        if (paymentMethod === '미등록') {
          if (payment.paymentMethod === 'card' || payment.paymentMethod === 'CARD') {
            paymentMethod = '카드결제';
          } else if (payment.paymentMethod === 'transfer' || payment.paymentMethod === 'TRANSFER') {
            paymentMethod = '계좌이체';
          }
        }

        const paymentDate = extractPaymentDate(payment);
        const paymentNumber = payment.paymentId || String(payment.paymentIdx || index + 1);
        const serviceName = payment.serviceName || '구독 요금';

        let receiptUrl = payment.paypleReceipt;
        if (!receiptUrl && payment.paypleResponse) {
          try {
            receiptUrl = JSON.parse(payment.paypleResponse).PCD_PAY_CARDRECEIPT;
          } catch {
            // noop
          }
        }

        return {
          id: payment.paymentIdx ?? paymentNumber,
          order: 0,
          paymentDate,
          paymentNumber,
          serviceName,
          amount: finalAmount,
          paymentMethod,
          status,
          receiptUrl,
        };
      })
      .sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime())
      .map((row, idx) => ({
        ...row,
        order: idx + 1,
      }));
  }, [companyIdx, paymentHistoryData]);

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

  const deleteBilling = useCallback(async () => {
    if (!companyIdx || !canManageBilling || !isCardRegistered) {
      return;
    }

    const message = isCardRegistered
      ? '등록된 결제 수단을 삭제하시겠습니까?'
      : '등록된 결제 수단이 없습니다.';
    if (!window.confirm(message)) {
      return;
    }

    if (isSuperAdmin) {
      await deleteBillingKeyForAdminMutation.mutateAsync({ companyIdx });
    } else {
      await deleteBillingKeyMutation.mutateAsync();
    }
  }, [
    canManageBilling,
    companyIdx,
    deleteBillingKeyForAdminMutation,
    deleteBillingKeyMutation,
    isCardRegistered,
    isSuperAdmin,
  ]);

  const handlePaypleSuccess = useCallback(
    async (params: PaypleCallbackParams) => {
      const billingKeyValue = params.PCD_PAYER_ID || '';
      const cardName = params.PCD_PAY_CARDNAME || '';
      const cardNo = params.PCD_PAY_CARDNUM || '';
      const payer = toStr(
        params.PCD_PAYER_NAME || params.PCD_BUYER_NAME || params.PCD_ORDER_NAME || params.PCD_NAME
      );
      const address = toStr(
        params.PCD_PAYER_ADDR || params.PCD_BUYER_ADDR || params.PCD_ADDRESS || params.PCD_BUYER_ZIP
      );
      const contact = toStr(
        params.PCD_PAYER_TEL ||
          params.PCD_BUYER_TEL ||
          params.PCD_PAYER_PHONE ||
          params.PCD_BUYER_PHONE
      );

      if (!billingKeyValue) {
        throw new Error('빌링키를 받지 못했습니다.');
      }

      const memberBillingInfo = {
        cardName,
        cardNo,
        orderNo: params.PCD_PAY_OID || '',
        amount: params.PCD_PAY_TOTAL || '0',
        payer,
        billingAddress: address,
        billingContact: contact,
        paymentMethod: billingType || 'CARD',
        raw: {
          payMethod: params.PCD_PAY_METHOD || '',
        },
      };

      await createBillingKeyMutation.mutateAsync({
        PCD_PAYER_ID: billingKeyValue,
        memberBillingType: 'card',
        memberBillingInfo: JSON.stringify(memberBillingInfo),
      });

      if (import.meta.env.DEV) {
        console.log('✅ [빌링키 등록 성공]', {
          companyIdx,
          billingKey: billingKeyValue,
          memberBillingInfo,
        });
      }
    },
    [billingType, companyIdx, createBillingKeyMutation]
  );

  const { handleAddCard } = usePaypleCardRegister({
    companyIdx,
    clientKey: CONFIG.payple.clientKey,
    onSuccess: handlePaypleSuccess,
  });

  if (isLoadingPaymentHistory) {
    return (
      <Box sx={{ p: 3 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: 360,
          }}
        >
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  if (isErrorPaymentHistory) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">결제 내역 조회에 실패했습니다.</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <PaypleSdkLoader />

      <Box sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>
          요금/결제 정보
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          50인 미만 사업장은 1인당 15,000원으로 자동 산정됩니다.
        </Typography>

        <PaymentInfo
          organizationName={organization?.companyName || '-'}
          memberCount={memberCount}
          estimatedMonthlyFee={estimatedMonthlyFee}
          hasCard={isCardRegistered}
          billingType={billingType || '미등록'}
          billingCardName={billingInfo?.cardName}
          billingCardNo={billingInfo?.cardNo}
          billingAmount={billingInfo?.amount}
          membershipExpireDate={membershipExpireDate}
          activeService={resolvedServiceName}
          payerName={resolvedPayerName}
          billingAddress={resolvedBillingAddress}
          billingContact={resolvedBillingContact}
          paymentMethodLabel={resolvedPaymentMethod}
          onDeleteCard={canManageBilling ? deleteBilling : undefined}
          isDeleting={
            deleteBillingKeyMutation.isPending || deleteBillingKeyForAdminMutation.isPending
          }
        />
      </Box>

      <Divider />

      <Box sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2.5 }}>
          <Stack direction="row" spacing={0.5} alignItems="center">
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              결제 카드 등록
            </Typography>
            <Tooltip
              arrow
              placement="top"
              title={
                <Stack spacing={0.5} sx={{ maxWidth: 260, whiteSpace: 'pre-line' }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    카드 등록 안내
                  </Typography>
                  <Typography variant="caption">
                    최초 카드 등록 시 결제 전에 카드 유효성(한도, 잔액, 유효기간 등)을 먼저
                    확인합니다.
                  </Typography>
                  <Typography variant="caption">
                    100원 승인(실제 결제 전 소액 승인) 후 100원 취소(승인 취소)가 진행됩니다.
                  </Typography>
                </Stack>
              }
            >
              <span>
                <IconButton size="small" sx={{ p: 0.2 }}>
                  <Iconify icon="solar:info-circle-bold" width={18} />
                </IconButton>
              </span>
            </Tooltip>
          </Stack>
          <Button
            variant="text"
            size="small"
            onClick={handleAddCard}
            disabled={createBillingKeyMutation.isPending}
          >
            {isCardRegistered ? '카드 변경' : '카드 등록'}
          </Button>
        </Stack>

        {isCardRegistered ? (
          <Box
            sx={{
              p: 2.5,
              borderRadius: 2,
              background: 'linear-gradient(135deg, #1d2939 0%, #0b1220 45%, #020617 100%)',
              color: 'white',
              maxWidth: 420,
              boxShadow: '0 8px 24px rgba(2, 6, 23, 0.3)',
            }}
          >
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mb: 2 }}
            >
              <Typography variant="subtitle2" sx={{ opacity: 0.85 }}>
                등록된 카드
              </Typography>
              <Typography
                variant="caption"
                sx={{ bgcolor: 'rgba(255,255,255,0.18)', px: 1, py: 0.4, borderRadius: 1 }}
              >
                활성
              </Typography>
            </Stack>
            <Typography variant="subtitle2" sx={{ opacity: 0.75, letterSpacing: 0.4 }}>
              {billingInfo?.cardName || resolvedPaymentMethod}
            </Typography>
            <Typography variant="h6" sx={{ mt: 1.5, mb: 0.5, letterSpacing: 1.4 }}>
              {billingInfo?.cardNo || '카드 번호 미등록'}
            </Typography>
            {resolvedPayerName !== '-' && (
              <Typography variant="body2" sx={{ opacity: 0.85 }}>
                {resolvedPayerName}
              </Typography>
            )}
            <Typography variant="body2" sx={{ mt: 0.75, opacity: 0.8 }}>
              결제 수단: {resolvedPaymentMethod}
            </Typography>
          </Box>
        ) : (
          <Alert severity="info">등록된 카드가 없습니다. 카드 등록 버튼을 눌러 등록해주세요.</Alert>
        )}
      </Box>

      <Divider />

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
