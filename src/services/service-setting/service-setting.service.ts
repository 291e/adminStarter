import axiosInstance from 'src/lib/axios';

import { endpoints } from 'src/lib/axios';

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

/**
 * 서비스 목록 조회
 * GET /service-settings
 */
export async function getServices(params?: GetServicesParams): Promise<GetServicesResponse> {
  const response = await axiosInstance.get<GetServicesResponse>(endpoints.serviceSetting.base, {
    params,
  });
  return response.data;
}

/**
 * 서비스 상세 정보 조회
 * GET /service-settings/{serviceSettingIdx}
 */
export async function getServiceDetail(
  params: GetServiceDetailParams
): Promise<GetServiceDetailResponse> {
  const { serviceSettingIdx } = params;
  const response = await axiosInstance.get<GetServiceDetailResponse>(
    `${endpoints.serviceSetting.base}/${serviceSettingIdx}`
  );
  return response.data;
}

/**
 * 서비스 등록
 * POST /service-settings
 */
export async function createService(params: CreateServiceParams): Promise<CreateServiceResponse> {
  const response = await axiosInstance.post<CreateServiceResponse>(
    endpoints.serviceSetting.base,
    params
  );
  return response.data;
}

/**
 * 서비스 수정
 * PUT /service-settings/{serviceSettingIdx}
 */
export async function updateService(params: UpdateServiceParams): Promise<UpdateServiceResponse> {
  const { serviceSettingIdx, ...body } = params;
  const response = await axiosInstance.put<UpdateServiceResponse>(
    `${endpoints.serviceSetting.base}/${serviceSettingIdx}`,
    body
  );
  return response.data;
}

/**
 * 서비스 비활성화
 * PATCH /service-settings/{serviceSettingIdx}/deactivate
 */
export async function deactivateService(
  params: DeactivateServiceParams
): Promise<DeactivateServiceResponse> {
  const { serviceSettingIdx } = params;
  const response = await axiosInstance.patch<DeactivateServiceResponse>(
    `${endpoints.serviceSetting.base}/${serviceSettingIdx}/deactivate`
  );
  return response.data;
}

/**
 * 서비스 삭제
 * DELETE /service-settings/{serviceSettingIdx}
 */
export async function deleteService(params: DeleteServiceParams): Promise<DeleteServiceResponse> {
  const { serviceSettingIdx } = params;
  const response = await axiosInstance.delete<DeleteServiceResponse>(
    `${endpoints.serviceSetting.base}/${serviceSettingIdx}`
  );
  return response.data;
}
