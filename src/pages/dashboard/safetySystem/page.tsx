import { CONFIG } from 'src/global-config';

import { BlankView } from 'src/sections/blank/view';
import { SafetySystemView } from 'src/sections/SafetySystem/view';

// ----------------------------------------------------------------------

const metadata = { title: `안전보건체계 관리 | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>
      <SafetySystemView title="안전보건체계 관리" />
    </>
  );
}
