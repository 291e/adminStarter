import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

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
import { useChat2RoomsFirestore } from 'src/sections/Chat/hooks/use-chat2-rooms-firestore';
import { getChatAvatarUrl } from 'src/sections/Chat/utils/avatar';
import { getCompanyMembers } from 'src/services/organization/organization.service';
import type { ChatParticipant2, ChatRoom2 } from 'src/sections/Chat/chat2.types';

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  onClose: () => void;
  onShare: (chatRoomIdList: string[], documentId: string) => void;
  documentId: string;
  documentName: string;
};

type DisplayRoom = ChatRoom2 & {
  displayName: string;
  participants: ChatParticipant2[];
};

const normalizeLang = (lang: string) => {
  const lower = lang.toLowerCase().trim();
  if (lower === 'vn') return 'vi';
  if (lower === 'cn') return 'zh';
  if (lower === 'kr') return 'ko';
  return lower;
};

const pickTranslation = (translations: Record<string, string> | undefined, preferredLang: string) => {
  if (!translations) return '';
  if (translations[preferredLang]) return translations[preferredLang];

  const aliasMap: Record<string, string[]> = {
    ko: ['ko', 'kr'],
    en: ['en'],
    vi: ['vi', 'vn'],
    vn: ['vn', 'vi'],
    zh: ['zh', 'cn'],
    ja: ['ja', 'jp'],
    th: ['th'],
    id: ['id'],
    my: ['my'],
    ne: ['ne'],
    ru: ['ru'],
    uz: ['uz'],
  };

  const aliases = aliasMap[preferredLang] || [];
  for (const key of aliases) {
    if (translations[key]) return translations[key];
  }

  return translations.ko || translations.en || '';
};

const normalizePreview = (text: string) => {
  const trimmed = text?.trim() || '';
  if (trimmed.includes('[이미지]|')) {
    const label = trimmed.split('[이미지]|')[0]?.trim();
    return label ? `${label} [이미지]` : '[이미지]';
  }
  if (trimmed.includes('[동영상]|')) return '[동영상]';
  return trimmed;
};

