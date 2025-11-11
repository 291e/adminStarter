# Organization Service

조직 관리 API 서비스

## API 목록

### 1. 조직 목록 조회
- **함수**: `getOrganizations`
- **메서드**: GET
- **엔드포인트**: `/api/organizations`
- **설명**: 조직 목록을 조회합니다. 필터링, 검색, 페이지네이션을 지원합니다.

### 2. 조직 등록
- **함수**: `createOrganization`
- **메서드**: POST
- **엔드포인트**: `/api/organizations`
- **설명**: 새로운 조직을 등록합니다.

### 3. 조직 수정
- **함수**: `updateOrganization`
- **메서드**: PUT
- **엔드포인트**: `/api/organizations/:id`
- **설명**: 조직 정보를 수정합니다.

### 4. 조직 비활성화
- **함수**: `deactivateOrganization`
- **메서드**: PATCH
- **엔드포인트**: `/api/organizations/:id/deactivate`
- **설명**: 조직을 비활성화합니다.

### 5. 조직 삭제
- **함수**: `deleteOrganization`
- **메서드**: DELETE
- **엔드포인트**: `/api/organizations/:id`
- **설명**: 조직을 삭제합니다.

### 6. 조직 상세 정보 및 멤버 목록 조회
- **함수**: `getOrganizationDetail`
- **메서드**: GET
- **엔드포인트**: `/api/organizations/:id`
- **설명**: 특정 조직의 상세 정보와 멤버 목록을 조회합니다.

### 7. 서비스 업그레이드
- **함수**: `upgradeService`
- **메서드**: POST
- **엔드포인트**: `/api/organizations/:id/services/upgrade`
- **설명**: 조직의 구독 서비스를 업그레이드합니다.

### 8. 서비스 취소
- **함수**: `cancelService`
- **메서드**: POST
- **엔드포인트**: `/api/organizations/:id/services/cancel`
- **설명**: 조직의 구독 서비스를 취소합니다.

### 9. 카드 액션 처리
- **함수**: `cardAction`
- **메서드**: POST
- **엔드포인트**: `/api/organizations/:id/cards/:cardId/action`
- **설명**: 결제 카드의 대표 카드 설정, 수정, 삭제를 처리합니다.

## 사용 예시

```typescript
import { useOrganizations } from 'src/sections/Organization/hooks/use-organization';

const { data, isLoading, error } = useOrganizations({
  page: 1,
  pageSize: 25,
  status: 'active',
});
```

