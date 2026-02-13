import axiosInstance, { endpoints } from 'src/lib/axios';

import type {
  GetAdminDashboardDefaultRangeResponse,
  GetAdminDashboardMemberCompaniesParams,
  GetAdminDashboardMemberCompaniesResponse,
  GetAdminDashboardSummaryParams,
  GetAdminDashboardSummaryResponse,
  GetAdminDashboardSubscriptionDistributionParams,
  GetAdminDashboardSubscriptionDistributionResponse,
  GetAdminDashboardSalesTrendParams,
  GetAdminDashboardSalesTrendResponse,
  GetAdminDashboardDocumentStatusMatrixParams,
  GetAdminDashboardDocumentStatusMatrixResponse,
  GetAdminDashboardDocumentStatusDetailsParams,
  GetAdminDashboardDocumentStatusDetailsResponse,
} from './admin-dashboard.types';

export async function getAdminDashboardDefaultRange(): Promise<GetAdminDashboardDefaultRangeResponse> {
  const response = await axiosInstance.get<GetAdminDashboardDefaultRangeResponse>(
    endpoints.adminDashboard.defaultRange
  );
  return response.data;
}

export async function getAdminDashboardSummary(
  params: GetAdminDashboardSummaryParams
): Promise<GetAdminDashboardSummaryResponse> {
  const response = await axiosInstance.get<GetAdminDashboardSummaryResponse>(
    endpoints.adminDashboard.summary,
    { params }
  );
  return response.data;
}

export async function getAdminDashboardMemberCompanies(
  params: GetAdminDashboardMemberCompaniesParams
): Promise<GetAdminDashboardMemberCompaniesResponse> {
  const response = await axiosInstance.get<GetAdminDashboardMemberCompaniesResponse>(
    endpoints.adminDashboard.memberCompanies,
    { params }
  );
  return response.data;
}

export async function getAdminDashboardSubscriptionDistribution(
  params: GetAdminDashboardSubscriptionDistributionParams
): Promise<GetAdminDashboardSubscriptionDistributionResponse> {
  const response = await axiosInstance.get<GetAdminDashboardSubscriptionDistributionResponse>(
    endpoints.adminDashboard.subscriptionDistribution,
    { params }
  );
  return response.data;
}

export async function getAdminDashboardSalesTrend(
  params: GetAdminDashboardSalesTrendParams
): Promise<GetAdminDashboardSalesTrendResponse> {
  const response = await axiosInstance.get<GetAdminDashboardSalesTrendResponse>(
    endpoints.adminDashboard.salesTrend,
    { params }
  );
  return response.data;
}

export async function getAdminDashboardDocumentStatusMatrix(
  params: GetAdminDashboardDocumentStatusMatrixParams
): Promise<GetAdminDashboardDocumentStatusMatrixResponse> {
  const response = await axiosInstance.get<GetAdminDashboardDocumentStatusMatrixResponse>(
    endpoints.adminDashboard.documentStatusMatrix,
    { params }
  );
  return response.data;
}

export async function getAdminDashboardDocumentStatusDetails(
  params: GetAdminDashboardDocumentStatusDetailsParams
): Promise<GetAdminDashboardDocumentStatusDetailsResponse> {
  const response = await axiosInstance.get<GetAdminDashboardDocumentStatusDetailsResponse>(
    endpoints.adminDashboard.documentStatusDetails,
    { params }
  );
  return response.data;
}
