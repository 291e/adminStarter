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
  notice: icon('ic-notice'),
  faq: icon('ic-faq'),
  otherProgram: icon('ic-other-program'),
  community: icon('ic-community'),
  diagnosis: icon('ic-diagnosis'),
  settlement: icon('ic-settlement'),
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
        title: '회원 / 조직 관리',
        path: paths.dashboard.group.root,
        icon: ICONS.user,
      },
      {
        title: '상품 관리',
        path: paths.dashboard.product.root,
        icon: ICONS.job,
      },
      {
        title: '정산',
        path: paths.dashboard.settlement.root,
        icon: ICONS.invoice,
      },
      {
        title: '결과 진단 관리',
        path: paths.dashboard.diagnosis.root,
        icon: ICONS.analytics,
      },
      {
        title: '커뮤니티',
        path: paths.dashboard.community.root,
        icon: ICONS.blog,
        children: [
          {
            title: '공지사항',
            path: paths.dashboard.community.notice,
          },
          {
            title: '자주 묻는 질문',
            path: paths.dashboard.community.faq,
          },
          {
            title: '다른 프로그램',
            path: paths.dashboard.community.otherProgram,
          },
        ],
      },
    ],
  },
];
