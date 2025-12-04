// 교육 이수 현황 API 타입 정의

import type { BaseResponseDto } from '../common';

// ----------------------------------------------------------------------

// 멤버 정보 (memberInformation)
export type EducationReportMemberInformation = {
  memberIdx: number;
  memberName: string;
  position: string | null;
  department: string | null;
  memberRole: 'OPERATOR_MANAGER' | 'MANAGEMENT_SUPERVISOR' | 'SAFETY_MANAGER' | 'WORKER';
  memberEmail?: string;
  memberPhone?: string;
};

// 회사 정보 (companyInformation)
export type EducationReportCompanyInformation = {
  companyIdx: number;
  companyName: string;
};

// 교육 리포트 정보 (실제 API 응답 구조)
export type EducationReport = {
  educationReportIdx?: number;
  educationReportId?: string;
  id?: string; // 일부 API에서 사용
  memberIdx?: number;
  companyIdx?: number;
  mandatoryEducation?: number; // 의무교육(분)
  regularEducation?: number; // 정기교육(분)
  totalEducation?: number; // 총 이수(분)
  standardEducation?: number; // 이수 기준(분)
  completionRate?: number; // 이수율 (%)
  createAt?: string;
  memberInformation?: EducationReportMemberInformation;
  companyInformation?: EducationReportCompanyInformation;
  // 하위 호환성을 위한 필드 (deprecated)
  organizationName?: string;
  name?: string;
  position?: string;
  department?: string;
  role?: string;
};

// 교육 이수 현황 목록 조회 요청 파라미터 (실제 API 스펙)
export type GetEducationReportsParams = {
  page?: number;
  pageSize?: number;
  memberIdx?: number;
  companyIdx?: number;
  search?: string; // 검색어 (이름, 조직명)
  role?: string; // 클라이언트 필터용 (서버에 전달하지 않을 수도 있음)
};

// 교육 이수 현황 목록 조회 응답 (실제 API 응답 구조)
export type GetEducationReportsResponse = BaseResponseDto<{
  educationReports: EducationReport[];
  total: number;
  page: number;
  pageSize: number;
}>;

// 교육 리포트 상세 조회 요청 파라미터 (deprecated - GetEducationReportParams 사용)
export type GetEducationDetailParams = {
  id: string;
};

// 교육 상세 정보
export type EducationDetail = EducationReport & {
  educationRecordList?: EducationRecord[];
};

// 교육 리포트 상세 조회 응답 (deprecated - GetEducationReportResponse 사용)
export type GetEducationDetailResponse = BaseResponseDto<EducationDetail>;

// 교육 리포트 생성 요청
export type CreateEducationReportParams = {
  memberIdx: number; // 필수
};

// 교육 리포트 생성 응답
export type CreateEducationReportResponse = BaseResponseDto<EducationReport>;

// 교육 리포트 조회 요청
export type GetEducationReportParams = {
  educationReportIdx: string | number;
};

// 교육 리포트 조회 응답
export type GetEducationReportResponse = BaseResponseDto<EducationDetail>;

// 교육 리포트 수정 요청 (빈 DTO - 항상 이수율 재계산)
export type UpdateEducationReportParams = {
  educationReportIdx: string | number;
};

// 교육 리포트 수정 응답
export type UpdateEducationReportResponse = BaseResponseDto<EducationReport>;

// 교육 기록 등록 요청
export type CreateEducationRecordParams = {
  educationReportIdx: number; // 필수
  method: '집체' | '온라인'; // 교육 방법
  educationName: string; // 교육명
  educationTime: number; // 교육 시간 (분)
  educationDate: string; // 교육 일자 (YYYY-MM-DD)
  educationType: 'MANDATORY' | 'REGULAR'; // 교육 타입
  fileName?: string; // 파일명
  fileUrl?: string; // 파일 URL
  description?: string;
  memo?: string;
};

// 교육 기록 등록 응답
export type CreateEducationRecordResponse = BaseResponseDto<{
  educationRecordId: string;
}>;

// 교육 기록 수정 요청
export type UpdateEducationRecordParams = {
  educationRecordIdx: string | number;
  method?: '집체' | '온라인';
  educationName?: string;
  educationTime?: number; // 교육 시간 (분)
  educationDate?: string; // 교육 일자 (YYYY-MM-DD)
  educationType?: 'MANDATORY' | 'REGULAR';
  fileName?: string; // 파일명 저장
  fileUrl?: string;
  description?: string;
  memo?: string;
};

// 교육 기록 수정 응답
export type UpdateEducationRecordResponse = BaseResponseDto;

// 교육 기록 삭제 요청
export type DeleteEducationRecordParams = {
  educationRecordIdx: string | number;
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
  method?: string; // 일부 API에서 사용 ('집체' | '온라인')
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
  mandatoryEducationList?: EducationRecord[]; // 의무교육 기록 (다른 필드명)
  regularEducationList?: EducationRecord[]; // 정기교육 기록 (다른 필드명)
  mandatoryTotal?: number; // 의무교육 총 시간
  regularTotal?: number; // 정기교육 총 시간
  totalTime?: number; // 총 이수 시간
  joinDate?: string; // 입사일
  isAccidentFreeWorkplace?: boolean; // 무재해 사업장 인증 여부
  // 또는 다른 필드명으로 올 수 있음
  [key: string]: any;
};

// axios 인터셉터에서 평탄화되므로 직접 접근 가능
export type GetEducationDetailStatisticsResponse = BaseResponseDto<EducationDetailStatistics>;

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
