import { CONFIG } from 'src/global-config';

import { ServiceSettingView } from 'src/sections/ServiceSetting/view';

// ----------------------------------------------------------------------

const metadata = { title: `서비스 관리 | Dashboard - ${CONFIG.appName}` };

export default function ServiceSettingPage() {
  return (
    <>
      <title>{metadata.title}</title>
      <ServiceSettingView title="서비스 관리" />
    </>
  );
}
