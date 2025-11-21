// Sign (인증) API 타입 정의

import type { BaseResponseDto } from '../common';

// 초대 링크/코드 검증 요청
export type InvitationDto = {
  link?: string;
  code?: string;
};

// 초대 검증 응답
export type InvitationResponseDto = BaseResponseDto<{
  companyName: string;
  companyIdx: number;
  isValid: boolean;
}>;

// 회원가입 요청
export type SignUpDto = {
  link: string;
  code: string;
  password: string;
  memberName: string;
  memberNameOrg: string;
};

// 회원가입 응답 (실제 응답 구조)
export type SignUpResponseDto = BaseResponseDto<{
  data: {
    memberIndex: number;
    memberId: string;
    accessToken: string;
    refreshToken: string;
  };
}>;

// 로그인 요청
export type SignInDto = {
  memberId: string;
  password: string;
};

// 로그인 응답 (실제 응답 구조 - 여러 가능성 고려)
export type SignInResponseDto = BaseResponseDto<{
  data?: {
    accessToken: string;
    firebaseToken?: string;
    member?: {
      memberIdx: number;
      memberStatus: string;
      memberRole: string;
      memberThumbnail?: string;
      memberId: string;
      // ... 기타 필드
    };
    memberIdx?: number;
    body?: {
      data?: {
        accessToken: string;
        firebaseToken?: string;
        member?: {
          memberIdx: number;
          memberStatus: string;
          memberRole: string;
          memberThumbnail?: string;
          memberId: string;
        };
        memberIdx?: number;
      };
    };
  };
  // 또는 직접 접근 가능한 경우
  accessToken?: string;
}>;

// 로그아웃 응답
export type SignOutResponseDto = BaseResponseDto<{
  success: boolean;
}>;
