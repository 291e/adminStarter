# 데이터베이스 ERD 및 스키마 설계

이 문서는 프로젝트에서 사용하는 모든 목업 데이터를 데이터베이스 ERD 형식으로 정리한 것입니다.

## 엔티티 관계도 (ERD)

```
┌─────────────────┐
│   SuperAdmin    │
│─────────────────│
│ PK superAdminIdx│
│ FK memberIdx (UNIQUE)
│    isActive (0|1)
│    createAt     │
│    updateAt     │
└────────┬────────┘
         │
         │ 1:1
         │
┌────────▼────────┐
│     Member      │
│─────────────────│
│ PK memberIdx    │
│ AK memberId     │
│ FK companyIdx   │
│ FK companyBranchIdx (nullable)
│    memberRole   │
│    joinedAt     │ (입사일)
│    ...          │
└────────┬────────┘
         │
         │ N:1
         │
┌────────▼────────┐
│    Company      │
│─────────────────│
│ PK companyIdx   │
│    companyName  │
│    isActive (0|1)
│    isAccidentFreeWorksite (0|1)
│    accidentFreeStatus
│    createAt     │
│    updateAt     │
└────────┬────────┘
         │
         │ 1:N
         │
┌────────▼────────┐
│ CompanyBranch   │
│─────────────────│
│ PK companyBranchIdx
│ FK companyIdx   │
│    companyBranchName
│    isActive (0|1)
│    createAt     │
│    updateAt     │
└─────────────────┘

┌─────────────────┐
│  EducationReport│
│─────────────────│
│ PK id           │
│ FK memberIdx    │
│ FK companyIdx   │
│    name         │
│    department   │
│    role         │
│    completionRate
└────────┬────────┘
         │
         │ 1:N
         │
┌────────▼────────┐
│ EducationRecord │
│─────────────────│
│ PK id           │
│ FK memberIdx    │
│ FK educationReportId
│    educationType
│    educationName
│    educationTime
│    educationDate
└─────────────────┘

┌─────────────────┐
│EducationStandard│
│─────────────────│
│ PK id           │
│    role         │
│    workType     │
│    standardHours
│    period       │
│    isAccidentFreeReduction (0|1)
│    isActive (0|1)
└─────────────────┘

┌─────────────────┐
│  SafetySystem   │
│─────────────────│
│ PK safetyIdx    │
│    systemName   │
│    isActive (0|1)
└────────┬────────┘
         │
         │ 1:N
         │
┌────────▼────────┐
│ SafetySystemItem│
│─────────────────│
│ PK safetyIdx    │ (복합키)
│ PK itemNumber   │ (복합키)
│    documentName │
│    documentCount
│    cycle        │
│    status       │
└────────┬────────┘
         │
         │ 1:N
         │
┌────────▼────────┐
│SafetySystemDoc  │
│─────────────────│
│ PK id (UUID)    │ (대리키)
│ UK safetyIdx    │ (복합 고유키)
│ UK itemNumber   │ (복합 고유키)
│ UK documentNumber (복합 고유키)
│    isPublished (0|1)
│    publishedAt  │
│    registeredAt │
│    writtenAt    │
│    approvalDeadline
└────────┬────────┘
         │
         │ 1:N
         │
┌────────▼────────┐
│DocumentApproval │
│─────────────────│
│ PK id           │
│ FK documentId   │
│ FK targetMemberIdx
│    approvalType │
│    approvalOrder
│    approvalStatus
│    signatureData
└─────────────────┘

┌─────────────────┐
│DocumentSignature│
│─────────────────│
│ PK id           │
│ FK documentId   │
│ FK targetMemberIdx
│    signatureType
│    signatureStatus
│    requestedAt  │
│    signedAt     │
└─────────────────┘

┌─────────────────┐
│DocumentNotification│
│─────────────────│
│ PK id           │
│ FK documentId   │
│ FK targetMemberIdx
│    notificationType
│    scheduledAt  │
│    sentAt       │
│    reminderDays │
└─────────────────┘

┌─────────────────┐
│    ChatRoom     │
│─────────────────│
│ PK id           │
│ FK emergencyRoomCompanyIdx
│    name         │
│    type         │
│    isGroup (0|1)
│    isActive (0|1)
│    lastMessageAt
└────────┬────────┘
         │
         │ 1:N
         │
┌────────▼────────┐
│  ChatMessage    │
│─────────────────│
│ PK id           │
│ FK chatRoomId   │
│ FK senderMemberIdx
│ FK sharedDocumentId
│    message      │
│    signalType   │
│    isRead (0|1)
│    createAt     │
└─────────────────┘

┌─────────────────┐
│ChatParticipant  │
│─────────────────│
│ PK id           │
│ FK chatRoomId   │
│ FK memberIdx    │
│    isRead (0|1)
│    isActive (0|1)
│    lastReadAt   │
└─────────────────┘

┌─────────────────┐
│   RiskReport    │
│─────────────────│
│ PK id           │
│ FK reporterMemberIdx
│ FK authorMemberIdx
│ FK companyIdx   │
│ FK chatRoomId   │
│    sourceType   │
│    signalType   │
│    title        │
│    status       │
└─────────────────┘

┌─────────────────┐
│ SharedDocument  │
│─────────────────│
│ PK id           │
│ FK memberIdx    │
│ FK sharedByCompanyIdx
│ FK priorityId   │
│    isPublic (0|1)
│    documentName │
│    viewCount    │
└────────┬────────┘
         │
         │ 1:N
         │
┌────────▼────────┐
│ChatRoomSharedDoc│
│─────────────────│
│ PK id           │
│ FK chatRoomId   │
│ FK sharedDocumentId
│ FK sharedByMemberIdx
└─────────────────┘

┌─────────────────┐
│CompanySubscription│
│─────────────────│
│ PK id           │
│ FK companyIdx   │
│ FK serviceSettingId
│    billingKey   │
│    isDefaultCard (0|1)
│    subscriptionStatus
└─────────────────┘

┌─────────────────┐
│CompanyInvitation│
│─────────────────│
│ PK id           │
│ FK companyIdx   │
│ FK invitedBy    │
│    inviteToken (UNIQUE)
│    invitedEmail │
│    isUsed (0|1)
│    expiresAt    │
└─────────────────┘

┌─────────────────┐
│ LibraryReport   │
│─────────────────│
│ PK id           │
│ FK categoryId   │
│ FK createdByCompanyIdx
│    visibilityType
│    hiddenByCompanyIdx (JSON)
│    isActive (0|1)
│    hasSubtitles (0|1)
└─────────────────┘

┌─────────────────┐
│ LibraryCategory │
│─────────────────│
│ PK id           │
│ FK createdByCompanyIdx
│    name         │
│    isActive (0|1)
└─────────────────┘

┌─────────────────┐
│   Checklist     │
│─────────────────│
│ PK id           │
│    order        │
│    industry     │
│    highRiskWork │
│    status       │
└────────┬────────┘
         │
         │ 1:N
         │
┌────────▼────────┐
│ DisasterFactor  │
│─────────────────│
│ PK id           │
│ FK checklistId │
│    factorName   │
│    isActive (0|1)
└─────────────────┘

┌─────────────────┐
│  CodeSetting    │
│─────────────────│
│ PK id           │
│    code         │
│    name         │
│    categoryType │
│    status       │
└─────────────────┘

┌─────────────────┐
│ ServiceSetting  │
│─────────────────│
│ PK id           │
│    serviceName  │
│    servicePeriod
│    monthlyFee   │
│    status       │
└─────────────────┘

┌─────────────────┐
│   ApiSetting    │
│─────────────────│
│ PK id           │
│    name         │
│    provider     │
│    keyStatus    │
│    status       │
└─────────────────┘

┌─────────────────┐
│  SafetyReport   │
│─────────────────│
│ PK id           │
│    documentType │
│    documentName │
│    isActive (0|1)
│    publishedAt  │
└─────────────────┘

┌─────────────────┐
│PrioritySetting  │
│─────────────────│
│ PK id           │
│    color        │
│    labelType    │
│    isActive (0|1)
└─────────────────┘
```

