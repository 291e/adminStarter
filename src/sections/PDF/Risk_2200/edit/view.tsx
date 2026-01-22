import type { Theme, SxProps } from '@mui/material/styles';
import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import dayjs, { type Dayjs } from 'dayjs';

import { CONFIG } from 'src/global-config';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { DashboardContent } from 'src/layouts/dashboard';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import type { SafetySystem } from 'src/_mock/_safety-system';
import type { SafetySystemItem } from 'src/services/safety-system/safety-system.types';
import { getTableDataByDocument, FIXED_MINIMUM_EDUCATION_ROWS } from 'src/_mock/_safety-system';
import {
  updateSafetySystemDocument,
  getSafetySystemItem,
  createDocumentApproval,
  addApprovalSignature,
  sendNotification,
  getRiskAssessmentCriteria,
} from 'src/services/safety-system/safety-system.service';
import { uploadFile } from 'src/services/system/system.service';
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

import EditHeader from './components/EditHeader';
import EditDocumentInfo from './components/EditDocumentInfo';
import EditApprovalSection, {
  type ApprovalSignature,
  type ApprovalType,
} from './components/EditApprovalSection';
import SignatureModal from './components/SignatureModal';
import EditFooterButtons from './components/EditFooterButtons';
import ApprovalStatusWarningModal from './components/ApprovalStatusWarningModal';
import SelectApprovalMemberModal from 'src/sections/Chat/components/SelectApprovalMemberModal';
import Table1100Form from '../create/tables/Table1100Form';
import Table1200IndustrialAccidentForm from '../create/tables/Table1200IndustrialAccidentForm';
import Table1200NearMissForm from '../create/tables/Table1200NearMissForm';
import Table1300Form from '../create/tables/Table1300Form';
import Table1400Form from '../create/tables/Table1400Form';
import Table1500Form from '../create/tables/Table1500Form';
import Table2100Form from '../create/tables/Table2100Form';
import Table2200Form from '../create/tables/Table2200Form';
import Table2300Form from '../create/tables/Table2300Form';
import Table2400TBMForm from '../create/tables/Table2400TBMForm';
import Table2400EducationForm from '../create/tables/Table2400EducationForm';
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
  system?: SafetySystem;
  item?: SafetySystemItem;
  documentType?: 'industrial-accident' | 'near-miss' | 'tbm' | 'education';
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

