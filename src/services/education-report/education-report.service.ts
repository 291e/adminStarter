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
  // 디버깅: 요청 파라미터 로그
  if (import.meta.env.DEV) {
    console.log('📤 API Request: getEducationReports', {
      method: 'GET',
      url: endpoints.education.reports,
      params,
    });
  }

  const response = await axiosInstance.get(endpoints.education.reports, { params });

  // 디버깅: 응답 로그
  if (import.meta.env.DEV) {
    console.log('📥 API Response: getEducationReports', {
      method: 'GET',
      url: endpoints.education.reports,
      status: response.status,
      data: response.data,
    });
  }

  // 실제 API 응답 구조에 맞게 매핑
  // 응답이 { header, educationReportList, totalCount } 형태일 수 있음
  const rawData = response.data;
  
  // BaseResponseDto 구조로 변환
  const mappedResponse: GetEducationReportsResponse = {
    header: rawData.header || {
      isSuccess: true,
      resultCode: '0',
      resultMessage: 'SUCCESS',
      timestamp: new Date().toISOString(),
    },
    body: {
      educationReports: Array.isArray(rawData.educationReportList)
        ? rawData.educationReportList.map((item: any) => ({
            id: item.educationReportId || item.id || String(item.memberIdx || ''),
            educationReportId: item.educationReportId || item.id,
            memberIdx: item.memberIdx,
            companyIdx: item.companyIdx,
            organizationName: item.organizationName || '',
            name: item.name || '',
            position: item.position || '',
            department: item.department || '',
            role: item.role || '',
            mandatoryEducation: item.mandatoryEducation || 0,
            regularEducation: item.regularEducation || 0,
            totalEducation: item.totalEducation || 0,
            standardEducation: item.standardEducation || 0,
            completionRate: item.completionRate || 0,
            description: item.description,
            memo: item.memo,
          }))
        : [],
      total: rawData.totalCount || 0,
      page: params?.page || 1,
      pageSize: params?.pageSize || 10,
    },
  };

  return mappedResponse;
}

/**
 * 교육 리포트 생성
 * POST /education/reports
 */
export async function createEducationReport(
  params: CreateEducationReportParams
): Promise<CreateEducationReportResponse> {
  // 디버깅: 요청 파라미터 로그
  if (import.meta.env.DEV) {
    console.log('📤 API Request: createEducationReport', {
      method: 'POST',
      url: endpoints.education.reports,
      params,
    });
  }

  const response = await axiosInstance.post<CreateEducationReportResponse>(
    endpoints.education.reports,
    params
  );

  // 디버깅: 응답 로그
  if (import.meta.env.DEV) {
    console.log('📥 API Response: createEducationReport', {
      method: 'POST',
      url: endpoints.education.reports,
      status: response.status,
      data: response.data,
    });
  }

  return response.data;
}

/**
 * 교육 상세 정보 조회
 * GET /education/reports/{educationReportId}
 */
export async function getEducationReport(
  params: GetEducationReportParams
): Promise<GetEducationReportResponse> {
  // 디버깅: 요청 파라미터 로그
  if (import.meta.env.DEV) {
    console.log('📤 API Request: getEducationReport', {
      method: 'GET',
      url: `${endpoints.education.reports}/${params.educationReportIdx}`,
      params,
    });
  }

  const response = await axiosInstance.get<GetEducationReportResponse>(
    `${endpoints.education.reports}/${params.educationReportIdx}`
  );

  // 디버깅: 응답 로그
  if (import.meta.env.DEV) {
    console.log('📥 API Response: getEducationReport', {
      method: 'GET',
      url: `${endpoints.education.reports}/${params.educationReportIdx}`,
      status: response.status,
      data: response.data,
    });
  }

  return response.data;
}

/**
 * 교육 리포트 수정
 * PUT /education/reports/{educationReportId}
 */
export async function updateEducationReport(
  params: UpdateEducationReportParams
): Promise<UpdateEducationReportResponse> {
  // 디버깅: 요청 파라미터 로그
  if (import.meta.env.DEV) {
    console.log('📤 API Request: updateEducationReport', {
      method: 'PUT',
      url: `${endpoints.education.reports}/${params.educationReportIdx}`,
      params,
    });
  }

  const { educationReportIdx, ...body } = params;
  const response = await axiosInstance.put<UpdateEducationReportResponse>(
    `${endpoints.education.reports}/${educationReportIdx}`,
    body
  );

  // 디버깅: 응답 로그
  if (import.meta.env.DEV) {
    console.log('📥 API Response: updateEducationReport', {
      method: 'PUT',
      url: `${endpoints.education.reports}/${educationReportIdx}`,
      status: response.status,
      data: response.data,
    });
  }

  return response.data;
}

/**
 * 교육 기록 등록 (증빙자료 포함)
 * POST /education/records
 */