## 키 정의

### 기본 키 (Primary Key, PK)

- 각 테이블의 고유 식별자
- 예: `memberIdx`, `companyIdx`, `id` 등

### 외래 키 (Foreign Key, FK)

- 다른 테이블의 기본 키를 참조
- 예: `Member.companyIdx` → `Company.companyIdx`

### 대체 키 (Alternate Key, AK)

- 기본 키 외의 고유 식별자
- 예: `Member.memberId` (memberIdx 외의 고유 식별자)

### 복합 키 (Composite Key)

- 여러 컬럼의 조합으로 고유성 보장
- 예: `SafetySystemItem(safetyIdx, itemNumber)`

## 테이블 상세 정의

### 0. SuperAdmin (슈퍼어드민)

- **기본 키**: `superAdminIdx` (AUTO_INCREMENT)
- **외래 키**:
  - `memberIdx` → Member.memberIdx (UNIQUE)
- **속성**: `isActive` (0 | 1)
- **관계**: Member (1:1)
- **설명**: 슈퍼어드민은 별도 테이블로 관리되며, Member 테이블과 1:1 관계입니다.

### 1. Company (회사)

- **기본 키**: `companyIdx` (AUTO_INCREMENT)
- **외래 키**:
  - `createdBy` → Member.memberIdx (onDelete: SET NULL)
  - `updatedBy` → Member.memberIdx (onDelete: SET NULL)
- **속성**: `companyName`, `isActive` (0 | 1), `isAccidentFreeWorksite` (0 | 1), `accidentFreeStatus`, `accidentFreeCertifiedAt`, `accidentFreeExpiresAt`
- **관계**: CompanyBranch (1:N), Member (1:N), CompanySubscription (1:N), CompanyInvitation (1:N)

### 2. CompanyBranch (회사 지점)

- **기본 키**: `companyBranchIdx` (AUTO_INCREMENT)
- **외래 키**:
  - `companyIdx` → Company.companyIdx (onDelete: CASCADE)
  - `branchManager1MemberIdx` → Member.memberIdx (nullable, onDelete: SET NULL)
  - `branchManager2MemberIdx` → Member.memberIdx (nullable, onDelete: SET NULL)
- **속성**: `companyBranchName`, `isActive` (0 | 1)
- **관계**: Company (N:1), Member (1:N)

### 3. Member (멤버/사용자)

- **기본 키**: `memberIdx` (AUTO_INCREMENT)
- **대체 키**: `memberId` (UNIQUE)
- **외래 키**:
  - `companyIdx` → Company.companyIdx (onDelete: SET NULL)
  - `companyBranchIdx` → CompanyBranch.companyBranchIdx (nullable, onDelete: SET NULL)
- **속성**: `memberRole` ('admin' | 'member' | 'distributor' | 'agency' | 'dealer'), `memberName`, `memberEmail`, `memberPhone`, `memberStatus`, `joinedAt` (입사일), `fcmToken` (UNIQUE, Firebase Cloud Messaging 토큰), `isPushEnabled` (0 | 1, 푸시 알림 허용 여부)
- **관계**: Company (N:1), CompanyBranch (N:1), SuperAdmin (1:1, 선택적), EducationReport (1:N), EducationRecord (1:N), RiskReport (1:N), ChatMessage (1:N), ChatParticipant (1:N), SharedDocument (1:N)

### 4. EducationReport (교육 리포트)

- **기본 키**: `id` (UUID)
- **외래 키**:
  - `memberIdx` → Member.memberIdx (onDelete: SET NULL)
  - `companyIdx` → Company.companyIdx (onDelete: SET NULL)
- **속성**: `name`, `position`, `department`, `role`, `mandatoryEducation`, `regularEducation`, `totalEducation`, `standardEducation`, `completionRate`
- **관계**: Member (N:1), Company (N:1), EducationRecord (1:N)

### 5. EducationRecord (교육 기록)

- **기본 키**: `id` (UUID)
- **외래 키**:
  - `memberIdx` → Member.memberIdx (onDelete: SET NULL)
  - `educationReportId` → EducationReport.id (onDelete: CASCADE)
- **속성**: `method`, `educationName`, `educationTime`, `educationDate`, `educationType` ('mandatory' | 'regular'), `fileName`, `fileUrl`
- **관계**: Member (N:1), EducationReport (N:1)

### 5-1. EducationStandard (교육 이수 기준 시간)

- **기본 키**: `id` (UUID)
- **속성**: `role`, `workType` ('production' | 'office' | null), `standardHours`, `period` ('year' | 'quarter'), `isAccidentFreeReduction` (0 | 1), `reductionRate`, `isActive` (0 | 1), `order`
- **설명**: 역할별 교육 이수 기준 시간을 관리하는 설정 테이블입니다.

