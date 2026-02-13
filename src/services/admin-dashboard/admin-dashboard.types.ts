import type { BaseResponseDto } from '../common';

export type AdminDashboardBaseParams = {
  from?: string;
  to?: string;
  companyIdx?: number;
};

export type GetAdminDashboardDefaultRangeResponse = BaseResponseDto<{
  from: string;
  to: string;
  timezone: string;
}>;

export type GetAdminDashboardSummaryParams = AdminDashboardBaseParams;

export type GetAdminDashboardSummaryResponse = BaseResponseDto<{
  totalOrganizations: number;
  newSignups: number;
  cancellations: number;
  totalSalesAmount: number;
  avgDailySalesAmount: number;
}>;

export type GetAdminDashboardMemberCompaniesParams = {
  page: number;
  pageSize: number;
  search?: string;
  isActive?: number;
};

export type AdminDashboardMemberCompany = {
  companyIdx: number;
  companyName: string;
  representativeName: string | null;
  isActive: number;
  totalMembers: number;
  educationStatus: {
    notStarted: number;
    inProgress: number;
    completed: number;
  };
  isAccidentFreeWorksite: number;
  hasActiveSubscription: number;
  totalSalesAmount: number;
  recentPaymentDate: string | null;
};

export type GetAdminDashboardMemberCompaniesResponse = BaseResponseDto<{
  companies: AdminDashboardMemberCompany[];
  totalCount: number;
  page: number;
  pageSize: number;
}>;

export type SubscriptionDistributionItem = {
  planCode: string;
  planName: string;
  subscriberCount: number;
  ratio: number;
};

export type GetAdminDashboardSubscriptionDistributionParams = AdminDashboardBaseParams;

export type GetAdminDashboardSubscriptionDistributionResponse = BaseResponseDto<{
  items: SubscriptionDistributionItem[];
}>;

export type SalesUnit = 'week' | 'month' | 'year';

export type GetAdminDashboardSalesTrendParams = AdminDashboardBaseParams & {
  unit: SalesUnit;
  points?: number;
};

export type GetAdminDashboardSalesTrendResponse = BaseResponseDto<{
  labels: string[];
  salesSeries: number[];
  subscriptionSeries: number[];
  totalSalesAmount: number;
  totalSubscriptions: number;
}>;

export type DocumentStatusSearchField = 'documentCode' | 'documentName';

export type GetAdminDashboardDocumentStatusMatrixParams = AdminDashboardBaseParams & {
  searchField?: DocumentStatusSearchField;
  searchValue?: string;
};

export type DocumentStatusCompany = {
  companyIdx: number;
  companyName: string;
};

export type DocumentStatusMatrixRow = {
  documentCode?: string;
  tableType?: string;
  counts: number[];
};

export type GetAdminDashboardDocumentStatusMatrixResponse = BaseResponseDto<{
  companies: DocumentStatusCompany[];
  documentCodes?: string[];
  tableTypes?: string[];
  matrix: DocumentStatusMatrixRow[];
}>;

export type GetAdminDashboardDocumentStatusDetailsParams = {
  code: string;
  page: number;
  pageSize: number;
  startDate?: string;
  endDate?: string;
  search?: string;
  companyIdx?: number;
};

export type DocumentStatusDetailRow = {
  safetySystemDocumentIdx: number;
  documentCode: string;
  documentName: string;
  organizationName: string;
  status: string;
  approvalStep?: number | null;
  isPublished: number;
  documentWrittenAt?: string;
  approvalDeadline?: string;
  createAt: string;
  updateAt: string;
};

export type GetAdminDashboardDocumentStatusDetailsResponse = BaseResponseDto<{
  rows: DocumentStatusDetailRow[];
  totalCount: number;
  page: number;
  pageSize: number;
}>;
