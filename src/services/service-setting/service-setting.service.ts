import axiosInstance from 'src/lib/axios';

import type {
  GetServicesParams,
  GetServicesResponse,
  GetServiceDetailParams,
  GetServiceDetailResponse,
  CreateServiceParams,
  CreateServiceResponse,
  UpdateServiceParams,
  UpdateServiceResponse,
  DeactivateServiceParams,
  DeactivateServiceResponse,
  DeleteServiceParams,
  DeleteServiceResponse,
} from './service-setting.types';

// ----------------------------------------------------------------------

export async function getServices(
  params: GetServicesParams
): Promise<GetServicesResponse> {
  // TODO: API 엔드포인트 구현
  throw new Error('Not implemented');
}

export async function getServiceDetail(
  params: GetServiceDetailParams
): Promise<GetServiceDetailResponse> {
  // TODO: API 엔드포인트 구현
  throw new Error('Not implemented');
}

export async function createService(
  params: CreateServiceParams
): Promise<CreateServiceResponse> {
  // TODO: API 엔드포인트 구현
  throw new Error('Not implemented');
}

export async function updateService(
  params: UpdateServiceParams
): Promise<UpdateServiceResponse> {
  // TODO: API 엔드포인트 구현
  throw new Error('Not implemented');
}

export async function deactivateService(
  params: DeactivateServiceParams
): Promise<DeactivateServiceResponse> {
  // TODO: API 엔드포인트 구현
  throw new Error('Not implemented');
}

export async function deleteService(
  params: DeleteServiceParams
): Promise<DeleteServiceResponse> {
  // TODO: API 엔드포인트 구현
  throw new Error('Not implemented');
}

