import { CONFIG } from 'src/global-config';

import { BlankView } from 'src/sections/blank/view';

// ----------------------------------------------------------------------

const metadata = { title: `시스템 설정 | Dashboard - ${CONFIG.appName}` };

export default function SystemSettingPage() {
  return (
    <>
      <title>{metadata.title}</title>
      <BlankView title="시스템 설정" />
    </>
  );
}
