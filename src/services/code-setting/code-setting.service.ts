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
  GetCodeDatesParams,
  GetCodeDatesResponse,
  GetHazardManagementParams,
  GetHazardManagementResponse,
} from './code-setting.types';

// ----------------------------------------------------------------------

export async function getCodes(
  params: GetCodesParams
): Promise<GetCodesResponse> {
  // TODO: API 엔드포인트 구현
  throw new Error('Not implemented');
}

export async function getCodeDetail(
  params: GetCodeDetailParams
): Promise<GetCodeDetailResponse> {
  // TODO: API 엔드포인트 구현
  throw new Error('Not implemented');
}

export async function createMachine(
  params: CreateMachineParams
): Promise<CreateMachineResponse> {
  // TODO: API 엔드포인트 구현
  throw new Error('Not implemented');
}

export async function updateMachine(
  params: UpdateMachineParams
): Promise<UpdateMachineResponse> {
  // TODO: API 엔드포인트 구현
  throw new Error('Not implemented');
}

export async function createHazard(
  params: CreateHazardParams
): Promise<CreateHazardResponse> {
  // TODO: API 엔드포인트 구현
  throw new Error('Not implemented');
}

export async function updateHazard(
  params: UpdateHazardParams
): Promise<UpdateHazardResponse> {
  // TODO: API 엔드포인트 구현
  throw new Error('Not implemented');
}

export async function getHazardCategories(): Promise<GetHazardCategoriesResponse> {
  // TODO: API 엔드포인트 구현
  throw new Error('Not implemented');
}

export async function saveHazardCategories(
  params: SaveHazardCategoriesParams
): Promise<SaveHazardCategoriesResponse> {
  // TODO: API 엔드포인트 구현
  throw new Error('Not implemented');
}

export async function getCodeDates(
  params: GetCodeDatesParams
): Promise<GetCodeDatesResponse> {
  // TODO: API 엔드포인트 구현
  throw new Error('Not implemented');
}

export async function getHazardManagement(
  params: GetHazardManagementParams
): Promise<GetHazardManagementResponse> {
  // TODO: API 엔드포인트 구현
  throw new Error('Not implemented');
}

