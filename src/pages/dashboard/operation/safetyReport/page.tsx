import { CONFIG } from 'src/global-config';

import { BlankView } from 'src/sections/blank/view';
import { SafetyReportView } from 'src/sections/SafetyReport/view';

// ----------------------------------------------------------------------

const metadata = { title: `안전보고서 | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>
      <SafetyReportView title="안전보고서" />
    </>
  );
}
