import { CONFIG } from 'src/global-config';

import { BlankView } from 'src/sections/blank/view';

// ----------------------------------------------------------------------

const metadata = { title: `회원사 문의 | Dashboard - ${CONFIG.appName}` };

export default function InquiriesPage() {
  return (
    <>
      <title>{metadata.title}</title>
      <BlankView title="회원사 문의" />
    </>
  );
}
