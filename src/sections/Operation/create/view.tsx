import { useNavigate } from 'react-router';

import type { Theme, SxProps } from '@mui/material/styles';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';

import { DashboardContent } from 'src/layouts/dashboard';
import { Iconify } from 'src/components/iconify';
import RiskReportForm, { type RiskReportFormData } from './components/Form';
import { useCreateRiskReport } from '../hooks/use-operation-api';
import { uploadFile } from 'src/services/system/system.service';

// ----------------------------------------------------------------------

type Props = {
  title?: string;
  description?: string;
  sx?: SxProps<Theme>;
};

export function RiskReportCreateView({ title = '위험 보고 등록', description, sx }: Props) {
  const navigate = useNavigate();
  const createRiskReportMutation = useCreateRiskReport();

  const handleSubmit = async (data: RiskReportFormData) => {
    try {
      let imageUrls: string[] = [];

      if (data.images.length > 0) {
        if (import.meta.env.DEV) {
          console.log('📤 [RiskReportCreateView] 이미지 업로드 시작', data.images.length);
        }
        const uploadResponse = await uploadFile({ files: data.images });
        const uploadedUrls =
          (uploadResponse as unknown as { fileUrls?: string[] }).fileUrls ??
          uploadResponse?.body?.fileUrls ??
          [];
        if (!uploadedUrls.length) {
          throw new Error('이미지 업로드에 실패했습니다.');
        }
        imageUrls = uploadedUrls;
      }

      const payload = {
        title: data.title.trim(),
        location: data.location.trim(),
        content: data.content,
        imageUrl: imageUrls[0],
        imageUrls,
        signalType:
          data.signalType && ['RISK', 'RESCUE', 'EVACUATION'].includes(data.signalType)
            ? (data.signalType as 'RISK' | 'RESCUE' | 'EVACUATION')
            : undefined,
        sourceType:
          data.sourceType && ['CHAT', 'DIRECT'].includes(data.sourceType)
            ? (data.sourceType as 'CHAT' | 'DIRECT')
            : undefined,
        description: data.description || undefined,
        memo: data.memo || undefined,
        chatRoomIdx: data.chatRoomId ? Number(data.chatRoomId) : undefined,
        reporterName: data.reporterName || undefined,
        authorName: data.authorName || undefined,
      };

      if (import.meta.env.DEV) {
        console.log('📤 [RiskReportCreateView] 위험 보고 등록 제출', payload);
      }

      await createRiskReportMutation.mutateAsync(payload);
      if (import.meta.env.DEV) {
        console.log('✅ [RiskReportCreateView] 위험 보고 등록 완료');
      }
      navigate('/dashboard/operation/risk-report');
    } catch (error) {
      console.error('❌ [RiskReportCreateView] 위험 보고 등록 실패', error);
    }
  };

  const handleCancel = () => {
    navigate('/dashboard/operation/risk-report');
  };

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
          isSubmitting={createRiskReportMutation.isPending}
        />
      </Box>
    </DashboardContent>
  );
}
