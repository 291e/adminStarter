import { CONFIG } from 'src/global-config';

import { CodeSettingView } from 'src/sections/CodeSetting/view';

// ----------------------------------------------------------------------

const metadata = { title: `코드 설정 | Dashboard - ${CONFIG.appName}` };

export default function CodeSettingPage() {
  return (
    <>
      <title>{metadata.title}</title>
      <CodeSettingView title="코드 관리" />
    </>
  );
}
