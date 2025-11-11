import Link from '@mui/material/Link';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

type Props = {
  items: { label: string; href?: string }[];
  onCategorySettings?: () => void;
  onVodUpload?: () => void;
};

export default function LibraryReportBreadcrumbs({
  items,
  onCategorySettings,
  onVodUpload,
}: Props) {
  return (
    <Stack
      sx={{ pt: { xs: 1, md: 2 } }}
      direction="row"
      alignItems="flex-start"
      justifyContent="space-between"
    >
      <Breadcrumbs>
        {items.map((item, idx) =>
          item.href ? (
            <Link key={idx} color="inherit" href={item.href} underline="hover">
              {item.label}
            </Link>
          ) : (
            <Typography key={idx} color="text.primary">
              {item.label}
            </Typography>
          )
        )}
      </Breadcrumbs>

      <Stack direction="row" spacing={1}>
        {onCategorySettings && (
          <Button variant="contained" color="primary" onClick={onCategorySettings}>
            카테고리 설정
          </Button>
        )}
        {onVodUpload && (
          <Button variant="contained" color="inherit" onClick={onVodUpload}>
            VOD 업로드
          </Button>
        )}
      </Stack>
    </Stack>
  );
}
