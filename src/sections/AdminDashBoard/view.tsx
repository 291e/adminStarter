import type { Theme, SxProps } from '@mui/material/styles';
import { useState } from 'react';

import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

import { DashboardContent } from 'src/layouts/dashboard';
import { useAdminDashboardData } from './hooks/use-admin-dashboard';
import { CONFIG } from 'src/global-config';
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';

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
  const router = useRouter();
  const [salesUnit, setSalesUnit] = useState<'week' | 'month' | 'year'>('month');
  const [matrixSearchField, setMatrixSearchField] = useState<'documentCode' | 'documentName'>(
    'documentCode'
  );
  const [matrixSearchValue, setMatrixSearchValue] = useState('');
  const [matrixRefreshTick, setMatrixRefreshTick] = useState(0);
  const [memberCompaniesPage, setMemberCompaniesPage] = useState(1);
  const [memberCompaniesPageSize, setMemberCompaniesPageSize] = useState(10);
  const [memberCompaniesSearch, setMemberCompaniesSearch] = useState('');
  const [memberCompaniesIsActive, setMemberCompaniesIsActive] = useState<number | undefined>(
    undefined
  );

  const {
    defaultRangeLoading,
    organizationData,
    summaryData,
    summaryLoading,
    subscriptionDistributionData,
    subscriptionDistributionLoading,
    salesTrendData,
    salesTrendLoading,
    documentStatusMatrixData,
    documentStatusMatrixLoading,
  } = useAdminDashboardData({
    memberCompaniesPage,
    memberCompaniesPageSize,
    memberCompaniesSearch: memberCompaniesSearch.trim(),
    memberCompaniesIsActive,
    salesUnit,
    salesPoints: 6,
    matrixSearchField,
    matrixSearchValue: matrixSearchValue.trim(),
    matrixRefreshTick,
  });

  const memberCompaniesPayload =
    (organizationData as any)?.body?.data || (organizationData as any)?.body || organizationData;
  const companyList = memberCompaniesPayload?.companies || [];
  const companyTotalCount = memberCompaniesPayload?.totalCount || 0;
  const summary = (summaryData as any)?.body?.data || (summaryData as any)?.body || summaryData;
  const subscriptionDistribution =
    (subscriptionDistributionData as any)?.body?.data ||
    (subscriptionDistributionData as any)?.body ||
    subscriptionDistributionData;
  const salesTrend =
    (salesTrendData as any)?.body?.data || (salesTrendData as any)?.body || salesTrendData;
  const matrixData =
    (documentStatusMatrixData as any)?.body?.data ||
    (documentStatusMatrixData as any)?.body ||
    documentStatusMatrixData;

  const totalOrganizations = summary?.totalOrganizations ?? 0;
  const newSignups = summary?.newSignups ?? 0;
  const cancellations = summary?.cancellations ?? 0;
  const totalSalesAmount = summary?.totalSalesAmount ?? 0;
  const avgDailySalesAmount = summary?.avgDailySalesAmount ?? 0;

  const subscriptionItems = subscriptionDistribution?.items || [];
  const salesLabels = salesTrend?.labels || [];
  const salesSeries = salesTrend?.salesSeries || [];
  const subscriptionSeries = salesTrend?.subscriptionSeries || [];
  const salesTotalAmount = salesTrend?.totalSalesAmount ?? 0;
  const totalSubscriptions = salesTrend?.totalSubscriptions ?? 0;

  const companies = matrixData?.companies || [];
  const documentCodes = matrixData?.tableTypes || matrixData?.documentCodes || [];
  const matrix =
    matrixData?.matrix?.map((row: any) => ({
      ...row,
      documentCode: row?.documentCode || row?.tableType || '',
    })) || [];
  const isLoading =
    defaultRangeLoading ||
    summaryLoading ||
    subscriptionDistributionLoading ||
    salesTrendLoading ||
    documentStatusMatrixLoading;

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

      {isLoading && (
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress size={24} />
        </Box>
      )}

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
            total={`${newSignups} / ${cancellations}`}
            unit="건"
            color="info"
            icon={renderSalesIcon('sales2.svg')}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <AdminSummaryCard
            title="총 매출액"
            total={totalSalesAmount.toLocaleString()}
            unit="원"
            color="warning"
            icon={renderSalesIcon('sales3.svg')}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <AdminSummaryCard
            title="일 평균 매출액"
            total={Math.round(avgDailySalesAmount).toLocaleString()}
            unit="원"
            color="success"
            icon={renderSalesIcon('sales4.svg')}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <AdminSalesChart
            title="매출액 현황"
            unit={salesUnit}
            labels={salesLabels}
            salesSeries={salesSeries}
            subscriptionSeries={subscriptionSeries}
            totalSalesAmount={salesTotalAmount}
            totalSubscriptions={totalSubscriptions}
            onUnitChange={setSalesUnit}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <AdminSubscriptionChart title="구독 서비스 현황" items={subscriptionItems} />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <AdminOrganizationList
            title="회원사 관리"
            tableData={companyList}
            totalCount={companyTotalCount}
            page={memberCompaniesPage}
            pageSize={memberCompaniesPageSize}
            search={memberCompaniesSearch}
            isActive={memberCompaniesIsActive}
            onPageChange={setMemberCompaniesPage}
            onPageSizeChange={setMemberCompaniesPageSize}
            onSearchChange={setMemberCompaniesSearch}
            onIsActiveChange={setMemberCompaniesIsActive}
            onEducationStatusClick={(companyIdx) => {
              router.push(
                `${paths.dashboard.organization.detail(String(companyIdx))}?focus=education-status`
              );
            }}
            onViewAll={() => {
              router.push(`${paths.dashboard.organization.root}?focus=education-status`);
            }}
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
          <AdminDocumentStatus
            title="문서 작성 현황"
            companies={companies}
            documentCodes={documentCodes}
            matrix={matrix}
            searchField={matrixSearchField}
            searchValue={matrixSearchValue}
            onSearchFieldChange={setMatrixSearchField}
            onSearchValueChange={setMatrixSearchValue}
            onRefresh={() => setMatrixRefreshTick((prev) => prev + 1)}
          />
        </Grid>
      </Grid>
    </DashboardContent>
  );
}
