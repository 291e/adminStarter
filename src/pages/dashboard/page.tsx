import { CONFIG } from 'src/global-config';

import { DashBoardView } from 'src/sections/DashBoard/view';

// ----------------------------------------------------------------------

const metadata = { title: `Dashboard | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>

      <DashBoardView title="Dashboard" />
    </>
  );
}
