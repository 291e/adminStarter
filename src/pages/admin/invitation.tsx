import { CONFIG } from 'src/global-config';

import { JwtInvitationView } from 'src/auth/view/jwt';

// ----------------------------------------------------------------------

const metadata = { title: `초대 링크 검증 | ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>

      <JwtInvitationView />
    </>
  );
}


