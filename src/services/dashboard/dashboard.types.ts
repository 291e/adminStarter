import type { BaseResponseDto, BaseResponseHeader } from '../common';

// 서명 대기 문서 (실제 응답 구조)
export type DocumentSignature = {
  id?: string;
  documentId?: string;
  sharedDocumentIdx?: number; // 공유 문서 인덱스
  documentName?: string; // 문서 이름
  requestedAt: string;
  signatureStatus: 'PENDING' | 'SIGNED' | 'REJECTED';
  signatureType: 'APPROVAL' | 'REVIEW';
  signedAt: string | null;
  targetMemberIdx: number;
  targetMemberName: string;
};

// axios 인터셉터에서 평탄화되므로 직접 접근 가능
export type GetDocumentSignatureListResponse = {
  header: BaseResponseHeader;
  documentSignatureList: DocumentSignature[];
  totalCount: number;
};

// 중요도 정보 (중첩 객체)
export type PriorityInformation = {
  priorityIdx: number;
  labelType: string;
  color: string;
  isActive: number;
};

// 공유 문서 (실제 응답 구조)
export type SharedDocument = {
  sharedDocumentIdx: number;
  documentName: string;
  documentWrittenAt: string;
  priorityIdx: number;
  priorityInformation: PriorityInformation | null;
  createAt: string;
  fileUrl: string;
  fileName: string;
  fileSize: string;
  memberIdx: number;
  memberName: string;
  sharedByCompanyIdx: number;
  sharedByCompanyName: string;
  viewCount: number;
  downloadCount: number;
  isPublic: number;
  referenceType: string;
  referenceId: string;
};

export type GetSharedDocumentListParams = {
  page?: number;
  pageSize?: number;
};

// axios 인터셉터에서 평탄화되므로 직접 접근 가능
export type GetSharedDocumentListResponse = {
  header: BaseResponseHeader;
  sharedDocumentList: SharedDocument[];
  totalCount: number;
};

// 공유 문서 생성 요청 (API 스펙에 맞게 수정)
export type CreateSharedDocumentParams = {
  documentName: string;
  documentWrittenAt?: string; // YYYY-MM-DD
  referenceType?: 'SAFETY_SYSTEM_DOCUMENT' | 'LIBRARY_REPORT' | 'SAFETY_REPORT' | 'CUSTOM';
  referenceId?: string;
  priority?: string | null; // 자유 문자열 (nullable)
  priorityIdx?: number; // 중요도 설정 Index
  isPublic?: number; // 0: 비공개, 1: 공개
  fileName?: string; // 파일명 (파일 업로드 후 설정)
  fileUrl?: string; // 파일 URL (파일 업로드 후 설정)
  fileSize?: number; // 파일 크기 (bytes, 파일 업로드 후 설정)
  description?: string;
  memo?: string;
};

// 공유 문서 생성 응답
export type CreateSharedDocumentResponse = BaseResponseDto<SharedDocument>;

// 공유 문서 수정 요청 (API 스펙에 맞게 수정)
export type UpdateSharedDocumentParams = {
  sharedDocumentIdx: number; // 경로 파라미터
  documentName?: string;
  documentWrittenAt?: string; // YYYY-MM-DD
  priority?: string | null; // 자유 문자열 (nullable)
  priorityIdx?: number; // 중요도 설정 Index
  isPublic?: number; // 0: 비공개, 1: 공개
  fileName?: string;
  fileUrl?: string;
  fileSize?: number;
  description?: string;
  memo?: string;
};

// 공유 문서 수정 응답
export type UpdateSharedDocumentResponse = BaseResponseDto<SharedDocument>;

// 공유 문서 삭제 요청
export type DeleteSharedDocumentParams = {
  sharedDocumentIdx: number;
};

// 공유 문서 채팅방 공유 요청
export type ShareDocumentToChatRoomParams = {
  sharedDocumentIdx: number; // 경로 파라미터
  chatRoomIdxList: number[]; // 채팅방 Index 목록
};

// 사고·위험 보고 통계 조회 요청
export type GetRiskReportStatisticsParams = {
  startDate?: string;
  endDate?: string;
};

// 사고·위험 보고 통계 (실제 응답 구조)
export type RiskReportStatistics = {
  totalCount: number;
  confirmedCount: number;
  unconfirmedCount: number;
  riskCount: number;
  evacuationCount: number;
  rescueCount: number;
};

// axios 인터셉터에서 평탄화되므로 직접 접근 가능
export type GetRiskReportStatisticsResponse = {
  header: BaseResponseHeader;
  statistics: RiskReportStatistics;
};

