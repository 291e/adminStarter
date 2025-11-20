/**
 * 데이터베이스 ERD 및 TypeORM 스타일 엔티티 정의
 *
 * 이 파일은 프로젝트에서 사용하는 모든 목업 데이터를 데이터베이스 스키마 형식으로 정의합니다.
 * 실제 데이터베이스 구현 시 TypeORM 엔티티로 변환하여 사용할 수 있습니다.
 */

// ============================================================================
// 기본 타입 정의
// ============================================================================

export type PrimaryKey = number | string;
export type ForeignKey<T extends PrimaryKey = PrimaryKey> = T | null;
export type Timestamp = string; // ISO 8601 형식
export type Status = 'active' | 'inactive';
export type UUID = string;

// ============================================================================
// 0. SuperAdmin (슈퍼어드민)
// ============================================================================

export interface SuperAdmin {
  // 기본 키
  superAdminIdx: number; // PK, AUTO_INCREMENT

  // 외래 키
  memberIdx: number; // FK → Member.memberIdx (UNIQUE)
  createdBy: ForeignKey<number>; // FK → Member.memberIdx (생성자)
  updatedBy: ForeignKey<number>; // FK → Member.memberIdx (수정자)

  // 속성
  isActive: 0 | 1; // 활성화 여부 (0: 비활성, 1: 활성)
  description: string | null;
  createAt: Timestamp;
  updateAt: Timestamp;
  deletedAt: Timestamp | null; // Soft Delete
}

// ============================================================================
// 1. Company (회사)
// ============================================================================

export interface Company {
  // 기본 키
  companyIdx: number; // PK, AUTO_INCREMENT

  // 외래 키
  createdBy: ForeignKey<number>; // FK → Member.memberIdx (생성자, onDelete: SET NULL)
  updatedBy: ForeignKey<number>; // FK → Member.memberIdx (수정자, onDelete: SET NULL)

  // 속성
  companyName: string;
  companyCode: string | null; // 회사 코드
  businessNumber: string | null; // 사업자등록번호
  address: string | null;
  phone: string | null;
  email: string | null;
  description: string | null;
  memo: string | null;
  isActive: 0 | 1; // 활성화 여부 (0: 비활성, 1: 활성)
  isAccidentFreeWorksite: 0 | 1; // 무재해 사업장 여부 (0: 아니오, 1: 예)
  accidentFreeStatus: 'pending' | 'approved' | 'rejected'; // 무재해 인증 상태
  accidentFreeCertifiedAt: Timestamp | null; // 무재해 인증일
  accidentFreeExpiresAt: Timestamp | null; // 무재해 인증 만료일
  createAt: Timestamp;
  updateAt: Timestamp;
  deletedAt: Timestamp | null; // Soft Delete
}

// ============================================================================
// 2. CompanyBranch (회사 지점)
// ============================================================================

export interface CompanyBranch {
  // 기본 키
  companyBranchIdx: number; // PK, AUTO_INCREMENT

  // 외래 키
  companyIdx: number; // FK → Company.companyIdx (onDelete: CASCADE)
  branchManager1MemberIdx: ForeignKey<number>; // FK → Member.memberIdx (nullable, onDelete: SET NULL)
  branchManager2MemberIdx: ForeignKey<number>; // FK → Member.memberIdx (nullable, onDelete: SET NULL)
  createdBy: ForeignKey<number>; // FK → Member.memberIdx (생성자, onDelete: SET NULL)
  updatedBy: ForeignKey<number>; // FK → Member.memberIdx (수정자, onDelete: SET NULL)

  // 속성
  companyBranchName: string;
  branchCode: string | null; // 지점 코드
  address: string | null;
  phone: string | null;
  email: string | null;
  description: string | null;
  memo: string | null;
  isActive: 0 | 1; // 활성화 여부 (0: 비활성, 1: 활성)
  createAt: Timestamp;
  updateAt: Timestamp;
  deletedAt: Timestamp | null; // Soft Delete
}

// ============================================================================
// 3. Member (멤버/사용자)
// ============================================================================

export interface Member {
  // 기본 키
  memberIdx: number; // PK, AUTO_INCREMENT

  // 대체 키
  memberId: string; // AK, UNIQUE

  // 외래 키
  companyIdx: number; // FK → Company.companyIdx (onDelete: SET NULL)
  companyBranchIdx: ForeignKey<number>; // FK → CompanyBranch.companyBranchIdx (nullable, onDelete: SET NULL)
  createdBy: ForeignKey<number>; // FK → Member.memberIdx (생성자, 자기참조, onDelete: SET NULL)
  updatedBy: ForeignKey<number>; // FK → Member.memberIdx (수정자, 자기참조, onDelete: SET NULL)

  // 속성
  memberRole: 'admin' | 'member' | 'distributor' | 'agency' | 'dealer'; // 슈퍼어드민은 SuperAdmin 테이블로 관리
  memberName: string;
  memberEmail: string;
  memberPhone: string;
  memberStatus: Status;
  memberAddress: string;
  memberAddressDetail: string | null;
  memberMemo: string | null;
  memberThumbnail: string | null;
  memberNameOrg: string | null;
  memberLang: string;
  password: string; // 해시된 비밀번호
  duplicateSigninKey: string | null;
  lastSigninAt: Timestamp | null; // 마지막 로그인 시간
  joinedAt: Timestamp; // 입사일 (이수율 계산용)
  deviceToken: string | null;
  deviceGubun: 'web' | 'ios' | 'android' | null;
  memberlat: number | null;
  memberlng: number | null;
  lastLocationUpdateAt: Timestamp | null;
  loginAttempts: number;
  loginBlockedUntil: Timestamp | null;
  description: string | null;
  createAt: Timestamp;
  updateAt: Timestamp;
  deletedAt: Timestamp | null; // Soft Delete
}

// ============================================================================
// 4. EducationReport (교육 리포트)
// ============================================================================

export interface EducationReport {
  // 기본 키
  id: UUID; // PK

