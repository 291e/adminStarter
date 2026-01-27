import type { NavSectionProps } from 'src/components/nav-section';

import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/global-config';

import { SvgColor } from 'src/components/svg-color';

// ----------------------------------------------------------------------

const icon = (name: string) => (
  <SvgColor src={`${CONFIG.assetsDir}/assets/icons/navbar/${name}.svg`} />
);

const ICONS = {
  job: icon('ic-job'),
  blog: icon('ic-blog'),
  chat: icon('ic-chat'),
  mail: icon('ic-mail'),
  user: icon('ic-user'),
  file: icon('ic-file'),
  lock: icon('ic-lock'),
  tour: icon('ic-tour'),
  order: icon('ic-order'),
  label: icon('ic-label'),
  blank: icon('ic-blank'),
  kanban: icon('ic-kanban'),
  folder: icon('ic-folder'),
  course: icon('ic-course'),
  params: icon('ic-params'),
  banking: icon('ic-banking'),
  booking: icon('ic-booking'),
  invoice: icon('ic-invoice'),
  product: icon('ic-product'),
  calendar: icon('ic-calendar'),
  disabled: icon('ic-disabled'),
  external: icon('ic-external'),
  subpaths: icon('ic-subpaths'),
  menuItem: icon('ic-menu-item'),
  ecommerce: icon('ic-ecommerce'),
  analytics: icon('ic-analytics'),
  dashboard: icon('ic-dashboard'),
};

// ----------------------------------------------------------------------

const workerNavData: NavSectionProps['data'] = [
  /**
   * Overview
   */
  {
    subheader: 'Overview',
    items: [
      {
        title: '대시보드',
        path: paths.dashboard.root,
        icon: ICONS.dashboard,
      },
    ],
  },
  /**
   * Management
   */
  {
    subheader: 'Management',
    items: [
      {
        title: '조직 관리',
        path: paths.dashboard.organization.root,
        icon: ICONS.job,
        deepMatch: true,
      },
      {
        title: '현장 운영 관리',
        path: paths.dashboard.operation.root,
        icon: ICONS.tour,
        deepMatch: true,
        children: [
          { title: '채팅', path: paths.dashboard.operation.chat },
          {
            title: '위험 보고',
            path: paths.dashboard.operation.riskReport,
          },
          { title: '교육이수 현황', path: paths.dashboard.operation.educationReport },
          { title: '라이브러리', path: paths.dashboard.operation.libraryReport },
        ],
      },
      {
        title: '안전보건체계 관리',
        path: paths.dashboard.safetySystem.root,
        icon: ICONS.file,
        deepMatch: true,
      },
      {
        title: '설정 및 관리',
        path: paths.dashboard.systemSetting.root,
        icon: ICONS.lock,
        deepMatch: true,
        children: [
          { title: '서비스 관리', path: paths.dashboard.systemSetting.serviceSetting },
          { title: '문서 설정 관리', path: paths.dashboard.systemSetting.documentSetting },
          {
            title: '업종별 체크리스트',
            path: paths.dashboard.systemSetting.industryChecklistSetting,
          },
          { title: '코드 관리', path: paths.dashboard.systemSetting.codeSetting },
          { title: 'API 관리', path: paths.dashboard.systemSetting.apiSetting },
        ],
      },
    ],
  },
];

const managerNavData: NavSectionProps['data'] = [
  {
    subheader: 'Overview',
    items: [
      {
        title: '대시보드',
        path: paths.dashboard.root,
        icon: ICONS.dashboard,
      },
    ],
  },
  {
    subheader: 'Management',
    items: [
      {
        title: '조직 관리',
        path: paths.dashboard.organization.root,
        icon: ICONS.job,
        deepMatch: true,
      },
      {
        title: '현장 운영 관리',
        path: paths.dashboard.operation.root,
        icon: ICONS.tour,
        deepMatch: true,
        children: [
          { title: '채팅', path: paths.dashboard.operation.chat },
          { title: '교육 이수 현황', path: paths.dashboard.operation.educationReport },
          { title: 'VOD 라이브러리', path: paths.dashboard.operation.libraryReport },
        ],
      },
      {
        title: '안전보건체계 관리',
        path: paths.dashboard.safetySystem.root,
        icon: ICONS.file,
        deepMatch: true,
      },
      {
        title: '공지사항',
        path: paths.dashboard.notice,
        icon: ICONS.blog,
      },
      {
        title: '1:1 문의',
        path: paths.dashboard.inquiriesOneToOne,
        icon: ICONS.chat,
      },
    ],
  },
];

const superAdminNavData: NavSectionProps['data'] = [
  {
    subheader: 'Overview',
    items: [
      {
        title: '대시보드',
        path: paths.dashboard.root,
        icon: ICONS.dashboard,
      },
    ],
  },
  {
    subheader: 'Management',
    items: [
      {
        title: '공지사항',
        path: paths.dashboard.notice,
        icon: ICONS.blog,
      },
      {
        title: '회원사 관리',
        path: paths.dashboard.organization.root,
        icon: ICONS.job,
        deepMatch: true,
      },
      {
        title: 'VOD 자료 관리',
        path: paths.dashboard.operation.libraryReport,
        icon: ICONS.course,
      },
      {
        title: '매출 관리',
        path: paths.dashboard.sales,
        icon: ICONS.banking,
      },
      {
        title: '서비스 관리',
        path: paths.dashboard.systemSetting.serviceSetting,
        icon: ICONS.kanban,
      },
      {
        title: '안전보건체계 관리',
        path: paths.dashboard.safetySystem.root,
        icon: ICONS.file,
        deepMatch: true,
      },
      {
        title: '회원사 문의',
        path: paths.dashboard.inquiries,
        icon: ICONS.chat,
      },
      {
        title: '문서 관리',
        path: paths.dashboard.systemSetting.root,
        icon: ICONS.folder,
        deepMatch: true,
        children: [
          { title: '문서 설정 관리', path: paths.dashboard.systemSetting.documentSetting },
          {
            title: '업종별 체크리스트',
            path: paths.dashboard.systemSetting.industryChecklistSetting,
          },
          { title: '코드 관리', path: paths.dashboard.systemSetting.codeSetting },
          { title: 'API 관리', path: paths.dashboard.systemSetting.apiSetting },
        ],
      },
    ],
  },
];

type DashboardNavOptions = {
  isSuperAdmin?: boolean;
  memberRole?: string | null;
};

export const getDashboardNavData = ({
  isSuperAdmin = false,
  memberRole,
}: DashboardNavOptions): NavSectionProps['data'] => {
  if (isSuperAdmin) {
    return superAdminNavData;
  }

  const roleUpper = String(memberRole || '').toUpperCase();
  if (roleUpper && roleUpper !== 'WORKER') {
    return managerNavData;
  }

  return workerNavData.map((section) => ({
    ...section,
    items: section.items.filter((item) => item.title !== '설정 및 관리'),
  }));
};

export const navData = workerNavData;
