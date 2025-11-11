import { useNavigate } from 'react-router';

import type { Theme, SxProps } from '@mui/material/styles';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';

import { DashboardContent } from 'src/layouts/dashboard';
import { Iconify } from 'src/components/iconify';
import RiskReportForm, { type RiskReportFormData } from './components/Form';

// ----------------------------------------------------------------------

type Props = {
  title?: string;
  description?: string;
  sx?: SxProps<Theme>;
};

export function RiskReportCreateView({ title = '위험 보고 등록', description, sx }: Props) {
  const navigate = useNavigate();

  const handleSubmit = (data: RiskReportFormData) => {
    // TODO: TanStack Query Hook(useMutation)으로 위험 보고 등록
    // const mutation = useMutation({
    //   mutationFn: (formData: RiskReportFormData) => createRiskReport(formData),
    //   onSuccess: () => {
    //     queryClient.invalidateQueries({ queryKey: ['riskReports'] });
    //     navigate('/dashboard/operation/risk-report');
    //   },
    // });
    // mutation.mutate(data);
    console.log('위험 보고 등록:', data);
    // 등록 후 목록으로 이동
    navigate('/dashboard/operation/risk-report');
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
        <RiskReportForm onSubmit={handleSubmit} onCancel={handleCancel} />
      </Box>
    </DashboardContent>
  );
}
