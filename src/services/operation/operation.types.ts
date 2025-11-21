// 현장 운영 관리 API 타입 정의

import type { BaseResponseDto } from '../common';

// ----------------------------------------------------------------------

// 위험 보고 상태
export type RiskReportStatus = 'active' | 'inactive';

// 위험 보고 정보
export type RiskReport = {
  id: string;
  title: string;
  content: string;
  location?: string;
  images?: string[];
  status: RiskReportStatus;
  registrationDate: string;
  // ... 기타 필드
};

// 위험 보고 목록 조회 요청 파라미터
export type GetRiskReportsParams = {
  status?: RiskReportStatus;
  searchKey?: string;
  searchValue?: string;
  startDate?: string;
  endDate?: string;
  page: number;
  pageSize: number;
};

// 위험 보고 목록 조회 응답
export type GetRiskReportsResponse = BaseResponseDto<{
  riskReports: RiskReport[];
  total: number;
  page: number;
  pageSize: number;
}>;

// 위험 보고 등록 요청 파라미터
export type CreateRiskReportParams = {
  title: string;
  content: string;
  location?: string;
  address?: string;
  addressDetail?: string;
  images?: File[];
  // ... 기타 필드
};

// 위험 보고 등록 응답
export type CreateRiskReportResponse = BaseResponseDto<{
  riskReport: RiskReport;
}>;

// 위험 보고 정보 조회 요청
export type GetRiskReportParams = {
  riskReportId: string;
};

// 위험 보고 정보 조회 응답
export type GetRiskReportResponse = BaseResponseDto<RiskReport>;

// 위험 보고 수정 요청
export type UpdateRiskReportParams = {
  riskReportId: string;
  title?: string;
  content?: string;
  location?: string;
  address?: string;
  addressDetail?: string;
  images?: File[];
};

// 위험 보고 수정 응답
export type UpdateRiskReportResponse = BaseResponseDto<RiskReport>;

// 위험 보고 비활성화 요청 파라미터
export type DeactivateRiskReportParams = {
  riskReportId: string;
};

// 위험 보고 삭제 요청 파라미터
export type DeleteRiskReportParams = {
  riskReportId: string;
};

// 채팅방에서 위험 보고 생성 요청
export type CreateRiskReportFromChatParams = {
  chatRoomId: string;
  title: string;
  content: string;
  location?: string;
  images?: File[];
};

// 채팅방에서 위험 보고 생성 응답
export type CreateRiskReportFromChatResponse = BaseResponseDto<RiskReport>;

// 위험 보고 확인 요청
export type ConfirmRiskReportParams = {
  riskReportId: string;
};

