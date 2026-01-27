import { CONFIG } from 'src/global-config';

import { BlankView } from 'src/sections/blank/view';

// ----------------------------------------------------------------------

const metadata = { title: `공지사항 | Dashboard - ${CONFIG.appName}` };

export default function NoticePage() {
  return (
    <>
      <title>{metadata.title}</title>
      <BlankView title="공지사항" />
    </>
  );
}