### 6. SafetySystem (안전 시스템 그룹)

- **기본 키**: `safetyIdx` (INTEGER)
- **속성**: `systemName`, `isActive` (0 | 1)
- **관계**: SafetySystemItem (1:N)

### 7. SafetySystemItem (안전 시스템 아이템)

- **복합 기본 키**: `(safetyIdx, itemNumber)`
- **외래 키**: `safetyIdx` → SafetySystem.safetyIdx (onDelete: CASCADE)
- **속성**: `documentName`, `documentCount`, `cycle`, `cycleUnit`, `lastWrittenAt`, `status`
- **관계**: SafetySystem (N:1), SafetySystemDocument (1:N)

### 8. SafetySystemDocument (안전 시스템 문서)

- **기본 키**: `id` (UUID, 대리키)
- **복합 고유 키**: `(safetyIdx, itemNumber, documentNumber)` (UNIQUE 제약조건)
- **외래 키**:
  - `(safetyIdx, itemNumber)` → SafetySystemItem(safetyIdx, itemNumber) (onDelete: CASCADE)
- **속성**: `sequence`, `registeredAt`, `organizationName`, `documentName`, `writtenAt`, `approvalDeadline`, `completionRate`, `isPublished` (0 | 1), `publishedAt`
- **관계**: SafetySystemItem (N:1), DocumentApproval (1:N), DocumentSignature (1:N), DocumentNotification (1:N), SharedDocument (1:N)
- **설명**: 대리키 `id`를 PK로 사용하여 참조를 단순화하고, 복합키는 UNIQUE 제약조건으로 유지하여 계층 구조를 보장합니다.

### 9. ChatRoom (채팅방)

- **기본 키**: `id` (UUID) - Firebase RTDB 노드 키로 사용 (`/messages/{id}`)
- **외래 키**:
  - `emergencyRoomCompanyIdx` → Company.companyIdx (nullable, onDelete: SET NULL)
- **속성**: `name`, `type` ('chatbot' | 'emergency' | 'normal' | 'group'), `isGroup` (0 | 1), `organizationName`, `lastMessage` (Firebase RTDB 동기화 캐시), `lastMessageAt` (Firebase RTDB 동기화 캐시), `unreadCount` (계산된 값 캐시), `isActive` (0 | 1)
- **관계**: ChatMessage (1:N, 선택적), ChatParticipant (1:N), ChatRoomSharedDocument (1:N), Company (N:1, emergency 타입인 경우)
- **Firebase RTDB 연동**: 이 테이블의 `id`는 Firebase RTDB의 `/messages/{chatRoomId}` 노드 키로 사용됩니다. 채팅방의 메타 정보는 RDBMS에서 관리하고, 실시간 메시지는 Firebase RTDB에 저장됩니다.

### 10. ChatMessage (채팅 메시지)

- **기본 키**: `id` (UUID) - Firebase RTDB의 messageId와 동일
- **외래 키**:
  - `chatRoomId` → ChatRoom.id (onDelete: CASCADE) - Firebase RTDB 노드 키와 동일
  - `senderMemberIdx` → Member.memberIdx (onDelete: SET NULL)
  - `sharedDocumentId` → SharedDocument.id (nullable, onDelete: SET NULL)
- **속성**: `message`, `messageType`, `signalType` ('risk' | 'rescue' | 'evacuation' | null), `isRead` (0 | 1, Firebase RTDB 동기화), `isOwn` (0 | 1, 클라이언트 계산), `createAt` (Firebase RTDB timestamp 동기화)
- **관계**: ChatRoom (N:1), Member (N:1), SharedDocument (N:1, 선택적)
- **Firebase RTDB 연동**: 실시간 메시지는 주로 Firebase RTDB의 `/messages/{chatRoomId}/{messageId}`에 저장됩니다. 이 테이블은 선택적으로 사용되며, 메시지 백업, 검색/인덱싱, 장기 보관 용도로 활용됩니다.

### 11. ChatParticipant (채팅 참가자)

- **기본 키**: `id` (UUID)
- **외래 키**:
  - `chatRoomId` → ChatRoom.id (onDelete: CASCADE) - Firebase RTDB 노드 키와 동일
  - `memberIdx` → Member.memberIdx (onDelete: CASCADE)
- **속성**: `role`, `joinedAt`, `leftAt`, `isRead` (0 | 1, Firebase RTDB 메시지와 비교하여 계산), `lastReadAt` (Firebase RTDB 메시지 timestamp와 비교하여 안 읽은 메시지 수 계산), `isActive` (0 | 1)
- **관계**: ChatRoom (N:1), Member (N:1)
- **Firebase RTDB 연동**: 채팅방 진입 시 이 테이블을 조회하여 참여 중인 채팅방 목록을 가져오고, `chatRoomId`로 Firebase RTDB 리스너를 연결합니다. 안 읽은 메시지는 `lastReadAt`과 Firebase RTDB 메시지 `timestamp`를 비교하여 계산합니다.

### 12. Checklist (체크리스트)

- **기본 키**: `id` (UUID)
- **속성**: `order`, `industry`, `highRiskWork`, `status`
- **관계**: DisasterFactor (1:N)

### 13. DisasterFactor (재해 유발 요인)

- **기본 키**: `id` (UUID)
- **외래 키**: `checklistId` → Checklist.id (onDelete: CASCADE)
- **속성**: `factorName`, `isActive` (0 | 1)
- **관계**: Checklist (N:1)

### 14. CodeSetting (코드 설정)

- **기본 키**: `id` (UUID)
- **속성**: `order`, `code`, `name`, `categoryType` ('machine' | 'hazard'), `status`, `inspectionCycle`, `protectiveDevices`, `riskTypes`, `category`, `formAndType`, `location`, `exposureRisk`, `organizationName`

### 15. ServiceSetting (서비스 설정)

- **기본 키**: `id` (UUID)
- **속성**: `order`, `serviceName`, `servicePeriod`, `memberCount`, `monthlyFee`, `subscriptions`, `status`
- **관계**: CompanySubscription (1:N)

### 16. ApiSetting (API 설정)

- **기본 키**: `id` (UUID)
- **속성**: `order`, `name`, `provider`, `apiKey`, `keyStatus`, `lastInterlockedAt`, `expiresAt`, `status`