  // 외래 키
  memberIdx: number; // FK → Member.memberIdx (onDelete: SET NULL)
  companyIdx: number; // FK → Company.companyIdx (onDelete: SET NULL)
  createdBy: ForeignKey<number>; // FK → Member.memberIdx (생성자, onDelete: SET NULL)
  updatedBy: ForeignKey<number>; // FK → Member.memberIdx (수정자, onDelete: SET NULL)

  // 속성
  organizationName: string;
  name: string;
  position: string;
  department: string;
  role: string;
  mandatoryEducation: number; // 분
  regularEducation: number; // 분
  totalEducation: number; // 분
  standardEducation: number; // 분
  completionRate: number; // %
  description: string | null;
  memo: string | null;
  createAt: Timestamp;
  updateAt: Timestamp;
  deletedAt: Timestamp | null; // Soft Delete
}

// ============================================================================
// 5. EducationRecord (교육 기록)
// ============================================================================

export interface EducationRecord {
  // 기본 키
  id: UUID; // PK

  // 외래 키
  memberIdx: number; // FK → Member.memberIdx (onDelete: SET NULL)
  educationReportId: UUID; // FK → EducationReport.id (onDelete: CASCADE)
  createdBy: ForeignKey<number>; // FK → Member.memberIdx (생성자, onDelete: SET NULL)
  updatedBy: ForeignKey<number>; // FK → Member.memberIdx (수정자, onDelete: SET NULL)

  // 속성
  method: '집체' | '온라인';
  educationName: string;
  educationTime: number; // 분
  educationDate: string; // YYYY-MM-DD
  educationType: 'mandatory' | 'regular'; // 교육 타입 (필수/정기)
  fileName: string | null;
  fileUrl: string | null;
  description: string | null;
  memo: string | null;
  createAt: Timestamp;
  updateAt: Timestamp;
  deletedAt: Timestamp | null; // Soft Delete
}

// ============================================================================
// 5-1. EducationStandard (교육 이수 기준 시간)
// ============================================================================

export interface EducationStandard {
  // 기본 키
  id: UUID; // PK

  // 외래 키
  createdBy: ForeignKey<number>; // FK → Member.memberIdx (생성자, onDelete: SET NULL)
  updatedBy: ForeignKey<number>; // FK → Member.memberIdx (수정자, onDelete: SET NULL)

  // 속성
  role: string; // 역할 (조직관리자, 관리감독자, 안전보건 담당자, 근로자)
  workType: 'production' | 'office' | null; // 직종 (생산직/사무직, 근로자만)
  standardHours: number; // 기준 시간 (분)
  period: 'year' | 'quarter'; // 이수 기간 (연/분기)
  isAccidentFreeReduction: 0 | 1; // 무재해 사업장 감면 적용 여부 (0: 미적용, 1: 적용)
  reductionRate: number; // 감면율 (%)
  isActive: 0 | 1; // 활성화 여부 (0: 비활성, 1: 활성)
  order: number; // 정렬 순서
  description: string | null;
  createAt: Timestamp;
  updateAt: Timestamp;
  deletedAt: Timestamp | null; // Soft Delete
}

// ============================================================================
// 6. SafetySystem (안전 시스템 그룹)
// ============================================================================

export interface SafetySystem {
  // 기본 키
  safetyIdx: number; // PK

  // 외래 키
  createdBy: ForeignKey<number>; // FK → Member.memberIdx (생성자, onDelete: SET NULL)
  updatedBy: ForeignKey<number>; // FK → Member.memberIdx (수정자, onDelete: SET NULL)

  // 속성
  systemName: string;
  description: string | null;
  order: number;
  isActive: 0 | 1; // 활성화 여부 (0: 비활성, 1: 활성)
  createAt: Timestamp;
  updateAt: Timestamp;
  deletedAt: Timestamp | null; // Soft Delete
}

// ============================================================================
// 7. SafetySystemItem (안전 시스템 아이템)
// ============================================================================

export interface SafetySystemItem {
  // 복합 기본 키
  safetyIdx: number; // PK (복합키)
  itemNumber: number; // PK (복합키)

  // 외래 키
  // safetyIdx → SafetySystem.safetyIdx (이미 PK에 포함, onDelete: CASCADE)
  createdBy: ForeignKey<number>; // FK → Member.memberIdx (생성자, onDelete: SET NULL)
  updatedBy: ForeignKey<number>; // FK → Member.memberIdx (수정자, onDelete: SET NULL)

  // 속성
  documentName: string;
  documentCount: number;
  cycle: number;
  cycleUnit: 'year' | 'immediate' | 'half' | 'day';
  lastWrittenAt: Timestamp;
  status: 'normal' | 'always' | 'approaching' | 'overdue';
  description: string | null;
  memo: string | null;
  createAt: Timestamp;
  updateAt: Timestamp;
  deletedAt: Timestamp | null; // Soft Delete
}

// ============================================================================
// 8. SafetySystemDocument (안전 시스템 문서)
// ============================================================================

export interface SafetySystemDocument {
  // 복합 기본 키
  safetyIdx: number; // PK (복합키)
  itemNumber: number; // PK (복합키)
  documentNumber: number; // PK (복합키)

  // 외래 키
  // (safetyIdx, itemNumber) → SafetySystemItem(safetyIdx, itemNumber) (onDelete: CASCADE)
  createdBy: ForeignKey<number>; // FK → Member.memberIdx (생성자, onDelete: SET NULL)
  updatedBy: ForeignKey<number>; // FK → Member.memberIdx (수정자, onDelete: SET NULL)
  uploadedBy: ForeignKey<number>; // FK → Member.memberIdx (업로드자, onDelete: SET NULL)

  // 속성
  sequence: number;
  registeredAt: Timestamp; // 등록일시 (ISO 8601)
  organizationName: string;
  documentName: string;
  writtenAt: string; // YYYY-MM-DD (문서 작성일)
  approvalDeadline: string; // YYYY-MM-DD (승인 마감일)
  completionRate: {
    removal: number;
    engineering: number;
  };
  isPublished: 0 | 1; // 게시 여부 (0: 미게시, 1: 게시)
  publishedAt: Timestamp | null; // 게시일
  fileName: string | null;
  fileUrl: string | null;
  fileSize: number | null; // bytes
  description: string | null;
  memo: string | null;
  createAt: Timestamp;
  updateAt: Timestamp;
  deletedAt: Timestamp | null; // Soft Delete
}

