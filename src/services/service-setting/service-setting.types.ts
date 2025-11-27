import type { BaseResponseDto, BaseResponseHeader } from '../common';

export type ServiceStatus = 'ACTIVE' | 'INACTIVE';

// 구독한 회사 정보
export type SubscribedCompany = {
  companyIdx: number;
  companyName: string;
  subscribedAt: string;
  subscriptionStatus: 'ACTIVE' | 'CANCELLED';
};

// 서비스 설정 정보 (ServiceSettingItem)
export type ServiceSetting = {
  serviceSettingIdx?: number; // API 경로에서 사용
  serviceName: string;
  servicePeriod?: number; // 서비스 기간 (개월 수, 예: 1, 3, 6, 12)
  memberCount: number;
  monthlyFee: number;
  subscriptions: number;
  status: ServiceStatus;
  createAt: string;
  updateAt: string;
  subscribedCompanies: SubscribedCompany[];
};

// 서비스 목록 조회 파라미터
export type GetServicesParams = {
  page?: number;
  pageSize?: number;
  status?: 'ACTIVE' | 'INACTIVE';
  search?: string; // 검색어 (서비스명)
};

// 서비스 목록 조회 응답 (axios interceptor가 평탄화한 형태)
export type GetServicesResponse = {
  serviceSettingList: ServiceSetting[];
  totalCount: number;
  header: BaseResponseHeader;
};

// 서비스 상세 조회 파라미터
export type GetServiceDetailParams = {
  serviceSettingIdx: number;
};

// 서비스 상세 조회 응답
export type GetServiceDetailResponse = BaseResponseDto<ServiceSetting>;

// 서비스 등록 파라미터
export type CreateServiceParams = {
  serviceName: string;
  servicePeriod: number;
  memberCount: number;
  monthlyFee: number;
};

// 서비스 등록 응답
export type CreateServiceResponse = BaseResponseDto<ServiceSetting>;

// 서비스 수정 파라미터
export type UpdateServiceParams = {
  serviceSettingIdx: number;
  serviceName?: string;
  servicePeriod?: number;
  memberCount?: number;
  monthlyFee?: number;
  status?: ServiceStatus;
};

// 서비스 수정 응답
export type UpdateServiceResponse = BaseResponseDto<ServiceSetting>;

// 서비스 비활성화 파라미터
export type DeactivateServiceParams = {
  serviceSettingIdx: number;
};

// 서비스 비활성화 응답
export type DeactivateServiceResponse = BaseResponseDto;

// 서비스 삭제 파라미터
export type DeleteServiceParams = {
  serviceSettingIdx: number;
};

// 서비스 삭제 응답
export type DeleteServiceResponse = BaseResponseDto;
