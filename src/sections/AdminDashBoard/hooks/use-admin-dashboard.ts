import { useQuery } from '@tanstack/react-query';
import {
  getAdminDashboardDefaultRange,
  getAdminDashboardMemberCompanies,
  getAdminDashboardSummary,
  getAdminDashboardSubscriptionDistribution,
  getAdminDashboardSalesTrend,
  getAdminDashboardDocumentStatusMatrix,
} from 'src/services/admin-dashboard/admin-dashboard.service';
import type {
  DocumentStatusSearchField,
  SalesUnit,
} from 'src/services/admin-dashboard/admin-dashboard.types';

// ----------------------------------------------------------------------

type Params = {
  companyIdx?: number;
  memberCompaniesPage?: number;
  memberCompaniesPageSize?: number;
  memberCompaniesSearch?: string;
  memberCompaniesIsActive?: number;
  salesUnit: SalesUnit;
  salesPoints?: number;
  matrixSearchField?: DocumentStatusSearchField;
  matrixSearchValue?: string;
  matrixRefreshTick?: number;
};

export function useAdminDashboardData({
  companyIdx,
  memberCompaniesPage = 1,
  memberCompaniesPageSize = 10,
  memberCompaniesSearch = '',
  memberCompaniesIsActive,
  salesUnit,
  salesPoints = 6,
  matrixSearchField = 'documentCode',
  matrixSearchValue = '',
  matrixRefreshTick = 0,
}: Params) {
  const { data: defaultRangeData, isLoading: defaultRangeLoading } = useQuery({
    queryKey: ['adminDashboard', 'defaultRange'],
    queryFn: getAdminDashboardDefaultRange,
  });

  const defaultRangePayload =
    (defaultRangeData as any)?.body?.data || (defaultRangeData as any)?.body || defaultRangeData;
  const from = (defaultRangePayload as any)?.from;
  const to = (defaultRangePayload as any)?.to;

  const { data: organizationData, isLoading: organizationLoading } = useQuery({
    queryKey: [
      'adminDashboard',
      'memberCompanies',
      memberCompaniesPage,
      memberCompaniesPageSize,
      memberCompaniesSearch,
      memberCompaniesIsActive,
    ],
    queryFn: () =>
      getAdminDashboardMemberCompanies({
        page: memberCompaniesPage,
        pageSize: memberCompaniesPageSize,
        search: memberCompaniesSearch || undefined,
        isActive: memberCompaniesIsActive,
      }),
  });

  const { data: summaryData, isLoading: summaryLoading } = useQuery({
    queryKey: ['adminDashboard', 'summary', from, to, companyIdx],
    queryFn: () => getAdminDashboardSummary({ from, to, companyIdx }),
    enabled: !!from && !!to,
  });

  const { data: subscriptionDistributionData, isLoading: subscriptionDistributionLoading } = useQuery({
    queryKey: ['adminDashboard', 'subscriptionDistribution', from, to, companyIdx],
    queryFn: () => getAdminDashboardSubscriptionDistribution({ from, to, companyIdx }),
    enabled: !!from && !!to,
  });

  const { data: salesTrendData, isLoading: salesTrendLoading } = useQuery({
    queryKey: ['adminDashboard', 'salesTrend', salesUnit, salesPoints, from, to, companyIdx],
    queryFn: () =>
      getAdminDashboardSalesTrend({
        unit: salesUnit,
        points: salesPoints,
        from,
        to,
        companyIdx,
      }),
    enabled: !!from && !!to,
  });

  const { data: documentStatusMatrixData, isLoading: documentStatusMatrixLoading } = useQuery({
    queryKey: [
      'adminDashboard',
      'documentStatusMatrix',
      from,
      to,
      companyIdx,
      matrixSearchField,
      matrixSearchValue,
      matrixRefreshTick,
    ],
    queryFn: () =>
      getAdminDashboardDocumentStatusMatrix({
        from,
        to,
        companyIdx,
        searchField: matrixSearchField,
        searchValue: matrixSearchValue || undefined,
      }),
    enabled: !!from && !!to,
  });

  return {
    defaultRangeData,
    defaultRangeLoading,
    organizationData,
    organizationLoading,
    summaryData,
    summaryLoading,
    subscriptionDistributionData,
    subscriptionDistributionLoading,
    salesTrendData,
    salesTrendLoading,
    documentStatusMatrixData,
    documentStatusMatrixLoading,
  };
}
