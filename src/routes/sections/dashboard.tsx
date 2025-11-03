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
const OrganizationPage = lazy(() => import('src/pages/dashboard/organization/page'));
const OrganizationCreatePage = lazy(() => import('src/pages/dashboard/organization/create'));
const OrganizationEditPage = lazy(() => import('src/pages/dashboard/organization/edit'));
const OperationPage = lazy(() => import('src/pages/dashboard/operation/page'));
const RiskReportPage = lazy(() => import('src/pages/dashboard/operation/page'));
const SafetyReportPage = lazy(() => import('src/pages/dashboard/operation/safetyReport/page'));
const SafetySystemPage = lazy(() => import('src/pages/dashboard/safetySystem/page'));
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
        path: 'organization',
        children: [
          { element: <OrganizationPage />, index: true },
          { path: 'create', element: <OrganizationCreatePage /> },
          { path: ':id/edit', element: <OrganizationEditPage /> },
        ],
      },
      {
        path: 'operation',
        children: [
          { element: <OperationPage />, index: true },
          { path: 'risk-report', element: <RiskReportPage /> },
          { path: 'safety-report', element: <SafetyReportPage /> },
        ],
      },
      {
        path: 'safety-system',
        element: <SafetySystemPage />,
        index: true,
      },
    ],
  },
];
