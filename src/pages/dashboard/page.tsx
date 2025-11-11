import { CONFIG } from 'src/global-config';

import { DashBoardView } from 'src/sections/DashBoard/view';

// ----------------------------------------------------------------------

const metadata = { title: `대시보드 | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return (
    <div style={{ flex: 1, backgroundColor: '#F4F6F8' }}>
      <title>{metadata.title}</title>
      <DashBoardView title="대시보드" />
    </div>
  );
}
