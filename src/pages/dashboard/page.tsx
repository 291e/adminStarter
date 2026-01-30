import { CONFIG } from 'src/global-config';

import { useMyInfo } from 'src/sections/Chat/hooks/use-my-info';

import { DashBoardView } from 'src/sections/DashBoard/view';
import { AdminDashBoardView } from 'src/sections/AdminDashBoard/view';

// ----------------------------------------------------------------------

const metadata = { title: `대시보드 | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  const { data: myInfo } = useMyInfo();
  const isSuperAdmin = (myInfo as any)?.isSuperAdmin === true;

  if (isSuperAdmin) {
    return (
      <div style={{ flex: 1, backgroundColor: '#F4F6F8' }}>
        <title>{metadata.title}</title>
        <AdminDashBoardView />
      </div>
    );
  }

  return (
    <div style={{ flex: 1, backgroundColor: '#F4F6F8' }}>
      <title>{metadata.title}</title>
      <DashBoardView title="대시보드" />
    </div>
  );
}
