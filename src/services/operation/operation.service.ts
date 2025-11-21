import axiosInstance from 'src/lib/axios';

import { endpoints } from 'src/lib/axios';

import type {
  GetRiskReportsParams,
  GetRiskReportsResponse,
  CreateRiskReportParams,
  CreateRiskReportResponse,
  GetRiskReportParams,
  GetRiskReportResponse,
  UpdateRiskReportParams,
  UpdateRiskReportResponse,
  DeactivateRiskReportParams,
  DeleteRiskReportParams,
  CreateRiskReportFromChatParams,
  CreateRiskReportFromChatResponse,
  ConfirmRiskReportParams,
} from './operation.types';

// ----------------------------------------------------------------------

/**
 * 위험 보고 목록 조회
 * GET /operation/risk-reports
 */
export async function getRiskReports(
  params?: GetRiskReportsParams
): Promise<GetRiskReportsResponse> {
  const response = await axiosInstance.get<GetRiskReportsResponse>(
    endpoints.operation.riskReports,
    { params }
  );
  return response.data;
}

/**
 * 위험 보고 등록
 * POST /operation/risk-reports
 */
export async function createRiskReport(
  params: CreateRiskReportParams
): Promise<CreateRiskReportResponse> {
  const response = await axiosInstance.post<CreateRiskReportResponse>(
    endpoints.operation.riskReports,
    params
  );
  return response.data;
}

/**
 * 위험 보고 정보 조회
 * GET /operation/risk-reports/{riskReportId}
 */
export async function getRiskReport(
  params: GetRiskReportParams
): Promise<GetRiskReportResponse> {
  const response = await axiosInstance.get<GetRiskReportResponse>(
    `${endpoints.operation.riskReports}/${params.riskReportId}`
  );
  return response.data;
}

/**
 * 위험 보고 수정
 * PUT /operation/risk-reports/{riskReportId}
 */
export async function updateRiskReport(
  params: UpdateRiskReportParams
): Promise<UpdateRiskReportResponse> {
  const response = await axiosInstance.put<UpdateRiskReportResponse>(
    `${endpoints.operation.riskReports}/${params.riskReportId}`,
    params
  );
  return response.data;
}

/**
 * 위험 보고 삭제
 * DELETE /operation/risk-reports/{riskReportId}
 */
export async function deleteRiskReport(
  params: DeleteRiskReportParams
): Promise<void> {
  await axiosInstance.delete(`${endpoints.operation.riskReports}/${params.riskReportId}`);
}

/**
 * 위험 보고 비활성화
 * PATCH /operation/risk-reports/{riskReportId}/deactivate
 */
export async function deactivateRiskReport(
  params: DeactivateRiskReportParams
): Promise<void> {
  await axiosInstance.patch(
    `${endpoints.operation.riskReports}/${params.riskReportId}/deactivate`
  );
}

/**
 * 채팅방에서 위험 보고 생성
 * POST /operation/chat-rooms/{chatRoomId}/risk-reports
 */
export async function createRiskReportFromChat(
  params: CreateRiskReportFromChatParams
): Promise<CreateRiskReportFromChatResponse> {
  const response = await axiosInstance.post<CreateRiskReportFromChatResponse>(
    `${endpoints.operation.chatRooms}/${params.chatRoomId}/risk-reports`,
    params
  );
  return response.data;
}

/**
 * 위험 보고 확인
 * PATCH /operation/risk-reports/{riskReportId}/confirm
 */
export async function confirmRiskReport(params: ConfirmRiskReportParams): Promise<void> {
  await axiosInstance.patch(
    `${endpoints.operation.riskReports}/${params.riskReportId}/confirm`
  );
}
