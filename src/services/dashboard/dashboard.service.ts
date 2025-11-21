import axiosInstance from 'src/lib/axios';

import { endpoints } from 'src/lib/axios';

import type {
  GetDocumentSignatureListResponse,
  GetSharedDocumentListParams,
  GetSharedDocumentListResponse,
  CreateSharedDocumentParams,
  CreateSharedDocumentResponse,
  UpdateSharedDocumentParams,
  UpdateSharedDocumentResponse,
  DeleteSharedDocumentParams,
  ShareDocumentToChatRoomParams,
  GetRiskReportStatisticsParams,
  GetRiskReportStatisticsResponse,
  GetMemberProfileResponse,
  GetEducationCompletionRateParams,
  GetEducationCompletionRateResponse,
  GetPrioritySettingListResponse,
  CreatePrioritySettingParams,
  CreatePrioritySettingResponse,
  UpdatePrioritySettingParams,
  UpdatePrioritySettingResponse,
  DeletePrioritySettingParams,
} from './dashboard.types';

// ----------------------------------------------------------------------

/**
 * 서명 대기 문서 목록 조회
 * GET /dashboard/document-signatures
 */
export async function getDocumentSignatureList(): Promise<GetDocumentSignatureListResponse> {
  const response = await axiosInstance.get<GetDocumentSignatureListResponse>(
    endpoints.dashboard.documentSignatures
  );
  return response.data;
}

/**
 * 공유된 문서 목록 조회
 * GET /dashboard/shared-documents
 */
export async function getSharedDocumentList(
  params?: GetSharedDocumentListParams
): Promise<GetSharedDocumentListResponse> {
  // page와 pageSize를 명시적으로 숫자로 변환
  const queryParams = params
    ? {
        ...params,
        page: params.page ? Number(params.page) : undefined,
        pageSize: params.pageSize ? Number(params.pageSize) : undefined,
      }
    : undefined;

  const response = await axiosInstance.get<GetSharedDocumentListResponse>(
    endpoints.dashboard.sharedDocuments,
    { params: queryParams }
  );
  return response.data;
}

/**
 * 공유 문서 업로드
 * POST /dashboard/shared-documents
 * 파일은 먼저 /system/upload로 업로드하고 fileUrl을 사용해야 함
 */
export async function createSharedDocument(
  params: CreateSharedDocumentParams
): Promise<CreateSharedDocumentResponse> {
  // application/json으로 요청 (swagger 스펙에 따름)
  const response = await axiosInstance.post<CreateSharedDocumentResponse>(
    endpoints.dashboard.sharedDocuments,
    params
  );
  return response.data;
}

/**
 * 공유 문서 수정
 * PUT /dashboard/shared-documents/{documentId}
 */
export async function updateSharedDocument(
  params: UpdateSharedDocumentParams
): Promise<UpdateSharedDocumentResponse> {
  // documentId는 URL 경로에만 포함, body에는 제외
  const { documentId, ...body } = params;
  const response = await axiosInstance.put<UpdateSharedDocumentResponse>(
    `${endpoints.dashboard.sharedDocuments}/${documentId}`,
    body
  );
  return response.data;
}

/**
 * 공유 문서 삭제
 * DELETE /dashboard/shared-documents/{documentId}
 */
export async function deleteSharedDocument(params: DeleteSharedDocumentParams): Promise<void> {
  await axiosInstance.delete(`${endpoints.dashboard.sharedDocuments}/${params.documentId}`);
}

/**
 * 공유 문서 채팅방 공유
 * POST /dashboard/shared-documents/{documentId}/share
 */
export async function shareDocumentToChatRoom(
  params: ShareDocumentToChatRoomParams
): Promise<void> {
  await axiosInstance.post(
    `${endpoints.dashboard.sharedDocuments}/${params.documentId}/share`,
    { chatRoomIdList: params.chatRoomIdList }
  );
}

/**
 * 사고·위험 보고 현황 통계 조회
 * GET /dashboard/risk-report-statistics
 */
export async function getRiskReportStatistics(
  params?: GetRiskReportStatisticsParams
): Promise<GetRiskReportStatisticsResponse> {
  const response = await axiosInstance.get<GetRiskReportStatisticsResponse>(
    endpoints.dashboard.riskReportStatistics,
    { params }
  );
  return response.data;
}

/**
 * 사용자 프로필 정보 조회
 * GET /dashboard/member-profile
 */
export async function getMemberProfile(): Promise<GetMemberProfileResponse> {
  const response = await axiosInstance.get<GetMemberProfileResponse>(
    endpoints.dashboard.memberProfile
  );
  return response.data;
}

/**
 * 교육 이수율 조회
 * GET /dashboard/education-completion-rate
 */
export async function getEducationCompletionRate(
  params?: GetEducationCompletionRateParams
): Promise<GetEducationCompletionRateResponse> {
  const response = await axiosInstance.get<GetEducationCompletionRateResponse>(
    endpoints.dashboard.educationCompletionRate,
    { params }
  );
  return response.data;
}

/**
 * 중요도 설정 목록 조회
 * GET /dashboard/priority-settings
 */
export async function getPrioritySettingList(): Promise<GetPrioritySettingListResponse> {
  const response = await axiosInstance.get<GetPrioritySettingListResponse>(
    endpoints.dashboard.prioritySettings
  );
  return response.data;
}

/**
 * 중요도 설정 등록
 * POST /dashboard/priority-settings
 */
export async function createPrioritySetting(
  params: CreatePrioritySettingParams
): Promise<CreatePrioritySettingResponse> {
  const response = await axiosInstance.post<CreatePrioritySettingResponse>(
    endpoints.dashboard.prioritySettings,
    params
  );
  return response.data;
}

/**
 * 중요도 설정 수정
 * PUT /dashboard/priority-settings/{prioritySettingId}
 */
export async function updatePrioritySetting(
  params: UpdatePrioritySettingParams
): Promise<UpdatePrioritySettingResponse> {
  const response = await axiosInstance.put<UpdatePrioritySettingResponse>(
    `${endpoints.dashboard.prioritySettings}/${params.prioritySettingId}`,
    params
  );
  return response.data;
}

/**
 * 중요도 설정 삭제
 * DELETE /dashboard/priority-settings/{prioritySettingId}
 */
export async function deletePrioritySetting(params: DeletePrioritySettingParams): Promise<void> {
  await axiosInstance.delete(
    `${endpoints.dashboard.prioritySettings}/${params.prioritySettingId}`
  );
}

