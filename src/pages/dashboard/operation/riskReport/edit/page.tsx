import { CONFIG } from 'src/global-config';

import { RiskReportEditView } from 'src/sections/Operation/edit/view';

// ----------------------------------------------------------------------

const metadata = { title: `위험 보고 수정 | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>
      <RiskReportEditView title="위험 보고 수정" />
    </>
  );
}
