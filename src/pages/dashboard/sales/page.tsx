import { CONFIG } from 'src/global-config';

import { BlankView } from 'src/sections/blank/view';

// ----------------------------------------------------------------------

const metadata = { title: `매출 관리 | Dashboard - ${CONFIG.appName}` };

export default function SalesPage() {
  return (
    <>
      <title>{metadata.title}</title>
      <BlankView title="매출 관리" />
    </>
  );
}
