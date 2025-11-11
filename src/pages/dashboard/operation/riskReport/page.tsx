import { CONFIG } from 'src/global-config';

import { BlankView } from 'src/sections/blank/view';
import { OperationView } from 'src/sections/Operation/view';

// ----------------------------------------------------------------------

const metadata = { title: `위험 보고 | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>
      <OperationView title="위험 보고" />
    </>
  );
}