### 17. LibraryReport (라이브러리 리포트)

- **기본 키**: `id` (UUID)
- **외래 키**:
  - `categoryId` → LibraryCategory.id (onDelete: SET NULL)
  - `createdByCompanyIdx` → Company.companyIdx (onDelete: SET NULL)
- **속성**: `order`, `title`, `organizationName`, `category`, `playbackTime`, `hasSubtitles` (0 | 1), `visibilityType` ('public' | 'organization'), `hiddenByCompanyIdx` (JSON 문자열), `status`, `isActive` (0 | 1)
- **관계**: LibraryCategory (N:1), Company (N:1)

### 18. RiskReport (위험 리포트)

- **기본 키**: `id` (UUID)
- **외래 키**:
  - `reporterMemberIdx` → Member.memberIdx (onDelete: SET NULL)
  - `authorMemberIdx` → Member.memberIdx (onDelete: SET NULL)
  - `companyIdx` → Company.companyIdx (onDelete: SET NULL)
  - `chatRoomId` → ChatRoom.id (nullable, onDelete: SET NULL)
- **속성**: `title`, `location`, `content`, `imageUrl`, `imageUrls`, `sourceType` ('chat' | 'direct'), `signalType` ('risk' | 'rescue' | 'evacuation' | null), `status`, `confirmedAt`
- **관계**: Member (N:1, 보고자), Member (N:1, 작성자), Company (N:1), ChatRoom (N:1, 선택적)

### 19. SafetyReport (안전 리포트)

- **기본 키**: `id` (UUID)
- **속성**: `order`, `documentType`, `documentName`, `documentWrittenAt`, `publishedAt`, `viewCount`, `isActive` (0 | 1)

### 20. SharedDocument (공유 문서)

- **기본 키**: `id` (UUID)
- **외래 키**:
  - `memberIdx` → Member.memberIdx (onDelete: SET NULL)
  - `sharedByCompanyIdx` → Company.companyIdx (onDelete: SET NULL)
  - `priorityId` → PrioritySetting.id (onDelete: SET NULL)
- **Soft Reference** (다양한 문서 타입 참조):
  - `referenceType`: 참조 문서 타입 ('safety_system_document' | 'library_report' | 'safety_report' | 'custom')
  - `referenceId`: 참조 문서 ID (SafetySystemDocument.id, LibraryReport.id, SafetyReport.id 등)
  - `safetySystemDocumentId`: 레거시 호환성 (deprecated, referenceType이 'safety_system_document'인 경우에만 사용)
- **속성**: `priority`, `documentName`, `documentWrittenAt`, `isPublic` (0 | 1), `fileName`, `fileUrl`, `fileSize`, `viewCount`, `downloadCount`
- **관계**: Member (N:1), SafetySystemDocument (N:1, 선택적, referenceType이 'safety_system_document'인 경우), LibraryReport (N:1, 선택적, referenceType이 'library_report'인 경우), SafetyReport (N:1, 선택적, referenceType이 'safety_report'인 경우), PrioritySetting (N:1, 선택적), Company (N:1, 선택적), ChatRoomSharedDocument (1:N)
- **설명**: Soft Reference 패턴을 사용하여 공유 가능한 모든 문서 타입(SafetySystemDocument, LibraryReport, SafetyReport 등)을 통합 관리합니다.

### 21. PrioritySetting (중요도 설정)

- **기본 키**: `id` (UUID)
- **속성**: `color`, `labelType`, `customLabel`, `isActive` (0 | 1), `order`
- **관계**: SharedDocument (1:N)

### 22. LibraryCategory (라이브러리 카테고리)

- **기본 키**: `id` (UUID)
- **외래 키**:
  - `createdByCompanyIdx` → Company.companyIdx (nullable, onDelete: SET NULL)
- **속성**: `name`, `isActive` (0 | 1), `order`
- **관계**: LibraryReport (1:N), Company (N:1, 선택적)

### 23. CompanySubscription (조직 구독 서비스)

- **기본 키**: `id` (UUID)
- **외래 키**:
  - `companyIdx` → Company.companyIdx (onDelete: CASCADE)
  - `serviceSettingId` → ServiceSetting.id (onDelete: SET NULL)
- **속성**: `billingKey`, `isDefaultCard` (0 | 1), `subscriptionStatus` ('active' | 'cancelled'), `subscribedAt`, `cancelledAt`
- **관계**: Company (N:1), ServiceSetting (N:1)

### 24. CompanyInvitation (조직원 초대)

- **기본 키**: `id` (UUID)
- **외래 키**:
  - `companyIdx` → Company.companyIdx (onDelete: CASCADE)
  - `invitedBy` → Member.memberIdx (onDelete: SET NULL)
- **속성**: `inviteToken` (UNIQUE), `invitedEmail`, `expiresAt`, `acceptedAt`, `isUsed` (0 | 1)
- **관계**: Company (N:1), Member (N:1, 초대한 사람)

### 25. DocumentApproval (문서 결재 정보)

- **기본 키**: `id` (UUID)
- **외래 키**:
  - `documentId` → SafetySystemDocument.id (onDelete: CASCADE)
  - `targetMemberIdx` → Member.memberIdx (onDelete: SET NULL)
- **속성**: `approvalType` ('sequential' | 'parallel'), `approvalOrder`, `approvalStatus` ('pending' | 'approved' | 'rejected'), `approvedAt`, `signatureData`
- **관계**: SafetySystemDocument (N:1), Member (N:1)

### 26. DocumentSignature (문서 서명 정보)

- **기본 키**: `id` (UUID)
- **외래 키**:
  - `documentId` → SafetySystemDocument.id (onDelete: CASCADE)
  - `targetMemberIdx` → Member.memberIdx (onDelete: SET NULL)
- **속성**: `signatureType` ('approval' | 'signature'), `signatureStatus` ('pending' | 'signed'), `requestedAt`, `signedAt`, `signatureData`
- **관계**: SafetySystemDocument (N:1), Member (N:1)
- **설명**: 대시보드의 서명 대기 문서를 관리합니다.

### 27. DocumentNotification (문서 알림 발송 이력)

- **기본 키**: `id` (UUID)
- **외래 키**:
  - `documentId` → SafetySystemDocument.id (문서 알림의 경우, nullable, onDelete: CASCADE)
  - `targetMemberIdx` → Member.memberIdx (onDelete: SET NULL)
