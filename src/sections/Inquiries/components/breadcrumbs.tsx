import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';

import { useMyInfo } from 'src/sections/Chat/hooks/use-my-info';
import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

type Props = {
  onNewInquiry?: () => void;
  onCategoryManage?: () => void;
};

export default function InquiriesBreadcrumbs({ onNewInquiry, onCategoryManage }: Props) {
  const { data: myInfo } = useMyInfo();
  const isSuperAdmin = myInfo?.isSuperAdmin === true;

  return (
    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
      <Stack spacing={1}>
        <Typography variant="h4">1:1 문의</Typography>
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
          <Typography sx={{ fontSize: 13, color: 'text.primary' }}>1:1 문의</Typography>
        </Breadcrumbs>
      </Stack>

      {isSuperAdmin ? (
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
      ) : (
        <Button
          variant="contained"
          onClick={onNewInquiry}
          sx={{
            bgcolor: '#212B36',
            '&:hover': { bgcolor: '#161C24' },
            px: 2,
            height: 40,
            borderRadius: 1,
            fontWeight: 600,
          }}
        >
          문의하기
        </Button>
      )}
    </Stack>
  );
}
