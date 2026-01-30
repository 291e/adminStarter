import { CONFIG } from 'src/global-config';

import InquiriesView from 'src/sections/Inquiries/view';

// ----------------------------------------------------------------------

const metadata = { title: `회원사 문의 | Dashboard - ${CONFIG.appName}` };

export default function InquiriesPage() {
  return (
    <>
      <title>{metadata.title}</title>
      <InquiriesView />
    </>
  );
}