// ============================================================================
// 9. ChatRoom (채팅방)
// ============================================================================

export interface ChatRoom {
  // 기본 키
  id: UUID; // PK

  // 외래 키
  createdBy: ForeignKey<number>; // FK → Member.memberIdx (생성자, onDelete: SET NULL)
  organizationIdx: ForeignKey<number>; // FK → Company.companyIdx (nullable, onDelete: SET NULL)
  emergencyRoomCompanyIdx: ForeignKey<number>; // FK → Company.companyIdx (사고 발생 현황 채팅방의 조직 ID, nullable, onDelete: SET NULL)

  // 속성
  name: string;
  type: 'chatbot' | 'emergency' | 'normal' | 'group';
  isGroup: 0 | 1; // 그룹 채팅 여부 (0: 아니오, 1: 예)
  organizationName: string | null;
  lastMessage: string | null;
  lastMessageAt: Timestamp | null; // 마지막 메시지 시간
  unreadCount: number | null;
  avatar: string | null;
  description: string | null;
  isActive: 0 | 1; // 활성화 여부 (0: 비활성, 1: 활성)
  createAt: Timestamp;
  updateAt: Timestamp;
  deletedAt: Timestamp | null; // Soft Delete
}

// ============================================================================
// 10. ChatMessage (채팅 메시지)
// ============================================================================

export interface ChatMessage {
  // 기본 키
  id: UUID; // PK

  // 외래 키
  chatRoomId: UUID; // FK → ChatRoom.id (onDelete: CASCADE)
  senderMemberIdx: number; // FK → Member.memberIdx (onDelete: SET NULL)
  sharedDocumentId: ForeignKey<UUID>; // FK → SharedDocument.id (공유된 문서 ID, nullable, onDelete: SET NULL)

  // 속성
  sender: string; // 캐시된 발신자 이름
  senderAvatar: string | null;
  message: string;
  messageType: 'text' | 'image' | 'file' | 'system';
  signalType: 'risk' | 'rescue' | 'evacuation' | null; // 신호 타입 (사고 발생 현황 채팅방용)
  attachments: string[] | null; // 파일 URL 배열
  isRead: 0 | 1; // 읽음 여부 (0: 안읽음, 1: 읽음)
  isOwn: 0 | 1; // 본인 메시지 여부 (0: 아니오, 1: 예)
  createAt: Timestamp; // 메시지 전송 시간
  updateAt: Timestamp;
  deletedAt: Timestamp | null; // Soft Delete
}

// ============================================================================
// 11. ChatParticipant (채팅 참가자)
// ============================================================================

export interface ChatParticipant {
  // 기본 키
  id: UUID; // PK

  // 외래 키
  chatRoomId: UUID; // FK → ChatRoom.id (onDelete: CASCADE)
  memberIdx: number; // FK → Member.memberIdx (onDelete: CASCADE)
  invitedBy: ForeignKey<number>; // FK → Member.memberIdx (초대한 사람, onDelete: SET NULL)

  // 속성
  role: string; // 'admin' | 'member' | 'viewer' 등
  joinedAt: Timestamp; // 참가 시간
  leftAt: Timestamp | null; // 나간 시간
  isRead: 0 | 1; // 메시지 읽음 여부 (0: 안읽음, 1: 읽음)
  lastReadAt: Timestamp | null; // 마지막 읽은 시간
  isActive: 0 | 1; // 활성화 여부 (0: 비활성, 1: 활성)
  createAt: Timestamp;
  updateAt: Timestamp;
  deletedAt: Timestamp | null; // Soft Delete
}

// ============================================================================
// 12. Checklist (체크리스트)
// ============================================================================

export interface Checklist {
  // 기본 키
  id: UUID; // PK

  // 외래 키
  createdBy: ForeignKey<number>; // FK → Member.memberIdx (생성자, onDelete: SET NULL)
  updatedBy: ForeignKey<number>; // FK → Member.memberIdx (수정자, onDelete: SET NULL)

  // 속성
  order: number;
  industry: string;
  highRiskWork: string;
  status: Status;
  description: string | null;
  memo: string | null;
  createAt: Timestamp;
  updateAt: Timestamp;
  deletedAt: Timestamp | null; // Soft Delete
}

// ============================================================================
// 13. DisasterFactor (재해 유발 요인)
// ============================================================================

export interface DisasterFactor {
  // 기본 키
  id: UUID; // PK

  // 외래 키
  checklistId: UUID; // FK → Checklist.id (onDelete: CASCADE)
  createdBy: ForeignKey<number>; // FK → Member.memberIdx (생성자, onDelete: SET NULL)
  updatedBy: ForeignKey<number>; // FK → Member.memberIdx (수정자, onDelete: SET NULL)

  // 속성
  factorName: string;
  description: string | null;
  order: number;
  isActive: 0 | 1; // 활성화 여부 (0: 비활성, 1: 활성)
  createAt: Timestamp;
  updateAt: Timestamp;
  deletedAt: Timestamp | null; // Soft Delete
}

// ============================================================================
// 14. CodeSetting (코드 설정)
// ============================================================================

export interface CodeSetting {
  // 기본 키
  id: UUID; // PK

  // 외래 키
  createdBy: ForeignKey<number>; // FK → Member.memberIdx (생성자, onDelete: SET NULL)
  updatedBy: ForeignKey<number>; // FK → Member.memberIdx (수정자, onDelete: SET NULL)

  // 속성
  order: number;
  code: string;
  name: string;
  categoryType: 'machine' | 'hazard';
  status: Status;

  // 기계·설비용 필드
  inspectionCycle?: string;
  protectiveDevices?: string[];
  riskTypes?: string[];

  // 유해인자용 필드
  category?: string;
  formAndType?: string;
  location?: string;
  exposureRisk?: string;
  organizationName?: string;

  // 공통 필드
  description: string | null;
  memo: string | null;
  createAt: Timestamp;
  updateAt: Timestamp;
  deletedAt: Timestamp | null; // Soft Delete
}

// ============================================================================
// 15. ServiceSetting (서비스 설정)
// ============================================================================

