// 회원 API 타입 정의

import type { BaseResponseDto } from '../common';

export type MemberStatus = 'ACTIVE' | 'INACTIVE';

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
  memberIdx: number;
  memberStatus: MemberStatus;
  memberRole: 'OPERATOR_MANAGER' | 'MANAGEMENT_SUPERVISOR' | 'SAFETY_MANAGER' | 'WORKER';
  workType: 'PRODUCTION' | 'OFFICE' | null;
  memberThumbnail: string | null;
  memberId: string;
  memberEmail: string;
  memberName: string;
  memberNameOrg: string | null;
  memberPhone: string;
  memberAddress: string | null;
  memberAddressDetail: string | null;
  memberLang: string | null;
  lastSigninAt: string | null;
  joinedAt: string | null;
  companyIdx: number | null;
  companyBranchIdx: number | null;
  deviceGubun: string | null;
  fcmToken: string | null;
  isPushEnabled: number; // 0 or 1
  memberlat: number | null;
  memberlng: number | null;
  lastLocationUpdateAt: string | null;
  createAt: string;
  updateAt: string;
  deletedAt: string | null;
  position: string | null; // 직급 (과장, 대리 등)
  department: string | null; // 소속 (생산 1팀, 영업 2팀 등)
  isSuperAdmin?: boolean; // 슈퍼어드민 여부
};

// 회원 생성 요청
export type CreateMemberDto = {
  memberId: string; // 필수
  password: string; // 필수, maxLength: 100
  memberStatus?: 'ACTIVE' | 'INACTIVE';
  memberRole?: 'OPERATOR_MANAGER' | 'MANAGEMENT_SUPERVISOR' | 'SAFETY_MANAGER' | 'WORKER';
  memberThumbnail?: string; // 썸네일 이미지 경로
  memberEmail?: string;
  memberName?: string;
  memberPhone?: string;
  memberAddress?: string;
  memberAddressDetail?: string;
  memberMemo?: string; // 메모
  companyIdx?: number;
  companyBranchIdx?: number;
};

// 회원 생성 응답
export type CreateMemberResponse = BaseResponseDto<{
  memberIdx: number;
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
  memberThumbnail?: string; // 썸네일 이미지 경로
  memberName?: string;
  memberNameOrg?: string; // 원어이름
  memberPhone?: string;
  memberAddress?: string;
  memberAddressDetail?: string;
  memberMemo?: string; // 메모
  memberLang?: string; // 언어
  memberlat?: number; // 위치 정보 위도
  memberlng?: number; // 위치 정보 경도
  lastLocationUpdateAt?: string; // 위치 정보 마지막 업데이트 시간
  newPassword?: string; // 새 패스워드, minLength: 4, maxLength: 25
  currentPassword?: string; // 현재 패스워드 (패스워드 변경 시 필수)
};

// 내 정보 수정 응답
export type UpdateMyInfoResponse = BaseResponseDto<Member>;

// 회원 수정 요청
export type UpdateMemberDto = {
  memberId: string; // 필수
  memberName?: string;
  memberEmail?: string;
  memberPhone?: string;
  memberAddress?: string;
  memberAddressDetail?: string;
  position?: string; // 직급 (과장, 대리 등)
  department?: string; // 소속 (생산 1팀, 영업 2팀 등)
  memberStatus?: 'ACTIVE' | 'INACTIVE';
  memberRole?: 'OPERATOR_MANAGER' | 'MANAGEMENT_SUPERVISOR' | 'SAFETY_MANAGER' | 'WORKER';
  memberThumbnail?: string; // 썸네일 이미지 경로
  password?: string; // maxLength: 100
  companyIdx?: number;
  companyBranchIdx?: number;
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
