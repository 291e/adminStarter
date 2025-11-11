// 교육 이수 현황 API 타입 정의

import type { BaseResponseDto } from '../common';

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

// 교육 상세 조회 요청 파라미터
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

// 교육 상세 조회 응답
export type GetEducationDetailResponse = BaseResponseDto<EducationDetail>;

// 교육 추가 요청 파라미터
export type CreateEducationParams = {
  name: string;
  date: string;
  content?: string;
};

// 교육 추가 응답
export type CreateEducationResponse = BaseResponseDto<{
  education: EducationReport;
}>;

// 교육 상세 정보 저장 요청 파라미터
export type UpdateEducationDetailParams = {
  id: string;
  participants: Array<{
    id: string;
    completionStatus: 'completed' | 'pending';
  }>;
};

// 교육 상세 정보 저장 응답
export type UpdateEducationDetailResponse = BaseResponseDto;
