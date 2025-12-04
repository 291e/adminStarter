import { useEffect, useState } from 'react';

// ----------------------------------------------------------------------

type PaypleSdkLoaderProps = {
  onLoad?: () => void;
};

/**
 * 페이플 SDK를 동적으로 로드하는 컴포넌트
 */
export function PaypleSdkLoader({ onLoad }: PaypleSdkLoaderProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // 페이플 SDK가 이미 로드되어 있는지 확인
    if (window.PaypleCpayAuthCheck) {
      setIsLoaded(true);
      onLoad?.();
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
            setIsLoaded(true);
            onLoad?.();
            clearInterval(checkInterval);
          }
        }, 100);
        return;
      }

      const script = document.createElement('script');
      script.src =
        import.meta.env.VITE_PAYPLE_SDK_URL ||
        (import.meta.env.DEV
          ? 'https://democpay.payple.kr/js/v1/payment.js' // 테스트 환경
          : 'https://cpay.payple.kr/js/v1/payment.js'); // 운영 환경
      script.async = true;
      script.onload = () => {
        // SDK 로드 완료 후 약간의 지연을 두고 확인
        setTimeout(() => {
          if (window.PaypleCpayAuthCheck) {
            console.log('페이플 SDK 로드 성공');
            setIsLoaded(true);
            onLoad?.();
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
  }, [onLoad]);

  // 컴포넌트는 UI를 렌더링하지 않음
  return null;
}

