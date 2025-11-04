import React from 'react';
import Link from '@mui/material/Link';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type Props = {
  items: { label: string; href?: string }[];
  onCreate?: () => void;
  onAction?: (action: string) => void;
};

export default function Risk_2200Breadcrumbs({ items, onCreate, onAction }: Props) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleMenuItemClick = (action: string) => {
    onAction?.(action);
    handleCloseMenu();
  };

  return (
    <>
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

        <Stack direction="row" spacing={1} alignItems="center">
          <Button variant="contained" onClick={onCreate}>
            등록
          </Button>
          <IconButton onClick={handleOpenMenu} size="small">
            <Iconify icon="eva:more-vertical-fill" width={20} />
          </IconButton>
        </Stack>
      </Stack>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={() => handleMenuItemClick('export')}>엑셀 내보내기</MenuItem>
        <MenuItem onClick={() => handleMenuItemClick('print')}>인쇄</MenuItem>
      </Menu>
    </>
  );
}
