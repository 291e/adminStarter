# Education Report Service

교육 이수 현황 API 서비스

## API 목록

### 1. 교육 이수 현황 목록 조회
- **함수**: `getEducationReports`
- **메서드**: GET
- **엔드포인트**: `/api/education-reports`
- **설명**: 교육 이수 현황 목록을 조회합니다.

### 2. 교육 상세 정보 조회
- **함수**: `getEducationDetail`
- **메서드**: GET
- **엔드포인트**: `/api/education-reports/:id`
- **설명**: 특정 교육의 상세 정보를 조회합니다.

### 3. 교육 추가
- **함수**: `createEducation`
- **메서드**: POST
- **엔드포인트**: `/api/education-reports`
- **설명**: 새로운 교육을 추가합니다.

### 4. 교육 상세 정보 저장
- **함수**: `updateEducationDetail`
- **메서드**: PUT
- **엔드포인트**: `/api/education-reports/:id`
- **설명**: 교육 상세 정보를 저장합니다.

