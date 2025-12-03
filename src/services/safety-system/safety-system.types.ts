// Safety System API 타입 정의

import type { BaseResponseDto } from '../common';

// ----------------------------------------------------------------------
// Safety System (시스템)
// ----------------------------------------------------------------------

export type SafetySystem = {
  safetyIdx: number;
  systemName: string;
  sample?: string | null;
  guide?: string | null;
  documentCount: number; // 모든 아이템의 문서 수 합계
  itemList?: SafetySystemItem[]; // API 응답 필드
  items?: SafetySystemItem[]; // UI 호환성을 위한 필드 (itemList의 별칭)
};

// 시스템 목록 조회 응답
export type SafetySystemListResponseDto = BaseResponseDto<{
  systemList: SafetySystem[];
  totalCount: number;
}>;

// 시스템 수정 요청
// 사용 방법:
// 1. 시스템 정보만 수정: { systemName, guide, sample, isActive } (itemList 없음)
// 2. 아이템만 수정: { itemList: [...] } (시스템 정보 필드 없음)
// 3. 시스템 정보와 아이템 함께 수정: { systemName, guide, sample, isActive, itemList: [...] }
export type UpdateSafetySystemDto = {
  systemName?: string;
  guide?: string;
  sample?: string;
  isActive?: number;
  itemList?: UpdateSystemItemDto[];
};

// ----------------------------------------------------------------------
// Safety System Item (아이템)
// ----------------------------------------------------------------------

export type SafetySystemItem = {
  safetySystemItemIdx: number;
  safetyIdx: number;
  itemNumber: number;
  itemName: string; // 문서명 (기존 documentName)
  documentName?: string; // UI 호환성을 위한 필드 (itemName의 별칭)
  cycleUnit: string; // 'YEAR' | 'IMMEDIATE' | 'HALF' | 'QUARTER' | 'DAY' | 'WEEK' | 'ALWAYS'
  lastWrittenAt: Date | string; // Date 타입 또는 ISO 문자열
  itemStatus: string;
  writingCycle: string; // "년", "반기", "분기" 등
  status: 'NORMAL' | 'ALWAYS' | 'APPROACHING' | 'OVERDUE' | string;
  guide?: string | null;
  isActive: number;
  approvalStep?: number; // 결재 단계 (0: 없음, 1: 승인만, 2: 작성+승인, 3: 작성+검토+승인)
  documentList?: SafetySystemDocument[]; // 문서 목록
  documentCount?: number; // UI 호환성을 위한 필드 (documentList?.length)
};

// 아이템 상세 정보 조회 응답
export type SafetySystemItemDetailResponseDto = BaseResponseDto<{
  item: SafetySystemItem; // 아이템 정보
  documentList: SafetySystemDocument[]; // 문서 목록 (approvalProgress, signatureList 포함)
}>;

// 시스템 아이템 수정 요청
// UpdateSafetySystemDto의 itemList 배열에 사용됨
export type UpdateSystemItemDto = {
  safetySystemItemIdx: number; // 필수: 수정할 아이템의 ID
  documentName?: string; // 문서명
  cycle?: number; // 주기 숫자 (선택)
  cycleUnit?: 'YEAR' | 'IMMEDIATE' | 'HALF' | 'QUARTER' | 'DAY' | 'WEEK' | 'ALWAYS'; // 주기 단위
  status?: 'NORMAL' | 'ALWAYS' | 'APPROACHING' | 'OVERDUE'; // 아이템 상태
  guide?: string; // 가이드 파일 URL
  isActive?: number; // 활성 여부 (1: 활성, 0: 비활성)
  approvalStep?: number; // 결재 단계 (0: 없음, 1: 승인만, 2: 작성+승인, 3: 작성+검토+승인)
};

// ----------------------------------------------------------------------
// Safety System Document (문서)
// ----------------------------------------------------------------------

export type SafetySystemDocument = {
  safetySystemDocumentIdx: number;
  safetySystemItemIdx: number;
  documentName: string;
  organizationName: string;
  approvalDeadline?: string; // YYYY-MM-DD
  approvalProgress?: number; // 결재 진행률 (0-100)
  approvalStep?: number | null; // 결재 단계 (0: 없음, 1: 승인만, 2: 작성+승인, 3: 작성+검토+승인)
  isPublished: number; // 0: 미게시, 1: 게시
  publishedAt: Date | string | null;
  status: 'COMPLETED' | 'DRAFT' | 'IN_PROGRESS' | 'PENDING'; // 문서 상태
  guide?: string | null;
  sample?: string | null;
  tableData?: string | any; // JSON string 또는 파싱된 객체
  createAt: Date | string;
  updateAt: Date | string;
  signatureList?: DocumentSignatureInfo[]; // 결재 서명 목록
  approvalList?: DocumentApprovalInfo[]; // 결재 등록 목록 (DocumentApprovalEntity 응답)
};

