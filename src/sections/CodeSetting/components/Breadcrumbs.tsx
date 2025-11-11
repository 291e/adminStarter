import Link from '@mui/material/Link';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

type Props = {
  items: { label: string; href?: string }[];
  onCreate?: () => void;
  onCategorySettings?: () => void;
  category?: 'machine' | 'hazard';
};

export default function CodeSettingBreadcrumbs({
  items,
  onCreate,
  onCategorySettings,
  category = 'machine',
}: Props) {
  const buttonText = category === 'hazard' ? '유해인자 등록' : '기계·설비 등록';

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
        {category === 'hazard' && onCategorySettings && (
          <Button variant="contained" color="info" onClick={onCategorySettings}>
            카테고리 설정
          </Button>
        )}
        {onCreate && (
          <Button variant="contained" onClick={onCreate}>
            {buttonText}
          </Button>
        )}
      </Stack>
    </Stack>
  );
}
