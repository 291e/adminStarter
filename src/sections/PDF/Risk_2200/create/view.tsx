import type { Theme, SxProps } from '@mui/material/styles';
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router';
import dayjs, { type Dayjs } from 'dayjs';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { DashboardContent } from 'src/layouts/dashboard';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

import CreateHeader from './components/Header';
import DocumentInfo from './components/DocumentInfo';
import RiskAssessmentTableForm, {
  type RiskAssessmentRow,
} from './components/RiskAssessmentTableForm';
import FooterButtons from './components/FooterButtons';

// ----------------------------------------------------------------------

type Props = {
  safetyId?: string;
  title?: string;
  description?: string;
  sx?: SxProps<Theme>;
};

const initialRows: RiskAssessmentRow[] = [
  {
    id: '1',
    risk: '건설현장 개구부',
    removal: '설계.시공 시개구부 최소화',
    engineering: '안전난간 또는 덮개 설치',
    administrative: "'추락위험' 표지판 설치",
    ppe: '안전모/안전대착용',
  },
  {
    id: '2',
    risk: '끼임 위험기계/기구',
    removal: '끼임 위험이 없는 자동화 기계 도입',
    engineering: '덮개 등 방호장치 설치',
    administrative: "'Lock Out, Tag Out' 작업허가제 도입",
    ppe: '말려 들어갈 위험이 없는 작업복 착용',
  },
  {
    id: '3',
    risk: '유해화학물질',
    removal: '유해물질 제거 또는 저독성물질로 대체\n*예:메탄올→에탄올',
    engineering: '국소배기장치 설치, 누출방지조치 등',
    administrative: '작업절차서 준수, 작업환경 측정을 통한 노출관리',
    ppe: '방독마스크, 내화학장갑, 보안경 등 착용',
  },
  {
    id: '4',
    risk: '인화성 가스',
    removal: '인화성 완화*\n*예:아세틸렌→ LPG',
    engineering:
      '전기설비 방폭 조치(점화원관리), 가스검지기/긴급차단장이 연동 설치 환기/배기장치 설치',
    administrative: '작업절차서 준서, 정비작업허가제 도입',
    ppe: '제전작업복 착용\n가스검지기 휴대\n방폭공구 사용',
  },
];

export function Risk_2200CreateView({ safetyId, title = 'Blank', description, sx }: Props) {
  const navigate = useNavigate();
  const [documentDate, setDocumentDate] = useState<Dayjs | null>(dayjs());
  const [approvalDeadline, setApprovalDeadline] = useState<Dayjs | null>(dayjs().add(33, 'day'));
  const [rows, setRows] = useState<RiskAssessmentRow[]>(initialRows);

  const handleRowChange = useCallback(
    (index: number, field: keyof RiskAssessmentRow, value: string) => {
      setRows((prev) => {
        const newRows = [...prev];
        newRows[index] = { ...newRows[index], [field]: value };
        return newRows;
      });
    },
    []
  );

  const handleRowDelete = useCallback((index: number) => {
    setRows((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleRowMove = useCallback((index: number, direction: 'up' | 'down') => {
    setRows((prev) => {
      const newRows = [...prev];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= newRows.length) return prev;
      [newRows[index], newRows[targetIndex]] = [newRows[targetIndex], newRows[index]];
      return newRows;
    });
  }, []);

  const handleAddRow = useCallback(() => {
    setRows((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        risk: '',
        removal: '',
        engineering: '',
        administrative: '',
        ppe: '',
      },
    ]);
  }, []);

  const handleSave = useCallback(() => {
    // 등록 로직
    console.log('등록:', { documentDate, approvalDeadline, rows });
    if (safetyId) {
      navigate(`/dashboard/safety-system/${safetyId}/risk-2200`);
    } else {
      navigate(-1);
    }
  }, [documentDate, approvalDeadline, rows, navigate, safetyId]);

  const handleTemporarySave = useCallback(() => {
    // 임시 저장 로직
    console.log('임시 저장:', { documentDate, approvalDeadline, rows });
  }, [documentDate, approvalDeadline, rows]);

  const handleCancel = useCallback(() => {
    if (safetyId) {
      navigate(`/dashboard/safety-system/${safetyId}/risk-2200`);
    } else {
      navigate(-1);
    }
  }, [navigate, safetyId]);

  const handleBack = useCallback(() => {
    if (safetyId) {
      navigate(`/dashboard/safety-system/${safetyId}/risk-2200`);
    } else {
      navigate(-1);
    }
  }, [navigate, safetyId]);

  const handleSampleView = useCallback(() => {
    // 샘플 보기 로직
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
              px: 5,
              py: 10,
            },
            ...(Array.isArray(sx) ? sx : [sx]),
          ]}
        >
          <CreateHeader onBack={handleBack} onSampleView={handleSampleView} />

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
                위험요인 제거·대체 및 통제 등록
              </Typography>
            </Box>

            {/* Risk Assessment Table Form */}
            <RiskAssessmentTableForm
              rows={rows}
              onRowChange={handleRowChange}
              onRowDelete={handleRowDelete}
              onRowMove={handleRowMove}
              onAddRow={handleAddRow}
            />
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
