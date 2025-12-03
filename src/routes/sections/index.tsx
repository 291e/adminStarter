import type { RouteObject } from 'react-router';

import { lazy, Suspense } from 'react';
import { Navigate } from 'react-router';

import { CONFIG } from 'src/global-config';

import { authRoutes } from './auth';
import { dashboardRoutes } from './dashboard';

import { AuthSplitLayout } from 'src/layouts/auth-split';
import { SplashScreen } from 'src/components/loading-screen';

// ----------------------------------------------------------------------

const Page404 = lazy(() => import('src/pages/error/404'));
const InvitationPage = lazy(() => import('src/pages/admin/invitation'));

export const routesSection: RouteObject[] = [
  {
    path: '/',
    element: <Navigate to={CONFIG.auth.redirectPath} replace />,
  },

  // Admin - 초대 페이지는 인증 여부와 관계없이 접근 가능
  {
    path: '/',
    children: [
      {
        path: 'invitation',
        element: (
          <Suspense fallback={<SplashScreen />}>
            <AuthSplitLayout
              slotProps={{
                section: { title: '초대 링크 검증' },
              }}
            >
              <InvitationPage />
            </AuthSplitLayout>
          </Suspense>
        ),
      },
    ],
  },

  // Auth
  ...authRoutes,

  // Dashboard
  ...dashboardRoutes,

  // No match
  { path: '*', element: <Page404 /> },
];
