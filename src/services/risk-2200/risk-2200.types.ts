// Risk_2200 API 타입 정의

import type { BaseResponseDto } from '../common';

// 문서 목록 조회
export type GetRisk2200DocumentsParams = {
  safetyIdx?: number;
  itemNumber?: number;
  filterType?: string;
  searchField?: string;
  searchValue?: string;
  page: number;
  pageSize: number;
};

export type Risk2200Document = {
  id: string;
  sequence: number;
  registeredAt: string;
  registeredTime: string;
  organizationName: string;
  documentName: string;
  writtenAt: string;
  approvalDeadline: string;
  completionRate: number;
};

export type GetRisk2200DocumentsResponse = BaseResponseDto<{
  documents: Risk2200Document[];
  total: number;
  page: number;
  pageSize: number;
}>;

// 문서 상세 정보 조회
export type GetRisk2200DocumentDetailParams = {
  documentId: string;
};

export type Risk2200DocumentDetail = {
  id: string;
  documentNumber: string;
  documentDate: string;
  approvalDeadline: string;
  tableData: unknown; // 문서 타입별로 다른 구조
  // ... 기타 필드
};

export type GetRisk2200DocumentDetailResponse = BaseResponseDto<Risk2200DocumentDetail>;

// 문서 등록
export type CreateRisk2200DocumentParams = {
  safetyIdx?: number;
  itemNumber?: number;
  documentDate: string;
  approvalDeadline: string;
  rows?: unknown[]; // 1300, 1500, 2200, 2300번대
  data?: unknown; // 1400, 2100번대
};

export type CreateRisk2200DocumentResponse = BaseResponseDto<{
  documentId: string;
  documentNumber: string;
}>;

// 문서 임시 저장
export type TemporarySaveRisk2200DocumentParams = {
  safetyIdx?: number;
  itemNumber?: number;
  documentDate: string;
  approvalDeadline: string;
  rows?: unknown[]; // 1300, 1500, 2200, 2300번대
  data?: unknown; // 1400, 2100번대
};

export type TemporarySaveRisk2200DocumentResponse = BaseResponseDto<{
  documentId: string;
}>;

// 임시 저장된 문서 불러오기
export type GetRisk2200TemporaryDocumentParams = {
  documentId: string;
};

export type GetRisk2200TemporaryDocumentResponse = BaseResponseDto<Risk2200DocumentDetail>;

// 문서 삭제
export type DeleteRisk2200DocumentParams = {
  documentId: string;
};

export type DeleteRisk2200DocumentResponse = BaseResponseDto<void>;

// 알림 발송
export type SendRisk2200NotificationParams = {
  documentId: string;
};

export type SendRisk2200NotificationResponse = BaseResponseDto<void>;

// 액션 처리 (엑셀 내보내기, 인쇄 등)
export type ExportRisk2200DocumentsParams = {
  action: string;
  selectedIds: string[];
};

export type ExportRisk2200DocumentsResponse = BaseResponseDto<{
  downloadUrl?: string;
}>;

// PDF 다운로드용 문서 정보 조회
export type GetRisk2200DocumentInfoParams = {
  documentId: string;
};

export type GetRisk2200DocumentInfoResponse = BaseResponseDto<{
  documentNumber: string;
  documentDate: string;
  // ... 기타 필드
}>;

// 샘플 문서 조회
export type GetRisk2200SampleDocumentParams = {
  safetyIdx?: number;
  itemNumber?: number;
};

export type GetRisk2200SampleDocumentResponse = BaseResponseDto<Risk2200DocumentDetail>;

// 테이블 데이터 조회 (기본값용)
export type GetRisk2200TableDataParams = {
  safetyIdx?: number;
  itemNumber?: number;
};

export type GetRisk2200TableDataResponse = BaseResponseDto<{
  tableData: unknown[];
}>;

// Item 정보 조회
export type GetRisk2200ItemInfoParams = {
  safetyIdx?: number;
  itemNumber?: number;
};

export type SafetySystemItem = {
  safetyIdx: number;
  itemNumber: number;
  documentName: string;
  // ... 기타 필드
};

export type GetRisk2200ItemInfoResponse = BaseResponseDto<SafetySystemItem>;

// 결재 정보 조회
export type GetRisk2200ApprovalInfoParams = {
  documentId: string;
};

export type ApprovalInfo = {
  writer?: {
    name: string;
    date: string;
    signature?: string;
  };
  reviewer?: {
    name: string;
    date: string;
    signature?: string;
  };
  approver?: {
    name: string;
    date: string;
    signature?: string;
  };
  approvalDate?: string;
};

export type GetRisk2200ApprovalInfoResponse = BaseResponseDto<ApprovalInfo>;

// 서명 추가
export type AddRisk2200SignatureParams = {
  documentId: string;
  signatureType: 'writer' | 'reviewer' | 'approver';
  signatureData: {
    name: string;
    signature: string; // 서명 이미지 또는 데이터
  };
};

export type AddRisk2200SignatureResponse = BaseResponseDto<void>;

// 화학물질 목록 조회
export type GetChemicalsParams = {
  searchQuery?: string;
};

export type Chemical = {
  id: string;
  name: string;
  casNo?: string;
};

export type GetChemicalsResponse = BaseResponseDto<{
  chemicals: Chemical[];
}>;

// CAS 번호 목록 조회
export type GetCasNumbersParams = {
  searchQuery?: string;
};

export type CasNumber = {
  id: string;
  casNo: string;
  chemicalName?: string;
};

export type GetCasNumbersResponse = BaseResponseDto<{
  casNumbers: CasNumber[];
}>;

