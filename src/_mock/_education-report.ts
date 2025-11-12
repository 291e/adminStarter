// ----------------------------------------------------------------------

export type EducationReport = {
  id: string;
  organizationName: string; // 조직명
  name: string; // 이름
  position: string; // 직급
  department: string; // 소속
  role: string; // 역할
  mandatoryEducation: number; // 의무교육(분)
  regularEducation: number; // 정기교육(분)
  totalEducation: number; // 총 이수(분)
  standardEducation: number; // 이수 기준(분)
  completionRate: number; // 이수율 (%)
};

const organizationNames = ['이편한 자동화기술'];

const names = ['이영희', '김철수', '박민수', '최지영', '정수진'];

const positions = ['팀장', '과장', '대리', '주임', '사원'];

const departments = ['경영전략팀', '안전관리팀', '인사팀', '재무팀', '영업팀'];

const roles = ['안전보건 담당자', '근로자', '관리감독자', '조직관리자', '안전관리자'];

// ----------------------------------------------------------------------

export function mockEducationReports(count: number): EducationReport[] {
  return Array.from({ length: count }, (_, index) => {
    const nameIndex = index % names.length;
    const positionIndex = index % positions.length;
    const departmentIndex = index % departments.length;
    const roleIndex = index % roles.length;

    // 의무교육과 정기교육 랜덤 생성 (10-50분 범위)
    const mandatoryEducation = Math.floor(Math.random() * 40) + 10;
    const regularEducation = Math.floor(Math.random() * 40) + 10;
    const totalEducation = mandatoryEducation + regularEducation;

    // 이수 기준 랜덤 생성 (50-250분 범위)
    const standardEducation = Math.floor(Math.random() * 200) + 50;

    // 이수율 계산 (총 이수 / 이수 기준 * 100, 최대 100%)
    const completionRate = Math.min(Math.round((totalEducation / standardEducation) * 100), 100);

    return {
      id: `education-${index + 1}`,
      organizationName: organizationNames[0],
      name: names[nameIndex],
      position: positions[positionIndex],
      department: departments[departmentIndex],
      role: roles[roleIndex],
      mandatoryEducation,
      regularEducation,
      totalEducation,
      standardEducation,
      completionRate,
    };
  });
}

// ----------------------------------------------------------------------

export type EducationRecord = {
  id: string;
  method: 'online' | 'offline' | '집체' | '온라인'; // 온라인 | 집체 (한글/영문 모두 지원)
  educationName: string;
  educationTime: number; // 분
  educationDate: string; // YYYY-MM-DD
  fileName?: string;
  fileUrl?: string;
};

const educationNames = [
  '아크릴로니트릴_10분 작업 안전',
  '화학물질 안전관리 교육',
  '건설현장 안전보건 교육',
  '전기안전 작업 교육',
  '소방안전 교육',
  '산업안전보건법 교육',
  '위험물 안전관리 교육',
  '개인보호구 착용 교육',
  '안전작업 절차 교육',
  '응급처치 교육',
];

const fileNames = [
  '교육자료_안전관리.pdf',
  '작업안전_매뉴얼.pdf',
  '화학물질_안전가이드.pdf',
  '응급처치_매뉴얼.pdf',
  '안전보건_교육자료.pdf',
  '작업절차서.pdf',
  '안전수칙.pdf',
  '교육수료증.pdf',
];

// ----------------------------------------------------------------------

export function mockMandatoryEducationRecords(count: number = 10): EducationRecord[] {
  const methods: ('집체' | '온라인')[] = ['집체', '온라인'];
  const dates = [
    '2025-10-31',
    '2025-10-30',
    '2025-10-29',
    '2025-10-28',
    '2025-10-27',
    '2025-10-26',
    '2025-10-25',
    '2025-10-24',
    '2025-10-23',
    '2025-10-22',
  ];
  const times = [30, 60, 90, 120, 150, 180];

  return Array.from({ length: count }, (_, index) => {
    const method = methods[index % methods.length];
    const educationName = educationNames[index % educationNames.length];
    const educationTime = times[index % times.length];
    const educationDate = dates[index % dates.length];
    const hasFile = index % 3 !== 0; // 일부만 파일 있음
    const fileName = hasFile ? fileNames[index % fileNames.length] : undefined;

    return {
      id: `mandatory-${index + 1}`,
      method,
      educationName,
      educationTime,
      educationDate,
      fileName: hasFile ? fileName : undefined,
    };
  });
}

export function mockRegularEducationRecords(count: number = 10): EducationRecord[] {
  const methods: ('집체' | '온라인')[] = ['집체', '온라인'];
  const dates = [
    '2025-10-31',
    '2025-10-30',
    '2025-10-29',
    '2025-10-28',
    '2025-10-27',
    '2025-10-26',
    '2025-10-25',
    '2025-10-24',
    '2025-10-23',
    '2025-10-22',
  ];
  const times = [30, 60, 90, 120, 150, 180];

  return Array.from({ length: count }, (_, index) => {
    const method = methods[index % methods.length];
    const educationName = educationNames[index % educationNames.length];
    const educationTime = times[index % times.length];
    const educationDate = dates[index % dates.length];
    const hasFile = index % 2 === 0; // 일부만 파일 있음
    const fileName = hasFile ? fileNames[index % fileNames.length] : undefined;

    return {
      id: `regular-${index + 1}`,
      method,
      educationName,
      educationTime,
      educationDate,
      fileName: hasFile ? fileName : undefined,
    };
  });
}
