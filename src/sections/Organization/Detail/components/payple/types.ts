// 페이플 SDK 타입 정의 (Payple3 문서 기준)
export type PaypleCallbackParams = {
  PCD_PAY_RESULT: string;
  PCD_PAY_MSG?: string;
  PCD_PAYER_ID?: string; // 빌링키 (정기결제용)
  PCD_PAY_OID?: string;
  PCD_PAY_TOTAL?: string;
  PCD_PAY_CARDNAME?: string;
  PCD_PAY_CARDNUM?: string;
  [key: string]: any;
};

export type PaypleConfig = {
  clientKey: string;
  PCD_PAY_TYPE: string;
  PCD_PAY_WORK: string;
  PCD_CARD_VER?: string;
  PCD_PAY_GOODS?: string;
  PCD_PAY_TOTAL?: number;
  PCD_RST_URL?: string;
  callbackFunction?: (params: PaypleCallbackParams) => void;
};

// 전역 Window 타입 확장
declare global {
  interface Window {
    PaypleCpayAuthCheck?: (config: PaypleConfig) => void;
    $?: any; // jQuery
    jQuery?: any; // jQuery
  }
}