- **속성**: `notificationType` ('approval_request' | 'signature_request' | 'deadline_reminder' | 'risk_report_new' | 'chat_message' | 'education_reminder'), `scheduledAt`, `sentAt` (FCM 전송 완료 시점), `reminderDays`
- **관계**: SafetySystemDocument (N:1, 선택적), Member (N:1)
- **푸시 알림 시스템**: 이 엔티티는 문서 관련 알림의 예약 및 전송 이력을 관리합니다. 구조를 확장하여 모든 유형의 알림 이력을 관리할 수 있습니다.

### 28. ChatRoomSharedDocument (채팅방 공유 문서)

- **기본 키**: `id` (UUID)
- **외래 키**:
  - `chatRoomId` → ChatRoom.id (onDelete: CASCADE)
  - `sharedDocumentId` → SharedDocument.id (onDelete: CASCADE)
  - `sharedByMemberIdx` → Member.memberIdx (onDelete: SET NULL)
- **속성**: `createAt`
- **관계**: ChatRoom (N:1), SharedDocument (N:1), Member (N:1)

## 데이터 정규화

### 제1정규형 (1NF)

- 모든 테이블은 원자값만 포함

### 제2정규형 (2NF)

- 부분 함수 종속성 제거
- 예: SafetySystemItem은 (safetyIdx, itemNumber) 복합키 사용

### 제3정규형 (3NF)

- 이행 함수 종속성 제거
- 예: EducationReport의 organizationName은 Company를 통해 참조 가능

## 인덱스 전략

### 주요 인덱스

1. `SuperAdmin.memberIdx` (UNIQUE INDEX)
2. `Member.memberId` (UNIQUE INDEX)
3. `Member.companyIdx` (INDEX)
4. `Member.joinedAt` (INDEX) - 이수율 계산용
5. `Member.fcmToken` (UNIQUE INDEX) - FCM 토큰 (푸시 알림 전송용)
6. `Member.isPushEnabled` (INDEX) - 푸시 알림 허용 여부
7. `Member(companyIdx, memberRole)` (COMPOSITE INDEX) - 회사별 역할 조회용
8. `Member(companyBranchIdx, memberRole)` (COMPOSITE INDEX) - 지점별 역할 조회용
9. `EducationReport.memberIdx` (INDEX)
10. `EducationReport.companyIdx` (INDEX)
11. `EducationRecord.memberIdx` (INDEX)
12. `EducationRecord.educationReportId` (INDEX)
13. `EducationRecord.educationDate` (INDEX)
14. `SafetySystemDocument.id` (PRIMARY KEY)
15. `SafetySystemDocument(safetyIdx, itemNumber, documentNumber)` (UNIQUE COMPOSITE INDEX)
16. `SafetySystemDocument(safetyIdx, itemNumber)` (COMPOSITE INDEX)
17. `SafetySystemDocument.isPublished` (INDEX)
18. `ChatMessage.chatRoomId` (INDEX)
19. `ChatMessage.createAt` (INDEX)
20. `ChatMessage.signalType` (INDEX)
21. `ChatParticipant(chatRoomId, memberIdx)` (UNIQUE COMPOSITE INDEX)
22. `ChatParticipant.isActive` (INDEX)
23. `RiskReport.reporterMemberIdx` (INDEX)
24. `RiskReport.companyIdx` (INDEX)
25. `RiskReport.chatRoomId` (INDEX)
26. `RiskReport.signalType` (INDEX)
27. `DocumentApproval.documentId` (INDEX)
28. `DocumentApproval.approvalStatus` (INDEX)
29. `DocumentSignature.documentId` (INDEX)
30. `DocumentSignature.signatureStatus` (INDEX)
31. `CompanySubscription.companyIdx` (INDEX)
32. `CompanySubscription.subscriptionStatus` (INDEX)
33. `CompanyInvitation.inviteToken` (UNIQUE INDEX)
34. `LibraryReport.createdByCompanyIdx` (INDEX)
35. `LibraryReport.visibilityType` (INDEX)
36. `SharedDocument.sharedByCompanyIdx` (INDEX)
37. `SharedDocument.isPublic` (INDEX)
38. `SharedDocument(referenceType, referenceId)` (COMPOSITE INDEX) - 문서 타입별 참조 조회용
39. `DocumentNotification.targetMemberIdx` (INDEX) - 푸시 알림 대상 조회용
40. `DocumentNotification.notificationType` (INDEX) - 알림 유형별 조회용
41. `DocumentNotification.sentAt` (INDEX) - 전송 이력 조회용

## 공통 필드

모든 테이블에는 다음 필드들이 공통으로 포함됩니다:

- `createAt`: 생성일시 (Timestamp, ISO 8601 형식)
- `updateAt`: 수정일시 (Timestamp, ISO 8601 형식)
- `deletedAt`: 삭제일시 (Timestamp | null, Soft Delete용)
- `createdBy`: 생성자 (ForeignKey<number> | null, FK → Member.memberIdx)
- `updatedBy`: 수정자 (ForeignKey<number> | null, FK → Member.memberIdx)
- `description`: 설명 (string | null)
- `memo`: 메모 (string | null, 일부 테이블)

## 속성 이름 통일 규칙

### 날짜/시간 필드

- `createAt`, `updateAt`, `deletedAt`: ISO 8601 형식 (Timestamp)
- `*At` 패턴: 시간까지 포함 (예: `lastMessageAt`, `joinedAt`, `publishedAt`)
- `*Date` 패턴: 날짜만 포함 (예: `educationDate`, `documentWrittenAt`, `expiresAt`)

### 기타 필드

- `registrationDate` → `createAt`으로 통일 (등록일은 생성일과 동일)
- `lastInterlocked` → `lastInterlockedAt` (마지막 연동 시간)
- `expirationDate` → `expiresAt` (만료일)
- `documentDate` → `documentWrittenAt` (문서 작성일)
- `writtenDate` → `documentWrittenAt` (문서 작성일)
- `lastSigninDate` → `lastSigninAt` (마지막 로그인 시간)
- `lastMessageTime` → `lastMessageAt` (마지막 메시지 시간)

## 1:N 관계 네이밍 규칙

백엔드 개발 규칙에 따라 1:N 관계 시 네이밍을 명확히 구분합니다:

- **1 측 (부모)**: 여러 개의 N을 가지므로 `{Entity}List` 사용
  - 예: `Company.companyBranchList`, `Member.memberEducationReportList`
