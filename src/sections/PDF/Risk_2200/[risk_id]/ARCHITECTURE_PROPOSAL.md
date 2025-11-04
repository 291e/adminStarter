# PDF 테이블 데이터 구조 제안

## 현재 문제점

1. 각 테이블 컴포넌트가 고정된 `defaultRows`를 포함
2. 문서 타입별로 테이블 구조가 완전히 다름
3. `SafetySystemDocument`는 메타데이터만 가지고 있어 테이블 데이터와 연결되지 않음

## 제안 구조

### 1. 타입별 테이블 데이터 타입 정의

각 문서 타입에 맞는 테이블 데이터 구조를 명확히 정의:

```typescript
// src/_mock/_safety-system.ts 또는 src/sections/PDF/Risk_2200/[risk_id]/types/table-data.ts

// 1300번대: 위험 기계·기구·설비
export type Table1300Row = {
  number: number;
  name: string;
  id: string;
  capacity: string;
  location: string;
  quantity: number | string;
  inspectionTarget: string;
  safetyDevice: string;
  inspectionCycle: string;
  accidentForm: string;
  remark: string;
};

// 1400번대: 유해인자 (4개 서브테이블)
export type Table1400ChemicalRow = {
  /* 화학적 인자 */
};
export type Table1400PhysicalRow = {
  /* 물리적 인자 */
};
export type Table1400BiologicalRow = {
  /* 생물학적 인자 */
};
export type Table1400ErgonomicRow = {
  /* 인간공학적 인자 */
};

export type Table1400Data = {
  chemical: Table1400ChemicalRow[];
  physical: Table1400PhysicalRow[];
  biological: Table1400BiologicalRow[];
  ergonomic: Table1400ErgonomicRow[];
};

// 1500번대: 위험장소 및 작업형태별 위험요인
export type Table1500Row = {
  unit: string;
  work: string;
  hazardCode: string;
  // ... 기타 필드
};

// 2100번대: 위험요인별 위험성 평가 (2개 테이블)
export type Table2100ClassificationRow = {
  /* 분류 */
};
export type Table2100AssessmentRow = {
  /* 평가 */
};
export type Table2100Data = {
  classification: Table2100ClassificationRow[];
  assessment: Table2100AssessmentRow[];
};

// 2200번대: 위험요인별 위험성 평가표
export type Table2200Row = {
  risk: string;
  removal: string;
  engineering: string;
  administrative: string;
  ppe: string;
};

// 2300번대: 감소 대책 수립·이행
export type Table2300Row = {
  division: string;
  category: string;
  // ... 기타 필드
};

// 통합 타입 (Union)
export type DocumentTableData =
  | { type: '1300'; rows: Table1300Row[] }
  | { type: '1400'; data: Table1400Data }
  | { type: '1500'; rows: Table1500Row[] }
  | { type: '2100'; data: Table2100Data }
  | { type: '2200'; rows: Table2200Row[] }
  | { type: '2300'; rows: Table2300Row[] };
```

### 2. SafetySystemDocument 확장

#### 옵션 A vs 옵션 B 비교

| 항목              | 옵션 A: 문서에 직접 포함                                  | 옵션 B: 별도 저장소                                               |
| ----------------- | --------------------------------------------------------- | ----------------------------------------------------------------- |
| **데이터 구조**   | 문서 객체 하나에 메타데이터 + 테이블 데이터 함께          | 문서와 테이블 데이터를 별도 배열/객체로 분리                      |
| **메모리 사용**   | 문서 조회 시 테이블 데이터도 함께 로드 (메모리 사용 많음) | 필요한 문서만 테이블 데이터 조회 가능 (메모리 효율적)             |
| **조회 방식**     | `document.tableData`로 바로 접근                          | `getTableDataByDocument()` 함수로 별도 조회 필요                  |
| **코드 간결성**   | 간단하고 직관적                                           | 조회 함수 추가 필요 (약간 복잡)                                   |
| **확장성**        | 테이블 데이터가 큰 경우 문서 객체가 무거워짐              | 테이블 데이터만 따로 관리 가능 (확장성 우수)                      |
| **데이터 일관성** | 문서와 테이블이 항상 함께 존재                            | 문서는 있는데 테이블이 없을 수 있음 (null 체크 필요)              |
| **사용 시나리오** | 문서 목록에서 바로 테이블 데이터가 필요한 경우            | 테이블 데이터는 상세보기에서만 필요하고, 목록에서는 불필요한 경우 |

#### 옵션 A: 테이블 데이터를 문서에 직접 포함 (간단하고 직관적)

```typescript
// src/_mock/_safety-system.ts

export type SafetySystemDocument = {
  safetyIdx: number;
  itemNumber: number;
  documentNumber: number;
  sequence: number;
  registeredAt: string;
  registeredTime: string;
  organizationName: string;
  documentName: string;
  writtenAt: string;
  approvalDeadline: string;
  completionRate: { removal: number; engineering: number };

  // 테이블 데이터 추가 - 문서와 함께 저장
  tableData?: DocumentTableData; // 선택적 필드
};

// 사용 예시
const document: SafetySystemDocument = {
  // ... 메타데이터
  tableData: {
    type: '1300',
    rows: [{ number: 1, name: '프레스' /* ... */ }],
  },
};

// 조회: 바로 접근
const tableData = document.tableData;
```

