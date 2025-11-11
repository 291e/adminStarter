import axiosInstance from 'src/lib/axios';

import type {
  GetChecklistsParams,
  GetChecklistsResponse,
  UpdateHighRiskWorkParams,
  UpdateHighRiskWorkResponse,
  GetDisasterFactorsParams,
  GetDisasterFactorsResponse,
  SaveDisasterFactorsParams,
  SaveDisasterFactorsResponse,
  GetIndustriesResponse,
  SaveIndustriesParams,
  SaveIndustriesResponse,
  CreateRiskWorkParams,
  CreateRiskWorkResponse,
} from './checklist.types';

// ----------------------------------------------------------------------

export async function getChecklists(
  params: GetChecklistsParams
): Promise<GetChecklistsResponse> {
  // TODO: API 엔드포인트 구현
  throw new Error('Not implemented');
}

export async function updateHighRiskWork(
  params: UpdateHighRiskWorkParams
): Promise<UpdateHighRiskWorkResponse> {
  // TODO: API 엔드포인트 구현
  throw new Error('Not implemented');
}

export async function getDisasterFactors(
  params: GetDisasterFactorsParams
): Promise<GetDisasterFactorsResponse> {
  // TODO: API 엔드포인트 구현
  throw new Error('Not implemented');
}

export async function saveDisasterFactors(
  params: SaveDisasterFactorsParams
): Promise<SaveDisasterFactorsResponse> {
  // TODO: API 엔드포인트 구현
  throw new Error('Not implemented');
}

export async function getIndustries(): Promise<GetIndustriesResponse> {
  // TODO: API 엔드포인트 구현
  throw new Error('Not implemented');
}

export async function saveIndustries(
  params: SaveIndustriesParams
): Promise<SaveIndustriesResponse> {
  // TODO: API 엔드포인트 구현
  throw new Error('Not implemented');
}

export async function createRiskWork(
  params: CreateRiskWorkParams
): Promise<CreateRiskWorkResponse> {
  // TODO: API 엔드포인트 구현
  throw new Error('Not implemented');
}

