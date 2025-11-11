import { CONFIG } from 'src/global-config';

import { LibraryReportView } from 'src/sections/LibraryReport/view';

// ----------------------------------------------------------------------

const metadata = { title: `라이브러리 | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>
      <LibraryReportView title="라이브러리" />
    </>
  );
}
