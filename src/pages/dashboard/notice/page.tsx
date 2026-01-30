import { CONFIG } from 'src/global-config';

import { BoardView } from 'src/sections/Board/view';

// ----------------------------------------------------------------------

const metadata = { title: `공지사항 | Dashboard - ${CONFIG.appName}` };

export default function NoticePage() {
  return (
    <div style={{ flex: 1 }}>
      <title>{metadata.title}</title>
      <BoardView />
    </div>
  );
}
