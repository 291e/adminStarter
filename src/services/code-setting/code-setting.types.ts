import type { BaseResponseDto } from '../common';

export type CodeCategory = 'machine' | 'hazard';
export type CodeStatus = 'active' | 'inactive';

export type Code = {
  id: string;
  code: string;
  name: string;
  categoryType: CodeCategory;
  category?: string; // 유해인자용
  status: CodeStatus;
  registrationDate: string;
  // 기계·설비용
  inspectionCycle?: string;
  protectiveDevices?: string[];
  riskTypes?: string[];
  // 유해인자용
  formAndType?: string;
  location?: string;
  exposureRisk?: string;
  managementStandard?: string;
  managementMeasures?: string;
};

export type GetCodesParams = {
  category: CodeCategory;
  status?: CodeStatus;
  categoryFilter?: string; // 유해인자 카테고리 필터
  startDate?: string;
  endDate?: string;
  searchKey?: string;
  searchValue?: string;
  page: number;
  pageSize: number;
};

export type GetCodesResponse = BaseResponseDto<{
  codes: Code[];
  total: number;
}>;

export type GetCodeDetailParams = {
  id: string;
};

export type GetCodeDetailResponse = BaseResponseDto<Code>;

export type CreateMachineParams = {
  code: string;
  name: string;
  inspectionCycle: string;
  protectiveDevices: string[];
  riskTypes: string[];
};

export type CreateMachineResponse = BaseResponseDto<Code>;

export type UpdateMachineParams = {
  id: string;
  code?: string;
  name?: string;
  inspectionCycle?: string;
  protectiveDevices?: string[];
  riskTypes?: string[];
  status?: CodeStatus;
};

export type UpdateMachineResponse = BaseResponseDto<Code>;

export type CreateHazardParams = {
  category: string;
  code: string;
  name: string;
  formAndType: string;
  location: string;
  exposureRisk: string;
  managementStandard: string;
  managementMeasures: string;
};

export type CreateHazardResponse = BaseResponseDto<Code>;

export type UpdateHazardParams = {
  id: string;
  category?: string;
  code?: string;
  name?: string;
  formAndType?: string;
  location?: string;
  exposureRisk?: string;
  managementStandard?: string;
  managementMeasures?: string;
  status?: CodeStatus;
};

export type UpdateHazardResponse = BaseResponseDto<Code>;

export type HazardCategory = {
  id: string;
  name: string;
  isActive: boolean;
};

export type GetHazardCategoriesResponse = BaseResponseDto<{
  categories: HazardCategory[];
}>;

export type SaveHazardCategoriesParams = {
  categories: HazardCategory[];
};

export type SaveHazardCategoriesResponse = BaseResponseDto;

export type GetCodeDatesParams = {
  id: string;
};

export type GetCodeDatesResponse = BaseResponseDto<{
  registrationDate: string;
  modifiedDate: string;
}>;

export type GetHazardManagementParams = {
  id: string;
};

export type GetHazardManagementResponse = BaseResponseDto<{
  managementStandard: string;
  managementMeasures: string;
}>;

