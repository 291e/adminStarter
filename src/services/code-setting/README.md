# Code Setting Service

코드 관리 API 서비스

## API 목록

### 1. 코드 목록 조회
- **함수**: `getCodes`
- **메서드**: GET
- **엔드포인트**: `/api/codes`

### 2. 코드 상세 정보 조회
- **함수**: `getCodeDetail`
- **메서드**: GET
- **엔드포인트**: `/api/codes/:id`

### 3. 기계·설비 등록
- **함수**: `createMachine`
- **메서드**: POST
- **엔드포인트**: `/api/codes/machines`

### 4. 기계·설비 수정
- **함수**: `updateMachine`
- **메서드**: PUT
- **엔드포인트**: `/api/codes/machines/:id`

### 5. 유해인자 등록
- **함수**: `createHazard`
- **메서드**: POST
- **엔드포인트**: `/api/codes/hazards`

### 6. 유해인자 수정
- **함수**: `updateHazard`
- **메서드**: PUT
- **엔드포인트**: `/api/codes/hazards/:id`

### 7. 카테고리 목록 조회
- **함수**: `getHazardCategories`
- **메서드**: GET
- **엔드포인트**: `/api/codes/hazards/categories`

### 8. 카테고리 목록 저장
- **함수**: `saveHazardCategories`
- **메서드**: POST
- **엔드포인트**: `/api/codes/hazards/categories`

### 9. 등록일/수정일 정보 가져오기
- **함수**: `getCodeDates`
- **메서드**: GET
- **엔드포인트**: `/api/codes/:id/dates`

### 10. 관리기준/관리대책 가져오기
- **함수**: `getHazardManagement`
- **메서드**: GET
- **엔드포인트**: `/api/codes/hazards/:id/management`

