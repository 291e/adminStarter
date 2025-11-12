# 데이터베이스 ERD 및 스키마 설계

이 문서는 프로젝트에서 사용하는 모든 목업 데이터를 데이터베이스 ERD 형식으로 정리한 것입니다.

## 엔티티 관계도 (ERD)

```
┌─────────────────┐
│    Company      │
│─────────────────│
│ PK companyIdx   │
│    companyName  │
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
│    branchManager1MemberIdx (FK)
│    branchManager2MemberIdx (FK)
│    createAt     │
│    updateAt     │
└────────┬────────┘
         │
         │ 1:N
         │
┌────────▼────────┐
│     Member      │
│─────────────────│
│ PK memberIdx    │
│ AK memberId     │
│ FK companyIdx   │
│ FK companyBranchIdx (nullable)
│    memberRole   │
│    memberName   │
│    memberEmail  │
│    memberPhone  │
│    memberStatus │
│    ...          │
└────────┬────────┘
         │
         │ 1:N
         │
┌────────▼────────┐
│  EducationReport│
│─────────────────│
│ PK id           │
│ FK memberIdx    │
│ FK companyIdx   │
│    name         │
│    department   │
│    role         │
│    mandatoryEducation
│    regularEducation
│    totalEducation
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
│    method       │
│    educationName
│    educationTime
│    educationDate
│    fileName      │
└─────────────────┘

┌─────────────────┐
│  SafetySystem   │
│─────────────────│
│ PK safetyIdx    │
│    systemName   │
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
│    cycleUnit    │
│    lastWrittenAt
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
│    sequence     │
│    registeredAt │
│    organizationName
│    documentName │
│    writtenAt    │
│    approvalDeadline
│    completionRate
└─────────────────┘

┌─────────────────┐
│    ChatRoom     │
│─────────────────│
│ PK id           │
│    name         │
│    type         │
│    isGroup      │
│    organizationName
│    lastMessage  │
│    lastMessageTime
│    unreadCount  │
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
│    message      │
│    timestamp    │
│    isOwn        │
└─────────────────┘

┌─────────────────┐
│ChatParticipant  │
│─────────────────│
│ PK id           │
│ FK chatRoomId   │
│ FK memberIdx    │
│    role         │
└─────────────────┘

┌─────────────────┐
│   Checklist     │
│─────────────────│
│ PK id           │
│    order        │
│    industry     │
│    highRiskWork │
│    registrationDate
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
└─────────────────┘

┌─────────────────┐
│  CodeSetting    │
│─────────────────│
│ PK id           │
│    order        │
│    code         │
│    name         │
│    categoryType │
│    status       │
│    ...          │
└─────────────────┘

┌─────────────────┐
│ ServiceSetting  │
│─────────────────│
│ PK id           │
│    serviceName  │
│    servicePeriod
│    memberCount  │
│    monthlyFee   │
│    subscriptions
│    status       │
└─────────────────┘

┌─────────────────┐
│   ApiSetting    │
│─────────────────│
│ PK id           │
│    name         │
│    provider     │
│    keyStatus    │
│    lastInterlocked
│    expirationDate
│    status       │
└─────────────────┘

┌─────────────────┐
│ LibraryReport   │
│─────────────────│
│ PK id           │
│ FK categoryId   │
│    order        │
│    title        │
│    registrationDate
│    playbackTime │
│    hasSubtitles │
│    status       │
└─────────────────┘

┌─────────────────┐
│   RiskReport    │
│─────────────────│
│ PK id           │
│ FK reporterMemberIdx
│ FK authorMemberIdx
│    title        │
│    location     │
│    content      │
│    imageUrl     │
│    registeredAt │
│    status       │
└─────────────────┘

┌─────────────────┐
│  SafetyReport   │
│─────────────────│
│ PK id           │
│    order        │
│    documentType │
│    documentName │
│    documentDate │
│    publishedAt  │
│    viewCount    │
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

### 1. Company (회사)

- **기본 키**: `companyIdx` (AUTO_INCREMENT)
- **속성**: `companyName`, `createAt`, `updateAt`
- **관계**: CompanyBranch (1:N)

### 2. CompanyBranch (회사 지점)

- **기본 키**: `companyBranchIdx` (AUTO_INCREMENT)
- **외래 키**:
  - `companyIdx` → Company.companyIdx
  - `branchManager1MemberIdx` → Member.memberIdx (nullable)
  - `branchManager2MemberIdx` → Member.memberIdx (nullable)
- **속성**: `companyBranchName`, `createAt`, `updateAt`

### 3. Member (멤버/사용자)

- **기본 키**: `memberIdx` (AUTO_INCREMENT)
- **대체 키**: `memberId` (UNIQUE)
- **외래 키**:
  - `companyIdx` → Company.companyIdx
  - `companyBranchIdx` → CompanyBranch.companyBranchIdx (nullable)
- **속성**: `memberRole`, `memberName`, `memberEmail`, `memberPhone`, `memberStatus`, `memberAddress`, `memberThumbnail`, `lastSigninDate`, `deviceToken`, `deviceGubun`, `memberlat`, `memberlng`, `createAt`, `updateAt`

### 4. EducationReport (교육 리포트)

- **기본 키**: `id` (UUID)
- **외래 키**:
  - `memberIdx` → Member.memberIdx
  - `companyIdx` → Company.companyIdx
- **속성**: `name`, `position`, `department`, `role`, `mandatoryEducation`, `regularEducation`, `totalEducation`, `standardEducation`, `completionRate`

### 5. EducationRecord (교육 기록)

- **기본 키**: `id` (UUID)
- **외래 키**:
  - `memberIdx` → Member.memberIdx
  - `educationReportId` → EducationReport.id
- **속성**: `method`, `educationName`, `educationTime`, `educationDate`, `fileName`, `fileUrl`

### 6. SafetySystem (안전 시스템 그룹)

- **기본 키**: `safetyIdx` (INTEGER)
- **속성**: `systemName`
- **관계**: SafetySystemItem (1:N)

### 7. SafetySystemItem (안전 시스템 아이템)

- **복합 기본 키**: `(safetyIdx, itemNumber)`
- **외래 키**: `safetyIdx` → SafetySystem.safetyIdx
- **속성**: `documentName`, `documentCount`, `cycle`, `cycleUnit`, `lastWrittenAt`, `status`
- **관계**: SafetySystemDocument (1:N)

### 8. SafetySystemDocument (안전 시스템 문서)

- **복합 기본 키**: `(safetyIdx, itemNumber, documentNumber)`
- **외래 키**:
  - `(safetyIdx, itemNumber)` → SafetySystemItem(safetyIdx, itemNumber)
- **속성**: `sequence`, `registeredAt`, `registeredTime`, `organizationName`, `documentName`, `writtenAt`, `approvalDeadline`, `completionRate`

### 9. ChatRoom (채팅방)

- **기본 키**: `id` (UUID)
- **속성**: `name`, `type`, `isGroup`, `organizationName`, `lastMessage`, `lastMessageTime`, `unreadCount`, `avatar`
- **관계**: ChatMessage (1:N), ChatParticipant (1:N)

### 10. ChatMessage (채팅 메시지)

- **기본 키**: `id` (UUID)
- **외래 키**:
  - `chatRoomId` → ChatRoom.id
  - `senderMemberIdx` → Member.memberIdx
- **속성**: `message`, `timestamp`, `isOwn`, `senderAvatar`

### 11. ChatParticipant (채팅 참가자)

- **기본 키**: `id` (UUID)
- **외래 키**:
  - `chatRoomId` → ChatRoom.id
  - `memberIdx` → Member.memberIdx
- **속성**: `role`

### 12. Checklist (체크리스트)

- **기본 키**: `id` (UUID)
- **속성**: `order`, `industry`, `highRiskWork`, `registrationDate`, `status`
- **관계**: DisasterFactor (1:N)

### 13. DisasterFactor (재해 유발 요인)

- **기본 키**: `id` (UUID)
- **외래 키**: `checklistId` → Checklist.id
- **속성**: `factorName`

### 14. CodeSetting (코드 설정)

- **기본 키**: `id` (UUID)
- **속성**: `order`, `code`, `name`, `categoryType`, `status`, `inspectionCycle`, `protectiveDevices`, `riskTypes`, `category`, `formAndType`, `location`, `exposureRisk`, `organizationName`, `registrationDate`

### 15. ServiceSetting (서비스 설정)

- **기본 키**: `id` (UUID)
- **속성**: `order`, `serviceName`, `servicePeriod`, `memberCount`, `monthlyFee`, `subscriptions`, `status`, `registrationDate`

### 16. ApiSetting (API 설정)

- **기본 키**: `id` (UUID)
- **속성**: `order`, `name`, `provider`, `keyStatus`, `lastInterlocked`, `expirationDate`, `status`, `registrationDate`

### 17. LibraryReport (라이브러리 리포트)

- **기본 키**: `id` (UUID)
- **외래 키**: `categoryId` → LibraryCategory.id (가정)
- **속성**: `order`, `title`, `registrationDate`, `organizationName`, `category`, `playbackTime`, `hasSubtitles`, `status`

### 18. RiskReport (위험 리포트)

- **기본 키**: `id` (UUID)
- **외래 키**:
  - `reporterMemberIdx` → Member.memberIdx
  - `authorMemberIdx` → Member.memberIdx
- **속성**: `title`, `location`, `content`, `imageUrl`, `registeredAt`, `status`

### 19. SafetyReport (안전 리포트)

- **기본 키**: `id` (UUID)
- **속성**: `order`, `documentType`, `documentName`, `documentDate`, `publishedAt`, `viewCount`

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

1. `Member.memberId` (UNIQUE INDEX)
2. `Member.companyIdx` (INDEX)
3. `EducationRecord.memberIdx` (INDEX)
4. `ChatMessage.chatRoomId` (INDEX)
5. `ChatMessage.timestamp` (INDEX)
6. `SafetySystemDocument(safetyIdx, itemNumber)` (COMPOSITE INDEX)

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

## 참고사항

- 모든 날짜/시간 필드는 ISO 8601 형식 사용
- UUID는 `id` 필드에 사용
- AUTO_INCREMENT는 `*Idx` 패턴의 필드에 사용
- Soft Delete는 `deletedAt` 필드로 관리 (null이면 삭제되지 않음)
- 외래 키 제약조건은 데이터 무결성을 보장하기 위해 설정
- 모든 테이블은 `createAt`, `updateAt`, `deletedAt` 필드를 포함
- 생성자/수정자 추적을 위해 `createdBy`, `updatedBy` 필드 포함 (nullable)