export interface ServiceSetting {
  // 기본 키
  id: UUID; // PK

  // 외래 키
  createdBy: ForeignKey<number>; // FK → Member.memberIdx (생성자, onDelete: SET NULL)
  updatedBy: ForeignKey<number>; // FK → Member.memberIdx (수정자, onDelete: SET NULL)

  // 속성
  order: number;
  serviceName: string;
  servicePeriod: string;
  memberCount: number;
  monthlyFee: number;
  subscriptions: number;
  status: Status;
  description: string | null;
  memo: string | null;
  createAt: Timestamp;
  updateAt: Timestamp;
  deletedAt: Timestamp | null; // Soft Delete
}

// ============================================================================
// 16. ApiSetting (API 설정)
// ============================================================================

export interface ApiSetting {
  // 기본 키
  id: UUID; // PK

  // 외래 키
  createdBy: ForeignKey<number>; // FK → Member.memberIdx (생성자, onDelete: SET NULL)
  updatedBy: ForeignKey<number>; // FK → Member.memberIdx (수정자, onDelete: SET NULL)

  // 속성
  order: number;
  name: string;
  provider: string;
  apiKey: string | null; // 암호화된 API 키
  keyStatus: 'normal' | 'abnormal';
  lastInterlockedAt: Timestamp | null; // 마지막 연동 시간
  expiresAt: string | null; // YYYY-MM-DD (만료일)
  status: Status;
  description: string | null;
  memo: string | null;
  createAt: Timestamp;
  updateAt: Timestamp;
  deletedAt: Timestamp | null; // Soft Delete
}

// ============================================================================
// 17. LibraryReport (라이브러리 리포트)
// ============================================================================

export interface LibraryReport {
  // 기본 키
  id: UUID; // PK

  // 외래 키
  categoryId: UUID | null; // FK → LibraryCategory.id (onDelete: SET NULL)
  createdBy: ForeignKey<number>; // FK → Member.memberIdx (생성자, onDelete: SET NULL)
  updatedBy: ForeignKey<number>; // FK → Member.memberIdx (수정자, onDelete: SET NULL)
  uploadedBy: ForeignKey<number>; // FK → Member.memberIdx (업로드자, onDelete: SET NULL)
  createdByCompanyIdx: number; // FK → Company.companyIdx (업로드한 조직 ID, onDelete: SET NULL)

  // 속성
  order: number;
  title: string;
  organizationName: string;
  category: string;
  playbackTime: string; // HH:mm:ss
  hasSubtitles: 0 | 1; // 자막 여부 (0: 없음, 1: 있음)
  visibilityType: 'public' | 'organization'; // 공개 범위 (전체 공개/조직 내)
  hiddenByCompanyIdx: string | null; // 숨김 처리한 조직 ID 배열 (JSON 문자열, text 타입)
  status: Status;
  isActive: 0 | 1; // 활성화 여부 (0: 비활성, 1: 활성)
  fileUrl: string | null;
  thumbnailUrl: string | null;
  viewCount: number;
  description: string | null;
  memo: string | null;
  createAt: Timestamp;
  updateAt: Timestamp;
  deletedAt: Timestamp | null; // Soft Delete
}

// ============================================================================
// 18. RiskReport (위험 리포트)
// ============================================================================

export interface RiskReport {
  // 기본 키
  id: UUID; // PK

  // 외래 키
  reporterMemberIdx: number; // FK → Member.memberIdx (보고자, onDelete: SET NULL)
  authorMemberIdx: number; // FK → Member.memberIdx (작성자, onDelete: SET NULL)
  companyIdx: ForeignKey<number>; // FK → Company.companyIdx (onDelete: SET NULL)
  confirmedBy: ForeignKey<number>; // FK → Member.memberIdx (확인자, nullable, onDelete: SET NULL)
  chatRoomId: ForeignKey<UUID>; // FK → ChatRoom.id (채팅방에서 생성된 경우, nullable, onDelete: SET NULL)

  // 속성
  title: string;
  location: string;
  content: string;
  imageUrl: string | null;
  imageUrls: string[] | null; // 여러 이미지 지원
  sourceType: 'chat' | 'direct'; // 생성 경로 (채팅방/직접 등록)
  signalType: 'risk' | 'rescue' | 'evacuation' | null; // 신호 타입
  status: 'unconfirmed' | 'confirmed';
  confirmedAt: Timestamp | null; // 확인 시간
  description: string | null;
  memo: string | null;
  createAt: Timestamp;
  updateAt: Timestamp;
  deletedAt: Timestamp | null; // Soft Delete
}

// ============================================================================
// 19. SafetyReport (안전 리포트)
// ============================================================================

export interface SafetyReport {
  // 기본 키
  id: UUID; // PK

  // 외래 키
  createdBy: ForeignKey<number>; // FK → Member.memberIdx (생성자, onDelete: SET NULL)
  updatedBy: ForeignKey<number>; // FK → Member.memberIdx (수정자, onDelete: SET NULL)
  publishedBy: ForeignKey<number>; // FK → Member.memberIdx (공개자, onDelete: SET NULL)

  // 속성
  order: number;
  documentType: string;
  documentName: string;
  documentWrittenAt: string; // YYYY-MM-DD (문서 작성일)
  publishedAt: Timestamp | null; // 공개 시간
  viewCount: number;
  fileUrl: string | null;
  description: string | null;
  memo: string | null;
  isActive: 0 | 1; // 활성화 여부 (0: 비활성, 1: 활성)
  createAt: Timestamp;
  updateAt: Timestamp;
  deletedAt: Timestamp | null; // Soft Delete
}

// ============================================================================
// 20. SharedDocument (공유 문서) - Dashboard에서 사용
// ============================================================================

export interface SharedDocument {
  // 기본 키
  id: UUID; // PK

  // 외래 키
  safetySystemDocumentId: string | null; // FK → SafetySystemDocument (복합키 참조, onDelete: SET NULL)
  memberIdx: number; // FK → Member.memberIdx (업로드자, onDelete: SET NULL)
  createdBy: ForeignKey<number>; // FK → Member.memberIdx (생성자, onDelete: SET NULL)
  updatedBy: ForeignKey<number>; // FK → Member.memberIdx (수정자, onDelete: SET NULL)
  priorityId: ForeignKey<UUID>; // FK → PrioritySetting.id (onDelete: SET NULL)
  sharedByCompanyIdx: ForeignKey<number>; // FK → Company.companyIdx (공유한 조직 ID, 슈퍼어드민은 null, onDelete: SET NULL)

