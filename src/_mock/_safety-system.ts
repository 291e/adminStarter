import { fSub } from 'src/utils/format-time';

import type {
  DocumentTableData,
  Table1300Row,
  Table1400Data,
  Table1500Row,
  Table2100Data,
  Table2200Row,
  Table2300Row,
} from 'src/sections/PDF/Risk_2200/types/table-data';

// ----------------------------------------------------------------------

// 정규화 타입
export type SafetySystemGroup = {
  safetyIdx: number; // 그룹 키
  systemName: string; // 그룹명
};

export type SafetySystemItem = {
  safetyIdx: number; // 소속 그룹 키
  itemNumber: number; // 그룹 내 순번
  documentName: string;
  documentCount: number;
  cycle: number;
  cycleUnit: 'year' | 'immediate' | 'half' | 'day';
  lastWrittenAt: string;
  status: 'normal' | 'always' | 'approaching' | 'overdue';
};

// 기존 UI 호환을 위한 비정규화 타입
export type SafetySystem = {
  id: string; // `safety-${safetyIdx}`
  safetyIdx: number;
  systemName: string;
  items: SafetySystemItem[];
};

// 라벨
const cycleUnitLabels: Record<SafetySystemItem['cycleUnit'], string> = {
  year: '년',
  immediate: '즉시',
  half: '반기',
  day: '일',
};

const statusLabels: Record<SafetySystemItem['status'], string> = {
  normal: '정상',
  always: '상시 작성',
  approaching: '마감 임박',
  overdue: '기한 초과',
};

// ----------------------------------------------------------------------
// 1) 그룹(정규화)
export const mockSafetySystemGroups: SafetySystemGroup[] = [
  { safetyIdx: 1, systemName: '위험요인파악' },
  { safetyIdx: 2, systemName: '위험요인 제거·대체 및 통제' },
  { safetyIdx: 3, systemName: '경영자 리더십' },
  { safetyIdx: 4, systemName: '근로자 참여' },
  { safetyIdx: 5, systemName: '비상조치계획 수립' },
  { safetyIdx: 6, systemName: '도급·용역·위탁 시 안전보건 확보' },
  { safetyIdx: 7, systemName: '평가 및 개선' },
];

