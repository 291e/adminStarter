import type { AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';

import axios, { AxiosHeaders } from 'axios';

import {
  clearStoredTokens,
  getStoredAccessToken,
  getStoredRefreshToken,
  storeAccessToken,
  storeRefreshToken,
} from 'src/auth/context/jwt/storage';
import { CONFIG } from 'src/global-config';

// ----------------------------------------------------------------------

// 개발 환경에서는 프록시 사용, 프로덕션에서는 전체 URL 사용
const getBaseURL = () => {
  if (import.meta.env.DEV) {
    // 개발 환경: Vite 프록시 사용 (CORS 우회)
    return '/safeyoui/api';
  }
  // 프로덕션 환경: 전체 URL 사용
  return CONFIG.serverUrl;
};

const axiosInstance = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
});

type RetryableRequestConfig = AxiosRequestConfig & {
  _retriedAfterRefresh?: boolean;
  skipAuthRefresh?: boolean;
};

const authFailurePattern = /(token|jwt|unauthorized|로그인|로그아웃|세션)/i;
let refreshPromise: Promise<string | null> | null = null;

const applyAccessToken = (
  headers: InternalAxiosRequestConfig['headers'] | AxiosRequestConfig['headers'] | undefined,
  accessToken: string
) => {
  const normalizedHeaders = AxiosHeaders.from((headers || {}) as any);
  normalizedHeaders.set('Authorization', `Bearer ${accessToken}`);
  return normalizedHeaders;
};

const isAuthFailureEnvelope = (payload: any): boolean => {
  const header = payload?.header;
  if (!header || header.isSuccess !== false) return false;

  const code = Number(header.resultCode);
  const message = String(header.resultMessage || header.message || '');
  return [401, 403, 445].includes(code) || authFailurePattern.test(message);
};

const shouldRefreshAuth = (config?: RetryableRequestConfig | null) => {
  if (!config) return false;
  if (config.skipAuthRefresh || config._retriedAfterRefresh) return false;

  const url = String(config.url || '');
  return url !== endpoints.auth.signIn && url !== endpoints.auth.refreshToken;
};