  // 속성
  priority: 'urgent' | 'important' | 'reference';
  documentName: string;
  documentWrittenAt: string; // YYYY-MM-DD (문서 작성일)
  isPublic: 0 | 1; // 공개 여부 (0: 비공개, 1: 공개)
  fileName: string | null;
  fileUrl: string | null;
  fileSize: number | null; // bytes
  viewCount: number;
  downloadCount: number;
  description: string | null;
  memo: string | null;
  createAt: Timestamp;
  updateAt: Timestamp;
  deletedAt: Timestamp | null; // Soft Delete
}

// ============================================================================
// 21. PrioritySetting (중요도 설정) - Dashboard에서 사용
// ============================================================================

export interface PrioritySetting {
  // 기본 키
  id: UUID; // PK

  // 외래 키
  createdBy: ForeignKey<number>; // FK → Member.memberIdx (생성자, onDelete: SET NULL)
  updatedBy: ForeignKey<number>; // FK → Member.memberIdx (수정자, onDelete: SET NULL)

  // 속성
  color: string; // HEX 색상 코드
  labelType: 'urgent' | 'important' | 'normal' | 'reference' | 'custom';
  customLabel: string | null;
  isActive: 0 | 1; // 활성화 여부 (0: 비활성, 1: 활성)
  order: number;
  description: string | null;
  createAt: Timestamp;
  updateAt: Timestamp;
  deletedAt: Timestamp | null; // Soft Delete
}

// ============================================================================
// 22. LibraryCategory (라이브러리 카테고리)
// ============================================================================

export interface LibraryCategory {
  // 기본 키
  id: UUID; // PK

  // 외래 키
  createdBy: ForeignKey<number>; // FK → Member.memberIdx (생성자, onDelete: SET NULL)
  updatedBy: ForeignKey<number>; // FK → Member.memberIdx (수정자, onDelete: SET NULL)
  createdByCompanyIdx: ForeignKey<number>; // FK → Company.companyIdx (카테고리 생성 조직, 슈퍼어드민은 null, onDelete: SET NULL)

  // 속성
  name: string;
  isActive: 0 | 1; // 활성화 여부 (0: 비활성, 1: 활성)
  order: number;
  description: string | null;
  createAt: Timestamp;
  updateAt: Timestamp;
  deletedAt: Timestamp | null; // Soft Delete
}

// ============================================================================
// 23. CompanySubscription (조직 구독 서비스)
// ============================================================================

export interface CompanySubscription {
  // 기본 키
  id: UUID; // PK

  // 외래 키
  companyIdx: number; // FK → Company.companyIdx (onDelete: CASCADE)
  serviceSettingId: UUID; // FK → ServiceSetting.id (onDelete: SET NULL)
  createdBy: ForeignKey<number>; // FK → Member.memberIdx (생성자, onDelete: SET NULL)
  updatedBy: ForeignKey<number>; // FK → Member.memberIdx (수정자, onDelete: SET NULL)

  // 속성
  billingKey: string | null; // 결제 빌링키
  isDefaultCard: 0 | 1; // 대표 카드 여부 (0: 아니오, 1: 예)
  subscriptionStatus: 'active' | 'cancelled'; // 구독 상태
  subscribedAt: Timestamp; // 구독일
  cancelledAt: Timestamp | null; // 취소일
  description: string | null;
  createAt: Timestamp;
  updateAt: Timestamp;
  deletedAt: Timestamp | null; // Soft Delete
}

// ============================================================================
// 24. CompanyInvitation (조직원 초대)
// ============================================================================

export interface CompanyInvitation {
  // 기본 키
  id: UUID; // PK

  // 외래 키
  companyIdx: number; // FK → Company.companyIdx (onDelete: CASCADE)
  invitedBy: number; // FK → Member.memberIdx (초대한 사람, onDelete: SET NULL)
  createdBy: ForeignKey<number>; // FK → Member.memberIdx (생성자, onDelete: SET NULL)
  updatedBy: ForeignKey<number>; // FK → Member.memberIdx (수정자, onDelete: SET NULL)

  // 속성
  inviteToken: string; // 초대 토큰 (UNIQUE)
  invitedEmail: string; // 초대 이메일
  expiresAt: Timestamp; // 만료일
  acceptedAt: Timestamp | null; // 수락일
  isUsed: 0 | 1; // 사용 여부 (0: 미사용, 1: 사용)
  description: string | null;
  createAt: Timestamp;
  updateAt: Timestamp;
  deletedAt: Timestamp | null; // Soft Delete
}

// ============================================================================
// 25. DocumentApproval (문서 결재 정보)
// ============================================================================

export interface DocumentApproval {
  // 기본 키
  id: UUID; // PK

  // 외래 키
  documentId: string; // 문서 ID (SafetySystemDocument 복합키 참조, onDelete: CASCADE)
  targetMemberIdx: number; // FK → Member.memberIdx (대상자 ID, onDelete: SET NULL)
  createdBy: ForeignKey<number>; // FK → Member.memberIdx (생성자, onDelete: SET NULL)
  updatedBy: ForeignKey<number>; // FK → Member.memberIdx (수정자, onDelete: SET NULL)

  // 속성
  approvalType: 'sequential' | 'parallel'; // 결재 타입 (순차/동시)
  approvalOrder: number; // 결재 순서 (순차 결재용)
  approvalStatus: 'pending' | 'approved' | 'rejected'; // 결재 상태
  approvedAt: Timestamp | null; // 결재 완료일
  signatureData: string | null; // 서명 데이터 (Base64)
  description: string | null;
  createAt: Timestamp;
  updateAt: Timestamp;
  deletedAt: Timestamp | null; // Soft Delete
}

// ============================================================================
// 26. DocumentSignature (문서 서명 정보) - 대시보드 서명 대기 문서
// ============================================================================

export interface DocumentSignature {
  // 기본 키
  id: UUID; // PK

