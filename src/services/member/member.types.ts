// 회원 조회 API 타입 정의

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

// 회원 조회 응답
export type GetMembersResponse = BaseResponseDto<{
  members: Member[];
  total: number;
  page: number;
  pageSize: number;
}>;
