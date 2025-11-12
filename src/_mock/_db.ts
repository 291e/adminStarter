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
// 1. Company (회사)
// ============================================================================

export interface Company {
  // 기본 키
  companyIdx: number; // PK, AUTO_INCREMENT

  // 외래 키
  createdBy: ForeignKey<number>; // FK → Member.memberIdx (생성자)
  updatedBy: ForeignKey<number>; // FK → Member.memberIdx (수정자)

  // 속성
  companyName: string;
  companyCode: string | null; // 회사 코드
  businessNumber: string | null; // 사업자등록번호
  address: string | null;
  phone: string | null;
  email: string | null;
  description: string | null;
  memo: string | null;
  isActive: boolean;
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
  companyIdx: number; // FK → Company.companyIdx
  branchManager1MemberIdx: ForeignKey<number>; // FK → Member.memberIdx (nullable)
  branchManager2MemberIdx: ForeignKey<number>; // FK → Member.memberIdx (nullable)
  createdBy: ForeignKey<number>; // FK → Member.memberIdx (생성자)
  updatedBy: ForeignKey<number>; // FK → Member.memberIdx (수정자)

  // 속성
  companyBranchName: string;
  branchCode: string | null; // 지점 코드
  address: string | null;
  phone: string | null;
  email: string | null;
  description: string | null;
  memo: string | null;
  isActive: boolean;
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
  companyIdx: number; // FK → Company.companyIdx
  companyBranchIdx: ForeignKey<number>; // FK → CompanyBranch.companyBranchIdx (nullable)
  createdBy: ForeignKey<number>; // FK → Member.memberIdx (생성자, 자기참조)
  updatedBy: ForeignKey<number>; // FK → Member.memberIdx (수정자, 자기참조)

  // 속성
  memberRole: 'admin' | 'member' | 'distributor' | 'agency' | 'dealer';
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
  memberIdx: number; // FK → Member.memberIdx
  companyIdx: number; // FK → Company.companyIdx
  createdBy: ForeignKey<number>; // FK → Member.memberIdx (생성자)
  updatedBy: ForeignKey<number>; // FK → Member.memberIdx (수정자)

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
  memberIdx: number; // FK → Member.memberIdx
  educationReportId: UUID; // FK → EducationReport.id
  createdBy: ForeignKey<number>; // FK → Member.memberIdx (생성자)
  updatedBy: ForeignKey<number>; // FK → Member.memberIdx (수정자)

  // 속성
  method: '집체' | '온라인';
  educationName: string;
  educationTime: number; // 분
  educationDate: string; // YYYY-MM-DD
  fileName: string | null;
  fileUrl: string | null;
  description: string | null;
  memo: string | null;
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
  createdBy: ForeignKey<number>; // FK → Member.memberIdx (생성자)
  updatedBy: ForeignKey<number>; // FK → Member.memberIdx (수정자)

  // 속성
  systemName: string;
  description: string | null;
  order: number;
  isActive: boolean;
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
  // safetyIdx → SafetySystem.safetyIdx (이미 PK에 포함)
  createdBy: ForeignKey<number>; // FK → Member.memberIdx (생성자)
  updatedBy: ForeignKey<number>; // FK → Member.memberIdx (수정자)

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
  // (safetyIdx, itemNumber) → SafetySystemItem(safetyIdx, itemNumber)
  createdBy: ForeignKey<number>; // FK → Member.memberIdx (생성자)
  updatedBy: ForeignKey<number>; // FK → Member.memberIdx (수정자)
  uploadedBy: ForeignKey<number>; // FK → Member.memberIdx (업로드자)

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
  createdBy: ForeignKey<number>; // FK → Member.memberIdx (생성자)
  organizationIdx: ForeignKey<number>; // FK → Company.companyIdx (nullable)

  // 속성
  name: string;
  type: 'chatbot' | 'emergency' | 'normal' | 'group';
  isGroup: boolean;
  organizationName: string | null;
  lastMessage: string | null;
  lastMessageAt: Timestamp | null; // 마지막 메시지 시간
  unreadCount: number | null;
  avatar: string | null;
  description: string | null;
  isActive: boolean;
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
  chatRoomId: UUID; // FK → ChatRoom.id
  senderMemberIdx: number; // FK → Member.memberIdx

