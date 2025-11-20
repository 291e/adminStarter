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
│ PK safetyIdx    │ (복합키)
│ PK itemNumber   │ (복합키)
│ PK documentNumber (복합키)
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
- **속성**: `memberRole` ('admin' | 'member' | 'distributor' | 'agency' | 'dealer'), `memberName`, `memberEmail`, `memberPhone`, `memberStatus`, `joinedAt` (입사일)
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

- **복합 기본 키**: `(safetyIdx, itemNumber, documentNumber)`
- **외래 키**:
  - `(safetyIdx, itemNumber)` → SafetySystemItem(safetyIdx, itemNumber) (onDelete: CASCADE)
- **속성**: `sequence`, `registeredAt`, `organizationName`, `documentName`, `writtenAt`, `approvalDeadline`, `completionRate`, `isPublished` (0 | 1), `publishedAt`
- **관계**: SafetySystemItem (N:1), DocumentApproval (1:N), DocumentSignature (1:N), DocumentNotification (1:N), SharedDocument (1:N)

### 9. ChatRoom (채팅방)

- **기본 키**: `id` (UUID)
- **외래 키**:
  - `emergencyRoomCompanyIdx` → Company.companyIdx (nullable, onDelete: SET NULL)
- **속성**: `name`, `type` ('chatbot' | 'emergency' | 'normal' | 'group'), `isGroup` (0 | 1), `organizationName`, `lastMessage`, `lastMessageAt`, `unreadCount`, `isActive` (0 | 1)
- **관계**: ChatMessage (1:N), ChatParticipant (1:N), ChatRoomSharedDocument (1:N), Company (N:1, emergency 타입인 경우)

### 10. ChatMessage (채팅 메시지)

- **기본 키**: `id` (UUID)
- **외래 키**:
  - `chatRoomId` → ChatRoom.id (onDelete: CASCADE)
  - `senderMemberIdx` → Member.memberIdx (onDelete: SET NULL)
  - `sharedDocumentId` → SharedDocument.id (nullable, onDelete: SET NULL)
- **속성**: `message`, `messageType`, `signalType` ('risk' | 'rescue' | 'evacuation' | null), `isRead` (0 | 1), `isOwn` (0 | 1), `createAt`
- **관계**: ChatRoom (N:1), Member (N:1), SharedDocument (N:1, 선택적)

### 11. ChatParticipant (채팅 참가자)

- **기본 키**: `id` (UUID)
- **외래 키**:
  - `chatRoomId` → ChatRoom.id (onDelete: CASCADE)
  - `memberIdx` → Member.memberIdx (onDelete: CASCADE)
- **속성**: `role`, `joinedAt`, `leftAt`, `isRead` (0 | 1), `lastReadAt`, `isActive` (0 | 1)
- **관계**: ChatRoom (N:1), Member (N:1)

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
  - `safetySystemDocumentId` → SafetySystemDocument (복합키 참조, onDelete: SET NULL)
  - `memberIdx` → Member.memberIdx (onDelete: SET NULL)
  - `sharedByCompanyIdx` → Company.companyIdx (onDelete: SET NULL)
  - `priorityId` → PrioritySetting.id (onDelete: SET NULL)
- **속성**: `priority`, `documentName`, `documentWrittenAt`, `isPublic` (0 | 1), `fileName`, `fileUrl`, `fileSize`, `viewCount`, `downloadCount`
- **관계**: Member (N:1), SafetySystemDocument (N:1, 선택적), PrioritySetting (N:1, 선택적), Company (N:1, 선택적), ChatRoomSharedDocument (1:N)

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
  - `documentId` → SafetySystemDocument (복합키 참조, onDelete: CASCADE)
  - `targetMemberIdx` → Member.memberIdx (onDelete: SET NULL)
- **속성**: `approvalType` ('sequential' | 'parallel'), `approvalOrder`, `approvalStatus` ('pending' | 'approved' | 'rejected'), `approvedAt`, `signatureData`
- **관계**: SafetySystemDocument (N:1), Member (N:1)

