import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router';

import type { Theme, SxProps } from '@mui/material/styles';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';

import { DashboardContent } from 'src/layouts/dashboard';
import { Iconify } from 'src/components/iconify';
import RiskReportForm, { type RiskReportFormData } from '../create/components/Form';
import { useRiskReportDetail, useUpdateRiskReport } from '../hooks/use-operation-api';
import { uploadFile } from 'src/services/system/system.service';
import type { RiskReport } from 'src/services/operation/operation.types';

// ----------------------------------------------------------------------

type Props = {
  title?: string;
  description?: string;
  sx?: SxProps<Theme>;
};

export function RiskReportEditView({ title = '위험 보고 수정', description, sx }: Props) {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const updateRiskReportMutation = useUpdateRiskReport();

  const { data, isLoading, isError } = useRiskReportDetail({ riskReportIdx: id || '' }, !!id);

  // 위험 보고 데이터 추출
  // axios 인터셉터가 평탄화하므로 data 자체가 RiskReport + header 형태
  const riskReport = useMemo(() => {
    if (!data) return null;
    // header를 제외한 나머지가 RiskReport 데이터
    const { ...reportData } = data as unknown as RiskReport;
    if (!reportData.id && !reportData.riskReportIdx) return null;
    return reportData;
  }, [data]);

  const handleSubmit = async (formData: RiskReportFormData) => {
    if (!id || !riskReport) return;

    try {
      let imageUrls: string[] = [];

      // 새로 업로드한 이미지가 있으면 업로드
      if (formData.images.length > 0) {
        if (import.meta.env.DEV) {
          console.log('📤 [RiskReportEditView] 이미지 업로드 시작', formData.images.length);
        }
        const uploadResponse = await uploadFile({ files: formData.images });
        const uploadedUrls =
          (uploadResponse as unknown as { fileUrls?: string[] }).fileUrls ??
          uploadResponse?.body?.fileUrls ??
          [];
        if (!uploadedUrls.length) {
          throw new Error('이미지 업로드에 실패했습니다.');
        }
        imageUrls = uploadedUrls;
      }

      // 기존 이미지 URL과 새로 업로드한 이미지 URL 결합
      const existingImageUrls = riskReport.imageUrls || [];
      const allImageUrls = [...existingImageUrls, ...imageUrls];

      const payload = {
        riskReportIdx: id,
        title: formData.title.trim(),
        location: formData.location.trim(),
        content: formData.content,
        imageUrl: allImageUrls[0] || undefined,
        imageUrls: allImageUrls.length > 0 ? allImageUrls : undefined,
        signalType:
          formData.signalType && ['RISK', 'RESCUE', 'EVACUATION'].includes(formData.signalType)
            ? (formData.signalType as 'RISK' | 'RESCUE' | 'EVACUATION')
            : undefined,
        description: formData.description || undefined,
        memo: formData.memo || undefined,
        reporterName: formData.reporterName || undefined,
        authorName: formData.authorName || undefined,
        status:
          formData.status && ['CONFIRMED', 'UNCONFIRMED'].includes(formData.status)
            ? (formData.status as 'CONFIRMED' | 'UNCONFIRMED')
            : undefined,
        isActive: undefined, // 필요시 추가
      };

      if (import.meta.env.DEV) {
        console.log('📤 [RiskReportEditView] 위험 보고 수정 제출', payload);
      }

      await updateRiskReportMutation.mutateAsync(payload);
      if (import.meta.env.DEV) {
        console.log('✅ [RiskReportEditView] 위험 보고 수정 완료');
      }
      navigate('/dashboard/operation/risk-report');
    } catch (error) {
      console.error('❌ [RiskReportEditView] 위험 보고 수정 실패', error);
    }
  };

  const handleCancel = () => {
    navigate('/dashboard/operation/risk-report');
  };

  // 초기 데이터 준비
  const initialData = useMemo(() => {
    if (!riskReport) return undefined;

    // PENDING은 UNCONFIRMED로 변환 (Form에서는 CONFIRMED/UNCONFIRMED만 선택 가능)
    const statusValue: 'CONFIRMED' | 'UNCONFIRMED' =
      riskReport.status === 'CONFIRMED' ? 'CONFIRMED' : 'UNCONFIRMED';

    return {
      title: riskReport.title || '',
      location: riskReport.location || '',
      content: riskReport.content || '',
      signalType: riskReport.signalType || '',
      sourceType: riskReport.sourceType || '',
      description: riskReport.description || '',
      memo: riskReport.memo || '',
      chatRoomId: riskReport.chatRoomId || '',
      reporterName: riskReport.reporterName || '',
      authorName: riskReport.authorName || '',
      existingImageUrls: riskReport.imageUrls || [],
      status: statusValue,
    };
  }, [riskReport]);

  if (isLoading) {
    return (
      <DashboardContent maxWidth="xl">
        <Stack alignItems="center" justifyContent="center" sx={{ py: 8 }}>
          <CircularProgress />
          <Typography variant="body2" sx={{ mt: 2 }}>
            위험 보고 정보를 불러오는 중...
          </Typography>
        </Stack>
      </DashboardContent>
    );
  }

  if (isError || !riskReport) {
    return (
      <DashboardContent maxWidth="xl">
        <Alert severity="error" sx={{ m: 2 }}>
          위험 보고 정보를 불러오는 중 오류가 발생했습니다.
        </Alert>
      </DashboardContent>
    );
  }

  return (
    <DashboardContent maxWidth="xl">
      {/* 타이틀과 뒤로가기 버튼 */}
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <IconButton onClick={handleCancel} sx={{ p: 1 }}>
          <Iconify icon="eva:arrow-ios-back-fill" width={20} />
        </IconButton>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          위험 보고
        </Typography>
      </Stack>

      {description && <Typography sx={{ mb: 2 }}>{description}</Typography>}

      <Box sx={[(theme) => ({ mt: 2, width: 1 }), ...(Array.isArray(sx) ? sx : [sx])]}>
        <RiskReportForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={updateRiskReportMutation.isPending}
          initialData={initialData}
          mode="edit"
        />
      </Box>
    </DashboardContent>
  );
}
