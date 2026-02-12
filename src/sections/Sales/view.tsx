import { useMemo, useState } from 'react';
import dayjs, { type Dayjs } from 'dayjs';

import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';

import { useNavigate } from 'react-router';
import { DashboardContent } from 'src/layouts/dashboard';
import { RouterLink } from 'src/routes/components';
import { paths } from 'src/routes/paths';
import { CONFIG } from 'src/global-config';
import { fNumber } from 'src/utils/format-number';
import type { Organization } from 'src/services/organization/organization.types';
import { useOrganizations } from 'src/sections/Organization/hooks/use-organization-api';
import AdminSummaryCard from 'src/sections/AdminDashBoard/components/AdminSummaryCard';
import AdminSalesChart from 'src/sections/AdminDashBoard/components/AdminSalesChart';
import OrganizationTabs from 'src/sections/Organization/components/Tabs';
import OrganizationFilters from 'src/sections/Organization/components/Filters';
import OrganizationPagination from 'src/sections/Organization/components/Pagination';

import CompanySalesTable, { type CompanySalesRow } from './components/company-sales-table';

// ----------------------------------------------------------------------

const DIVISION_TO_COMPANY_TYPE: Record<string, string | undefined> = {
  all: undefined,
  operator: 'OPERATOR',
  member: 'MEMBER',
  distributor: 'DISTRIBUTOR',
  agency: 'AGENCY',
  dealer: 'DEALER',
  nonmember: 'NON_MEMBER',
};

const renderSalesIcon = (fileName: string) => (
  <Box
    component="img"
    src={`${CONFIG.assetsDir}/assets/icons/sales/${fileName}`}
    alt=""
    sx={{ width: 32, height: 32, objectFit: 'cover' }}
  />
);

