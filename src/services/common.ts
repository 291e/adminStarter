// 공통 타입 정의

// BaseResponseDto 구조
export type BaseResponseHeader = {
  isSuccess: boolean;
  resultCode: string;
  resultMessage: string;
  timestamp: string;
};

export type BaseResponseDto<T = unknown> = {
  header: BaseResponseHeader;
  body?: T;
};

