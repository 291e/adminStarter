# 알림 시스템 연동 계획

## 1. 아키텍처 설계

### 백엔드 역할
✅ **백엔드에서 알림 테이블을 만들고 권한별 필터링을 처리하는 것이 가장 효율적입니다.**

**이유:**
- 알림 발송 조건이 복잡하고 다양함 (문서 작성자, 대상자, superAdmin 등)
- 실시간 알림 발송은 백엔드에서 처리해야 함 (스케줄러, 이벤트 리스너 등)
- 권한별 필터링을 백엔드에서 처리하면 프론트엔드는 단순 조회만 하면 됨
- 보안상 권한 체크는 백엔드에서 하는 것이 안전함

### 프론트엔드 역할
- 알림 목록 조회 API 호출
- 읽음 처리 API 호출
- 실시간 업데이트 (폴링 또는 WebSocket)
- UI 표시 및 인터랙션

---

## 2. 알림 발송 조건 정리

### 2.1 대상자 + superAdmin에게 발송
| 조건 | 설명 | 발송 시점 |
|------|------|----------|
| 문서 작성 기한 도래 | 문서 작성 마감일이 되었을 때 | 마감일 당일 |
| 문서 서명/결재 요청 | 문서에 서명/결재 요청이 생겼을 때 | 요청 발생 즉시 |
| 결재 마감일 15일 전 | 문서 결재 마감일이 15일 남았을 때 | 마감일 15일 전 |
| 결재 마감일 7일 전 | 문서 결재 마감일이 7일 남았을 때 | 마감일 7일 전 |
| 결재 마감일 3일 전 | 문서 결재 마감일이 3일 남았을 때 | 마감일 3일 전 |
| 결재 마감일 1일 전 | 문서 결재 마감일이 1일 남았을 때 | 마감일 1일 전 |

### 2.2 모두에게 발송
| 조건 | 설명 | 발송 시점 |
|------|------|----------|
| 공유 문서 등록 | 공유 문서함에 문서가 등록되었을 때 | 등록 즉시 |

### 2.3 문서 작성자만 발송
| 조건 | 설명 | 발송 시점 |
|------|------|----------|
| 문서 결재 완료 | 문서 결재가 완료되었을 때 | 완료 즉시 |
| 문서 서명 완료 | 문서 서명이 완료되었을 때 | 완료 즉시 |
| 문서 상태값 변경 | 문서 상태가 변경되었을 때 | 변경 즉시 |
| 결재 미완료 (3일 전) | 결재 마감일 3일 전까지 완료 안됨 | 마감일 3일 전 |
| 결재 미완료 (1일 전) | 결재 마감일 1일 전까지 완료 안됨 | 마감일 1일 전 |

### 2.4 superAdmin만 발송
| 조건 | 설명 | 발송 시점 |
|------|------|----------|
| 무재해 사업장 인증 파일 업로드 | 인증 파일이 업로드되었을 때 | 업로드 즉시 |
| 구독 서비스 변경 | 구독 서비스가 변경되었을 때 | 변경 즉시 |

---

## 3. 백엔드 API 스펙 (예상)

### 3.1 알림 목록 조회
```
GET /notification/history
Query Parameters:
  - page?: number (기본값: 1)
  - pageSize?: number (기본값: 20)
  - type?: 'all' | 'unread' | 'archived' (기본값: 'all')
  - startDate?: string (ISO 8601)
  - endDate?: string (ISO 8601)

Response:
{
  header: {
    isSuccess: boolean;
    resultCode: string;
    resultMessage: string;
    timestamp: string;
  },
  data: {
    notifications: Notification[];
    total: number;
    page: number;
    pageSize: number;
    totalUnread: number; // 읽지 않은 알림 개수
  }
}
```

### 3.2 알림 읽음 처리
```
PUT /notification/history/{notificationId}/read

Response:
{
  header: {
    isSuccess: boolean;
    resultCode: string;
    resultMessage: string;
    timestamp: string;
  },
  data: {
    success: boolean;
  }
}
```

### 3.3 전체 읽음 처리
```
PUT /notification/history/read-all

Response:
{
  header: {
    isSuccess: boolean;
    resultCode: string;
    resultMessage: string;
    timestamp: string;
  },
  data: {
    success: boolean;
    readCount: number; // 읽음 처리된 알림 개수
  }
}
```

### 3.4 Notification 타입 정의
```typescript
type Notification = {
  notificationId: string;
  type: NotificationType; // 알림 타입 (아이콘 결정용)
  title: string; // 알림 제목
  message: string; // 알림 내용
  category: string; // 카테고리 (예: "문서", "결재", "서비스" 등)
  isRead: boolean; // 읽음 여부
  createdAt: string; // 생성일시 (ISO 8601)
  readAt?: string; // 읽은 일시 (ISO 8601)
  data?: {
    documentId?: string; // 문서 ID (문서 관련 알림인 경우)
    documentType?: string; // 문서 타입
    actionUrl?: string; // 클릭 시 이동할 URL
    [key: string]: unknown; // 기타 메타데이터
  };
};

type NotificationType = 
  | 'document_deadline' // 문서 작성 기한 도래
  | 'document_approval_request' // 결재 요청
  | 'document_signature_request' // 서명 요청
  | 'document_approval_deadline_15' // 결재 마감일 15일 전
  | 'document_approval_deadline_7' // 결재 마감일 7일 전
  | 'document_approval_deadline_3' // 결재 마감일 3일 전
  | 'document_approval_deadline_1' // 결재 마감일 1일 전
  | 'shared_document_registered' // 공유 문서 등록
  | 'document_approval_completed' // 문서 결재 완료
  | 'document_signature_completed' // 문서 서명 완료
  | 'document_status_changed' // 문서 상태 변경
  | 'document_approval_pending_3' // 결재 미완료 (3일 전)
  | 'document_approval_pending_1' // 결재 미완료 (1일 전)
  | 'accident_free_cert_uploaded' // 무재해 사업장 인증 파일 업로드
  | 'subscription_changed'; // 구독 서비스 변경
```

