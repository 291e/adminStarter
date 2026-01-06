import { useState, useMemo } from 'react';
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
import { useMyInfo } from 'src/sections/Chat/hooks/use-my-info';
import { CONFIG } from 'src/global-config';
import CreateChatRoomModal from './CreateChatRoomModal';
import type { ChatRoomDto, ChatParticipantDto } from 'src/services/chat/chat.types';

type Props = {
  rooms: ChatRoomDto[];
  selectedRoomId: string | null;
  onSelectRoom: (room: ChatRoomDto) => void;
  onCreateRoom?: (roomName: string, memberIndexes: number[]) => void;
};

export default function LeftSection({ rooms, selectedRoomId, onSelectRoom, onCreateRoom }: Props) {
  const { user } = useAuthContext();
  const { data: myInfoData } = useMyInfo();
  const [searchQuery, setSearchQuery] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const normalChatExpanded = useBoolean(true);
  const groupChatExpanded = useBoolean(true);

  // 현재 사용자 memberIdx 추출 (여러 후보 필드에서 시도)
  const currentUserMemberIdx =
    (myInfoData as any)?.memberIdx ||
    (myInfoData as any)?.memberIndex ||
    (myInfoData as any)?.member?.memberIdx ||
    (myInfoData as any)?.member?.memberIndex ||
    user?.memberIdx ||
    user?.memberIndex ||
    user?.member?.memberIdx ||
    user?.member?.memberIndex ||
    user?.companyMember?.memberIdx ||
    user?.companyMember?.memberIndex ||
    null;

  const filteredRooms = rooms
    .map((room) => {
      const lastMessageTime = room.lastMessageAt
        ? new Date(room.lastMessageAt).toLocaleTimeString('ko-KR', {
            hour: '2-digit',
            minute: '2-digit',
          })
        : '';
      return {
        ...room,
        lastMessageTime,
      };
    })
    .filter((room) => room.name.toLowerCase().includes(searchQuery.toLowerCase()));

  // participants 배열에서 현재 사용자를 제외한 상대방 수로 일반/그룹 채팅 구분
  // 상대방 1명 = 일반 채팅 (나 포함 2명)
  // 상대방 2명 이상 = 그룹 채팅 (나 포함 3명 이상)
  const getOtherParticipants = (participants?: ChatParticipantDto[]) => {
    if (!participants || !Array.isArray(participants)) return [];
    if (currentUserMemberIdx === null || currentUserMemberIdx === undefined) return participants;

    const currentIdx = Number(currentUserMemberIdx);
    if (Number.isNaN(currentIdx)) return participants;

    return participants.filter((p) => {
      const participantIdx = Number(p.memberIdx ?? (p as any)?.memberIndex);
      return !Number.isNaN(participantIdx) && participantIdx !== currentIdx;
    });
  };

  // 일반 채팅 목록: 상대방이 1명인 경우 (나 포함 2명)
  const normalRooms = filteredRooms.filter((room) => {
    if (room.type === 'CHATBOT' || room.type === 'EMERGENCY') return false;
    const otherParticipants = getOtherParticipants(room.participants);
    return otherParticipants.length === 1;
  });

  // 그룹 채팅 목록: 상대방이 2명 이상인 경우 (나 포함 3명 이상)
  const groupRooms = filteredRooms.filter((room) => {
    if (room.type === 'CHATBOT' || room.type === 'EMERGENCY') return false;
    const otherParticipants = getOtherParticipants(room.participants);
    return otherParticipants.length >= 2;
  });

  // participants 배열에서 현재 사용자를 제외한 상대방 목록 반환
  const getFilteredParticipants = (participants?: ChatParticipantDto[]) =>
    getOtherParticipants(participants);

  // lastMessage가 객체일 경우 text를 추출하는 헬퍼 함수
  const getLastMessageText = (
    lastMessage?:
      | string
      | { text: string; senderId?: string; translations?: Record<string, string> }
  ): string => {
    if (!lastMessage) return '';
    if (typeof lastMessage === 'string') return lastMessage;
    return lastMessage.text || '';
  };

  // 챗봇방은 항상 표시 (API 응답에 없어도)
  const chatbotRoom: ChatRoomDto = {
    chatRoomIdx: 0,
    chatRoomId: 'chatbot',
    name: '챗봇',
    type: 'CHATBOT',
    isGroup: 0,
    lastMessage: '',
    lastMessageAt: '',
  };

  const emergencyRoom = filteredRooms.find((r) => r.type === 'EMERGENCY');

  // 내 프로필 정보 추출
  const myProfileImage = useMemo(() => {
    const memberThumbnail =
      (myInfoData as any)?.memberThumbnail ||
      (myInfoData as any)?.member?.memberThumbnail ||
      (myInfoData as any)?.avatar ||
      null;
    return memberThumbnail;
  }, [myInfoData]);

  const myName = useMemo(
    () =>
      (myInfoData as any)?.memberName ||
      (myInfoData as any)?.member?.memberName ||
      (myInfoData as any)?.name ||
      user?.name ||
      '',
    [myInfoData, user]
  );

  // 파일 URL을 전체 URL로 변환하는 헬퍼 함수 (ProfileCard.tsx와 동일한 로직)
  const getFullFileUrl = (url: string | null | undefined): string | null => {
    if (!url) return null;
    // 잘못된 형식: data:image/png;base64,data/admin/... 같은 경우 처리
    if (
      url.startsWith('data:image/png;base64,data/admin/') ||
      url.startsWith('data:image/png;base64,/data/admin/')
    ) {
      // base64 접두사를 제거하고 URL로 처리
      const cleanUrl = url.replace(/^data:image\/png;base64,/, '');
      const baseUrl = CONFIG.serverUrl.replace(/\/$/, '');
      const path = cleanUrl.startsWith('/') ? cleanUrl : `/${cleanUrl}`;
      return `${baseUrl}${path}`;
    }
    // 이미 전체 URL인 경우 (http:// 또는 https://로 시작)
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    // base64 데이터 URL인 경우 그대로 반환 (실제 base64 데이터인 경우)
    if (url.startsWith('data:image/') && !url.includes('data/admin/')) {
      return url;
    }
    // 상대 경로인 경우 CONFIG.serverUrl과 결합
    // data/admin/로 시작하는 경우도 처리
    const baseUrl = CONFIG.serverUrl.replace(/\/$/, '');
    const path = url.startsWith('/') ? url : `/${url}`;
    return `${baseUrl}${path}`;
  };

  // Avatar 렌더링 헬퍼 함수 (프로필 이미지가 있으면 사용, 없으면 아이콘)
  const renderAvatar = (participant: ChatParticipantDto, size: number = 40) => {
    const profileImageUrl = getFullFileUrl(participant.profileImage);
    if (profileImageUrl) {
      return (
        <Avatar sx={{ width: size, height: size }} src={profileImageUrl} alt={participant.name}>
          {participant.name?.[0] || '?'}
        </Avatar>
      );
    }
    return (
      <Avatar sx={{ width: size, height: size }}>
        <Iconify icon="solar:user-rounded-bold" width={size * 0.6} />
      </Avatar>
    );
  };

  // 그룹 채팅 Avatar 렌더링 함수 (Figma 디자인에 맞춰 멤버 수에 따라 다르게 표시)
  const renderGroupAvatar = (participants?: ChatParticipantDto[]) => {
    const filteredParticipants = getFilteredParticipants(participants);
    const participantCount = filteredParticipants.length;

    // 1명일 때: 단일 Avatar
    if (participantCount <= 1) {
      const participant = filteredParticipants[0];
      if (!participant) {
        return (
          <Avatar sx={{ width: 40, height: 40 }}>
            <Iconify icon="solar:user-rounded-bold" width={24} />
          </Avatar>
        );
      }
      return renderAvatar(participant, 40);
    }

    // 2명일 때: 2개 Avatar 겹쳐서 (왼쪽/오른쪽)
    if (participantCount === 2) {
      return (
        <Box
          sx={{
            position: 'relative',
            width: 40,
            height: 40,
          }}
        >
          {filteredParticipants[0] && (
            <Box
              sx={{
                position: 'absolute',
                left: 0,
                top: '15%',
                width: 25,
                height: 25,
              }}
            >
              {renderAvatar(filteredParticipants[0], 25)}
            </Box>
          )}
          {filteredParticipants[1] && (
            <Box
              sx={{
                position: 'absolute',
                right: 0,
                top: '15%',
                width: 25,
                height: 25,
              }}
            >
              {renderAvatar(filteredParticipants[1], 25)}
            </Box>
          )}
        </Box>
      );
    }

    // 3명일 때: 3개 Avatar 삼각형 배치 (위쪽 중앙, 아래쪽 왼쪽, 아래쪽 오른쪽)
    if (participantCount === 3) {
      return (
        <Box
          sx={{
            position: 'relative',
            width: 40,
            height: 40,
          }}
        >
          {/* 위쪽 중앙 */}
          {filteredParticipants[0] && (
            <Box
              sx={{
                position: 'absolute',
                left: '50%',
                top: 3.5,
                transform: 'translateX(-50%)',
                width: 20,
                height: 20,
              }}
            >
              {renderAvatar(filteredParticipants[0], 20)}
            </Box>
          )}
          {/* 아래쪽 왼쪽 */}
          {filteredParticipants[1] && (
            <Box
              sx={{
                position: 'absolute',
                left: 0,
                bottom: 0,
                width: 20,
                height: 20,
              }}
            >
              {renderAvatar(filteredParticipants[1], 20)}
            </Box>
          )}
          {/* 아래쪽 오른쪽 */}
          {filteredParticipants[2] && (
            <Box
              sx={{
                position: 'absolute',
                right: 0,
                bottom: 0,
                width: 20,
                height: 20,
              }}
            >
              {renderAvatar(filteredParticipants[2], 20)}
            </Box>
          )}
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
        {filteredParticipants[0] && (
          <Box
            sx={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: 20,
              height: 20,
            }}
          >
            {renderAvatar(filteredParticipants[0], 20)}
          </Box>
        )}
        {/* 오른쪽 위 */}
        {filteredParticipants[1] && (
          <Box
            sx={{
              position: 'absolute',
              right: 0,
              top: 0,
              width: 20,
              height: 20,
            }}
          >
            {renderAvatar(filteredParticipants[1], 20)}
          </Box>
        )}
        {/* 왼쪽 아래 */}
        {filteredParticipants[2] && (
          <Box
            sx={{
              position: 'absolute',
              left: 0,
              bottom: 0,
              width: 20,
              height: 20,
            }}
          >
            {renderAvatar(filteredParticipants[2], 20)}
          </Box>
        )}
        {/* 오른쪽 아래 */}
        {filteredParticipants[3] && (
          <Box
            sx={{
              position: 'absolute',
              right: 0,
              bottom: 0,
              width: 20,
              height: 20,
            }}
          >
            {renderAvatar(filteredParticipants[3], 20)}
          </Box>
        )}
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
        <Avatar
          sx={{ width: 48, height: 48 }}
          src={getFullFileUrl(myProfileImage) || undefined}
          alt={myName}
        >
          {myName?.[0] || <Iconify icon="solar:user-rounded-bold" width={24} />}
        </Avatar>
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
              <Iconify icon="eva:search-fill" width={20} sx={{ color: 'text.disabled', mr: 1 }} />
            ),
          }}
        />
      </Box>

      <Scrollbar sx={{ flex: 1 }}>
        <Box sx={{ pb: 1 }}>
          {/* 챗봇 - 항상 표시 */}
          <ListItem disablePadding>
            <ListItemButton
              selected={selectedRoomId === 'chatbot'}
              onClick={() => onSelectRoom(chatbotRoom)}
              sx={{ px: 2.5, py: 1.5 }}
            >
              <ListItemAvatar>
                <Avatar
                  sx={{ width: 40, height: 40 }}
                  src={CONFIG.assetsDir ? `${CONFIG.assetsDir}/bot.png` : '/bot.png'}
                  alt="챗봇"
                >
                  <Iconify icon="solar:user-rounded-bold" width={24} />
                </Avatar>
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
                  {emergencyRoom.lastMessageTime ? (
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {emergencyRoom.lastMessageTime}
                    </Typography>
                  ) : null}
                  {typeof emergencyRoom.unreadCount === 'number' &&
                    emergencyRoom.unreadCount > 0 && (
                      <UnreadBadge count={emergencyRoom.unreadCount} />
                    )}
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
                  {normalRooms.map((room) => {
                    // 일반 채팅: 상대방 1명의 정보 가져오기 (아바타용)
                    const otherParticipants = getFilteredParticipants(room.participants);
                    const otherParticipant = otherParticipants[0];

                    return (
                      <ListItem key={room.chatRoomId || room.name} disablePadding>
                        <ListItemButton
                          selected={selectedRoomId === room.chatRoomId}
                          onClick={() => onSelectRoom(room)}
                          sx={{ px: 2.5, py: 1.5 }}
                        >
                          <ListItemAvatar>
                            {otherParticipant ? (
                              renderAvatar(otherParticipant, 40)
                            ) : (
                              <Avatar sx={{ width: 40, height: 40 }}>
                                <Iconify icon="solar:user-rounded-bold" width={24} />
                              </Avatar>
                            )}
                          </ListItemAvatar>
                          <ListItemText
                            primary={room.name}
                            secondary={getLastMessageText(room.lastMessage)}
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
                            {room.lastMessageTime ? (
                              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                {room.lastMessageTime}
                              </Typography>
                            ) : null}
                            {typeof room.unreadCount === 'number' && room.unreadCount > 0 && (
                              <UnreadBadge count={room.unreadCount} />
                            )}
                          </Stack>
                        </ListItemButton>
                      </ListItem>
                    );
                  })}
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
                    <ListItem key={room.chatRoomId || room.name} disablePadding>
                      <ListItemButton
                        selected={selectedRoomId === room.chatRoomId}
                        onClick={() => onSelectRoom(room)}
                        sx={{ px: 2.5, py: 1.5 }}
                      >
                        <ListItemAvatar>{renderGroupAvatar(room.participants)}</ListItemAvatar>
                        <ListItemText
                          primary={
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: 14 }}>
                              {room.name}
                            </Typography>
                          }
                          secondary={getLastMessageText(room.lastMessage)}
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
                          {room.lastMessageTime ? (
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                              {room.lastMessageTime}
                            </Typography>
                          ) : null}
                          {typeof room.unreadCount === 'number' && room.unreadCount > 0 && (
                            <UnreadBadge count={room.unreadCount} />
                          )}
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
          // userIds is string[], convert to number[] if your API expects number[]
          // The prompt's API: POST /safeyoui/api/chat/rooms -> CreateChatRoomParams { memberIndexes: number[] }
          const memberIndexes = userIds.map((id) => Number(id));
          if (onCreateRoom) {
            onCreateRoom(roomName, memberIndexes);
          }
          setCreateModalOpen(false);
        }}
      />
    </Box>
  );
}
