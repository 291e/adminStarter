// ----------------------------------------------------------------------

const ROOTS = {
  AUTH: '/auth',
  DASHBOARD: '/dashboard',
};

// ----------------------------------------------------------------------

export const paths = {
  faqs: '/faqs',
  minimalStore: 'https://mui.com/store/items/minimal-dashboard/',
  // AUTH
  auth: {
    amplify: {
      signIn: `${ROOTS.AUTH}/amplify/sign-in`,
      verify: `${ROOTS.AUTH}/amplify/verify`,
      signUp: `${ROOTS.AUTH}/amplify/sign-up`,
      updatePassword: `${ROOTS.AUTH}/amplify/update-password`,
      resetPassword: `${ROOTS.AUTH}/amplify/reset-password`,
    },
    jwt: {
      signIn: `${ROOTS.AUTH}/jwt/sign-in`,
      signUp: `${ROOTS.AUTH}/jwt/sign-up`,
      findId: `${ROOTS.AUTH}/jwt/find-id`,
      findIdSuccess: `${ROOTS.AUTH}/jwt/find-id-success`,
      findIdFail: `${ROOTS.AUTH}/jwt/find-id-fail`,
      resetPassword: `${ROOTS.AUTH}/jwt/reset-password`,
      resetPasswordNew: `${ROOTS.AUTH}/jwt/reset-password-new`,
      verifyCode: `${ROOTS.AUTH}/jwt/verify-code`,
    },
    firebase: {
      signIn: `${ROOTS.AUTH}/firebase/sign-in`,
      verify: `${ROOTS.AUTH}/firebase/verify`,
      signUp: `${ROOTS.AUTH}/firebase/sign-up`,
      resetPassword: `${ROOTS.AUTH}/firebase/reset-password`,
    },
    auth0: {
      signIn: `${ROOTS.AUTH}/auth0/sign-in`,
    },
    supabase: {
      signIn: `${ROOTS.AUTH}/supabase/sign-in`,
      verify: `${ROOTS.AUTH}/supabase/verify`,
      signUp: `${ROOTS.AUTH}/supabase/sign-up`,
      updatePassword: `${ROOTS.AUTH}/supabase/update-password`,
      resetPassword: `${ROOTS.AUTH}/supabase/reset-password`,
    },
  },
  // DASHBOARD
  dashboard: {
    root: ROOTS.DASHBOARD,
    sharedDocument: {
      root: `${ROOTS.DASHBOARD}/shared-document`,
    },
    organization: {
      root: `${ROOTS.DASHBOARD}/organization`,
      detail: (id: string) => `${ROOTS.DASHBOARD}/organization/detail/${id}`,
    },
    operation: {
      root: `${ROOTS.DASHBOARD}/operation`,
      chat: `${ROOTS.DASHBOARD}/operation/chat`,
      riskReport: `${ROOTS.DASHBOARD}/operation/risk-report`,
      riskReportCreate: `${ROOTS.DASHBOARD}/operation/risk-report/create`,
      educationReport: `${ROOTS.DASHBOARD}/operation/education-report`,
      libraryReport: `${ROOTS.DASHBOARD}/operation/library-report`,
    },
    safetySystem: {
      root: `${ROOTS.DASHBOARD}/safety-system`,
    },
    systemSetting: {
      root: `${ROOTS.DASHBOARD}/system-setting`,
      serviceSetting: `${ROOTS.DASHBOARD}/system-setting/service-setting`,
      codeSetting: `${ROOTS.DASHBOARD}/system-setting/code-setting`,
      apiSetting: `${ROOTS.DASHBOARD}/system-setting/api-setting`,
      industryChecklistSetting: `${ROOTS.DASHBOARD}/system-setting/industry-checklist-setting`,
    },
  },
};