---

## 4. 프론트엔드 구현 계획

### 4.1 React Query Hook 생성
**파일:** `src/sections/Notification/hooks/use-notification-api.ts`

```typescript
// 알림 목록 조회
export function useNotificationHistory(params?: GetNotificationHistoryParams)

// 알림 읽음 처리
export function useMarkNotificationAsRead()

// 전체 읽음 처리
export function useMarkAllNotificationsAsRead()
```

### 4.2 NotificationsDrawer 수정
**파일:** `src/layouts/components/notifications-drawer/index.tsx`

**변경 사항:**
1. `data` prop 제거 (API에서 직접 조회)
2. `useNotificationHistory` hook 사용
3. 탭별 필터링 (all/unread/archived)
4. 읽음 처리 기능 연동
5. 실시간 업데이트 (폴링 또는 WebSocket)

### 4.3 NotificationItem 수정
**파일:** `src/layouts/components/notifications-drawer/notification-item.tsx`

**변경 사항:**
1. `NotificationType`에 따른 아이콘 매핑
2. 클릭 시 `data.actionUrl`로 이동
3. 문서 관련 알림인 경우 문서 상세 페이지로 이동

### 4.4 실시간 업데이트 전략

**옵션 1: 폴링 (Polling)**
- 30초마다 알림 목록 조회
- 간단하지만 서버 부하 증가

**옵션 2: WebSocket**
- 실시간 업데이트
- 복잡하지만 효율적

**옵션 3: React Query의 `refetchInterval`**
- 폴링과 유사하지만 React Query로 관리
- 권장 방법

---

## 5. 백엔드 구현 체크리스트

### 5.1 알림 테이블 설계
- [ ] 알림 ID (PK)
- [ ] 수신자 ID (FK → Member)
- [ ] 알림 타입 (NotificationType)
- [ ] 제목, 내용
- [ ] 읽음 여부
- [ ] 생성일시, 읽은 일시
- [ ] 메타데이터 (JSON)
- [ ] 인덱스 (수신자 ID, 읽음 여부, 생성일시)

### 5.2 알림 발송 로직
- [ ] 문서 작성 기한 도래 감지 (스케줄러)
- [ ] 문서 서명/결재 요청 시 알림 발송
- [ ] 결재 마감일 알림 (15, 7, 3, 1일 전 스케줄러)
- [ ] 공유 문서 등록 시 알림 발송
- [ ] 문서 결재/서명 완료 시 알림 발송
- [ ] 문서 상태 변경 시 알림 발송
- [ ] 결재 미완료 알림 (3, 1일 전 스케줄러)
- [ ] 무재해 사업장 인증 파일 업로드 시 알림 발송
- [ ] 구독 서비스 변경 시 알림 발송

### 5.3 권한별 필터링
- [ ] 현재 사용자에게 해당하는 알림만 조회
- [ ] superAdmin은 모든 알림 조회 가능
- [ ] 문서 작성자는 자신의 문서 관련 알림 조회
- [ ] 대상자는 자신이 대상자인 알림 조회

### 5.4 API 엔드포인트
- [ ] `GET /notification/history` - 알림 목록 조회
- [ ] `PUT /notification/history/{notificationId}/read` - 읽음 처리
- [ ] `PUT /notification/history/read-all` - 전체 읽음 처리

---

## 6. 구현 순서

### Phase 1: 백엔드 API 준비
1. 알림 테이블 생성
2. 알림 발송 로직 구현
3. 알림 조회 API 구현
4. 읽음 처리 API 구현

### Phase 2: 프론트엔드 기본 연동
1. React Query Hook 생성
2. NotificationsDrawer에 API 연동
3. 읽음 처리 기능 구현
4. 탭별 필터링 구현

### Phase 3: 실시간 업데이트
1. 폴링 또는 WebSocket 구현
2. 알림 배지 업데이트
3. 새 알림 표시

### Phase 4: 상세 기능
1. 알림 클릭 시 해당 페이지로 이동
2. 알림 삭제 기능 (선택사항)
3. 알림 설정 기능 (선택사항)

---

## 7. 주의사항

1. **성능 최적화**
   - 알림 목록은 페이지네이션 필수
   - 읽지 않은 알림 개수는 별도로 조회 (캐싱)
   - 실시간 업데이트는 적절한 간격으로

2. **보안**
   - 권한 체크는 반드시 백엔드에서
   - 사용자는 자신의 알림만 조회 가능
   - superAdmin도 회사 단위로 필터링 (필요시)

3. **사용자 경험**
   - 알림 클릭 시 즉시 읽음 처리
   - 알림 내용은 명확하고 간결하게
   - 액션 가능한 알림은 명확한 버튼 제공

---

## 8. 결론

✅ **백엔드에서 알림 테이블을 만들고 권한별 필터링을 처리하면, 프론트엔드는 알림 목록 조회 API만 사용하면 됩니다.**

이 방식의 장점:
- 프론트엔드 로직 단순화
- 보안 강화 (권한 체크는 백엔드에서)
- 확장성 (새로운 알림 타입 추가 용이)
- 유지보수성 향상





