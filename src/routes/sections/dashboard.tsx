import type { RouteObject } from 'react-router';

import { Outlet } from 'react-router';
import { lazy, Suspense } from 'react';

import { CONFIG } from 'src/global-config';
import { DashboardLayout } from 'src/layouts/dashboard';

import { LoadingScreen } from 'src/components/loading-screen';

import { AuthGuard } from 'src/auth/guard';

import { usePathname } from '../hooks';

// ----------------------------------------------------------------------

const IndexPage = lazy(() => import('src/pages/dashboard/page'));
const SharedDocumentPage = lazy(() => import('src/pages/dashboard/sharedDocument/page'));
const OrganizationPage = lazy(() => import('src/pages/dashboard/organization/page'));
const OrganizationDetailPage = lazy(() => import('src/pages/dashboard/organization/detail/page'));
const ChatPage = lazy(() => import('src/pages/dashboard/operation/chat/page'));
const RiskReportPage = lazy(() => import('src/pages/dashboard/operation/riskReport/page'));
const RiskReportCreatePage = lazy(
  () => import('src/pages/dashboard/operation/riskReport/create/page')
);
const SafetyReportPage = lazy(() => import('src/pages/dashboard/operation/safetyReport/page'));
const EducationReportPage = lazy(
  () => import('src/pages/dashboard/operation/educationReport/page')
);
const LibraryReportPage = lazy(() => import('src/pages/dashboard/operation/libraryReport/page'));
const SafetySystemPage = lazy(() => import('src/pages/dashboard/safetySystem/page'));
const SafetySystemRisk2200ListPage = lazy(
  () => import('src/pages/dashboard/safetySystem/[safety_id]/risk-2200/page')
);
const SafetySystemRisk2200CreatePage = lazy(
  () => import('src/pages/dashboard/safetySystem/[safety_id]/risk-2200/create/page')
);
const SafetySystemRisk2200DetailPage = lazy(
  () => import('src/pages/dashboard/safetySystem/[safety_id]/risk-2200/[risk_id]/page')
);
const SystemSettingPage = lazy(() => import('src/pages/dashboard/systemSetting/page'));

const ServiceSettingPage = lazy(
  () => import('src/pages/dashboard/systemSetting/serviceSetting/page')
);
const CodeSettingPage = lazy(() => import('src/pages/dashboard/systemSetting/codeSetting/page'));
const ApiSettingPage = lazy(() => import('src/pages/dashboard/systemSetting/apiSetting/page'));
const IndustryChecklistSettingPage = lazy(
  () => import('src/pages/dashboard/systemSetting/industryChecklist/page')
);
// ----------------------------------------------------------------------

function SuspenseOutlet() {
  const pathname = usePathname();
  return (
    <Suspense key={pathname} fallback={<LoadingScreen />}>
      <Outlet />
    </Suspense>
  );
}

const dashboardLayout = () => (
  <DashboardLayout>
    <SuspenseOutlet />
  </DashboardLayout>
);

export const dashboardRoutes: RouteObject[] = [
  {
    path: 'dashboard',
    element: CONFIG.auth.skip ? dashboardLayout() : <AuthGuard>{dashboardLayout()}</AuthGuard>,
    children: [
      { element: <IndexPage />, index: true },
      {
        path: 'shared-document',
        element: <SharedDocumentPage />,
      },
      {
        path: 'organization',
        children: [
          { element: <OrganizationPage />, index: true },
          { path: 'detail/:id', element: <OrganizationDetailPage /> },
        ],
      },
      {
        path: 'operation',
        children: [
          { element: <ChatPage />, index: true },
          { path: 'chat', element: <ChatPage /> },
          { path: 'risk-report', element: <RiskReportPage /> },
          { path: 'risk-report/create', element: <RiskReportCreatePage /> },
          { path: 'education-report', element: <EducationReportPage /> },
          {
            path: 'library-report',
            element: <LibraryReportPage />,
          },
        ],
      },
      {
        path: 'safety-system',
        children: [
          { element: <SafetySystemPage />, index: true },
          {
            path: ':safety_id',
            children: [
              {
                path: 'risk-2200',
                children: [
                  { element: <SafetySystemRisk2200ListPage />, index: true },
                  { path: 'create', element: <SafetySystemRisk2200CreatePage /> },
                  { path: ':risk_id', element: <SafetySystemRisk2200DetailPage /> },
                ],
              },
            ],
          },
        ],
      },
      {
        path: 'system-setting',
        children: [
          { element: <SystemSettingPage />, index: true },
          { path: 'service-setting', element: <ServiceSettingPage /> },
          { path: 'code-setting', element: <CodeSettingPage /> },
          { path: 'api-setting', element: <ApiSettingPage /> },
          { path: 'industry-checklist-setting', element: <IndustryChecklistSettingPage /> },
        ],
      },
    ],
  },
];
