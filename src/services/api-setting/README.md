# API Setting Service

API 관리 API 서비스

## API 목록

### 1. API 목록 조회
- **함수**: `getApis`
- **메서드**: GET
- **엔드포인트**: `/api/apis`

### 2. API 상세 정보 조회
- **함수**: `getApiDetail`
- **메서드**: GET
- **엔드포인트**: `/api/apis/:id`

### 3. API 등록
- **함수**: `createApi`
- **메서드**: POST
- **엔드포인트**: `/api/apis`

### 4. API 수정
- **함수**: `updateApi`
- **메서드**: PUT
- **엔드포인트**: `/api/apis/:id`

### 5. 새 Key 생성
- **함수**: `generateApiKey`
- **메서드**: POST
- **엔드포인트**: `/api/apis/:id/generate-key`

### 6. API URL 가져오기
- **함수**: `getApiUrl`
- **메서드**: GET
- **엔드포인트**: `/api/apis/:id/url`

### 7. 수정일 가져오기
- **함수**: `getApiModifiedDate`
- **메서드**: GET
- **엔드포인트**: `/api/apis/:id/modified-date`

