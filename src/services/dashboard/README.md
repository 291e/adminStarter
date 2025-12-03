# Dashboard Service

대시보드 API 서비스

## API 목록

### 1. 서명 대기 문서 목록 조회
- **함수**: `getDocumentSignatureList`
- **메서드**: GET
- **엔드포인트**: `/dashboard/document-signatures`

### 2. 공유된 문서 목록 조회
- **함수**: `getSharedDocumentList`
- **메서드**: GET
- **엔드포인트**: `/dashboard/shared-documents`

### 3. 공유 문서 상세 조회
- **함수**: `getSharedDocumentDetail`
- **메서드**: GET
- **엔드포인트**: `/dashboard/shared-documents/{sharedDocumentIdx}`

### 4. 공유 문서 생성
- **함수**: `createSharedDocument`
- **메서드**: POST
- **엔드포인트**: `/dashboard/shared-documents`

### 5. 공유 문서 수정
- **함수**: `updateSharedDocument`
- **메서드**: PUT
- **엔드포인트**: `/dashboard/shared-documents/{sharedDocumentIdx}`

### 6. 공유 문서 삭제
- **함수**: `deleteSharedDocument`
- **메서드**: DELETE
- **엔드포인트**: `/dashboard/shared-documents/{sharedDocumentIdx}`

### 7. 공유 문서 채팅방 공유
- **함수**: `shareDocumentToChatRoom`
- **메서드**: POST
- **엔드포인트**: `/dashboard/shared-documents/{sharedDocumentIdx}/share`

### 8. 사고·위험 보고 현황 통계 조회
- **함수**: `getRiskReportStatistics`
- **메서드**: GET
- **엔드포인트**: `/dashboard/risk-report-statistics`

### 9. 사용자 프로필 정보 조회
- **함수**: `getMemberProfile`
- **메서드**: GET
- **엔드포인트**: `/dashboard/member-profile`

### 10. 교육 이수율 조회
- **함수**: `getEducationCompletionRate`
- **메서드**: GET
- **엔드포인트**: `/dashboard/education-completion-rate`

### 11. 중요도 설정 목록 조회
- **함수**: `getPrioritySettingList`
- **메서드**: GET
- **엔드포인트**: `/dashboard/priority-settings`

### 12. 중요도 설정 등록
- **함수**: `createPrioritySetting`
- **메서드**: POST
- **엔드포인트**: `/dashboard/priority-settings`

### 13. 중요도 설정 수정
- **함수**: `updatePrioritySetting`
- **메서드**: PUT
- **엔드포인트**: `/dashboard/priority-settings/{priorityIdx}`

### 14. 중요도 설정 삭제
- **함수**: `deletePrioritySetting`
- **메서드**: DELETE
- **엔드포인트**: `/dashboard/priority-settings/{priorityIdx}`

