import type { Theme, SxProps } from '@mui/material/styles';
import { useState, useCallback, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import dayjs, { type Dayjs } from 'dayjs';

import { CONFIG } from 'src/global-config';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { DashboardContent } from 'src/layouts/dashboard';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import type { SafetySystem } from 'src/_mock/_safety-system';
import type { SafetySystemItem } from 'src/services/safety-system/safety-system.types';
import type { OriginalDocument } from 'src/services/dashboard/dashboard.types';
import { getTableDataByDocument, FIXED_MINIMUM_EDUCATION_ROWS } from 'src/_mock/_safety-system';
import {
  createSafetySystemDocument,
  getRiskAssessmentCriteria,
} from 'src/services/safety-system/safety-system.service';
import { useMyInfo } from 'src/sections/Chat/hooks/use-my-info';
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
  Table2400TBMEducationMethod,
  Table2400TBMEducationVideoRow,
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
  convertApiResponseToRiskAssessmentData,
} from '../components/RiskAssessmentSettingModal';
import SampleViewModal, { parseSampleUrls } from '../components/SampleViewModal';

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
  const queryClient = useQueryClient();
  const { data: myInfoData } = useMyInfo();
  const state = location.state as
    | {
        system: SafetySystem;
        item?: SafetySystemItem;
        isGuide?: boolean;
        documentId?: string;
        copyFrom?: string; // 복사할 문서 ID
        documentData?: OriginalDocument | any; // 복사할 문서 데이터 (API 연동 시) 또는 위험보고에서 전달된 메타정보
        documentType?: 'industrial-accident' | 'near-miss' | 'tbm' | 'education'; // 1200번대, 2400번대 문서 타입
      }
    | undefined;

  const resolvedDocumentType = useMemo(() => {
    if (state?.documentType) return state.documentType;
    const rawTableData = state?.documentData?.tableData;
    if (!rawTableData) return undefined;

    try {
      const parsed = typeof rawTableData === 'string' ? JSON.parse(rawTableData) : rawTableData;
      switch (parsed?.tableType) {
        case '1200-industrial':
          return 'industrial-accident';
        case '1200-near-miss':
          return 'near-miss';
        case '2400-tbm':
          return 'tbm';
        case '2400-education':
          return 'education';
        default:
          return undefined;
      }
    } catch (error) {
      console.error('documentType 추론 실패:', error);
      return undefined;
    }
  }, [state?.documentType, state?.documentData?.tableData]);

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
  const is1200IndustrialAccident = is1200Series && resolvedDocumentType === 'industrial-accident'; // 산업재해 작성
  const is1200NearMiss = is1200Series && resolvedDocumentType === 'near-miss'; // 아차사고 작성
  const is1300Series = safetyIdx === 1 && itemNumber === 3; // 1300번대: 위험 기계·기구·설비
  const is1400Series = safetyIdx === 1 && itemNumber === 4; // 1400번대: 유해인자
  const is1500Series = safetyIdx === 1 && itemNumber === 5; // 1500번대: 위험장소 및 작업형태별 위험요인
  const is2100Series = safetyIdx === 2 && itemNumber === 1; // 2100번대: 위험요인별 위험성 평가
  const is2200Series = safetyIdx === 2 && itemNumber === 2; // 2200번대: 위험요인 제거·대체 및 통제 등록
  const is2300Series = safetyIdx === 2 && itemNumber === 3; // 2300번대: 감소 대책 수립·이행
  const is2400Series = safetyIdx === 2 && itemNumber === 4; // 2400번대: 교육훈련
  const is2400TBM = is2400Series && resolvedDocumentType === 'tbm'; // TBM 일지 작성
  const is2400Education = is2400Series && resolvedDocumentType === 'education'; // 연간 교육 계획 작성

  const [documentWrittenAt, setDocumentWrittenAt] = useState<Dayjs | null>(dayjs());
  const [approvalDeadline, setApprovalDeadline] = useState<Dayjs | null>(dayjs().add(1, 'month'));

  // 문서 작성일 변경 핸들러 (결재 마감일 자동 업데이트)
  const handleDocumentWrittenAtChange = useCallback((date: Dayjs | null) => {
    setDocumentWrittenAt(date);
    // 문서 작성일 변경 시 결재 마감일을 한 달 뒤로 자동 설정
    if (date) {
      setApprovalDeadline(date.add(1, 'month'));
    }
  }, []);
  const [safetySystemDocumentIdx, setSafetySystemDocumentIdx] = useState<number | undefined>(
    undefined
  );
  const [table1100Rows, setTable1100Rows] = useState<Table1100Row[]>(initialTable1100Rows);
  const [table1200IndustrialAccidentRow, setTable1200IndustrialAccidentRow] =
    useState<Table1200IndustrialAccidentRow>({
      accidentName: '',
      accidentDate: '',
      accidentTime: '',
      accidentLocation: '',
      accidentType: '',
      investigationTeam: [{ department: '', name: '' }],
      humanDamage: [{ department: '', name: '', position: '', injury: '' }],
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
      { inspectionContent: '기계·기구·설비 이상 유무', result: '' },
      { inspectionContent: '기계·기구·설비 방호장치', result: '' },
      { inspectionContent: '근로자 건강 상태', result: '' },
      { inspectionContent: '개인보호구 착용 여부', result: '' },
      { inspectionContent: '작업절차 및 방법 숙지', result: '' },
      { inspectionContent: '작업장 정리/정돈, 통보 확보', result: '' },
      { inspectionContent: '점검결과 조치사항', result: '' },
    ],
    educationApply: 0,
    educationMethod: 'ONLINE',
    educationType: 'MANDATORY',
    educationTimeMinutes: undefined,
    educationContent: '',
    educationVideoRows: [
      {
        participant: null,
        educationVideo: '',
        signature: '',
      },
    ],
  });

  const normalizeTbmEducationMethod = (method?: Table2400TBMEducationMethod) => {
    if (method === 'IN_PERSON') return 'OFFLINE';
    if (method === 'VIDEO') return 'ONLINE';
    return method ?? 'ONLINE';
  };
  const [table2400EducationRows, setTable2400EducationRows] = useState<Table2400EducationRow[]>([
    {
      number: 1,
      educationType: undefined,
      educationCourse: '근로자 정기 안전보건교육',
      scheduleMonths: Array(12).fill(false),
      targetCount: '',
      educationMethod: '',
      remark: '',
    },
    {
      number: 2,
      educationType: undefined,
      educationCourse: '신규 채용 시 안전보건교육',
      scheduleMonths: Array(12).fill(false),
      targetCount: '',
      educationMethod: '',
      remark: '',
    },
    {
      number: 3,
      educationType: undefined,
      educationCourse: '관리감독자 안전보건교육',
      scheduleMonths: Array(12).fill(false),
      targetCount: '',
      educationMethod: '',
      remark: '',
    },
    {
      number: 4,
      educationType: undefined,
      educationCourse: '특별안전보건 교육',
      scheduleMonths: Array(12).fill(false),
      targetCount: '',
      educationMethod: '',
      remark: '',
    },
    {
      number: 5,
      educationType: undefined,
      educationCourse: '비상사태대비 교육 및 훈련',
      scheduleMonths: Array(12).fill(false),
      targetCount: '',
      educationMethod: '',
      remark: '',
    },
    {
      number: 6,
      educationType: undefined,
      educationCourse: '물질안전보건 교육',
      scheduleMonths: Array(12).fill(false),
      targetCount: '',
      educationMethod: '',
      remark: '',
    },
    {
      number: 7,
      educationType: undefined,
      educationCourse: '공정위험성 평가 교육',
      scheduleMonths: Array(12).fill(false),
      targetCount: '',
      educationMethod: '',
      remark: '',
    },
    {
      number: 8,
      educationType: undefined,
      educationCourse: '작업내용 변경자 교육',
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

  // 위험성 평가 기준 조회
  const { data: riskAssessmentCriteriaData } = useQuery({
    queryKey: ['riskAssessmentCriteria'],
    queryFn: () => getRiskAssessmentCriteria(),
    staleTime: 5 * 60 * 1000, // 5분
  });

  // API 데이터를 RiskAssessmentData로 변환
  const apiRiskAssessmentData = useMemo(() => {
    if (riskAssessmentCriteriaData) {
      return convertApiResponseToRiskAssessmentData(riskAssessmentCriteriaData);
    }
    return null;
  }, [riskAssessmentCriteriaData]);

  // API 데이터가 있으면 우선 사용, 없으면 기본값 또는 문서 데이터 사용
  useEffect(() => {
    if (apiRiskAssessmentData) {
      setRiskAssessmentData(apiRiskAssessmentData);
    }
  }, [apiRiskAssessmentData]);

  const handleRiskAssessmentSave = (data: RiskAssessmentData) => {
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

  // 위험보고에서 전달된 메타정보로 초기값 설정
  useEffect(() => {
    if (state?.documentData && !state?.copyFrom) {
      const metaData = state.documentData;

      // 아차사고 (near-miss)인 경우
      if (is1200NearMiss && metaData) {
        setTable1200NearMissRow({
          workName: metaData.workName || '',
          grade: metaData.grade || 'A',
          reporter: metaData.reporter || '',
          reporterDepartment: metaData.reporterDepartment || '',
          workContent: metaData.workContent || '',
          accidentContent: metaData.accidentContent || '',
          accidentRiskLevel: metaData.accidentRiskLevel || 'A',
          accidentCause: metaData.accidentCause || '',
          preventionMeasure: metaData.preventionMeasure || '',
          preventionRiskLevel: metaData.preventionRiskLevel || 'A',
          siteSituation: metaData.siteSituation || '',
          siteImages: metaData.siteImages || [],
        });
      }

      // 산업재해 (industrial-accident)인 경우
      if (is1200IndustrialAccident && metaData) {
        setTable1200IndustrialAccidentRow({
          accidentName: metaData.accidentName || '',
          accidentDate: metaData.accidentDate || '',
          accidentTime: metaData.accidentTime || '',
          accidentLocation: metaData.accidentLocation || '',
          accidentType: metaData.accidentType || '',
          investigationTeam: metaData.investigationTeam || [{ department: '', name: '' }],
          humanDamage: metaData.humanDamage || [
            { department: '', name: '', position: '', injury: '' },
          ],
          materialDamage: metaData.materialDamage || '',
          accidentContent: metaData.accidentContent || '',
          riskAssessmentBefore: metaData.riskAssessmentBefore || {
            possibility: '',
            severity: '',
            risk: '',
          },
          accidentCause: metaData.accidentCause || '',
          doctorOpinion: metaData.doctorOpinion || '',
          preventionMeasure: metaData.preventionMeasure || '',
          riskAssessmentAfter: metaData.riskAssessmentAfter || {
            possibility: '',
            severity: '',
            risk: '',
          },
          otherContent: metaData.otherContent || '',
          investigationImages: metaData.investigationImages || [],
        });
      }
    }
  }, [state?.documentData, state?.copyFrom, is1200NearMiss, is1200IndustrialAccident]);

  // 복사된 문서 데이터 로드
  useEffect(() => {
    if (state?.copyFrom && state?.documentData) {
      const docData = state.documentData as OriginalDocument;

      // 문서 작성일 설정 (documentWrittenAt 우선, 없으면 createAt 사용)
      const documentWrittenAtDate =
        (docData as any).documentWrittenAt ||
        (docData as any).writtenAt ||
        (docData as any).documentDate ||
        docData.createAt;
      if (documentWrittenAtDate) {
        const dateStr =
          typeof documentWrittenAtDate === 'string'
            ? documentWrittenAtDate
            : new Date(documentWrittenAtDate).toISOString();
        setDocumentWrittenAt(dayjs(dateStr.split('T')[0]));
        // 복사된 문서의 작성일 기준으로 결재 마감일도 한 달 뒤로 설정
        const writtenAtDate = dayjs(dateStr.split('T')[0]);
        if (docData.approvalDeadline) {
          // 복사된 문서에 결재 마감일이 있으면 그대로 사용
          setApprovalDeadline(dayjs(docData.approvalDeadline));
        } else {
          // 없으면 작성일 기준으로 한 달 뒤로 설정
          setApprovalDeadline(writtenAtDate.add(1, 'month'));
        }
      }

      // 결재 마감일 설정
      if (docData.approvalDeadline) {
        setApprovalDeadline(dayjs(docData.approvalDeadline));
      }

      // tableData 파싱 및 설정
      let parsedTableData: any = null;
      if (docData.tableData) {
        try {
          parsedTableData =
            typeof docData.tableData === 'string'
              ? JSON.parse(docData.tableData)
              : docData.tableData;
        } catch (error) {
          console.error('tableData 파싱 실패:', error);
        }
      }

      if (parsedTableData) {
        const tableType = parsedTableData.tableType;

        // tableType에 따라 데이터 설정 (복사 시에는 tableType만 확인)
        if (tableType === '1100' && parsedTableData.rows) {
          setTable1100Rows(parsedTableData.rows as Table1100Row[]);
        } else if (tableType === '1300' && parsedTableData.rows) {
          setTable1300Rows(parsedTableData.rows as Table1300Row[]);
        } else if (tableType === '1400' && parsedTableData.data) {
          setTable1400Data(parsedTableData.data as Table1400Data);
        } else if (tableType === '1500' && parsedTableData.rows) {
          setTable1500Rows(parsedTableData.rows as Table1500Row[]);
        } else if (tableType === '2100' && parsedTableData.data) {
          setTable2100Data(parsedTableData.data as Table2100Data);
          // riskAssessmentData가 있으면 설정
          if (parsedTableData.riskAssessmentData) {
            setRiskAssessmentData(parsedTableData.riskAssessmentData as RiskAssessmentData);
          }
        } else if (tableType === '2200' && parsedTableData.rows) {
          setTable2200Rows(parsedTableData.rows as Table2200Row[]);
        } else if (tableType === '2300' && parsedTableData.rows) {
          setTable2300Rows(parsedTableData.rows as Table2300Row[]);
        } else if (tableType === '1200-industrial' && parsedTableData.row) {
          setTable1200IndustrialAccidentRow(parsedTableData.row as Table1200IndustrialAccidentRow);
        } else if (tableType === '1200-near-miss' && parsedTableData.row) {
          setTable1200NearMissRow(parsedTableData.row as Table1200NearMissRow);
        } else if (tableType === '2400-tbm' && parsedTableData.data) {
          setTable2400TBMData((prev) => {
            const raw = parsedTableData.data as Table2400TBMData;
            return {
              ...prev,
              ...raw,
              educationApply: raw.educationApply === 1 ? 1 : prev.educationApply ?? 0,
              educationMethod: normalizeTbmEducationMethod(raw.educationMethod),
              educationType: raw.educationType ?? prev.educationType,
              educationTimeMinutes: raw.educationTimeMinutes ?? prev.educationTimeMinutes,
              educationContent: raw.educationContent ?? prev.educationContent,
              educationVideoRows: raw.educationVideoRows ?? prev.educationVideoRows,
              inspectionRows: raw.inspectionRows ?? prev.inspectionRows,
            };
          });
        } else if (tableType === '2400-education') {
          if (parsedTableData.rows) {
            setTable2400EducationRows(parsedTableData.rows as Table2400EducationRow[]);
          }
          if (parsedTableData.minimumEducationRows) {
            setTable2400MinimumEducationRows(parsedTableData.minimumEducationRows);
          }
        }
      } else {
        // API 데이터가 없으면 목업 데이터 사용 (fallback)
        const parts = state.copyFrom.split('-');
        if (parts.length >= 3) {
          const copySafetyIdx = Number(parts[0]);
          const copyItemNumber = Number(parts[1]);
          const documentNumber = Number(parts[2]);
          const tableData = getTableDataByDocument(copySafetyIdx, copyItemNumber, documentNumber);

          if (tableData) {
            // 목업 데이터도 tableType만으로 판단
            if (tableData.type === '1100') {
              setTable1100Rows(tableData.rows as Table1100Row[]);
            } else if (tableData.type === '1300') {
              setTable1300Rows(tableData.rows as Table1300Row[]);
            } else if (tableData.type === '1400') {
              setTable1400Data(tableData.data as Table1400Data);
            } else if (tableData.type === '1500') {
              setTable1500Rows(tableData.rows as Table1500Row[]);
            } else if (tableData.type === '2100') {
              setTable2100Data(tableData.data as Table2100Data);
            } else if (tableData.type === '2200') {
              setTable2200Rows(tableData.rows as Table2200Row[]);
            } else if (tableData.type === '2300') {
              setTable2300Rows(tableData.rows as Table2300Row[]);
            } else if (tableData.type === '1200-industrial' && (tableData as any).rows?.[0]) {
              setTable1200IndustrialAccidentRow(
                (tableData as any).rows[0] as Table1200IndustrialAccidentRow
              );
            } else if (tableData.type === '1200-near-miss' && (tableData as any).rows?.[0]) {
              setTable1200NearMissRow((tableData as any).rows[0] as Table1200NearMissRow);
            } else if (tableData.type === '2400-tbm') {
              setTable2400TBMData((prev) => {
                const raw = tableData.data as Table2400TBMData;
                return {
                  ...prev,
                  ...raw,
                  educationApply: raw.educationApply === 1 ? 1 : prev.educationApply ?? 0,
                  educationMethod: normalizeTbmEducationMethod(raw.educationMethod),
                  educationType: raw.educationType ?? prev.educationType,
                  educationTimeMinutes: raw.educationTimeMinutes ?? prev.educationTimeMinutes,
                  educationContent: raw.educationContent ?? prev.educationContent,
                  educationVideoRows: raw.educationVideoRows ?? prev.educationVideoRows,
                  inspectionRows: raw.inspectionRows ?? prev.inspectionRows,
                };
              });
            } else if (tableData.type === '2400-education') {
              setTable2400EducationRows(tableData.rows as Table2400EducationRow[]);
            }
          }
        }
      }
    }
  }, [state?.copyFrom, state?.documentData]);

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
  const handleTable2400TBMDataChange = useCallback(
    (data: Table2400TBMData | ((prev: Table2400TBMData) => Table2400TBMData)) => {
      if (typeof data === 'function') {
        setTable2400TBMData(data);
      } else {
        setTable2400TBMData(data);
      }
    },
    []
  );

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
      field: keyof Table2400TBMEducationVideoRow,
      value: any
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
          evidenceFileName: undefined,
          evidenceFileUrl: undefined,
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

  const handleTable1100InsertRows = useCallback((index: number, newRows: Table1100Row[]) => {
    setTable1100Rows((prev) => {
      const updatedRows = [...prev];
      updatedRows.splice(index + 1, 0, ...newRows);
      return updatedRows;
    });
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

  // 문서 등록 Mutation
  const createDocumentMutation = useMutation({
    mutationFn: createSafetySystemDocument,
    onSuccess: (response) => {
      // 응답에서 safetySystemDocumentIdx 추출
      // axios 인터셉터가 평탄화하므로 직접 접근
      // CreateSafetySystemDocumentResponseDto는 BaseResponseDto<SafetySystemDocument>이므로
      // 평탄화 후에는 SafetySystemDocument의 속성에 직접 접근 가능
      const documentIdx =
        (response as any)?.safetySystemDocumentIdx ||
        (response as any)?.data?.safetySystemDocumentIdx ||
        (response as any)?.body?.data?.safetySystemDocumentIdx;

      if (documentIdx) {
        setSafetySystemDocumentIdx(documentIdx);
      }

      // 알림 쿼리 무효화 (문서 생성 시 근로자 등록 후 알림 자동 발송됨)
      queryClient.invalidateQueries({ queryKey: ['notificationHistory'] });
      // 서명 대기 문서 목록 갱신 (대시보드)
      queryClient.invalidateQueries({ queryKey: ['pendingSignatures'] });

      // 아이템 상세 정보 쿼리 무효화하여 문서 목록 갱신
      if (state?.item?.safetySystemItemIdx) {
        queryClient.invalidateQueries({
          queryKey: ['safety-system-item', state.item.safetySystemItemIdx],
        });
      }
      // 리스트 페이지로 이동
      if (safetyId) {
        navigate(`/dashboard/safety-system/${safetyId}/risk-2200`, {
          state: { system: state?.system, item: state?.item },
        });
      } else {
        navigate(-1);
      }
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.header?.resultMessage ||
        error?.message ||
        '문서 등록에 실패했습니다.';
      console.error('문서 등록 실패:', errorMessage);
      alert(errorMessage); // TODO: Snackbar로 교체
    },
  });

  const handleSave = useCallback(() => {
    // 필수 값 검증
    if (!state?.item?.safetySystemItemIdx) {
      alert('아이템 정보가 없습니다.'); // TODO: Snackbar로 교체
      return;
    }

    // 테이블 데이터 구성 및 documentName 생성
    let tableData: any;
    let documentName: string;

    // safetyIdx와 itemNumber로 문서명 생성 (예: "1-1 위험요인파악")
    const documentPrefix = `${safetyIdx}-${itemNumber}`;

    if (is1100Series) {
      tableData = { tableType: '1100', rows: table1100Rows };
      documentName = `${documentPrefix}. 위험요인 파악`;
    } else if (is1200IndustrialAccident) {
      tableData = { tableType: '1200-industrial', row: table1200IndustrialAccidentRow };
      documentName = `${documentPrefix}. 사고조사 보고서`;
    } else if (is1200NearMiss) {
      tableData = { tableType: '1200-near-miss', row: table1200NearMissRow };
      documentName = `${documentPrefix}. 아차사고 조사표`;
    } else if (is1300Series) {
      tableData = { tableType: '1300', rows: table1300Rows };
      documentName = `${documentPrefix}. 위험 기계·기구·설비`;
    } else if (is1400Series) {
      tableData = { tableType: '1400', data: table1400Data };
      documentName = `${documentPrefix}. 유해인자`;
    } else if (is1500Series) {
      tableData = { tableType: '1500', rows: table1500Rows };
      documentName = `${documentPrefix}. 위험장소 및 작업형태별 위험요인`;
    } else if (is2100Series) {
      tableData = { tableType: '2100', data: table2100Data, riskAssessmentData };
      documentName = `${documentPrefix}. 위험요인별 위험성 평가`;
    } else if (is2200Series) {
      tableData = { tableType: '2200', rows: table2200Rows };
      documentName = `${documentPrefix}. 위험요인 제거·대체 및 통제`;
    } else if (is2300Series) {
      tableData = { tableType: '2300', rows: table2300Rows };
      documentName = `${documentPrefix}. 감소 대책 수립·이행`;
    } else if (is2400TBM) {
      tableData = { tableType: '2400-tbm', data: table2400TBMData };
      documentName = `${documentPrefix}. Tool Box Meeting 일지`;
    } else if (is2400Education) {
      tableData = {
        tableType: '2400-education',
        rows: table2400EducationRows,
        minimumEducationRows: table2400MinimumEducationRows,
      };
      documentName = `${documentPrefix}. 연간 교육 계획`;
    } else {
      tableData = { tableType: '1100', rows: table1100Rows };
      documentName = `${documentPrefix} ${state.item?.itemName || '문서'}`;
    }

    // organizationName 가져오기 (memberCompanyInformation.companyName)
    const organizationName =
      (myInfoData as any)?.memberCompanyInformation?.companyName ||
      (myInfoData as any)?.companyName ||
      '이편한자동화기술'; // 기본값

    // 2400TBM 문서인 경우 근로자 목록 수집
    let workerList: Array<{ targetMemberIdx: number; vodIdx?: number }> | undefined;
    if (is2400TBM) {
      workerList = table2400TBMData.educationVideoRows
        .filter(
          (row) => row.participant?.memberIdx && row.vodIdx // 대상자가 선택되어 있고 // 교육영상이 선택되어 있는 경우
        )
        .map((row) => ({
          targetMemberIdx: row.participant!.memberIdx!,
          vodIdx: row.vodIdx,
        }));

      if (import.meta.env.DEV) {
        console.log('📋 [Risk2200CreateView] 문서 생성 시 근로자 목록 수집:', {
          workerList,
          educationVideoRows: table2400TBMData.educationVideoRows,
        });
      }

      // 근로자 목록이 비어있으면 undefined로 설정 (API에 전송하지 않음)
      if (workerList.length === 0) {
        workerList = undefined;
      }
    }

    // approvalStep 설정: 1200번대 산업재해/아차사고는 기본값 3 (작성+검토+승인)
    let approvalStep: number | undefined;
    if (is1200IndustrialAccident || is1200NearMiss) {
      approvalStep = 3; // 작성+검토+승인
    }

    // API 요청 데이터 구성
    const requestData: any = {
      safetySystemItemIdx: state.item.safetySystemItemIdx,
      organizationName,
      documentName,
      documentWrittenAt: documentWrittenAt ? documentWrittenAt.format('YYYY-MM-DD') : undefined,
      tableData: JSON.stringify(tableData),
      // approvalDeadline은 API 스펙에 없으므로 제외 (나중에 수정 API로 업데이트 가능)
    };

    if (is2400TBM) {
      const normalizedMethod = normalizeTbmEducationMethod(table2400TBMData.educationMethod);
      requestData.educationType = table2400TBMData.educationType;
      requestData.educationMethod = normalizedMethod;
      if (normalizedMethod === 'OFFLINE') {
        requestData.educationTimeMinutes = table2400TBMData.educationTimeMinutes ?? undefined;
      }
    }

    // approvalStep이 있으면 추가
    if (approvalStep !== undefined) {
      requestData.approvalStep = approvalStep;
    }

    // 근로자 목록이 있으면 추가
    if (workerList && workerList.length > 0) {
      requestData.workerList = workerList;
    }

    if (import.meta.env.DEV) {
      console.log('📤 [Risk2200CreateView] 문서 생성 요청 데이터:', {
        ...requestData,
        tableData: '[JSON string]', // tableData는 너무 길 수 있으므로 표시만
        workerListCount: workerList?.length || 0,
      });
    }

    createDocumentMutation.mutate(requestData);
  }, [
    state,
    safetyIdx,
    itemNumber,
    documentWrittenAt,
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
    myInfoData,
    table2400EducationRows,
    riskAssessmentData,
    table2400MinimumEducationRows,
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
    createDocumentMutation,
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
      data = { documentDate: documentWrittenAt, approvalDeadline, rows: table1100Rows };
    } else if (is1200IndustrialAccident) {
      data = {
        documentDate: documentWrittenAt,
        approvalDeadline,
        row: table1200IndustrialAccidentRow,
      };
    } else if (is1200NearMiss) {
      data = { documentDate: documentWrittenAt, approvalDeadline, row: table1200NearMissRow };
    } else if (is1300Series) {
      data = { documentDate: documentWrittenAt, approvalDeadline, rows: table1300Rows };
    } else if (is1400Series) {
      data = { documentDate: documentWrittenAt, approvalDeadline, data: table1400Data };
    } else if (is1500Series) {
      data = { documentDate: documentWrittenAt, approvalDeadline, rows: table1500Rows };
    } else if (is2100Series) {
      data = { documentDate: documentWrittenAt, approvalDeadline, data: table2100Data };
    } else if (is2200Series) {
      data = { documentDate: documentWrittenAt, approvalDeadline, rows: table2200Rows };
    } else if (is2300Series) {
      data = { documentDate: documentWrittenAt, approvalDeadline, rows: table2300Rows };
    } else if (is2400TBM) {
      data = { documentDate: documentWrittenAt, approvalDeadline, data: table2400TBMData };
    } else if (is2400Education) {
      data = { documentDate: documentWrittenAt, approvalDeadline, rows: table2400EducationRows };
    } else {
      data = { documentDate: documentWrittenAt, approvalDeadline, rows: table1100Rows };
    }
    // mutation.mutate({ ...data, safetyIdx, itemNumber });
    console.log('임시 저장:', data);
  }, [
    documentWrittenAt,
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

  // 파일 URL을 전체 URL로 변환
  const getFullFileUrl = useCallback((url: string | null | undefined): string | null => {
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    const baseUrl = CONFIG.serverUrl.replace(/\/$/, '');
    const path = url.startsWith('/') ? url : `/${url}`;
    return `${baseUrl}${path}`;
  }, []);

  // 팝업 창 열기 헬퍼 함수
  const openPopup = useCallback((url: string, name: string) => {
    const width = 1200;
    const height = 900;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;
    window.open(
      url,
      name,
      `width=${width},height=${height},left=${left},top=${top},menubar=no,status=no,toolbar=no,scrollbars=yes`
    );
  }, []);
  // 샘플 보기 모달 상태
  const [sampleViewModalOpen, setSampleViewModalOpen] = useState(false);

  const handleSampleView = useCallback(() => {
    // 활성화된 아이템 정보(itemDetail) 또는 전달받은 상태(state.item)에서 샘플 URL 확인
    const sampleUrl = (state?.item as any)?.sample || (state?.system as any)?.sample;
    if (sampleUrl) {
      const samples = parseSampleUrls(sampleUrl);
      if (samples.length > 0) {
        // 단일/다중 샘플 모두 모달로 표시
        setSampleViewModalOpen(true);
      }
    } else {
      alert('등록된 샘플 파일이 없습니다.');
    }
  }, [state?.item, state?.system]);

  // 샘플 목록 가져오기 (모달용)
  const sampleList = useMemo(() => {
    const sampleUrl = (state?.item as any)?.sample || (state?.system as any)?.sample;
    return parseSampleUrls(sampleUrl);
  }, [state?.item, state?.system]);

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
              documentWrittenAt={documentWrittenAt}
              approvalDeadline={approvalDeadline}
              onDocumentWrittenAtChange={handleDocumentWrittenAtChange}
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
                                ? '위험요인 제거·대체 및 통제'
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
                  onInsertRows={handleTable1100InsertRows}
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
                  riskAssessmentData={riskAssessmentData}
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
                  safetySystemDocumentIdx={safetySystemDocumentIdx}
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
        <SampleViewModal
          open={sampleViewModalOpen}
          onClose={() => setSampleViewModalOpen(false)}
          samples={sampleList}
        />
      </DashboardContent>
    </LocalizationProvider>
  );
}