  // 외래 키
  documentId: string; // 문서 ID (SafetySystemDocument 복합키 참조, onDelete: CASCADE)
  targetMemberIdx: number; // FK → Member.memberIdx (대상자 ID, onDelete: SET NULL)
  createdBy: ForeignKey<number>; // FK → Member.memberIdx (생성자, onDelete: SET NULL)
  updatedBy: ForeignKey<number>; // FK → Member.memberIdx (수정자, onDelete: SET NULL)

  // 속성
  signatureType: 'approval' | 'signature'; // 서명 타입 (결재/서명)
  signatureStatus: 'pending' | 'signed'; // 서명 상태
  requestedAt: Timestamp; // 요청일시
  signedAt: Timestamp | null; // 완료일시
  signatureData: string | null; // 서명 데이터 (Base64)
  description: string | null;
  createAt: Timestamp;
  updateAt: Timestamp;
  deletedAt: Timestamp | null; // Soft Delete
}

// ============================================================================
// 27. DocumentNotification (문서 알림 발송 이력)
// ============================================================================

export interface DocumentNotification {
  // 기본 키
  id: UUID; // PK

  // 외래 키
  documentId: string; // 문서 ID (SafetySystemDocument 복합키 참조, onDelete: CASCADE)
  targetMemberIdx: number; // FK → Member.memberIdx (대상자 ID, onDelete: SET NULL)
  createdBy: ForeignKey<number>; // FK → Member.memberIdx (생성자, onDelete: SET NULL)

  // 속성
  notificationType: 'approval_request' | 'signature_request' | 'deadline_reminder'; // 알림 타입
  scheduledAt: Timestamp; // 발송 예정일
  sentAt: Timestamp | null; // 발송일
  reminderDays: number | null; // 마감일 D-day (15일 전, 7일 전, 1일 전)
  description: string | null;
  createAt: Timestamp;
  deletedAt: Timestamp | null; // Soft Delete
}

// ============================================================================
// 28. ChatRoomSharedDocument (채팅방 공유 문서)
// ============================================================================

export interface ChatRoomSharedDocument {
  // 기본 키
  id: UUID; // PK

  // 외래 키
  chatRoomId: UUID; // FK → ChatRoom.id (onDelete: CASCADE)
  sharedDocumentId: UUID; // FK → SharedDocument.id (onDelete: CASCADE)
  sharedByMemberIdx: number; // FK → Member.memberIdx (공유한 멤버 ID, onDelete: SET NULL)
  createdBy: ForeignKey<number>; // FK → Member.memberIdx (생성자, onDelete: SET NULL)

  // 속성
  description: string | null;
  createAt: Timestamp;
  deletedAt: Timestamp | null; // Soft Delete
}

// ============================================================================
// 관계 정의 (Relations)
// ============================================================================

export interface DatabaseRelations {
  // SuperAdmin 관계
  SuperAdmin: {
    superAdminMemberInformation: Member; // N 측: 하나의 Member를 가짐
  };

  // Company 관계 (1 측: 여러 개의 N을 가짐)
  Company: {
    companyBranchList: CompanyBranch[]; // 1 측: 여러 개의 CompanyBranch를 가짐
    companyMemberList: Member[]; // 1 측: 여러 개의 Member를 가짐
    companySubscriptionList: CompanySubscription[]; // 1 측: 여러 개의 CompanySubscription을 가짐
    companyInvitationList: CompanyInvitation[]; // 1 측: 여러 개의 CompanyInvitation을 가짐
    companyLibraryReportList: LibraryReport[]; // 1 측: 여러 개의 LibraryReport를 가짐
    companySharedDocumentList: SharedDocument[]; // 1 측: 여러 개의 SharedDocument를 가짐
    companyEmergencyChatRoomList: ChatRoom[]; // 1 측: 여러 개의 emergency 타입 ChatRoom을 가짐
  };

  // CompanyBranch 관계
  CompanyBranch: {
    companyBranchCompanyInformation: Company; // N 측: 하나의 Company를 가짐
    companyBranchManager1Information?: Member; // N 측: 하나의 Member를 가짐
    companyBranchManager2Information?: Member; // N 측: 하나의 Member를 가짐
    companyBranchMemberList: Member[]; // 1 측: 여러 개의 Member를 가짐
  };

  // Member 관계
  Member: {
    memberCompanyInformation: Company; // N 측: 하나의 Company를 가짐
    memberCompanyBranchInformation?: CompanyBranch; // N 측: 하나의 CompanyBranch를 가짐
    memberSuperAdminInformation?: SuperAdmin; // N 측: 하나의 SuperAdmin을 가짐 (슈퍼어드민인 경우)
    memberEducationReportList: EducationReport[]; // 1 측: 여러 개의 EducationReport를 가짐
    memberEducationRecordList: EducationRecord[]; // 1 측: 여러 개의 EducationRecord를 가짐
    memberRiskReportAsReporterList: RiskReport[]; // 1 측: 여러 개의 RiskReport를 가짐 (보고자)
    memberRiskReportAsAuthorList: RiskReport[]; // 1 측: 여러 개의 RiskReport를 가짐 (작성자)
    memberChatMessageList: ChatMessage[]; // 1 측: 여러 개의 ChatMessage를 가짐
    memberChatParticipantList: ChatParticipant[]; // 1 측: 여러 개의 ChatParticipant를 가짐
    memberSharedDocumentList: SharedDocument[]; // 1 측: 여러 개의 SharedDocument를 가짐
    memberDocumentApprovalList: DocumentApproval[]; // 1 측: 여러 개의 DocumentApproval을 가짐
    memberDocumentSignatureList: DocumentSignature[]; // 1 측: 여러 개의 DocumentSignature를 가짐
    memberDocumentNotificationList: DocumentNotification[]; // 1 측: 여러 개의 DocumentNotification을 가짐
    memberCompanyInvitationList: CompanyInvitation[]; // 1 측: 여러 개의 CompanyInvitation을 가짐 (초대한 사람)
  };

