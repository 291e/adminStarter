import axiosInstance from 'src/lib/axios';

import { endpoints } from 'src/lib/axios';

import type {
  GetSafetySystemDocumentListParams,
  SafetySystemDocumentListResponseDto,
  GetSafetySystemDocumentParams,
  SafetySystemDocumentDetailResponseDto,
  CreateSafetySystemDocumentDto,
  CreateSafetySystemDocumentResponse,
  UpdateSafetySystemDocumentParams,
  UpdateSafetySystemDocumentResponse,
  DeleteSafetySystemDocumentParams,
  SaveDraftSafetySystemDocumentParams,
  SaveDraftSafetySystemDocumentResponse,
  GetItemInfoResponse,
  GetDocumentApprovalInfoResponse,
  CreateDocumentApprovalParams,
  CreateDocumentSignatureParams,
  GetApprovalProgressResponse,
  GetSignatureProgressResponse,
  GetSignatureStatusResponse,
  AddSignatureParams,
  SendNotificationParams,
  PublishDocumentParams,
  GetChemicalListResponse,
  GetCasNoListResponse,
  ProcessActionParams,
} from './safety-system.types';

// ----------------------------------------------------------------------

/**
 * 문서 목록 조회
 * GET /safety-system/documents
 */
export async function getSafetySystemDocumentList(
  params?: GetSafetySystemDocumentListParams
): Promise<SafetySystemDocumentListResponseDto> {
  const response = await axiosInstance.get<SafetySystemDocumentListResponseDto>(
    endpoints.safetySystem.documents,
    { params }
  );
  return response.data;
}

/**
 * 문서 등록
 * POST /safety-system/documents
 */
export async function createSafetySystemDocument(
  params: CreateSafetySystemDocumentDto
): Promise<CreateSafetySystemDocumentResponse> {
  const response = await axiosInstance.post<CreateSafetySystemDocumentResponse>(
    endpoints.safetySystem.documents,
    params
  );
  return response.data;
}

/**
 * 문서 상세 정보 조회
 * GET /safety-system/documents/{documentId}
 */
export async function getSafetySystemDocument(
  params: GetSafetySystemDocumentParams
): Promise<SafetySystemDocumentDetailResponseDto> {
  const response = await axiosInstance.get<SafetySystemDocumentDetailResponseDto>(
    `${endpoints.safetySystem.documents}/${params.documentId}`
  );
  return response.data;
}

/**
 * 문서 수정
 * PUT /safety-system/documents/{documentId}
 */
export async function updateSafetySystemDocument(
  params: UpdateSafetySystemDocumentParams
): Promise<UpdateSafetySystemDocumentResponse> {
  const response = await axiosInstance.put<UpdateSafetySystemDocumentResponse>(
    `${endpoints.safetySystem.documents}/${params.documentId}`,
    params
  );
  return response.data;
}

/**
 * 문서 삭제
 * DELETE /safety-system/documents/{documentId}
 */
export async function deleteSafetySystemDocument(
  params: DeleteSafetySystemDocumentParams
): Promise<void> {
  await axiosInstance.delete(`${endpoints.safetySystem.documents}/${params.documentId}`);
}

/**
 * 문서 임시 저장
 * POST /safety-system/documents/draft
 */
export async function saveDraftSafetySystemDocument(
  params: SaveDraftSafetySystemDocumentParams
): Promise<SaveDraftSafetySystemDocumentResponse> {
  const response = await axiosInstance.post<SaveDraftSafetySystemDocumentResponse>(
    `${endpoints.safetySystem.documents}/draft`,
    params
  );
  return response.data;
}

/**
 * Item 정보 조회
 * GET /safety-system/items
 */
export async function getItemInfo(): Promise<GetItemInfoResponse> {
  const response = await axiosInstance.get<GetItemInfoResponse>(endpoints.safetySystem.items);
  return response.data;
}

/**
 * 결재 정보 조회
 * GET /safety-system/documents/{documentId}/approvals
 */
