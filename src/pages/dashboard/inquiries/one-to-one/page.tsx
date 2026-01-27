import { CONFIG } from 'src/global-config';

import { BlankView } from 'src/sections/blank/view';

// ----------------------------------------------------------------------

const metadata = { title: `1:1 문의 | Dashboard - ${CONFIG.appName}` };

export default function OneToOneInquiryPage() {
  return (
    <>
      <title>{metadata.title}</title>
      <BlankView title="1:1 문의" />
    </>
  );
}
