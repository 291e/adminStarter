// 회원 API 타입 정의

import type { BaseResponseDto } from '../common';

export type MemberStatus = 'active' | 'inactive' | 'pending';

export type SearchingKey =
  | 'memberId'
  | 'memberEmail'
  | 'memberName'
  | 'memberPhone'
  | 'memberAddress'
  | 'memberAddressDetail';

export type SortBy = 'createAt';

export type SortOrder = 'DESC' | 'ASC';

// 회원 조회 요청 파라미터
export type GetMembersParams = {
  filterMemberIndexes?: string; // memberIndexes
  filterMemberStatuses?: string; // statuses
  searchingDateKey?: string; // createAt
  searchingStartDate?: string; // YYYY-MM-DD
  searchingEndDate?: string; // YYYY-MM-DD
  searchingKey?: SearchingKey;
  searchingVal?: string;
  sortBy?: SortBy;
  sortOrder?: SortOrder;
  page: number;
  pageSize: number;
};

// 회원 정보
export type Member = {
  memberIndex: number;
  memberId: string;
  memberEmail: string;
  memberName: string;
  memberPhone: string;
  memberAddress: string;
  memberAddressDetail?: string;
  status: MemberStatus;
  createAt: string;
  // ... 기타 필드
};

// 회원 생성 요청
export type CreateMemberDto = {
  memberId: string;
  password: string;
  memberName: string;
  memberEmail: string;
  memberPhone: string;
  memberAddress?: string;
  memberAddressDetail?: string;
  companyIdx?: number;
  branchIdx?: number;
  role?: string;
};

// 회원 생성 응답
export type CreateMemberResponse = BaseResponseDto<{
  memberIndex: number;
  memberId: string;
}>;

// 회원 조회 응답
export type GetMembersResponse = BaseResponseDto<{
  members: Member[];
  total: number;
  page: number;
  pageSize: number;
}>;

// 내 정보 조회 응답
export type GetMyInfoResponse = BaseResponseDto<Member>;

// 내 정보 수정 요청
export type UpdateMyInfoDto = {
  memberName?: string;
  memberEmail?: string;
  memberPhone?: string;
  memberAddress?: string;
  memberAddressDetail?: string;
  password?: string;
};

// 내 정보 수정 응답
export type UpdateMyInfoResponse = BaseResponseDto<Member>;

// 회원 수정 요청
export type UpdateMemberDto = {
  memberName?: string;
  memberEmail?: string;
  memberPhone?: string;
  memberAddress?: string;
  memberAddressDetail?: string;
  status?: MemberStatus;
  role?: string;
};

// 회원 수정 응답
export type UpdateMemberResponse = BaseResponseDto<Member>;

// 메시지 전송 요청
export type SendMessageDto = {
  memberIndexes: number[];
  message: string;
};

// 챗봇 메시지 전송 요청
export type SendChatbotMessageDto = {
  memberIndexes: number[];
  message: string;
};

// 구조신호/대피신호 전송 요청
export type SendHelpMessageDto = {
  memberIndexes: number[];
  messageType: 'rescue' | 'evacuation';
  location?: {
    latitude: number;
    longitude: number;
  };
};

// FCM 토큰 업데이트 요청
export type UpdateFcmTokenDto = {
  fcmToken: string;
};

// 푸시 알림 설정 업데이트 요청
export type UpdatePushSettingsDto = {
  isEnabled: boolean;
  notificationTypes?: string[];
};