**장점:**

- 코드가 간단하고 직관적
- 문서와 테이블 데이터가 항상 함께 관리됨
- `document.tableData`로 바로 접근 가능

**단점:**

- 문서 목록 조회 시 불필요한 테이블 데이터도 함께 로드 (메모리 낭비)
- 테이블 데이터가 큰 경우 문서 객체가 무거워짐

---

#### 옵션 B: 별도 테이블 데이터 저장소 (확장성과 성능 우수)

```typescript
// src/_mock/_safety-system.ts

// SafetySystemDocument는 기존대로 유지 (테이블 데이터 없음)
export type SafetySystemDocument = {
  safetyIdx: number;
  itemNumber: number;
  documentNumber: number;
  // ... 기존 필드들만 (tableData 없음)
};

// 테이블 데이터를 별도로 관리
export type DocumentTableDataRecord = {
  documentId: string; // `${safetyIdx}-${itemNumber}-${documentNumber}`
  tableData: DocumentTableData;
};

// Mock 데이터
export const mockDocumentTableData: DocumentTableDataRecord[] = [
  {
    documentId: '2-1-1',
    tableData: {
      type: '2100',
      data: {
        classification: [
          /* ... */
        ],
        assessment: [
          /* ... */
        ],
      },
    },
  },
  // ...
];

// 조회 함수
export function getTableDataByDocument(
  safetyIdx: number,
  itemNumber: number,
  documentNumber: number
): DocumentTableData | null {
  const documentId = `${safetyIdx}-${itemNumber}-${documentNumber}`;
  return mockDocumentTableData.find((d) => d.documentId === documentId)?.tableData || null;
}

// 사용 예시
const document: SafetySystemDocument = {
  // ... 메타데이터만 (tableData 없음)
};

// 조회: 별도 함수 호출
const tableData = getTableDataByDocument(2, 1, 1);
```

**장점:**

- 문서 목록 조회 시 메모리 효율적 (테이블 데이터는 상세보기에서만 로드)
- 테이블 데이터가 큰 경우에도 문서 객체는 가벼움
- 테이블 데이터만 따로 관리/수정 가능 (확장성 우수)
- 나중에 백엔드 API로 분리하기 쉬움

**단점:**

- 조회 함수를 항상 호출해야 함 (약간 복잡)
- 문서와 테이블 데이터의 일관성 관리 필요 (null 체크 필요)

---

### 추천: 옵션 B (별도 저장소)

**이유:**

1. 문서 목록에서는 테이블 데이터가 불필요하지만, 옵션 A는 항상 함께 로드됨
2. 테이블 데이터가 큰 경우 (특히 1400번대처럼 여러 테이블) 성능 이슈 가능
3. 나중에 백엔드 API로 전환 시 문서 API와 테이블 API를 분리하기 쉬움
4. 행 추가/수정 시 테이블 데이터만 업데이트하면 되어 관리가 용이

### 3. 테이블 컴포넌트 수정

각 테이블 컴포넌트가 문서 데이터를 받도록 수정:

```typescript
// src/sections/PDF/Risk_2200/[risk_id]/tables/1-3-1300.tsx

type Props = {
  data?: Table1300Row[]; // 기본값 대신 props로 받기
  document?: SafetySystemDocument; // 문서 정보도 함께 전달 가능
};

export default function RiskTable_1_3_1300({
  data,
  document
}: Props) {
  // data가 없으면 빈 배열 또는 기본값 사용
  const rows = data || [];

  return (
    // ... 테이블 렌더링
  );
}
```

### 4. view.tsx에서 문서 데이터 사용

```typescript
// src/sections/PDF/Risk_2200/[risk_id]/view.tsx

export function Risk_2200View({
  riskId,
  system,
  item
}: Props) {
  // riskId에서 문서 정보 추출 또는 별도 조회
  const document = useDocument(riskId); // 또는 props로 받기
  const tableData = document?.tableData;

  // 타입별로 테이블 컴포넌트에 데이터 전달
  if (is1300Series && tableData?.type === '1300') {
    const TableComp = tableRegistry['1-3-1300'];
    return <TableComp data={tableData.rows} document={document} />;
  }
  // ... 기타 타입들
}
```

## 장점

1. **확장성**: 새로운 문서 타입 추가 시 타입만 정의하면 됨
2. **타입 안정성**: TypeScript로 컴파일 타임에 오류 검출
3. **데이터 일관성**: 문서와 테이블 데이터가 함께 관리됨
4. **재사용성**: 테이블 컴포넌트가 순수하게 데이터만 받아서 렌더링
5. **테스트 용이성**: 각 테이블을 독립적으로 테스트 가능

## 구현 단계

1. **1단계**: 타입 정의 (위의 타입 정의)
2. **2단계**: `SafetySystemDocument` 확장 (옵션 A 또는 B 선택)
3. **3단계**: Mock 데이터 생성 함수 수정
4. **4단계**: 테이블 컴포넌트 props 수정
5. **5단계**: view.tsx에서 데이터 연결
