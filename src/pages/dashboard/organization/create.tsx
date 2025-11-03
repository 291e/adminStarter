import { CONFIG } from 'src/global-config';
import OrganizationCreateView from 'src/sections/Organization/Create/view';

export default function Page() {
  const metadata = { title: `조직 등록 | Dashboard - ${CONFIG.appName}` };
  return (
    <>
      <title>{metadata.title}</title>
      <OrganizationCreateView />
    </>
  );
}
