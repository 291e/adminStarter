import { CONFIG } from 'src/global-config';

import { OrganizationDetailView } from 'src/sections/Organization/Detail/view';

// ----------------------------------------------------------------------

const metadata = { title: `조직 상세 | Dashboard - ${CONFIG.appName}` };

export default function OrganizationDetailPage() {
  return (
    <>
      <title>{metadata.title}</title>
      <OrganizationDetailView title="조직 관리" />
    </>
  );
}
