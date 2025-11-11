import type { NavSectionProps } from 'src/components/nav-section';

import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/global-config';

import { Label } from 'src/components/label';
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

export const navData: NavSectionProps['data'] = [
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
        title: '조직관리',
        path: paths.dashboard.organization.root,
        icon: ICONS.job,
      },
      {
        title: '현장 운영 관리',
        path: paths.dashboard.operation.root,
        icon: ICONS.tour,
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
        icon: ICONS.lock,
      },
      {
        title: '설정 및 관리',
        path: paths.dashboard.systemSetting.root,
        icon: ICONS.lock,
        children: [
          { title: '서비스 관리', path: paths.dashboard.systemSetting.serviceSetting },
          { title: '코드 관리', path: paths.dashboard.systemSetting.codeSetting },
          { title: 'API 관리', path: paths.dashboard.systemSetting.apiSetting },
          {
            title: '업종별 체크리스트',
            path: paths.dashboard.systemSetting.industryChecklistSetting,
          },
        ],
      },
    ],
  },
];
