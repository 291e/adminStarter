import Link from '@mui/material/Link';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

type Props = {
  items: { label: string; href?: string }[];
};

export default function ChatBreadcrumbs({ items }: Props) {
  return (
    <Stack
      sx={{ pt: { xs: 1, md: 2 } }}
      direction="row"
      alignItems="center"
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
    </Stack>
  );
}


