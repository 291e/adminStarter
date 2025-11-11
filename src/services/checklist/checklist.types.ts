import type { BaseResponseDto } from '../common';

export type ChecklistStatus = 'active' | 'inactive';

export type Checklist = {
  id: string;
  industry: string;
  highRiskWork: string;
  disasterFactors: string[];
  status: ChecklistStatus;
  registrationDate: string;
};

export type GetChecklistsParams = {
  industry?: string;
  status?: ChecklistStatus;
  startDate?: string;
  endDate?: string;
  searchKey?: string;
  searchValue?: string;
  page: number;
  pageSize: number;
};

export type GetChecklistsResponse = BaseResponseDto<{
  checklists: Checklist[];
  total: number;
}>;

export type UpdateHighRiskWorkParams = {
  id: string;
  highRiskWork: string;
};

export type UpdateHighRiskWorkResponse = BaseResponseDto;

export type DisasterFactor = {
  id: string;
  order: number;
  name: string;
  isActive: boolean;
};

export type GetDisasterFactorsParams = {
  checklistId: string;
};

export type GetDisasterFactorsResponse = BaseResponseDto<{
  factors: DisasterFactor[];
  isActive: boolean;
}>;

export type SaveDisasterFactorsParams = {
  checklistId: string;
  factors: DisasterFactor[];
  isActive: boolean;
};

export type SaveDisasterFactorsResponse = BaseResponseDto;

export type Industry = {
  id: string;
  name: string;
  value: string;
  isActive: boolean;
};

export type GetIndustriesResponse = BaseResponseDto<{
  industries: Industry[];
}>;

export type SaveIndustriesParams = {
  industries: Industry[];
};

export type SaveIndustriesResponse = BaseResponseDto;

export type CreateRiskWorkParams = {
  industry: string;
  highRiskWork: string;
};

export type CreateRiskWorkResponse = BaseResponseDto<{
  checklist: Checklist;
}>;

