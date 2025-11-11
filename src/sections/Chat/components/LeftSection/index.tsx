import { useState } from 'react';
import { useBoolean } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

type ChatRoom = {
  id: string;
  name: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount?: number;
  avatar?: string;
  isGroup?: boolean;
  members?: string[];
  type?: 'chatbot' | 'emergency' | 'normal' | 'group';
};

type Props = {
  rooms: ChatRoom[];
  selectedRoomId: string | null;
  onSelectRoom: (room: ChatRoom) => void;
};

export default function LeftSection({ rooms, selectedRoomId, onSelectRoom }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const normalChatExpanded = useBoolean(true);
  const groupChatExpanded = useBoolean(true);

  const filteredRooms = rooms.filter((room) =>
    room.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const normalRooms = filteredRooms.filter(
    (room) => !room.isGroup && room.type !== 'chatbot' && room.type !== 'emergency'
  );
  const groupRooms = filteredRooms.filter((room) => room.isGroup);

  const chatbotRoom = filteredRooms.find((r) => r.type === 'chatbot');
  const emergencyRoom = filteredRooms.find((r) => r.type === 'emergency');

  const UnreadBadge = ({ count }: { count: number }) => (
    <Box
      sx={{
        width: 20,
        height: 20,
        borderRadius: '50%',
        bgcolor: 'error.main',
        color: 'error.contrastText',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 12,
        fontWeight: 700,
      }}
    >
      {count}
    </Box>
  );

  return (
    <Box
      sx={{
        width: { xs: '100%', lg: 320 },
        height: { xs: 400, lg: 'auto' },
        borderRight: { xs: 'none', lg: '1px solid #E0E0E0' },
        borderBottom: { xs: '1px solid #E0E0E0', lg: 'none' },
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.paper',
        flexShrink: 0,
      }}
    >
      {/* 헤더 */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 2.5 }}>
        <Avatar sx={{ width: 48, height: 48 }} />
        <IconButton size="small">
          <Iconify icon="solar:add-circle-bold" width={24} />
        </IconButton>
      </Stack>

      {/* 검색 */}
      <Box sx={{ px: 2.5, mb: 1 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="이름 검색..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <Iconify
                icon={'solar:magnifer-bold' as any}
                width={24}
                sx={{ mr: 1, color: 'text.disabled' }}
              />
            ),
          }}
        />
      </Box>

      <Scrollbar sx={{ flex: 1 }}>
        <Box sx={{ pb: 1 }}>
          {/* 챗봇 */}
          {chatbotRoom && (
            <ListItem disablePadding>
              <ListItemButton
                selected={selectedRoomId === 'chatbot'}
                onClick={() => onSelectRoom(chatbotRoom)}
                sx={{ px: 2.5, py: 1.5 }}
              >
                <ListItemAvatar>
                  <Avatar sx={{ width: 40, height: 40 }} />
                </ListItemAvatar>
                <ListItemText
                  primary="챗봇"
                  primaryTypographyProps={{
                    fontSize: 16,
                    fontWeight: 600,
                  }}
                />
              </ListItemButton>
            </ListItem>
          )}

          {/* 응급 채팅 */}
          {emergencyRoom && (
            <ListItem disablePadding>
              <ListItemButton
                selected={selectedRoomId === 'emergency'}
                onClick={() => onSelectRoom(emergencyRoom)}
                sx={{
                  px: 2.5,
                  py: 1.5,
                  bgcolor: 'warning.lighter',
                  borderTop: '1px solid',
                  borderBottom: '1px solid',
                  borderColor: 'grey.300',
                  '&.Mui-selected': {
                    bgcolor: 'warning.lighter',
                  },
                }}
              >
                <ListItemAvatar>
                  <Avatar
                    sx={{
                      width: 40,
                      height: 40,
                      bgcolor: 'rgba(255, 86, 48, 0.24)',
                      color: 'error.main',
                    }}
                  >
                    <Iconify icon={'mingcute:warning-fill' as any} width={24} />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography variant="subtitle2" sx={{ color: 'error.main', fontWeight: 600 }}>
                      사고 발생 현황
                    </Typography>
                  }
                  secondary="응급신고"
                  secondaryTypographyProps={{
                    fontSize: 14,
                  }}
                />
                <Stack direction="column" alignItems="flex-end" spacing={0.5} sx={{ minWidth: 68 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {emergencyRoom.lastMessageTime}
                  </Typography>
                  {emergencyRoom.unreadCount && <UnreadBadge count={emergencyRoom.unreadCount} />}
                </Stack>
              </ListItemButton>
            </ListItem>
          )}

          {/* 일반 채팅 목록 */}
          {normalRooms.length > 0 && (
            <>
              <Box
                onClick={normalChatExpanded.onToggle}
                sx={{
                  px: 2.5,
                  py: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  minHeight: 18,
                }}
              >
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    일반 채팅 목록
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                    {normalRooms.length}
                  </Typography>
                </Stack>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    normalChatExpanded.onToggle();
                  }}
                  sx={{
                    width: 24,
                    height: 24,
                    transform: normalChatExpanded.value ? 'rotate(0deg)' : 'rotate(-90deg)',
                    transition: 'transform 0.2s',
                  }}
                >
                  <Iconify icon={'eva:arrow-ios-downward-fill' as any} width={18} />
                </IconButton>
              </Box>
              {normalChatExpanded.value && (
                <List disablePadding>
                  {normalRooms.map((room) => (
                    <ListItem key={room.id} disablePadding>
                      <ListItemButton
                        selected={selectedRoomId === room.id}
                        onClick={() => onSelectRoom(room)}
                        sx={{ px: 2.5, py: 1.5 }}
                      >
                        <ListItemAvatar>
                          <Avatar sx={{ width: 40, height: 40 }}>
                            {room.avatar || room.name[0]}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={room.name}
                          secondary={room.lastMessage}
                          primaryTypographyProps={{
                            fontSize: 14,
                            fontWeight: 600,
                          }}
                          secondaryTypographyProps={{
                            fontSize: 12,
                            color: 'text.secondary',
                          }}
                        />
                        <Stack
                          direction="column"
                          alignItems="flex-end"
                          spacing={0.5}
                          sx={{ minWidth: 68, ml: 1.5 }}
                        >
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            {room.lastMessageTime}
                          </Typography>
                          {room.unreadCount && <UnreadBadge count={room.unreadCount} />}
                        </Stack>
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              )}
            </>
          )}

          {/* 그룹 채팅 목록 */}
          {groupRooms.length > 0 && (
            <>
              <Box
                onClick={groupChatExpanded.onToggle}
                sx={{
                  px: 2.5,
                  py: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  minHeight: 18,
                }}
              >
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    그룹 채팅 목록
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                    {groupRooms.length}
                  </Typography>
                </Stack>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    groupChatExpanded.onToggle();
                  }}
                  sx={{
                    width: 24,
                    height: 24,
                    transform: groupChatExpanded.value ? 'rotate(0deg)' : 'rotate(-90deg)',
                    transition: 'transform 0.2s',
                  }}
                >
                  <Iconify icon={'eva:arrow-ios-downward-fill' as any} width={18} />
                </IconButton>
              </Box>
              {groupChatExpanded.value && (
                <List disablePadding>
                  {groupRooms.map((room) => (
                    <ListItem key={room.id} disablePadding>
                      <ListItemButton
                        selected={selectedRoomId === room.id}
                        onClick={() => onSelectRoom(room)}
                        sx={{ px: 2.5, py: 1.5 }}
                      >
                        <ListItemAvatar>
                          <Avatar sx={{ width: 40, height: 40 }} />
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: 14 }}>
                              {room.members?.slice(0, 3).join(', ')}
                              {room.members &&
                                room.members.length > 3 &&
                                ` 외 ${room.members.length - 3}명`}
                            </Typography>
                          }
                          secondary={room.lastMessage}
                          secondaryTypographyProps={{
                            fontSize: 12,
                            color: 'text.secondary',
                          }}
                        />
                        <Stack
                          direction="column"
                          alignItems="flex-end"
                          spacing={0.5}
                          sx={{ minWidth: 68, ml: 1.5 }}
                        >
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            {room.lastMessageTime}
                          </Typography>
                          {room.unreadCount && <UnreadBadge count={room.unreadCount} />}
                        </Stack>
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              )}
            </>
          )}
        </Box>
      </Scrollbar>
    </Box>
  );
}
