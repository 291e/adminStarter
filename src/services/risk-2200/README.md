# Risk_2200 API 사용 가이드

## 구조

```
src/services/risk-2200/
├── risk-2200.types.ts      # 타입 정의
├── risk-2200.service.ts    # axios를 사용한 API 호출 함수
└── README.md               # 사용 가이드
```

## 사용 방법

### 1. 문서 목록 조회

```tsx
import { useQuery } from '@tanstack/react-query';
import { getRisk2200Documents } from 'src/services/risk-2200/risk-2200.service';

function Risk2200List() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['risk2200Documents', safetyIdx, itemNumber, filterType, searchField, searchValue, page, pageSize],
    queryFn: () => getRisk2200Documents({
      safetyIdx,
      itemNumber,
      filterType,
      searchField,
      searchValue,
      page,
      pageSize,
    }),
  });

  if (isLoading) return <div>로딩 중...</div>;
  if (error) return <div>에러: {error.message}</div>;

  return (
    <div>
      {data?.body?.documents.map((document) => (
        <div key={document.id}>{document.documentName}</div>
      ))}
    </div>
  );
}
```

### 2. 문서 등록

```tsx
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createRisk2200Document } from 'src/services/risk-2200/risk-2200.service';

function CreateDocument() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (params: CreateRisk2200DocumentParams) => createRisk2200Document(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['risk2200Documents'] });
      // 리스트 페이지로 이동
    },
  });

  const handleSave = () => {
    mutation.mutate({
      safetyIdx: 2,
      itemNumber: 2,
      documentDate: '2024-01-01',
      approvalDeadline: '2024-02-01',
      rows: table2200Rows,
    });
  };

  return <button onClick={handleSave}>등록</button>;
}
```

### 3. 문서 임시 저장

```tsx
import { useMutation } from '@tanstack/react-query';
import { temporarySaveRisk2200Document } from 'src/services/risk-2200/risk-2200.service';

function CreateDocument() {
  const mutation = useMutation({
    mutationFn: (params: TemporarySaveRisk2200DocumentParams) => temporarySaveRisk2200Document(params),
    onSuccess: () => {
      // 임시 저장 성공 처리
    },
  });

  const handleTemporarySave = () => {
    mutation.mutate({
      safetyIdx: 2,
      itemNumber: 2,
      documentDate: '2024-01-01',
      approvalDeadline: '2024-02-01',
      rows: table2200Rows,
    });
  };

  return <button onClick={handleTemporarySave}>임시 저장</button>;
}
```

### 4. 문서 상세 정보 조회

```tsx
import { useQuery } from '@tanstack/react-query';
import { getRisk2200DocumentDetail } from 'src/services/risk-2200/risk-2200.service';

function DocumentDetail({ documentId }: { documentId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ['risk2200DocumentDetail', documentId],
    queryFn: () => getRisk2200DocumentDetail({ documentId }),
    enabled: !!documentId,
  });

  if (isLoading) return <div>로딩 중...</div>;

  return <div>{data?.body?.documentNumber}</div>;
}
```

### 5. 결재 정보 조회 및 서명 추가

```tsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getRisk2200ApprovalInfo, addRisk2200Signature } from 'src/services/risk-2200/risk-2200.service';

function ApprovalSection({ documentId }: { documentId: string }) {
  const queryClient = useQueryClient();
  const { data: approvalInfo } = useQuery({
    queryKey: ['risk2200ApprovalInfo', documentId],
    queryFn: () => getRisk2200ApprovalInfo({ documentId }),
    enabled: !!documentId,
  });

  const mutation = useMutation({
    mutationFn: (params: AddRisk2200SignatureParams) => addRisk2200Signature(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['risk2200ApprovalInfo', documentId] });
    },
  });

  const handleAddSignature = () => {
    mutation.mutate({
      documentId,
      signatureType: 'writer',
      signatureData: {
        name: '홍길동',
        signature: 'signature-data',
      },
    });
  };

  return (
    <div>
      <div>작성자: {approvalInfo?.body?.writer?.name}</div>
      <button onClick={handleAddSignature}>서명 추가</button>
    </div>
  );
}
```

### 6. 화학물질 목록 조회 (Autocomplete용)

```tsx
import { useQuery } from '@tanstack/react-query';
import { getChemicals } from 'src/services/risk-2200/risk-2200.service';

function ChemicalAutocomplete() {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: chemicals } = useQuery({
    queryKey: ['chemicals', searchQuery],
    queryFn: () => getChemicals({ searchQuery }),
    enabled: searchQuery.length > 0,
  });

  return (
    <Autocomplete
      options={chemicals?.body?.chemicals || []}
      getOptionLabel={(option) => option.name}
      onInputChange={(_, value) => setSearchQuery(value)}
      renderInput={(params) => <TextField {...params} />}
    />
  );
}
```

## 핵심 포인트

1. **axios는 계속 사용**: `risk-2200.service.ts`에서 axios로 API 호출
2. **TanStack Query는 감싸는 역할**: 각 컴포넌트에서 `useQuery`/`useMutation`으로 감싸서 캐싱/재요청 관리
3. **타입 안정성**: TypeScript로 요청/응답 타입 정의
4. **재사용성**: 여러 컴포넌트에서 같은 서비스 함수 사용 가능
5. **자동 새로고침**: 필터/검색/페이지 변경 시 `queryClient.invalidateQueries` 사용

