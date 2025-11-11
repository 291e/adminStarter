import { CONFIG } from 'src/global-config';

import { ChatView } from 'src/sections/Chat/view';

// ----------------------------------------------------------------------

const metadata = { title: `채팅 | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>
      <ChatView title="채팅" />
    </>
  );
}
