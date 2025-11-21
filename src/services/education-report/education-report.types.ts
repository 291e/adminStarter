// 교육 이수 현황 API 타입 정의

import type { BaseResponseDto, BaseResponseHeader } from '../common';

// ----------------------------------------------------------------------

// 교육 리포트 정보
export type EducationReport = {
  id: string;
  name: string;
  date: string;
  participants: number;
  completionRate: number;
  // ... 기타 필드
};

// 교육 이수 현황 목록 조회 요청 파라미터
export type GetEducationReportsParams = {
  role?: string;
  searchKey?: string;
  searchValue?: string;
  page: number;
  pageSize: number;
};

// 교육 이수 현황 목록 조회 응답
export type GetEducationReportsResponse = BaseResponseDto<{
  educationReports: EducationReport[];
  total: number;
}>;

// 교육 리포트 상세 조회 요청 파라미터 (deprecated - GetEducationReportParams 사용)
export type GetEducationDetailParams = {
  id: string;
};

// 교육 상세 정보
export type EducationDetail = {
  education: EducationReport;
  participants: Array<{
    id: string;
    name: string;
    joinDate: string;
    role: string;
    completionStatus: 'completed' | 'pending';
  }>;
};

// 교육 리포트 상세 조회 응답 (deprecated - GetEducationReportResponse 사용)
export type GetEducationDetailResponse = BaseResponseDto<EducationDetail>;

// 교육 리포트 생성 요청
export type CreateEducationReportParams = {
  title: string;
  description?: string;
  startDate: string;
  endDate?: string;
};

// 교육 리포트 생성 응답
export type CreateEducationReportResponse = BaseResponseDto<EducationReport>;

// 교육 리포트 조회 요청
export type GetEducationReportParams = {
  educationReportId: string;
};

// 교육 리포트 조회 응답
export type GetEducationReportResponse = BaseResponseDto<EducationDetail>;

// 교육 리포트 수정 요청
export type UpdateEducationReportParams = {
  educationReportId: string;
  title?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
};

// 교육 리포트 수정 응답
export type UpdateEducationReportResponse = BaseResponseDto<EducationReport>;

// 교육 기록 등록 요청
export type CreateEducationRecordParams = {
  educationReportId: string;
  memberIndex: number;
  educationDate: string;
  educationHours: number;
  files?: File[];
};

// 교육 기록 등록 응답
export type CreateEducationRecordResponse = BaseResponseDto<{
  educationRecordId: string;
}>;

// 교육 기록 수정 요청
export type UpdateEducationRecordParams = {
  educationRecordId: string;
  educationDate?: string;
  educationHours?: number;
  fileName?: string; // 파일명 저장
};

// 교육 기록 수정 응답
export type UpdateEducationRecordResponse = BaseResponseDto;

// 교육 기록 삭제 요청
export type DeleteEducationRecordParams = {
  educationRecordId: string;
};

// 교육 상세 현황 조회 요청 (실제 API: memberIdx 필수)
export type GetEducationDetailStatisticsParams = {
  memberIdx: number; // 필수 파라미터
  role?: string;
  startDate?: string;
  endDate?: string;
};

// 교육 기록 정보 (실제 API 응답 구조)
export type EducationRecord = {
  educationRecordId?: string;
  id?: string; // 일부 API에서 사용
  educationReportId?: string;
  memberIdx?: number;
  educationDate: string;
  educationTime?: number; // 일부 API에서 사용
  educationHours?: number; // 일부 API에서 사용
  educationType?: 'mandatory' | 'regular' | 'MANDATORY' | 'REGULAR'; // 의무교육, 정기교육
  educationName: string;
  method?: string; // 일부 API에서 사용
  educationMethod?: string; // 교육 방식
  fileName?: string;
  fileUrl?: string;
  description?: string;
  memo?: string;
  // ... 기타 필드
};

// 교육 상세 현황 조회 응답 (실제 응답 구조 - 유연하게 처리)
export type EducationDetailStatistics = {
  mandatoryEducation?: EducationRecord[]; // 의무교육 기록
  regularEducation?: EducationRecord[]; // 정기교육 기록
  mandatoryTotal?: number; // 의무교육 총 시간
  regularTotal?: number; // 정기교육 총 시간
  totalTime?: number; // 총 이수 시간
  // 또는 다른 필드명으로 올 수 있음
  [key: string]: any;
};

// axios 인터셉터에서 평탄화되므로 직접 접근 가능
export type GetEducationDetailStatisticsResponse = {
  header: BaseResponseHeader;
  educationDetail: EducationDetailStatistics;
};

// 교육 기준 정보
export type EducationStandard = {
  educationStandardId: string;
  role: string;
  requiredHours: number;
};

// 역할별 교육 이수 기준 시간 조회 응답
export type GetEducationStandardListResponse = BaseResponseDto<{
  standards: EducationStandard[];
}>;

// 역할별 교육 이수 기준 시간 생성 요청
export type CreateEducationStandardParams = {
  role: string;
  requiredHours: number;
};

// 역할별 교육 이수 기준 시간 생성 응답
export type CreateEducationStandardResponse = BaseResponseDto<EducationStandard>;

// 역할별 교육 이수 기준 시간 수정 요청
export type UpdateEducationStandardParams = {
  educationStandardId: string;
  role?: string;
  requiredHours?: number;
};

// 역할별 교육 이수 기준 시간 수정 응답
export type UpdateEducationStandardResponse = BaseResponseDto<EducationStandard>;
