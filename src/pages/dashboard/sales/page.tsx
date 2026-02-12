import { CONFIG } from 'src/global-config';
import { SalesView } from 'src/sections/Sales/view';

// ----------------------------------------------------------------------

const metadata = { title: `매출 관리 | Dashboard - ${CONFIG.appName}` };

export default function SalesPage() {
  return (
    <>
      <title>{metadata.title}</title>
      <SalesView />
    </>
  );
}
