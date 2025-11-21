// 조직 관리 API 타입 정의

import type { BaseResponseDto } from '../common';

// ----------------------------------------------------------------------

// 조직 상태
export type OrganizationStatus = 'active' | 'inactive';

// 조직 조회 요청 파라미터
export type GetOrganizationsParams = {
  status?: OrganizationStatus;
  searchKey?: string;
  searchValue?: string;
  page: number;
  pageSize: number;
};

// 조직 정보
export type Organization = {
  id: string;
  companyIdx: number;
  companyName: string;
  companyType?: string;
  businessNumber?: string;
  representativeName?: string;
  representativePhone?: string;
  representativeEmail?: string;
  businessType?: string;
  businessCategory?: string;
  address?: string;
  addressDetail?: string;
  manager?: string;
  status: OrganizationStatus;
  registrationDate: string;
  // ... 기타 필드
};

// 조직 조회 응답
export type GetOrganizationsResponse = BaseResponseDto<{
  organizations: Organization[];
  total: number;
  page: number;
  pageSize: number;
}>;

// 조직 등록 요청 파라미터
export type CreateOrganizationParams = {
  division: string; // 구분
  companyName: string; // 조직명
  companyType?: string; // 사업자 유형
  businessNumber?: string; // 사업자 번호
  representativeName: string; // 대표자명
  representativePhone: string; // 대표 전화번호
  representativeEmail: string; // 대표 이메일
  businessType?: string; // 업태
  businessCategory?: string; // 종목
  address?: string; // 사업장 주소
  addressDetail?: string; // 상세주소
  manager: string; // 담당자
  subscriptionService?: string; // 구독 서비스
  sendInviteEmail?: boolean; // 초대 이메일 발송
};

// 조직 등록 응답
export type CreateOrganizationResponse = BaseResponseDto<{
  organization: Organization;
}>;

// 조직 수정 요청 파라미터
export type UpdateOrganizationParams = Partial<CreateOrganizationParams>;

// 조직 수정 응답
export type UpdateOrganizationResponse = BaseResponseDto<{
  organization: Organization;
}>;

// 조직 삭제 응답
export type DeleteOrganizationResponse = BaseResponseDto;

// 조직 상세 조회 요청 파라미터
export type GetOrganizationDetailParams = {
  companyIdx: number;
};

// 멤버 정보
export type Member = {
  id: string;
  memberIdx: number;
  order: number; // 순번
  name: string;
  email: string;
  phone?: string;
  role?: string;
  status: 'active' | 'inactive';
  // ... 기타 필드
};

// 조직 상세 정보
export type OrganizationDetail = {
  organization: Organization;
  members: Member[];
};

// 조직 상세 조회 응답
export type GetOrganizationDetailResponse = BaseResponseDto<OrganizationDetail>;

// 지사 생성 요청
export type CreateBranchParams = {
  branchName: string;
  address?: string;
  addressDetail?: string;
  manager?: string;
  phone?: string;
};

// 지사 생성 응답
export type CreateBranchResponse = BaseResponseDto<{
  branchIdx: number;
  branchName: string;
}>;

// 지사 목록 조회 파라미터
export type GetBranchesParams = {
  page?: number;
  pageSize?: number;
};

// 지사 정보
export type Branch = {
  branchIdx: number;
  branchName: string;
  address?: string;
  addressDetail?: string;
  manager?: string;
  phone?: string;
  createdAt: string;
};

// 지사 목록 조회 응답
export type GetBranchesResponse = BaseResponseDto<{
  branches: Branch[];
  total: number;
}>;

// 지사 수정 요청
export type UpdateBranchParams = Partial<CreateBranchParams>;

// 지사 수정 응답
export type UpdateBranchResponse = BaseResponseDto<Branch>;

// 구독 목록 조회 파라미터
export type GetSubscriptionsParams = {
  page?: number;
  pageSize?: number;
};

// 구독 정보
export type Subscription = {
  subscriptionId: string;
  servicePlanId: string;
  servicePlanName: string;
  status: 'active' | 'cancelled' | 'expired';
  startDate: string;
  endDate?: string;
};

// 구독 목록 조회 응답
export type GetSubscriptionsResponse = BaseResponseDto<{
  subscriptions: Subscription[];
  total: number;
}>;

// 서비스 구독 요청
export type SubscribeParams = {
  servicePlanId: string;
};

// 서비스 구독 응답
export type SubscribeResponse = BaseResponseDto<Subscription>;

// 구독 취소 요청
export type CancelSubscriptionParams = {
  companyIdx: number;
  subscriptionId: string;
};

// 서비스 업그레이드 요청 파라미터
export type UpgradeServiceParams = {
  servicePlanId: string;
};

// 서비스 업그레이드 응답
export type UpgradeServiceResponse = BaseResponseDto<Subscription>;

// 카드 액션 타입
export type CardActionType = 'setPrimary' | 'edit' | 'delete';

// 카드 액션 요청 파라미터
export type CardActionParams = {
  action: CardActionType;
  cardData?: unknown; // 카드 정보 (수정 시)
};

// 카드 액션 응답
export type CardActionResponse = BaseResponseDto;

// 무재해 인증 정보 수정 요청
export type UpdateAccidentFreeParams = {
  accidentFreeDays?: number;
  certificationDate?: string;
  certificationNumber?: string;
};

// 조직원 초대 요청
export type InviteMemberParams = {
  email: string;
  role?: string;
};

// 조직원 초대 응답
export type InviteMemberResponse = BaseResponseDto<{
  invitationLink: string;
  invitationCode: string;
}>;

// 초대 수락 요청
export type AcceptInvitationParams = {
  link?: string;
  code?: string;
  password: string;
  memberName: string;
  memberNameOrg: string;
};

// 초대 수락 응답
export type AcceptInvitationResponse = BaseResponseDto<{
  memberIndex: number;
  memberId: string;
  accessToken: string;
  refreshToken: string;
}>;

// 회사/지점별 역할별 멤버 조회 파라미터
export type GetCompanyMembersParams = {
  branchIdx?: number;
  role?: string;
  page?: number;
  pageSize?: number;
};

// 회사/지점별 역할별 멤버 조회 응답
export type GetCompanyMembersResponse = BaseResponseDto<{
  members: Member[];
  total: number;
}>;
