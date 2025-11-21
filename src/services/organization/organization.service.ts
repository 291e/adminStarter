import axiosInstance from 'src/lib/axios';

import { endpoints } from 'src/lib/axios';

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
  CardActionParams,
  CardActionResponse,
  CreateBranchParams,
  CreateBranchResponse,
  GetBranchesParams,
  GetBranchesResponse,
  UpdateBranchParams,
  UpdateBranchResponse,
  GetSubscriptionsParams,
  GetSubscriptionsResponse,
  SubscribeParams,
  SubscribeResponse,
  CancelSubscriptionParams,
  UpdateAccidentFreeParams,
  InviteMemberParams,
  InviteMemberResponse,
  AcceptInvitationParams,
  AcceptInvitationResponse,
  GetCompanyMembersParams,
  GetCompanyMembersResponse,
} from './organization.types';

// ----------------------------------------------------------------------

/**
 * 조직 목록 조회
 * GET /companies
 */
export async function getOrganizations(
  params: GetOrganizationsParams
): Promise<GetOrganizationsResponse> {
  const response = await axiosInstance.get<GetOrganizationsResponse>(endpoints.company.base, {
    params,
  });
  return response.data;
}

/**
 * 조직 등록
 * POST /companies
 */
export async function createOrganization(
  params: CreateOrganizationParams
): Promise<CreateOrganizationResponse> {
  const response = await axiosInstance.post<CreateOrganizationResponse>(
    endpoints.company.base,
    params
  );
  return response.data;
}

/**
 * 조직 상세 조회
 * GET /companies/{companyIdx}
 */
export async function getOrganizationDetail(
  params: GetOrganizationDetailParams
): Promise<GetOrganizationDetailResponse> {
  const response = await axiosInstance.get<GetOrganizationDetailResponse>(
    `${endpoints.company.base}/${params.companyIdx}`
  );
  return response.data;
}

/**
 * 조직 정보 수정
 * PATCH /companies/{companyIdx}
 */
export async function updateOrganization(
  companyIdx: number,
  params: UpdateOrganizationParams
): Promise<UpdateOrganizationResponse> {
  const response = await axiosInstance.patch<UpdateOrganizationResponse>(
    `${endpoints.company.base}/${companyIdx}`,
    params
  );
  return response.data;
}

/**
 * 조직 비활성화
 * PATCH /companies/{companyIdx}/deactivate
 */
export async function deactivateOrganization(
  companyIdx: number
): Promise<UpdateOrganizationResponse> {
  const response = await axiosInstance.patch<UpdateOrganizationResponse>(
    `${endpoints.company.base}/${companyIdx}/deactivate`
  );
  return response.data;
}

/**
 * 조직 삭제
 * DELETE /companies/{companyIdx}
 */
export async function deleteOrganization(companyIdx: number): Promise<DeleteOrganizationResponse> {
  const response = await axiosInstance.delete<DeleteOrganizationResponse>(
    `${endpoints.company.base}/${companyIdx}`
  );
  return response.data;
}

/**
 * 지사 생성
 * POST /companies/{companyIdx}/branches
 */
export async function createBranch(
  companyIdx: number,
  params: CreateBranchParams
): Promise<CreateBranchResponse> {
  const response = await axiosInstance.post<CreateBranchResponse>(
    `${endpoints.company.branches}/${companyIdx}/branches`,
    params
  );
  return response.data;
}

/**
 * 지사 목록 조회
 * GET /companies/{companyIdx}/branches
 */
export async function getBranches(
  companyIdx: number,
  params?: GetBranchesParams
): Promise<GetBranchesResponse> {
  const response = await axiosInstance.get<GetBranchesResponse>(
    `${endpoints.company.branches}/${companyIdx}/branches`,
    { params }
  );
  return response.data;
}

/**
 * 지사 수정
 * PATCH /companies/{companyIdx}/branches/{branchIdx}
 */
