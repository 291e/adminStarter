import { useState, useEffect, useMemo } from 'react';
import { useGetChatRooms } from 'src/sections/Chat/hooks/use-chat-api';
import type { ChatRoomDto } from 'src/services/chat/chat.types';

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
    let filtered = rooms;

    if (searchQuery.trim()) {
      filtered = rooms.filter((room) =>
        room.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    const normal = filtered.filter(
      (room) => !room.isGroup && room.type !== 'CHATBOT' && room.type !== 'EMERGENCY'
    );
    const group = filtered.filter((room) => room.isGroup);

    return { normalRooms: normal, groupRooms: group };
  }, [rooms, searchQuery]);

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
                                    <Avatar sx={{ width: 40, height: 40, bgcolor: 'grey.500' }}>
                                      {room.name[0]}
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
                            const memberNames =
                              room.participants?.map((p) => p.name).filter((name) => name) || [];
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
                                          <Avatar
                                            sx={{
                                              width: 40,
                                              height: 40,
                                              bgcolor: 'primary.main',
                                              fontSize: 16,
                                            }}
                                          >
                                            {memberNames[0][0]}
                                          </Avatar>
                                        ) : memberNames.length === 2 ? (
                                          <>
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
                                            >
                                              {memberNames[0][0]}
                                            </Avatar>
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
                                            >
                                              {memberNames[1][0]}
                                            </Avatar>
                                          </>
                                        ) : memberNames.length === 3 ? (
                                          <>
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
                                            >
                                              {memberNames[0][0]}
                                            </Avatar>
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
                                            >
                                              {memberNames[1][0]}
                                            </Avatar>
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
                                            >
                                              {memberNames[2][0]}
                                            </Avatar>
                                          </>
                                        ) : (
                                          <>
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
                                            >
                                              {memberNames[0]?.[0] || 'G'}
                                            </Avatar>
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
                                            >
                                              {memberNames[1]?.[0] || 'G'}
                                            </Avatar>
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
                                            >
                                              {memberNames[2]?.[0] || 'G'}
                                            </Avatar>
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
                                            >
                                              {memberNames[3]?.[0] || 'G'}
                                            </Avatar>
                                          </>
                                        )}
                                      </Box>
                                    ) : (
                                      <Avatar
                                        sx={{ width: 40, height: 40, bgcolor: 'primary.main' }}
                                      >
                                        G
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
