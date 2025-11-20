import type { Theme, SxProps } from '@mui/material/styles';
import { useState, useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import dayjs, { type Dayjs } from 'dayjs';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { DashboardContent } from 'src/layouts/dashboard';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import type { SafetySystem, SafetySystemItem } from 'src/_mock/_safety-system';
import { getTableDataByDocument, FIXED_MINIMUM_EDUCATION_ROWS } from 'src/_mock/_safety-system';
import type {
  Table1100Row,
  Table1200IndustrialAccidentRow,
  Table1200NearMissRow,
  Table1300Row,
  Table1400Data,
  Table1500Row,
  Table2100Data,
  Table2200Row,
  Table2300Row,
  Table2400TBMData,
  Table2400EducationRow,
  Table2400MinimumEducationRow,
  InvestigationTeamMember,
  HumanDamage,
} from '../types/table-data';

import CreateHeader from './components/Header';
import DocumentInfo from './components/DocumentInfo';
import Table1100Form from './tables/Table1100Form';
import Table1200IndustrialAccidentForm from './tables/Table1200IndustrialAccidentForm';
import Table1200NearMissForm from './tables/Table1200NearMissForm';
import Table1300Form from './tables/Table1300Form';
import Table1400Form from './tables/Table1400Form';
import Table1500Form from './tables/Table1500Form';
import Table2100Form from './tables/Table2100Form';
import Table2200Form from './tables/Table2200Form';
import Table2300Form from './tables/Table2300Form';
import Table2400TBMForm from './tables/Table2400TBMForm';
import Table2400EducationForm from './tables/Table2400EducationForm';
import FooterButtons from './components/FooterButtons';
import RiskAssessmentSettingModal, {
  type RiskAssessmentData,
} from '../components/RiskAssessmentSettingModal';

// ----------------------------------------------------------------------

type Props = {
  safetyId?: string;
  title?: string;
  description?: string;
  sx?: SxProps<Theme>;
};

const initialTable2200Rows: Table2200Row[] = [
  {
    risk: '',
    removal: '',
    engineering: '',
    administrative: '',
    ppe: '',
  },
];

const initialTable1100Rows: Table1100Row[] = [
  {
    highRiskWork: '',
    disasterFactor: '',
    workplace: '',
    machineHazard: '',
    improvementNeeded: '',
    remark: '',
  },
];

const initialTable1300Rows: Table1300Row[] = [
  {
    number: 1,
    name: '',
    id: '',
    capacity: '',
    location: '',
    quantity: '',
    inspectionTarget: '산업안전보건법',
    safetyDevice: '',
    inspectionCycle: '',
    accidentForm: '',
    remark: '',
  },
];

const initialTable1400Data: Table1400Data = {
  chemical: [
    {
      chemicalName: '',
      formula: '',
      casNo: '',
      lowerLimit: '',
      upperLimit: '',
      exposureLimit: '',
      flashPoint: '',
      ignitionPoint: '',
      hazardRisk: '',
      managementStandard: '',
      dailyUsage: '',
      storage: '',
      remark: '',
    },
  ],
  physical: [
    {
      factorName: '',
      form: '',
      location: '',
      department: '',
      exposureRisk: '',
      managementStandard: '',
      managementMeasure: '',
      remark: '',
    },
  ],
  biological: [
    {
      factorName: '',
      type: '',
      location: '',
      department: '',
      exposureRisk: '',
      managementStandard: '',
      managementMeasure: '',
      remark: '',
    },
  ],
  ergonomic: [
    {
      factorName: '',
      form: '',
      location: '',
      department: '',
      exposureRisk: '',
      managementStandard: '',
      managementMeasure: '',
      remark: '',
    },
  ],
};

export function Risk_2200CreateView({ safetyId, title = 'Blank', description, sx }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as
    | {
        system: SafetySystem;
        item?: SafetySystemItem;
        isGuide?: boolean;
        documentId?: string;
        copyFrom?: string; // 복사할 문서 ID
        documentData?: any; // 복사할 문서 데이터 (API 연동 시)
        documentType?: 'industrial-accident' | 'near-miss' | 'tbm' | 'education'; // 1200번대, 2400번대 문서 타입
      }
    | undefined;

  // TODO: TanStack Query Hook(useQuery)으로 임시 저장된 문서 불러오기 (수정 모드 또는 임시 저장 불러오기)
  // const { data: temporaryDocument } = useQuery({
  //   queryKey: ['risk2200TemporaryDocument', state?.documentId],
  //   queryFn: () => getRisk2200TemporaryDocument(state?.documentId!),
  //   enabled: !!state?.documentId,
  // });

  // 문서 타입 확인 (safetyIdx와 itemNumber)
  const safetyIdx = state?.item?.safetyIdx || state?.system?.safetyIdx;
  const itemNumber = state?.item?.itemNumber;
  const is1100Series = safetyIdx === 1 && itemNumber === 1; // 1100번대: 위험요인 파악
  const is1200Series = safetyIdx === 1 && itemNumber === 2; // 1200번대: 산업재해 및 아차사고
  const is1200IndustrialAccident = is1200Series && state?.documentType === 'industrial-accident'; // 산업재해 작성
  const is1200NearMiss = is1200Series && state?.documentType === 'near-miss'; // 아차사고 작성
  const is1300Series = safetyIdx === 1 && itemNumber === 3; // 1300번대: 위험 기계·기구·설비
  const is1400Series = safetyIdx === 1 && itemNumber === 4; // 1400번대: 유해인자
  const is1500Series = safetyIdx === 1 && itemNumber === 5; // 1500번대: 위험장소 및 작업형태별 위험요인
  const is2100Series = safetyIdx === 2 && itemNumber === 1; // 2100번대: 위험요인별 위험성 평가
  const is2200Series = safetyIdx === 2 && itemNumber === 2; // 2200번대: 위험요인 제거·대체 및 통제 등록
  const is2300Series = safetyIdx === 2 && itemNumber === 3; // 2300번대: 감소 대책 수립·이행
  const is2400Series = safetyIdx === 2 && itemNumber === 4; // 2400번대: 교육훈련
  const is2400TBM = is2400Series && state?.documentType === 'tbm'; // TBM 일지 작성
  const is2400Education = is2400Series && state?.documentType === 'education'; // 연간 교육 계획 작성

  const [documentDate, setDocumentDate] = useState<Dayjs | null>(dayjs());
  const [approvalDeadline, setApprovalDeadline] = useState<Dayjs | null>(dayjs().add(33, 'day'));
  const [table1100Rows, setTable1100Rows] = useState<Table1100Row[]>(initialTable1100Rows);
  const [table1200IndustrialAccidentRow, setTable1200IndustrialAccidentRow] =
    useState<Table1200IndustrialAccidentRow>({
      accidentName: '',
      accidentDate: '',
      accidentTime: '',
      accidentLocation: '',
      accidentType: '',
      investigationTeam: [],
      humanDamage: [],
      materialDamage: '',
      accidentContent: '',
      riskAssessmentBefore: {
        possibility: '',
        severity: '',
        risk: '',
      },
      accidentCause: '',
      doctorOpinion: '',
      preventionMeasure: '',
      riskAssessmentAfter: {
        possibility: '',
        severity: '',
        risk: '',
      },
      otherContent: '',
      investigationImages: [],
    });
  const [table1200NearMissRow, setTable1200NearMissRow] = useState<Table1200NearMissRow>({
    workName: '',
    grade: 'A',
    reporter: '',
    reporterDepartment: '',
    workContent: '',
    accidentContent: '',
    accidentRiskLevel: 'A',
    accidentCause: '',
    preventionMeasure: '',
    preventionRiskLevel: 'A',
    siteSituation: '',
    siteImages: [],
  });
  const [table2200Rows, setTable2200Rows] = useState<Table2200Row[]>(initialTable2200Rows);
  const [table2300Rows, setTable2300Rows] = useState<Table2300Row[]>([
    {
      division: '',
      category: '',
      cause: '',
      hazard: '',
      reference: '',
      law: '',
      currentRisk: { value: 0, label: '' },
      reductionNo: '',
      reductionDetail: '',
      postRisk: { value: 0, label: '' },
      owner: '',
      dueDate: '',
      completedAt: '',
      done: false,
    },
  ]);
  const [table2400TBMData, setTable2400TBMData] = useState<Table2400TBMData>({
    inspectionRows: [
      { inspectionContent: '기계·가구·설비 이상 유무', result: '' },
      { inspectionContent: '기계·가구·설비 방호장치', result: '' },
      { inspectionContent: '근로자 건강 상태', result: '' },
      { inspectionContent: '개인보호구 착용 여부', result: '' },
      { inspectionContent: '작업절차 및 방법 숙지', result: '' },
      { inspectionContent: '작업장 정리/정돈, 통보 확보', result: '' },
      { inspectionContent: '점검결과 조치사항', result: '' },
    ],
    educationContent: '',
    educationVideoRows: [
      {
        participant: null,
        educationVideo: '',
        signature: '',
      },
    ],
  });
  const [table2400EducationRows, setTable2400EducationRows] = useState<Table2400EducationRow[]>([
    {
      number: 1,
      educationType: '법정',
      educationCourse: '',
      scheduleMonths: Array(12).fill(false),
      targetCount: '',
      educationMethod: '',
      remark: '',
    },
  ]);
  // 고정된 최저 교육시간 데이터
  const [table2400MinimumEducationRows, setTable2400MinimumEducationRows] = useState<
    Table2400MinimumEducationRow[]
  >(FIXED_MINIMUM_EDUCATION_ROWS);
  const [table1300Rows, setTable1300Rows] = useState<Table1300Row[]>(initialTable1300Rows);
  const [table1400Data, setTable1400Data] = useState<Table1400Data>(initialTable1400Data);
  const [table1500Rows, setTable1500Rows] = useState<Table1500Row[]>([
    {
      unit: '',
      work: '',
      hazardCode: '',
      machine: '',
      machineId: '',
      chemical: '',
      casNo: '',
      accidentForm: '',
      partner: '',
      freq: '',
      sev: '',
      evalLabel: '',
      remark: '',
    },
  ]);
  const [table2100Data, setTable2100Data] = useState<Table2100Data>({
    classification: [
      {
        number: 1,
        category: '',
        hazardFactors: '',
      },
    ],
    assessment: [
      {
        hazardFactor: '',
        dangerousSituation: '',
        currentSafetyMeasure: '',
        riskLevel: { value: 0, label: '' },
        additionalMeasure: '',
        responsiblePerson: '',
        plannedDate: '',
        completedDate: '',
      },
    ],
  });

  // 위험도 설정 데이터 (기본값)
  const defaultRiskRanges = [
    { min: 1, max: 4, label: '허용 가능', enabled: true },
    { min: 5, max: 8, label: '관리 필요', enabled: true },
    { min: 9, max: 16, label: '즉시 개선', enabled: true },
  ];
  const [riskAssessmentData, setRiskAssessmentData] = useState<RiskAssessmentData>({
    frequency: {
      min: 1,
      max: 4,
      ranges: [
        { value: 1, label: '거의 없음' },
        { value: 2, label: '가끔 발생' },
        { value: 3, label: '자주 발생' },
        { value: 4, label: '매우 자주 발생' },
      ],
    },
    severity: {
      min: 1,
      max: 4,
      ranges: [
        { value: 1, label: '거의 없음' },
        { value: 2, label: '가끔 발생' },
        { value: 3, label: '자주 발생' },
        { value: 4, label: '매우 자주 발생' },
      ],
    },
    riskRanges: defaultRiskRanges,
  });

  const [riskAssessmentModalOpen, setRiskAssessmentModalOpen] = useState(false);

  const handleRiskAssessmentSave = (data: RiskAssessmentData) => {
    // TODO: API 호출하여 위험성 평가 기준 저장
    setRiskAssessmentData(data);
    // 위험도 설정이 변경되면 기존 위험도 값들의 label도 업데이트
    const updatedAssessment = table2100Data.assessment.map((row) => {
      if (row.riskLevel?.value) {
        const enabledRanges = data.riskRanges.filter((range) => range.enabled);
        const matchingRange = enabledRanges.find(
          (range) => row.riskLevel!.value >= range.min && row.riskLevel!.value <= range.max
        );
        if (matchingRange) {
          return {
            ...row,
            riskLevel: { value: row.riskLevel.value, label: matchingRange.label },
          };
        }
      }
      return row;
    });
    setTable2100Data({ ...table2100Data, assessment: updatedAssessment });
  };

  // 복사된 문서 데이터 로드
  useEffect(() => {
    if (state?.copyFrom) {
      // TODO: API 연동 시 state.documentData 사용
      // if (state.documentData) {
      //   // API에서 가져온 문서 데이터로 폼 초기화
      //   const docData = state.documentData;
      //   if (docData.documentDate) setDocumentDate(dayjs(docData.documentDate));
      //   if (docData.approvalDeadline) setApprovalDeadline(dayjs(docData.approvalDeadline));
      //   // 테이블 데이터 설정
      //   if (is1100Series && docData.tableData?.type === '1100') {
      //     setTable1100Rows(docData.tableData.rows);
      //   } else if (is1300Series && docData.tableData?.type === '1300') {
      //     setTable1300Rows(docData.tableData.rows);
      //   }
      //   // ... 다른 시리즈도 동일하게 처리
      //   return;
      // }

      // 목업 데이터 사용
      const parts = state.copyFrom.split('-');
      if (parts.length >= 3) {
        const copySafetyIdx = Number(parts[0]);
        const copyItemNumber = Number(parts[1]);
        const documentNumber = Number(parts[2]);
        const tableData = getTableDataByDocument(copySafetyIdx, copyItemNumber, documentNumber);

        if (tableData) {
          if (tableData.type === '1100' && is1100Series) {
            setTable1100Rows(tableData.rows as Table1100Row[]);
          } else if (tableData.type === '1300' && is1300Series) {
            setTable1300Rows(tableData.rows as Table1300Row[]);
          } else if (tableData.type === '1400' && is1400Series) {
            setTable1400Data(tableData.data as Table1400Data);
          } else if (tableData.type === '1500' && is1500Series) {
            setTable1500Rows(tableData.rows as Table1500Row[]);
          } else if (tableData.type === '2100' && is2100Series) {
            setTable2100Data(tableData.data as Table2100Data);
          } else if (tableData.type === '2200' && is2200Series) {
            setTable2200Rows(tableData.rows as Table2200Row[]);
          } else if (tableData.type === '2300' && is2300Series) {
            setTable2300Rows(tableData.rows as Table2300Row[]);
          } else if (tableData.type === '2400-tbm' && is2400TBM) {
            setTable2400TBMData(tableData.data as Table2400TBMData);
          } else if (tableData.type === '2400-education' && is2400Education) {
            setTable2400EducationRows(tableData.rows as Table2400EducationRow[]);
          }
        }
      }
    }
  }, [
    state?.copyFrom,
    is1100Series,
    is1300Series,
    is1400Series,
    is1500Series,
    is2100Series,
    is2200Series,
    is2300Series,
    is2400TBM,
    is2400Education,
  ]);

  // 2200번대 (위험요인 제거·대체 및 통제 등록) 핸들러
  const handleTable2200RowChange = useCallback(
    (index: number, field: keyof Table2200Row, value: string) => {
      setTable2200Rows((prev) => {
        const newRows = [...prev];
        newRows[index] = { ...newRows[index], [field]: value };
        return newRows;
      });
    },
    []
  );

  const handleTable2200RowDelete = useCallback((index: number) => {
    setTable2200Rows((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleTable2200RowMove = useCallback((fromIndex: number, toIndex: number) => {
    setTable2200Rows((prev) => {
      const newRows = [...prev];
      const [movedRow] = newRows.splice(fromIndex, 1);
      newRows.splice(toIndex, 0, movedRow);
      return newRows;
    });
  }, []);

  const handleTable2200AddRow = useCallback(() => {
    setTable2200Rows((prev) => [
      ...prev,
      {
        risk: '',
        removal: '',
        engineering: '',
        administrative: '',
        ppe: '',
      },
    ]);
  }, []);

  // 2300번대 (감소 대책 수립·이행) 핸들러
  const handleTable2300RowChange = useCallback(
    (index: number, field: keyof Table2300Row, value: any) => {
      setTable2300Rows((prev) => {
        const newRows = [...prev];
        newRows[index] = { ...newRows[index], [field]: value };
        return newRows;
      });
    },
    []
  );

  const handleTable2300RowDelete = useCallback((index: number) => {
    setTable2300Rows((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleTable2300RowMove = useCallback((fromIndex: number, toIndex: number) => {
    setTable2300Rows((prev) => {
      const newRows = [...prev];
      const [movedRow] = newRows.splice(fromIndex, 1);
      newRows.splice(toIndex, 0, movedRow);
      return newRows;
    });
  }, []);

  const handleTable2300AddRow = useCallback(() => {
    setTable2300Rows((prev) => [
      ...prev,
      {
        division: '',
        category: '',
        cause: '',
        hazard: '',
        reference: '',
        law: '',
        currentRisk: { value: 0, label: '' },
        reductionNo: '',
        reductionDetail: '',
        postRisk: { value: 0, label: '' },
        owner: '',
        dueDate: '',
        completedAt: '',
        done: false,
      },
    ]);
  }, []);

  // 2400번대 (TBM 일지) 핸들러
  const handleTable2400TBMDataChange = useCallback((data: Table2400TBMData) => {
    setTable2400TBMData(data);
  }, []);

  // 점검내용 테이블 핸들러
  const handleTable2400TBMInspectionRowChange = useCallback(
    (index: number, field: 'inspectionContent' | 'result', value: string) => {
      setTable2400TBMData((prev) => {
        const newRows = [...prev.inspectionRows];
        newRows[index] = { ...newRows[index], [field]: value };
        return { ...prev, inspectionRows: newRows };
      });
    },
    []
  );

  const handleTable2400TBMInspectionRowDelete = useCallback((index: number) => {
    setTable2400TBMData((prev) => ({
      ...prev,
      inspectionRows: prev.inspectionRows.filter((_, i) => i !== index),
    }));
  }, []);

  const handleTable2400TBMInspectionRowMove = useCallback((fromIndex: number, toIndex: number) => {
    setTable2400TBMData((prev) => {
      const newRows = [...prev.inspectionRows];
      const [movedRow] = newRows.splice(fromIndex, 1);
      newRows.splice(toIndex, 0, movedRow);
      return { ...prev, inspectionRows: newRows };
    });
  }, []);

  const handleTable2400TBMInspectionAddRow = useCallback(() => {
    setTable2400TBMData((prev) => ({
      ...prev,
      inspectionRows: [...prev.inspectionRows, { inspectionContent: '', result: '' }],
    }));
  }, []);

  // 교육내용 핸들러
  const handleTable2400TBMEducationContentChange = useCallback((value: string) => {
    setTable2400TBMData((prev) => ({ ...prev, educationContent: value }));
  }, []);

  // 교육영상 테이블 핸들러
  const handleTable2400TBMEducationVideoRowChange = useCallback(
    (
      index: number,
      field: 'participant' | 'educationVideo' | 'signature',
      value: InvestigationTeamMember | null | string
    ) => {
      setTable2400TBMData((prev) => {
        const newRows = [...prev.educationVideoRows];
        newRows[index] = { ...newRows[index], [field]: value };
        return { ...prev, educationVideoRows: newRows };
      });
    },
    []
  );

  const handleTable2400TBMEducationVideoRowDelete = useCallback((index: number) => {
    setTable2400TBMData((prev) => ({
      ...prev,
      educationVideoRows: prev.educationVideoRows.filter((_, i) => i !== index),
    }));
  }, []);

  const handleTable2400TBMEducationVideoRowMove = useCallback(
    (fromIndex: number, toIndex: number) => {
      setTable2400TBMData((prev) => {
        const newRows = [...prev.educationVideoRows];
        const [movedRow] = newRows.splice(fromIndex, 1);
        newRows.splice(toIndex, 0, movedRow);
        return { ...prev, educationVideoRows: newRows };
      });
    },
    []
  );

  const handleTable2400TBMEducationVideoAddRow = useCallback(() => {
    setTable2400TBMData((prev) => ({
      ...prev,
      educationVideoRows: [
        ...prev.educationVideoRows,
        {
          participant: null,
          educationVideo: '',
          signature: '',
        },
      ],
    }));
  }, []);

  // 2400번대 (연간 교육 계획) 핸들러
  const handleTable2400EducationRowChange = useCallback(
    (
      index: number,
      field: keyof Table2400EducationRow,
      value: string | boolean[] | number | '법정' | '자율'
    ) => {
      setTable2400EducationRows((prev) => {
        const newRows = [...prev];
        newRows[index] = { ...newRows[index], [field]: value };
        // 순번이 변경되면 자동으로 업데이트
        if (field === 'number') {
          newRows[index].number = typeof value === 'number' ? value : index + 1;
        }
        return newRows;
      });
    },
    []
  );

  const handleTable2400EducationRowDelete = useCallback((index: number) => {
    setTable2400EducationRows((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleTable2400EducationRowMove = useCallback((fromIndex: number, toIndex: number) => {
    setTable2400EducationRows((prev) => {
      const newRows = [...prev];
      const [movedRow] = newRows.splice(fromIndex, 1);
      newRows.splice(toIndex, 0, movedRow);
      return newRows;
    });
  }, []);

  const handleTable2400EducationAddRow = useCallback(() => {
    setTable2400EducationRows((prev) => [
      ...prev,
      {
        number: prev.length + 1,
        educationType: '법정',
        educationCourse: '',
        scheduleMonths: Array(12).fill(false),
        targetCount: '',
        educationMethod: '',
        remark: '',
      },
    ]);
  }, []);

  // 2400번대 (최저 교육시간) 핸들러
  const handleTable2400MinimumEducationRowChange = useCallback(
    (index: number, field: keyof Table2400MinimumEducationRow, value: string) => {
      setTable2400MinimumEducationRows((prev) => {
        const newRows = [...prev];
        newRows[index] = { ...newRows[index], [field]: value };
        return newRows;
      });
    },
    []
  );

  // 1100번대 (위험요인 파악) 핸들러
  const handleTable1100RowChange = useCallback(
    (index: number, field: keyof Table1100Row, value: string) => {
      setTable1100Rows((prev) => {
        const newRows = [...prev];
        newRows[index] = { ...newRows[index], [field]: value };
        return newRows;
      });
    },
    []
  );

  const handleTable1100RowDelete = useCallback((index: number) => {
    setTable1100Rows((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleTable1100RowMove = useCallback((fromIndex: number, toIndex: number) => {
    setTable1100Rows((prev) => {
      const newRows = [...prev];
      const [movedRow] = newRows.splice(fromIndex, 1);
      newRows.splice(toIndex, 0, movedRow);
      return newRows;
    });
  }, []);

  const handleTable1100AddRow = useCallback(() => {
    setTable1100Rows((prev) => [
      ...prev,
      {
        highRiskWork: '',
        disasterFactor: '',
        workplace: '',
        machineHazard: '',
        improvementNeeded: '',
        remark: '',
      },
    ]);
  }, []);

  // 1200번대 산업재해 작성 핸들러
  const handleTable1200RowChange = useCallback(
    (field: keyof Table1200IndustrialAccidentRow, value: any) => {
      setTable1200IndustrialAccidentRow((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const handleTable1200InvestigationTeamAdd = useCallback((member: InvestigationTeamMember) => {
    setTable1200IndustrialAccidentRow((prev) => ({
      ...prev,
      investigationTeam: [...prev.investigationTeam, member],
    }));
  }, []);

  const handleTable1200InvestigationTeamDelete = useCallback((index: number) => {
    setTable1200IndustrialAccidentRow((prev) => ({
      ...prev,
      investigationTeam: prev.investigationTeam.filter((_, i) => i !== index),
    }));
  }, []);

  const handleTable1200InvestigationTeamMove = useCallback((fromIndex: number, toIndex: number) => {
    setTable1200IndustrialAccidentRow((prev) => {
      const newTeam = [...prev.investigationTeam];
      const [movedMember] = newTeam.splice(fromIndex, 1);
      newTeam.splice(toIndex, 0, movedMember);
      return { ...prev, investigationTeam: newTeam };
    });
  }, []);

  const handleTable1200HumanDamageAdd = useCallback((damage: HumanDamage) => {
    setTable1200IndustrialAccidentRow((prev) => ({
      ...prev,
      humanDamage: [...prev.humanDamage, damage],
    }));
  }, []);

  const handleTable1200HumanDamageDelete = useCallback((index: number) => {
    setTable1200IndustrialAccidentRow((prev) => ({
      ...prev,
      humanDamage: prev.humanDamage.filter((_, i) => i !== index),
    }));
  }, []);

  const handleTable1200HumanDamageMove = useCallback((fromIndex: number, toIndex: number) => {
    setTable1200IndustrialAccidentRow((prev) => {
      const newDamage = [...prev.humanDamage];
      const [movedDamage] = newDamage.splice(fromIndex, 1);
      newDamage.splice(toIndex, 0, movedDamage);
      return { ...prev, humanDamage: newDamage };
    });
  }, []);

  const handleTable1200NearMissRowChange = useCallback(
    (field: keyof Table1200NearMissRow, value: any) => {
      setTable1200NearMissRow((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const handleSelectHighRiskWork = useCallback((index: number) => {
    // TODO: TanStack Query Hook(useQuery)으로 고위험작업 목록 조회
    // const { data: highRiskWorks } = useQuery({
    //   queryKey: ['highRiskWorks', industry],
    //   queryFn: () => getHighRiskWorks({ industry }),
    // });
    // 모달 열기 또는 선택 UI 표시
    console.log('고위험작업 선택', index);
  }, []);

  const handleSelectDisasterFactor = useCallback((index: number) => {
    // TODO: TanStack Query Hook(useQuery)으로 재해유발요인 목록 조회
    // const { data: disasterFactors } = useQuery({
    //   queryKey: ['disasterFactors', industry],
    //   queryFn: () => getDisasterFactors({ industry }),
    // });
    // 모달 열기 또는 선택 UI 표시
    console.log('재해유발요인 선택', index);
  }, []);

  // 1300번대 (위험 기계·기구·설비) 핸들러
  const handleTable1300RowChange = useCallback(
    (index: number, field: keyof Table1300Row, value: string | number) => {
      setTable1300Rows((prev) => {
        const newRows = [...prev];
        newRows[index] = { ...newRows[index], [field]: value };
        // 순번 자동 업데이트
        newRows.forEach((row, i) => {
          row.number = i + 1;
        });
        return newRows;
      });
    },
    []
  );

  const handleTable1300RowDelete = useCallback((index: number) => {
    setTable1300Rows((prev) => {
      const newRows = prev.filter((_, i) => i !== index);
      // 순번 재정렬
      newRows.forEach((row, i) => {
        row.number = i + 1;
      });
      return newRows;
    });
  }, []);

  const handleTable1300RowMove = useCallback((fromIndex: number, toIndex: number) => {
    setTable1300Rows((prev) => {
      const newRows = [...prev];
      const [movedRow] = newRows.splice(fromIndex, 1);
      newRows.splice(toIndex, 0, movedRow);
      // 순번 재정렬
      newRows.forEach((row, i) => {
        row.number = i + 1;
      });
      return newRows;
    });
  }, []);

  const handleTable1300AddRow = useCallback(() => {
    setTable1300Rows((prev) => [
      ...prev,
      {
        number: prev.length + 1,
        name: '',
        id: '',
        capacity: '',
        location: '',
        quantity: '',
        inspectionTarget: '',
        safetyDevice: '',
        inspectionCycle: '',
        accidentForm: '',
        remark: '',
      },
    ]);
  }, []);

  // 1400번대 (유해인자) 핸들러
  const handleTable1400DataChange = useCallback((data: Table1400Data) => {
    setTable1400Data(data);
  }, []);

  // 2100번대 (위험요인별 위험성 평가) 핸들러
  const handleTable2100DataChange = useCallback((data: Table2100Data) => {
    setTable2100Data(data);
  }, []);

  // 1500번대 (위험장소 및 작업형태별 위험요인) 핸들러
  const handleTable1500RowChange = useCallback(
    (index: number, field: keyof Table1500Row, value: string | number) => {
      setTable1500Rows((prev) => {
        const newRows = [...prev];
        newRows[index] = { ...newRows[index], [field]: value };
        return newRows;
      });
    },
    []
  );

  const handleTable1500RowDelete = useCallback((index: number) => {
    setTable1500Rows((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleTable1500RowMove = useCallback((fromIndex: number, toIndex: number) => {
    setTable1500Rows((prev) => {
      const newRows = [...prev];
      const [movedRow] = newRows.splice(fromIndex, 1);
      newRows.splice(toIndex, 0, movedRow);
      return newRows;
    });
  }, []);

  const handleTable1500AddRow = useCallback(() => {
    setTable1500Rows((prev) => [
      ...prev,
      {
        unit: '',
        work: '',
        hazardCode: '',
        machine: '',
        machineId: '',
        chemical: '',
        casNo: '',
        accidentForm: '',
        partner: '',
        freq: '',
        sev: '',
        evalLabel: '',
        remark: '',
      },
    ]);
  }, []);

  const handleSave = useCallback(() => {
    // TODO: TanStack Query Hook(useMutation)으로 문서 등록
    // const mutation = useMutation({
    //   mutationFn: (formData: Risk2200CreateParams) => createRisk2200Document(formData),
    //   onSuccess: () => {
    //     queryClient.invalidateQueries({ queryKey: ['risk2200Documents'] });
    //     // 리스트 페이지로 이동
    //   },
    // });
    // 등록 로직
    let data;
    if (is1100Series) {
      data = { documentDate, approvalDeadline, rows: table1100Rows };
    } else if (is1200IndustrialAccident) {
      // TODO: TanStack Query Hook(useMutation)으로 이미지 업로드
      // const imageUrls = await uploadImages(table1200IndustrialAccidentRow.investigationImages);
      // data = {
      //   documentDate,
      //   approvalDeadline,
      //   row: {
      //     ...table1200IndustrialAccidentRow,
      //     investigationImages: imageUrls,
      //   },
      // };
      data = { documentDate, approvalDeadline, row: table1200IndustrialAccidentRow };
    } else if (is1200NearMiss) {
      // TODO: TanStack Query Hook(useMutation)으로 아차사고 이미지 업로드
      data = { documentDate, approvalDeadline, row: table1200NearMissRow };
    } else if (is1300Series) {
      data = { documentDate, approvalDeadline, rows: table1300Rows };
    } else if (is1400Series) {
      data = { documentDate, approvalDeadline, data: table1400Data };
    } else if (is1500Series) {
      data = { documentDate, approvalDeadline, rows: table1500Rows };
    } else if (is2100Series) {
      data = { documentDate, approvalDeadline, data: table2100Data };
    } else if (is2200Series) {
      data = { documentDate, approvalDeadline, rows: table2200Rows };
    } else if (is2300Series) {
      data = { documentDate, approvalDeadline, rows: table2300Rows };
    } else if (is2400TBM) {
      data = { documentDate, approvalDeadline, data: table2400TBMData };
    } else if (is2400Education) {
      data = { documentDate, approvalDeadline, rows: table2400EducationRows };
    } else {
      data = { documentDate, approvalDeadline, rows: table1100Rows };
    }
    // mutation.mutate({ ...data, safetyIdx, itemNumber });
    console.log('등록:', data);
    if (safetyId) {
      // 리스트 페이지로 이동 시 system과 item 정보를 함께 전달하여 문서 타입별 필터링
      navigate(`/dashboard/safety-system/${safetyId}/risk-2200`, {
        state: { system: state?.system, item: state?.item },
      });
    } else {
      navigate(-1);
    }
  }, [
    documentDate,
    approvalDeadline,
    table1100Rows,
    table1200IndustrialAccidentRow,
    table1200NearMissRow,
    table1300Rows,
    table1400Data,
    table1500Rows,
    table2100Data,
    table2200Rows,
    table2300Rows,
    table2400TBMData,
    table2400EducationRows,
    is1100Series,
    is1200IndustrialAccident,
    is1200NearMiss,
    is1300Series,
    is1400Series,
    is1500Series,
    is2100Series,
    is2200Series,
    is2300Series,
    is2400TBM,
    is2400Education,
    navigate,
    safetyId,
    state?.system,
    state?.item,
  ]);

  const handleTemporarySave = useCallback(() => {
    // TODO: TanStack Query Hook(useMutation)으로 문서 임시 저장
    // const mutation = useMutation({
    //   mutationFn: (formData: Risk2200TemporarySaveParams) => temporarySaveRisk2200Document(formData),
    //   onSuccess: () => {
    //     // 임시 저장 성공 처리
    //   },
    // });
    // 임시 저장 로직
    let data;
    if (is1100Series) {
      data = { documentDate, approvalDeadline, rows: table1100Rows };
    } else if (is1200IndustrialAccident) {
      data = { documentDate, approvalDeadline, row: table1200IndustrialAccidentRow };
    } else if (is1200NearMiss) {
      data = { documentDate, approvalDeadline, row: table1200NearMissRow };
    } else if (is1300Series) {
      data = { documentDate, approvalDeadline, rows: table1300Rows };
    } else if (is1400Series) {
      data = { documentDate, approvalDeadline, data: table1400Data };
    } else if (is1500Series) {
      data = { documentDate, approvalDeadline, rows: table1500Rows };
    } else if (is2100Series) {
      data = { documentDate, approvalDeadline, data: table2100Data };
    } else if (is2200Series) {
      data = { documentDate, approvalDeadline, rows: table2200Rows };
    } else if (is2300Series) {
      data = { documentDate, approvalDeadline, rows: table2300Rows };
    } else if (is2400TBM) {
      data = { documentDate, approvalDeadline, data: table2400TBMData };
    } else if (is2400Education) {
      data = { documentDate, approvalDeadline, rows: table2400EducationRows };
    } else {
      data = { documentDate, approvalDeadline, rows: table1100Rows };
    }
    // mutation.mutate({ ...data, safetyIdx, itemNumber });
    console.log('임시 저장:', data);
  }, [
    documentDate,
    approvalDeadline,
    table1100Rows,
    table1200IndustrialAccidentRow,
    table1200NearMissRow,
    table1300Rows,
    table1400Data,
    table1500Rows,
    table2100Data,
    table2200Rows,
    table2300Rows,
    table2400TBMData,
    table2400EducationRows,
    is1100Series,
    is1200IndustrialAccident,
    is1200NearMiss,
    is1300Series,
    is1400Series,
    is1500Series,
    is2100Series,
    is2200Series,
    is2300Series,
    is2400TBM,
    is2400Education,
  ]);

  const handleCancel = useCallback(() => {
    if (safetyId) {
      // 리스트 페이지로 이동 시 system과 item 정보를 함께 전달
      navigate(`/dashboard/safety-system/${safetyId}/risk-2200`, {
        state: { system: state?.system, item: state?.item },
      });
    } else {
      navigate(-1);
    }
  }, [navigate, safetyId, state?.system, state?.item]);

  const handleBack = useCallback(() => {
    if (safetyId) {
      // 리스트 페이지로 이동 시 system과 item 정보를 함께 전달
      navigate(`/dashboard/safety-system/${safetyId}/risk-2200`, {
        state: { system: state?.system, item: state?.item },
      });
    } else {
      navigate(-1);
    }
  }, [navigate, safetyId, state?.system, state?.item]);

  const handleSampleView = useCallback(() => {
    // TODO: TanStack Query Hook(useQuery)으로 샘플 문서 조회
    // const { data: sampleDocument } = useQuery({
    //   queryKey: ['risk2200SampleDocument', safetyIdx, itemNumber],
    //   queryFn: () => getRisk2200SampleDocument({ safetyIdx, itemNumber }),
    //   enabled: !!safetyIdx && !!itemNumber,
    // });
    console.log('샘플 보기');
  }, []);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DashboardContent maxWidth="xl">
        <Box
          sx={[
            {
              display: 'flex',
              flexDirection: 'column',
              gap: 5,
              alignItems: 'center',
            },
            ...(Array.isArray(sx) ? sx : [sx]),
          ]}
        >
          <CreateHeader
            onBack={handleBack}
            onSampleView={handleSampleView}
            title={state?.item?.documentName || '문서 등록'}
          />

          {/* Main Card */}
          <Box
            component="div"
            sx={{
              bgcolor: 'background.paper',
              borderRadius: 2,
              boxShadow: 3,
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            {/* Document Info */}
            <DocumentInfo
              documentNumber={undefined} // TODO: 임시 저장된 문서의 문서번호 또는 등록 시 서버에서 받은 문서번호
              writerIp={undefined} // TODO: 클라이언트 IP 가져오기 또는 서버에서 받은 작성 IP
              documentDate={documentDate}
              approvalDeadline={approvalDeadline}
              onDocumentDateChange={setDocumentDate}
              onApprovalDeadlineChange={setApprovalDeadline}
            />

            {/* Document Title */}
            <Box
              sx={{
                width: '100%',
                pb: 5,
                pt: 5,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Typography
                variant="h3"
                sx={{
                  fontSize: 32,
                  fontWeight: 700,
                  lineHeight: '48px',
                  color: 'text.primary',
                }}
              >
                {is1100Series
                  ? '위험요인 파악'
                  : is1200IndustrialAccident
                    ? '사고조사 보고서'
                    : is1200NearMiss
                      ? '아차 사고 조사표'
                      : is1300Series
                        ? '위험 기계·기구·설비'
                        : is1400Series
                          ? '유해인자'
                          : is1500Series
                            ? '위험장소 및 작업형태별 위험요인'
                            : is2100Series
                              ? '위험요인별 위험성 평가'
                              : is2200Series
                                ? '위험요인 제거·대체 및 통제 등록'
                                : is2300Series
                                  ? '종합대책 수립·이행'
                                  : is2400TBM
                                    ? 'Tool Box Meeting 일지'
                                    : is2400Education
                                      ? '연간 교육 계획'
                                      : state?.item?.documentName || '위험요인 파악'}
              </Typography>
            </Box>

            <Box sx={{ width: '100%' }}>
              {/* Document Form - 타입별로 다른 폼 렌더링 */}
              {is1100Series ? (
                <Table1100Form
                  rows={table1100Rows}
                  onRowChange={handleTable1100RowChange}
                  onRowDelete={handleTable1100RowDelete}
                  onRowMove={handleTable1100RowMove}
                  onAddRow={handleTable1100AddRow}
                  onSelectHighRiskWork={handleSelectHighRiskWork}
                  onSelectDisasterFactor={handleSelectDisasterFactor}
                />
              ) : is1200IndustrialAccident ? (
                <Table1200IndustrialAccidentForm
                  row={table1200IndustrialAccidentRow}
                  onRowChange={handleTable1200RowChange}
                  onInvestigationTeamAdd={handleTable1200InvestigationTeamAdd}
                  onInvestigationTeamDelete={handleTable1200InvestigationTeamDelete}
                  onInvestigationTeamMove={handleTable1200InvestigationTeamMove}
                  onHumanDamageAdd={handleTable1200HumanDamageAdd}
                  onHumanDamageDelete={handleTable1200HumanDamageDelete}
                  onHumanDamageMove={handleTable1200HumanDamageMove}
                />
              ) : is1200NearMiss ? (
                <Table1200NearMissForm
                  row={table1200NearMissRow}
                  onRowChange={handleTable1200NearMissRowChange}
                />
              ) : is1300Series ? (
                <Table1300Form
                  rows={table1300Rows}
                  onRowChange={handleTable1300RowChange}
                  onRowDelete={handleTable1300RowDelete}
                  onRowMove={handleTable1300RowMove}
                  onAddRow={handleTable1300AddRow}
                />
              ) : is1400Series ? (
                <Table1400Form data={table1400Data} onDataChange={handleTable1400DataChange} />
              ) : is1500Series ? (
                <Table1500Form
                  rows={table1500Rows}
                  onRowChange={handleTable1500RowChange}
                  onRowDelete={handleTable1500RowDelete}
                  onRowMove={handleTable1500RowMove}
                  onAddRow={handleTable1500AddRow}
                />
              ) : is2100Series ? (
                <Table2100Form
                  data={table2100Data}
                  onDataChange={handleTable2100DataChange}
                  riskAssessmentData={riskAssessmentData}
                />
              ) : is2200Series ? (
                <Table2200Form
                  rows={table2200Rows}
                  onRowChange={handleTable2200RowChange}
                  onRowDelete={handleTable2200RowDelete}
                  onRowMove={handleTable2200RowMove}
                  onAddRow={handleTable2200AddRow}
                />
              ) : is2300Series ? (
                <Table2300Form
                  rows={table2300Rows}
                  onRowChange={handleTable2300RowChange}
                  onRowDelete={handleTable2300RowDelete}
                  onRowMove={handleTable2300RowMove}
                  onAddRow={handleTable2300AddRow}
                  riskAssessmentData={riskAssessmentData}
                />
              ) : is2400TBM ? (
                <Table2400TBMForm
                  data={table2400TBMData}
                  onDataChange={handleTable2400TBMDataChange}
                  onInspectionRowChange={handleTable2400TBMInspectionRowChange}
                  onInspectionRowDelete={handleTable2400TBMInspectionRowDelete}
                  onInspectionRowMove={handleTable2400TBMInspectionRowMove}
                  onInspectionAddRow={handleTable2400TBMInspectionAddRow}
                  onEducationContentChange={handleTable2400TBMEducationContentChange}
                  onEducationVideoRowChange={handleTable2400TBMEducationVideoRowChange}
                  onEducationVideoRowDelete={handleTable2400TBMEducationVideoRowDelete}
                  onEducationVideoRowMove={handleTable2400TBMEducationVideoRowMove}
                  onEducationVideoAddRow={handleTable2400TBMEducationVideoAddRow}
                />
              ) : is2400Education ? (
                <Table2400EducationForm
                  rows={table2400EducationRows}
                  onRowChange={handleTable2400EducationRowChange}
                  onRowDelete={handleTable2400EducationRowDelete}
                  onRowMove={handleTable2400EducationRowMove}
                  onAddRow={handleTable2400EducationAddRow}
                  minimumEducationRows={table2400MinimumEducationRows}
                  onMinimumEducationRowChange={handleTable2400MinimumEducationRowChange}
                />
              ) : null}
            </Box>
          </Box>

          <FooterButtons
            onSave={handleSave}
            onTemporarySave={handleTemporarySave}
            onCancel={handleCancel}
          />
        </Box>

        {/* 위험성 평가 설정 모달 (2100번대용) */}
        {is2100Series && (
          <RiskAssessmentSettingModal
            open={riskAssessmentModalOpen}
            onClose={() => setRiskAssessmentModalOpen(false)}
            onSave={handleRiskAssessmentSave}
            initialData={riskAssessmentData}
          />
        )}
      </DashboardContent>
    </LocalizationProvider>
  );
}
