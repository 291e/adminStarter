import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';

import { useMyInfo } from 'src/sections/Chat/hooks/use-my-info';
import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

// ----------------------------------------------------------------------

export default function BoardBreadcrumbs() {
  const { data: myInfo } = useMyInfo();
  const isSuperAdmin = myInfo?.isSuperAdmin === true;

  return (
    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
      <Stack spacing={1}>
        <Typography variant="h4">공지사항</Typography>
        <Breadcrumbs
          separator={<Typography sx={{ color: 'text.disabled', fontSize: 12 }}>•</Typography>}
        >
          <Link
            component={RouterLink}
            href={paths.dashboard.root}
            color="inherit"
            sx={{ fontSize: 13, color: 'text.secondary' }}
          >
            대시보드
          </Link>
          <Typography sx={{ fontSize: 13, color: 'text.primary' }}>공지사항</Typography>
        </Breadcrumbs>
      </Stack>

      {isSuperAdmin && (
        <Stack direction="row" spacing={1}>
          <Button variant="contained" color="info">
            카테고리 관리
          </Button>
          <Button variant="contained" color="inherit">
            공지사항 등록
          </Button>
        </Stack>
      )}
    </Stack>
  );
}
