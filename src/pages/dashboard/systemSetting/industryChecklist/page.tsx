import { CONFIG } from 'src/global-config';
import { ChecklistView } from 'src/sections/ChackList/view';

const metadata = { title: `업종별 체크리스트 | Dashboard - ${CONFIG.appName}` };

export default function IndustryChecklistPage() {
  return (
    <>
      <title>{metadata.title}</title>
      <ChecklistView />
    </>
  );
}
