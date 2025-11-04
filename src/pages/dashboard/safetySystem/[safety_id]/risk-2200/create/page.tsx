import { useParams } from 'react-router';
import { CONFIG } from 'src/global-config';

import { Risk_2200CreateView } from 'src/sections/PDF/Risk_2200/create/view';

// ----------------------------------------------------------------------

const metadata = { title: `위험요인 등록 | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  const { safety_id } = useParams<{ safety_id: string }>();

  return (
    <>
      <title>{metadata.title}</title>
      <Risk_2200CreateView safetyId={safety_id} />
    </>
  );
}