// 사용자 프로필 (실제 응답 구조)
export type MemberProfile = {
  memberIdx: number;
  memberId: string;
  memberName: string;
  memberEmail: string;
  memberPhone?: string;
  memberRole?: string;
  memberStatus?: string;
  memberThumbnail?: string;
  companyIdx?: number;
  isAccidentFreeWorksite?: 0 | 1; // 무재해 사업장 여부
  joinedAt?: string | null; // 입사일 (YYYY-MM-DD 또는 ISO 형식)
  department?: string; // 소속팀
  position?: string; // 직급
  isSuperAdmin?: boolean; // 슈퍼관리자 여부
  // ... 기타 필드
};

// axios 인터셉터에서 평탄화되므로 직접 접근 가능
export type GetMemberProfileResponse = {
  header: BaseResponseHeader;
  member: MemberProfile;
};

export type GetEducationCompletionRateParams = {
  role?: string;
};

// 교육 이수율 응답 (실제 응답 구조)
export type EducationCompletion = {
  completionRate: string;
  mandatoryEducation: number;
  regularEducation: number;
  standardEducation: number;
  totalEducation: number;
};

// axios 인터셉터에서 평탄화되므로 직접 접근 가능
export type GetEducationCompletionRateResponse = {
  header: BaseResponseHeader;
  educationCompletion: EducationCompletion;
};

// 중요도 설정 (API 응답 구조에 맞게 수정)
export type PrioritySetting = {
  priorityIdx: number;
  color: string;
  labelType: string | null; // 자유 문자열 (nullable)
  isActive: number;
  order: number;
  createdBy?: number;
  updatedBy?: number;
  createAt?: string;
  updateAt?: string;
  deletedAt?: string | null;
};

export type GetPrioritySettingListResponse = BaseResponseDto<{
  prioritySettingList: PrioritySetting[];
}>;

// 중요도 설정 생성 요청
export type CreatePrioritySettingParams = {
  color: string;
  labelType: string | null; // 자유 문자열 (nullable)
  isActive: number;
  order: number;
};

// 중요도 설정 생성 응답
export type CreatePrioritySettingResponse = BaseResponseDto<PrioritySetting>;

// 중요도 설정 수정 요청
export type UpdatePrioritySettingParams = {
  priorityIdx: number; // 경로 파라미터
  color?: string;
  labelType?: string | null; // 자유 문자열 (nullable)
  isActive?: number;
  order?: number;
};

// 중요도 설정 수정 응답
export type UpdatePrioritySettingResponse = BaseResponseDto<PrioritySetting>;

// 중요도 설정 삭제 요청
export type DeletePrioritySettingParams = {
  priorityIdx: number;
};

// 공유 문서 상세 조회 요청
export type GetSharedDocumentDetailParams = {
  sharedDocumentIdx: number;
};

// 원본 문서 정보 (공유 문서 상세 조회 응답)
export type OriginalDocument = {
  safetySystemDocumentIdx: number;
  safetySystemItemIdx: number;
  documentName: string;
  organizationName: string;
  tableData?: string | any; // JSON string 또는 파싱된 객체
  approvalStep?: number | null; // 결재 단계 (0: 없음, 1: 승인만, 2: 작성+승인, 3: 작성+검토+승인)
  status?: 'COMPLETED' | 'DRAFT' | 'IN_PROGRESS' | 'PENDING' | string;
  approvalList?: Array<{
    documentApprovalIdx: number;
    safetySystemDocumentIdx: number; // 문서 ID (documentIdx에서 변경됨)
    targetMemberIdx: number;
    memberName?: string;
    memberEmail?: string;
    approvalStep: number; // 1: 승인, 2: 작성, 3: 검토
    approvalOrder?: number;
    approvalType: 'SEQUENTIAL' | 'PARALLEL';
    approvalStatus: 'APPROVED' | 'REJECTED' | 'PENDING';
    signatureData?: string | null;
    approvedAt?: string | null;
    createAt: string;
    updateAt?: string;
    deletedAt?: string | null;
    description?: string | null;
  }>;
  [key: string]: any; // 기타 필드 허용
};

// 공유 문서 상세 정보
export type SharedDocumentDetail = {
  sharedDocumentIdx: number;
  documentName: string;
  referenceType: string; // 'SAFETY_SYSTEM_DOCUMENT' | 'LIBRARY_REPORT' | 'SAFETY_REPORT' | 'CUSTOM'
  referenceId: string;
  originalDocument?: OriginalDocument | null;
};

// 공유 문서 상세 조회 응답
export type GetSharedDocumentDetailResponse = {
  header: BaseResponseHeader;
  sharedDocument: SharedDocumentDetail;
};

// 안전 시스템 문서 상세 조회 요청
export type GetSafetySystemDocumentDetailParams = {
  safetySystemDocumentIdx: number;
};

// 안전 시스템 문서 상세 조회 응답
export type GetSafetySystemDocumentDetailResponse = {
  header: BaseResponseHeader;
  sharedDocument: SharedDocumentDetail | null; // 공유 문서 정보 (있는 경우)
  originalDocument: OriginalDocument;
};
