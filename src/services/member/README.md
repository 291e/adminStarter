# 회원 조회 API 사용 예시

## 구조

```
src/services/member/
├── member.types.ts      # 타입 정의
├── member.service.ts    # axios를 사용한 API 호출 함수
├── use-members.ts       # TanStack Query Hook
└── README.md           # 사용 가이드
```

## 사용 방법

### 1. 컴포넌트에서 직접 사용

```tsx
import { useMembers } from 'src/services/member/use-members';

function MemberList() {
  const { data, isLoading, error } = useMembers({
    page: 1,
    pageSize: 25,
    searchingKey: 'memberName',
    searchingVal: '홍길동',
    filterMemberStatuses: 'active',
    searchingStartDate: '2024-01-01',
    searchingEndDate: '2024-12-31',
  });

  if (isLoading) return <div>로딩 중...</div>;
  if (error) return <div>에러: {error.message}</div>;

  return (
    <div>
      {data?.body?.members.map((member) => (
        <div key={member.memberIndex}>{member.memberName}</div>
      ))}
    </div>
  );
}
```

### 2. 필터와 함께 사용

```tsx
import { useState } from 'react';
import { useMembers } from 'src/services/member/use-members';

function MemberListWithFilters() {
  const [filters, setFilters] = useState({
    page: 1,
    pageSize: 25,
    searchingKey: 'memberName' as const,
    searchingVal: '',
    filterMemberStatuses: 'active',
  });

  const { data, isLoading } = useMembers(filters);

  return (
    <div>
      <input
        value={filters.searchingVal}
        onChange={(e) =>
          setFilters((prev) => ({ ...prev, searchingVal: e.target.value, page: 1 }))
        }
      />
      {/* ... */}
    </div>
  );
}
```

### 3. 수동으로 새로고침

```tsx
import { useQueryClient } from '@tanstack/react-query';
import { useMembers } from 'src/services/member/use-members';

function MemberList() {
  const queryClient = useQueryClient();
  const { data } = useMembers({ page: 1, pageSize: 25 });

  const handleRefresh = () => {
    // 특정 쿼리만 새로고침
    queryClient.invalidateQueries({ queryKey: ['members'] });
  };

  return <button onClick={handleRefresh}>새로고침</button>;
}
```

## 핵심 포인트

1. **axios는 계속 사용**: `member.service.ts`에서 axios로 API 호출
2. **TanStack Query는 감싸는 역할**: `use-members.ts`에서 `useQuery`로 감싸서 캐싱/재요청 관리
3. **타입 안정성**: TypeScript로 요청/응답 타입 정의
4. **재사용성**: 여러 컴포넌트에서 같은 Hook 사용 가능