export async function refreshAuthSession(): Promise<string | null> {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const refreshToken = getStoredRefreshToken();
      if (!refreshToken) {
        clearStoredTokens();
        delete axiosInstance.defaults.headers.common.Authorization;
        return null;
      }

      const response = await axios.post(`${getBaseURL()}${endpoints.auth.refreshToken}`, {
        refreshToken,
      });
      const payload = response.data;

      if (isAuthFailureEnvelope(payload)) {
        throw new Error(payload?.header?.resultMessage || '세션이 만료되었습니다.');
      }

      const bodyData = payload?.body?.data ?? payload?.body ?? payload?.data ?? payload;
      const nextAccessToken = String(bodyData?.accessToken || '').trim();
      const nextRefreshToken = String(bodyData?.refreshToken || '').trim();

      if (!nextAccessToken || !nextRefreshToken) {
        throw new Error('토큰 갱신 응답이 올바르지 않습니다.');
      }

      storeAccessToken(nextAccessToken);
      storeRefreshToken(nextRefreshToken);
      axiosInstance.defaults.headers.common.Authorization = `Bearer ${nextAccessToken}`;

      return nextAccessToken;
    } catch {
      clearStoredTokens();
      delete axiosInstance.defaults.headers.common.Authorization;
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

/**
 * Request Interceptor: Add token and logging
 */
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getStoredAccessToken();
    if (token) {
      config.headers = applyAccessToken(config.headers, token);
    }

    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor: Error handling and logging
 */
axiosInstance.interceptors.response.use(
  async (response) => {
    const originalRequest = response.config as RetryableRequestConfig;
    if (isAuthFailureEnvelope(response.data) && shouldRefreshAuth(originalRequest)) {
      const nextAccessToken = await refreshAuthSession();
      if (nextAccessToken) {
        originalRequest._retriedAfterRefresh = true;
        originalRequest.headers = applyAccessToken(originalRequest.headers, nextAccessToken);
        return axiosInstance(originalRequest);
      }
    }

    // BaseResponseDto 구조 평탄화: data.body.data -> data
    if (response.data?.body?.data !== undefined) {
      const bodyData = response.data.body.data;
      // body.data가 배열이면 그대로 유지, 객체면 spread
      if (Array.isArray(bodyData)) {
        response.data = {
          data: bodyData,
          ...(response.data.body.total !== undefined && { total: response.data.body.total }),
          ...(response.data.body.totalCount !== undefined && { totalCount: response.data.body.totalCount }),
          header: response.data.header, // header는 유지
        };
      } else if (bodyData && typeof bodyData === 'object') {
        // body.data가 객체면 spread
        response.data = {
          ...bodyData,
          header: response.data.header, // header는 유지
        };
      } else {
        // 그 외의 경우 (원시값 등)
        response.data = {
          data: bodyData,
          header: response.data.header,
        };
      }
    } else if (response.data?.body !== undefined && !response.data.body.data) {
      // body만 있고 data가 없는 경우 (단순 객체)
      response.data = {
        ...response.data.body,
        header: response.data.header, // header는 유지
      };
    }

    // HTTP 200이어도 isSuccess: false면 에러로 처리 (toast 등 onError에서 메시지 표시)
    const header = response.data?.header;
    if (header && header.isSuccess === false) {
      const message =
        header.resultMessage ||
        header.message ||
        response.data?.message ||
        '요청 처리에 실패했습니다.';
      return Promise.reject(new Error(message));
    }

    // 디버깅: 성공 응답 로그
    if (import.meta.env.DEV) {
      console.log('✅ API Response:', {
        data: response.data,
      });
    }
    return response;
  },
  async (error) => {
    // 디버깅: 에러 응답 로그
    const errorInfo = {
      method: error?.config?.method?.toUpperCase(),
      url: error?.config?.url,
      status: error?.response?.status,
      statusText: error?.response?.statusText,
      data: error?.response?.data,
      message: error?.message,
    };

    console.error('❌ API Error:', errorInfo);

    const originalRequest = error?.config as RetryableRequestConfig | undefined;
    const status = Number(error?.response?.status);
    if ((status === 401 || status === 403) && shouldRefreshAuth(originalRequest)) {
      const nextAccessToken = await refreshAuthSession();
      if (nextAccessToken && originalRequest) {
        originalRequest._retriedAfterRefresh = true;
        originalRequest.headers = applyAccessToken(originalRequest.headers, nextAccessToken);
        return axiosInstance(originalRequest);
      }
    }

    // 에러 메시지 추출
    const message =
      error?.response?.data?.header?.resultMessage ||
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      'Something went wrong!';

    return Promise.reject(new Error(message));
  }
);

export default axiosInstance;

// ----------------------------------------------------------------------

export const fetcher = async <T = unknown>(
  args: string | [string, AxiosRequestConfig]
): Promise<T> => {
  try {
    const [url, config] = Array.isArray(args) ? args : [args, {}];

    const res = await axiosInstance.get<T>(url, config);

    return res.data;
  } catch (error) {
    console.error('Fetcher failed:', error);
    throw error;
  }
};

// ----------------------------------------------------------------------

export const endpoints = {
  // System
  system: {
    token: '/system/token',
    upload: '/system/upload',
    seo: '/system/seo',
    places: '/system/places',
  },
  // Notification
  notification: {
    push: '/notification/push',
    history: '/notification/history',
  },
  // Member
  member: {
    base: '/member',
    list: '/member',
    myInfo: '/member/my-info',
    message: '/member/message',
    chatbotMessage: '/member/chatbot-message',
    helpMessage: '/member/help-message',
    fcmToken: '/member/fcm-token',
    pushSettings: '/member/push-settings',
  },
  // Company (조직)
  company: {
    base: '/companies',
    deactivate: '/companies',
    branches: '/companies',
    subscriptions: '/companies',
    upgrade: '/companies',
    cards: '/companies',
    billingKey: '/companies/billing-key',
    paymentHistory: '/companies',
    accidentFree: '/companies',
    invite: '/companies',
    inviteVerify: '/companies/invite/verify',
    inviteAccept: '/companies/invite/accept',
    members: '/companies',
  },
  // Chat
  chat: {
    rooms: '/chat/rooms',
    messages: '/chat/messages',
    emergencyRooms: '/chat/emergency-rooms',
  },
  chat2: {
    rooms: '/chat2/rooms',
    messages: '/chat2/messages',
  },
  // Operation
  operation: {
    riskReports: '/operation/risk-reports',
    chatRooms: '/operation/chat-rooms',
  },
  // Education
  education: {
    reports: '/education/reports',
    records: '/education/records',
    detail: '/education/detail',
    standards: '/education/standards',
  },
  // Library
  library: {
    reports: '/library/reports',
    reportsOrder: '/library/reports/order',
    categories: '/library/categories',
  },
  // Service Setting
  serviceSetting: {
    base: '/service-settings',
  },
  // Code Setting
  codeSetting: {
    base: '/code-settings',
    machine: '/code-settings/machine',
    hazard: '/code-settings/hazard',
    categories: '/code-settings/categories',
  },
  // Payment
  payment: {
    base: '/payment',
    billingKey: '/payment/billingKey',
    billingKeyForAdmin: '/payment/billingKeyForAdmin',
    before: '/payment/before',
    after: '/payment/after',
    cancel: '/payment',
  },
  // API Setting
  apiSetting: {
    base: '/api-settings',
  },
  // Checklist
  checklist: {
    base: '/checklists',
    industries: '/checklists/industries',
  },
  // Dashboard
  dashboard: {
    documentSignatures: '/dashboard/document-signatures',
    sharedDocuments: '/dashboard/shared-documents',
    safetySystemDocuments: '/dashboard/safety-system-documents',
    riskReportStatistics: '/dashboard/risk-report-statistics',
    memberProfile: '/dashboard/member-profile',
    educationCompletionRate: '/dashboard/education-completion-rate',
    prioritySettings: '/dashboard/priority-settings',
  },
  adminDashboard: {
    summary: '/admin/dashboard/summary',
    memberCompanies: '/admin/dashboard/member-companies',
    subscriptionDistribution: '/admin/dashboard/subscriptions/distribution',
    salesTrend: '/admin/dashboard/sales/trend',
    documentStatusMatrix: '/admin/dashboard/document-status/matrix',
    documentStatusDetails: '/admin/dashboard/document-status/details',
    defaultRange: '/admin/dashboard/filters/default-range',
  },
  // Safety System
  safetySystem: {
    systems: '/safety-system/systems',
    documents: '/safety-system/documents',
    actions: '/safety-system/actions',
    items: '/safety-system/items',
    chemicals: '/safety-system/chemicals',
    riskAssessmentCriteria: '/safety-system/risk-assessment-criteria',
    riskAssessmentLevels: '/safety-system/risk-assessment-levels',
  },
  // VOD
  vod: {
    base: '/vods',
  },
  // Board
  board: {
    categories: '/board/category',
    posts: '/board/post',
    comments: '/board/comment',
  },
  // Legacy (기존 호환성 유지)
  auth: {
    me: '/member/my-info',
    // Sign (인증) - 새 API
    invitation: '/user/invitation',
    signUp: '/user/signup',
    signIn: '/user/signin',
    refreshToken: '/user/refresh-token',
    signout: '/user/signout',
    checkId: '/user/check-id',
    findIdRequest: '/user/find-id/request',
    findIdConfirm: '/user/find-id/confirm',
    passwordResetRequest: '/user/password-reset/request',
    passwordResetConfirm: '/user/password-reset/confirm',
  },
  mail: {
    list: '/api/mail/list',
    details: '/api/mail/details',
    labels: '/api/mail/labels',
  },
  post: {
    list: '/api/post/list',
    details: '/api/post/details',
    latest: '/api/post/latest',
    search: '/api/post/search',
  },
  product: {
    list: '/api/product/list',
    details: '/api/product/details',
    search: '/api/product/search',
  },
  kanban: '/api/kanban',
  calendar: '/api/calendar',
} as const;
