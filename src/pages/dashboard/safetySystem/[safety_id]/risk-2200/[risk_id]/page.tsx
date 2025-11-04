import { useParams, useLocation } from 'react-router';
import { CONFIG } from 'src/global-config';

import { Risk_2200View } from 'src/sections/PDF/Risk_2200/[risk_id]/view';
import type { SafetySystem, SafetySystemItem } from 'src/_mock/_safety-system';

// ----------------------------------------------------------------------

const metadata = { title: `위험요인 상세 | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  const { safety_id, risk_id } = useParams<{ safety_id: string; risk_id: string }>();
  const location = useLocation();
  const state = location.state as { system: SafetySystem; item?: SafetySystemItem } | undefined;

  return (
    <>
      <title>{metadata.title}</title>
      <Risk_2200View
        riskId={risk_id}
        safetyId={safety_id}
        system={state?.system}
        item={state?.item}
      />
    </>
  );
}
