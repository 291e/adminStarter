import Link from '@mui/material/Link';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

type Props = {
  items: { label: string; href?: string }[];
  onCreate?: () => void;
};

export default function ApiSettingBreadcrumbs({ items, onCreate }: Props) {
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

      {onCreate && (
        <Button variant="contained" onClick={onCreate}>
          API 등록
        </Button>
      )}
    </Stack>
  );
}

