# Operation Service

현장 운영 관리 API 서비스

## API 목록

### 1. 위험 보고 목록 조회

- **함수**: `getRiskReports`
- **메서드**: GET
- **엔드포인트**: `/api/risk-reports`
- **설명**: 위험 보고 목록을 조회합니다. 필터링, 검색, 페이지네이션을 지원합니다.

### 2. 위험 보고 등록

- **함수**: `createRiskReport`
- **메서드**: POST
- **엔드포인트**: `/api/risk-reports`
- **설명**: 새로운 위험 보고를 등록합니다.

### 3. 위험 보고 비활성화

- **함수**: `deactivateRiskReport`
- **메서드**: PATCH
- **엔드포인트**: `/api/risk-reports/:id/deactivate`
- **설명**: 위험 보고를 비활성화합니다.

### 4. 위험 보고 삭제

- **함수**: `deleteRiskReport`
- **메서드**: DELETE
- **엔드포인트**: `/api/risk-reports/:id`
- **설명**: 위험 보고를 삭제합니다.
