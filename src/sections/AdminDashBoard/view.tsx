import type { Theme, SxProps } from '@mui/material/styles';

import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

import { DashboardContent } from 'src/layouts/dashboard';
import { useAdminDashboardData } from './hooks/use-admin-dashboard';
import { CONFIG } from 'src/global-config';

import AdminSummaryCard from './components/AdminSummaryCard';
import AdminOrganizationList from './components/AdminOrganizationList';
import AdminSalesChart from './components/AdminSalesChart';
import AdminSubscriptionChart from './components/AdminSubscriptionChart';
import AdminDocumentStatus from './components/AdminDocumentStatus';

// ----------------------------------------------------------------------

type Props = {
  title?: string;
  sx?: SxProps<Theme>;
};

const renderSalesIcon = (fileName: string) => (
  <Box
    component="img"
    src={`${CONFIG.assetsDir}/assets/icons/sales/${fileName}`}
    alt=""
    sx={{ width: 32, height: 32, objectFit: 'cover' }}
  />
);

export function AdminDashBoardView({ title = '최고관리자 대시보드', sx }: Props) {
  const { organizationData } = useAdminDashboardData();

  // organizationData is BaseResponseDto<{ companyList: ..., totalCount: ... }>
  // We need to access organizationData.companyList (based on types) or organizationData.data?
  // Checking organization.service.ts again: `GetOrganizationsResponse = BaseResponseDto<{ companyList, totalCount }>`
  // So organizationData will have structure according to BaseResponseDto. Usually: { header: { ... }, body: { companyList: ... } } or similar?
  // Axios response.data is returned.
  // Assuming BaseResponseDto has `header` and `body` (common pattern in this project) OR it's flat.
  // Wait, in `src/sections/DashBoard/view.tsx`: `(reportsData as any)?.body?.riskReportList`
  // So likely `body` contains the payload.

  const totalOrganizations =
    (organizationData as any)?.body?.totalCount || (organizationData as any)?.totalCount || 0;
  const companyList =
    (organizationData as any)?.body?.companyList || (organizationData as any)?.companyList || [];

  return (
    <DashboardContent maxWidth="xl" sx={{ width: '100%', height: '100%' }}>
      <Typography
        variant="h4"
        sx={{
          mb: { xs: 2, sm: 3, md: 3.5 },
          fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' },
        }}
      >
        {title}
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <AdminSummaryCard
            title="전체 회원사"
            total={totalOrganizations}
            unit="개"
            color="primary"
            icon={renderSalesIcon('sales1.svg')}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <AdminSummaryCard
            title="신규 가입 / 해지"
            total="12 / 2"
            unit="건"
            color="info"
            icon={renderSalesIcon('sales2.svg')}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <AdminSummaryCard
            title="총 매출액"
            total="56,315,000"
            unit="원"
            color="warning"
            icon={renderSalesIcon('sales3.svg')}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <AdminSummaryCard
            title="일 평균 매출액"
            total="8,045,000"
            unit="원"
            color="success"
            icon={renderSalesIcon('sales4.svg')}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <AdminSalesChart title="매출액 현황" />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <AdminSubscriptionChart title="구독 서비스 현황" />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <AdminOrganizationList
            title="회원사 관리"
            tableData={companyList}
            tableLabels={[
              { id: 'companyName', label: '조직명' },
              { id: 'representativeName', label: '담당자', align: 'center' },
              { id: 'totalMembers', label: '전체 조직원 수', align: 'center' },
              { id: 'educationStatus', label: '교육 이수 현황', align: 'center' },
              { id: 'isAccidentFree', label: '무재해 사업장', align: 'center' },
              { id: 'status', label: '상태', align: 'center' },
              { id: 'subscription', label: '구독 서비스' },
              { id: 'cumulativeSales', label: '누적 매출', align: 'right' },
              { id: 'lastPaymentAt', label: '최근 결제일', align: 'right' },
            ]}
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <AdminDocumentStatus title="문서 작성 현황" />
        </Grid>
      </Grid>
    </DashboardContent>
  );
}
