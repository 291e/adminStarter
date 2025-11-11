import { CONFIG } from 'src/global-config';

import { ApiSettingView } from 'src/sections/ApiSetting/view';

// ----------------------------------------------------------------------

const metadata = { title: `API 관리 | Dashboard - ${CONFIG.appName}` };

export default function ApiSettingPage() {
  return (
    <>
      <title>{metadata.title}</title>
      <ApiSettingView title="API 관리" />
    </>
  );
}
