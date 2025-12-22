import axiosInstance from 'src/lib/axios';

import { endpoints } from 'src/lib/axios';

import type {
  SafetySystemListResponseDto,
  UpdateSafetySystemDto,
  SafetySystemItemDetailResponseDto,
  CreateSafetySystemDocumentDto,
  CreateSafetySystemDocumentResponseDto,
  UpdateSafetySystemDocumentDto,
  SafetySystemDocumentDetailResponseDto,
  CreateDocumentApprovalDto,
  AddApprovalSignatureDto,
  SendNotificationDto,
  PublishDocumentDto,
  GetChemicalListParams,
  ChemicalListResponseDto,
  GetChemicalSummaryParams,
  ChemicalSummaryResponseDto,
  CreateWorkerSignatureDto,
  AddWorkerSignatureDto,
  UpdateWorkerSignatureWatchDto,
  RiskAssessmentCriteriaResponseDto,
  CreateRiskAssessmentCriteriaDto,
  UpdateRiskAssessmentCriteriaDto,
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
 * 문서 상세 조회
 * GET /safety-system/documents/{safetySystemDocumentIdx}
 */
export async function getSafetySystemDocument(
  safetySystemDocumentIdx: number
): Promise<SafetySystemDocumentDetailResponseDto> {
  const response = await axiosInstance.get<SafetySystemDocumentDetailResponseDto>(
    `${endpoints.safetySystem.documents}/${safetySystemDocumentIdx}`
  );
  return response.data;
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

/**
 * 화학물질명 검색 → 요약 반환
 * GET /safety-system/chemicals/summary
 */
export async function getChemicalSummary(
  params: GetChemicalSummaryParams
): Promise<ChemicalSummaryResponseDto> {
  const response = await axiosInstance.get<ChemicalSummaryResponseDto>(
    `${endpoints.safetySystem.chemicals}/summary`,
    { params }
  );
  return response.data;
}

/**
 * 근로자 대상자 등록
 * POST /safety-system/documents/{safetySystemDocumentIdx}/worker-signatures
 * 문서 결재 대상자 등록과 사용법은 동일함
 */
export async function createWorkerSignature(
  safetySystemDocumentIdx: number,
  params: CreateWorkerSignatureDto
): Promise<{ workerSignatureIdx: number } | void> {
  const url = `${endpoints.safetySystem.documents}/${safetySystemDocumentIdx}/worker-signatures`;

  if (import.meta.env.DEV) {
    console.log('🌐 [createWorkerSignature] API 요청:', {
      url,
      method: 'POST',
      safetySystemDocumentIdx,
      params,
      requestBody: params,
    });
  }

  try {
    const response = await axiosInstance.post<{ workerSignatureIdx: number }>(url, params);

    if (import.meta.env.DEV) {
      console.log('✅ [createWorkerSignature] API 응답:', {
        url,
        status: response.status,
        statusText: response.statusText,
        responseData: response.data,
        responseHeaders: response.headers,
        workerSignatureIdx: response.data?.workerSignatureIdx,
        fullResponse: response,
      });
    }

    // 응답이 있으면 반환, 없으면 void
    const result = response.data?.workerSignatureIdx
      ? { workerSignatureIdx: response.data.workerSignatureIdx }
      : undefined;

    if (import.meta.env.DEV) {
      console.log('📦 [createWorkerSignature] 반환값:', {
        result,
        hasWorkerSignatureIdx: !!result?.workerSignatureIdx,
      });
    }

    return result;
  } catch (error: any) {
    if (import.meta.env.DEV) {
      console.error('❌ [createWorkerSignature] API 에러:', {
        url,
        safetySystemDocumentIdx,
        params,
        error,
        errorMessage: error?.message,
        errorResponse: error?.response,
        errorResponseData: error?.response?.data,
        errorResponseStatus: error?.response?.status,
        errorResponseHeaders: error?.response?.headers,
        errorStack: error?.stack,
      });
    }
    throw error;
  }
}

/**
 * 근로자 서명 등록
 * POST /safety-system/documents/{safetySystemDocumentIdx}/worker-signatures/{workerSignatureIdx}/sign
 * 근로자가 교육 영상 시청 완료 후 서명을 등록합니다. 시청 완료(WATCHED) 상태에서만 서명이 가능합니다.
 * 결재 서명 등록과 사용법은 동일함
 */
// 근로자 서명 등록
// POST /safety-system/documents/{safetySystemDocumentIdx}/worker-signatures/sign
// 근로자가 교육 영상 시청 완료 후 서명을 등록합니다. workerSignatureIdx는 토큰에서 추출하거나 더 이상 URL에 포함되지 않습니다.
export async function addWorkerSignature(
  safetySystemDocumentIdx: number,
  workerSignatureIdx: number, // 더 이상 사용되지 않음 (API 변경됨)
  params: AddWorkerSignatureDto
): Promise<void> {
  await axiosInstance.post(
    `${endpoints.safetySystem.documents}/${safetySystemDocumentIdx}/worker-signatures/sign`,
    params
  );
}

/**
 * 교육 영상 시청 진행률 업데이트
 * PATCH /safety-system/documents/{safetySystemDocumentIdx}/worker-signatures/{workerSignatureIdx}/watch
 *
 * 사용 방법:
 * - 시청 완료 시: isCompleted: 1만 전송 (가장 효율적)
 * - 진행률 업데이트: currentTime과 duration을 전송하면 자동 계산
 * - 직접 진행률: watchProgress를 직접 전송
 *
 * 권장 방식:
 * - 시청 완료 시점에만 isCompleted: 1 전송
 * - 중간 진행률은 선택적으로 업데이트 (예: 10초마다 또는 10% 구간마다)
 */
export async function updateWorkerSignatureWatch(
  safetySystemDocumentIdx: number,
  workerSignatureIdx: number,
  params: UpdateWorkerSignatureWatchDto
): Promise<void> {
  await axiosInstance.patch(
    `${endpoints.safetySystem.documents}/${safetySystemDocumentIdx}/worker-signatures/${workerSignatureIdx}/watch`,
    params
  );
}

// ----------------------------------------------------------------------
// 위험성 평가 기준 (Risk Assessment Criteria)
// ----------------------------------------------------------------------

/**
 * 위험성 평가 기준 조회
 * GET /safety-system/risk-assessment-criteria
 */
export async function getRiskAssessmentCriteria(): Promise<RiskAssessmentCriteriaResponseDto> {
  const response = await axiosInstance.get<RiskAssessmentCriteriaResponseDto>(
    endpoints.safetySystem.riskAssessmentCriteria
  );
  return response.data;
}

/**
 * 위험성 평가 기준 생성
 * POST /safety-system/risk-assessment-criteria
 */
export async function createRiskAssessmentCriteria(
  params: CreateRiskAssessmentCriteriaDto
): Promise<void> {
  await axiosInstance.post(endpoints.safetySystem.riskAssessmentCriteria, params);
}

/**
 * 위험성 평가 기준 수정
 * PUT /safety-system/risk-assessment-criteria
 */
export async function updateRiskAssessmentCriteria(
  params: UpdateRiskAssessmentCriteriaDto
): Promise<void> {
  await axiosInstance.put(endpoints.safetySystem.riskAssessmentCriteria, params);
}

/**
 * 위험도 레벨 삭제
 * DELETE /safety-system/risk-assessment-levels/{riskAssessmentLevelIdx}
 */
export async function deleteRiskAssessmentLevel(riskAssessmentLevelIdx: number): Promise<void> {
  await axiosInstance.delete(
    `${endpoints.safetySystem.riskAssessmentLevels}/${riskAssessmentLevelIdx}`
  );
}

/**
 * 위험도 레벨 활성/비활성 토글
 * PATCH /safety-system/risk-assessment-levels/{riskAssessmentLevelIdx}/toggle
 */
export async function toggleRiskAssessmentLevel(riskAssessmentLevelIdx: number): Promise<void> {
  await axiosInstance.patch(
    `${endpoints.safetySystem.riskAssessmentLevels}/${riskAssessmentLevelIdx}/toggle`
  );
}
