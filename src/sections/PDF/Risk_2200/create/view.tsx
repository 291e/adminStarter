import type { Theme, SxProps } from '@mui/material/styles';
import { useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router';
import dayjs, { type Dayjs } from 'dayjs';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { DashboardContent } from 'src/layouts/dashboard';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import type { SafetySystem, SafetySystemItem } from 'src/_mock/_safety-system';
import type {
  Table1300Row,
  Table1400Data,
  Table1500Row,
  Table2100Data,
  Table2200Row,
  Table2300Row,
} from '../types/table-data';

import CreateHeader from './components/Header';
import DocumentInfo from './components/DocumentInfo';
import Table1300Form from './tables/Table1300Form';
import Table1400Form from './tables/Table1400Form';
import Table1500Form from './tables/Table1500Form';
import Table2100Form from './tables/Table2100Form';
import Table2200Form from './tables/Table2200Form';
import Table2300Form from './tables/Table2300Form';
import FooterButtons from './components/FooterButtons';

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

const initialTable1300Rows: Table1300Row[] = [
  {
    number: 1,
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
    | { system: SafetySystem; item?: SafetySystemItem; isGuide?: boolean; documentId?: string }
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
  const is1300Series = safetyIdx === 1 && itemNumber === 3; // 1300번대: 위험 기계·기구·설비
  const is1400Series = safetyIdx === 1 && itemNumber === 4; // 1400번대: 유해인자
  const is1500Series = safetyIdx === 1 && itemNumber === 5; // 1500번대: 위험장소 및 작업형태별 위험요인
  const is2100Series = safetyIdx === 2 && itemNumber === 1; // 2100번대: 위험요인별 위험성 평가
  const is2200Series = safetyIdx === 2 && itemNumber === 2; // 2200번대: 위험요인 제거·대체 및 통제 등록
  const is2300Series = safetyIdx === 2 && itemNumber === 3; // 2300번대: 감소 대책 수립·이행

  const [documentDate, setDocumentDate] = useState<Dayjs | null>(dayjs());
  const [approvalDeadline, setApprovalDeadline] = useState<Dayjs | null>(dayjs().add(33, 'day'));
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
    if (is1300Series) {
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
    } else {
      data = { documentDate, approvalDeadline, rows: table2300Rows };
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
    table1300Rows,
    table1400Data,
    table1500Rows,
    table2100Data,
    table2200Rows,
    table2300Rows,
    is1300Series,
    is1400Series,
    is1500Series,
    is2100Series,
    is2200Series,
    is2300Series,
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
    if (is1300Series) {
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
    } else {
      data = { documentDate, approvalDeadline, rows: table2200Rows };
    }
    // mutation.mutate({ ...data, safetyIdx, itemNumber });
    console.log('임시 저장:', data);
  }, [
    documentDate,
    approvalDeadline,
    table1300Rows,
    table1400Data,
    table1500Rows,
    table2100Data,
    table2200Rows,
    table2300Rows,
    is1300Series,
    is1400Series,
    is1500Series,
    is2100Series,
    is2200Series,
    is2300Series,
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
              maxWidth: 1320,
              p: 5,
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
                {is1300Series
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
                            ? '감소 대책 수립·이행'
                            : state?.item?.documentName || '위험요인 제거·대체 및 통제 등록'}
              </Typography>
            </Box>

            {/* Document Form - 타입별로 다른 폼 렌더링 */}
            {is1300Series ? (
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
              <Table2100Form data={table2100Data} onDataChange={handleTable2100DataChange} />
            ) : is2200Series ? (
              <Table2200Form
                rows={table2200Rows}
                onRowChange={handleTable2200RowChange}
                onRowDelete={handleTable2200RowDelete}
                onRowMove={handleTable2200RowMove}
                onAddRow={handleTable2200AddRow}
              />
            ) : (
              <Table2300Form
                rows={table2300Rows}
                onRowChange={handleTable2300RowChange}
                onRowDelete={handleTable2300RowDelete}
                onRowMove={handleTable2300RowMove}
                onAddRow={handleTable2300AddRow}
              />
            )}
          </Box>

          <FooterButtons
            onSave={handleSave}
            onTemporarySave={handleTemporarySave}
            onCancel={handleCancel}
          />
        </Box>
      </DashboardContent>
    </LocalizationProvider>
  );
}
