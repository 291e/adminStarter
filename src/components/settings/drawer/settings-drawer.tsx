import type { SettingsDrawerProps } from '../types';

import { useCallback } from 'react';
import { varAlpha } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';

import { useRouter } from 'src/routes/hooks';
import { useAuthContext } from 'src/auth/hooks';
import { signOut } from 'src/auth/context/jwt/action';

import { Iconify } from '../../iconify';
import { Scrollbar } from '../../scrollbar';
import { useSettingsContext } from '../context/use-settings-context';

// ----------------------------------------------------------------------

export function SettingsDrawer({ sx }: SettingsDrawerProps) {
  const settings = useSettingsContext();
  const router = useRouter();
  const { checkUserSession } = useAuthContext();

  const handleLogout = useCallback(async () => {
    try {
      await signOut();
      await checkUserSession?.();
      settings.onCloseDrawer();
      router.refresh();
    } catch (error) {
      console.error(error);
    }
  }, [checkUserSession, settings, router]);

  const renderHead = () => (
    <Box
      sx={{
        py: 2,
        pr: 1,
        pl: 2.5,
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <Typography variant="h6" sx={{ flexGrow: 1 }}>
        메뉴
      </Typography>

      <Tooltip title="닫기">
        <IconButton onClick={settings.onCloseDrawer}>
          <Iconify icon="mingcute:close-line" />
        </IconButton>
      </Tooltip>
    </Box>
  );

  return (
    <Drawer
      anchor="right"
      open={settings.openDrawer}
      onClose={settings.onCloseDrawer}
      slotProps={{
        backdrop: { invisible: true },
        paper: {
          sx: [
            (theme) => ({
              ...theme.mixins.paperStyles(theme, {
                color: varAlpha(theme.vars.palette.background.defaultChannel, 0.9),
              }),
              width: 280,
            }),
            ...(Array.isArray(sx) ? sx : [sx]),
          ],
        },
      }}
    >
      {renderHead()}

      <Scrollbar>
        <Box
          sx={{
            pb: 5,
            px: 0,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <List sx={{ p: 0 }}>
            <ListItem disablePadding>
              <ListItemButton onClick={handleLogout} sx={{ py: 1.5, px: 2.5 }}>
                <Iconify icon={'solar:logout-3-bold' as any} width={20} sx={{ mr: 2 }} />
                <ListItemText
                  primary="로그아웃"
                  primaryTypographyProps={{
                    fontSize: 14,
                    fontWeight: 500,
                  }}
                />
              </ListItemButton>
            </ListItem>
          </List>
        </Box>
      </Scrollbar>
    </Drawer>
  );
}
