# Service Setting Service

서비스 관리 API 서비스

## API 목록

### 1. 서비스 목록 조회
- **함수**: `getServices`
- **메서드**: GET
- **엔드포인트**: `/api/services`

### 2. 서비스 상세 정보 조회
- **함수**: `getServiceDetail`
- **메서드**: GET
- **엔드포인트**: `/api/services/:id`

### 3. 서비스 등록
- **함수**: `createService`
- **메서드**: POST
- **엔드포인트**: `/api/services`

### 4. 서비스 수정
- **함수**: `updateService`
- **메서드**: PUT
- **엔드포인트**: `/api/services/:id`

### 5. 서비스 비활성화
- **함수**: `deactivateService`
- **메서드**: PATCH
- **엔드포인트**: `/api/services/:id/deactivate`

### 6. 서비스 삭제
- **함수**: `deleteService`
- **메서드**: DELETE
- **엔드포인트**: `/api/services/:id`