export async function getDocumentApprovalInfo(
  documentId: string
): Promise<GetDocumentApprovalInfoResponse> {
  const response = await axiosInstance.get<GetDocumentApprovalInfoResponse>(
    `${endpoints.safetySystem.documents}/${documentId}/approvals`
  );
  return response.data;
}

/**
 * 문서 결재 대상자 등록
 * POST /safety-system/documents/{documentId}/approvals
 */
export async function createDocumentApproval(
  params: CreateDocumentApprovalParams
): Promise<void> {
  await axiosInstance.post(
    `${endpoints.safetySystem.documents}/${params.documentId}/approvals`,
    { memberIndexes: params.memberIndexes }
  );
}

/**
 * 문서 서명 대상자 등록
 * POST /safety-system/documents/{documentId}/signatures
 */
export async function createDocumentSignature(
  params: CreateDocumentSignatureParams
): Promise<void> {
  await axiosInstance.post(
    `${endpoints.safetySystem.documents}/${params.documentId}/signatures`,
    { memberIndexes: params.memberIndexes }
  );
}

/**
 * 결재 진행률 조회
 * GET /safety-system/documents/{documentId}/approval-progress
 */
export async function getApprovalProgress(
  documentId: string
): Promise<GetApprovalProgressResponse> {
  const response = await axiosInstance.get<GetApprovalProgressResponse>(
    `${endpoints.safetySystem.documents}/${documentId}/approval-progress`
  );
  return response.data;
}

/**
 * 서명 진행률 조회
 * GET /safety-system/documents/{documentId}/signature-progress
 */
export async function getSignatureProgress(
  documentId: string
): Promise<GetSignatureProgressResponse> {
  const response = await axiosInstance.get<GetSignatureProgressResponse>(
    `${endpoints.safetySystem.documents}/${documentId}/signature-progress`
  );
  return response.data;
}

/**
 * 서명 상태 조회
 * GET /safety-system/documents/{documentId}/signature-status
 */
export async function getSignatureStatus(
  documentId: string
): Promise<GetSignatureStatusResponse> {
  const response = await axiosInstance.get<GetSignatureStatusResponse>(
    `${endpoints.safetySystem.documents}/${documentId}/signature-status`
  );
  return response.data;
}

/**
 * 서명 추가
 * POST /safety-system/documents/{documentId}/signatures/add
 */
export async function addSignature(params: AddSignatureParams): Promise<void> {
  await axiosInstance.post(
    `${endpoints.safetySystem.documents}/${params.documentId}/signatures/add`,
    { memberIndexes: params.memberIndexes }
  );
}

/**
 * 알림 발송
 * POST /safety-system/documents/{documentId}/notifications
 */
export async function sendNotification(params: SendNotificationParams): Promise<void> {
  await axiosInstance.post(
    `${endpoints.safetySystem.documents}/${params.documentId}/notifications`,
    { notificationType: params.notificationType }
  );
}

/**
 * 문서 게시 (공유 문서함 연동)
 * POST /safety-system/documents/{documentId}/publish
 */
export async function publishDocument(params: PublishDocumentParams): Promise<void> {
  await axiosInstance.post(
    `${endpoints.safetySystem.documents}/${params.documentId}/publish`
  );
}

/**
 * 화학물질 목록 조회
 * GET /safety-system/chemicals
 */
export async function getChemicalList(): Promise<GetChemicalListResponse> {
  const response = await axiosInstance.get<GetChemicalListResponse>(
    endpoints.safetySystem.chemicals
  );
  return response.data;
}

/**
 * CAS No 목록 조회
 * GET /safety-system/cas-numbers
 */
export async function getCasNoList(): Promise<GetCasNoListResponse> {
  const response = await axiosInstance.get<GetCasNoListResponse>(
    endpoints.safetySystem.casNumbers
  );
  return response.data;
}

/**
 * 액션 처리 (엑셀 내보내기, 인쇄 등)
 * POST /safety-system/documents/actions
 */
export async function processAction(params: ProcessActionParams): Promise<void> {
  await axiosInstance.post(`${endpoints.safetySystem.documents}/actions`, params);
}

