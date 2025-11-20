import { useState } from 'react';
import { useBoolean } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { useAuthContext } from 'src/auth/hooks/use-auth-context';
import CreateChatRoomModal from './CreateChatRoomModal';

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
  const { user } = useAuthContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const normalChatExpanded = useBoolean(true);
  const groupChatExpanded = useBoolean(true);

  // 현재 사용자 이름 (displayName 또는 name 사용)
  const currentUserName = user?.displayName || user?.name || '';

  const filteredRooms = rooms.filter((room) =>
    room.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 일반 채팅 목록: 본인과의 채팅방 제외
  const normalRooms = filteredRooms.filter(
    (room) =>
      !room.isGroup &&
      room.type !== 'chatbot' &&
      room.type !== 'emergency' &&
      room.name !== currentUserName
  );

  // 그룹 채팅 목록: members 배열에 본인이 포함된 경우 제외
  const groupRooms = filteredRooms.filter(
    (room) =>
      room.isGroup && (!room.members || !room.members.some((member) => member === currentUserName))
  );

  // 그룹 채팅 멤버 목록에서 본인과 "외 N명" 같은 텍스트를 제외하는 함수
  const getFilteredMembers = (members?: string[]): string[] => {
    if (!members) return [];
    return members.filter(
      (member) =>
        member !== currentUserName &&
        !member.includes('외') &&
        !member.includes('명') &&
        member.trim() !== ''
    );
  };

  const chatbotRoom = filteredRooms.find((r) => r.type === 'chatbot');
  const emergencyRoom = filteredRooms.find((r) => r.type === 'emergency');

  // 그룹 채팅 Avatar 렌더링 함수 (Figma 디자인에 맞춰 멤버 수에 따라 다르게 표시)
  const renderGroupAvatar = (members?: string[]) => {
    const filteredMembers = getFilteredMembers(members);
    const memberCount = filteredMembers.length;

    // 1명일 때: 단일 Avatar
    if (memberCount <= 1) {
      const member = filteredMembers[0];
      return <Avatar sx={{ width: 40, height: 40 }}>{member?.[0] || '?'}</Avatar>;
    }

    // 2명일 때: 2개 Avatar 겹쳐서 (왼쪽/오른쪽)
    if (memberCount === 2) {
      return (
        <Box
          sx={{
            position: 'relative',
            width: 40,
            height: 40,
          }}
        >
          <Avatar
            sx={{
              width: 25,
              height: 25,
              border: '1px solid',
              borderColor: 'background.paper',
              position: 'absolute',
              left: 0,
              top: '15%',
              bottom: '15%',
            }}
          >
            {filteredMembers[0]?.[0] || ''}
          </Avatar>
          <Avatar
            sx={{
              width: 25,
              height: 25,
              border: '1px solid',
              borderColor: 'background.paper',
              position: 'absolute',
              right: 0,
              top: '15%',
              bottom: '15%',
            }}
          >
            {filteredMembers[1]?.[0] || ''}
          </Avatar>
        </Box>
      );
    }

    // 3명일 때: 3개 Avatar 겹쳐서 (왼쪽/중앙/오른쪽)
    if (memberCount === 3) {
      return (
        <Box
          sx={{
            position: 'relative',
            width: 40,
            height: 40,
          }}
        >
          <Avatar
            sx={{
              width: 20,
              height: 20,
              border: '1px solid',
              borderColor: 'background.paper',
              position: 'absolute',
              left: 0,
              top: '20%',
              bottom: '20%',
            }}
          >
            {filteredMembers[0]?.[0] || ''}
          </Avatar>
          <Avatar
            sx={{
              width: 20,
              height: 20,
              border: '1px solid',
              borderColor: 'background.paper',
              position: 'absolute',
              left: '50%',
              top: '20%',
              bottom: '20%',
              transform: 'translateX(-50%)',
            }}
          >
            {filteredMembers[1]?.[0] || ''}
          </Avatar>
          <Avatar
            sx={{
              width: 20,
              height: 20,
              border: '1px solid',
              borderColor: 'background.paper',
              position: 'absolute',
              right: 0,
              top: '20%',
              bottom: '20%',
            }}
          >
            {filteredMembers[2]?.[0] || ''}
          </Avatar>
        </Box>
      );
    }

    // 4명 이상일 때: 4개 Avatar를 2x2 그리드로
    return (
      <Box
        sx={{
          position: 'relative',
          width: 40,
          height: 40,
        }}
      >
        {/* 왼쪽 위 */}
        <Avatar
          sx={{
            width: 20,
            height: 20,
            border: '1px solid',
            borderColor: 'background.paper',
            position: 'absolute',
            left: 0,
            top: 0,
          }}
        >
          {filteredMembers[0]?.[0] || ''}
        </Avatar>
        {/* 오른쪽 위 */}
        <Avatar
          sx={{
            width: 20,
            height: 20,
            border: '1px solid',
            borderColor: 'background.paper',
            position: 'absolute',
            right: 0,
            top: 0,
          }}
        >
          {filteredMembers[1]?.[0] || ''}
        </Avatar>
        {/* 왼쪽 아래 */}
        <Avatar
          sx={{
            width: 20,
            height: 20,
            border: '1px solid',
            borderColor: 'background.paper',
            position: 'absolute',
            left: 0,
            bottom: 0,
          }}
        >
          {filteredMembers[2]?.[0] || ''}
        </Avatar>
        {/* 오른쪽 아래 */}
        <Avatar
          sx={{
            width: 20,
            height: 20,
            border: '1px solid',
            borderColor: 'background.paper',
            position: 'absolute',
            right: 0,
            bottom: 0,
          }}
        >
          {filteredMembers[3]?.[0] || ''}
        </Avatar>
      </Box>
    );
  };

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
        <Tooltip title="채팅방 만들기" arrow>
          <IconButton size="small" onClick={() => setCreateModalOpen(true)}>
            <Iconify icon="solar:add-circle-bold" width={24} />
          </IconButton>
        </Tooltip>
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
                        <ListItemAvatar>{renderGroupAvatar(room.members)}</ListItemAvatar>
                        <ListItemText
                          primary={
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: 14 }}>
                              {(() => {
                                const filteredMembers = getFilteredMembers(room.members);
                                const displayMembers = filteredMembers.slice(0, 3);
                                const remainingCount = filteredMembers.length - 3;
                                return (
                                  <>
                                    {displayMembers.join(', ')}
                                    {remainingCount > 0 && ` 외 ${remainingCount}명`}
                                  </>
                                );
                              })()}
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

      {/* 채팅방 만들기 모달 */}
      <CreateChatRoomModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onConfirm={(roomName, userIds) => {
          // TODO: TanStack Query Hook(useMutation)으로 채팅방 생성 API 호출
          // 생성 성공 후 채팅방 목록 갱신 및 새 채팅방 선택
          console.log('채팅방 생성:', roomName, userIds);
          setCreateModalOpen(false);
        }}
      />
    </Box>
  );
}
