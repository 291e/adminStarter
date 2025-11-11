# Library Report Service

라이브러리 리포트 API 서비스

## API 목록

### 1. 라이브러리 리포트 목록 조회
- **함수**: `getLibraryReports`
- **메서드**: GET
- **엔드포인트**: `/api/library-reports`

### 2. 카테고리 목록 조회
- **함수**: `getCategories`
- **메서드**: GET
- **엔드포인트**: `/api/library-reports/categories`

### 3. 카테고리 설정 저장
- **함수**: `saveCategories`
- **메서드**: POST
- **엔드포인트**: `/api/library-reports/categories`

### 4. VOD 업로드
- **함수**: `uploadVOD`
- **메서드**: POST
- **엔드포인트**: `/api/library-reports/vod`

### 5. 컨텐츠 수정
- **함수**: `updateContent`
- **메서드**: PUT
- **엔드포인트**: `/api/library-reports/:id`

### 6. 컨텐츠 삭제
- **함수**: `deleteContent`
- **메서드**: DELETE
- **엔드포인트**: `/api/library-reports/:id`

### 7. 비디오 파일 미리보기 URL 가져오기
- **함수**: `getVideoPreview`
- **메서드**: GET
- **엔드포인트**: `/api/library-reports/:id/video-preview`

### 8. 수정일 가져오기
- **함수**: `getModifiedDate`
- **메서드**: GET
- **엔드포인트**: `/api/library-reports/:id/modified-date`

