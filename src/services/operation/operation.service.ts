import type {
  GetRiskReportsParams,
  GetRiskReportsResponse,
  CreateRiskReportParams,
  CreateRiskReportResponse,
  DeactivateRiskReportParams,
  DeactivateRiskReportResponse,
  DeleteRiskReportParams,
  DeleteRiskReportResponse,
} from './operation.types';

// ----------------------------------------------------------------------

/**
 * 위험 보고 목록 조회
 * GET /api/risk-reports
 */
export async function getRiskReports(
  params: GetRiskReportsParams
): Promise<GetRiskReportsResponse> {
  // TODO: API 엔드포인트 구현
  throw new Error('Not implemented');
}

/**
 * 위험 보고 등록
 * POST /api/risk-reports
 */
export async function createRiskReport(
  params: CreateRiskReportParams
): Promise<CreateRiskReportResponse> {
  // TODO: API 엔드포인트 구현
  throw new Error('Not implemented');
}

/**
 * 위험 보고 비활성화
 * PATCH /api/risk-reports/:id/deactivate
 */
export async function deactivateRiskReport(
  params: DeactivateRiskReportParams
): Promise<DeactivateRiskReportResponse> {
  // TODO: API 엔드포인트 구현
  throw new Error('Not implemented');
}

/**
 * 위험 보고 삭제
 * DELETE /api/risk-reports/:id
 */
export async function deleteRiskReport(
  params: DeleteRiskReportParams
): Promise<DeleteRiskReportResponse> {
  // TODO: API 엔드포인트 구현
  throw new Error('Not implemented');
}
