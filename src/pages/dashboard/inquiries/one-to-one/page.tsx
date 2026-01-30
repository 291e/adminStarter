import { CONFIG } from 'src/global-config';

import InquiriesView from 'src/sections/Inquiries/view';

// ----------------------------------------------------------------------

const metadata = { title: `1:1 문의 | Dashboard - ${CONFIG.appName}` };

export default function OneToOneInquiryPage() {
  return (
    <>
      <title>{metadata.title}</title>
      <InquiriesView />
    </>
  );
}
