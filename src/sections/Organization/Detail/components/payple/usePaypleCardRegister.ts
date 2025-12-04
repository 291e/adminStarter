import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router';
import type { PaypleCallbackParams, PaypleConfig } from './types';

// ----------------------------------------------------------------------

type UsePaypleCardRegisterOptions = {
  companyIdx: number;
  clientKey: string;
  onSuccess?: (params: PaypleCallbackParams) => Promise<void>;
  onError?: (params: PaypleCallbackParams) => void;
};

/**
 * 페이플 카드 등록을 위한 훅
 */
export function usePaypleCardRegister({
  companyIdx,
  clientKey,
  onSuccess,
  onError,
}: UsePaypleCardRegisterOptions) {
  const navigate = useNavigate();
  const [isSdkLoaded, setIsSdkLoaded] = useState(false);

  // 페이플 SDK 로드 확인
  const checkSdkLoaded = useCallback(() => {
    if (window.PaypleCpayAuthCheck) {
      setIsSdkLoaded(true);
      return true;
    }
    return false;
  }, []);

  // 페이플 콜백 함수
  const handlePaypleCallback = useCallback(
    async (params: PaypleCallbackParams) => {
      // 성공 조건:
      // 1. PCD_PAY_RESULT === 'success'
      // 2. "기 인증고객 입니다." 메시지 (이미 빌링키가 등록된 경우)
      // 3. "카드인증완료" 메시지 (카드 인증이 완료된 경우)
      const isAlreadyAuthenticated = params.PCD_PAY_MSG?.includes('기 인증고객');
      const isCardAuthCompleted = params.PCD_PAY_MSG?.includes('카드인증완료');
      const isSuccess =
        params.PCD_PAY_RESULT === 'success' || isAlreadyAuthenticated || isCardAuthCompleted;

      if (isSuccess) {
        // 성공 처리 (정상 성공 또는 이미 인증된 고객)
        if (import.meta.env.DEV) {
          console.log('✅ [페이플 카드 등록 성공]', {
            companyIdx,
            billingKey: params.PCD_PAYER_ID, // PCD_PAYER_ID가 빌링키
            orderNo: params.PCD_PAY_OID,
            amount: params.PCD_PAY_TOTAL,
            cardName: params.PCD_PAY_CARDNAME,
            cardNo: params.PCD_PAY_CARDNUM,
            resultMsg: params.PCD_PAY_MSG,
            isAlreadyAuthenticated,
            isCardAuthCompleted,
            allParams: params, // 디버깅용: 전체 파라미터 확인
          });
        }

        try {
          if (onSuccess) {
            await onSuccess(params);
          }
          if (import.meta.env.DEV) {
            console.log('✅ [카드 등록 API 호출 성공]');
          }
        } catch (error: any) {
          if (import.meta.env.DEV) {
            console.error('❌ [카드 등록 API 호출 실패]', {
              error,
              errorMessage: error?.message,
              errorResponse: error?.response?.data,
            });
          }
          if (onError) {
            onError(params);
          }
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

        if (onError) {
          onError(params);
        }

        if (isCancel) {
          // 취소 시 이전 페이지로 이동
          navigate(-1);
        }
      }
    },
    [companyIdx, navigate, onSuccess, onError]
  );

  // 페이플 창 열기 함수
  const openPaypleWindow = useCallback(() => {
    const paypleConfig: PaypleConfig = {
      clientKey,
      PCD_PAY_TYPE: 'card', // 카드 결제
      PCD_PAY_WORK: 'CERT', // 등록과 동시에 결제 (빌링키를 받기 위해 필요)
      PCD_CARD_VER: '01', // 정기 결제
      PCD_PAY_GOODS: '카드 등록', // 상품명
      PCD_PAY_TOTAL: 100, // 빌링키를 받기 위해 100원 결제 필요
      callbackFunction: handlePaypleCallback, // 콜백 함수로 결과 받기
    };

    try {
      console.log('페이플 카드 등록창 열기:', paypleConfig);
      window.PaypleCpayAuthCheck?.(paypleConfig);
    } catch (error) {
      console.error('페이플 카드 등록창 열기 실패:', error);
    }
  }, [clientKey, handlePaypleCallback]);

  // 카드 추가 핸들러
  const handleAddCard = useCallback(() => {
    if (import.meta.env.DEV) {
      console.log('🔍 [카드 추가 버튼 클릭]', { companyIdx });
    }

    // 페이플 SDK 로드 확인
    if (!checkSdkLoaded()) {
      console.error('페이플 SDK가 로드되지 않았습니다. 잠시 후 다시 시도해주세요.');
      // SDK 로드 재시도
      const checkInterval = setInterval(() => {
        if (checkSdkLoaded()) {
          clearInterval(checkInterval);
          // SDK 로드 완료 후 페이플 창 열기
          openPaypleWindow();
        }
      }, 500);
      // 10초 후 타임아웃
      setTimeout(() => clearInterval(checkInterval), 10000);
      return;
    }

    openPaypleWindow();
  }, [companyIdx, checkSdkLoaded, openPaypleWindow]);

  return {
    isSdkLoaded,
    handleAddCard,
    checkSdkLoaded,
  };
}
