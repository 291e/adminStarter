import Link from '@mui/material/Link';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

type Props = {
  items: { label: string; href?: string }[];
  onIndustrySettings?: () => void;
  onCreate?: () => void;
};

export default function ChecklistBreadcrumbs({ items, onIndustrySettings, onCreate }: Props) {
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
        {onIndustrySettings && (
          <Button variant="contained" color="info" onClick={onIndustrySettings}>
            업종 설정
          </Button>
        )}
        {onCreate && (
          <Button variant="contained" onClick={onCreate}>
            위험작업/상황 등록
          </Button>
        )}
      </Stack>
    </Stack>
  );
}
