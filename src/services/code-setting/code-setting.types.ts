import type { BaseResponseDto, BaseResponseHeader } from '../common';

export type CodeCategory = 'MACHINE' | 'HAZARD' | 'machine' | 'hazard';
export type CodeStatus = 'ACTIVE' | 'INACTIVE' | 'active' | 'inactive';

// 코드 설정 정보
export type CodeSetting = {
  codeSettingIdx?: number; // API 경로에서 사용
  code: string;
  name: string;
  categoryType: CodeCategory;
  status: CodeStatus;
  createAt?: string;
  updateAt?: string;
  // 기계·설비용
  inspectionTarget?: string;
  inspectionCycle?: string;
  protectiveDevices?: string[] | string; // API는 배열, UI는 문자열로 처리 가능
  riskTypes?: string[] | string; // API는 배열, UI는 문자열로 처리 가능
  // 유해인자용
  formAndType?: string;
  location?: string;
  exposureRisk?: string;
  managementStandard?: string;
  managementMeasures?: string;
  organizationName?: string;
  description?: string;
  memo?: string;
  hazardCategoryIdx?: number; // 유해인자 카테고리 Index
  codeSettingHazardCategoryInformation?: CodeSettingHazardCategoryInformation; // 유해인자 카테고리 정보
};

// 코드 목록 조회 파라미터
export type GetCodesParams = {
  page?: number;
  pageSize?: number;
  categoryType?: 'machine' | 'hazard';
  status?: 'active' | 'inactive';
  search?: string; // 검색어 (코드, 명칭)
};

// 코드 목록 조회 응답 (axios interceptor가 평탄화한 형태)
export type GetCodesResponse = {
  codeSettingList: CodeSetting[];
  totalCount: number;
  header: BaseResponseHeader;
};

// 코드 상세 조회 파라미터
export type GetCodeDetailParams = {
  codeSettingIdx: number;
};

// 코드 상세 조회 응답
export type GetCodeDetailResponse = BaseResponseDto<CodeSetting>;

// 기계·설비 등록 파라미터
export type CreateMachineParams = {
  code: string;
  name: string;
  inspectionTarget: string;
  protectiveDevices: string[]; // API는 배열로 요구
  inspectionCycle: string;
  riskTypes: string[]; // API는 배열로 요구
};

// 기계·설비 등록 응답
export type CreateMachineResponse = BaseResponseDto<CodeSetting>;

// 기계·설비 수정 파라미터
export type UpdateMachineParams = {
  codeSettingIdx: number;
  code?: string;
  name?: string;
  inspectionTarget?: string;
  protectiveDevices?: string[]; // API는 배열로 요구
  inspectionCycle?: string;
  riskTypes?: string[]; // API는 배열로 요구
  status?: 'ACTIVE' | 'INACTIVE';
};

// 기계·설비 수정 응답
export type UpdateMachineResponse = BaseResponseDto<CodeSetting>;

// 유해인자 등록 파라미터
export type CreateHazardParams = {
  code: string;
  name: string;
  hazardCategoryIdx?: number; // 유해인자 카테고리 Index
  formAndType?: string;
  location?: string;
  exposureRisk?: string;
  managementStandard?: string;
  managementMeasure?: string; // 관리대책 (단수형)
};

// 유해인자 등록 응답
export type CreateHazardResponse = BaseResponseDto<CodeSetting>;

// 유해인자 수정 파라미터
export type UpdateHazardParams = {
  codeSettingIdx: number;
  code?: string;
  name?: string;
  hazardCategoryIdx?: number; // 유해인자 카테고리 Index
  formAndType?: string;
  location?: string;
  exposureRisk?: string;
  managementStandard?: string;
  managementMeasure?: string; // 관리대책 (단수형)
  status?: 'ACTIVE' | 'INACTIVE';
};

// 유해인자 수정 응답
export type UpdateHazardResponse = BaseResponseDto<CodeSetting>;

// 유해인자 카테고리
export type HazardCategory = {
  hazardCategoryIdx?: string;
  name: string;
  isActive?: boolean;
  libraryCategoryIdx?: number;
  order?: number;
  description?: string;
};

// 유해인자 카테고리 항목 (API 응답)
export type HazardCategoryItem = {
  hazardCategoryIdx: number;
  name: string;
  status: 'ACTIVE' | 'INACTIVE';
};

// 유해인자 카테고리 정보 (CodeSetting에 포함)
export type CodeSettingHazardCategoryInformation = {
  hazardCategoryIdx: number;
  name: string;
  status: 'ACTIVE' | 'INACTIVE';
};

// 유해인자 카테고리 목록 조회 응답 (axios interceptor가 평탄화한 형태)
export type GetHazardCategoriesResponse = {
  categoryList: HazardCategoryItem[]; // 실제 API는 객체 배열 반환
  header: BaseResponseHeader;
};

// 유해인자 카테고리 항목 (저장용)
export type CategoryItemDto = {
  hazardCategoryIdx?: number; // 카테고리 Index (optional, 있으면 업데이트, 없으면 생성)
  category: string; // 카테고리명
  status?: 'ACTIVE' | 'INACTIVE'; // 활성 여부
};

// 유해인자 카테고리 목록 저장 파라미터
export type SaveHazardCategoriesParams = {
  categoryList: CategoryItemDto[]; // 스펙에 따르면 CategoryItemDto[]
};

// 유해인자 카테고리 목록 저장 응답
export type SaveHazardCategoriesResponse = BaseResponseDto;
