// 조직 관리 API 타입 정의

import type { BaseResponseDto } from '../common';

// ----------------------------------------------------------------------

// 조직 상태
export type OrganizationStatus = 'active' | 'inactive';

// 조직 구분 (companyType)
export type CompanyType =
  | 'OPERATOR'
  | 'MEMBER'
  | 'DISTRIBUTOR'
  | 'AGENCY'
  | 'DEALER'
  | 'NON_MEMBER';

// 담당자 정보
export type ManagerInfo = {
  memberIdx: number;
  memberName: string;
  memberEmail: string;
  memberPhone: string;
};

// 조직 조회 요청 파라미터
export type GetOrganizationsParams = {
  status?: OrganizationStatus;
  companyType?: CompanyType; // 조직 구분 필터
  searchKey?: string;
  searchValue?: string;
  startDate?: string; // 시작일 필터 (YYYY-MM-DD)
  endDate?: string; // 종료일 필터 (YYYY-MM-DD)
  page: number;
  pageSize: number;
};

export type AccidentFreeInformation = {
  isAccidentFreeWorksite: 0 | 1;
  accidentFreeStatus: string;
  accidentFreeCertifiedAt?: string | null;
  accidentFreeExpiresAt?: string | null;
  accidentFreeFileUrl?: string | null;
};

// 조직 정보
export type Organization = {
  id?: string;
  companyIdx: number;
  companyName: string;
  companyType?: CompanyType; // enum: OPERATOR, MEMBER, DISTRIBUTOR, AGENCY, DEALER, NON_MEMBER

  businessNumber?: string;
  representativeName?: string;
  phone?: string; // 전화번호
  email?: string; // 이메일
  businessType?: string | number;
  businessCategory?: string;
  businessItem?: string;
  address?: string;
  addressDetail?: string;
  manager?: ManagerInfo | null; // 담당자 정보 객체 (ADMIN 역할 멤버)
  status: OrganizationStatus;
  createAt?: string; // 등록일
  endedAt?: string | null; // 종료일 (비활성화 시 설정)
  isActive?: number; // API 응답의 isActive 필드 (1: active, 0: inactive)
  isAccidentFreeWorksite?: number; // 무재해 사업장 여부
  accidentFreeStatus?: string; // 무재해 사업장 상태
  accidentFreeCertifiedAt?: string | null; // 무재해 사업장 인증일
  accidentFreeExpiresAt?: string | null; // 무재해 사업장 만료일
  accidentFreeFileUrl?: string | null; // 무재해 인증 파일 URL
  accidentFreeInformation?: AccidentFreeInformation | null;
  // description, memo, deletedAt 필드 제거됨
};

// 조직 조회 응답
export type GetOrganizationsResponse = BaseResponseDto<{
  companyList: Organization[];
  totalCount: number;
  totalPage: number;
}>;

// 조직 등록 요청 파라미터
export type CreateOrganizationParams = {
  companyName: string;
  businessNumber?: string;
  address?: string;
  phone?: string;
  email?: string;
  companyType: CompanyType;
  businessType: number; // 0: 개인사업자, 1: 법인사업자
  representativeName: string;
  businessCategory: string;
  businessItem: string;
  serviceSettingIdxes?: number[]; // 구독 서비스 Index 목록
};

// 조직 등록 응답
export type CreateOrganizationResponse = BaseResponseDto;

// 조직 수정 요청 파라미터
export type UpdateOrganizationParams = {
  companyName?: string;
  businessNumber?: string;
  address?: string;
  phone?: string;
  email?: string;
  companyType?: CompanyType;
  businessType?: number; // 0: 개인사업자, 1: 법인사업자
  representativeName?: string;
  businessCategory?: string;
  businessItem?: string;
  serviceSettingIdxes?: number[]; // 구독 서비스 Index 목록
  isActive?: number; // 0: 비활성, 1: 활성
  isAccidentFreeWorksite?: number; // 0: 아니오, 1: 예
  accidentFreeStatus?: 'PENDING' | 'APPROVED' | 'REJECTED';
  accidentFreeCertifiedAt?: string;
  accidentFreeExpiresAt?: string;
};

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
  subscriptionIdx: number;
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
  companyIdx: number;
  serviceSettingIdx: number; // 서비스 설정 Index (숫자)
  billingKey?: string; // 결제 빌링키 (선택)
  immediateCancel?: boolean; // 즉시 해지 여부 (기본값: false)
};

// 서비스 구독 응답
export type SubscribeResponse = BaseResponseDto<Subscription>;

// 구독 취소 요청
export type CancelSubscriptionParams = {
  companyIdx: number;
  serviceSettingIdx: number;
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

// 서비스 플랜 정보
export type ServicePlan = {
  servicePlanId: string;
  planName: string;
  price: number;
  period: string; // '1개월', '3개월', '6개월', '12개월' 등
  icon?: string;
  isRecommended?: boolean;
};

// 서비스 플랜 목록 조회 응답
export type GetServicePlansResponse = BaseResponseDto<{
  plans: ServicePlan[];
}>;

// 현재 구독 정보 조회 응답
export type GetCurrentSubscriptionResponse = BaseResponseDto<{
  subscription: Subscription | null;
  paymentInfo: {
    serviceName: string;
    payer: string;
    billingAddress: string;
    billingContact: string;
    paymentMethod: string; // 카드 번호 마스킹 (예: '**** **** **** 5678')
  };
}>;

// 등록된 카드 정보
export type RegisteredCard = {
  cardId: string;
  cardType: 'visa' | 'mastercard' | 'amex' | 'other';
  cardNumber: string; // 마스킹된 카드 번호 (예: '**** **** **** 5678')
  isPrimary: boolean;
  billingKey?: string; // 페이플 빌링키
};

// 등록된 카드 목록 조회 응답
export type GetRegisteredCardsResponse = BaseResponseDto<{
  cards: RegisteredCard[];
}>;

// 카드 등록 요청 파라미터 (페이플 콜백 후)
export type RegisterCardParams = {
  billingKey: string;
  orderNo: string;
  amount: string;
  cardName: string;
  cardNo: string;
};

// 카드 등록 응답
export type RegisterCardResponse = BaseResponseDto<RegisteredCard>;

// 무재해 인증 이력 항목
export type AccidentFreeHistoryItem = {
  registeredAt: string; // 등록일 (ISO 문자열)
  certifiedAt: string; // 인증일 (ISO 문자열)
  appliedYear: number; // 신청 연도 (0일 수도 있음)
  fileUrl: string; // 파일 URL
  status: string; // 상태 (PENDING, APPROVED, REJECTED 등)
};

// 무재해 인증 정보 조회 응답
export type GetAccidentFreeResponse = BaseResponseDto<{
  isAccidentFreeWorksite: 0 | 1;
  accidentFreeStatus: string;
  accidentFreeCertifiedAt?: string | null;
  accidentFreeExpiresAt?: string | null;
  accidentFreeFileUrl?: string | null;
  industrialAccidentCount: number;
  nearMissCount: number;
  historyList: AccidentFreeHistoryItem[];
}>;

// 무재해 인증 정보 수정 요청
export type UpdateAccidentFreeParams = {
  accidentFreeStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  accidentFreeCertifiedAt?: string | null;
  accidentFreeExpiresAt?: string | null;
  accidentFreeFileUrl?: string | null;
};

// 조직원 초대 요청
export type InviteMemberParams = {
  email: string;
  memberRole: string;
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
