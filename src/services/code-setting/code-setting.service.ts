import axiosInstance from 'src/lib/axios';

import type {
  GetCodesParams,
  GetCodesResponse,
  GetCodeDetailParams,
  GetCodeDetailResponse,
  CreateMachineParams,
  CreateMachineResponse,
  UpdateMachineParams,
  UpdateMachineResponse,
  CreateHazardParams,
  CreateHazardResponse,
  UpdateHazardParams,
  UpdateHazardResponse,
  GetHazardCategoriesResponse,
  SaveHazardCategoriesParams,
  SaveHazardCategoriesResponse,
} from './code-setting.types';

// ----------------------------------------------------------------------

/**
 * 코드 목록 조회
 * GET /code-settings
 */
export async function getCodes(params: GetCodesParams): Promise<GetCodesResponse> {
  const response = await axiosInstance.get<GetCodesResponse>('/code-settings', { params });
  return response.data;
}

/**
 * 코드 상세 정보 조회
 * GET /code-settings/{codeSettingIdx}
 */
export async function getCodeDetail(params: GetCodeDetailParams): Promise<GetCodeDetailResponse> {
  const response = await axiosInstance.get<GetCodeDetailResponse>(
    `/code-settings/${params.codeSettingIdx}`
  );
  return response.data;
}

/**
 * 기계·설비 등록
 * POST /code-settings/machine
 */
export async function createMachine(params: CreateMachineParams): Promise<CreateMachineResponse> {
  const response = await axiosInstance.post<CreateMachineResponse>(
    '/code-settings/machine',
    params
  );
  return response.data;
}

/**
 * 기계·설비 수정
 * PUT /code-settings/machine/{codeSettingIdx}
 */
export async function updateMachine(params: UpdateMachineParams): Promise<UpdateMachineResponse> {
  const { codeSettingIdx, ...body } = params;
  const response = await axiosInstance.put<UpdateMachineResponse>(
    `/code-settings/machine/${codeSettingIdx}`,
    body
  );
  return response.data;
}

/**
 * 유해인자 등록
 * POST /code-settings/hazard
 */
export async function createHazard(params: CreateHazardParams): Promise<CreateHazardResponse> {
  const response = await axiosInstance.post<CreateHazardResponse>('/code-settings/hazard', params);
  return response.data;
}

/**
 * 유해인자 수정
 * PUT /code-settings/hazard/{codeSettingIdx}
 */
export async function updateHazard(params: UpdateHazardParams): Promise<UpdateHazardResponse> {
  const { codeSettingIdx, ...body } = params;
  const response = await axiosInstance.put<UpdateHazardResponse>(
    `/code-settings/hazard/${codeSettingIdx}`,
    body
  );
  return response.data;
}

/**
 * 유해인자 카테고리 목록 조회
 * GET /code-settings/categories
 */
export async function getHazardCategories(): Promise<GetHazardCategoriesResponse> {
  const response = await axiosInstance.get<GetHazardCategoriesResponse>(
    '/code-settings/categories'
  );
  return response.data;
}

/**
 * 유해인자 카테고리 목록 저장
 * POST /code-settings/categories
 */
export async function saveHazardCategories(
  params: SaveHazardCategoriesParams
): Promise<SaveHazardCategoriesResponse> {
  const response = await axiosInstance.post<SaveHazardCategoriesResponse>(
    '/code-settings/categories',
    params
  );
  return response.data;
}
