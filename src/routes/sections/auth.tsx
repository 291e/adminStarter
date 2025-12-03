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
        <AuthSplitLayout>
          <Jwt.SignUpPage />
        </AuthSplitLayout>
      ),
    },
    {
      path: 'find-id',
      element: (
        <AuthSplitLayout>
          <Jwt.FindIdPage />
        </AuthSplitLayout>
      ),
    },
    {
      path: 'find-id-success',
      element: (
        <AuthSplitLayout>
          <Jwt.FindIdSuccessPage />
        </AuthSplitLayout>
      ),
    },
    {
      path: 'find-id-fail',
      element: (
        <AuthSplitLayout>
          <Jwt.FindIdFailPage />
        </AuthSplitLayout>
      ),
    },
    {
      path: 'reset-password',
      element: (
        <AuthSplitLayout>
          <Jwt.ResetPasswordPage />
        </AuthSplitLayout>
      ),
    },
    {
      path: 'reset-password-new',
      element: (
        <AuthSplitLayout>
          <Jwt.ResetPasswordNewPage />
        </AuthSplitLayout>
      ),
    },
    {
      path: 'verify-code',
      element: (
        <AuthSplitLayout>
          <Jwt.VerifyCodePage />
        </AuthSplitLayout>
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