  // EducationReport 관계
  EducationReport: {
    educationReportMemberInformation: Member; // N 측: 하나의 Member를 가짐
    educationReportCompanyInformation: Company; // N 측: 하나의 Company를 가짐
    educationReportEducationRecordList: EducationRecord[]; // 1 측: 여러 개의 EducationRecord를 가짐
  };

  // EducationRecord 관계
  EducationRecord: {
    educationRecordMemberInformation: Member; // N 측: 하나의 Member를 가짐
    educationRecordEducationReportInformation: EducationReport; // N 측: 하나의 EducationReport를 가짐
  };

  // EducationStandard 관계
  EducationStandard: {
    // 관계 없음 (설정 테이블)
  };

  // SafetySystem 관계 (1 측: 여러 개의 N을 가짐)
  SafetySystem: {
    safetySystemItemList: SafetySystemItem[]; // 1 측: 여러 개의 SafetySystemItem을 가짐
  };

  // SafetySystemItem 관계
  SafetySystemItem: {
    safetySystemItemSafetySystemInformation: SafetySystem; // N 측: 하나의 SafetySystem을 가짐
    safetySystemItemDocumentList: SafetySystemDocument[]; // 1 측: 여러 개의 SafetySystemDocument를 가짐
  };

  // SafetySystemDocument 관계
  SafetySystemDocument: {
    safetySystemDocumentItemInformation: SafetySystemItem; // N 측: 하나의 SafetySystemItem을 가짐
    safetySystemDocumentApprovalList: DocumentApproval[]; // 1 측: 여러 개의 DocumentApproval을 가짐
    safetySystemDocumentSignatureList: DocumentSignature[]; // 1 측: 여러 개의 DocumentSignature를 가짐
    safetySystemDocumentNotificationList: DocumentNotification[]; // 1 측: 여러 개의 DocumentNotification을 가짐
    safetySystemDocumentSharedDocumentList: SharedDocument[]; // 1 측: 여러 개의 SharedDocument를 가짐
  };

  // ChatRoom 관계 (1 측: 여러 개의 N을 가짐)
  ChatRoom: {
    chatRoomMessageList: ChatMessage[]; // 1 측: 여러 개의 ChatMessage를 가짐
    chatRoomParticipantList: ChatParticipant[]; // 1 측: 여러 개의 ChatParticipant를 가짐
    chatRoomSharedDocumentList: ChatRoomSharedDocument[]; // 1 측: 여러 개의 ChatRoomSharedDocument를 가짐
    chatRoomCompanyInformation?: Company; // N 측: 하나의 Company를 가짐 (emergency 타입인 경우)
  };

  // ChatMessage 관계
  ChatMessage: {
    chatMessageChatRoomInformation: ChatRoom; // N 측: 하나의 ChatRoom을 가짐
    chatMessageSenderInformation: Member; // N 측: 하나의 Member를 가짐
    chatMessageSharedDocumentInformation?: SharedDocument; // N 측: 하나의 SharedDocument를 가짐
  };

  // ChatParticipant 관계
  ChatParticipant: {
    chatParticipantChatRoomInformation: ChatRoom; // N 측: 하나의 ChatRoom을 가짐
    chatParticipantMemberInformation: Member; // N 측: 하나의 Member를 가짐
  };

  // Checklist 관계 (1 측: 여러 개의 N을 가짐)
  Checklist: {
    checklistDisasterFactorList: DisasterFactor[]; // 1 측: 여러 개의 DisasterFactor를 가짐
  };

  // DisasterFactor 관계
  DisasterFactor: {
    disasterFactorChecklistInformation: Checklist; // N 측: 하나의 Checklist를 가짐
  };

  // LibraryReport 관계
  LibraryReport: {
    libraryReportCategoryInformation?: LibraryCategory; // N 측: 하나의 LibraryCategory를 가짐
    libraryReportCompanyInformation: Company; // N 측: 하나의 Company를 가짐
  };

  // LibraryCategory 관계
  LibraryCategory: {
    libraryCategoryLibraryReportList: LibraryReport[]; // 1 측: 여러 개의 LibraryReport를 가짐
    libraryCategoryCompanyInformation?: Company; // N 측: 하나의 Company를 가짐 (슈퍼어드민은 null)
  };

  // RiskReport 관계
  RiskReport: {
    riskReportReporterInformation: Member; // N 측: 하나의 Member를 가짐 (보고자)
    riskReportAuthorInformation: Member; // N 측: 하나의 Member를 가짐 (작성자)
    riskReportCompanyInformation?: Company; // N 측: 하나의 Company를 가짐
    riskReportChatRoomInformation?: ChatRoom; // N 측: 하나의 ChatRoom을 가짐
  };

  // SafetyReport 관계
  SafetyReport: {
    // 관계 없음 (독립적인 리포트)
  };

  // SharedDocument 관계
  SharedDocument: {
    sharedDocumentMemberInformation: Member; // N 측: 하나의 Member를 가짐
    sharedDocumentSafetySystemDocumentInformation?: SafetySystemDocument; // N 측: 하나의 SafetySystemDocument를 가짐
    sharedDocumentPriorityInformation?: PrioritySetting; // N 측: 하나의 PrioritySetting을 가짐
    sharedDocumentCompanyInformation?: Company; // N 측: 하나의 Company를 가짐 (공유한 조직)
    sharedDocumentChatRoomList: ChatRoomSharedDocument[]; // 1 측: 여러 개의 ChatRoomSharedDocument를 가짐
  };

  // PrioritySetting 관계 (1 측: 여러 개의 N을 가짐)
  PrioritySetting: {
    prioritySettingSharedDocumentList: SharedDocument[]; // 1 측: 여러 개의 SharedDocument를 가짐
  };

  // CompanySubscription 관계
  CompanySubscription: {
    companySubscriptionCompanyInformation: Company; // N 측: 하나의 Company를 가짐
    companySubscriptionServiceSettingInformation?: ServiceSetting; // N 측: 하나의 ServiceSetting을 가짐
  };

  // CompanyInvitation 관계
  CompanyInvitation: {
    companyInvitationCompanyInformation: Company; // N 측: 하나의 Company를 가짐
    companyInvitationInvitedByInformation: Member; // N 측: 하나의 Member를 가짐 (초대한 사람)
  };

