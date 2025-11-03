import { CONFIG } from 'src/global-config';

import { useParams } from 'react-router';
import OrganizationEditView from 'src/sections/Organization/Edit/view';
import { _organizationMembers } from 'src/_mock';

export default function Page() {
  const params = useParams();
  const id = params.id as string;
  const value = _organizationMembers.find((m) => m.id === id) || null;
  const metadata = { title: `조직 수정 | Dashboard - ${CONFIG.appName}` };

  return (
    <>
      <title>{metadata.title}</title>
      <OrganizationEditView value={value} lastAccessIp="168.126.222.111" />
    </>
  );
}
