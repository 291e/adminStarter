import type {
  GetEducationReportsParams,
  GetEducationReportsResponse,
  GetEducationDetailParams,
  GetEducationDetailResponse,
  CreateEducationParams,
  CreateEducationResponse,
  UpdateEducationDetailParams,
  UpdateEducationDetailResponse,
} from './education-report.types';

// ----------------------------------------------------------------------

/**
 * 교육 이수 현황 목록 조회
 * GET /api/education-reports
 */
export async function getEducationReports(
  params: GetEducationReportsParams
): Promise<GetEducationReportsResponse> {
  // TODO: API 엔드포인트 구현
  throw new Error('Not implemented');
}

/**
 * 교육 상세 정보 조회
 * GET /api/education-reports/:id
 */
export async function getEducationDetail(
  params: GetEducationDetailParams
): Promise<GetEducationDetailResponse> {
  // TODO: API 엔드포인트 구현
  throw new Error('Not implemented');
}

/**
 * 교육 추가
 * POST /api/education-reports
 */
export async function createEducation(
  params: CreateEducationParams
): Promise<CreateEducationResponse> {
  // TODO: API 엔드포인트 구현
  throw new Error('Not implemented');
}

/**
 * 교육 상세 정보 저장
 * PUT /api/education-reports/:id
 */
export async function updateEducationDetail(
  params: UpdateEducationDetailParams
): Promise<UpdateEducationDetailResponse> {
  // TODO: API 엔드포인트 구현
  throw new Error('Not implemented');
}
