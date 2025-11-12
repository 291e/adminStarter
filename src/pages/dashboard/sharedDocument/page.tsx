import { CONFIG } from 'src/global-config';
import { SharedDocumentView } from 'src/sections/DashBoard/SharedDocument/view';

// ----------------------------------------------------------------------

const metadata = { title: `공유된 문서 | Dashboard - ${CONFIG.appName}` };

export default function SharedDocumentPage() {
  return (
    <>
      <title>{metadata.title}</title>
      <SharedDocumentView title="공유된 문서" />
    </>
  );
}
