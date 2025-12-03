import axiosInstance from 'src/lib/axios';

import { endpoints } from 'src/lib/axios';

import type {
  SafetySystemListResponseDto,
  UpdateSafetySystemDto,
  SafetySystemItemDetailResponseDto,
  CreateSafetySystemDocumentDto,
  CreateSafetySystemDocumentResponseDto,
  UpdateSafetySystemDocumentDto,
  CreateDocumentApprovalDto,
  AddApprovalSignatureDto,
  SendNotificationDto,
  PublishDocumentDto,
  GetChemicalListParams,
  ChemicalListResponseDto,
} from './safety-system.types';

// ----------------------------------------------------------------------

/**
 * 시스템 목록 조회
 * GET /safety-system/systems
 */
export async function getSafetySystemList(): Promise<SafetySystemListResponseDto> {
  const response = await axiosInstance.get<SafetySystemListResponseDto>(
    endpoints.safetySystem.systems
  );
  return response.data;
}

/**
 * 시스템 수정
 * PUT /safety-system/systems/{safetyIdx}
 */
export async function updateSafetySystem(
  safetyIdx: number,
  params: UpdateSafetySystemDto
): Promise<void> {
  await axiosInstance.put(`${endpoints.safetySystem.systems}/${safetyIdx}`, params);
}

/**
 * 아이템 상세 정보 조회
 * GET /safety-system/items/{safetySystemItemIdx}
 */
export async function getSafetySystemItem(
  safetySystemItemIdx: number
): Promise<SafetySystemItemDetailResponseDto> {
  const response = await axiosInstance.get<SafetySystemItemDetailResponseDto>(
    `${endpoints.safetySystem.items}/${safetySystemItemIdx}`
  );
  return response.data;
}

/**
 * 문서 등록
 * POST /safety-system/documents
 */
export async function createSafetySystemDocument(
  params: CreateSafetySystemDocumentDto
): Promise<CreateSafetySystemDocumentResponseDto> {
  const response = await axiosInstance.post<CreateSafetySystemDocumentResponseDto>(
    endpoints.safetySystem.documents,
    params
  );
  return response.data;
}

/**
 * 문서 수정
 * PATCH /safety-system/documents/{safetySystemDocumentIdx}
 */
export async function updateSafetySystemDocument(
  safetySystemDocumentIdx: number,
  params: UpdateSafetySystemDocumentDto
): Promise<void> {
  await axiosInstance.patch(
    `${endpoints.safetySystem.documents}/${safetySystemDocumentIdx}`,
    params
  );
}

/**
 * 문서 삭제
 * DELETE /safety-system/documents/{safetySystemDocumentIdx}
 */
export async function deleteSafetySystemDocument(safetySystemDocumentIdx: number): Promise<void> {
  await axiosInstance.delete(`${endpoints.safetySystem.documents}/${safetySystemDocumentIdx}`);
}

/**
 * 문서 결재 대상자 등록 (서명 포함)
 * POST /safety-system/documents/{safetySystemDocumentIdx}/approvals
 * approvalStep과 memberIdx를 함께 지정하여 결재자(서명자)를 등록합니다.
 * approvalStep: 1(승인), 2(작성), 3(검토)
 */
export async function createDocumentApproval(
  safetySystemDocumentIdx: number,
  params: CreateDocumentApprovalDto
): Promise<void> {
  await axiosInstance.post(
    `${endpoints.safetySystem.documents}/${safetySystemDocumentIdx}/approvals`,
    params
  );
}

/**
 * 결재 서명 등록
 * POST /safety-system/documents/{safetySystemDocumentIdx}/approvals/signature
 * 결재자가 자신의 결재에 서명을 등록합니다. 서명 등록 시 결재 상태가 승인/반려로 변경됩니다.
 */
export async function addApprovalSignature(
  safetySystemDocumentIdx: number,
  params: AddApprovalSignatureDto
): Promise<void> {
  await axiosInstance.post(
    `${endpoints.safetySystem.documents}/${safetySystemDocumentIdx}/approvals/signature`,
    params
  );
}

/**
 * 알림 발송
 * POST /safety-system/documents/{safetySystemDocumentIdx}/notifications
 */
export async function sendNotification(
  safetySystemDocumentIdx: number,
  params: SendNotificationDto
): Promise<void> {
  await axiosInstance.post(
    `${endpoints.safetySystem.documents}/${safetySystemDocumentIdx}/notifications`,
    params
  );
}

/**
 * 문서 게시 (공유 문서함 연동)
 * POST /safety-system/documents/{safetySystemDocumentIdx}/publish
 */
export async function publishDocument(
  safetySystemDocumentIdx: number,
  params: PublishDocumentDto
): Promise<void> {
  await axiosInstance.post(
    `${endpoints.safetySystem.documents}/${safetySystemDocumentIdx}/publish`,
    params
  );
}

/**
 * 화학물질 목록 조회 (한국산업안전보건공단 API)
 * GET /safety-system/chemicals
 */
export async function getChemicalList(
  params: GetChemicalListParams
): Promise<ChemicalListResponseDto> {
  const response = await axiosInstance.get<ChemicalListResponseDto>(
    endpoints.safetySystem.chemicals,
    { params }
  );
  return response.data;
}
