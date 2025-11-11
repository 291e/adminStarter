import type { RouteObject } from 'react-router';

import { Outlet } from 'react-router';
import { lazy, Suspense } from 'react';

import { AuthSplitLayout } from 'src/layouts/auth-split';

import { SplashScreen } from 'src/components/loading-screen';

import { GuestGuard } from 'src/auth/guard';

// ----------------------------------------------------------------------

/** **************************************
 * Jwt
 *************************************** */
const Jwt = {
  SignInPage: lazy(() => import('src/pages/auth/jwt/sign-in')),
  SignUpPage: lazy(() => import('src/pages/auth/jwt/sign-up')),
  FindIdPage: lazy(() => import('src/pages/auth/jwt/find-id')),
  FindIdSuccessPage: lazy(() => import('src/pages/auth/jwt/find-id-success')),
  FindIdFailPage: lazy(() => import('src/pages/auth/jwt/find-id-fail')),
  ResetPasswordPage: lazy(() => import('src/pages/auth/jwt/reset-password')),
  ResetPasswordNewPage: lazy(() => import('src/pages/auth/jwt/reset-password-new')),
  VerifyCodePage: lazy(() => import('src/pages/auth/jwt/verify-code')),
};

const authJwt = {
  path: 'jwt',
  children: [
    {
      path: 'sign-in',
      element: (
        <GuestGuard>
          <AuthSplitLayout
            slotProps={{
              section: { title: '환영합니다.' },
            }}
          >
            <Jwt.SignInPage />
          </AuthSplitLayout>
        </GuestGuard>
      ),
    },
    {
      path: 'sign-up',
      element: (
        <GuestGuard>
          <AuthSplitLayout>
            <Jwt.SignUpPage />
          </AuthSplitLayout>
        </GuestGuard>
      ),
    },
    {
      path: 'find-id',
      element: (
        <GuestGuard>
          <AuthSplitLayout>
            <Jwt.FindIdPage />
          </AuthSplitLayout>
        </GuestGuard>
      ),
    },
    {
      path: 'find-id-success',
      element: (
        <GuestGuard>
          <AuthSplitLayout>
            <Jwt.FindIdSuccessPage />
          </AuthSplitLayout>
        </GuestGuard>
      ),
    },
    {
      path: 'find-id-fail',
      element: (
        <GuestGuard>
          <AuthSplitLayout>
            <Jwt.FindIdFailPage />
          </AuthSplitLayout>
        </GuestGuard>
      ),
    },
    {
      path: 'reset-password',
      element: (
        <GuestGuard>
          <AuthSplitLayout>
            <Jwt.ResetPasswordPage />
          </AuthSplitLayout>
        </GuestGuard>
      ),
    },
    {
      path: 'reset-password-new',
      element: (
        <GuestGuard>
          <AuthSplitLayout>
            <Jwt.ResetPasswordNewPage />
          </AuthSplitLayout>
        </GuestGuard>
      ),
    },
    {
      path: 'verify-code',
      element: (
        <GuestGuard>
          <AuthSplitLayout>
            <Jwt.VerifyCodePage />
          </AuthSplitLayout>
        </GuestGuard>
      ),
    },
  ],
};

// ----------------------------------------------------------------------

export const authRoutes: RouteObject[] = [
  {
    path: 'auth',
    element: (
      <Suspense fallback={<SplashScreen />}>
        <Outlet />
      </Suspense>
    ),
    children: [authJwt],
  },
];
