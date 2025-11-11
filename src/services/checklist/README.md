# Checklist Service

업종별 체크리스트 API 서비스

## API 목록

### 1. 체크리스트 목록 조회
- **함수**: `getChecklists`
- **메서드**: GET
- **엔드포인트**: `/api/checklists`

### 2. 고위험작업/상황 업데이트
- **함수**: `updateHighRiskWork`
- **메서드**: PUT
- **엔드포인트**: `/api/checklists/:id/high-risk-work`

### 3. 재해유발요인 목록 조회
- **함수**: `getDisasterFactors`
- **메서드**: GET
- **엔드포인트**: `/api/checklists/:id/disaster-factors`

### 4. 재해유발요인 목록 저장
- **함수**: `saveDisasterFactors`
- **메서드**: POST
- **엔드포인트**: `/api/checklists/:id/disaster-factors`

### 5. 업종 목록 조회
- **함수**: `getIndustries`
- **메서드**: GET
- **엔드포인트**: `/api/industries`

### 6. 업종 목록 저장
- **함수**: `saveIndustries`
- **메서드**: POST
- **엔드포인트**: `/api/industries`

### 7. 위험작업/상황 등록
- **함수**: `createRiskWork`
- **메서드**: POST
- **엔드포인트**: `/api/checklists`