  // 속성
  sender: string; // 캐시된 발신자 이름
  senderAvatar: string | null;
  message: string;
  messageType: 'text' | 'image' | 'file' | 'system';
  attachments: string[] | null; // 파일 URL 배열
  isRead: boolean;
  isOwn: boolean;
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
  chatRoomId: UUID; // FK → ChatRoom.id
  memberIdx: number; // FK → Member.memberIdx
  invitedBy: ForeignKey<number>; // FK → Member.memberIdx (초대한 사람)

  // 속성
  role: string; // 'admin' | 'member' | 'viewer' 등
  joinedAt: Timestamp; // 참가 시간
  leftAt: Timestamp | null; // 나간 시간
  isActive: boolean;
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
  createdBy: ForeignKey<number>; // FK → Member.memberIdx (생성자)
  updatedBy: ForeignKey<number>; // FK → Member.memberIdx (수정자)

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
  checklistId: UUID; // FK → Checklist.id
  createdBy: ForeignKey<number>; // FK → Member.memberIdx (생성자)
  updatedBy: ForeignKey<number>; // FK → Member.memberIdx (수정자)

  // 속성
  factorName: string;
  description: string | null;
  order: number;
  isActive: boolean;
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
  createdBy: ForeignKey<number>; // FK → Member.memberIdx (생성자)
  updatedBy: ForeignKey<number>; // FK → Member.memberIdx (수정자)

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
  createdBy: ForeignKey<number>; // FK → Member.memberIdx (생성자)
  updatedBy: ForeignKey<number>; // FK → Member.memberIdx (수정자)

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
  createdBy: ForeignKey<number>; // FK → Member.memberIdx (생성자)
  updatedBy: ForeignKey<number>; // FK → Member.memberIdx (수정자)

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
  categoryId: UUID | null; // FK → LibraryCategory.id
  createdBy: ForeignKey<number>; // FK → Member.memberIdx (생성자)
  updatedBy: ForeignKey<number>; // FK → Member.memberIdx (수정자)
  uploadedBy: ForeignKey<number>; // FK → Member.memberIdx (업로드자)

  // 속성
  order: number;
  title: string;
  organizationName: string;
  category: string;
  playbackTime: string; // HH:mm:ss
  hasSubtitles: boolean;
  status: Status;
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
  reporterMemberIdx: number; // FK → Member.memberIdx (보고자)
  authorMemberIdx: number; // FK → Member.memberIdx (작성자)
  companyIdx: ForeignKey<number>; // FK → Company.companyIdx
  confirmedBy: ForeignKey<number>; // FK → Member.memberIdx (확인자, nullable)

  // 속성
  title: string;
  location: string;
  content: string;
  imageUrl: string | null;
  imageUrls: string[] | null; // 여러 이미지 지원
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
  createdBy: ForeignKey<number>; // FK → Member.memberIdx (생성자)
  updatedBy: ForeignKey<number>; // FK → Member.memberIdx (수정자)
  publishedBy: ForeignKey<number>; // FK → Member.memberIdx (공개자)

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
  isActive: boolean;
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
  safetySystemDocumentId: string | null; // FK → SafetySystemDocument (복합키 참조)
  memberIdx: number; // FK → Member.memberIdx (업로드자)
  createdBy: ForeignKey<number>; // FK → Member.memberIdx (생성자)
  updatedBy: ForeignKey<number>; // FK → Member.memberIdx (수정자)
  priorityId: ForeignKey<UUID>; // FK → PrioritySetting.id

  // 속성
  priority: 'urgent' | 'important' | 'reference';
  documentName: string;
  documentWrittenAt: string; // YYYY-MM-DD (문서 작성일)
  status: 'public' | 'private';
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
  createdBy: ForeignKey<number>; // FK → Member.memberIdx (생성자)
  updatedBy: ForeignKey<number>; // FK → Member.memberIdx (수정자)

