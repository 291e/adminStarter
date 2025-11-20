// ----------------------------------------------------------------------
// 각 문서 타입별 테이블 데이터 타입 정의

// 1100번대: 위험요인 파악
export type Table1100Row = {
  highRiskWork: string; // 고위험작업 및 상황
  disasterFactor: string; // 재해유발요인
  workplace: string; // 작업장소
  machineHazard: string; // 기계·기구·설비 유해인자
  improvementNeeded: string; // 개선필요
  remark: string; // 비고
};

// 1300번대: 위험 기계·기구·설비
export type Table1300Row = {
  number: number; // 순번
  name: string; // 기계·기구·설비명
  id: string; // 관리번호
  capacity: string; // 용량
  location: string; // 단위작업장소
  quantity: number | string; // 수량
  inspectionTarget: string; // 검사대상
  safetyDevice: string; // 방호장치
  inspectionCycle: string; // 점검주기
  accidentForm: string; // 발생가능 재해형태
  remark: string; // 비고
};

// 1400번대: 유해인자
export type Table1400ChemicalRow = {
  chemicalName: string; // 화학물질명
  formula: string; // 화학식
  casNo: string; // CAS No
  lowerLimit: string; // 폭발한계(%)하한
  upperLimit: string; // 폭발한계(%)상한
  exposureLimit: string; // 노출기준
  flashPoint: string; // 인화점(℃)
  ignitionPoint: string; // 발화점(℃)
  hazardRisk: string; // 유해성 위험성 구분
  managementStandard: string; // 산업안전보건법 관리기준
  dailyUsage: string; // 일일사용량
  storage: string; // 저장량
  remark: string; // 비고
};

export type Table1400PhysicalRow = {
  factorName: string; // 유해인자명
  form: string; // 형태
  location: string; // 위치
  department: string; // 대상부서
  exposureRisk: string; // 노출위험
  managementStandard: string; // 관리기준
  managementMeasure: string; // 관리대책
  remark: string; // 비고
};

export type Table1400BiologicalRow = {
  factorName: string; // 유해인자명
  type: string; // 유형
  location: string; // 발생위치
  department: string; // 대상부서
  exposureRisk: string; // 노출위험
  managementStandard: string; // 관리기준
  managementMeasure: string; // 관리대책
  remark: string; // 비고
};

export type Table1400ErgonomicRow = {
  factorName: string; // 유해인자명
  form: string; // 형태
  location: string; // 위치
  department: string; // 대상부서
  exposureRisk: string; // 노출위험
  managementStandard: string; // 관리기준
  managementMeasure: string; // 관리대책
  remark: string; // 비고
};

export type Table1400Data = {
  chemical: Table1400ChemicalRow[];
  physical: Table1400PhysicalRow[];
  biological: Table1400BiologicalRow[];
  ergonomic: Table1400ErgonomicRow[];
};

// 1500번대: 위험장소 및 작업형태별 위험요인
export type Table1500Row = {
  unit: string; // 단위 작업장소
  work: string; // 작업내용
  hazardCode: string; // 위험코드
  machine: string; // 관련기계·기구·설비
  machineId: string; // 관리번호
  chemical: string; // 화학물질명
  casNo: string; // CAS No
  accidentForm: string; // 발생가능 재해형태
  partner: string; // 관련 협력업체
  freq: number | string; // 빈도
  sev: number | string; // 심각도
  evalLabel: string; // 평가(예: 6 (관리필요))
  remark: string; // 비고
};

// 2100번대: 위험요인별 위험성 평가 (2개 테이블)
export type Table2100ClassificationRow = {
  number: number; // 번호
  category: string; // 구분
  hazardFactors: string; // 해당 유해, 위험요인
};

export type Table2100AssessmentRow = {
  hazardFactor: string; // 유해/위험요인
  dangerousSituation: string; // 위험한 상황과 결과
  currentSafetyMeasure: string; // 현재 안전조치
  riskLevel: { value: number; label: string }; // 위험성
  additionalMeasure: string; // 추가조치사항
  responsiblePerson: string; // 담당자
  plannedDate: string; // 예정일
  completedDate: string; // 완료일
};

export type Table2100Data = {
  classification: Table2100ClassificationRow[];
  assessment: Table2100AssessmentRow[];
};

// 2200번대: 위험요인별 위험성 평가표
export type Table2200Row = {
  risk: string; // 위험 요인
  removal: string; // 제거·대체
  engineering: string; // 공학적 통제
  administrative: string; // 행정적 통제
  ppe: string; // PPE
};

// 2300번대: 감소 대책 수립·이행
export type Table2300Row = {
  division: string; // 구분
  category: string; // 분류
  cause: string; // 원인
  hazard: string; // 유해위험요인
  reference: string; // 관련근거
  law: string; // 법규/노출기준 등
  currentRisk: { value: number; label: string }; // 현재 위험성
  reductionNo: number | string; // 감소 대책 NO
  reductionDetail: string; // 감소 대책 세부내용
  postRisk: { value: number; label: string }; // 개선후 위험성
  owner: string; // 담당자
  dueDate: string; // 조치요구일
  completedAt: string; // 조치 완료일
  done?: boolean; // 완료 확인
};

