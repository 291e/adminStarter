import type { BaseResponseDto } from '../common';

// ----------------------------------------------------------------------

// 체크리스트 상태
export type ChecklistStatus = 'active' | 'inactive' | 'ACTIVE' | 'INACTIVE';

// 체크리스트 항목 (응답에서 string[]로 오지만 실제로는 객체일 수 있음)
export type Checklist = {
  checklistIdx?: number;
  industryIdx?: number;
  industry?: string;
  industryName?: string; // API 응답에 포함된 업종명
  highRiskWork: string;
  status?: ChecklistStatus;
  createAt?: string;
  updateAt?: string;
  registrationDate?: string; // UI에서 사용하는 등록일 (createAt 또는 updateAt)
  order?: number; // UI에서 사용하는 순번
  id?: string; // UI 호환성을 위한 id (checklistIdx를 문자열로 변환)
};

// 체크리스트 목록 조회 파라미터
export type GetChecklistsParams = {
  page?: number;
  pageSize?: number;
  industry?: string;
  status?: 'active' | 'inactive';
  search?: string;
};

// 체크리스트 목록 응답 (axios interceptor가 flatten하므로 직접 접근)
export type GetChecklistsResponse = {
  checklistList: Checklist[] | string[]; // swagger에 따르면 string[]이지만 실제로는 Checklist[]일 수 있음
  totalCount: number;
};

// 위험작업/상황 등록 파라미터
export type CreateChecklistParams = {
  industryIdx: number;
  highRiskWork: string;
  order?: number;
  description?: string;
  memo?: string;
};

// 위험작업/상황 등록 응답
export type CreateChecklistResponse = BaseResponseDto;

// 고위험작업/상황 업데이트 파라미터
export type UpdateHighRiskWorkParams = {
  checklistIdx: number;
  highRiskWork: string;
};

// 고위험작업/상황 업데이트 응답
export type UpdateHighRiskWorkResponse = BaseResponseDto;

// 업종 항목 (응답)
export type IndustryItem = {
  industryIdx?: number;
  name: string;
  status?: string; // 'ACTIVE' | 'INACTIVE'
  isActive?: boolean; // UI에서 사용하는 활성 여부
};

// 업종 목록 조회 응답
export type GetIndustriesResponse = {
  industryList: IndustryItem[];
};

// 업종 등록 파라미터
export type CreateIndustryParams = {
  industry: string;
  status?: 'ACTIVE' | 'INACTIVE';
};

// 업종 등록 응답
export type CreateIndustryResponse = BaseResponseDto;

// 업종 수정 파라미터
export type UpdateIndustryParams = {
  industryIdx: number;
  industry: string;
  status?: 'ACTIVE' | 'INACTIVE';
};

// 업종 수정 응답
export type UpdateIndustryResponse = BaseResponseDto;

// 업종 삭제 파라미터
export type DeleteIndustryParams = {
  industryIdx: number;
};

// 업종 삭제 응답
export type DeleteIndustryResponse = BaseResponseDto;

// 재해유발요인 목록 조회 파라미터
export type GetDisasterFactorsParams = {
  checklistIdx: number;
};

// 재해유발요인 목록 조회 응답
export type GetDisasterFactorsResponse = {
  disasterFactorList: DisasterFactorItem[] | string[]; // swagger에 따르면 string[]이지만 실제로는 DisasterFactorItem[]일 수 있음
};

// 재해유발요인 항목
export type DisasterFactorItem = {
  disasterFactorIdx?: number; // 수정 시에만 필요
  factorName: string;
  order?: number;
  isActive?: number | boolean; // 0: 비활성, 1: 활성 (API는 number, UI는 boolean)
  id?: string; // UI 호환성을 위한 id
  name?: string; // UI에서 사용하는 이름 (factorName과 동일)
};

// 재해유발요인 목록 전체 저장 파라미터 (PUT)
export type SaveDisasterFactorsParams = {
  checklistIdx: number;
  disasterFactorList: DisasterFactorItem[];
};

// 재해유발요인 목록 전체 저장 응답
export type SaveDisasterFactorsResponse = BaseResponseDto & {
  addedCount?: number;
  updatedCount?: number;
};

// 재해유발요인 개별 생성 파라미터 (POST)
export type CreateDisasterFactorParams = {
  checklistIdx: number;
  factorName: string;
  description?: string;
  isActive?: number; // 0: 비활성, 1: 활성 (기본값: 1)
};

// 재해유발요인 개별 생성 응답
export type CreateDisasterFactorResponse = {
  disasterFactorIdx: number;
  checklistIdx: number;
  factorName: string;
  description?: string;
  isActive: number;
  createAt: string;
  updateAt: string;
  deletedAt?: string | null;
};

// 재해유발요인 개별 수정 파라미터 (PATCH)
export type UpdateDisasterFactorParams = {
  disasterFactorIdx: number;
  factorName?: string;
  description?: string;
  isActive?: number; // 0: 비활성, 1: 활성
};

// 재해유발요인 개별 수정 응답
export type UpdateDisasterFactorResponse = {
  disasterFactorIdx: number;
  checklistIdx: number;
  factorName: string;
  description?: string;
  isActive: number;
  createAt: string;
  updateAt: string;
  deletedAt?: string | null;
};

// 재해유발요인 개별 삭제 파라미터 (DELETE)
export type DeleteDisasterFactorParams = {
  disasterFactorIdx: number;
};

// 재해유발요인 개별 삭제 응답
export type DeleteDisasterFactorResponse = {
  success: boolean;
  message?: string;
};
