import { useParams } from 'react-router';
import { CONFIG } from 'src/global-config';

import { Risk_2200View } from 'src/sections/PDF/Risk_2200/view';

// ----------------------------------------------------------------------

const metadata = { title: `위험요인 제거·대체 및 통제 | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  const { safety_id } = useParams<{ safety_id: string }>();

  return (
    <>
      <title>{metadata.title}</title>
      <Risk_2200View safetyId={safety_id} title="위험요인 제거·대체 및 통제" />
    </>
  );
}
