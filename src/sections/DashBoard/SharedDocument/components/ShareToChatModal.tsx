import { useState, useEffect, useMemo } from 'react';
import { useGetChatRooms } from 'src/sections/Chat/hooks/use-chat-api';
import type { ChatRoomDto, ChatParticipantDto } from 'src/services/chat/chat.types';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Checkbox from '@mui/material/Checkbox';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import DialogBtn from 'src/components/safeyoui/button/dialogBtn';
import { useAuthContext } from 'src/auth/hooks/use-auth-context';
import { useMyInfo } from 'src/sections/Chat/hooks/use-my-info';
import { CONFIG } from 'src/global-config';

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  onClose: () => void;
  onShare: (chatRoomIdxList: number[], documentId: string) => void;
  documentId: string;
  documentName: string;
};

export default function ShareToChatModal({
  open,
  onClose,
  onShare,
  documentId,
  documentName,
}: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoomIndices, setSelectedRoomIndices] = useState<number[]>([]);
  const [isNormalExpanded, setIsNormalExpanded] = useState(true);
  const [isGroupExpanded, setIsGroupExpanded] = useState(true);
  const { user } = useAuthContext();
  const { data: myInfoData } = useMyInfo();

  const currentMemberIdx =
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

  useEffect(() => {
    if (open) {
      // TODO: TanStack Query Hook(useQuery)으로 채팅방 목록 가져오기
      // const { data: chatRooms } = useQuery({
      //   queryKey: ['chatRooms', { search: searchQuery }],
      //   queryFn: () => fetchChatRooms({ search: searchQuery }),
      // });
      // setChatRooms(chatRooms || []);
      setSearchQuery('');
      setSelectedRoomIndices([]);
      setIsNormalExpanded(true);
      setIsGroupExpanded(true);
    }
  }, [open]);

  // participants를 배열로 정규화 (객체 형태일 수도 있음)
  const normalizeParticipants = (participants?: ChatRoomDto['participants']): ChatParticipantDto[] => {
    if (!participants) return [];
    // 이미 배열이면 그대로 반환
    if (Array.isArray(participants)) return participants;
    // 객체 형태면 값들을 배열로 변환
    if (typeof participants === 'object') {
      return Object.values(participants).filter(
        (p): p is ChatParticipantDto => p !== null && typeof p === 'object'
      );
    }
    return [];
  };

  // 파일 URL을 전체 URL로 변환하는 헬퍼 함수
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

  // 현재 사용자를 제외한 참가자 목록 반환
  const getOtherParticipants = (participants?: ChatRoomDto['participants']) => {
    const normalizedParticipants = normalizeParticipants(participants);
    const hasCurrentMemberIdx =
      currentMemberIdx !== null &&
      currentMemberIdx !== undefined &&
      !Number.isNaN(Number(currentMemberIdx));
    
    if (!hasCurrentMemberIdx) return normalizedParticipants;

    const currentIdx = Number(currentMemberIdx);
    if (Number.isNaN(currentIdx)) return normalizedParticipants;

    return normalizedParticipants.filter((p) => {
      const participantIdx = Number(p.memberIdx ?? (p as any)?.memberIndex);
      return !Number.isNaN(participantIdx) && participantIdx !== currentIdx;
    });
  };

  // 검색 필터링 및 일반/그룹 채팅 분리
  const { data: chatRoomsData, isLoading } = useGetChatRooms();
  const rooms = useMemo<ChatRoomDto[]>(() => {
    const list =
      (chatRoomsData as any)?.chatRoomList || (chatRoomsData as any)?.body?.chatRoomList || [];
    if (!Array.isArray(list)) {
      return [];
    }
    return list as ChatRoomDto[];
  }, [chatRoomsData]);

  const { normalRooms, groupRooms } = useMemo<{
    normalRooms: ChatRoomDto[];
    groupRooms: ChatRoomDto[];
  }>(() => {
    const hasCurrentMemberIdx =
      currentMemberIdx !== null &&
      currentMemberIdx !== undefined &&
      !Number.isNaN(Number(currentMemberIdx));

    // 현재 사용자가 참가자 목록에 포함되어 있는지 확인 (나간 채팅방 필터링)
    const isCurrentUserParticipant = (participants?: ChatRoomDto['participants']): boolean => {
      const normalizedParticipants = normalizeParticipants(participants);
      
      // participants가 비어있으면 필터링하지 않음 (API가 이미 처리했을 수도 있음)
      if (normalizedParticipants.length === 0) return true;
      
      if (!hasCurrentMemberIdx) return true; // memberIdx가 없으면 필터링하지 않음

      const currentIdx = Number(currentMemberIdx);
      if (Number.isNaN(currentIdx)) return true;

      // 현재 사용자가 participants 배열에 포함되어 있는지 확인
      const currentParticipant = normalizedParticipants.find((p) => {
        const participantIdx = Number(p.memberIdx ?? (p as any)?.memberIndex);
        return !Number.isNaN(participantIdx) && participantIdx === currentIdx;
      });

      // 현재 사용자가 참가자 목록에 없으면 나간 채팅방으로 간주
      if (!currentParticipant) return false;

      // leftAt 필드가 있으면 null인지 확인 (null이면 아직 참가 중)
      const leftAt = (currentParticipant as any)?.leftAt;
      if (leftAt !== undefined && leftAt !== null) {
        return false; // leftAt이 있으면 나간 채팅방
      }

      return true; // 참가 중인 채팅방
    };


    // 나간 채팅방 필터링: participants 배열에 현재 사용자가 포함되어 있는 채팅방만 표시
    let filtered = rooms;
    if (hasCurrentMemberIdx) {
      filtered = rooms.filter((room) => {
        // CHATBOT, EMERGENCY 타입은 항상 표시
        if (room.type === 'CHATBOT' || room.type === 'EMERGENCY') return true;
        // 현재 사용자가 참가 중인 채팅방만 표시
        return isCurrentUserParticipant(room.participants);
      });
    }

    const searchValue = searchQuery.trim().toLowerCase();

    if (searchValue) {
      filtered = filtered.filter((room) => {
        const roomName = room.name?.toLowerCase() || '';
        if (!hasCurrentMemberIdx) {
          return roomName.includes(searchValue);
        }
        const otherParticipants = getOtherParticipants(room.participants);
        const participantNames = otherParticipants
          .map((p) => p.name)
          .join(' ')
          .toLowerCase();
        return roomName.includes(searchValue) || participantNames.includes(searchValue);
      });
    }

    const normal = filtered.filter((room) => {
      if (room.type === 'CHATBOT' || room.type === 'EMERGENCY') return false;
      if (!hasCurrentMemberIdx) return !room.isGroup;
      const otherParticipants = getOtherParticipants(room.participants);
      return otherParticipants.length === 1;
    });

    const group = filtered.filter((room) => {
      if (room.type === 'CHATBOT' || room.type === 'EMERGENCY') return false;
      if (!hasCurrentMemberIdx) return !!room.isGroup;
      const otherParticipants = getOtherParticipants(room.participants);
      return otherParticipants.length >= 2;
    });

    return { normalRooms: normal, groupRooms: group };
  }, [rooms, searchQuery, currentMemberIdx]);

  // lastMessage가 객체일 경우 text를 추출하는 헬퍼 함수
  const getLastMessageText = (
    lastMessage?:
      | string
      | { text: string; senderId?: string; translations?: Record<string, string> }
  ): string => {
    if (!lastMessage) return '';
    
    let text = '';
    if (typeof lastMessage === 'string') {
      text = lastMessage;
    } else {
      text = lastMessage.text || '';
    }
    
    // [이미지]|url 형식을 [이미지]로 변환
    if (text.includes('[이미지]|')) {
      text = text.split('|')[0]; // | 기준으로 분리하여 첫 번째 부분만 사용
    }
    
    return text;
  };

  const handleToggleRoom = (chatRoomIdx: number) => {
    setSelectedRoomIndices((prev) =>
      prev.includes(chatRoomIdx)
        ? prev.filter((idx) => idx !== chatRoomIdx)
        : [...prev, chatRoomIdx]
    );
  };

  const handleToggleNormalExpanded = () => {
    setIsNormalExpanded((prev) => !prev);
  };

  const handleToggleGroupExpanded = () => {
    setIsGroupExpanded((prev) => !prev);
  };

  const handleShare = () => {
    if (selectedRoomIndices.length > 0) {
      // 여러 채팅방에 공유 (chatRoomIdx 배열을 한 번에 전달)
      onShare(selectedRoomIndices, documentId);
      handleClose();
    }
  };

  const handleClose = () => {
    setSearchQuery('');
    setSelectedRoomIndices([]);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography component="div" variant="h6" sx={{ fontWeight: 600, fontSize: 18 }}>
          채팅방 공유하기
        </Typography>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            position: 'absolute',
            right: 16,
            top: 16,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <Iconify icon="solar:close-circle-bold" width={24} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        <Stack spacing={2}>
          {/* 검색 필드 */}
          <TextField
            fullWidth
            placeholder="공유하고 싶은 사람 이름, 채팅방 이름을 검색해 주세요."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="eva:search-fill" width={24} sx={{ color: 'text.disabled' }} />
                </InputAdornment>
              ),
            }}
            sx={{
              px: 3,
              '& .MuiInputBase-input': {
                fontSize: 15,
                lineHeight: '24px',
                py: 2,
              },
            }}
          />

          {/* 채팅방 목록 */}
          <Box
            sx={{
              maxHeight: 500,
            }}
          >
            <Scrollbar>
              {isLoading ? (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    py: 6,
                  }}
                >
                  <CircularProgress size={32} />
                </Box>
              ) : (
                <>
                  {/* 일반 채팅 목록 */}
                  {normalRooms.length > 0 && (
                    <Box>
                      <Box
                        onClick={handleToggleNormalExpanded}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          px: 2.5,
                          py: 1,
                          cursor: 'pointer',
                          '&:hover': {
                            bgcolor: 'action.hover',
                          },
                        }}
                      >
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <Typography
                            variant="caption"
                            sx={{ color: 'text.secondary', fontSize: 12 }}
                          >
                            일반 채팅 목록
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{ color: 'text.secondary', fontSize: 12, fontWeight: 600 }}
                          >
                            {normalRooms.length}
                          </Typography>
                        </Stack>
                        <Iconify
                          icon={
                            isNormalExpanded
                              ? 'eva:arrow-ios-downward-fill'
                              : 'eva:arrow-ios-forward-fill'
                          }
                          width={18}
                          sx={{
                            color: 'text.secondary',
                            transform: isNormalExpanded ? 'rotate(0deg)' : 'rotate(-90deg)',
                            transition: 'transform 0.2s',
                          }}
                        />
                      </Box>
                      {isNormalExpanded && (
                        <List disablePadding>
                          {normalRooms.map((room) => {
                            const isSelected = selectedRoomIndices.includes(room.chatRoomIdx);
                            const lastMessageTime = room.lastMessageAt
                              ? new Date(room.lastMessageAt).toLocaleTimeString('ko-KR', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : '';
                            
                            // 상대방 참가자 찾기
                            const otherParticipants = getOtherParticipants(room.participants);
                            const otherParticipant = otherParticipants[0];
                            const profileImageUrl = otherParticipant
                              ? getFullFileUrl(
                                  otherParticipant.profileImage ||
                                    (otherParticipant as any)?.avatar ||
                                    (otherParticipant as any)?.memberThumbnail
                                )
                              : null;
                            const displayName = otherParticipant?.name || room.name || '';
                            const firstChar = displayName?.[0] || '?';

                            return (
                              <ListItem
                                key={room.chatRoomIdx}
                                disablePadding
                                onClick={(e) => {
                                  // 체크박스 영역 클릭이 아닐 때만 토글
                                  const target = e.target as HTMLElement;
                                  if (
                                    target.closest('input[type="checkbox"]') ||
                                    target.closest('.MuiCheckbox-root')
                                  ) {
                                    return;
                                  }
                                  handleToggleRoom(room.chatRoomIdx);
                                }}
                                sx={{
                                  cursor: 'pointer',
                                  bgcolor: isSelected ? 'action.selected' : 'transparent',
                                  '&:hover': {
                                    bgcolor: isSelected ? 'action.selected' : 'action.hover',
                                  },
                                }}
                              >
                                <Box
                                  sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1.5,
                                    px: 2.5,
                                    py: 0,
                                    width: '100%',
                                    minHeight: 72,
                                  }}
                                >
                                  <Box
                                    onClick={(e) => {
                                      e.stopPropagation();
                                    }}
                                    sx={{ display: 'flex', alignItems: 'center', minHeight: 56 }}
                                  >
                                    <Checkbox
                                      checked={isSelected}
                                      onChange={(e) => {
                                        e.stopPropagation();
                                        handleToggleRoom(room.chatRoomIdx);
                                      }}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                      }}
                                      size="small"
                                      sx={{ p: 1 }}
                                    />
                                  </Box>
                                  <ListItemAvatar sx={{ minWidth: 40, py: 2 }}>
                                    <Avatar
                                      sx={{ width: 40, height: 40, bgcolor: 'grey.500' }}
                                      src={profileImageUrl || undefined}
                                      alt={displayName}
                                    >
                                      {!profileImageUrl && (
                                        firstChar ? (
                                          firstChar
                                        ) : (
                                          <Iconify icon="solar:user-rounded-bold" width={24} />
                                        )
                                      )}
                                    </Avatar>
                                  </ListItemAvatar>
                                  <ListItemText
                                    primary={
                                      <Typography
                                        variant="body2"
                                        sx={{
                                          fontSize: 14,
                                          fontWeight: 600,
                                          overflow: 'hidden',
                                          textOverflow: 'ellipsis',
                                          whiteSpace: 'nowrap',
                                        }}
                                      >
                                        {room.name}
                                      </Typography>
                                    }
                                    secondary={
                                      getLastMessageText(room.lastMessage) && (
                                        <Typography
                                          variant="caption"
                                          sx={{
                                            fontSize: 12,
                                            color: 'text.secondary',
                                            display: 'block',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                            mt: 0.5,
                                          }}
                                        >
                                          {getLastMessageText(room.lastMessage)}
                                        </Typography>
                                      )
                                    }
                                    sx={{ flex: 1, minWidth: 0 }}
                                  />
                                  <Stack
                                    direction="column"
                                    alignItems="flex-end"
                                    spacing={1.25}
                                    sx={{ minWidth: 60 }}
                                  >
                                    {lastMessageTime && (
                                      <Typography
                                        variant="caption"
                                        sx={{ fontSize: 12, color: 'text.secondary' }}
                                      >
                                        {lastMessageTime}
                                      </Typography>
                                    )}
                                    {room.unreadCount !== undefined &&
                                      room.unreadCount !== null &&
                                      room.unreadCount > 0 && (
                                        <Box
                                          sx={{
                                            minWidth: 20,
                                            height: 20,
                                            borderRadius: '50%',
                                            bgcolor: 'error.main',
                                            color: 'error.contrastText',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: 11,
                                            fontWeight: 700,
                                            px: 0.75,
                                          }}
                                        >
                                          {room.unreadCount}
                                        </Box>
                                      )}
                                  </Stack>
                                </Box>
                              </ListItem>
                            );
                          })}
                        </List>
                      )}
                    </Box>
                  )}

                  {/* 그룹 채팅 목록 */}
                  {groupRooms.length > 0 && (
                    <Box>
                      {normalRooms.length > 0 && <Divider />}
                      <Box
                        onClick={handleToggleGroupExpanded}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          px: 2.5,
                          py: 1,
                          cursor: 'pointer',
                          '&:hover': {
                            bgcolor: 'action.hover',
                          },
                        }}
                      >
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <Typography
                            variant="caption"
                            sx={{ color: 'text.secondary', fontSize: 12 }}
                          >
                            그룹 채팅 목록
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{ color: 'text.secondary', fontSize: 12, fontWeight: 600 }}
                          >
                            {groupRooms.length}
                          </Typography>
                        </Stack>
                        <Iconify
                          icon={
                            isGroupExpanded
                              ? 'eva:arrow-ios-downward-fill'
                              : 'eva:arrow-ios-forward-fill'
                          }
                          width={18}
                          sx={{
                            color: 'text.secondary',
                            transform: isGroupExpanded ? 'rotate(0deg)' : 'rotate(-90deg)',
                            transition: 'transform 0.2s',
                          }}
                        />
                      </Box>
                      {isGroupExpanded && (
                        <List disablePadding>
                          {groupRooms.map((room) => {
                            const isSelected = selectedRoomIndices.includes(room.chatRoomIdx);
                            const lastMessageTime = room.lastMessageAt
                              ? new Date(room.lastMessageAt).toLocaleTimeString('ko-KR', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : '';
                            const otherParticipants = getOtherParticipants(room.participants);
                            const memberNames =
                              otherParticipants.map((p) => p.name).filter((name) => name) || [];
                            
                            // 각 참가자의 프로필 이미지 URL 가져오기
                            const getParticipantAvatarUrl = (participant: ChatParticipantDto) =>
                              getFullFileUrl(
                                participant.profileImage ||
                                  (participant as any)?.avatar ||
                                  (participant as any)?.memberThumbnail
                              );
                            
                            return (
                              <ListItem
                                key={room.chatRoomIdx}
                                disablePadding
                                onClick={(e) => {
                                  // 체크박스 영역 클릭이 아닐 때만 토글
                                  const target = e.target as HTMLElement;
                                  if (
                                    target.closest('input[type="checkbox"]') ||
                                    target.closest('.MuiCheckbox-root')
                                  ) {
                                    return;
                                  }
                                  handleToggleRoom(room.chatRoomIdx);
                                }}
                                sx={{
                                  cursor: 'pointer',
                                  bgcolor: isSelected ? 'action.selected' : 'transparent',
                                  '&:hover': {
                                    bgcolor: isSelected ? 'action.selected' : 'action.hover',
                                  },
                                }}
                              >
                                <Box
                                  sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1.5,
                                    px: 2.5,
                                    py: 0,
                                    width: '100%',
                                    minHeight: 72,
                                  }}
                                >
                                  <Box
                                    onClick={(e) => {
                                      e.stopPropagation();
                                    }}
                                    sx={{ display: 'flex', alignItems: 'center', minHeight: 56 }}
                                  >
                                    <Checkbox
                                      checked={isSelected}
                                      onChange={(e) => {
                                        e.stopPropagation();
                                        handleToggleRoom(room.chatRoomIdx);
                                      }}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                      }}
                                      size="small"
                                      sx={{ p: 1 }}
                                    />
                                  </Box>
                                  <ListItemAvatar sx={{ minWidth: 40, py: 2 }}>
                                    {memberNames.length > 0 ? (
                                      <Box
                                        sx={{
                                          position: 'relative',
                                          width: 40,
                                          height: 40,
                                        }}
                                      >
                                        {memberNames.length === 1 ? (
                                          (() => {
                                            const participant = otherParticipants[0];
                                            const avatarUrl = participant ? getParticipantAvatarUrl(participant) : null;
                                            const name = participant?.name || memberNames[0] || '';
                                            const firstChar = name?.[0] || '?';
                                            return (
                                              <Avatar
                                                sx={{
                                                  width: 40,
                                                  height: 40,
                                                  bgcolor: 'primary.main',
                                                  fontSize: 16,
                                                }}
                                                src={avatarUrl || undefined}
                                                alt={name}
                                              >
                                                {!avatarUrl && (
                                                  firstChar ? (
                                                    firstChar
                                                  ) : (
                                                    <Iconify icon="solar:user-rounded-bold" width={24} />
                                                  )
                                                )}
                                              </Avatar>
                                            );
                                          })()
                                        ) : memberNames.length === 2 ? (
                                          <>
                                            {(() => {
                                              const participant = otherParticipants[0];
                                              const avatarUrl = participant ? getParticipantAvatarUrl(participant) : null;
                                              const name = participant?.name || memberNames[0] || '';
                                              const firstChar = name?.[0] || '?';
                                              return (
                                                <Avatar
                                                  sx={{
                                                    position: 'absolute',
                                                    left: 0,
                                                    top: 0,
                                                    width: 28,
                                                    height: 28,
                                                    border: '1px solid',
                                                    borderColor: 'background.paper',
                                                    bgcolor: 'primary.main',
                                                    fontSize: 14,
                                                    zIndex: 2,
                                                  }}
                                                  src={avatarUrl || undefined}
                                                  alt={name}
                                                >
                                                  {!avatarUrl && (
                                                    firstChar ? (
                                                      firstChar
                                                    ) : (
                                                      <Iconify icon="solar:user-rounded-bold" width={16} />
                                                    )
                                                  )}
                                                </Avatar>
                                              );
                                            })()}
                                            {(() => {
                                              const participant = otherParticipants[1];
                                              const avatarUrl = participant ? getParticipantAvatarUrl(participant) : null;
                                              const name = participant?.name || memberNames[1] || '';
                                              const firstChar = name?.[0] || '?';
                                              return (
                                                <Avatar
                                                  sx={{
                                                    position: 'absolute',
                                                    right: 0,
                                                    bottom: 0,
                                                    width: 28,
                                                    height: 28,
                                                    border: '1px solid',
                                                    borderColor: 'background.paper',
                                                    bgcolor: 'primary.main',
                                                    fontSize: 14,
                                                    zIndex: 1,
                                                  }}
                                                  src={avatarUrl || undefined}
                                                  alt={name}
                                                >
                                                  {!avatarUrl && (
                                                    firstChar ? (
                                                      firstChar
                                                    ) : (
                                                      <Iconify icon="solar:user-rounded-bold" width={16} />
                                                    )
                                                  )}
                                                </Avatar>
                                              );
                                            })()}
                                          </>
                                        ) : memberNames.length === 3 ? (
                                          <>
                                            {(() => {
                                              const participant = otherParticipants[0];
                                              const avatarUrl = participant ? getParticipantAvatarUrl(participant) : null;
                                              const name = participant?.name || memberNames[0] || '';
                                              const firstChar = name?.[0] || '?';
                                              return (
                                                <Avatar
                                                  sx={{
                                                    position: 'absolute',
                                                    left: 0,
                                                    bottom: '20%',
                                                    top: '20%',
                                                    width: 24,
                                                    height: 24,
                                                    border: '1px solid',
                                                    borderColor: 'background.paper',
                                                    bgcolor: 'primary.main',
                                                    fontSize: 12,
                                                    zIndex: 3,
                                                  }}
                                                  src={avatarUrl || undefined}
                                                  alt={name}
                                                >
                                                  {!avatarUrl && (
                                                    firstChar ? (
                                                      firstChar
                                                    ) : (
                                                      <Iconify icon="solar:user-rounded-bold" width={14} />
                                                    )
                                                  )}
                                                </Avatar>
                                              );
                                            })()}
                                            {(() => {
                                              const participant = otherParticipants[1];
                                              const avatarUrl = participant ? getParticipantAvatarUrl(participant) : null;
                                              const name = participant?.name || memberNames[1] || '';
                                              const firstChar = name?.[0] || '?';
                                              return (
                                                <Avatar
                                                  sx={{
                                                    position: 'absolute',
                                                    left: '50%',
                                                    bottom: '20%',
                                                    top: '20%',
                                                    transform: 'translateX(-50%)',
                                                    width: 24,
                                                    height: 24,
                                                    border: '1px solid',
                                                    borderColor: 'background.paper',
                                                    bgcolor: 'primary.main',
                                                    fontSize: 12,
                                                    zIndex: 2,
                                                  }}
                                                  src={avatarUrl || undefined}
                                                  alt={name}
                                                >
                                                  {!avatarUrl && (
                                                    firstChar ? (
                                                      firstChar
                                                    ) : (
                                                      <Iconify icon="solar:user-rounded-bold" width={14} />
                                                    )
                                                  )}
                                                </Avatar>
                                              );
                                            })()}
                                            {(() => {
                                              const participant = otherParticipants[2];
                                              const avatarUrl = participant ? getParticipantAvatarUrl(participant) : null;
                                              const name = participant?.name || memberNames[2] || '';
                                              const firstChar = name?.[0] || '?';
                                              return (
                                                <Avatar
                                                  sx={{
                                                    position: 'absolute',
                                                    right: 0,
                                                    bottom: '20%',
                                                    top: '20%',
                                                    width: 24,
                                                    height: 24,
                                                    border: '1px solid',
                                                    borderColor: 'background.paper',
                                                    bgcolor: 'primary.main',
                                                    fontSize: 12,
                                                    zIndex: 1,
                                                  }}
                                                  src={avatarUrl || undefined}
                                                  alt={name}
                                                >
                                                  {!avatarUrl && (
                                                    firstChar ? (
                                                      firstChar
                                                    ) : (
                                                      <Iconify icon="solar:user-rounded-bold" width={14} />
                                                    )
                                                  )}
                                                </Avatar>
                                              );
                                            })()}
                                          </>
                                        ) : (
                                          <>
                                            {(() => {
                                              const participant = otherParticipants[0];
                                              const avatarUrl = participant ? getParticipantAvatarUrl(participant) : null;
                                              const name = participant?.name || memberNames[0] || '';
                                              const firstChar = name?.[0] || 'G';
                                              return (
                                                <Avatar
                                                  sx={{
                                                    position: 'absolute',
                                                    left: 0,
                                                    top: 0,
                                                    width: 20,
                                                    height: 20,
                                                    border: '1px solid',
                                                    borderColor: 'background.paper',
                                                    bgcolor: 'primary.main',
                                                    fontSize: 10,
                                                    zIndex: 4,
                                                  }}
                                                  src={avatarUrl || undefined}
                                                  alt={name}
                                                >
                                                  {!avatarUrl && (
                                                    firstChar ? (
                                                      firstChar
                                                    ) : (
                                                      <Iconify icon="solar:user-rounded-bold" width={12} />
                                                    )
                                                  )}
                                                </Avatar>
                                              );
                                            })()}
                                            {(() => {
                                              const participant = otherParticipants[1];
                                              const avatarUrl = participant ? getParticipantAvatarUrl(participant) : null;
                                              const name = participant?.name || memberNames[1] || '';
                                              const firstChar = name?.[0] || 'G';
                                              return (
                                                <Avatar
                                                  sx={{
                                                    position: 'absolute',
                                                    right: 0,
                                                    top: 0,
                                                    width: 20,
                                                    height: 20,
                                                    border: '1px solid',
                                                    borderColor: 'background.paper',
                                                    bgcolor: 'primary.main',
                                                    fontSize: 10,
                                                    zIndex: 3,
                                                  }}
                                                  src={avatarUrl || undefined}
                                                  alt={name}
                                                >
                                                  {!avatarUrl && (
                                                    firstChar ? (
                                                      firstChar
                                                    ) : (
                                                      <Iconify icon="solar:user-rounded-bold" width={12} />
                                                    )
                                                  )}
                                                </Avatar>
                                              );
                                            })()}
                                            {(() => {
                                              const participant = otherParticipants[2];
                                              const avatarUrl = participant ? getParticipantAvatarUrl(participant) : null;
                                              const name = participant?.name || memberNames[2] || '';
                                              const firstChar = name?.[0] || 'G';
                                              return (
                                                <Avatar
                                                  sx={{
                                                    position: 'absolute',
                                                    left: 0,
                                                    bottom: 0,
                                                    width: 20,
                                                    height: 20,
                                                    border: '1px solid',
                                                    borderColor: 'background.paper',
                                                    bgcolor: 'primary.main',
                                                    fontSize: 10,
                                                    zIndex: 2,
                                                  }}
                                                  src={avatarUrl || undefined}
                                                  alt={name}
                                                >
                                                  {!avatarUrl && (
                                                    firstChar ? (
                                                      firstChar
                                                    ) : (
                                                      <Iconify icon="solar:user-rounded-bold" width={12} />
                                                    )
                                                  )}
                                                </Avatar>
                                              );
                                            })()}
                                            {(() => {
                                              const participant = otherParticipants[3];
                                              const avatarUrl = participant ? getParticipantAvatarUrl(participant) : null;
                                              const name = participant?.name || memberNames[3] || '';
                                              const firstChar = name?.[0] || 'G';
                                              return (
                                                <Avatar
                                                  sx={{
                                                    position: 'absolute',
                                                    right: 0,
                                                    bottom: 0,
                                                    width: 20,
                                                    height: 20,
                                                    border: '1px solid',
                                                    borderColor: 'background.paper',
                                                    bgcolor: 'primary.main',
                                                    fontSize: 10,
                                                    zIndex: 1,
                                                  }}
                                                  src={avatarUrl || undefined}
                                                  alt={name}
                                                >
                                                  {!avatarUrl && (
                                                    firstChar ? (
                                                      firstChar
                                                    ) : (
                                                      <Iconify icon="solar:user-rounded-bold" width={12} />
                                                    )
                                                  )}
                                                </Avatar>
                                              );
                                            })()}
                                          </>
                                        )}
                                      </Box>
                                    ) : (
                                      <Avatar
                                        sx={{ width: 40, height: 40, bgcolor: 'primary.main' }}
                                      >
                                        <Iconify icon="solar:user-rounded-bold" width={24} />
                                      </Avatar>
                                    )}
                                  </ListItemAvatar>
                                  <ListItemText
                                    primary={
                                      <Typography
                                        variant="body2"
                                        sx={{
                                          fontSize: 14,
                                          fontWeight: 600,
                                          overflow: 'hidden',
                                          textOverflow: 'ellipsis',
                                          whiteSpace: 'nowrap',
                                        }}
                                      >
                                        {memberNames.length > 0
                                          ? `${memberNames.slice(0, 3).join(', ')}${memberNames.length > 3 ? ` 외 ${memberNames.length - 3}명` : ''}`
                                          : room.name}
                                      </Typography>
                                    }
                                    secondary={
                                      getLastMessageText(room.lastMessage) && (
                                        <Typography
                                          variant="caption"
                                          sx={{
                                            fontSize: 12,
                                            color: 'text.secondary',
                                            display: 'block',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                            mt: 0.5,
                                          }}
                                        >
                                          {getLastMessageText(room.lastMessage)}
                                        </Typography>
                                      )
                                    }
                                    sx={{ flex: 1, minWidth: 0 }}
                                  />
                                  <Stack
                                    direction="column"
                                    alignItems="flex-end"
                                    spacing={1.25}
                                    sx={{ minWidth: 60 }}
                                  >
                                    {lastMessageTime && (
                                      <Typography
                                        variant="caption"
                                        sx={{ fontSize: 12, color: 'text.secondary' }}
                                      >
                                        {lastMessageTime}
                                      </Typography>
                                    )}
                                    {room.unreadCount !== undefined &&
                                      room.unreadCount !== null &&
                                      room.unreadCount > 0 && (
                                        <Box
                                          sx={{
                                            minWidth: 20,
                                            height: 20,
                                            borderRadius: '50%',
                                            bgcolor: 'error.main',
                                            color: 'error.contrastText',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: 11,
                                            fontWeight: 700,
                                            px: 0.75,
                                          }}
                                        >
                                          {room.unreadCount}
                                        </Box>
                                      )}
                                  </Stack>
                                </Box>
                              </ListItem>
                            );
                          })}
                        </List>
                      )}
                    </Box>
                  )}

                  {normalRooms.length === 0 && groupRooms.length === 0 && (
                    <Box sx={{ p: 3, textAlign: 'center' }}>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        검색 결과가 없습니다
                      </Typography>
                    </Box>
                  )}
                </>
              )}
            </Scrollbar>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 3 }}>
        <Box sx={{ flex: 1 }} />
        <Stack direction="row" spacing={1.5}>
          <DialogBtn variant="outlined" onClick={handleClose} sx={{ minHeight: 36, fontSize: 14 }}>
            닫기
          </DialogBtn>
          <DialogBtn
            variant="contained"
            onClick={handleShare}
            disabled={selectedRoomIndices.length === 0}
            sx={{ minHeight: 36, fontSize: 14 }}
          >
            공유하기
          </DialogBtn>
        </Stack>
      </DialogActions>
    </Dialog>
  );
}