export async function updateBranch(
  companyIdx: number,
  branchIdx: number,
  params: UpdateBranchParams
): Promise<UpdateBranchResponse> {
  const response = await axiosInstance.patch<UpdateBranchResponse>(
    `${endpoints.company.branches}/${companyIdx}/branches/${branchIdx}`,
    params
  );
  return response.data;
}

/**
 * 구독 목록 조회
 * GET /companies/{companyIdx}/subscriptions
 */
export async function getSubscriptions(
  companyIdx: number,
  params?: GetSubscriptionsParams
): Promise<GetSubscriptionsResponse> {
  const response = await axiosInstance.get<GetSubscriptionsResponse>(
    `${endpoints.company.subscriptions}/${companyIdx}/subscriptions`,
    { params }
  );
  return response.data;
}

/**
 * 서비스 구독
 * POST /companies/{companyIdx}/subscriptions
 */
export async function subscribe(
  companyIdx: number,
  params: SubscribeParams
): Promise<SubscribeResponse> {
  const response = await axiosInstance.post<SubscribeResponse>(
    `${endpoints.company.subscriptions}/${companyIdx}/subscriptions`,
    params
  );
  return response.data;
}

/**
 * 구독 취소
 * DELETE /companies/{companyIdx}/subscriptions/{subscriptionId}
 */
export async function cancelSubscription(params: CancelSubscriptionParams): Promise<void> {
  await axiosInstance.delete(
    `${endpoints.company.subscriptions}/${params.companyIdx}/subscriptions/${params.subscriptionId}`
  );
}

/**
 * 서비스 업그레이드
 * POST /companies/{companyIdx}/upgrade
 */
export async function upgradeService(
  companyIdx: number,
  params: UpgradeServiceParams
): Promise<UpgradeServiceResponse> {
  const response = await axiosInstance.post<UpgradeServiceResponse>(
    `${endpoints.company.upgrade}/${companyIdx}/upgrade`,
    params
  );
  return response.data;
}

/**
 * 카드 관리 (대표카드 설정 등)
 * POST /companies/{companyIdx}/cards
 */
export async function cardAction(
  companyIdx: number,
  params: CardActionParams
): Promise<CardActionResponse> {
  const response = await axiosInstance.post<CardActionResponse>(
    `${endpoints.company.cards}/${companyIdx}/cards`,
    params
  );
  return response.data;
}

/**
 * 무재해 인증 정보 수정
 * PATCH /companies/{companyIdx}/accident-free
 */
export async function updateAccidentFree(
  companyIdx: number,
  params: UpdateAccidentFreeParams
): Promise<void> {
  await axiosInstance.patch(
    `${endpoints.company.accidentFree}/${companyIdx}/accident-free`,
    params
  );
}

/**
 * 조직원 초대 (이메일)
 * POST /companies/{companyIdx}/invite
 */
export async function inviteMember(
  companyIdx: number,
  params: InviteMemberParams
): Promise<InviteMemberResponse> {
  const response = await axiosInstance.post<InviteMemberResponse>(
    `${endpoints.company.invite}/${companyIdx}/invite`,
    params
  );
  return response.data;
}

/**
 * 초대 수락 및 가입
 * POST /companies/invite/accept
 */
export async function acceptInvitation(
  params: AcceptInvitationParams
): Promise<AcceptInvitationResponse> {
  const response = await axiosInstance.post<AcceptInvitationResponse>(
    endpoints.company.inviteAccept,
    params
  );
  return response.data;
}

/**
 * 회사/지점별 역할별 멤버 조회
 * GET /companies/{companyIdx}/members
 */
export async function getCompanyMembers(
  companyIdx: number,
  params?: GetCompanyMembersParams
): Promise<GetCompanyMembersResponse> {
  const response = await axiosInstance.get<GetCompanyMembersResponse>(
    `${endpoints.company.members}/${companyIdx}/members`,
    { params }
  );
  return response.data;
}