export function Risk_2200EditView({
  safetyId,
  title = 'Blank',
  description,
  sx,
  system: propSystem,
  item: propItem,
  documentType: propDocumentType,
}: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { risk_id } = useParams<{ risk_id: string }>();
  const state = location.state as
    | {
        system: SafetySystem;
        item?: SafetySystemItem;
        isGuide?: boolean;
        documentType?: 'industrial-accident' | 'near-miss' | 'tbm' | 'education';
        document?: { safetySystemDocumentIdx?: number };
      }
    | undefined;

  // Props 또는 state에서 system, item, documentType 가져오기
  const system = propSystem || state?.system;
  const item = propItem || state?.item;
  const documentType = propDocumentType || state?.documentType;

  // safetySystemDocumentIdx 추출 (risk_id는 safetySystemDocumentIdx 문자열)
  const safetySystemDocumentIdx =
    state?.document?.safetySystemDocumentIdx || (risk_id ? Number(risk_id) : null);

  // 문서 상세 정보 조회 (아이템 상세 정보에서 documentList를 가져와서 해당 문서 찾기)
  const itemDetailQuery = useQuery({
    queryKey: ['safety-system-item', item?.safetySystemItemIdx],
    queryFn: async () => {
      if (!item?.safetySystemItemIdx) {
        return null;
      }
      try {
        const response = await getSafetySystemItem(item.safetySystemItemIdx);

        // axios 인터셉터에서 body.data를 평탄화
        const itemData =
          (response as any).item ||
          (response as any).body?.data?.item ||
          (response as any).body?.item;
        const documentList =
          (response as any).documentList ||
          (response as any).body?.data?.documentList ||
          (response as any).body?.documentList ||
          [];

        if (!itemData) return null;

        return {
          ...itemData,
          documentList,
        } as SafetySystemItem;
      } catch (error) {
        console.error('아이템 상세 정보 조회 실패:', error);
        return null;
      }
    },
    enabled: !!item?.safetySystemItemIdx,
  });

  const itemDetail = itemDetailQuery.data;

  // 현재 편집 중인 문서 찾기
  const currentDocument = itemDetail?.documentList?.find(
    (doc) => doc.safetySystemDocumentIdx === safetySystemDocumentIdx
  );

  // documentType 자동 추론을 위한 state
  const [inferredDocumentType, setInferredDocumentType] = useState<
    'industrial-accident' | 'near-miss' | 'tbm' | 'education' | undefined
  >(documentType);

  // 샘플 보기 모달 상태
  const [sampleViewModalOpen, setSampleViewModalOpen] = useState(false);

  // riskId에서 문서 정보 추출 (형식: safetyIdx-itemNumber-documentNumber)
  const extractedInfo = risk_id
    ? (() => {
        const parts = risk_id.split('-');
        if (parts.length >= 3) {
          return {
            safetyIdx: Number(parts[0]),
            itemNumber: Number(parts[1]),
            documentNumber: Number(parts[2]),
          };
        }
        return null;
      })()
    : null;

  // 문서 타입 확인
  const safetyIdx = item?.safetyIdx || system?.safetyIdx || extractedInfo?.safetyIdx;
  const itemNumber = item?.itemNumber || extractedInfo?.itemNumber;
  const is1100Series = safetyIdx === 1 && itemNumber === 1;
  const is1200Series = safetyIdx === 1 && itemNumber === 2;
  // documentType이 없으면 추론된 값 사용
  const finalDocumentType = documentType || inferredDocumentType;
  const is1200IndustrialAccident = is1200Series && finalDocumentType === 'industrial-accident';
  const is1200NearMiss = is1200Series && finalDocumentType === 'near-miss';
  const is1300Series = safetyIdx === 1 && itemNumber === 3;
  const is1400Series = safetyIdx === 1 && itemNumber === 4;
  const is1500Series = safetyIdx === 1 && itemNumber === 5;
  const is2100Series = safetyIdx === 2 && itemNumber === 1;
  const is2200Series = safetyIdx === 2 && itemNumber === 2;
  const is2300Series = safetyIdx === 2 && itemNumber === 3;
  const is2400Series = safetyIdx === 2 && itemNumber === 4;
  const is2400TBM = is2400Series && finalDocumentType === 'tbm';
  const is2400Education = is2400Series && finalDocumentType === 'education';

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
      { inspectionContent: '기계·기구·설비 이상 유무', result: '' },
      { inspectionContent: '기계·기구·설비 방호장치', result: '' },
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
    if (apiRiskAssessmentData && !currentDocument?.tableData) {
      // 문서 데이터가 없을 때만 API 데이터로 초기화
      setRiskAssessmentData(apiRiskAssessmentData);
    }
  }, [apiRiskAssessmentData]);

  const approvalTypeLabels: Record<ApprovalType, string> = {
    writer: '작성',
    reviewer: '검토',
    approver: '승인',
  };

  // enqueueSnackbar를 toast로 구현
  const enqueueSnackbar = useCallback(
    (message: string, options?: { variant?: 'success' | 'error' | 'warning' | 'info' }) => {
      if (options?.variant === 'error') {
        toast.error(message);
      } else if (options?.variant === 'success') {
        toast.success(message);
      } else if (options?.variant === 'warning') {
        toast.warning(message);
      } else if (options?.variant === 'info') {
        toast.info(message);
      } else {
        toast(message);
      }
    },
    []
  );

  const [approvalSignatures, setApprovalSignatures] = useState<ApprovalSignature[]>([]);

  // approvalStep 계산: 1(승인만), 2(작성+승인), 3(작성+검토+승인)
  const getApprovalStep = useCallback((signatures: ApprovalSignature[]): number => {
    const hasWriter = signatures.some((s) => s.type === 'writer');
    const hasApprover = signatures.some((s) => s.type === 'approver');
    const hasReviewer = signatures.some((s) => s.type === 'reviewer');

    if (hasWriter && hasReviewer && hasApprover) return 3; // 작성+검토+승인
    if (hasWriter && hasApprover) return 2; // 작성+승인
    if (hasApprover) return 1; // 승인만
    return 1; // 기본값
  }, []);

  // 현재 approvalStep 계산 (UI에서는 실제 signatures를 기반으로 계산)
  // 문서 저장 시에는 originalApprovalStep을 사용하지만, UI에서는 동적으로 변경 가능
  const currentApprovalStep = getApprovalStep(approvalSignatures);
  const [approvalMemberModal, setApprovalMemberModal] = useState<{
    open: boolean;
    type: ApprovalSignature['type'] | null;
  }>({ open: false, type: null });
  const [signatureModal, setSignatureModal] = useState<{
    open: boolean;
    type: ApprovalType | null;
  }>({ open: false, type: null });
  const [approvalWarningModalOpen, setApprovalWarningModalOpen] = useState(false);

  // 등록일, 수정일
  const registeredAt = currentDocument?.createAt
    ? typeof currentDocument.createAt === 'string'
      ? currentDocument.createAt.split('T')[0]
      : new Date(currentDocument.createAt).toISOString().split('T')[0]
    : '';
  const modifiedAt = currentDocument?.updateAt
    ? typeof currentDocument.updateAt === 'string'
      ? currentDocument.updateAt.split('T')[0]
      : new Date(currentDocument.updateAt).toISOString().split('T')[0]
    : '';

  // 기존 문서 데이터에서 approvalStep과 signatureList 로드하여 approvalSignatures 초기화
  useEffect(() => {
    if (!currentDocument) return;

    // approvalStep이 있으면 그에 맞게 서명 구조 생성
    const docApprovalStep = (currentDocument as any).approvalStep;

    // approvalList에서 기존 결재 대상자 정보 가져오기
    const approvalList = (currentDocument as any).approvalList || [];

    if (docApprovalStep && typeof docApprovalStep === 'number') {
      const newSignatures: ApprovalSignature[] = [];

      // approvalStep에 따라 서명 구조 생성
      if (docApprovalStep >= 2) {
        // 작성자 추가 (approvalStep 2 이상)
        newSignatures.push({ type: 'writer' });
      }
      if (docApprovalStep >= 3) {
        // 검토자 추가 (approvalStep 3)
        newSignatures.push({ type: 'reviewer' });
      }
      // 승인자 추가 (approvalStep 1 이상)
      newSignatures.push({ type: 'approver' });

      // approvalList에서 기존 데이터로 채우기
      if (approvalList.length > 0) {
        approvalList.forEach((approval: any) => {
          // approvalStep에 따라 type 매핑: 1(승인), 2(작성), 3(검토)
          let type: ApprovalType = 'approver';
          if (approval.approvalStep === 2) type = 'writer';
          else if (approval.approvalStep === 3) type = 'reviewer';
          else if (approval.approvalStep === 1) type = 'approver';

          // 해당 타입의 서명 찾아서 업데이트
          const existingIndex = newSignatures.findIndex((s) => s.type === type);
          if (existingIndex >= 0) {
            newSignatures[existingIndex] = {
              type,
              name: approval.memberName,
              date: approval.approvedAt ? dayjs(approval.approvedAt).format('YY. M. D') : undefined,
              signature: approval.signatureData,
              memberIdx: approval.targetMemberIdx,
              documentApprovalIdx: approval.documentApprovalIdx, // API에서 사용할 ID 저장
            };
          }
        });
      } else if (currentDocument.signatureList && currentDocument.signatureList.length > 0) {
        // approvalList가 없지만 signatureList가 있으면 기존 로직 사용
        currentDocument.signatureList.forEach((sig) => {
          // approvalStep에 따라 type 매핑: 1(승인), 2(작성), 3(검토)
          let type: ApprovalType = 'approver';
          if (sig.approvalStep === 2) type = 'writer';
          else if (sig.approvalStep === 3) type = 'reviewer';
          else if (sig.approvalStep === 1) type = 'approver';

          // 해당 타입의 서명 찾아서 업데이트
          const existingIndex = newSignatures.findIndex((s) => s.type === type);
          if (existingIndex >= 0) {
            newSignatures[existingIndex] = {
              type,
              name: sig.memberName,
              date: sig.approvedAt ? dayjs(sig.approvedAt).format('YY. M. D') : undefined,
              signature: sig.signatureData,
              memberIdx: sig.targetMemberIdx,
            };
          }
        });
      }

      setApprovalSignatures(newSignatures);
    } else if (currentDocument.signatureList && currentDocument.signatureList.length > 0) {
      // approvalStep이 없지만 signatureList가 있으면 기존 로직 사용
      const loadedSignatures: ApprovalSignature[] = currentDocument.signatureList.map((sig) => {
        // approvalStep에 따라 type 매핑: 1(승인), 2(작성), 3(검토)
        let type: ApprovalType = 'approver';
        if (sig.approvalStep === 2) type = 'writer';
        else if (sig.approvalStep === 3) type = 'reviewer';
        else if (sig.approvalStep === 1) type = 'approver';

        return {
          type,
          name: sig.memberName,
          date: sig.approvedAt ? dayjs(sig.approvedAt).format('YY. M. D') : undefined,
          signature: sig.signatureData,
          memberIdx: sig.targetMemberIdx,
        };
      });

      if (loadedSignatures.length > 0) {
        setApprovalSignatures(loadedSignatures);
      }
    }
  }, [currentDocument]);

  // 초기 로드 여부 추적 (사용자 수정 상태 보호)
  const isInitialLoadRef = useRef(true);

  // 기존 문서 데이터 로드
  useEffect(() => {
    if (!currentDocument) return;

    // 초기 로드가 아니고 사용자가 수정한 상태가 있으면 덮어쓰지 않음
    if (!isInitialLoadRef.current) {
      const hasUserChanges = table2400TBMData.educationVideoRows.some(
        (row) => row.participant?.memberIdx || row.educationVideo
      );
      if (hasUserChanges) {
        console.log('🔍 [edit/view] 사용자 수정 상태 보호 - useEffect 스킵');
        return;
      }
    }

    isInitialLoadRef.current = false;

    // documentWrittenAt 설정 (documentWrittenAt 우선, 없으면 createAt 사용)
    const documentWrittenAtDate =
      (currentDocument as any).documentWrittenAt ||
      (currentDocument as any).writtenAt ||
      (currentDocument as any).documentDate ||
      currentDocument.createAt;
    if (documentWrittenAtDate) {
      const dateStr =
        typeof documentWrittenAtDate === 'string'
          ? documentWrittenAtDate
          : new Date(documentWrittenAtDate).toISOString();
      const writtenAtDate = dayjs(dateStr.split('T')[0]);
      setDocumentWrittenAt(writtenAtDate);
      // 문서 작성일 기준으로 결재 마감일도 한 달 뒤로 설정 (기존 결재 마감일이 없으면)
      if (currentDocument.approvalDeadline) {
        setApprovalDeadline(dayjs(currentDocument.approvalDeadline));
      } else {
        setApprovalDeadline(writtenAtDate.add(1, 'month'));
      }
    }

    // tableData 파싱 및 설정
    let parsedTableData: any = null;
    if (currentDocument.tableData) {
      try {
        parsedTableData =
          typeof currentDocument.tableData === 'string'
            ? JSON.parse(currentDocument.tableData)
            : currentDocument.tableData;
      } catch (error) {
        console.error('tableData 파싱 실패:', error);
      }
    }

    if (parsedTableData) {
      const tableType = parsedTableData.tableType;

      // documentType 자동 추론
      if (tableType === '1200-industrial') {
        setInferredDocumentType('industrial-accident');
      } else if (tableType === '1200-near-miss') {
        setInferredDocumentType('near-miss');
      } else if (tableType === '2400-tbm') {
        setInferredDocumentType('tbm');
      } else if (tableType === '2400-education') {
        setInferredDocumentType('education');
      }

      // tableType에 따라 데이터 설정
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
        // riskAssessmentData가 있으면 설정 (문서 데이터 우선)
        if (parsedTableData.riskAssessmentData) {
          setRiskAssessmentData(parsedTableData.riskAssessmentData as RiskAssessmentData);
        } else if (apiRiskAssessmentData) {
          // 문서 데이터가 없으면 API 데이터 사용
          setRiskAssessmentData(apiRiskAssessmentData);
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
        // 사용자가 이미 수정한 상태가 있으면 덮어쓰지 않음
        // (근로자 서명 등록 후 쿼리 무효화로 인한 재로드 방지)
        setTable2400TBMData((prev) => {
          // prev가 초기값이 아니고, educationVideoRows가 있으면 유지
          const hasUserChanges = prev.educationVideoRows.some(
            (row) => row.participant?.memberIdx || row.educationVideo
          );
          if (hasUserChanges) {
            console.log('🔍 [edit/view] 사용자 수정 상태 유지:', {
              prev,
              parsedData: parsedTableData.data,
            });
            return prev;
          }
          return parsedTableData.data as Table2400TBMData;
        });
      } else if (tableType === '2400-education') {
        if (parsedTableData.rows) {
          setTable2400EducationRows(parsedTableData.rows as Table2400EducationRow[]);
        }
        if (parsedTableData.minimumEducationRows) {
          setTable2400MinimumEducationRows(parsedTableData.minimumEducationRows);
        }
      }
    } else if (extractedInfo) {
      // API 데이터가 없으면 목업 데이터 사용 (fallback)
      const tableData = getTableDataByDocument(
        extractedInfo.safetyIdx,
        extractedInfo.itemNumber,
        extractedInfo.documentNumber
      );

      if (tableData) {
        // documentType 자동 추론
        if (tableData.type === '1200-industrial') {
          setInferredDocumentType('industrial-accident');
        } else if (tableData.type === '1200-near-miss') {
          setInferredDocumentType('near-miss');
        } else if (tableData.type === '2400-tbm') {
          setInferredDocumentType('tbm');
        } else if (tableData.type === '2400-education') {
          setInferredDocumentType('education');
        }

        // tableData.type에 따라 데이터 설정
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
          // riskAssessmentData가 있으면 설정 (문서 데이터 우선)
          if ((tableData as any).riskAssessmentData) {
            setRiskAssessmentData((tableData as any).riskAssessmentData as RiskAssessmentData);
          } else if (apiRiskAssessmentData) {
            // 문서 데이터가 없으면 API 데이터 사용
            setRiskAssessmentData(apiRiskAssessmentData);
          }
        } else if (tableData.type === '2200') {
          setTable2200Rows(tableData.rows as Table2200Row[]);
        } else if (tableData.type === '2300') {
          setTable2300Rows(tableData.rows as Table2300Row[]);
        } else if (tableData.type === '1200-industrial') {
          if (tableData.rows && tableData.rows.length > 0) {
            setTable1200IndustrialAccidentRow(tableData.rows[0]);
          }
        } else if (tableData.type === '1200-near-miss') {
          setTable1200NearMissRow(tableData.row as Table1200NearMissRow);
        } else if (tableData.type === '2400-tbm') {
          // 사용자가 이미 수정한 상태가 있으면 덮어쓰지 않음
          setTable2400TBMData((prev) => {
            const hasUserChanges = prev.educationVideoRows.some(
              (row) => row.participant?.memberIdx || row.educationVideo
            );
            if (hasUserChanges) {
              console.log('🔍 [edit/view] 사용자 수정 상태 유지 (fallback):', {
                prev,
                tableData: tableData.data,
              });
              return prev;
            }
            return tableData.data as Table2400TBMData;
          });
        } else if (tableData.type === '2400-education') {
          setTable2400EducationRows(tableData.rows as Table2400EducationRow[]);
          if (tableData.minimumEducationRows) {
            setTable2400MinimumEducationRows(tableData.minimumEducationRows);
          }
        }
      }
    }
  }, [currentDocument, extractedInfo]);

  const handleRiskAssessmentSave = (data: RiskAssessmentData) => {
    setRiskAssessmentData(data);
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

  // 핸들러들은 create/view.tsx와 동일
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

  const handleTable2400TBMDataChange = useCallback(
    (data: Table2400TBMData | ((prev: Table2400TBMData) => Table2400TBMData)) => {
      console.log('🔍 [edit/view] handleTable2400TBMDataChange 호출:', {
        isFunction: typeof data === 'function',
        data: typeof data === 'function' ? 'function' : data,
        educationVideoRows:
          typeof data === 'function'
            ? 'function'
            : data.educationVideoRows?.map((row, idx) => ({
                index: idx,
                participant: row.participant,
                participantMemberIdx: row.participant?.memberIdx,
                participantName: row.participant?.name,
                vodIdx: row.vodIdx,
                educationVideo: row.educationVideo,
              })),
      });

      if (typeof data === 'function') {
        setTable2400TBMData((prev) => {
          const result = data(prev);
          console.log('✅ [edit/view] 함수형 업데이트 결과:', {
            result,
            educationVideoRows: result.educationVideoRows?.map((row, idx) => ({
              index: idx,
              participant: row.participant,
              participantMemberIdx: row.participant?.memberIdx,
              participantName: row.participant?.name,
              vodIdx: row.vodIdx,
              educationVideo: row.educationVideo,
            })),
          });
          return result;
        });
      } else {
        console.log('✅ [edit/view] 직접 업데이트:', {
          data,
          educationVideoRows: data.educationVideoRows?.map((row, idx) => ({
            index: idx,
            participant: row.participant,
            participantMemberIdx: row.participant?.memberIdx,
            participantName: row.participant?.name,
            vodIdx: row.vodIdx,
            educationVideo: row.educationVideo,
          })),
        });
        setTable2400TBMData(data);
      }
    },
    []
  );

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

  const handleTable2400TBMEducationContentChange = useCallback((value: string) => {
    setTable2400TBMData((prev) => ({ ...prev, educationContent: value }));
  }, []);

  const handleTable2400TBMEducationVideoRowChange = useCallback(
    (
      index: number,
      field: 'participant' | 'educationVideo' | 'signature' | 'vodIdx' | 'workerSignatureIdx',
      value: InvestigationTeamMember | null | string | number | undefined
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

  const handleTable2400EducationRowChange = useCallback(
    (
      index: number,
      field: keyof Table2400EducationRow,
      value: string | boolean[] | number | '법정' | '자율'
    ) => {
      setTable2400EducationRows((prev) => {
        const newRows = [...prev];
        newRows[index] = { ...newRows[index], [field]: value };
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
    console.log('고위험작업 선택', index);
  }, []);

  const handleSelectDisasterFactor = useCallback((index: number) => {
    console.log('재해유발요인 선택', index);
  }, []);

  const handleTable1300RowChange = useCallback(
    (index: number, field: keyof Table1300Row, value: string | number) => {
      setTable1300Rows((prev) => {
        const newRows = [...prev];
        newRows[index] = { ...newRows[index], [field]: value };
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

  const handleTable1400DataChange = useCallback((data: Table1400Data) => {
    setTable1400Data(data);
  }, []);

  const handleTable2100DataChange = useCallback((data: Table2100Data) => {
    setTable2100Data(data);
  }, []);

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

  // 문서 수정 Mutation
  const updateDocumentMutation = useMutation({
    mutationFn: ({ docIdx, params }: { docIdx: number; params: any }) => {
      console.log('🔍 [문서 수정 API] 요청 시작:', {
        docIdx,
        params,
        hasWorkerList: !!params.workerList,
        workerList: params.workerList,
      });
      return updateSafetySystemDocument(docIdx, params);
    },
    onSuccess: (response, variables) => {
      console.log('✅ [문서 수정 API] 성공:', {
        docIdx: variables.docIdx,
        response,
        workerList: variables.params.workerList,
      });
      // 아이템 상세 정보 쿼리 무효화하여 문서 목록 갱신
      if (item?.safetySystemItemIdx) {
        queryClient.invalidateQueries({
          queryKey: ['safety-system-item', item.safetySystemItemIdx],
        });
      }
      // 알림 및 서명 대기 문서 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: ['notificationHistory'] });
      queryClient.invalidateQueries({ queryKey: ['pendingSignatures'] });
      queryClient.invalidateQueries({ queryKey: ['sharedDocuments'] });
      // 공유 문서 상세 모달 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: ['sharedDocumentDetail'] });
      queryClient.invalidateQueries({ queryKey: ['safetySystemDocumentDetail'] });
      // 문서 상세 정보 쿼리 무효화 (진행률 모달에서 사용)
      queryClient.invalidateQueries({ queryKey: ['safetySystemDocument', variables.docIdx] });
      // 리스트 페이지로 이동
      if (safetyId) {
        navigate(`/dashboard/safety-system/${safetyId}/risk-2200`, {
          state: { system, item },
        });
      } else {
        navigate(-1);
      }
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.header?.resultMessage ||
        error?.message ||
        '문서 수정에 실패했습니다.';
      console.error('문서 수정 실패:', errorMessage);
      alert(errorMessage); // TODO: Snackbar로 교체
    },
  });

  // 결재 대상자 등록 API Mutation
  const createApprovalMutation = useMutation({
    mutationFn: async ({
      docIdx,
      approvalTargetList,
    }: {
      docIdx: number;
      approvalTargetList: Array<{
        targetMemberIdx: number;
        approvalStep: number;
        approvalOrder?: number;
      }>;
    }) => {
      await createDocumentApproval(docIdx, {
        approvalType: 'sequential', // 순차 결재
        approvalTargetList,
      });
      // 알림 발송을 위해 docIdx와 targetMemberIndexList 반환
      return { docIdx, targetMemberIndexList: approvalTargetList.map((t) => t.targetMemberIdx) };
    },
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ['safety-system-item'] });
      // 알림 및 서명 대기 문서 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: ['notificationHistory'] });
      queryClient.invalidateQueries({ queryKey: ['pendingSignatures'] });
      queryClient.invalidateQueries({ queryKey: ['sharedDocuments'] });
      // 공유 문서 상세 모달 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: ['sharedDocumentDetail'] });
      queryClient.invalidateQueries({ queryKey: ['safetySystemDocumentDetail'] });

      // 서명 요청 알림 발송
      if (data.targetMemberIndexList.length > 0) {
        try {
          await sendNotification(data.docIdx, {
            notificationType: 'signature_request',
            targetMemberIndexList: data.targetMemberIndexList,
          });
          enqueueSnackbar('결재 대상자에게 알림이 발송되었습니다.', { variant: 'success' });
        } catch (error) {
          console.error('알림 발송 실패:', error);
          // 알림 실패는 에러로 처리하지 않음 (결재 등록은 성공)
        }
      }
    },
    onError: (error: any) => {
      enqueueSnackbar(error?.message || '결재 대상자 등록에 실패했습니다.', { variant: 'error' });
    },
  });

  const proceedWithSave = useCallback(async () => {
    // 필수 값 검증
    if (!safetySystemDocumentIdx) {
      enqueueSnackbar('문서 ID가 없습니다.', { variant: 'error' });
      return;
    }

    // 현재 approvalStep 사용 (UI에서 변경된 값 반영)
    const approvalStep = currentApprovalStep;

    // 기존 approvalList 확인 (이미 등록된 대상자 필터링용)
    const existingApprovalList = (currentDocument as any)?.approvalList || [];
    const existingMemberIndices = new Set(
      existingApprovalList.map((approval: any) => approval.targetMemberIdx)
    );

    // 결재 대상자 목록 구성 (memberIdx가 있고, 아직 등록되지 않은 서명만)
    const approvalTargetList = approvalSignatures
      .filter(
        (sig) =>
          sig.memberIdx !== undefined &&
          !sig.documentApprovalIdx && // documentApprovalIdx가 없으면 새로 등록해야 함
          !existingMemberIndices.has(sig.memberIdx!) // 기존 approvalList에 없으면 새로 등록해야 함
      )
      .map((sig) => {
        // approvalStep 매핑: writer(2), reviewer(3), approver(1)
        let step = 1; // 기본값: 승인
        if (sig.type === 'writer') step = 2;
        else if (sig.type === 'reviewer') step = 3;
        else if (sig.type === 'approver') step = 1;

        return {
          targetMemberIdx: sig.memberIdx!,
          approvalStep: step,
        };
      });

    // 새로 등록할 결재 대상자가 있으면 등록 API 호출
    if (approvalTargetList.length > 0) {
      try {
        await createApprovalMutation.mutateAsync({
          docIdx: safetySystemDocumentIdx,
          approvalTargetList,
        });
      } catch {
        // 에러는 mutation의 onError에서 처리됨
        return;
      }
    }

    // 테이블 데이터 구성
    let tableData: any;

    if (is1100Series) {
      tableData = { tableType: '1100', rows: table1100Rows };
    } else if (is1200IndustrialAccident) {
      tableData = { tableType: '1200-industrial', row: table1200IndustrialAccidentRow };
    } else if (is1200NearMiss) {
      tableData = { tableType: '1200-near-miss', row: table1200NearMissRow };
    } else if (is1300Series) {
      tableData = { tableType: '1300', rows: table1300Rows };
    } else if (is1400Series) {
      tableData = { tableType: '1400', data: table1400Data };
    } else if (is1500Series) {
      tableData = { tableType: '1500', rows: table1500Rows };
    } else if (is2100Series) {
      tableData = { tableType: '2100', data: table2100Data, riskAssessmentData };
    } else if (is2200Series) {
      tableData = { tableType: '2200', rows: table2200Rows };
    } else if (is2300Series) {
      tableData = { tableType: '2300', rows: table2300Rows };
    } else if (is2400TBM) {
      tableData = { tableType: '2400-tbm', data: table2400TBMData };
    } else if (is2400Education) {
      tableData = {
        tableType: '2400-education',
        rows: table2400EducationRows,
        minimumEducationRows: table2400MinimumEducationRows,
      };
    } else {
      tableData = { tableType: '1100', rows: table1100Rows };
    }

    // API 요청 데이터 구성
    const requestData: any = {
      approvalDeadline: approvalDeadline ? approvalDeadline.format('YYYY-MM-DD') : undefined,
      tableData: JSON.stringify(tableData),
      approvalStep, // approvalStep 포함
    };

    // 2400 TBM 문서인 경우 workerList 추가
    if (is2400TBM && table2400TBMData) {
      console.log('🔍 [문서 수정] 2400 TBM 데이터 확인:', {
        educationVideoRows: table2400TBMData.educationVideoRows,
        educationVideoRowsCount: table2400TBMData.educationVideoRows.length,
      });

      const workerList = table2400TBMData.educationVideoRows
        .filter((row) => row.participant?.memberIdx && row.vodIdx)
        .map((row) => ({
          targetMemberIdx: row.participant!.memberIdx!,
          vodIdx: row.vodIdx!,
        }));

      console.log('🔍 [문서 수정] 생성된 workerList:', {
        workerList,
        workerListCount: workerList.length,
        details: workerList.map((w) => ({
          targetMemberIdx: w.targetMemberIdx,
          vodIdx: w.vodIdx,
          participantName: table2400TBMData.educationVideoRows.find(
            (r) => r.participant?.memberIdx === w.targetMemberIdx && r.vodIdx === w.vodIdx
          )?.participant?.name,
        })),
      });

      if (workerList.length > 0) {
        requestData.workerList = workerList;
      } else {
        console.warn('⚠️ [문서 수정] workerList가 비어있습니다. educationVideoRows 확인:', {
          educationVideoRows: table2400TBMData.educationVideoRows.map((row, idx) => ({
            index: idx,
            participant: row.participant,
            participantMemberIdx: row.participant?.memberIdx,
            vodIdx: row.vodIdx,
            educationVideo: row.educationVideo,
          })),
        });
      }
    }

    console.log('🔍 [문서 수정] 최종 API 요청 데이터:', {
      docIdx: safetySystemDocumentIdx,
      requestData,
      hasWorkerList: !!requestData.workerList,
      workerListCount: requestData.workerList?.length || 0,
    });

    updateDocumentMutation.mutate({
      docIdx: safetySystemDocumentIdx,
      params: requestData,
    });
  }, [
    safetySystemDocumentIdx,
    approvalSignatures,
    currentApprovalStep,
    createApprovalMutation,
    enqueueSnackbar,
    approvalDeadline,
    currentDocument,
    riskAssessmentData,
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
    updateDocumentMutation,
    system,
    item,
    safetyId,
    navigate,
  ]);

  const handleSave = useCallback(async () => {
    // 필수 값 검증
    if (!safetySystemDocumentIdx) {
      enqueueSnackbar('문서 ID가 없습니다.', { variant: 'error' });
      return;
    }

    // 결재 진행중, 완료, 또는 대기 중인 문서인지 확인
    const approvalProgress = currentDocument?.approvalProgress ?? 0;
    const status = currentDocument?.status;
    const isApprovalInProgressOrCompleted =
      (approvalProgress > 0 && approvalProgress < 100) ||
      approvalProgress === 100 ||
      status === 'IN_PROGRESS' ||
      status === 'COMPLETED' ||
      status === 'PENDING';

    // 결재 진행중, 완료, 또는 대기 중인 경우 경고 모달 표시
    if (isApprovalInProgressOrCompleted) {
      setApprovalWarningModalOpen(true);
      return;
    }

    // 경고 없이 바로 저장 진행
    await proceedWithSave();
  }, [
    safetySystemDocumentIdx,
    currentDocument?.approvalProgress,
    currentDocument?.status,
    enqueueSnackbar,
    proceedWithSave,
  ]);

  const handleTemporarySave = useCallback(() => {
    // TODO: TanStack Query Hook(useMutation)으로 문서 임시 저장
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
    if (safetyId && risk_id) {
      navigate(`/dashboard/safety-system/${safetyId}/risk-2200`, {
        state: { system, item },
      });
    } else {
      navigate(-1);
    }
  }, [navigate, safetyId, risk_id, system, item]);

  const handleBack = useCallback(() => {
    if (safetyId && risk_id) {
      navigate(`/dashboard/safety-system/${safetyId}/risk-2200`, {
        state: { system, item },
      });
    } else {
      navigate(-1);
    }
  }, [navigate, safetyId, risk_id, system, item]);

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
  const handleSampleView = useCallback(() => {
    // 활성화된 아이템 정보(itemDetail) 또는 전달받은 상태(state.item)에서 샘플 URL 확인
    const sampleUrl =
      (itemDetail as any)?.sample || (state?.item as any)?.sample || (state?.system as any)?.sample;
    if (sampleUrl) {
      const samples = parseSampleUrls(sampleUrl);
      if (samples.length > 0) {
        // 단일/다중 샘플 모두 모달로 표시
        setSampleViewModalOpen(true);
      }
    } else {
      alert('등록된 샘플 파일이 없습니다.');
    }
  }, [itemDetail, state?.item, state?.system]);

  // 샘플 목록 가져오기 (모달용)
  const sampleList = useMemo(() => {
    const sampleUrl =
      (itemDetail as any)?.sample || (state?.item as any)?.sample || (state?.system as any)?.sample;
    return parseSampleUrls(sampleUrl);
  }, [itemDetail, state?.item, state?.system]);

  const handleAddSignature = useCallback(() => {
    const hasWriter = approvalSignatures.some((s) => s.type === 'writer');
    const hasReviewer = approvalSignatures.some((s) => s.type === 'reviewer');
    const hasApprover = approvalSignatures.some((s) => s.type === 'approver');

    // approvalStep에 따라 다음 단계로 증가시키며 서명 추가
    if (currentApprovalStep === 1) {
      // 승인만 → 작성+승인: 작성자 추가
      if (!hasWriter) {
        setApprovalSignatures([...approvalSignatures, { type: 'writer' }]);
      } else if (!hasApprover) {
        setApprovalSignatures([...approvalSignatures, { type: 'approver' }]);
      }
    } else if (currentApprovalStep === 2) {
      // 작성+승인 → 작성+검토+승인: 검토자 추가
      if (!hasReviewer) {
        setApprovalSignatures([...approvalSignatures, { type: 'reviewer' }]);
      } else if (!hasApprover) {
        setApprovalSignatures([...approvalSignatures, { type: 'approver' }]);
      }
    } else if (currentApprovalStep === 3) {
      // 작성+검토+승인: 순서대로 추가
      if (!hasWriter) {
        setApprovalSignatures([...approvalSignatures, { type: 'writer' }]);
      } else if (!hasReviewer) {
        setApprovalSignatures([...approvalSignatures, { type: 'reviewer' }]);
      } else if (!hasApprover) {
        setApprovalSignatures([...approvalSignatures, { type: 'approver' }]);
      }
    }
  }, [approvalSignatures, currentApprovalStep]);

  const ensureSignatureEntry = useCallback((type: ApprovalType) => {
    setApprovalSignatures((prev) => {
      if (prev.some((s) => s.type === type)) {
        return prev;
      }
      return [...prev, { type }];
    });
  }, []);

  const handleRequestSignature = useCallback(
    (type: ApprovalType) => {
      ensureSignatureEntry(type);
      setSignatureModal({ open: true, type });
    },
    [ensureSignatureEntry]
  );

  const handleRemoveSignature = useCallback((type: ApprovalSignature['type']) => {
    setApprovalSignatures((prev) => prev.filter((s) => s.type !== type));
  }, []);

  const handleOpenApprovalMemberModal = useCallback((type: ApprovalSignature['type']) => {
    setApprovalMemberModal({ open: true, type });
  }, []);

  const handleCloseApprovalMemberModal = useCallback(() => {
    setApprovalMemberModal({ open: false, type: null });
  }, []);

  const handleApprovalMemberConfirm = useCallback(
    (memberIdx: number, memberName: string) => {
      if (!approvalMemberModal.type) {
        handleCloseApprovalMemberModal();
        return;
      }
      setApprovalSignatures((prev) => {
        const existingSignature = prev.find((s) => s.type === approvalMemberModal.type);
        const nextSignature = {
          type: approvalMemberModal.type,
          name: memberName,
          // 날짜는 서명 등록 시에만 설정 (기존 서명이 있으면 유지)
          date: existingSignature?.signature ? existingSignature.date : undefined,
          // 기존 서명이 있으면 유지
          signature: existingSignature?.signature,
          memberIdx,
          documentApprovalIdx: existingSignature?.documentApprovalIdx,
        } as ApprovalSignature;
        if (existingSignature) {
          return prev.map((s) => (s.type === approvalMemberModal.type ? nextSignature : s));
        }
        return [...prev, nextSignature];
      });
      handleCloseApprovalMemberModal();
    },
    [approvalMemberModal.type, handleCloseApprovalMemberModal]
  );

  const handleCloseSignatureModal = useCallback(() => {
    setSignatureModal({ open: false, type: null });
  }, []);

  // 결재 서명 등록 API Mutation
  const addSignatureMutation = useMutation({
    mutationFn: async ({ docIdx, signatureData }: { docIdx: number; signatureData: string }) => {
      // base64 데이터 URL에서 실제 base64 부분만 추출
      const base64Data = signatureData.includes(',') ? signatureData.split(',')[1] : signatureData;
      await addApprovalSignature(docIdx, {
        signatureData: base64Data,
        approvalStatus: 'APPROVED',
      });
    },
    onSuccess: () => {
      enqueueSnackbar('서명이 등록되었습니다.', { variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['safety-system-item'] });
      // 알림 및 서명 대기 문서 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: ['notificationHistory'] });
      queryClient.invalidateQueries({ queryKey: ['pendingSignatures'] });
      queryClient.invalidateQueries({ queryKey: ['sharedDocuments'] });
      // 공유 문서 상세 모달 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: ['sharedDocumentDetail'] });
      queryClient.invalidateQueries({ queryKey: ['safetySystemDocumentDetail'] });
    },
    onError: (error: any) => {
      enqueueSnackbar(error?.message || '서명 등록에 실패했습니다.', { variant: 'error' });
    },
  });

  const handleSignatureConfirm = useCallback(
    async (signatureDataUrl: string) => {
      if (!signatureModal.type || !safetySystemDocumentIdx) {
        handleCloseSignatureModal();
        return;
      }

      try {
        // base64 데이터를 File 객체로 변환
        const base64Data = signatureDataUrl.includes(',')
          ? signatureDataUrl.split(',')[1]
          : signatureDataUrl;
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'image/png' });
        const file = new File([blob], `signature_${signatureModal.type}_${Date.now()}.png`, {
          type: 'image/png',
        });

        // 파일 업로드 API 호출
        const uploadResponse = await uploadFile({ files: [file] });
        // axios 인터셉터에서 평탄화되므로 직접 접근
        // 실제 응답 구조: { files: [{ fileUrl: string, ... }], header: {...} }
        const uploadedFiles = (uploadResponse as any).files || [];
        const signatureUrl = uploadedFiles[0]?.fileUrl || (uploadResponse as any).fileUrls?.[0];

        if (!signatureUrl) {
          throw new Error('파일 업로드에 실패했습니다.');
        }

        // 서명 등록 API 호출 (업로드된 URL 전송)
        await addSignatureMutation.mutateAsync({
          docIdx: safetySystemDocumentIdx,
          signatureData: signatureUrl,
        });

        // UI 업데이트 (URL 사용)
        const formattedDate = dayjs().format('YY. M. D');
        setApprovalSignatures((prev) =>
          prev.map((signature) =>
            signature.type === signatureModal.type
              ? {
                  ...signature,
                  signature: signatureUrl, // 업로드된 URL 사용
                  date: formattedDate,
                }
              : signature
          )
        );
        handleCloseSignatureModal();
      } catch (error: any) {
        enqueueSnackbar(error?.message || '서명 등록에 실패했습니다.', { variant: 'error' });
      }
    },
    [
      handleCloseSignatureModal,
      signatureModal.type,
      safetySystemDocumentIdx,
      addSignatureMutation,
      enqueueSnackbar,
    ]
  );

  const activeSignature = signatureModal.type
    ? approvalSignatures.find((signature) => signature.type === signatureModal.type)
    : undefined;

  const handleSendNotification = useCallback(() => {
    // TODO: TanStack Query Hook(useMutation)으로 알림 보내기
    console.log('알림 보내기');
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
          <EditHeader
            onBack={handleBack}
            onSampleView={handleSampleView}
            title={item?.documentName || '문서 수정'}
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
            <EditDocumentInfo
              documentNumber={extractedInfo?.documentNumber?.toString()}
              writerIp={undefined}
              registeredAt={registeredAt}
              modifiedAt={modifiedAt}
              documentWrittenAt={documentWrittenAt}
              approvalDeadline={approvalDeadline}
              onDocumentWrittenAtChange={handleDocumentWrittenAtChange}
              onApprovalDeadlineChange={setApprovalDeadline}
              onSendNotification={handleSendNotification}
            />

            {/* Document Title with Approval Section */}
            <Box
              sx={{
                width: '100%',
                pb: 5,
                pt: 5,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                position: 'relative',
              }}
            >
              <Box
                sx={{
                  flex: 1,
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
                                        : item?.documentName || '위험요인 파악'}
                </Typography>
              </Box>
              {/* 결재란 */}
              <EditApprovalSection
                signatures={approvalSignatures}
                approvalStep={currentApprovalStep}
                onAddSignature={handleAddSignature}
                onRemoveSignature={handleRemoveSignature}
                onSelectMember={handleOpenApprovalMemberModal}
                onRequestSignature={handleRequestSignature}
              />
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
                  riskAssessmentData={riskAssessmentData}
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
                  safetySystemDocumentIdx={safetySystemDocumentIdx || undefined}
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

          <EditFooterButtons
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
        {/* 결재 상태 경고 모달 */}
        <ApprovalStatusWarningModal
          open={approvalWarningModalOpen}
          onClose={() => setApprovalWarningModalOpen(false)}
          onConfirm={async (resendNotification) => {
            setApprovalWarningModalOpen(false);
            await proceedWithSave();

            // 결재 재요청 알림 발송
            if (resendNotification && safetySystemDocumentIdx && currentDocument) {
              try {
                const approvalList = (currentDocument as any).approvalList || [];
                const targetMemberIndexList: number[] = approvalList
                  .filter(
                    (approval: any) =>
                      typeof approval.targetMemberIdx === 'number' &&
                      approval.approvalStatus !== 'APPROVED'
                  )
                  .map((approval: any) => approval.targetMemberIdx as number);

                if (targetMemberIndexList.length > 0) {
                  await sendNotification(Number(safetySystemDocumentIdx), {
                    notificationType: 'signature_request',
                    targetMemberIndexList,
                  });
                }
              } catch (error) {
                console.error('결재 재요청 알림 발송 실패:', error);
              }
            }
          }}
          approvalProgress={currentDocument?.approvalProgress}
          status={currentDocument?.status}
        />

        {approvalMemberModal.type && (
          <SelectApprovalMemberModal
            open={approvalMemberModal.open}
            onClose={handleCloseApprovalMemberModal}
            onConfirm={handleApprovalMemberConfirm}
            approvalType={approvalMemberModal.type}
          />
        )}
        <SignatureModal
          open={signatureModal.open}
          onClose={handleCloseSignatureModal}
          onConfirm={handleSignatureConfirm}
          targetLabel={signatureModal.type ? approvalTypeLabels[signatureModal.type] : undefined}
          initialSignature={activeSignature?.signature}
        />
        <SampleViewModal
          open={sampleViewModalOpen}
          onClose={() => setSampleViewModalOpen(false)}
          samples={sampleList}
        />
      </DashboardContent>
    </LocalizationProvider>
  );
}