// 문서 등록 요청
export type CreateSafetySystemDocumentDto = {
  safetySystemItemIdx: number;
  organizationName: string;
  documentName: string;
  tableData?: string; // JSON string
};

// 문서 등록 응답
export type CreateSafetySystemDocumentResponseDto = BaseResponseDto<SafetySystemDocument>;

// 문서 수정 요청
// PATCH /safety-system/documents/{safetySystemDocumentIdx}
export type UpdateSafetySystemDocumentDto = {
  approvalDeadline?: string; // 승인 마감일 (YYYY-MM-DD)
  tableData?: string; // 테이블 데이터 (JSON)
  approvalStep?: number; // 결재 단계 (0: 없음, 1: 승인만, 2: 작성+승인, 3: 작성+검토+승인)
};

// 문서 상세 조회 응답
export type SafetySystemDocumentDetailResponseDto = BaseResponseDto<{
  document: SafetySystemDocument;
}>;

// ----------------------------------------------------------------------
// 결재 (Approval)
// ----------------------------------------------------------------------

export type ApprovalTargetDto = {
  targetMemberIdx: number; // 대상자 Index (필수)
  approvalStep: number; // 결재 단계 (필수): 1(승인), 2(작성), 3(검토)
  approvalOrder?: number; // 결재 순서 (선택)
};

export type CreateDocumentApprovalDto = {
  approvalType: 'sequential' | 'parallel'; // 순차 결재 | 병렬 결재
  approvalTargetList: ApprovalTargetDto[]; // approvalStep과 memberIdx를 함께 지정
};

// 결재 서명 등록 요청 (swagger: AddApprovalSignatureDto)
export type AddApprovalSignatureDto = {
  signatureData: string; // Base64 (필수)
  approvalStatus: 'APPROVED' | 'REJECTED'; // 결재 상태 (필수)
  description?: string; // 설명 (선택)
};

// ----------------------------------------------------------------------
// 결재 등록 정보 (Approval)
// ----------------------------------------------------------------------

// 결재 등록 정보 (문서의 approvalList에서 사용)
export type DocumentApprovalInfo = {
  documentApprovalIdx: number;
  safetySystemDocumentIdx: number; // 문서 ID (documentIdx에서 변경됨)
  targetMemberIdx: number;
  memberName?: string;
  memberEmail?: string;
  approvalStep: number; // 1: 승인, 2: 작성, 3: 검토
  approvalOrder?: number; // 결재 순서
  approvalType: 'SEQUENTIAL' | 'PARALLEL'; // 순차 결재 | 병렬 결재
  approvalStatus: 'APPROVED' | 'REJECTED' | 'PENDING'; // 결재 상태
  signatureData?: string | null; // Base64 서명 데이터
  approvedAt?: string | null; // 승인일 (ISO 문자열)
  createAt: string; // 생성일 (ISO 문자열)
  updateAt?: string; // 수정일 (ISO 문자열)
  deletedAt?: string | null; // 삭제일 (ISO 문자열)
  description?: string | null; // 설명
};

// ----------------------------------------------------------------------
// 서명 (Signature)
// ----------------------------------------------------------------------

// 결재 서명 정보 (문서의 signatureList에서 사용)
export type DocumentSignatureInfo = {
  documentApprovalIdx: number;
  targetMemberIdx: number;
  memberName: string;
  memberEmail?: string;
  approvalStep: number; // 1: 승인, 2: 작성, 3: 검토
  approvalOrder?: number; // 결재 순서
  approvalType: 'SEQUENTIAL' | 'PARALLEL'; // 순차 결재 | 병렬 결재
  approvalStatus: 'APPROVED' | 'REJECTED' | 'PENDING'; // 결재 상태
  signatureData?: string; // Base64 서명 데이터
  approvedAt?: string; // 승인일 (ISO 문자열)
  createAt: string; // 생성일 (ISO 문자열)
  description?: string; // 설명
};

// ----------------------------------------------------------------------
// 알림 및 게시
// ----------------------------------------------------------------------

export type SendNotificationDto = {
  notificationType: 'approval_request' | 'signature_request' | 'deadline_reminder';
  targetMemberIndexList: number[];
  reminderDays?: number; // 마감일 D-day
};

export type PublishDocumentDto = {
  priorityIdx: number; // 중요도 설정 Index (PrioritySetting.priorityIdx)
  isPublished: number; // 게시 여부 (0: 미게시, 1: 게시)
  documentName?: string; // 문서명 (게시 시 문서명 수정 가능)
};

// ----------------------------------------------------------------------
// 화학물질
// ----------------------------------------------------------------------

export type GetChemicalListParams = {
  search: string;
  searchType: string;
  pageNo: number;
  numOfRows: number;
};

export type ChemicalListResponseDto = BaseResponseDto<{
  chemicalList: string[]; // 실제 타입은 API 응답에 따라 조정 필요
  searchType: string;
  pageNo: number;
  numOfRows: number;
  totalCount: number;
}>;
