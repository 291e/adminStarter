// 현장 운영 관리 API 타입 정의

import type { BaseResponseDto } from '../common';

// ----------------------------------------------------------------------

// 위험 보고 상태
export type RiskReportStatus = 'CONFIRMED' | 'UNCONFIRMED' | 'PENDING';

export type RiskReport = {
  id: string;
  riskReportIdx: string | number;
  title: string;
  location: string;
  content: string;
  status: RiskReportStatus;
  registeredAt: string;
  confirmedAt?: string | null;
  companyName?: string;
  companyIdx?: number;
  reporterName?: string;
  reporterDepartment?: string;
  reporterMemberIdx?: number | null;
  authorName?: string;
  authorMemberIdx?: number | null;
  imageUrl?: string | null;
  imageUrls?: string[];
  signalType?: string | null;
  sourceType?: string | null;
  description?: string | null;
  memo?: string | null;
  chatRoomId?: string | null;
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
  riskReportList: RiskReport[];
  totalCount: number;
}>;

// 위험 보고 등록 요청 파라미터
export type CreateRiskReportParams = {
  title?: string;
  location: string;
  content: string;
  imageUrl?: string;
  imageUrls?: string[];
  signalType?: 'RISK' | 'RESCUE' | 'EVACUATION';
  sourceType?: 'CHAT' | 'DIRECT';
  description?: string;
  memo?: string;
  chatRoomIdx?: number; // 채팅방 Index
  reporterMemberIdx?: number; // 보고자 INDEX
  reporterName?: string;
  authorMemberIdx?: number; // 작성자 INDEX
  authorName?: string;
};

// 위험 보고 등록 응답
export type CreateRiskReportResponse = BaseResponseDto<{
  riskReport: RiskReport;
}>;

// 위험 보고 정보 조회 요청
export type GetRiskReportParams = {
  riskReportIdx: string | number;
};

// 위험 보고 정보 조회 응답
export type GetRiskReportResponse = BaseResponseDto<RiskReport>;

// 위험 보고 수정 요청
export type UpdateRiskReportParams = {
  riskReportIdx: string | number;
  title?: string;
  location?: string;
  content?: string;
  imageUrl?: string;
  imageUrls?: string[];
  signalType?: 'RISK' | 'RESCUE' | 'EVACUATION';
  status?: 'UNCONFIRMED' | 'CONFIRMED';
  description?: string;
  memo?: string;
  isActive?: boolean; // 활성화 여부 (false 시 비활성화)
  reporterMemberIdx?: number;
  reporterName?: string;
  authorMemberIdx?: number;
  authorName?: string;
};

// 위험 보고 수정 응답
export type UpdateRiskReportResponse = BaseResponseDto<RiskReport>;

// 위험 보고 비활성화 요청 파라미터
export type DeleteRiskReportParams = {
  riskReportIdx: string | number;
};

// 채팅방에서 위험 보고 생성 요청
export type CreateRiskReportFromChatParams = {
  chatRoomIdx: string | number;
  title: string;
  content: string;
  location: string;
  imageUrl?: string;
  imageUrls?: string[];
  signalType?: 'RISK' | 'RESCUE' | 'EVACUATION';
  sourceType?: 'CHAT' | 'DIRECT';
  description?: string;
  memo?: string;
  reporterMemberIdx?: number;
  reporterName?: string;
  authorMemberIdx?: number;
  authorName?: string;
};

// 채팅방에서 위험 보고 생성 응답
export type CreateRiskReportFromChatResponse = BaseResponseDto<RiskReport>;
