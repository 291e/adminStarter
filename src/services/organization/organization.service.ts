import type {
  GetOrganizationsParams,
  GetOrganizationsResponse,
  CreateOrganizationParams,
  CreateOrganizationResponse,
  UpdateOrganizationParams,
  UpdateOrganizationResponse,
  DeleteOrganizationResponse,
  GetOrganizationDetailParams,
  GetOrganizationDetailResponse,
  UpgradeServiceParams,
  UpgradeServiceResponse,
  CancelServiceParams,
  CancelServiceResponse,
  CardActionParams,
  CardActionResponse,
} from './organization.types';

// ----------------------------------------------------------------------

/**
 * 조직 목록 조회
 * GET /api/organizations
 */
export async function getOrganizations(
  params: GetOrganizationsParams
): Promise<GetOrganizationsResponse> {
  // TODO: API 엔드포인트 구현
  // const response = await axiosInstance.get<GetOrganizationsResponse>(endpoints.organization.list, {
  //   params,
  // });
  // return response.data;
  throw new Error('Not implemented');
}

/**
 * 조직 등록
 * POST /api/organizations
 */
export async function createOrganization(
  params: CreateOrganizationParams
): Promise<CreateOrganizationResponse> {
  // TODO: API 엔드포인트 구현
  // const response = await axiosInstance.post<CreateOrganizationResponse>(
  //   endpoints.organization.create,
  //   params
  // );
  // return response.data;
  throw new Error('Not implemented');
}

/**
 * 조직 수정
 * PUT /api/organizations/:id
 */
export async function updateOrganization(
  id: string,
  params: UpdateOrganizationParams
): Promise<UpdateOrganizationResponse> {
  // TODO: API 엔드포인트 구현
  // const response = await axiosInstance.put<UpdateOrganizationResponse>(
  //   `${endpoints.organization.update}/${id}`,
  //   params
  // );
  // return response.data;
  throw new Error('Not implemented');
}

/**
 * 조직 비활성화
 * PATCH /api/organizations/:id/deactivate
 */
export async function deactivateOrganization(id: string): Promise<UpdateOrganizationResponse> {
  // TODO: API 엔드포인트 구현
  // const response = await axiosInstance.patch<UpdateOrganizationResponse>(
  //   `${endpoints.organization.deactivate}/${id}`
  // );
  // return response.data;
  throw new Error('Not implemented');
}

/**
 * 조직 삭제
 * DELETE /api/organizations/:id
 */
export async function deleteOrganization(id: string): Promise<DeleteOrganizationResponse> {
  // TODO: API 엔드포인트 구현
  // const response = await axiosInstance.delete<DeleteOrganizationResponse>(
  //   `${endpoints.organization.delete}/${id}`
  // );
  // return response.data;
  throw new Error('Not implemented');
}

/**
 * 조직 상세 정보 및 멤버 목록 조회
 * GET /api/organizations/:id
 */
export async function getOrganizationDetail(
  params: GetOrganizationDetailParams
): Promise<GetOrganizationDetailResponse> {
  // TODO: API 엔드포인트 구현
  // const response = await axiosInstance.get<GetOrganizationDetailResponse>(
  //   `${endpoints.organization.detail}/${params.id}`
  // );
  // return response.data;
  throw new Error('Not implemented');
}

/**
 * 서비스 업그레이드
 * POST /api/organizations/:id/services/upgrade
 */
export async function upgradeService(
  params: UpgradeServiceParams
): Promise<UpgradeServiceResponse> {
  // TODO: API 엔드포인트 구현
  // const response = await axiosInstance.post<UpgradeServiceResponse>(
  //   `${endpoints.organization.services.upgrade}/${params.organizationId}`,
  //   { servicePlanId: params.servicePlanId }
  // );
  // return response.data;
  throw new Error('Not implemented');
}

/**
 * 서비스 취소
 * POST /api/organizations/:id/services/cancel
 */
export async function cancelService(params: CancelServiceParams): Promise<CancelServiceResponse> {
  // TODO: API 엔드포인트 구현
  // const response = await axiosInstance.post<CancelServiceResponse>(
  //   `${endpoints.organization.services.cancel}/${params.organizationId}`,
  //   { servicePlanId: params.servicePlanId }
  // );
  // return response.data;
  throw new Error('Not implemented');
}

/**
 * 카드 액션 처리 (대표 카드 설정, 수정, 삭제)
 * POST /api/organizations/:id/cards/:cardId/action
 */
export async function cardAction(params: CardActionParams): Promise<CardActionResponse> {
  // TODO: API 엔드포인트 구현
  // const response = await axiosInstance.post<CardActionResponse>(
  //   `${endpoints.organization.cards.action}/${params.organizationId}/${params.cardId}`,
  //   { action: params.action, cardData: params.cardData }
  // );
  // return response.data;
  throw new Error('Not implemented');
}
