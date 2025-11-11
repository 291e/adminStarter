import { CONFIG } from 'src/global-config';
import { RiskReportCreateView } from 'src/sections/Operation/create/view';

const metadata = { title: `위험 보고 등록 | Dashboard - ${CONFIG.appName}` };

export default function RiskReportCreatePage() {
  return (
    <>
      <title>{metadata.title}</title>
      <RiskReportCreateView title="위험 보고 등록" />
    </>
  );
}