  // DocumentApproval 관계
  DocumentApproval: {
    documentApprovalDocumentInformation: SafetySystemDocument; // N 측: 하나의 SafetySystemDocument를 가짐
    documentApprovalTargetMemberInformation: Member; // N 측: 하나의 Member를 가짐
  };

  // DocumentSignature 관계
  DocumentSignature: {
    documentSignatureDocumentInformation: SafetySystemDocument; // N 측: 하나의 SafetySystemDocument를 가짐
    documentSignatureTargetMemberInformation: Member; // N 측: 하나의 Member를 가짐
  };

  // DocumentNotification 관계
  DocumentNotification: {
    documentNotificationDocumentInformation: SafetySystemDocument; // N 측: 하나의 SafetySystemDocument를 가짐
    documentNotificationTargetMemberInformation: Member; // N 측: 하나의 Member를 가짐
  };

  // ChatRoomSharedDocument 관계
  ChatRoomSharedDocument: {
    chatRoomSharedDocumentChatRoomInformation: ChatRoom; // N 측: 하나의 ChatRoom을 가짐
    chatRoomSharedDocumentSharedDocumentInformation: SharedDocument; // N 측: 하나의 SharedDocument를 가짐
    chatRoomSharedDocumentSharedByMemberInformation: Member; // N 측: 하나의 Member를 가짐
  };
}

// ============================================================================
// 인덱스 정의
// ============================================================================

export interface DatabaseIndexes {
  // SuperAdmin 인덱스
  SuperAdmin: {
    memberIdx: 'UNIQUE'; // 대체 키
  };

  // Member 인덱스
  Member: {
    memberId: 'UNIQUE'; // 대체 키
    companyIdx: 'INDEX';
    companyBranchIdx: 'INDEX';
    memberEmail: 'UNIQUE';
    joinedAt: 'INDEX'; // 입사일 (이수율 계산용)
  };

  // EducationReport 인덱스
  EducationReport: {
    memberIdx: 'INDEX';
    companyIdx: 'INDEX';
  };

  // EducationRecord 인덱스
  EducationRecord: {
    memberIdx: 'INDEX';
    educationReportId: 'INDEX';
    educationDate: 'INDEX';
  };

  // SafetySystemDocument 인덱스
  SafetySystemDocument: {
    'safetyIdx,itemNumber': 'COMPOSITE_INDEX';
    registeredAt: 'INDEX';
    isPublished: 'INDEX'; // 게시 여부
  };

  // ChatMessage 인덱스
  ChatMessage: {
    chatRoomId: 'INDEX';
    senderMemberIdx: 'INDEX';
    createAt: 'INDEX'; // 메시지 전송 시간
    signalType: 'INDEX'; // 신호 타입
  };

  // ChatParticipant 인덱스
  ChatParticipant: {
    chatRoomId: 'INDEX';
    memberIdx: 'INDEX';
    'chatRoomId,memberIdx': 'UNIQUE_COMPOSITE';
    isActive: 'INDEX'; // 활성화 여부
  };

  // RiskReport 인덱스
  RiskReport: {
    reporterMemberIdx: 'INDEX';
    authorMemberIdx: 'INDEX';
    companyIdx: 'INDEX';
    chatRoomId: 'INDEX';
    createAt: 'INDEX'; // 등록일
    signalType: 'INDEX'; // 신호 타입
  };

  // DocumentApproval 인덱스
  DocumentApproval: {
    documentId: 'INDEX';
    targetMemberIdx: 'INDEX';
    approvalStatus: 'INDEX'; // 결재 상태
    approvalOrder: 'INDEX'; // 결재 순서
  };

  // DocumentSignature 인덱스
  DocumentSignature: {
    documentId: 'INDEX';
    targetMemberIdx: 'INDEX';
    signatureStatus: 'INDEX'; // 서명 상태
    signatureType: 'INDEX'; // 서명 타입
  };

  // CompanySubscription 인덱스
  CompanySubscription: {
    companyIdx: 'INDEX';
    serviceSettingId: 'INDEX';
    subscriptionStatus: 'INDEX'; // 구독 상태
  };

  // CompanyInvitation 인덱스
  CompanyInvitation: {
    companyIdx: 'INDEX';
    inviteToken: 'UNIQUE'; // 초대 토큰
    invitedEmail: 'INDEX';
    isUsed: 'INDEX'; // 사용 여부
  };

  // LibraryReport 인덱스
  LibraryReport: {
    createdByCompanyIdx: 'INDEX';
    visibilityType: 'INDEX'; // 공개 범위
  };

  // SharedDocument 인덱스
  SharedDocument: {
    memberIdx: 'INDEX';
    sharedByCompanyIdx: 'INDEX';
    isPublic: 'INDEX'; // 공개 여부
  };
}

// ============================================================================
// 전체 데이터베이스 스키마
// ============================================================================

export interface DatabaseSchema {
  // 엔티티
  SuperAdmin: SuperAdmin[];
  Company: Company[];
  CompanyBranch: CompanyBranch[];
  Member: Member[];
  EducationReport: EducationReport[];
  EducationRecord: EducationRecord[];
  EducationStandard: EducationStandard[];
  SafetySystem: SafetySystem[];
  SafetySystemItem: SafetySystemItem[];
  SafetySystemDocument: SafetySystemDocument[];
  ChatRoom: ChatRoom[];
  ChatMessage: ChatMessage[];
  ChatParticipant: ChatParticipant[];
  Checklist: Checklist[];
  DisasterFactor: DisasterFactor[];
  CodeSetting: CodeSetting[];
  ServiceSetting: ServiceSetting[];
  ApiSetting: ApiSetting[];
  LibraryReport: LibraryReport[];
  LibraryCategory: LibraryCategory[];
  RiskReport: RiskReport[];
  SafetyReport: SafetyReport[];
  SharedDocument: SharedDocument[];
  PrioritySetting: PrioritySetting[];
  CompanySubscription: CompanySubscription[];
  CompanyInvitation: CompanyInvitation[];
  DocumentApproval: DocumentApproval[];
  DocumentSignature: DocumentSignature[];
  DocumentNotification: DocumentNotification[];
  ChatRoomSharedDocument: ChatRoomSharedDocument[];
}