- **N 측 (자식)**: 하나의 1을 가지므로 `{Entity}Information` 사용
  - 예: `CompanyBranch.companyBranchCompanyInformation`, `EducationReport.educationReportMemberInformation`

## onDelete 규칙

외래키 관계에서 삭제 동작을 명확히 정의합니다:

### CASCADE (부모 삭제 시 자식도 삭제)

- `CompanyBranch.companyIdx` → Company.companyIdx
- `SafetySystemItem.safetyIdx` → SafetySystem.safetyIdx
- `SafetySystemDocument` → SafetySystemItem (복합키)
- `EducationRecord.educationReportId` → EducationReport.id
- `ChatMessage.chatRoomId` → ChatRoom.id
- `ChatParticipant.chatRoomId` → ChatRoom.id
- `ChatParticipant.memberIdx` → Member.memberIdx
- `DisasterFactor.checklistId` → Checklist.id
- `CompanySubscription.companyIdx` → Company.companyIdx
- `CompanyInvitation.companyIdx` → Company.companyIdx
- `DocumentApproval.documentId` → SafetySystemDocument.id
- `DocumentSignature.documentId` → SafetySystemDocument.id
- `DocumentNotification.documentId` → SafetySystemDocument.id
- `ChatRoomSharedDocument.chatRoomId` → ChatRoom.id
- `ChatRoomSharedDocument.sharedDocumentId` → SharedDocument.id

### SET NULL (부모 삭제 시 자식의 외래키만 NULL 처리)

- `Company.createdBy`, `updatedBy` → Member.memberIdx
- `CompanyBranch.branchManager1MemberIdx`, `branchManager2MemberIdx` → Member.memberIdx
- `Member.companyIdx` → Company.companyIdx
- `Member.companyBranchIdx` → CompanyBranch.companyBranchIdx
- `EducationReport.memberIdx`, `companyIdx` → Member.memberIdx, Company.companyIdx
- `EducationRecord.memberIdx` → Member.memberIdx
- `RiskReport.reporterMemberIdx`, `authorMemberIdx`, `companyIdx` → Member.memberIdx, Company.companyIdx
- `ChatMessage.senderMemberIdx` → Member.memberIdx
- `SharedDocument.memberIdx`, `sharedByCompanyIdx` → Member.memberIdx, Company.companyIdx
- 기타 모든 `createdBy`, `updatedBy` 필드 → Member.memberIdx

## Boolean 필드 통일 규칙

모든 boolean 타입 필드는 `0 | 1` (number)로 통일됩니다:

- `isActive`: 0 (비활성) | 1 (활성)
- `isPublic`: 0 (비공개) | 1 (공개)
- `isPublished`: 0 (미게시) | 1 (게시)
- `isDefaultCard`: 0 (아니오) | 1 (예)
- `isRead`: 0 (안읽음) | 1 (읽음)
- `isAccidentFreeWorksite`: 0 (아니오) | 1 (예)
- `isAccidentFreeReduction`: 0 (미적용) | 1 (적용)
- `isUsed`: 0 (미사용) | 1 (사용)
- `isGroup`: 0 (아니오) | 1 (예)
- `isOwn`: 0 (아니오) | 1 (예)
- `hasSubtitles`: 0 (없음) | 1 (있음)

## JSON 필드 규칙

백엔드에서 가공할 필요가 없는 데이터는 JSON 문자열로 저장합니다:

- 데이터베이스 컬럼 타입: `text` 사용
- TypeORM 엔티티 타입: `text` 또는 `longtext`
- JSON 파싱/변환 없이 그대로 저장
- 예: `LibraryReport.hiddenByCompanyIdx: string | null` (JSON 배열 문자열)
  - 저장: `JSON.stringify([1, 2, 3])`
  - 조회: `JSON.parse(entity.hiddenByCompanyIdx)`

## Firebase Realtime Database 연동 설계

### 개요

채팅 시스템은 **하이브리드 아키텍처**를 사용합니다:

- **RDBMS (PostgreSQL/MySQL)**: 채팅방 메타 정보, 참여자 정보, 영속적 데이터 관리
- **Firebase Realtime Database (RTDB)**: 실시간 메시지 데이터 저장 및 동기화

### RDBMS 역할

#### ChatRoom (채팅방)

- **역할**: 채팅방의 메타 정보 관리 (이름, 유형, 생성 회사 등)
- **RTDB 연결**: `ChatRoom.id` (PK)를 Firebase RTDB의 `/messages/{chatRoomId}` 노드 키로 사용
- **캐시 필드**: `lastMessage`, `lastMessageAt`, `unreadCount`는 Firebase RTDB에서 동기화된 값을 캐시

#### ChatParticipant (채팅 참가자)

- **역할**: 참여자 정보, 마지막 읽은 시간 등 상태 관리
- **RTDB 연결**: `ChatParticipant.chatRoomId`로 Firebase RTDB 노드 접근
- **안 읽은 메시지 계산**: `lastReadAt`과 Firebase RTDB 메시지 `timestamp` 비교

#### ChatMessage (채팅 메시지) - 선택적

- **역할**: 메시지 백업, 검색/인덱싱, 장기 보관
- **사용 시나리오**:
  1. Firebase RTDB → RDBMS 동기화 (백업)
  2. 메시지 검색/인덱싱 (RDBMS의 강력한 검색 기능 활용)
  3. 장기 보관 및 분석
- **참고**: 실시간 채팅은 Firebase RTDB를 우선 사용

### Firebase RTDB 데이터 구조

#### A. 메시지 노드 (`/messages/{chatRoomId}/{messageId}`)

```json
{
  "messages": {
    "12345": {
      // chatRoomId (RDBMS ChatRoom.id)
      "msg-001": {
        "senderIdx": 101, // RDBMS Member.memberIdx
        "text": "위험 보고서 확인하셨나요?",
        "timestamp": 1678886400000,
        "type": "text",
        "sharedDocumentId": null // RDBMS SharedDocument.id (공유 문서)
      },
      "msg-002": {
        "senderIdx": 202,
        "text": "네, 지금 서명 처리 중입니다.",
        "timestamp": 1678886460000,
        "type": "text",
        "sharedDocumentId": null
      }
    },
    "54321": {
      // 다른 채팅방 메시지들...
    }
  }
}
```

**특징**:

