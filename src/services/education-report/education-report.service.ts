import axiosInstance from 'src/lib/axios';

import { endpoints } from 'src/lib/axios';

import type {
  GetEducationReportsParams,
  GetEducationReportsResponse,
  CreateEducationReportParams,
  CreateEducationReportResponse,
  GetEducationReportParams,
  GetEducationReportResponse,
  UpdateEducationReportParams,
  UpdateEducationReportResponse,
  CreateEducationRecordParams,
  CreateEducationRecordResponse,
  UpdateEducationRecordParams,
  UpdateEducationRecordResponse,
  DeleteEducationRecordParams,
  GetEducationDetailStatisticsParams,
  GetEducationDetailStatisticsResponse,
  GetEducationStandardListResponse,
  CreateEducationStandardParams,
  CreateEducationStandardResponse,
  UpdateEducationStandardParams,
  UpdateEducationStandardResponse,
} from './education-report.types';

// ----------------------------------------------------------------------

/**
 * 교육 이수 현황 목록 조회
 * GET /education/reports
 */
export async function getEducationReports(
  params?: GetEducationReportsParams
): Promise<GetEducationReportsResponse> {
  const response = await axiosInstance.get<GetEducationReportsResponse>(
    endpoints.education.reports,
    { params }
  );
  return response.data;
}

/**
 * 교육 리포트 생성
 * POST /education/reports
 */
export async function createEducationReport(
  params: CreateEducationReportParams
): Promise<CreateEducationReportResponse> {
  const response = await axiosInstance.post<CreateEducationReportResponse>(
    endpoints.education.reports,
    params
  );
  return response.data;
}

/**
 * 교육 상세 정보 조회
 * GET /education/reports/{educationReportId}
 */
export async function getEducationReport(
  params: GetEducationReportParams
): Promise<GetEducationReportResponse> {
  const response = await axiosInstance.get<GetEducationReportResponse>(
    `${endpoints.education.reports}/${params.educationReportId}`
  );
  return response.data;
}

/**
 * 교육 리포트 수정
 * PUT /education/reports/{educationReportId}
 */
export async function updateEducationReport(
  params: UpdateEducationReportParams
): Promise<UpdateEducationReportResponse> {
  const response = await axiosInstance.put<UpdateEducationReportResponse>(
    `${endpoints.education.reports}/${params.educationReportId}`,
    params
  );
  return response.data;
}

/**
 * 교육 기록 등록 (증빙자료 포함)
 * POST /education/records
 */
export async function createEducationRecord(
  params: CreateEducationRecordParams
): Promise<CreateEducationRecordResponse> {
  const formData = new FormData();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      if (key === 'files' && Array.isArray(value)) {
        value.forEach((file) => formData.append('files', file));
      } else {
        formData.append(key, String(value));
      }
    }
  });

  const response = await axiosInstance.post<CreateEducationRecordResponse>(
    endpoints.education.records,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data;
}

/**
 * 교육 기록 수정
 * PUT /education/records/{educationRecordId}
 */
export async function updateEducationRecord(
  params: UpdateEducationRecordParams
): Promise<UpdateEducationRecordResponse> {
  const response = await axiosInstance.put<UpdateEducationRecordResponse>(
    `${endpoints.education.records}/${params.educationRecordId}`,
    params
  );
  return response.data;
}

/**
 * 교육 기록 삭제
 * DELETE /education/records/{educationRecordId}
 */
export async function deleteEducationRecord(
  params: DeleteEducationRecordParams
): Promise<void> {
  await axiosInstance.delete(`${endpoints.education.records}/${params.educationRecordId}`);
}

/**
 * 교육 상세 현황 조회
 * GET /education/detail?memberIdx={memberIdx}
 */
export async function getEducationDetail(
  params: GetEducationDetailStatisticsParams
): Promise<GetEducationDetailStatisticsResponse> {
  // memberIdx는 필수 파라미터이므로 명시적으로 전달
  const response = await axiosInstance.get<GetEducationDetailStatisticsResponse>(
    endpoints.education.detail,
    {
      params: {
        memberIdx: params.memberIdx, // 필수 파라미터
        role: params.role,
        startDate: params.startDate,
        endDate: params.endDate,
      },
    }
  );
  return response.data;
}

/**
 * 역할별 교육 이수 기준 시간 조회
 * GET /education/standards
 */
export async function getEducationStandardList(): Promise<GetEducationStandardListResponse> {
  const response = await axiosInstance.get<GetEducationStandardListResponse>(
    endpoints.education.standards
  );
  return response.data;
}

/**
 * 역할별 교육 이수 기준 시간 생성
 * POST /education/standards
 */
export async function createEducationStandard(
  params: CreateEducationStandardParams
): Promise<CreateEducationStandardResponse> {
  const response = await axiosInstance.post<CreateEducationStandardResponse>(
    endpoints.education.standards,
    params
  );
  return response.data;
}

/**
 * 역할별 교육 이수 기준 시간 수정
 * PUT /education/standards/{educationStandardId}
 */
export async function updateEducationStandard(
  params: UpdateEducationStandardParams
): Promise<UpdateEducationStandardResponse> {
  const response = await axiosInstance.put<UpdateEducationStandardResponse>(
    `${endpoints.education.standards}/${params.educationStandardId}`,
    params
  );
  return response.data;
}