export default function ShareToChatModal({
  open,
  onClose,
  onShare,
  documentId,
  documentName: _documentName,
}: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoomIds, setSelectedRoomIds] = useState<string[]>([]);
  const [isNormalExpanded, setIsNormalExpanded] = useState(true);
  const [isGroupExpanded, setIsGroupExpanded] = useState(true);
  const { user } = useAuthContext();
  const { data: myInfoData } = useMyInfo();

  const currentMemberIdx = useMemo(() => {
    const candidates = [
      (myInfoData as any)?.memberIdx,
      (myInfoData as any)?.memberIndex,
      (myInfoData as any)?.member?.memberIdx,
      (myInfoData as any)?.member?.memberIndex,
      user?.memberIdx,
      user?.memberIndex,
      user?.member?.memberIdx,
      user?.member?.memberIndex,
      user?.companyMember?.memberIdx,
      user?.companyMember?.memberIndex,
    ];

    for (const candidate of candidates) {
      const parsed = Number(candidate);
      if (!Number.isNaN(parsed) && parsed > 0) {
        return parsed;
      }
    }

    return null;
  }, [myInfoData, user]);

  const preferredLang = useMemo(() => {
    const raw =
      (myInfoData as any)?.memberLang ||
      (myInfoData as any)?.language ||
      (myInfoData as any)?.lang ||
      (myInfoData as any)?.locale ||
      (user as any)?.memberLang;

    if (raw) return normalizeLang(String(raw).split('-')[0]);
    if (typeof navigator !== 'undefined' && navigator.language) {
      return normalizeLang(navigator.language.split('-')[0]);
    }

    return 'ko';
  }, [myInfoData, user]);

  const companyIdx = useMemo(() => {
    const candidates = [
      (myInfoData as any)?.companyIdx,
      (myInfoData as any)?.companyIndex,
      (myInfoData as any)?.company?.companyIdx,
      (myInfoData as any)?.company?.companyIndex,
      (user as any)?.companyIdx,
      (user as any)?.companyIndex,
    ];

    for (const candidate of candidates) {
      const parsed = Number(candidate);
      if (!Number.isNaN(parsed) && parsed > 0) {
        return parsed;
      }
    }

    return 0;
  }, [myInfoData, user]);

  const { rooms: chat2Rooms, isLoading: roomsLoading } = useChat2RoomsFirestore(open);

  const { data: membersData, isLoading: membersLoading } = useQuery({
    queryKey: ['shareToChatMembers', companyIdx],
    queryFn: () => getCompanyMembers(companyIdx, { page: 1, pageSize: 1000 }),
    enabled: open && companyIdx > 0,
    staleTime: 5 * 60 * 1000,
  });

  const memberMap = useMemo(() => {
    const rawMembers =
      (membersData as any)?.members ||
      (membersData as any)?.memberList ||
      (membersData as any)?.body?.members ||
      (membersData as any)?.body?.memberList ||
      [];

    const map = new Map<string, any>();
    if (Array.isArray(rawMembers)) {
      rawMembers.forEach((member: any) => {
        const id = String(member?.memberIdx ?? member?.memberIndex ?? member?.id ?? '').trim();
        if (!id) return;
        map.set(id, member);
      });
    }

    return map;
  }, [membersData]);

  useEffect(() => {
    if (!open) return;
    setSearchQuery('');
    setSelectedRoomIds([]);
    setIsNormalExpanded(true);
    setIsGroupExpanded(true);
  }, [open]);

  const getOtherParticipants = useCallback(
    (participants: ChatParticipant2[]) => {
      if (!participants || !Array.isArray(participants)) return [];
      if (currentMemberIdx === null) return participants;

      return participants.filter((participant) => {
        const participantIdx = Number(participant.memberIdx ?? (participant as any)?.memberIndex);
        return !Number.isNaN(participantIdx) && participantIdx !== currentMemberIdx;
      });
    },
    [currentMemberIdx]
  );

  const enrichParticipants = useCallback(
    (participantIds: string[]) =>
      participantIds
        .map((participantId) => {
          const member = memberMap.get(String(participantId));
          const parsedIdx = Number(participantId);
          if (Number.isNaN(parsedIdx) || parsedIdx <= 0) return null;

          return {
            memberIdx: parsedIdx,
            name: member?.memberName || member?.name || member?.memberId || `사용자 ${participantId}`,
            profileImage: member?.memberThumbnail || member?.profileImage || member?.avatar || '',
          } as ChatParticipant2;
        })
        .filter((participant): participant is ChatParticipant2 => participant !== null),
    [memberMap]
  );

  const rooms = useMemo<DisplayRoom[]>(() => {
    const searchValue = searchQuery.trim().toLowerCase();

    const filteredByType = (chat2Rooms || []).filter((room) => {
      if (room.type === 'CHATBOT') return false;
      return room.type === 'DIRECT' || room.type === 'GROUP' || room.type === 'EMERGENCY';
    });

    const transformed = filteredByType
      .map((room) => {
        const participants = enrichParticipants(room.participantIds || []);
        const otherParticipants = getOtherParticipants(participants);

        const displayName =
          (room.type === 'EMERGENCY' ? '사고 발생 현황' : '') ||
          room.name?.trim() ||
          (room.type === 'GROUP'
            ? otherParticipants
                .map((participant) => participant.name)
                .filter(Boolean)
                .slice(0, 3)
                .join(', ')
            : otherParticipants[0]?.name || '알 수 없는 사용자');

        return {
          ...room,
          participants,
          displayName,
        };
      })
      .sort((a, b) => {
        if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
        const aTime = a.lastMessageAt ?? 0;
        const bTime = b.lastMessageAt ?? 0;
        return bTime - aTime;
      });

    if (!searchValue) return transformed;

    return transformed.filter((room) => {
      const names = room.participants
        .map((participant) => participant.name)
        .join(' ')
        .toLowerCase();
      const roomName = room.displayName.toLowerCase();
      const translatedPreview = pickTranslation(room.lastMessageTranslations, preferredLang);
      const message = normalizePreview(
        (translatedPreview || room.lastMessagePreview || '').toLowerCase()
      );
      return (
        roomName.includes(searchValue) ||
        names.includes(searchValue) ||
        message.includes(searchValue)
      );
    });
  }, [chat2Rooms, enrichParticipants, getOtherParticipants, preferredLang, searchQuery]);

  const normalRooms = useMemo(
    () => rooms.filter((room) => room.type === 'DIRECT'),
    [rooms]
  );

  const groupRooms = useMemo(() => rooms.filter((room) => room.type === 'GROUP'), [rooms]);
  const emergencyRoom = useMemo(
    () => rooms.find((room) => room.type === 'EMERGENCY'),
    [rooms]
  );

  const getDisplayTime = (millis?: number) => {
    if (!millis) return '';
    const date = new Date(millis);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
  };

  const getLastMessageText = (room: DisplayRoom) => {
    const translatedPreview = pickTranslation(room.lastMessageTranslations, preferredLang);
    return normalizePreview(translatedPreview || room.lastMessagePreview || '');
  };

  const toggleRoomSelection = (roomId: string) => {
    setSelectedRoomIds((prev) =>
      prev.includes(roomId) ? prev.filter((id) => id !== roomId) : [...prev, roomId]
    );
  };

  const handleShare = () => {
    if (selectedRoomIds.length === 0) return;
    onShare(selectedRoomIds, documentId);
    handleClose();
  };

  const handleClose = () => {
    setSearchQuery('');
    setSelectedRoomIds([]);
    onClose();
  };

  const renderSingleAvatar = (participant: ChatParticipant2, size: number = 40) => {
    const profileImageUrl = getChatAvatarUrl(
      participant.profileImage || (participant as any)?.memberThumbnail || (participant as any)?.avatar
    );

    return (
      <Avatar sx={{ width: size, height: size }} src={profileImageUrl} alt={participant.name}>
        <Iconify icon="solar:user-rounded-bold" width={size * 0.6} />
      </Avatar>
    );
  };

  const renderGroupAvatar = (participants: ChatParticipant2[]) => {
    const others = getOtherParticipants(participants);
    const participantCount = others.length;

    if (participantCount <= 1) {
      const participant = others[0];
      if (!participant) {
        return (
          <Avatar sx={{ width: 40, height: 40 }}>
            <Iconify icon="solar:user-rounded-bold" width={24} />
          </Avatar>
        );
      }
      return renderSingleAvatar(participant, 40);
    }

    if (participantCount === 2) {
      return (
        <Box sx={{ position: 'relative', width: 40, height: 40 }}>
          <Box sx={{ position: 'absolute', left: 0, top: '15%', width: 25, height: 25 }}>
            {renderSingleAvatar(others[0], 25)}
          </Box>
          <Box sx={{ position: 'absolute', right: 0, top: '15%', width: 25, height: 25 }}>
            {renderSingleAvatar(others[1], 25)}
          </Box>
        </Box>
      );
    }

    if (participantCount === 3) {
      return (
        <Box sx={{ position: 'relative', width: 40, height: 40 }}>
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
            {renderSingleAvatar(others[0], 20)}
          </Box>
          <Box sx={{ position: 'absolute', left: 0, bottom: 0, width: 20, height: 20 }}>
            {renderSingleAvatar(others[1], 20)}
          </Box>
          <Box sx={{ position: 'absolute', right: 0, bottom: 0, width: 20, height: 20 }}>
            {renderSingleAvatar(others[2], 20)}
          </Box>
        </Box>
      );
    }

    return (
      <Box sx={{ position: 'relative', width: 40, height: 40 }}>
        <Box sx={{ position: 'absolute', left: 0, top: 0, width: 20, height: 20 }}>
          {renderSingleAvatar(others[0], 20)}
        </Box>
        <Box sx={{ position: 'absolute', right: 0, top: 0, width: 20, height: 20 }}>
          {renderSingleAvatar(others[1], 20)}
        </Box>
        <Box sx={{ position: 'absolute', left: 0, bottom: 0, width: 20, height: 20 }}>
          {renderSingleAvatar(others[2], 20)}
        </Box>
        <Box sx={{ position: 'absolute', right: 0, bottom: 0, width: 20, height: 20 }}>
          {renderSingleAvatar(others[3], 20)}
        </Box>
      </Box>
    );
  };

  const renderRoomItem = (room: DisplayRoom) => {
    const isSelected = selectedRoomIds.includes(room.roomId);
    const displayTime = getDisplayTime(room.lastMessageAt);
    const message = getLastMessageText(room);
    const otherParticipants = getOtherParticipants(room.participants);

    const directParticipant = otherParticipants[0];
    const directName = directParticipant?.name || room.displayName;

    const avatar =
      room.type === 'EMERGENCY' ? (
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
      ) : room.type === 'GROUP' ? (
        renderGroupAvatar(room.participants)
      ) : directParticipant ? (
        renderSingleAvatar(directParticipant)
      ) : (
        <Avatar sx={{ width: 40, height: 40 }}>
          <Iconify icon="solar:user-rounded-bold" width={24} />
        </Avatar>
      );

    return (
      <ListItem
        key={room.roomId}
        disablePadding
        onClick={() => toggleRoomSelection(room.roomId)}
        sx={{
          cursor: 'pointer',
          bgcolor:
            room.type === 'EMERGENCY'
              ? 'warning.lighter'
              : isSelected
                ? 'action.selected'
                : 'transparent',
          borderTop: room.type === 'EMERGENCY' ? '1px solid' : undefined,
          borderBottom: room.type === 'EMERGENCY' ? '1px solid' : undefined,
          borderColor: room.type === 'EMERGENCY' ? 'grey.300' : undefined,
          '&:hover': {
            bgcolor:
              room.type === 'EMERGENCY'
                ? 'warning.lighter'
                : isSelected
                  ? 'action.selected'
                  : 'action.hover',
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
            onClick={(event) => {
              event.stopPropagation();
            }}
            sx={{ display: 'flex', alignItems: 'center', minHeight: 56 }}
          >
            <Checkbox
              checked={isSelected}
              onChange={(event) => {
                event.stopPropagation();
                toggleRoomSelection(room.roomId);
              }}
              onClick={(event) => {
                event.stopPropagation();
              }}
              size="small"
              sx={{ p: 1 }}
            />
          </Box>

          <ListItemAvatar sx={{ minWidth: 40, py: 2 }}>{avatar}</ListItemAvatar>

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
                {room.type === 'EMERGENCY'
                  ? '사고 발생 현황'
                  : room.type === 'GROUP'
                    ? room.displayName
                    : directName}
              </Typography>
            }
            secondary={
              message ? (
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
                  {room.type === 'EMERGENCY' ? '응급신고' : message}
                </Typography>
              ) : null
            }
            sx={{ flex: 1, minWidth: 0 }}
          />

          <Stack direction="column" alignItems="flex-end" spacing={1.25} sx={{ minWidth: 60 }}>
            {displayTime && (
              <Typography variant="caption" sx={{ fontSize: 12, color: 'text.secondary' }}>
                {displayTime}
              </Typography>
            )}
            {typeof room.unreadCount === 'number' && room.unreadCount > 0 && (
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
  };

  const showLoading = roomsLoading || membersLoading;

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
          <TextField
            fullWidth
            placeholder="공유하고 싶은 사람 이름, 채팅방 이름을 검색해 주세요."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
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

          <Box sx={{ maxHeight: 500 }}>
            <Scrollbar>
              {showLoading ? (
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
                  {emergencyRoom && (
                    <List disablePadding>{renderRoomItem(emergencyRoom)}</List>
                  )}

                  {normalRooms.length > 0 && (
                    <Box>
                      <Box
                        onClick={() => setIsNormalExpanded((prev) => !prev)}
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
                          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: 12 }}>
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
                      {isNormalExpanded && <List disablePadding>{normalRooms.map(renderRoomItem)}</List>}
                    </Box>
                  )}

                  {groupRooms.length > 0 && (
                    <Box>
                      {(normalRooms.length > 0 || emergencyRoom) && <Divider />}
                      <Box
                        onClick={() => setIsGroupExpanded((prev) => !prev)}
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
                          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: 12 }}>
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
                      {isGroupExpanded && <List disablePadding>{groupRooms.map(renderRoomItem)}</List>}
                    </Box>
                  )}

                  {!emergencyRoom && normalRooms.length === 0 && groupRooms.length === 0 && (
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
            disabled={selectedRoomIds.length === 0}
            sx={{ minHeight: 36, fontSize: 14 }}
          >
            공유하기
          </DialogBtn>
        </Stack>
      </DialogActions>
    </Dialog>
  );
}
