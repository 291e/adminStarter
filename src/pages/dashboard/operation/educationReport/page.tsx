import { CONFIG } from 'src/global-config';

import { EducationReportView } from 'src/sections/EducationReport/view';

// ----------------------------------------------------------------------

const metadata = { title: `교육 이수 현황 | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>
      <EducationReportView title="교육 이수 현황" />
    </>
  );
}
