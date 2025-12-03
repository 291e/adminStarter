import { useParams, useLocation } from 'react-router';
import { CONFIG } from 'src/global-config';

import { Risk_2200EditView } from 'src/sections/PDF/Risk_2200/edit/view';
import type { SafetySystem } from 'src/_mock/_safety-system';
import type { SafetySystemItem } from 'src/services/safety-system/safety-system.types';

// ----------------------------------------------------------------------

const metadata = { title: `위험요인 수정 | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  const { safety_id } = useParams<{ safety_id: string; risk_id: string }>();
  const location = useLocation();
  const state = location.state as
    | {
        system: SafetySystem;
        item?: SafetySystemItem;
        documentType?: 'industrial-accident' | 'near-miss' | 'tbm' | 'education';
      }
    | undefined;

  return (
    <>
      <title>{metadata.title}</title>
      <Risk_2200EditView
        safetyId={safety_id}
        system={state?.system}
        item={state?.item}
        documentType={state?.documentType}
      />
    </>
  );
}
