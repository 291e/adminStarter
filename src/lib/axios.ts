import type { AxiosRequestConfig } from 'axios';

import axios from 'axios';

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

/**
 * Request Interceptor: Add token and logging
 */
axiosInstance.interceptors.request.use(
  (config) => {
    // 토큰 추가
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
  (response) => {
    // BaseResponseDto 구조 평탄화: data.body.data -> data
    if (response.data?.body?.data !== undefined) {
      // body.data를 최상위로 이동
      response.data = {
        ...response.data.body.data,
        header: response.data.header, // header는 유지
      };
    } else if (response.data?.body !== undefined && !response.data.body.data) {
      // body만 있고 data가 없는 경우 (단순 객체)
      response.data = {
        ...response.data.body,
        header: response.data.header, // header는 유지
      };
    }

    // 디버깅: 성공 응답 로그
    if (import.meta.env.DEV) {
      console.log('✅ API Response:', {
        method: response.config.method?.toUpperCase(),
        url: response.config.url,
        status: response.status,
        data: response.data,
      });
    }
    return response;
  },
  (error) => {
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
    accidentFree: '/companies',
    invite: '/companies',
    inviteAccept: '/companies/invite/accept',
    members: '/companies',
  },
  // Chat
  chat: {
    rooms: '/chat/rooms',
    messages: '/chat/messages',
    emergencyRooms: '/chat/emergency-rooms',
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
    riskReportStatistics: '/dashboard/risk-report-statistics',
    memberProfile: '/dashboard/member-profile',
    educationCompletionRate: '/dashboard/education-completion-rate',
    prioritySettings: '/dashboard/priority-settings',
  },
  // Safety System
  safetySystem: {
    documents: '/safety-system/documents',
    items: '/safety-system/items',
    chemicals: '/safety-system/chemicals',
    casNumbers: '/safety-system/cas-numbers',
  },
  // Legacy (기존 호환성 유지)
  auth: {
    me: '/member/my-info',
    // Sign (인증) - 새 API
    invitation: '/user/invitation',
    signUp: '/user/signup',
    signIn: '/user/signin',
    signout: '/user/signout',
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
