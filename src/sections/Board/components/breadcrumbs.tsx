import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';

import { useMyInfo } from 'src/sections/Chat/hooks/use-my-info';
import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

// ----------------------------------------------------------------------

type Props = {
  onCategoryManage?: () => void;
  onNewPost?: () => void;
};

export default function BoardBreadcrumbs({ onCategoryManage, onNewPost }: Props) {
  const { data: myInfo } = useMyInfo();
  const isSuperAdmin = myInfo?.isSuperAdmin === true;

  return (
    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
      <Stack spacing={1}>
        <Typography variant="h4">산업안전보건 게시판</Typography>
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
          <Typography sx={{ fontSize: 13, color: 'text.primary' }}>산업안전보건 게시판</Typography>
        </Breadcrumbs>
      </Stack>

      <Stack direction="row" spacing={1}>
        {isSuperAdmin && (
          <Button
            variant="contained"
            color="info"
            onClick={onCategoryManage}
            sx={{
              px: 2,
              height: 40,
              borderRadius: 1,
              fontWeight: 600,
            }}
          >
            카테고리 관리
          </Button>
        )}
        <Button
          variant="contained"
          onClick={onNewPost}
          sx={{
            bgcolor: '#212B36',
            '&:hover': { bgcolor: '#161C24' },
            px: 2,
            height: 40,
            borderRadius: 1,
            fontWeight: 600,
          }}
        >
          산업안전보건 게시판 등록
        </Button>
      </Stack>
    </Stack>
  );
}