- `chatRoomId`를 최상위 노드로 설정하여 데이터 접근 권한 설정(Security Rules) 및 쿼리 효율성 향상
- RDBMS의 `ChatMessage` 엔티티 필드와 유사하게 구성하되, 실시간 전송에 필요한 최소한의 정보만 포함

#### B. 사용자 상태 노드 (`/user_status/{memberIdx}`)

```json
{
  "user_status": {
    "101": {
      // memberIdx (RDBMS Member.memberIdx)
      "isOnline": true,
      "last_seen": 1678886460000,
      "inRoom": "12345" // 현재 참여 중인 채팅방 ID
    },
    "202": {
      "isOnline": false,
      "last_seen": 1678886500000
    }
  }
}
```

**용도**: 사용자의 온라인 상태나 마지막 접속/활동 시간을 관리하여 UI에 표시

### 데이터 흐름 (Flow)

#### 1. 채팅방 진입

1. 사용자가 앱을 열면 RDBMS의 `ChatParticipant` 테이블을 조회하여 참여 중인 채팅방 목록을 가져옵니다.
2. 가져온 `chatRoomId`를 이용하여 Firebase RTDB의 `/messages/{chatRoomId}` 노드에 리스너를 붙여 실시간 메시지를 수신합니다.

#### 2. 메시지 전송

1. 클라이언트가 메시지를 작성하고 Firebase RTDB의 `/messages/{chatRoomId}` 노드에 데이터를 Push합니다.
2. Firebase RTDB는 실시간으로 해당 방의 모든 참여자 클라이언트에 메시지를 동기화합니다.
3. (선택적) 백업이 필요한 경우 Firebase RTDB → RDBMS `ChatMessage` 테이블에 동기화합니다.

#### 3. 안 읽은 메시지 처리

1. 새 메시지가 수신되면 클라이언트는 RDBMS의 `ChatParticipant` 테이블의 `lastReadAt` 필드를 현재 시점으로 업데이트합니다.
2. 다른 참여자의 `ChatParticipant.lastReadAt`과 Firebase RTDB에 있는 메시지 `timestamp`를 비교하여 안 읽은 메시지 수를 계산합니다.
3. `ChatRoom.unreadCount`는 계산된 값을 캐시합니다.

#### 4. 문서/링크 공유

- `ChatMessage.sharedDocumentId` 필드에 RDBMS의 `SharedDocument.id`를 함께 저장하여, 메시지와 RDBMS의 문서 정보를 연결합니다.
- Firebase RTDB 메시지에는 `sharedDocumentId`만 저장하고, 실제 문서 정보는 RDBMS에서 조회합니다.

### 보안 규칙 (Security Rules) 예시

```javascript
{
  "rules": {
    "messages": {
      "$chatRoomId": {
        // ChatParticipant 테이블에서 해당 방의 참여자인지 확인
        ".read": "auth != null && root.child('user_participants').child(auth.uid).child($chatRoomId).exists()",
        ".write": "auth != null && root.child('user_participants').child(auth.uid).child($chatRoomId).exists()"
      }
    },
    "user_status": {
      "$memberIdx": {
        ".read": "auth != null",
        ".write": "auth != null && auth.uid == $memberIdx"
      }
    }
  }
}
```

### 장점

1. **실시간성**: Firebase RTDB의 실시간 동기화로 즉각적인 메시지 전송/수신
2. **확장성**: NoSQL 구조로 대용량 메시지 처리에 유리
3. **데이터 무결성**: RDBMS에서 관계형 데이터 관리로 데이터 일관성 보장
4. **검색 기능**: RDBMS의 강력한 검색 기능 활용 (필요시)
5. **백업**: Firebase RTDB → RDBMS 동기화로 데이터 백업 가능

## 푸시 알림 시스템 설계

### 개요

푸시 알림은 실시간 커뮤니케이션 및 안전 관리 시스템에서 핵심적인 기능입니다. 사용자의 안전과 직결되는 시스템이므로, 단순히 메시지 도착 알림뿐만 아니라, 긴급 상황 보고, 문서 승인 마감일 임박, 필수 교육 이수 독려 등 다양한 상황에 대한 알림이 필요합니다.

푸시 알림을 구현하기 위해서는 **RDBMS**, **Firebase RTDB**, 그리고 **Firebase Cloud Messaging (FCM)** 세 가지 요소를 유기적으로 연결해야 합니다.

### 1. RDBMS 역할: 알림 대상 및 상태 관리

#### A. Member 엔티티 확장 (FCM 토큰 관리)

알림을 보내려면 FCM 서버에 등록된 디바이스 토큰이 필요합니다.

**추가 필드**:

- `fcmToken`: 사용자의 디바이스 고유 FCM 토큰 (UNIQUE 제약조건 필수)
- `isPushEnabled`: 사용자가 푸시 알림을 허용했는지 여부 (0 | 1)

**인덱스**:

- `fcmToken`: UNIQUE INDEX
- `isPushEnabled`: INDEX (푸시 알림 허용 사용자 조회용)

#### B. DocumentNotification 엔티티 활용

`DocumentNotification`은 이미 문서 관련 알림의 예약 및 전송 이력을 관리하도록 설계되어 있습니다. 이 구조를 확장하여 모든 유형의 알림 이력을 관리할 수 있습니다.

**주요 필드**:

- `id`: 알림 기록의 고유 ID
- `documentId`: (문서 알림의 경우) 대상 문서 ID (nullable)
- `targetMemberIdx`: 알림을 수신해야 하는 사용자 ID
- `notificationType`: 알림의 종류
  - `approval_request`: 결재 요청
  - `signature_request`: 서명 요청
  - `deadline_reminder`: 마감일 알림
  - `risk_report_new`: 새로운 위험 보고서
  - `chat_message`: 채팅 메시지
  - `education_reminder`: 교육 이수 독려
- `scheduledAt`: 알림이 예약된 시간 (예: 마감일 1일 전)
- `sentAt`: 실제로 알림이 전송된 시간 (FCM 전송 완료 시점)
- `reminderDays`: (문서 알림의 경우) 마감일까지 남은 일수 등

### 2. Firebase Cloud Messaging (FCM) 역할: 전송 엔진

FCM은 실제 알림 메시지를 Android/iOS 디바이스로 전달하는 역할을 담당합니다.

**웹훅(Webhook) 기반 알림 트리거**: RDBMS의 데이터 변경(예: `RiskReport`에 새로운 보고서가 등록됨)을 감지하는 백엔드 서버가 FCM API를 호출하여 해당 `fcmToken`을 가진 사용자에게 알림을 전송합니다.