export function SalesView() {
  const navigate = useNavigate();

  const [tab, setTab] = useState<'all' | 'active' | 'inactive'>('all');
  const [division, setDivision] = useState<
    'all' | 'operator' | 'member' | 'distributor' | 'agency' | 'dealer' | 'nonmember'
  >('all');
  const [searchField, setSearchField] = useState<'all' | 'orgName' | 'manager'>('all');
  const [searchValue, setSearchValue] = useState('');
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const { data: organizationData, isLoading } = useOrganizations({
    page: 1,
    pageSize: 1000,
    status: undefined,
    companyType: DIVISION_TO_COMPANY_TYPE[division] as any,
  });

  const organizations: Organization[] = useMemo(
    () =>
      (organizationData as any)?.body?.companyList || (organizationData as any)?.companyList || [],
    [organizationData]
  );

  const counts = useMemo(
    () => ({
      all: organizations.length,
      active: organizations.filter((org) => org.isActive === 1 || org.status === 'active').length,
      inactive: organizations.filter((org) => org.isActive === 0 || org.status === 'inactive')
        .length,
    }),
    [organizations]
  );

  const filtered = useMemo(() => {
    let result = organizations;

    if (tab !== 'all') {
      result = result.filter((org) =>
        tab === 'active'
          ? org.isActive === 1 || org.status === 'active'
          : org.isActive === 0 || org.status === 'inactive'
      );
    }

    if (startDate || endDate) {
      result = result.filter((org) => {
        const date = org.createAt ? dayjs(org.createAt) : null;
        if (!date) return false;
        if (startDate && date.isBefore(startDate, 'day')) return false;
        if (endDate && date.isAfter(endDate, 'day')) return false;
        return true;
      });
    }

    if (searchValue.trim()) {
      const keyword = searchValue.trim().toLowerCase();
      result = result.filter((org) => {
        const manager = org.manager?.memberName || org.representativeName || '';
        const orgName = org.companyName || '';
        if (searchField === 'orgName') return orgName.toLowerCase().includes(keyword);
        if (searchField === 'manager') return manager.toLowerCase().includes(keyword);
        return orgName.toLowerCase().includes(keyword) || manager.toLowerCase().includes(keyword);
      });
    }

    return result;
  }, [organizations, tab, startDate, endDate, searchField, searchValue]);

  const pagedRows = useMemo(() => {
    const start = page * rowsPerPage;
    const pageRows = filtered.slice(start, start + rowsPerPage);

    return pageRows.map((org, index): CompanySalesRow => {
      const accidentInfo = org.accidentFreeInformation;
      const accidentStatus = accidentInfo?.accidentFreeStatus;
      const accidentYear = accidentInfo?.accidentFreeExpiresAt
        ? new Date(accidentInfo.accidentFreeExpiresAt).getFullYear()
        : accidentInfo?.accidentFreeCertifiedAt
          ? new Date(accidentInfo.accidentFreeCertifiedAt).getFullYear()
          : null;

      return {
        companyIdx: org.companyIdx,
        sequence: filtered.length - (start + index),
        registeredAt: org.createAt,
        companyName: org.companyName,
        managerName: org.manager?.memberName || org.representativeName || '-',
        phone: org.phone || org.manager?.memberPhone || '-',
        email: org.email || org.manager?.memberEmail || '-',
        accidentFreeLabel:
          accidentStatus && accidentStatus !== 'none' && accidentStatus !== 'NONE'
            ? `${accidentYear || new Date().getFullYear()}년 무재해 사업장`
            : undefined,
        accidentFreePending: accidentStatus === 'PENDING',
        status: org.isActive === 1 || org.status === 'active' ? 'active' : 'inactive',
        subscriptionName:
          (org as any).subscriptionType || (org as any).subscriptionName || '안전해YOU 스타터',
        cumulativeSales:
          Number((org as any).cumulativeSales ?? (org as any).totalSales ?? (org as any).sales) ||
          56315000,
        lastPaymentAt: (org as any).lastPaymentAt || org.createAt,
        nextPaymentAt: (org as any).nextPaymentAt,
      };
    });
  }, [filtered, page, rowsPerPage]);

  const totalSales = useMemo(() => {
    const sum = filtered.reduce((acc, org) => {
      const value = Number(
        (org as any).cumulativeSales ?? (org as any).totalSales ?? (org as any).sales
      );
      return acc + (Number.isFinite(value) && value > 0 ? value : 0);
    }, 0);
    return sum > 0 ? sum : 56315000;
  }, [filtered]);

  const avgMonthlySales = Math.round(totalSales / 7);

  return (
    <DashboardContent maxWidth="xl" sx={{ width: '100%', height: '100%' }}>
      <Typography
        variant="h4"
        sx={{
          mb: { xs: 2, sm: 3, md: 1.5 },
          fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' },
        }}
      >
        매출 관리
      </Typography>

      <Breadcrumbs
        separator={<Typography sx={{ color: 'text.disabled', fontSize: 12 }}>•</Typography>}
        sx={{ mb: 3 }}
      >
        <Link
          component={RouterLink}
          href={paths.dashboard.root}
          color="inherit"
          sx={{ fontSize: 13, color: 'text.secondary' }}
        >
          대시보드
        </Link>
        <Typography sx={{ fontSize: 13, color: 'text.primary' }}>매출 관리</Typography>
      </Breadcrumbs>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <AdminSummaryCard
            title="전체 회원사 수"
            total={counts.all}
            unit="개"
            color="primary"
            icon={renderSalesIcon('sales1.svg')}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <AdminSummaryCard
            title="평균 이용 기간"
            total="8.3"
            unit="개월"
            color="info"
            icon={renderSalesIcon('sales2.svg')}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <AdminSummaryCard
            title="총 매출액"
            total={fNumber(totalSales)}
            unit="원"
            color="warning"
            icon={renderSalesIcon('sales3.svg')}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <AdminSummaryCard
            title="월 평균 매출액"
            total={fNumber(avgMonthlySales)}
            unit="원"
            color="success"
            icon={renderSalesIcon('sales4.svg')}
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <AdminSalesChart title="매출액 현황" />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Card sx={{ boxShadow: '0 0 20px rgba(0,0,0,0.05)', borderRadius: 2 }}>
            <Box sx={{ px: 3, py: 2.5 }}>
              <Typography variant="h6">회원사별 매출 현황</Typography>
            </Box>

            <OrganizationTabs
              value={tab}
              onChange={(next) => {
                setTab(next);
                setPage(0);
              }}
              counts={counts}
            />

            <OrganizationFilters
              division={division}
              onChangeDivision={(value) => {
                setDivision(value);
                setPage(0);
              }}
              startDate={startDate}
              onChangeStartDate={(value) => {
                setStartDate(value);
                setPage(0);
              }}
              endDate={endDate}
              onChangeEndDate={(value) => {
                setEndDate(value);
                setPage(0);
              }}
              searchField={searchField}
              onChangeSearchField={(value) => {
                setSearchField(value);
                setPage(0);
              }}
              searchValue={searchValue}
              onChangeSearchValue={(value) => {
                setSearchValue(value);
                setPage(0);
              }}
            />

            {isLoading ? (
              <Box sx={{ p: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  데이터를 불러오는 중...
                </Typography>
              </Box>
            ) : (
              <>
                <CompanySalesTable
                  rows={pagedRows}
                  onClickCompany={(companyIdx) => {
                    navigate(paths.dashboard.organization.detail(String(companyIdx)));
                  }}
                />
                <OrganizationPagination
                  count={filtered.length}
                  page={page}
                  rowsPerPage={rowsPerPage}
                  onChangePage={setPage}
                  onChangeRowsPerPage={(rows) => {
                    setRowsPerPage(rows);
                    setPage(0);
                  }}
                />
              </>
            )}
          </Card>
        </Grid>
      </Grid>
    </DashboardContent>
  );
}
