import type { BaseResponseDto } from '../common';

export type ServiceStatus = 'active' | 'inactive';

export type Service = {
  id: string;
  serviceName: string;
  servicePeriod: string;
  memberCount: number;
  monthlyFee: number;
  status: ServiceStatus;
  registrationDate: string;
};

export type GetServicesParams = {
  status?: ServiceStatus;
  searchKey?: string;
  searchValue?: string;
  page: number;
  pageSize: number;
};

export type GetServicesResponse = BaseResponseDto<{
  services: Service[];
  total: number;
}>;

export type GetServiceDetailParams = {
  id: string;
};

export type GetServiceDetailResponse = BaseResponseDto<Service>;

export type CreateServiceParams = {
  serviceName: string;
  servicePeriod: string;
  memberCount: number;
  monthlyFee: number;
};

export type CreateServiceResponse = BaseResponseDto<Service>;

export type UpdateServiceParams = {
  id: string;
  serviceName?: string;
  servicePeriod?: string;
  memberCount?: number;
  monthlyFee?: number;
  status?: ServiceStatus;
};

export type UpdateServiceResponse = BaseResponseDto<Service>;

export type DeactivateServiceParams = {
  id: string;
};

export type DeactivateServiceResponse = BaseResponseDto;

export type DeleteServiceParams = {
  id: string;
};

export type DeleteServiceResponse = BaseResponseDto;

