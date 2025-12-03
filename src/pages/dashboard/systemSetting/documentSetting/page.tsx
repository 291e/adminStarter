import { CONFIG } from 'src/global-config';

import { DocumentSettingView } from 'src/sections/DocumentSetting/view';

const metadata = { title: `문서 설정 관리 | Dashboard - ${CONFIG.appName}` };

export default function DocumentSettingPage() {
  return (
    <>
      <title>{metadata.title}</title>
      <DocumentSettingView />
    </>
  );
}