  // 속성
  color: string; // HEX 색상 코드
  labelType: 'urgent' | 'important' | 'normal' | 'reference' | 'custom';
  customLabel: string | null;
  isActive: boolean;
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
  createdBy: ForeignKey<number>; // FK → Member.memberIdx (생성자)
  updatedBy: ForeignKey<number>; // FK → Member.memberIdx (수정자)

  // 속성
  name: string;
  isActive: boolean;
  order: number;
  description: string | null;
  createAt: Timestamp;
  updateAt: Timestamp;
  deletedAt: Timestamp | null; // Soft Delete
}

// ============================================================================
// 관계 정의 (Relations)
// ============================================================================

export interface DatabaseRelations {
  // Company 관계
  Company: {
    branches: CompanyBranch[];
  };

  // CompanyBranch 관계
  CompanyBranch: {
    company: Company;
    manager1?: Member;
    manager2?: Member;
    members: Member[];
  };

  // Member 관계
  Member: {
    company: Company;
    companyBranch?: CompanyBranch;
    educationReports: EducationReport[];
    educationRecords: EducationRecord[];
    riskReportsAsReporter: RiskReport[];
    riskReportsAsAuthor: RiskReport[];
    chatMessages: ChatMessage[];
    chatParticipants: ChatParticipant[];
    sharedDocuments: SharedDocument[];
  };

  // EducationReport 관계
  EducationReport: {
    member: Member;
    company: Company;
    educationRecords: EducationRecord[];
  };

  // EducationRecord 관계
  EducationRecord: {
    member: Member;
    educationReport: EducationReport;
  };

  // SafetySystem 관계
  SafetySystem: {
    items: SafetySystemItem[];
  };

  // SafetySystemItem 관계
  SafetySystemItem: {
    safetySystem: SafetySystem;
    documents: SafetySystemDocument[];
  };

  // SafetySystemDocument 관계
  SafetySystemDocument: {
    item: SafetySystemItem;
  };

  // ChatRoom 관계
  ChatRoom: {
    messages: ChatMessage[];
    participants: ChatParticipant[];
  };

  // ChatMessage 관계
  ChatMessage: {
    chatRoom: ChatRoom;
    sender: Member;
  };

  // ChatParticipant 관계
  ChatParticipant: {
    chatRoom: ChatRoom;
    member: Member;
  };

  // Checklist 관계
  Checklist: {
    disasterFactors: DisasterFactor[];
  };

  // DisasterFactor 관계
  DisasterFactor: {
    checklist: Checklist;
  };

  // LibraryReport 관계
  LibraryReport: {
    category?: LibraryCategory;
  };

  // RiskReport 관계
  RiskReport: {
    reporter: Member;
    author: Member;
  };

  // SharedDocument 관계
  SharedDocument: {
    member: Member;
    safetySystemDocument?: SafetySystemDocument;
  };
}

// ============================================================================
// 인덱스 정의
// ============================================================================

export interface DatabaseIndexes {
  // Member 인덱스
  Member: {
    memberId: 'UNIQUE'; // 대체 키
    companyIdx: 'INDEX';
    companyBranchIdx: 'INDEX';
    memberEmail: 'UNIQUE';
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
  };

  // ChatMessage 인덱스
  ChatMessage: {
    chatRoomId: 'INDEX';
    senderMemberIdx: 'INDEX';
    timestamp: 'INDEX';
  };

  // ChatParticipant 인덱스
  ChatParticipant: {
    chatRoomId: 'INDEX';
    memberIdx: 'INDEX';
    'chatRoomId,memberIdx': 'UNIQUE_COMPOSITE';
  };

  // RiskReport 인덱스
  RiskReport: {
    reporterMemberIdx: 'INDEX';
    authorMemberIdx: 'INDEX';
    registeredAt: 'INDEX';
  };
}

// ============================================================================
// 전체 데이터베이스 스키마
// ============================================================================

export interface DatabaseSchema {
  // 엔티티
  Company: Company[];
  CompanyBranch: CompanyBranch[];
  Member: Member[];
  EducationReport: EducationReport[];
  EducationRecord: EducationRecord[];
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
}