export async function createEducationRecord(
  params: CreateEducationRecordParams
): Promise<CreateEducationRecordResponse> {
  // 디버깅: 요청 파라미터 로그
  if (import.meta.env.DEV) {
    console.log('📤 API Request: createEducationRecord', {
      method: 'POST',
      url: endpoints.education.records,
      params,
    });
  }

  const response = await axiosInstance.post<CreateEducationRecordResponse>(
    endpoints.education.records,
    params
  );

  // 디버깅: 응답 로그
  if (import.meta.env.DEV) {
    console.log('📥 API Response: createEducationRecord', {
      method: 'POST',
      url: endpoints.education.records,
      status: response.status,
      data: response.data,
    });
  }

  return response.data;
}

/**
 * 교육 기록 수정
 * PUT /education/records/{educationRecordId}
 */
export async function updateEducationRecord(
  params: UpdateEducationRecordParams
): Promise<UpdateEducationRecordResponse> {
  // 디버깅: 요청 파라미터 로그
  if (import.meta.env.DEV) {
    console.log('📤 API Request: updateEducationRecord', {
      method: 'PUT',
      url: `${endpoints.education.records}/${params.educationRecordIdx}`,
      params,
    });
  }

  const { educationRecordIdx, ...body } = params;
  const response = await axiosInstance.put<UpdateEducationRecordResponse>(
    `${endpoints.education.records}/${educationRecordIdx}`,
    body
  );

  // 디버깅: 응답 로그
  if (import.meta.env.DEV) {
    console.log('📥 API Response: updateEducationRecord', {
      method: 'PUT',
      url: `${endpoints.education.records}/${educationRecordIdx}`,
      status: response.status,
      data: response.data,
    });
  }

  return response.data;
}

/**
 * 교육 기록 삭제
 * DELETE /education/records/{educationRecordId}
 */
export async function deleteEducationRecord(
  params: DeleteEducationRecordParams
): Promise<void> {
  // 디버깅: 요청 파라미터 로그
  if (import.meta.env.DEV) {
    console.log('📤 API Request: deleteEducationRecord', {
      method: 'DELETE',
      url: `${endpoints.education.records}/${params.educationRecordIdx}`,
      params,
    });
  }

  const response = await axiosInstance.delete(
    `${endpoints.education.records}/${params.educationRecordIdx}`
  );

  // 디버깅: 응답 로그
  if (import.meta.env.DEV) {
    console.log('📥 API Response: deleteEducationRecord', {
      method: 'DELETE',
      url: `${endpoints.education.records}/${params.educationRecordIdx}`,
      status: response.status,
    });
  }
}

/**
 * 교육 상세 현황 조회
 * GET /education/detail?memberIdx={memberIdx}
 */
export async function getEducationDetail(
  params: GetEducationDetailStatisticsParams
): Promise<GetEducationDetailStatisticsResponse> {
  // 디버깅: 요청 파라미터 로그
  if (import.meta.env.DEV) {
    console.log('📤 API Request: getEducationDetail', {
      method: 'GET',
      url: endpoints.education.detail,
      params,
    });
  }

  // memberIdx는 필수 파라미터이므로 명시적으로 전달
  const response = await axiosInstance.get(endpoints.education.detail, {
    params: {
      memberIdx: params.memberIdx, // 필수 파라미터
      role: params.role,
      startDate: params.startDate,
      endDate: params.endDate,
    },
  });

  // 디버깅: 응답 로그
  if (import.meta.env.DEV) {
    console.log('📥 API Response: getEducationDetail', {
      method: 'GET',
      url: endpoints.education.detail,
      status: response.status,
      data: response.data,
    });
  }

  // 실제 API 응답 구조에 맞게 매핑
  const rawData = response.data;
  
  // BaseResponseDto 구조로 변환
  const mappedResponse: GetEducationDetailStatisticsResponse = {
    header: rawData.header || {
      isSuccess: true,
      resultCode: '0',
      resultMessage: 'SUCCESS',
      timestamp: new Date().toISOString(),
    },
    body: {
      mandatoryEducation: rawData.educationDetail?.mandatoryEducation || rawData.educationDetail?.mandatoryEducationList || [],
      regularEducation: rawData.educationDetail?.regularEducation || rawData.educationDetail?.regularEducationList || [],
      mandatoryTotal: rawData.educationDetail?.mandatoryTotal || 0,
      regularTotal: rawData.educationDetail?.regularTotal || 0,
      totalTime: rawData.educationDetail?.totalTime || 0,
      joinDate: rawData.educationDetail?.joinDate,
      isAccidentFreeWorkplace: rawData.educationDetail?.isAccidentFreeWorkplace || false,
      ...rawData.educationDetail,
    },
  };

  return mappedResponse;
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