// 2) 아이템(정규화)
export const mockSafetySystemItems: SafetySystemItem[] = [
  // 1. 위험요인파악
  {
    safetyIdx: 1,
    itemNumber: 1,
    documentName: '위험요인 파악',
    documentCount: 5,
    cycle: 5,
    cycleUnit: 'year',
    lastWrittenAt: fSub({ days: 10 }),
    status: 'normal',
  },
  {
    safetyIdx: 1,
    itemNumber: 2,
    documentName: '산업재해 및 아차사고',
    documentCount: 5,
    cycle: 0,
    cycleUnit: 'immediate',
    lastWrittenAt: fSub({ days: 5 }),
    status: 'always',
  },
  {
    safetyIdx: 1,
    itemNumber: 3,
    documentName: '위험 기계·기구·설비',
    documentCount: 5,
    cycle: 1,
    cycleUnit: 'half',
    lastWrittenAt: fSub({ days: 20 }),
    status: 'approaching',
  },
  {
    safetyIdx: 1,
    itemNumber: 4,
    documentName: '유해인자',
    documentCount: 5,
    cycle: 1,
    cycleUnit: 'half',
    lastWrittenAt: fSub({ days: 25 }),
    status: 'approaching',
  },
  {
    safetyIdx: 1,
    itemNumber: 5,
    documentName: '위험장소 및 작업형태별 위험요인',
    documentCount: 5,
    cycle: 1,
    cycleUnit: 'half',
    lastWrittenAt: fSub({ days: 30 }),
    status: 'overdue',
  },

  // 2. 위험요인 제거·대체 및 통제
  {
    safetyIdx: 2,
    itemNumber: 1,
    documentName: '위험요인별 위험성 평가',
    documentCount: 5,
    cycle: 5,
    cycleUnit: 'year',
    lastWrittenAt: fSub({ days: 15 }),
    status: 'normal',
  },
  {
    safetyIdx: 2,
    itemNumber: 2,
    documentName: '위험요인 제거·대체 및 통제 계획',
    documentCount: 5,
    cycle: 1,
    cycleUnit: 'half',
    lastWrittenAt: fSub({ days: 10 }),
    status: 'approaching',
  },
  {
    safetyIdx: 2,
    itemNumber: 3,
    documentName: '종합대책 수립·이행',
    documentCount: 5,
    cycle: 1,
    cycleUnit: 'half',
    lastWrittenAt: fSub({ days: 35 }),
    status: 'overdue',
  },
  {
    safetyIdx: 2,
    itemNumber: 4,
    documentName: '교육훈련',
    documentCount: 5,
    cycle: 1,
    cycleUnit: 'day',
    lastWrittenAt: fSub({ days: 1 }),
    status: 'approaching',
  },

  // 3. 경영자 리더십
  {
    safetyIdx: 3,
    itemNumber: 1,
    documentName: '안전보건경영방침',
    documentCount: 5,
    cycle: 5,
    cycleUnit: 'year',
    lastWrittenAt: fSub({ days: 20 }),
    status: 'normal',
  },
  {
    safetyIdx: 3,
    itemNumber: 2,
    documentName: '안전보건목표 및 세부추진계획',
    documentCount: 5,
    cycle: 1,
    cycleUnit: 'half',
    lastWrittenAt: fSub({ days: 12 }),
    status: 'approaching',
  },
  {
    safetyIdx: 3,
    itemNumber: 3,
    documentName: '안전보건 자원 배정',
    documentCount: 5,
    cycle: 1,
    cycleUnit: 'half',
    lastWrittenAt: fSub({ days: 8 }),
    status: 'normal',
  },
  {
    safetyIdx: 3,
    itemNumber: 4,
    documentName: '구성원의 역할과 책임',
    documentCount: 5,
    cycle: 1,
    cycleUnit: 'half',
    lastWrittenAt: fSub({ days: 8 }),
    status: 'normal',
  },

  // 4. 근로자 참여
  {
    safetyIdx: 4,
    itemNumber: 1,
    documentName: '안전보건 정보공개',
    documentCount: 5,
    cycle: 5,
    cycleUnit: 'year',
    lastWrittenAt: fSub({ days: 25 }),
    status: 'normal',
  },
  {
    safetyIdx: 4,
    itemNumber: 2,
    documentName: '근로자 참여 절차',
    documentCount: 5,
    cycle: 1,
    cycleUnit: 'half',
    lastWrittenAt: fSub({ days: 18 }),
    status: 'approaching',
  },
  {
    safetyIdx: 4,
    itemNumber: 3,
    documentName: '참여 문화 조성',
    documentCount: 5,
    cycle: 1,
    cycleUnit: 'half',
    lastWrittenAt: fSub({ days: 40 }),
    status: 'overdue',
  },

  // 5. 비상조치계획 수립
  {
    safetyIdx: 5,
    itemNumber: 1,
    documentName: '중대산업재해 조치매뉴얼',
    documentCount: 5,
    cycle: 5,
    cycleUnit: 'year',
    lastWrittenAt: fSub({ days: 30 }),
    status: 'normal',
  },
  {
    safetyIdx: 5,
    itemNumber: 2,
    documentName: '비상조치계획 및 대피훈련',
    documentCount: 5,
    cycle: 1,
    cycleUnit: 'half',
    lastWrittenAt: fSub({ days: 22 }),
    status: 'approaching',
  },

  // 6. 도급·용역·위탁 시 안전보건 확보
  {
    safetyIdx: 6,
    itemNumber: 1,
    documentName: '사업자 선정',
    documentCount: 5,
    cycle: 5,
    cycleUnit: 'year',
    lastWrittenAt: fSub({ days: 28 }),
    status: 'normal',
  },
  {
    safetyIdx: 6,
    itemNumber: 2,
    documentName: '안전보건 확보',
    documentCount: 5,
    cycle: 1,
    cycleUnit: 'half',
    lastWrittenAt: fSub({ days: 15 }),
    status: 'approaching',
  },

  // 7. 평가 및 개선
  {
    safetyIdx: 7,
    itemNumber: 1,
    documentName: '성과 평가',
    documentCount: 5,
    cycle: 5,
    cycleUnit: 'year',
    lastWrittenAt: fSub({ days: 28 }),
    status: 'normal',
  },
  {
    safetyIdx: 7,
    itemNumber: 2,
    documentName: '체계 점검 및 개선',
    documentCount: 5,
    cycle: 1,
    cycleUnit: 'half',
    lastWrittenAt: fSub({ days: 15 }),
    status: 'approaching',
  },
];

// ----------------------------------------------------------------------
// 헬퍼
export function getItemsByGroup(safetyIdx: number): SafetySystemItem[] {
  return mockSafetySystemItems.filter((it) => it.safetyIdx === safetyIdx);
}

export function getItem(safetyIdx: number, itemNumber: number): SafetySystemItem | undefined {
  return mockSafetySystemItems.find(
    (it) => it.safetyIdx === safetyIdx && it.itemNumber === itemNumber
  );
}

// id 없이 composite key 사용

// 3) 문서(정규화)
export type SafetySystemDocument = {
  safetyIdx: number;
  itemNumber: number;
  documentNumber: number; // 아이템 내 문서 순번
  sequence: number;
  registeredAt: string;
  registeredTime: string;
  organizationName: string;
  documentName: string;
  writtenAt: string;
  approvalDeadline: string;
  completionRate: { removal: number; engineering: number };
};

