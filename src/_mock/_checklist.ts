import { fSub } from 'src/utils/format-time';

// ----------------------------------------------------------------------

export type Checklist = {
  id: string;
  order: number; // 순번
  registrationDate: string; // 등록일 (YYYY-MM-DD HH:mm:ss)
  highRiskWork: string; // 고위험작업/상황
  disasterFactors: string[]; // 재해유발요인
  status: 'active' | 'inactive'; // 상태
  industry: string; // 업종
};

const industries = [
  'manufacturing', // 제조업
  'transport', // 운수·창고·통신업
  'forestry', // 임업
  'building', // 건물 등의 종합관리사업
  'sanitation', // 위생 및 유사서비스업
];

const highRiskWorks = [
  '기계·설비 정비, 수리, 교체, 청소 등 비정형 작업',
  '크레인 취급 작업 (이동식크레인 포함)',
  '고소작업 (2m 이상)',
  '전기 작업 (전기설비의 설치·보수·점검)',
  '용접·절단 작업',
  '굴착 작업 (지하 매설물 작업 포함)',
  '화학물질 취급 작업',
  '중량물 취급 작업',
  '콘크리트 타설 작업',
  '사다리 이용 통행 및 작업',
  '승강기 정비·수리 작업',
  '지붕 작업',
  '폐기물 처리 작업',
  '가스 용접·절단 작업',
  '압력용기 작업',
];

const disasterFactors = [
  ['협착', '절단', '끼임'],
  ['추락', '충돌', '끼임'],
  ['추락', '낙하물'],
  ['감전', '화상'],
  ['화상', '폭발', '분진'],
  ['붕괴', '매몰', '가스누출'],
  ['중독', '화상', '폭발'],
  ['추락', '낙하물', '협착'],
  ['추락', '협착'],
  ['추락', '낙하물'],
  ['추락', '협착', '감전'],
  ['추락', '낙하물'],
  ['중독', '화상'],
  ['화상', '폭발'],
  ['폭발', '화상'],
];

// ----------------------------------------------------------------------

export function mockChecklists(count: number = 20): Checklist[] {
  return Array.from({ length: count }, (_, index) => {
    const workIndex = index % highRiskWorks.length;
    const industryIndex = index % industries.length;
    const status: 'active' | 'inactive' = index % 10 < 8 ? 'active' : 'inactive'; // 80% 활성, 20% 비활성

    return {
      id: `checklist-${index + 1}`,
      order: count - index,
      registrationDate: fSub({ days: count - index }),
      highRiskWork: highRiskWorks[workIndex],
      disasterFactors: disasterFactors[workIndex] || [],
      status,
      industry: industries[industryIndex],
    };
  });
}