### 26. DocumentSignature (문서 서명 정보)

- **기본 키**: `id` (UUID)
- **외래 키**:
  - `documentId` → SafetySystemDocument (복합키 참조, onDelete: CASCADE)
  - `targetMemberIdx` → Member.memberIdx (onDelete: SET NULL)
- **속성**: `signatureType` ('approval' | 'signature'), `signatureStatus` ('pending' | 'signed'), `requestedAt`, `signedAt`, `signatureData`
- **관계**: SafetySystemDocument (N:1), Member (N:1)
- **설명**: 대시보드의 서명 대기 문서를 관리합니다.

### 27. DocumentNotification (문서 알림 발송 이력)

- **기본 키**: `id` (UUID)
- **외래 키**:
  - `documentId` → SafetySystemDocument (복합키 참조, onDelete: CASCADE)
  - `targetMemberIdx` → Member.memberIdx (onDelete: SET NULL)
- **속성**: `notificationType` ('approval_request' | 'signature_request' | 'deadline_reminder'), `scheduledAt`, `sentAt`, `reminderDays`
- **관계**: SafetySystemDocument (N:1), Member (N:1)

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
5. `EducationReport.memberIdx` (INDEX)
6. `EducationReport.companyIdx` (INDEX)
7. `EducationRecord.memberIdx` (INDEX)
8. `EducationRecord.educationReportId` (INDEX)
9. `EducationRecord.educationDate` (INDEX)
10. `SafetySystemDocument(safetyIdx, itemNumber)` (COMPOSITE INDEX)
11. `SafetySystemDocument.isPublished` (INDEX)
12. `ChatMessage.chatRoomId` (INDEX)
13. `ChatMessage.createAt` (INDEX)
14. `ChatMessage.signalType` (INDEX)
15. `ChatParticipant(chatRoomId, memberIdx)` (UNIQUE COMPOSITE INDEX)
16. `ChatParticipant.isActive` (INDEX)
17. `RiskReport.reporterMemberIdx` (INDEX)
18. `RiskReport.companyIdx` (INDEX)
19. `RiskReport.chatRoomId` (INDEX)
20. `RiskReport.signalType` (INDEX)
21. `DocumentApproval.documentId` (INDEX)
22. `DocumentApproval.approvalStatus` (INDEX)
23. `DocumentSignature.documentId` (INDEX)
24. `DocumentSignature.signatureStatus` (INDEX)
25. `CompanySubscription.companyIdx` (INDEX)
26. `CompanySubscription.subscriptionStatus` (INDEX)
27. `CompanyInvitation.inviteToken` (UNIQUE INDEX)
28. `LibraryReport.createdByCompanyIdx` (INDEX)
29. `LibraryReport.visibilityType` (INDEX)
30. `SharedDocument.sharedByCompanyIdx` (INDEX)
31. `SharedDocument.isPublic` (INDEX)

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
- `DocumentApproval.documentId` → SafetySystemDocument
- `DocumentSignature.documentId` → SafetySystemDocument
- `DocumentNotification.documentId` → SafetySystemDocument
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

## 참고사항

- 모든 날짜/시간 필드는 ISO 8601 형식 사용
- UUID는 `id` 필드에 사용
- AUTO_INCREMENT는 `*Idx` 패턴의 필드에 사용
- Soft Delete는 `deletedAt` 필드로 관리 (null이면 삭제되지 않음)
- 외래 키 제약조건은 데이터 무결성을 보장하기 위해 설정
- 모든 테이블은 `createAt`, `updateAt`, `deletedAt` 필드를 포함
- 생성자/수정자 추적을 위해 `createdBy`, `updatedBy` 필드 포함 (nullable)
- 슈퍼어드민은 SuperAdmin 테이블로 별도 관리되며, Member 테이블의 memberRole에는 포함되지 않음