function generateDocumentsFromItems(items: SafetySystemItem[]): SafetySystemDocument[] {
  const organizations = ['이편한자동화기술', '삼성전자', 'LG전자', '현대자동차', 'SK하이닉스'];
  const titles = ['문서 초안', '현장 점검표', '개선 조치서', '교육 이수증', '검토 의뢰서'];
  const docs: SafetySystemDocument[] = [];
  for (const it of items) {
    for (let n = 1; n <= it.documentCount; n++) {
      const seqBase = 1000 * it.safetyIdx + 100 * it.itemNumber;
      const date = new Date(2025, 9, 1);
      date.setDate(date.getDate() - n);
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      docs.push({
        safetyIdx: it.safetyIdx,
        itemNumber: it.itemNumber,
        documentNumber: n,
        sequence: seqBase + n,
        registeredAt: `${y}-${m}-${d}`,
        registeredTime: `${String(Math.floor(Math.random() * 24)).padStart(2, '0')}:${String(
          Math.floor(Math.random() * 60)
        ).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
        organizationName: organizations[(n - 1) % organizations.length],
        documentName: `${it.safetyIdx}-${it.itemNumber} 문서 ${n}: ${
          titles[(n - 1) % titles.length]
        }`,
        writtenAt: `${y}-${m}-${d}`,
        approvalDeadline: `${y}-${m}-${String(Number(d) + 30).padStart(2, '0')}`,
        completionRate: {
          removal: Math.floor(Math.random() * 50) + 10,
          engineering: Math.floor(Math.random() * 50) + 10,
        },
      });
    }
  }
  return docs;
}

export const mockSafetySystemDocuments: SafetySystemDocument[] =
  generateDocumentsFromItems(mockSafetySystemItems);

export function getDocumentsByItem(safetyIdx: number, itemNumber: number): SafetySystemDocument[] {
  return mockSafetySystemDocuments.filter(
    (d) => d.safetyIdx === safetyIdx && d.itemNumber === itemNumber
  );
}

// ----------------------------------------------------------------------
// 기존 UI 호환 어댑터
export function mockSafetySystems(count?: number): SafetySystem[] {
  const systems: SafetySystem[] = mockSafetySystemGroups.map((group) => ({
    id: `safety-${group.safetyIdx}`,
    safetyIdx: group.safetyIdx,
    systemName: group.systemName,
    items: getItemsByGroup(group.safetyIdx),
  }));

  if (count === undefined) return systems;

  // count 지정 시, 기존 로직과 동등하게 반복 생성
  return Array.from({ length: count }, (_, index) => {
    const base = systems[index % systems.length];
    const repeat = Math.floor(index / systems.length);
    return {
      ...base,
      id: `${base.id}-${repeat}`,
      items: base.items.map((it) => ({ ...it })),
    };
  });
}

export { cycleUnitLabels, statusLabels };

// ----------------------------------------------------------------------
// 4) 문서 테이블 데이터 (옵션 B: 별도 저장소)

export type DocumentTableDataRecord = {
  documentId: string; // `${safetyIdx}-${itemNumber}-${documentNumber}`
  tableData: DocumentTableData;
};

// 각 문서 타입별로 5개씩 다른 테이블 데이터 생성
function generateDocumentTableData(): DocumentTableDataRecord[] {
  const records: DocumentTableDataRecord[] = [];

  // 1300번대: 위험 기계·기구·설비 (safetyIdx=1, itemNumber=3)
  // 문서 1
  records.push({
    documentId: '1-3-1',
    tableData: {
      type: '1300',
      rows: [
        {
          number: 1,
          name: '프레스',
          id: 'P-1-001',
          capacity: '10 ton',
          location: '1공장 프레스라인',
          quantity: 5,
          inspectionTarget: '산업안전보건기준에 관한 규칙 제108조',
          safetyDevice: '광전자식 안전장치',
          inspectionCycle: '3개월',
          accidentForm: '부딪힘, 끼임',
          remark: '자격자(2명)',
        },
        {
          number: 2,
          name: '절단기',
          id: 'C-1-002',
          capacity: '5 ton',
          location: '1공장 절단라인',
          quantity: 3,
          inspectionTarget: '산업안전보건기준에 관한 규칙 제108조',
          safetyDevice: '방호덮개, 인터록',
          inspectionCycle: '6개월',
          accidentForm: '절단, 끼임',
          remark: '안전교육 이수자',
        },
      ],
    },
  });

  // 문서 2
  records.push({
    documentId: '1-3-2',
    tableData: {
      type: '1300',
      rows: [
        {
          number: 1,
          name: '용접기',
          id: 'W-2-001',
          capacity: '200A',
          location: '2공장 용접실',
          quantity: 8,
          inspectionTarget: '고압가스안전관리법',
          safetyDevice: '과부하방지장치, 접지장치',
          inspectionCycle: '1개월',
          accidentForm: '화상, 감전',
          remark: '전기기능사 필수',
        },
        {
          number: 2,
          name: '크레인',
          id: 'C-2-002',
          capacity: '5 ton',
          location: '2공장 적재장',
          quantity: 2,
          inspectionTarget: '크레인 등 안전관리에 관한 규칙',
          safetyDevice: '과부하방지장치, 권과방지장치',
          inspectionCycle: '1년',
          accidentForm: '추락, 부딪힘',
          remark: '크레인 운전기능사',
        },
      ],
    },
  });

  // 문서 3
  records.push({
    documentId: '1-3-3',
    tableData: {
      type: '1300',
      rows: [
        {
          number: 1,
          name: '승강기',
          id: 'E-3-001',
          capacity: '1 ton',
          location: '본관 1층',
          quantity: 1,
          inspectionTarget: '승강기 안전관리법',
          safetyDevice: '비상정지장치, 과속방지장치',
          inspectionCycle: '1년',
          accidentForm: '추락, 끼임',
          remark: '정기검사 완료',
        },
      ],
    },
  });

  // 문서 4
  records.push({
    documentId: '1-3-4',
    tableData: {
      type: '1300',
      rows: [
        {
          number: 1,
          name: '컨베이어',
          id: 'CV-4-001',
          capacity: '500kg',
          location: '물류센터',
          quantity: 10,
          inspectionTarget: '산업안전보건기준에 관한 규칙',
          safetyDevice: '긴급정지장치, 방호덮개',
          inspectionCycle: '6개월',
          accidentForm: '끼임, 넘어짐',
          remark: '정기 점검 중',
        },
        {
          number: 2,
          name: '포장기',
          id: 'PK-4-002',
          capacity: '100kg',
          location: '물류센터',
          quantity: 4,
          inspectionTarget: '산업안전보건기준에 관한 규칙',
          safetyDevice: '안전스위치',
          inspectionCycle: '3개월',
          accidentForm: '끼임',
          remark: '',
        },
      ],
    },
  });

  // 문서 5
  records.push({
    documentId: '1-3-5',
    tableData: {
      type: '1300',
      rows: [
        {
          number: 1,
          name: '보일러',
          id: 'B-5-001',
          capacity: '2톤',
          location: '보일러실',
          quantity: 1,
          inspectionTarget: '고압가스안전관리법',
          safetyDevice: '압력방출장치, 안전밸브',
          inspectionCycle: '1년',
          accidentForm: '폭발, 화상',
          remark: '보일러기능사 필수',
        },
        {
          number: 2,
          name: '압축기',
          id: 'CP-5-002',
          capacity: '7.5kW',
          location: '공기압축실',
          quantity: 2,
          inspectionTarget: '고압가스안전관리법',
          safetyDevice: '압력스위치, 안전밸브',
          inspectionCycle: '6개월',
          accidentForm: '폭발',
          remark: '',
        },
      ],
    },
  });

  // 1400번대: 유해인자 (safetyIdx=1, itemNumber=4)
  // 문서 1
  records.push({
    documentId: '1-4-1',
    tableData: {
      type: '1400',
      data: {
        chemical: [
          {
            chemicalName: '아세톤(Acetone)',
            formula: 'CH₃COCH₃',
            casNo: '67-64-1',
            lowerLimit: '2.6',
            upperLimit: '12.8',
            exposureLimit: 'TWA 250ppm / STEL 500ppm',
            flashPoint: '-20',
            ignitionPoint: '465',
            hazardRisk: '인화성 액체, 눈·피부 자극',
            managementStandard: '허용농도(250ppm), MSDS 작성대상',
            dailyUsage: '10L',
            storage: '50L',
            remark: '용제 사용',
          },
          {
            chemicalName: '톨루엔(Toluene)',
            formula: 'C₇H₈',
            casNo: '108-88-3',
            lowerLimit: '1.2',
            upperLimit: '7.0',
            exposureLimit: 'TWA 50ppm',
            flashPoint: '4',
            ignitionPoint: '480',
            hazardRisk: '인화성 액체, 중추신경계 영향',
            managementStandard: '허용농도(50ppm), MSDS 작성대상',
            dailyUsage: '5L',
            storage: '30L',
            remark: '페인트 희석제',
          },
        ],
        physical: [
          {
            factorName: '소음',
            form: '연속음',
            location: '생산라인 A',
            department: '생산부',
            exposureRisk: '청력손상',
            managementStandard: '85dB(A) 이하, 방음장치 설치',
            managementMeasure: '보호구 착용 필요',
            remark: '',
          },
        ],
        biological: [
          {
            factorName: '곰팡이',
            type: '곰팡이 포자',
            location: '창고, 습한지역',
            department: '관리부',
            exposureRisk: '호흡기 질환',
            managementStandard: '주기적 환기 및 청소',
            managementMeasure: '마스크 착용',
            remark: '',
          },
        ],
        ergonomic: [
          {
            factorName: '반복작업',
            form: '손·팔 반복동작',
            location: '조립라인',
            department: '생산부',
            exposureRisk: '근골격계 질환',
            managementStandard: '1시간마다 휴식 권장',
            managementMeasure: '인체공학적 작업대 설치',
            remark: '',
          },
        ],
      },
    },
  });

  // 문서 2
  records.push({
    documentId: '1-4-2',
    tableData: {
      type: '1400',
      data: {
        chemical: [
          {
            chemicalName: '메탄올(Methanol)',
            formula: 'CH₃OH',
            casNo: '67-56-1',
            lowerLimit: '6.0',
            upperLimit: '36.0',
            exposureLimit: 'TWA 200ppm',
            flashPoint: '11',
            ignitionPoint: '385',
            hazardRisk: '인화성 액체, 신경독성',
            managementStandard: '허용농도(200ppm), MSDS 작성대상',
            dailyUsage: '3L',
            storage: '20L',
            remark: '연료 첨가제',
          },
        ],
        physical: [
          {
            factorName: '진동',
            form: '기계진동',
            location: '조합라인',
            department: '유지보수부',
            exposureRisk: '손목·팔손상, 근골격계 질환',
            managementStandard: '8시간 평균 5m/s² 이하',
            managementMeasure: '장갑 사용 권장',
            remark: '',
          },
          {
            factorName: '온도',
            form: '고온/저온',
            location: '주조공정',
            department: '생산부',
            exposureRisk: '열사병, 동상',
            managementStandard: '35℃ 이상 시 휴식권장',
            managementMeasure: '냉/온수기 설치',
            remark: '',
          },
        ],
        biological: [],
        ergonomic: [
          {
            factorName: '무거운 물체 취급',
            form: '근력 사용',
            location: '창고',
            department: '물류부',
            exposureRisk: '요통, 허리부상',
            managementStandard: '최대 20kg 이하, 2인 이상 취급',
            managementMeasure: '리프트 사용 권장',
            remark: '',
          },
        ],
      },
    },
  });

  // 문서 3
  records.push({
    documentId: '1-4-3',
    tableData: {
      type: '1400',
      data: {
        chemical: [
          {
            chemicalName: '벤젠(Benzene)',
            formula: 'C₆H₆',
            casNo: '71-43-2',
            lowerLimit: '1.2',
            upperLimit: '8.0',
            exposureLimit: 'TWA 1ppm',
            flashPoint: '-11',
            ignitionPoint: '560',
            hazardRisk: '발암성 1, 인화성 액체',
            managementStandard: '발암물질(1), MSDS 작성 및 경고표시 의무',
            dailyUsage: '0.5L',
            storage: '5L',
            remark: '용제 사용',
          },
        ],
        physical: [
          {
            factorName: '전자파',
            form: '고주파',
            location: '연구소',
            department: '연구개발부',
            exposureRisk: '열손상',
            managementStandard: '전자파 노출 기준 준수',
            managementMeasure: '차폐시설 설치',
            remark: '',
          },
        ],
        biological: [
          {
            factorName: '바이러스',
            type: '인플루엔자, 코로나',
            location: '사무실, 휴게실',
            department: '전 직원',
            exposureRisk: '감염',
            managementStandard: '예방접종 권장, 손 위생',
            managementMeasure: '마스크 착용, 환기',
            remark: '',
          },
        ],
        ergonomic: [
          {
            factorName: '모니터 작업',
            form: '컴퓨터 작업',
            location: '사무실',
            department: '관리부',
            exposureRisk: '눈 피로, 목·어깨 통증',
            managementStandard: '모니터 높이/거리 조정',
            managementMeasure: '휴식 스트레칭 권장',
            remark: '',
          },
        ],
      },
    },
  });

  // 문서 4
  records.push({
    documentId: '1-4-4',
    tableData: {
      type: '1400',
      data: {
        chemical: [
          {
            chemicalName: '염산(Hydrochloric Acid)',
            formula: 'HCl',
            casNo: '7647-01-0',
            lowerLimit: '-',
            upperLimit: '-',
            exposureLimit: 'TWA 5ppm',
            flashPoint: '불가연',
            ignitionPoint: '불가연',
            hazardRisk: '부식성, 눈·피부 자극',
            managementStandard: '허용농도(5ppm), MSDS 작성대상',
            dailyUsage: '2L',
            storage: '10L',
            remark: '세척용',
          },
        ],
        physical: [
          {
            factorName: '방사선',
            form: 'X선',
            location: '검사실',
            department: '품질관리부',
            exposureRisk: '방사선 피폭',
            managementStandard: '방사선 피폭 기준 준수',
            managementMeasure: '차폐시설, 방사선 측정기',
            remark: '',
          },
        ],
        biological: [],
        ergonomic: [],
      },
    },
  });

  // 문서 5
  records.push({
    documentId: '1-4-5',
    tableData: {
      type: '1400',
      data: {
        chemical: [
          {
            chemicalName: '가솔린(Gasoline)',
            formula: 'C₈H₁₈ ~ C₁₂H₂₆',
            casNo: '8006-61-9',
            lowerLimit: '1.4',
            upperLimit: '7.6',
            exposureLimit: 'TWA 300ppm',
            flashPoint: '-43',
            ignitionPoint: '280',
            hazardRisk: '발암성 1B, 인화성 액체',
            managementStandard: '발암물질(1B), MSDS 작성 및 경고표시 의무',
            dailyUsage: '5L',
            storage: '50L',
            remark: '엔진연료용',
          },
        ],
        physical: [
          {
            factorName: '소음',
            form: '충격음',
            location: '프레스 라인',
            department: '생산부',
            exposureRisk: '청력손상',
            managementStandard: '85dB(A) 이하',
            managementMeasure: '방음덮개 설치',
            remark: '',
          },
        ],
        biological: [],
        ergonomic: [],
      },
    },
  });

  // 1500번대: 위험장소 및 작업형태별 위험요인 (safetyIdx=1, itemNumber=5)
  // 문서 1
  records.push({
    documentId: '1-5-1',
    tableData: {
      type: '1500',
      rows: [
        {
          unit: '1공장',
          work: '지게차 이용 운반작업',
          hazardCode: 'H-1-01',
          machine: '지게차',
          machineId: '55머1254',
          chemical: '이산화탄소',
          casNo: 'CO₂',
          accidentForm: '화재, 폭발',
          partner: '없음',
          freq: 3,
          sev: 4,
          evalLabel: '12 (즉시 개선 필요)',
          remark: '작업허가서 발급대상',
        },
        {
          unit: '1공장',
          work: '용접 작업',
          hazardCode: 'H-1-02',
          machine: '용접기',
          machineId: 'W-2-001',
          chemical: '',
          casNo: '',
          accidentForm: '화상, 감전',
          partner: '없음',
          freq: 2,
          sev: 3,
          evalLabel: '6 (관리필요)',
          remark: '',
        },
      ],
    },
  });

  // 문서 2
  records.push({
    documentId: '1-5-2',
    tableData: {
      type: '1500',
      rows: [
        {
          unit: '2공장',
          work: '고소작업',
          hazardCode: 'H-2-01',
          machine: '안전대',
          machineId: '',
          chemical: '',
          casNo: '',
          accidentForm: '추락',
          partner: '없음',
          freq: 1,
          sev: 5,
          evalLabel: '5 (관리필요)',
          remark: '안전대 점검 필수',
        },
      ],
    },
  });

  // 문서 3
  records.push({
    documentId: '1-5-3',
    tableData: {
      type: '1500',
      rows: [
        {
          unit: '물류센터',
          work: '화학물질 취급',
          hazardCode: 'H-3-01',
          machine: '',
          machineId: '',
          chemical: '아세톤',
          casNo: '67-64-1',
          accidentForm: '화재, 중독',
          partner: '화학물질 운송업체',
          freq: 2,
          sev: 4,
          evalLabel: '8 (즉시 개선 필요)',
          remark: 'MSDS 확인 필수',
        },
        {
          unit: '물류센터',
          work: '포장 작업',
          hazardCode: 'H-3-02',
          machine: '포장기',
          machineId: 'PK-4-002',
          chemical: '',
          casNo: '',
          accidentForm: '끼임',
          partner: '없음',
          freq: 3,
          sev: 2,
          evalLabel: '6 (관리필요)',
          remark: '',
        },
      ],
    },
  });

  // 문서 4
  records.push({
    documentId: '1-5-4',
    tableData: {
      type: '1500',
      rows: [
        {
          unit: '보일러실',
          work: '보일러 점검',
          hazardCode: 'H-4-01',
          machine: '보일러',
          machineId: 'B-5-001',
          chemical: '',
          casNo: '',
          accidentForm: '폭발, 화상',
          partner: '없음',
          freq: 1,
          sev: 5,
          evalLabel: '5 (관리필요)',
          remark: '보일러기능사 필수',
        },
      ],
    },
  });

  // 문서 5
  records.push({
    documentId: '1-5-5',
    tableData: {
      type: '1500',
      rows: [
        {
          unit: '연구소',
          work: '화학실험',
          hazardCode: 'H-5-01',
          machine: '',
          machineId: '',
          chemical: '벤젠',
          casNo: '71-43-2',
          accidentForm: '화재, 중독',
          partner: '없음',
          freq: 1,
          sev: 5,
          evalLabel: '5 (관리필요)',
          remark: '후드 설치, 보호구 착용',
        },
      ],
    },
  });

  // 2100번대: 위험요인별 위험성 평가 (safetyIdx=2, itemNumber=1)
  // 문서 1
  records.push({
    documentId: '2-1-1',
    tableData: {
      type: '2100',
      data: {
        classification: [
          {
            number: 1,
            category: '기계적 요인',
            hazardFactors: '끼임(감김), 위험한 표면, 충돌, 넘어짐, 추락등',
          },
          {
            number: 2,
            category: '전기적 요인',
            hazardFactors: '감전, 아크, 정전기, 전기화재/폭발 등',
          },
          { number: 3, category: '화학적 요인', hazardFactors: '가스, 증기, 전기화재/폭발 등' },
        ],
        assessment: [
          {
            hazardFactor: '2m 이상 고소작업',
            dangerousSituation: '작업발판에서 추락후 중상 발생',
            currentSafetyMeasure: '안전난간 설치',
            riskLevel: { value: 12, label: '매우높음' },
            additionalMeasure: '안전대 부착설치 추가 설치',
            responsiblePerson: '김안전',
            plannedDate: '2025-10-30',
            completedDate: '2025-10-30',
          },
          {
            hazardFactor: '회전체 정비작업',
            dangerousSituation: '회전부에 말려들어가 손가락 절단',
            currentSafetyMeasure: '방호덮개 설치',
            riskLevel: { value: 6, label: '중간' },
            additionalMeasure: '인터록 장치 설치',
            responsiblePerson: '이기술',
            plannedDate: '2025-10-30',
            completedDate: '2025-10-30',
          },
        ],
      },
    },
  });

  // 문서 2
  records.push({
    documentId: '2-1-2',
    tableData: {
      type: '2100',
      data: {
        classification: [
          {
            number: 1,
            category: '기계적 요인',
            hazardFactors: '끼임(감김), 위험한 표면, 충돌, 넘어짐, 추락등',
          },
          {
            number: 4,
            category: '작업특성 요인',
            hazardFactors: '소음, 진동, 근로자, 근로자 실수, 질식위험, 중량물 취급 등',
          },
        ],
        assessment: [
          {
            hazardFactor: '부식성 화학물질 취급',
            dangerousSituation: '피부접촉으로 화학 화상',
            currentSafetyMeasure: '보호장갑 착용',
            riskLevel: { value: 12, label: '매우높음' },
            additionalMeasure: '국소배기장치 설치',
            responsiblePerson: '김안전',
            plannedDate: '2025-11-01',
            completedDate: '2025-11-01',
          },
        ],
      },
    },
  });

  // 문서 3
  records.push({
    documentId: '2-1-3',
    tableData: {
      type: '2100',
      data: {
        classification: [
          {
            number: 2,
            category: '전기적 요인',
            hazardFactors: '감전, 아크, 정전기, 전기화재/폭발 등',
          },
          {
            number: 5,
            category: '작업환경 요인',
            hazardFactors: '고온/한랭, 조명, 이동통로, 주변 근로자, 안전문화 등',
          },
        ],
        assessment: [
          {
            hazardFactor: '전기패널 점검작업',
            dangerousSituation: '충전부 접촉으로 감전',
            currentSafetyMeasure: '절연장갑 작용',
            riskLevel: { value: 6, label: '중간' },
            additionalMeasure: '차단장치 설치',
            responsiblePerson: '박전기',
            plannedDate: '2025-11-05',
            completedDate: '2025-11-05',
          },
          {
            hazardFactor: '고온 작업환경',
            dangerousSituation: '열사병 발생',
            currentSafetyMeasure: '휴게실 설치',
            riskLevel: { value: 8, label: '높음' },
            additionalMeasure: '냉각시설 추가 설치',
            responsiblePerson: '최환경',
            plannedDate: '2025-11-10',
            completedDate: '',
          },
        ],
      },
    },
  });

  // 문서 4
  records.push({
    documentId: '2-1-4',
    tableData: {
      type: '2100',
      data: {
        classification: [
          { number: 3, category: '화학적 요인', hazardFactors: '가스, 증기, 전기화재/폭발 등' },
          {
            number: 6,
            category: '생물학적 요인',
            hazardFactors: '별원성 미생물, 바이러스, 유전자 변형물질 등',
          },
        ],
        assessment: [
          {
            hazardFactor: '인화성 가스 누출',
            dangerousSituation: '가스 누출로 인한 폭발 위험',
            currentSafetyMeasure: '가스검지기 설치',
            riskLevel: { value: 15, label: '매우높음' },
            additionalMeasure: '긴급차단장치 추가 설치',
            responsiblePerson: '정가스',
            plannedDate: '2025-11-15',
            completedDate: '',
          },
        ],
      },
    },
  });

  // 문서 5
  records.push({
    documentId: '2-1-5',
    tableData: {
      type: '2100',
      data: {
        classification: [
          {
            number: 1,
            category: '기계적 요인',
            hazardFactors: '끼임(감김), 위험한 표면, 충돌, 넘어짐, 추락등',
          },
          {
            number: 2,
            category: '전기적 요인',
            hazardFactors: '감전, 아크, 정전기, 전기화재/폭발 등',
          },
          {
            number: 4,
            category: '작업특성 요인',
            hazardFactors: '소음, 진동, 근로자, 근로자 실수, 질식위험, 중량물 취급 등',
          },
        ],
        assessment: [
          {
            hazardFactor: '중량물 운반 작업',
            dangerousSituation: '허리부상, 손가락 끼임',
            currentSafetyMeasure: '리프트 사용',
            riskLevel: { value: 4, label: '낮음' },
            additionalMeasure: '2인 이상 작업 원칙 준수',
            responsiblePerson: '강물류',
            plannedDate: '2025-11-20',
            completedDate: '2025-11-20',
          },
        ],
      },
    },
  });

  // 2200번대: 위험요인별 위험성 평가표 (safetyIdx=2, itemNumber=2)
  // 문서 1
  records.push({
    documentId: '2-2-1',
    tableData: {
      type: '2200',
      rows: [
        {
          risk: '건설현장 개구부',
          removal: '설계.시공 시개구부 최소화',
          engineering: '안전난간 설치',
          administrative: "'추락위험' 표지판 설치",
          ppe: '안전모/안전대착용',
        },
        {
          risk: '끼임 위험기계/기구',
          removal: '끼임 위험이 없는 자동화 기계 도입',
          engineering: '방호덮개 설치',
          administrative: "'Lock Out, Tag Out' 작업허가제 도입",
          ppe: '말려 들어갈 위험이 없는 작업복 착용',
        },
      ],
    },
  });

  // 문서 2
  records.push({
    documentId: '2-2-2',
    tableData: {
      type: '2200',
      rows: [
        {
          risk: '유해화학물질',
          removal: '유해물질 제거 또는 저독성물질로 대체\n*예:메탄올→에탄올',
          engineering: '국소배기장치 설치, 누출방지조치 등',
          administrative: '작업절차서 준수, 작업환경 측정을 통한 노출관리',
          ppe: '방독마스크, 내화학장갑, 보안경 등 착용',
        },
      ],
    },
  });

  // 문서 3
  records.push({
    documentId: '2-2-3',
    tableData: {
      type: '2200',
      rows: [
        {
          risk: '인화성 가스',
          removal: '인화성 완화\n*예:아세틸렌→ LPG',
          engineering:
            '전기설비 방폭 조치(점화원관리), 가스검지기/긴급차단장이 연동 설치 환기/배기장치 설치',
          administrative: '작업절차서 준서, 정비작업허가제 도입',
          ppe: '제전작업복 착용\n가스검지기 휴대\n방폭공구 사용',
        },
      ],
    },
  });

  // 문서 4
  records.push({
    documentId: '2-2-4',
    tableData: {
      type: '2200',
      rows: [
        {
          risk: '고소작업',
          removal: '고소작업 최소화 설계',
          engineering: '안전난간, 안전대 설치',
          administrative: '작업허가서 발급, 정기 점검',
          ppe: '안전모, 안전대, 안전화 착용',
        },
        {
          risk: '전기 작업',
          removal: '무전압 작업 시도',
          engineering: '절연장갑, 절연매트 사용',
          administrative: '작업허가제, Lock Out/Tag Out',
          ppe: '절연장갑, 절연화 착용',
        },
      ],
    },
  });

  // 문서 5
  records.push({
    documentId: '2-2-5',
    tableData: {
      type: '2200',
      rows: [
        {
          risk: '소음 작업환경',
          removal: '소음 발생 기계 교체',
          engineering: '방음시설 설치',
          administrative: '작업시간 단축, 휴식시간 확보',
          ppe: '방음이어플러그, 방음이어마프 착용',
        },
      ],
    },
  });

  // 2300번대: 감소 대책 수립·이행 (safetyIdx=2, itemNumber=3)
  // 문서 1
  records.push({
    documentId: '2-3-1',
    tableData: {
      type: '2300',
      rows: [
        {
          division: '기계적 요인',
          category: '프레스기 안전 덮개미설치',
          cause: '프레스기 안전 덮개미설치',
          hazard: '프레스기 안전 덮개 미설치',
          reference: '산업안전보건기준에 관한 규칙 제 108조(방호장치 설치)',
          law: '허용농도/법규 준수 항목',
          currentRisk: { value: 12, label: '즉시 개선 필요' },
          reductionNo: 1,
          reductionDetail: '프레스기에 양수조작식 안전덮개 설치 및 근로자 교육 실시',
          postRisk: { value: 4, label: '허용 가능' },
          owner: '김안전',
          dueDate: '2025-10-28',
          completedAt: '2025-10-28',
          done: false,
        },
        {
          division: '기계적 요인',
          category: '절단기 안전장치 미설치',
          cause: '절단기 안전장치 미설치',
          hazard: '절단기 날에 손가락 절단 위험',
          reference: '산업안전보건기준에 관한 규칙 제 108조',
          law: '허용농도/법규 준수 항목',
          currentRisk: { value: 10, label: '즉시 개선 필요' },
          reductionNo: 2,
          reductionDetail: '절단기에 방호덮개 및 인터록 장치 설치',
          postRisk: { value: 3, label: '허용 가능' },
          owner: '이기술',
          dueDate: '2025-11-01',
          completedAt: '2025-11-01',
          done: true,
        },
      ],
    },
  });

  // 문서 2
  records.push({
    documentId: '2-3-2',
    tableData: {
      type: '2300',
      rows: [
        {
          division: '전기적 요인',
          category: '전기 패널 노출',
          cause: '전기 패널 차단장치 미설치',
          hazard: '전기 패널 접촉으로 감전',
          reference: '산업안전보건기준에 관한 규칙 제 278조',
          law: '허용농도/법규 준수 항목',
          currentRisk: { value: 15, label: '즉시 개선 필요' },
          reductionNo: 1,
          reductionDetail: '전기 패널에 차단장치 및 경고표지 설치',
          postRisk: { value: 5, label: '허용 가능' },
          owner: '박전기',
          dueDate: '2025-11-05',
          completedAt: '2025-11-05',
          done: true,
        },
      ],
    },
  });

  // 문서 3
  records.push({
    documentId: '2-3-3',
    tableData: {
      type: '2300',
      rows: [
        {
          division: '화학적 요인',
          category: '유해화학물질 노출',
          cause: '국소배기장치 미설치',
          hazard: '유해화학물질 흡입',
          reference: '산업안전보건기준에 관한 규칙 제 343조',
          law: '허용농도(250ppm)',
          currentRisk: { value: 12, label: '즉시 개선 필요' },
          reductionNo: 1,
          reductionDetail: '국소배기장치 설치 및 작업환경 측정 실시',
          postRisk: { value: 4, label: '허용 가능' },
          owner: '정화학',
          dueDate: '2025-11-10',
          completedAt: '',
          done: false,
        },
      ],
    },
  });

  // 문서 4
  records.push({
    documentId: '2-3-4',
    tableData: {
      type: '2300',
      rows: [
        {
          division: '작업환경 요인',
          category: '고온 작업환경',
          cause: '냉각시설 부족',
          hazard: '열사병 발생',
          reference: '산업안전보건기준에 관한 규칙 제 638조',
          law: '작업환경 기준',
          currentRisk: { value: 8, label: '높음' },
          reductionNo: 1,
          reductionDetail: '냉각시설 설치 및 휴게시간 확보',
          postRisk: { value: 3, label: '허용 가능' },
          owner: '최환경',
          dueDate: '2025-11-15',
          completedAt: '2025-11-15',
          done: true,
        },
      ],
    },
  });

  // 문서 5
  records.push({
    documentId: '2-3-5',
    tableData: {
      type: '2300',
      rows: [
        {
          division: '작업특성 요인',
          category: '소음 작업환경',
          cause: '방음시설 미설치',
          hazard: '청력손상',
          reference: '산업안전보건기준에 관한 규칙 제 474조',
          law: '85dB(A) 이하',
          currentRisk: { value: 9, label: '높음' },
          reductionNo: 1,
          reductionDetail: '방음시설 설치 및 보호구 착용',
          postRisk: { value: 4, label: '허용 가능' },
          owner: '강소음',
          dueDate: '2025-11-20',
          completedAt: '',
          done: false,
        },
      ],
    },
  });

  return records;
}

export const mockDocumentTableData: DocumentTableDataRecord[] = generateDocumentTableData();

// 조회 함수
export function getTableDataByDocument(
  safetyIdx: number,
  itemNumber: number,
  documentNumber: number
): DocumentTableData | null {
  const documentId = `${safetyIdx}-${itemNumber}-${documentNumber}`;
  return mockDocumentTableData.find((d) => d.documentId === documentId)?.tableData || null;
}
