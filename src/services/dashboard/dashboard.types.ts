import type { BaseResponseDto, BaseResponseHeader } from '../common';

// 서명 대기 문서 (실제 응답 구조)
export type DocumentSignature = {
  id: string;
  documentId: string;
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

// 공유 문서 (실제 응답 구조)
export type SharedDocument = {
  id: string;
  documentName: string;
  documentWrittenAt: string;
  priority: string | null; // 자유 문자열 (nullable)
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
  referenceType?: 'safety_system_document' | 'library_report' | 'safety_report' | 'custom';
  referenceId?: string;
  priority?: string | null; // 자유 문자열 (nullable)
  priorityId?: string; // 중요도 설정 ID
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
  documentId: string;
  documentName?: string;
  documentWrittenAt?: string; // YYYY-MM-DD
  priority?: string | null; // 자유 문자열 (nullable)
  priorityId?: string; // 중요도 설정 ID
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
  documentId: string;
};

// 공유 문서 채팅방 공유 요청
export type ShareDocumentToChatRoomParams = {
  documentId: string;
  chatRoomIdList: string[];
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
  id: string; // API에서는 id 필드 사용
  prioritySettingId?: string; // 호환성을 위해 유지 (id와 동일)
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
  prioritySettingId: string;
  color?: string;
  labelType?: string | null; // 자유 문자열 (nullable)
  isActive?: number;
  order?: number;
};

// 중요도 설정 수정 응답
export type UpdatePrioritySettingResponse = BaseResponseDto<PrioritySetting>;

// 중요도 설정 삭제 요청
export type DeletePrioritySettingParams = {
  prioritySettingId: string;
};
