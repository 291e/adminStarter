import { CONFIG } from 'src/global-config';
import { DocumentStatusDetailView } from 'src/sections/AdminDashBoard/document-status-detail/view';

// ----------------------------------------------------------------------

const metadata = { title: `문서 작성 현황 | Dashboard - ${CONFIG.appName}` };

export default function DocumentStatusPage() {
  return (
    <div style={{ flex: 1, backgroundColor: '#F4F6F8' }}>
      <title>{metadata.title}</title>
      <DocumentStatusDetailView />
    </div>
  );
}
