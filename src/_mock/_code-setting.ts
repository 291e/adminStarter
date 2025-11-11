import { fSub } from 'src/utils/format-time';

// ----------------------------------------------------------------------

export type CodeSetting = {
  id: string;
  order: number; // 순번
  registrationDate: string; // 등록일 (YYYY-MM-DD HH:mm:ss)
  code: string; // 기계·설비 코드 / 유해인자 코드
  name: string; // 기계·설비명 / 유해인자명
  inspectionCycle?: string; // 검사주기 (기계·설비용)
  protectiveDevices?: string[]; // 방호장치 (기계·설비용)
  riskTypes?: string[]; // 주요 위험유형 (기계·설비용)
  // 유해인자용 필드
  category?: string; // 카테고리 (유해인자용)
  formAndType?: string; // 형태 및 유형 (유해인자용)
  location?: string; // 위치 (유해인자용)
  exposureRisk?: string; // 노출위험 (유해인자용)
  organizationName?: string; // 조직명 (유해인자용)
  status: 'active' | 'inactive'; // 상태
  categoryType: 'machine' | 'hazard'; // 카테고리 타입 (기계.기구.설비 / 유해인자)
};

const codes = ['PRS', 'CRN', 'LFT', 'CNV', 'WLD', 'GRD', 'CUT', 'BND'];
const names = ['프레스', '크레인', '리프트', '컨베이어', '용접기', '연삭기', '절단기', '벤딩기'];

const inspectionCycles = ['1개월', '3개월', '6개월', '1년', '2년'];

const protectiveDevicesList = [
  ['양수조작식 방호장치', '광전자식 방호장치'],
  ['권과방지장치', '훅 방지장치', '과부하방지장치'],
  ['안전장치', '비상정지장치'],
  ['가드', '인터록'],
  ['안전밸브', '압력계'],
  ['안전장치', '비상정지버튼'],
  ['가드', '안전커버'],
  ['안전장치'],
];

const riskTypesList = [
  ['협착', '절단'],
  ['끼임', '추락', '충돌'],
  ['추락', '충격'],
  ['끼임', '충격'],
  ['화상', '폭발'],
  ['절단', '분진'],
  ['절단', '충격'],
  ['절단', '협착'],
];

// 유해인자용 데이터
const hazardCategories = ['물리적 인자', '생물학적 인자', '인간공학적 인자'];
const hazardCodes = ['PHY', 'BIO', 'ERG'];
const hazardNames = ['소음', '진동', '분진'];
const formAndTypes = ['가스', '액체', '고체'];
const locations = ['1층 작업장', '2층 작업장', '지하 작업장'];
const exposureRisks = ['높음', '중간', '낮음'];
const organizationNames = ['(주)안전건설', '(주)대한건설', '(주)한국건설'];

// ----------------------------------------------------------------------

export function mockCodeSettings(count: number = 20): CodeSetting[] {
  return Array.from({ length: count }, (_, index) => {
    const codeIndex = index % codes.length;
    const cycleIndex = index % inspectionCycles.length;
    const status: 'active' | 'inactive' = index % 10 < 8 ? 'active' : 'inactive'; // 80% 활성, 20% 비활성
    const categoryType: 'machine' | 'hazard' = index % 2 === 0 ? 'machine' : 'hazard';

    if (categoryType === 'machine') {
      return {
        id: `code-${index + 1}`,
        order: count - index,
        registrationDate: fSub({ days: count - index }),
        code: codes[codeIndex],
        name: names[codeIndex],
        inspectionCycle: inspectionCycles[cycleIndex],
        protectiveDevices: protectiveDevicesList[codeIndex] || [],
        riskTypes: riskTypesList[codeIndex] || [],
        status,
        categoryType,
      };
    }

    // 유해인자 데이터
    const hazardIndex = index % hazardCodes.length;
    return {
      id: `code-${index + 1}`,
      order: count - index,
      registrationDate: fSub({ days: count - index }),
      code: hazardCodes[hazardIndex],
      name: hazardNames[hazardIndex],
      category: hazardCategories[hazardIndex],
      formAndType: formAndTypes[hazardIndex],
      location: locations[hazardIndex],
      exposureRisk: exposureRisks[hazardIndex],
      organizationName: organizationNames[hazardIndex],
      status,
      categoryType,
    };
  });
}
