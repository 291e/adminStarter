import axiosInstance from 'src/lib/axios';

import type {
  GetChecklistsParams,
  GetChecklistsResponse,
  CreateChecklistParams,
  CreateChecklistResponse,
  UpdateHighRiskWorkParams,
  UpdateHighRiskWorkResponse,
  GetIndustriesResponse,
  CreateIndustryParams,
  CreateIndustryResponse,
  UpdateIndustryParams,
  UpdateIndustryResponse,
  DeleteIndustryParams,
  DeleteIndustryResponse,
  GetDisasterFactorsParams,
  GetDisasterFactorsResponse,
  SaveDisasterFactorsParams,
  SaveDisasterFactorsResponse,
} from './checklist.types';

// ----------------------------------------------------------------------

/**
 * 체크리스트 목록 조회
 * GET /checklists
 */
export async function getChecklists(
  params: GetChecklistsParams
): Promise<GetChecklistsResponse> {
  const { data } = await axiosInstance.get<GetChecklistsResponse>('/checklists', { params });
  return data;
}

/**
 * 위험작업/상황 등록
 * POST /checklists
 */
export async function createChecklist(
  params: CreateChecklistParams
): Promise<CreateChecklistResponse> {
  const { data } = await axiosInstance.post<CreateChecklistResponse>('/checklists', params);
  return data;
}

/**
 * 고위험작업/상황 업데이트
 * PATCH /checklists/{checklistIdx}/high-risk-work
 */
export async function updateHighRiskWork(
  params: UpdateHighRiskWorkParams
): Promise<UpdateHighRiskWorkResponse> {
  const { checklistIdx, ...body } = params;
  const { data } = await axiosInstance.patch<UpdateHighRiskWorkResponse>(
    `/checklists/${checklistIdx}/high-risk-work`,
    body
  );
  return data;
}

/**
 * 업종 목록 조회
 * GET /checklists/industries
 */
export async function getIndustries(): Promise<GetIndustriesResponse> {
  const { data } = await axiosInstance.get<GetIndustriesResponse>('/checklists/industries');
  return data;
}

/**
 * 업종 등록
 * POST /checklists/industries
 */
export async function createIndustry(
  params: CreateIndustryParams
): Promise<CreateIndustryResponse> {
  const { data } = await axiosInstance.post<CreateIndustryResponse>(
    '/checklists/industries',
    params
  );
  return data;
}

/**
 * 업종 수정
 * PUT /checklists/industries/{industryIdx}
 */
export async function updateIndustry(
  params: UpdateIndustryParams
): Promise<UpdateIndustryResponse> {
  const { industryIdx, ...body } = params;
  const { data } = await axiosInstance.put<UpdateIndustryResponse>(
    `/checklists/industries/${industryIdx}`,
    body
  );
  return data;
}

/**
 * 업종 삭제
 * DELETE /checklists/industries/{industryIdx}
 */
export async function deleteIndustry(
  params: DeleteIndustryParams
): Promise<DeleteIndustryResponse> {
  const { industryIdx } = params;
  const { data } = await axiosInstance.delete<DeleteIndustryResponse>(
    `/checklists/industries/${industryIdx}`
  );
  return data;
}

/**
 * 재해유발요인 목록 조회
 * GET /checklists/{checklistIdx}/disaster-factors
 */
export async function getDisasterFactors(
  params: GetDisasterFactorsParams
): Promise<GetDisasterFactorsResponse> {
  const { checklistIdx } = params;
  const { data } = await axiosInstance.get<GetDisasterFactorsResponse>(
    `/checklists/${checklistIdx}/disaster-factors`
  );
  return data;
}

/**
 * 재해유발요인 목록 저장
 * POST /checklists/{checklistIdx}/disaster-factors
 */
export async function saveDisasterFactors(
  params: SaveDisasterFactorsParams
): Promise<SaveDisasterFactorsResponse> {
  const { checklistIdx, ...body } = params;
  const { data } = await axiosInstance.post<SaveDisasterFactorsResponse>(
    `/checklists/${checklistIdx}/disaster-factors`,
    body
  );
  return data;
}
