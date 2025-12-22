import type { IconButtonProps } from '@mui/material/IconButton';

import { m } from 'framer-motion';
import { useState, useCallback, useMemo } from 'react';
import { useBoolean } from 'minimal-shared/hooks';

import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Badge from '@mui/material/Badge';
import Drawer from '@mui/material/Drawer';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { varTap, varHover, transitionTap } from 'src/components/animate';

import { NotificationItem } from './notification-item';
import {
  useNotificationHistory,
  useMarkNotificationAsRead,
} from 'src/sections/Notification/hooks/use-notification-api';

// ----------------------------------------------------------------------

// ----------------------------------------------------------------------

export type NotificationsDrawerProps = IconButtonProps;

export function NotificationsDrawer({ sx, ...other }: NotificationsDrawerProps) {
  const { value: open, onFalse: onClose, onTrue: onOpen } = useBoolean();

  const [currentTab, setCurrentTab] = useState('all');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const handleChangeTab = useCallback((event: React.SyntheticEvent, newValue: string) => {
    setCurrentTab(newValue);
    setPage(1); // 탭 변경 시 첫 페이지로 리셋
  }, []);

  // 알림 이력 조회
  const { data: notificationData, isLoading } = useNotificationHistory({
    page,
    pageSize,
  });

  const notifications = useMemo(
    () => notificationData?.notifications || [],
    [notificationData?.notifications]
  );
  const totalCount = notificationData?.totalCount || 0;

  // 읽음 처리 mutation
  const markAsReadMutation = useMarkNotificationAsRead();

  // 탭별 필터링된 알림
  const filteredNotifications = useMemo(() => {
    if (currentTab === 'unread') {
      return notifications.filter((item) => item.isUnRead === true);
    }
    if (currentTab === 'archived') {
      return notifications.filter((item) => item.isUnRead === false);
    }
    return notifications;
  }, [notifications, currentTab]);

  // 읽지 않은 알림 개수
  const totalUnRead = useMemo(
    () => notifications.filter((item) => item.isUnRead === true).length,
    [notifications]
  );

  // 탭별 개수
  const tabCounts = useMemo(() => {
    const unreadCount = notifications.filter((item) => item.isUnRead === true).length;
    const archivedCount = notifications.filter((item) => item.isUnRead === false).length;
    return {
      all: totalCount,
      unread: unreadCount,
      archived: archivedCount,
    };
  }, [notifications, totalCount]);

  const handleMarkAllAsRead = useCallback(() => {
    // 모든 미읽음 알림을 읽음 처리
    const unreadNotifications = notifications.filter((item) => item.isUnRead === true);
    unreadNotifications.forEach((notification) => {
      markAsReadMutation.mutate(notification.id);
    });
  }, [notifications, markAsReadMutation]);

  const handleLoadMore = useCallback(() => {
    const totalPages = Math.ceil(totalCount / pageSize);
    if (page < totalPages) {
      setPage((prev) => prev + 1);
    }
  }, [page, totalCount, pageSize]);

  const renderHead = () => (
    <Box
      sx={{
        py: 2,
        pr: 1,
        pl: 2.5,
        minHeight: 68,
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <Typography variant="h6" align="center" sx={{ flexGrow: 1 }}>
        알림
      </Typography>

      {!!totalUnRead && (
        <Tooltip title="Mark all as read">
          <IconButton color="primary" onClick={handleMarkAllAsRead}>
            <Iconify icon="eva:done-all-fill" />
          </IconButton>
        </Tooltip>
      )}

      <IconButton onClick={onClose} sx={{ display: { xs: 'inline-flex', sm: 'none' } }}>
        <Iconify icon="mingcute:close-line" />
      </IconButton>

      <IconButton>
        <Iconify icon="solar:settings-bold-duotone" />
      </IconButton>
    </Box>
  );

  const renderTabs = () => {
    const tabs = [
      { value: 'all', label: '전체', count: tabCounts.all },
      { value: 'unread', label: '읽지 않음', count: tabCounts.unread },
      { value: 'archived', label: '읽음', count: tabCounts.archived },
    ];

    return (
      <Tabs
        variant="fullWidth"
        value={currentTab}
        onChange={handleChangeTab}
        indicatorColor="custom"
      >
        {tabs.map((tab) => (
          <Tab
            key={tab.value}
            iconPosition="end"
            value={tab.value}
            label={tab.label}
            icon={
              <Label
                variant={((tab.value === 'all' || tab.value === currentTab) && 'filled') || 'soft'}
                color={
                  (tab.value === 'unread' && 'info') ||
                  (tab.value === 'archived' && 'success') ||
                  'default'
                }
              >
                {tab.count}
              </Label>
            }
            sx={{
              minHeight: 48,
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              '&.Mui-selected': {
                '& .MuiTab-iconWrapper': {
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                },
              },
              '& .MuiTab-iconWrapper': {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginLeft: 0.5,
              },
              '& .MuiTab-label': {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              },
            }}
          />
        ))}
      </Tabs>
    );
  };

  const renderList = () => {
    if (isLoading) {
      return (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            알림을 불러오는 중...
          </Typography>
        </Box>
      );
    }

    if (filteredNotifications.length === 0) {
      return (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            {currentTab === 'all' && '알림이 없습니다.'}
            {currentTab === 'unread' && '읽지 않은 알림이 없습니다.'}
            {currentTab === 'archived' && '읽은 알림이 없습니다.'}
          </Typography>
        </Box>
      );
    }

    return (
      <Scrollbar>
        <Box component="ul">
          {filteredNotifications.map((notification) => (
            <Box component="li" key={notification.id} sx={{ display: 'flex' }}>
              <NotificationItem
                notification={notification}
                onMarkAsRead={(id) => markAsReadMutation.mutate(id)}
              />
            </Box>
          ))}
        </Box>
      </Scrollbar>
    );
  };

  return (
    <>
      <IconButton
        component={m.button}
        whileTap={varTap(0.96)}
        whileHover={varHover(1.04)}
        transition={transitionTap()}
        aria-label="Notifications button"
        onClick={onOpen}
        sx={sx}
        {...other}
      >
        <Badge badgeContent={totalUnRead} color="error">
          <Iconify width={24} icon="solar:bell-bing-bold-duotone" />
        </Badge>
      </IconButton>

      <Drawer
        open={open}
        onClose={onClose}
        anchor="right"
        slotProps={{
          backdrop: { invisible: true },
          paper: { sx: { width: 1, maxWidth: 420 } },
        }}
      >
        {renderHead()}
        {renderTabs()}
        {renderList()}

        {totalCount > page * pageSize && (
          <Box sx={{ p: 1 }}>
            <Button fullWidth size="large" onClick={handleLoadMore}>
              더 보기
            </Button>
          </Box>
        )}
      </Drawer>
    </>
  );
}
