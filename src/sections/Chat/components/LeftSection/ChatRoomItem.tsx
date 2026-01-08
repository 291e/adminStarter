import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';

import { Iconify } from 'src/components/iconify';
import { CONFIG } from 'src/global-config';
import type { ChatRoomDto, ChatParticipantDto } from 'src/services/chat/chat.types';

import { useChatRoomLastMessage } from 'src/sections/Chat/hooks/use-chat-room-last-message';

// ----------------------------------------------------------------------

type Props = {
  room: ChatRoomDto;
  selected: boolean;
  onSelect: (room: ChatRoomDto) => void;
  currentMemberIdx: number | null;
  isGroup?: boolean;
};

export default function ChatRoomItem({
  room,
  selected,
  onSelect,
  currentMemberIdx,
  isGroup,
}: Props) {
  // Firebase RTDB에서 최신 메시지 구독
  const firebaseMsg = useChatRoomLastMessage(room.chatRoomId);

  // 1. 메시지 텍스트 결정
  let messageText = '';

  if (firebaseMsg) {
    messageText = firebaseMsg.message || firebaseMsg.text || '';
  } else {
    // API 데이터 사용
    const rawMsg = room.lastMessage;
    if (typeof rawMsg === 'string') {
      messageText = rawMsg;
    } else if (rawMsg && typeof rawMsg === 'object') {
      messageText = (rawMsg as any).text || '';
    }
  }

  // 2. 시간 결정
  let displayTime = '';
  let rawTime: string | number | undefined = room.lastMessageAt || (room as any).lastMessageTime;

  // Firebase 메시지가 있으면 최우선 사용
  if (firebaseMsg && firebaseMsg.timestamp) {
    rawTime = firebaseMsg.timestamp;
  }
  // API 데이터 중 객체 내부 lastMessageAt 확인
  else if (typeof room.lastMessage === 'object' && room.lastMessage !== null) {
    const msg = room.lastMessage as any;
    if (msg.lastMessageAt) {
      rawTime = msg.lastMessageAt;
    }
  }

  if (rawTime) {
    const timestamp = Number(rawTime);
    let date: Date | null = null;

    if (!Number.isNaN(timestamp) && timestamp > 10000000000) {
      date = new Date(timestamp);
    } else if (typeof rawTime === 'string') {
      date = new Date(rawTime);
      if (Number.isNaN(date.getTime()) || date.getTime() <= 0) {
        date = null;
      }
    }

    if (date) {
      displayTime = date.toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  }

  // 3. 아바타 렌더링 로직 (Helpers)
  const getOtherParticipants = (participants?: ChatParticipantDto[]) => {
    if (!participants || !Array.isArray(participants)) return [];
    if (currentMemberIdx === null) return participants;

    return participants.filter((p) => {
      const participantIdx = Number(p.memberIdx ?? (p as any)?.memberIndex);
      return !Number.isNaN(participantIdx) && participantIdx !== currentMemberIdx;
    });
  };

  const otherParticipants = getOtherParticipants(room.participants);

  const getFullFileUrl = (url: string | null | undefined): string | null => {
    if (!url) return null;
    if (
      url.startsWith('data:image/png;base64,data/admin/') ||
      url.startsWith('data:image/png;base64,/data/admin/')
    ) {
      const cleanUrl = url.replace(/^data:image\/png;base64,/, '');
      const baseUrl = CONFIG.serverUrl.replace(/\/$/, '');
      const path = cleanUrl.startsWith('/') ? cleanUrl : `/${cleanUrl}`;
      return `${baseUrl}${path}`;
    }
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    if (url.startsWith('data:image/') && !url.includes('data/admin/')) return url;

    const baseUrl = CONFIG.serverUrl.replace(/\/$/, '');
    const path = url.startsWith('/') ? url : `/${url}`;
    return `${baseUrl}${path}`;
  };

  const renderSingleAvatar = (participant: ChatParticipantDto, size: number = 40) => {
    const profileImageUrl = getFullFileUrl(
      participant.profileImage || (participant as any).memberThumbnail
    );

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

  const renderGroupAvatar = () => {
    const participantCount = otherParticipants.length;

    if (participantCount <= 1) {
      const p = otherParticipants[0];
      return p ? (
        renderSingleAvatar(p, 40)
      ) : (
        <Avatar sx={{ width: 40, height: 40 }}>
          <Iconify icon="solar:user-rounded-bold" width={24} />
        </Avatar>
      );
    }

    // 2명, 3명, 4명 이상 레이아웃 로직 (LeftSection/index.tsx와 동일하게 유지)
    // 간략화: 2명 이상이면 겹쳐서 표시 or 격자
    // 여기서는 코드가 길어지므로 4명 격자 스타일로 통일하거나 필요한 부분만 구현
    // 기존 디자인 유지:
    return (
      <Box sx={{ position: 'relative', width: 40, height: 40 }}>
        {otherParticipants.slice(0, 4).map((p, index) => {
          // 위치 계산 로직 (간소화)
          const size = participantCount >= 4 ? 20 : participantCount === 3 ? 20 : 25;
          let posProps = {};

          if (participantCount === 2) {
            if (index === 0) posProps = { left: 0, top: '15%' };
            if (index === 1) posProps = { right: 0, top: '15%' };
          } else if (participantCount === 3) {
            if (index === 0) posProps = { left: '50%', top: 3.5, transform: 'translateX(-50%)' };
            if (index === 1) posProps = { left: 0, bottom: 0 };
            if (index === 2) posProps = { right: 0, bottom: 0 };
          } else {
            // 4+
            if (index === 0) posProps = { left: 0, top: 0 };
            if (index === 1) posProps = { right: 0, top: 0 };
            if (index === 2) posProps = { left: 0, bottom: 0 };
            if (index === 3) posProps = { right: 0, bottom: 0 };
          }

          return (
            <Box key={index} sx={{ position: 'absolute', width: size, height: size, ...posProps }}>
              {renderSingleAvatar(p, size)}
            </Box>
          );
        })}
      </Box>
    );
  };

  // 아바타 결정
  const isEmergency = room.type === 'EMERGENCY';

  let avatar;
  if (isEmergency) {
    avatar = (
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
    );
  } else if (isGroup) {
    avatar = renderGroupAvatar();
  } else {
    avatar = otherParticipants[0]
      ? renderSingleAvatar(otherParticipants[0])
      : renderSingleAvatar({ name: '?', memberIdx: 0 } as any);
  }

  const displayName = isGroup ? room.name : otherParticipants[0]?.name || room.name;

  // 안 읽은 메시지 수
  const unreadCount = room.unreadCount;

  return (
    <ListItem disablePadding>
      <ListItemButton
        selected={selected}
        onClick={() => onSelect(room)}
        sx={{
          px: 2.5,
          py: 1.5,
          ...(isEmergency && {
            bgcolor: 'warning.lighter',
            borderTop: '1px solid',
            borderBottom: '1px solid',
            borderColor: 'grey.300',
            '&.Mui-selected': {
              bgcolor: 'warning.lighter',
            },
          }),
        }}
      >
        <ListItemAvatar>{avatar}</ListItemAvatar>
        <ListItemText
          primary={
            isEmergency ? (
              <Typography variant="subtitle2" sx={{ color: 'error.main', fontWeight: 600 }}>
                사고 발생 현황
              </Typography>
            ) : (
              <Typography
                variant={isGroup ? 'subtitle2' : 'body2'}
                sx={{ fontWeight: 600, fontSize: isGroup ? 14 : 14 }}
              >
                {displayName}
              </Typography>
            )
          }
          secondary={isEmergency ? '응급신고' : messageText}
          primaryTypographyProps={{ noWrap: true }}
          secondaryTypographyProps={{
            fontSize: 12,
            color: 'text.secondary',
            noWrap: true,
          }}
        />
        <Stack
          direction="column"
          alignItems="flex-end"
          spacing={0.5}
          sx={{ minWidth: 68, ml: 1.5 }}
        >
          {displayTime ? (
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {displayTime}
            </Typography>
          ) : null}
          {typeof unreadCount === 'number' && unreadCount > 0 && (
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
              {unreadCount}
            </Box>
          )}
        </Stack>
      </ListItemButton>
    </ListItem>
  );
}
