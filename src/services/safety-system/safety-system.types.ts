// Safety System API 타입 정의

import type { BaseResponseDto } from '../common';

// 문서 정보
export type SafetySystemDocument = {
  documentId: string;
  safetyIdx: number;
  itemNumber: number;
  writtenAt: string;
  approvalDeadline?: string;
  organizationName: string;
  // ... 기타 필드
};

// 문서 목록 조회 파라미터
export type GetSafetySystemDocumentListParams = {
  page?: number;
  pageSize?: number;
  safetyIdx?: number;
};

// 문서 목록 조회 응답
export type SafetySystemDocumentListResponseDto = BaseResponseDto<{
  safetySystemDocumentList: SafetySystemDocument[];
  totalCount: number;
}>;

// 문서 상세 조회 요청
export type GetSafetySystemDocumentParams = {
  documentId: string;
};

// 문서 상세 조회 응답
export type SafetySystemDocumentDetailResponseDto = BaseResponseDto<SafetySystemDocument>;

// 문서 등록 요청
export type CreateSafetySystemDocumentDto = {
  safetyIdx: number;
  itemNumber: number;
  writtenAt: string;
  approvalDeadline?: string;
  organizationName: string;
  fileName?: string;
  fileUrl?: string;
  fileSize?: number;
  description?: string;
  memo?: string;
};

// 문서 등록 응답
export type CreateSafetySystemDocumentResponse = BaseResponseDto<SafetySystemDocument>;

// 문서 수정 요청
export type UpdateSafetySystemDocumentParams = {
  documentId: string;
  safetyIdx?: number;
  itemNumber?: number;
  writtenAt?: string;
  approvalDeadline?: string;
  organizationName?: string;
  fileName?: string;
  fileUrl?: string;
  fileSize?: number;
  description?: string;
  memo?: string;
};

// 문서 수정 응답
export type UpdateSafetySystemDocumentResponse = BaseResponseDto<SafetySystemDocument>;

// 문서 삭제 요청
export type DeleteSafetySystemDocumentParams = {
  documentId: string;
};

// 문서 임시 저장 요청
export type SaveDraftSafetySystemDocumentParams = CreateSafetySystemDocumentDto;

// 문서 임시 저장 응답
export type SaveDraftSafetySystemDocumentResponse = BaseResponseDto<SafetySystemDocument>;

// Item 정보 조회 응답
export type GetItemInfoResponse = BaseResponseDto<{
  items: Array<{
    itemNumber: number;
    itemName: string;
    // ... 기타 필드
  }>;
}>;

// 결재 정보 조회 응답
export type GetDocumentApprovalInfoResponse = BaseResponseDto<{
  approvals: Array<{
    approvalId: string;
    memberIndex: number;
    memberName: string;
    status: 'pending' | 'approved' | 'rejected';
    // ... 기타 필드
  }>;
}>;

// 문서 결재 대상자 등록 요청
export type CreateDocumentApprovalParams = {
  documentId: string;
  memberIndexes: number[];
};

// 문서 서명 대상자 등록 요청
export type CreateDocumentSignatureParams = {
  documentId: string;
  memberIndexes: number[];
};

// 결재 진행률 조회 응답
export type GetApprovalProgressResponse = BaseResponseDto<{
  total: number;
  approved: number;
  pending: number;
  rejected: number;
  progressRate: number;
}>;

// 서명 진행률 조회 응답
export type GetSignatureProgressResponse = BaseResponseDto<{
  total: number;
  signed: number;
  pending: number;
  progressRate: number;
}>;

// 서명 상태 조회 응답
export type GetSignatureStatusResponse = BaseResponseDto<{
  signatures: Array<{
    signatureId: string;
    memberIndex: number;
    memberName: string;
    status: 'pending' | 'signed';
    signedAt?: string;
  }>;
}>;

// 서명 추가 요청
export type AddSignatureParams = {
  documentId: string;
  memberIndexes: number[];
};

// 알림 발송 요청
export type SendNotificationParams = {
  documentId: string;
  notificationType?: string;
};

// 문서 게시 요청
export type PublishDocumentParams = {
  documentId: string;
};

// 화학물질 목록 조회 응답
export type GetChemicalListResponse = BaseResponseDto<{
  chemicals: Array<{
    chemicalId: string;
    name: string;
    casNumber?: string;
    // ... 기타 필드
  }>;
}>;

// CAS No 목록 조회 응답
export type GetCasNoListResponse = BaseResponseDto<{
  casNumbers: string[];
}>;

// 액션 처리 요청
export type ProcessActionParams = {
  documentId: string;
  action: 'export-excel' | 'print' | string;
};