### 3. 알림 유형별 트리거 설계

| 알림 유형               | 트리거 (이벤트 발생 위치)                                         | 대상 사용자 결정 기준                                                                                                                                        |
| ----------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **새 메시지 알림**      | Firebase RTDB에 새 메시지가 추가될 때 (Cloud Functions 사용 권장) | 1. `ChatParticipant`에서 해당 `chatRoomId`를 가진 모든 멤버<br>2. 이들의 `lastReadAt`이 새 메시지 `timestamp`보다 이전인 경우만 대상                         |
| **위험 보고서 알림**    | RDBMS의 `RiskReport`에 새 레코드 삽입                             | `RiskReport`와 연결된 `Company`의 안전 관리 담당자 또는 최고 관리자 (`SuperAdmin`)                                                                           |
| **문서 승인 마감 임박** | RDBMS의 스케줄러(Cron Job)가 매일 실행                            | 1. `SafetySystemDocument`와 연결된 `DocumentApproval`의 `approvalDeadline`이 임박한 멤버<br>2. `DocumentNotification` 테이블의 `scheduledAt`과 비교하여 전송 |
| **교육 이수 독려**      | RDBMS의 스케줄러(Cron Job)가 매주 실행                            | `EducationReport`의 `completionRate`가 낮고, `EducationStandard`를 충족하지 못한 `Member`                                                                    |

### 4. 메시지 알림 (RTDB & FCM 연동)

실시간 채팅 메시지에 대한 푸시 알림은 가장 빈번하게 발생하므로, 서버 부하를 줄이기 위해 **Firebase Cloud Functions**를 사용하여 RTDB와 직접 연동하는 것이 일반적입니다.

#### 프로세스

1. **RTDB 감지**: `/messages/{chatRoomId}/{messageId}` 노드에 데이터가 **새로 작성(onCreate)**되는 것을 Cloud Function이 감지합니다.

2. **대상 확인**:

   - `ChatParticipant` 테이블(RDBMS)을 조회하여 누가 해당 방에 있는지 확인
   - 현재 앱을 사용 중이 아닌지 판단 (`isRead` 또는 `lastReadAt` 필드 확인)
   - `Member.isPushEnabled = 1`인 사용자만 대상

3. **FCM 호출**:
   - 대상 사용자들의 `fcmToken`을 `Member` 테이블에서 가져옵니다
   - FCM API를 호출하여 알림을 전송합니다
   - `DocumentNotification` 테이블에 전송 이력을 기록합니다 (`sentAt` 업데이트)

#### Cloud Functions 예시 코드

```javascript
// Firebase Cloud Functions
exports.onMessageCreated = functions.database
  .ref('/messages/{chatRoomId}/{messageId}')
  .onCreate(async (snapshot, context) => {
    const { chatRoomId, messageId } = context.params;
    const messageData = snapshot.val();

    // 1. RDBMS에서 ChatParticipant 조회
    const participants = await db.query(
      'SELECT memberIdx, lastReadAt FROM ChatParticipant WHERE chatRoomId = ? AND isActive = 1',
      [chatRoomId]
    );

    // 2. 대상 사용자 필터링 (앱 사용 중이 아닌 사용자)
    const targetMembers = participants.filter((p) => {
      const messageTimestamp = messageData.timestamp;
      return !p.lastReadAt || p.lastReadAt < messageTimestamp;
    });

    // 3. FCM 토큰 조회 및 알림 전송
    for (const participant of targetMembers) {
      const member = await db.query(
        'SELECT fcmToken FROM Member WHERE memberIdx = ? AND isPushEnabled = 1',
        [participant.memberIdx]
      );

      if (member && member.fcmToken) {
        await admin.messaging().send({
          token: member.fcmToken,
          notification: {
            title: '새 메시지',
            body: messageData.text,
          },
          data: {
            chatRoomId: chatRoomId,
            messageId: messageId,
          },
        });

        // 4. DocumentNotification에 전송 이력 기록
        await db.query(
          'INSERT INTO DocumentNotification (targetMemberIdx, notificationType, sentAt) VALUES (?, ?, ?)',
          [participant.memberIdx, 'chat_message', new Date()]
        );
      }
    }
  });
```

### 5. 알림 전송 흐름도

```
┌─────────────────┐
│  이벤트 발생      │
│  (RDBMS/RTDB)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  대상 사용자 조회  │
│  (RDBMS)        │
│  - ChatParticipant│
│  - Member       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  FCM 토큰 조회   │
│  (Member.fcmToken)│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  FCM API 호출   │
│  (알림 전송)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  전송 이력 기록   │
│  (DocumentNotification)│
└─────────────────┘
```

### 6. 보안 및 최적화 고려사항

1. **토큰 관리**:

   - `fcmToken`은 UNIQUE 제약조건으로 중복 방지
   - 토큰 갱신 시 기존 토큰 업데이트 또는 삭제

2. **알림 빈도 제한**:

   - 같은 사용자에게 짧은 시간 내 여러 알림이 발생하는 경우 배치 처리
   - 알림 우선순위 설정 (긴급 > 일반)

3. **오프라인 사용자**:

   - FCM은 오프라인 사용자에게도 알림을 큐에 저장하여 나중에 전송
   - `isPushEnabled = 0`인 사용자는 알림 전송 제외

4. **에러 처리**:
   - FCM 전송 실패 시 재시도 로직
   - 무효한 토큰은 `fcmToken`을 NULL로 업데이트

## 참고사항

- 모든 날짜/시간 필드는 ISO 8601 형식 사용
- UUID는 `id` 필드에 사용
- AUTO_INCREMENT는 `*Idx` 패턴의 필드에 사용
- Soft Delete는 `deletedAt` 필드로 관리 (null이면 삭제되지 않음)
- 외래 키 제약조건은 데이터 무결성을 보장하기 위해 설정
- 모든 테이블은 `createAt`, `updateAt`, `deletedAt` 필드를 포함
- 생성자/수정자 추적을 위해 `createdBy`, `updatedBy` 필드 포함 (nullable)
- 슈퍼어드민은 SuperAdmin 테이블로 별도 관리되며, Member 테이블의 memberRole에는 포함되지 않음
- 채팅 시스템은 Firebase Realtime Database와 하이브리드 아키텍처로 설계됨
