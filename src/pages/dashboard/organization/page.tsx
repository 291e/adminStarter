import { CONFIG } from 'src/global-config';

import { OrganizationView } from 'src/sections/Organization/view';

// ----------------------------------------------------------------------

const metadata = { title: `조직관리 | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>

      <OrganizationView title="조직관리" />
    </>
  );
}
