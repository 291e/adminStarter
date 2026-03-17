import { useRef } from 'react';
import type { RefObject } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';

import { Iconify } from 'src/components/iconify';
import type { ChatParticipant2, ChatRoom2 } from '../../chat2.types';
import { getChatAvatarUrl } from 'src/sections/Chat/utils/avatar';

// ----------------------------------------------------------------------

type Props = {
  room: ChatRoom2;
  selected: boolean;
  onSelect: (room: ChatRoom2) => void;
  currentMemberIdx: number | null;
  isGroup?: boolean;
  preferredLang?: string;
  scrollContainerRef?: RefObject<HTMLDivElement | null>;
};

export default function ChatRoomItem({
  room,
  selected,
  onSelect,
  currentMemberIdx,
  isGroup,
  preferredLang,
  scrollContainerRef: _scrollContainerRef,
}: Props) {
  const itemRef = useRef<HTMLLIElement | null>(null);

  const normalizeLang = (lang: string) => {
    const lower = lang.toLowerCase().trim();
    if (lower === 'vn') return 'vi';
    if (lower === 'cn') return 'zh';
    if (lower === 'kr') return 'ko';
    return lower;
  };

  const resolvedPreferredLang = preferredLang
    ? normalizeLang(preferredLang)
    : typeof navigator !== 'undefined' && navigator.language
      ? normalizeLang(navigator.language.split('-')[0])
      : 'ko';

  const pickTranslation = (translations?: Record<string, string>) => {
    if (!translations) return '';
    if (translations[resolvedPreferredLang]) return translations[resolvedPreferredLang];

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

    const aliases = aliasMap[resolvedPreferredLang] || [];
    for (const key of aliases) {
      if (translations[key]) return translations[key];
    }
    return translations.ko || translations.en || '';
  };

  const deletedMessageLabel = () => {
    switch (resolvedPreferredLang) {
      case 'en':
        return 'Message deleted.';
      case 'vi':
        return 'Tin nhan da bi xoa.';
      case 'zh':
        return '消息已删除。';
      case 'th':
        return 'ลบข้อความแล้ว';
      case 'ne':
        return 'सन्देश मेटाइयो।';
      case 'uz':
        return 'Xabar ochirildi.';
      case 'km':
        return 'សារត្រូវបានលុប។';
      default:
        return '삭제된 메시지입니다.';
    }
  };

  const messageType = room.lastMessagePreview ? 'TEXT' : undefined;
  const translatedPreview = pickTranslation(room.lastMessageTranslations);
  let messageText = translatedPreview || room.lastMessagePreview || '';
  const normalizePreview = (text: string, type?: string) => {
    const trimmed = text?.trim() || '';
    if (trimmed === '__deleted__') {
      return deletedMessageLabel();
    }
    if (type === 'IMAGE') {
      if (trimmed.includes('[이미지]|')) {
        const label = trimmed.split('[이미지]|')[0]?.trim();
        return label ? `${label} [이미지]` : '[이미지]';
      }
      return trimmed || '[이미지]';
    }
    if (type === 'VIDEO') {
      if (trimmed.includes('[동영상]|')) {
        return '[동영상]';
      }
      return trimmed || '[동영상]';
    }
    if (type === 'FILE') {
      return trimmed || '공유 문서';
    }
    if (type === 'SYSTEM') {
      return trimmed || '시스템 메시지';
    }
    if (type === 'EMERGENCY') {
      return trimmed || '긴급 메시지';
    }
    if (trimmed.includes('[이미지]|')) {
      const label = trimmed.split('[이미지]|')[0]?.trim();
      return label ? `${label} [이미지]` : '[이미지]';
    }
    if (trimmed.includes('[동영상]|')) {
      return '[동영상]';
    }
    return trimmed;
  };

  messageText = normalizePreview(messageText, messageType);

  // 2. 시간 결정
  let displayTime = '';
  if (room.lastMessageAt) {
    const date = new Date(room.lastMessageAt);
    if (!Number.isNaN(date.getTime())) {
      displayTime = date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
    }
  }

  // 3. 아바타 렌더링 로직 (Helpers)
  const getOtherParticipants = (participants?: ChatParticipant2[]) => {
    if (!participants || !Array.isArray(participants)) return [];
    if (currentMemberIdx === null) return participants;

    return participants.filter((p) => {
      const participantIdx = Number(p.memberIdx ?? (p as any)?.memberIndex);
      return !Number.isNaN(participantIdx) && participantIdx !== currentMemberIdx;
    });
  };

  const otherParticipants = getOtherParticipants(room.participants);

  const renderSingleAvatar = (participant: ChatParticipant2, size: number = 40) => {
    const profileImageUrl = getChatAvatarUrl(
      participant.profileImage || (participant as any).memberThumbnail
    );

    return (
      <Avatar sx={{ width: size, height: size }} src={profileImageUrl} alt={participant.name}>
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

  // room.name comes from userRooms.roomName, which already reflects per-user custom naming.
  const displayName = room.name || (isGroup ? '' : otherParticipants[0]?.name) || '';

  // 안 읽은 메시지 수
  const unreadCount = room.unreadCount;

  return (
      <ListItem disablePadding ref={itemRef}>
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