// 2400번대: 교육훈련 - TBM 일지
export type Table2400TBMInspectionRow = {
  inspectionContent: string; // 점검내용
  result: string; // 결과
};

export type Table2400TBMEducationVideoRow = {
  participant: InvestigationTeamMember | null; // 대상자
  educationVideo: string; // 교육영상
  signature: string; // 서명 (이미지 URL 또는 파일)
};

export type Table2400TBMData = {
  inspectionRows: Table2400TBMInspectionRow[]; // 점검내용 테이블
  educationContent: string; // 교육내용
  educationVideoRows: Table2400TBMEducationVideoRow[]; // 교육영상 테이블
};

// 2400번대: 교육훈련 - 연간 교육 계획
export type Table2400EducationRow = {
  number: number; // 순번
  educationType: '법정' | '자율'; // 교육구분
  educationCourse: string; // 교육과정
  scheduleMonths: boolean[]; // 일정 (1월~12월 체크박스, 12개)
  targetCount: string; // 대상 인원(명)
  educationMethod: string; // 교육방법 (내·외부)
  remark: string; // 비고
};

// 2400번대: 교육훈련 - 최저 교육시간
export type Table2400MinimumEducationRow = {
  category: string; // 구분 (카테고리)
  subCategory1: string; // 구분 (세부 - 위)
  subCategory2: string; // 구분 (세부 - 아래)
  subCategory3?: string; // 구분 (세부 - 위)
  newEmployeeEducation1: string; // 신규교육 (위)
  newEmployeeEducation2: string; // 신규교육 (아래)
  newEmployeeEducation3?: string; // 신규교육 (위)
  regularEducation1: string; // 정기교육/보수교육 (위)
  regularEducation2: string; // 정기교육/보수교육 (아래)
  regularEducation3?: string; // 정기교육/보수교육 (위)
  workContentChange1: string; // 작업내용변경시(1회) (위)
  workContentChange2: string; // 작업내용변경시(1회) (아래)
  workContentChange3?: string; // 작업내용변경시(1회) (위)
  specialEducation1: string; // 특별교육(채용시1회) (아래)
  specialEducation2: string; // 특별교육(채용시1회) (아래)
  specialEducation3?: string; // 특별교육(채용시1회) (위)
};

// 1200번대: 산업재해 및 아차사고 - 산업재해 작성
export type InvestigationTeamMember = {
  department: string; // 소속
  name: string; // 성명
};

export type HumanDamage = {
  department: string; // 소속
  name: string; // 성명
  position: string; // 직급
  injury: string; // 상해부위/부상
};

export type Table1200IndustrialAccidentRow = {
  accidentName: string; // 사고명
  accidentDate: string; // 사고 일시 - 날짜
  accidentTime: string; // 사고 일시 - 시간
  accidentLocation: string; // 사고장소
  accidentType: string; // 사고 형태
  investigationTeam: InvestigationTeamMember[]; // 사고조사반
  humanDamage: HumanDamage[]; // 인적피해
  materialDamage: string; // 물적피해
  accidentContent: string; // 사고내용
  riskAssessmentBefore: {
    possibility: string; // 가능성
    severity: string; // 중대성
    risk: string; // 위험성
  };
  accidentCause: string; // 사고원인
  doctorOpinion: string; // 의사/외부 전문가 소견
  preventionMeasure: string; // 재발방지 대책
  riskAssessmentAfter: {
    possibility: string; // 가능성
    severity: string; // 중대성
    risk: string; // 위험성
  };
  otherContent: string; // 기타내용 사고조사 내용
  investigationImages: File[]; // 기타내용 사고조사 사진
};

export type Table1200RiskGrade = 'A' | 'B' | 'C';

export type Table1200NearMissRow = {
  workName: string; // 작업명
  grade: Table1200RiskGrade; // 등급
  reporter: string; // 신고자
  reporterDepartment: string; // 소속
  workContent: string; // 작업내용
  accidentContent: string; // 사고내용
  accidentRiskLevel: Table1200RiskGrade; // 사고내용 위험정도
  accidentCause: string; // 발생원인
  preventionMeasure: string; // 예방대책
  preventionRiskLevel: Table1200RiskGrade; // 예방대책 위험정도
  siteSituation: string; // 작업현장 상황 설명
  siteImages: File[]; // 현장 이미지
};

// 통합 타입 (Union)
export type DocumentTableData =
  | { type: '1100'; rows: Table1100Row[] }
  | { type: '1200-industrial'; rows: Table1200IndustrialAccidentRow[] }
  | { type: '1200-near-miss'; row: Table1200NearMissRow }
  | { type: '1300'; rows: Table1300Row[] }
  | { type: '1400'; data: Table1400Data }
  | { type: '1500'; rows: Table1500Row[] }
  | { type: '2100'; data: Table2100Data }
  | { type: '2200'; rows: Table2200Row[] }
  | { type: '2300'; rows: Table2300Row[] }
  | { type: '2400-tbm'; data: Table2400TBMData }
  | {
      type: '2400-education';
      rows: Table2400EducationRow[];
      minimumEducationRows: Table2400MinimumEducationRow[];
    };
