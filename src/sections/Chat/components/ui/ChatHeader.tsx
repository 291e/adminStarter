import { useState } from 'react';
import { usePopover } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import ListItemText from '@mui/material/ListItemText';

import { Iconify } from 'src/components/iconify';
import { CustomPopover } from 'src/components/custom-popover';
import RenameChatRoomModal from './RenameChatRoomModal';
import LeaveChatRoomModal from './LeaveChatRoomModal';

type ChatRoom = {
  id: string;
  name: string;
  type?: 'chatbot' | 'emergency' | 'normal' | 'group';
  isGroup?: boolean;
  organizationName?: string;
  members?: string[];
};

type Participant = {
  name: string;
  role?: string;
  avatar?: string;
};

type Props = {
  room: ChatRoom;
  participants?: Participant[];
  onRoomNameChange?: (newName: string) => void;
  onLeaveRoom?: () => void;
};

export default function ChatHeader({
  room,
  participants = [],
  onRoomNameChange,
  onLeaveRoom,
}: Props) {
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);
  const { open, anchorEl, onClose, onOpen } = usePopover();

  const handleOpenRenameModal = () => {
    setRenameModalOpen(true);
  };

  const handleCloseRenameModal = () => {
    setRenameModalOpen(false);
  };

  const handleConfirmRename = (newName: string) => {
    // TODO: TanStack Query Hook(useMutation)으로 채팅방 이름 변경 API 호출
    // 변경 성공 후 onRoomNameChange 콜백 호출하여 채팅방 목록 갱신
    if (onRoomNameChange) {
      onRoomNameChange(newName);
    }
    handleCloseRenameModal();
  };

  const handleOpenLeaveModal = () => {
    setLeaveModalOpen(true);
    onClose(); // 메뉴 닫기
  };

  const handleCloseLeaveModal = () => {
    setLeaveModalOpen(false);
  };

  const handleConfirmLeave = () => {
    if (onLeaveRoom) {
      onLeaveRoom();
    }
    handleCloseLeaveModal();
  };

  const isGroupChat = room.isGroup || room.type === 'group';
  const isChatbot = room.type === 'chatbot';

  // Avatar 표시 로직
  const renderAvatar = () => {
    if (room.type === 'emergency') {
      return (
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
    }

    // 1명일 때: 단일 Avatar
    if (participants.length <= 1) {
      const participant = participants[0];
      return (
        <Avatar sx={{ width: 40, height: 40 }}>
          {participant?.avatar ? (
            <img src={participant.avatar} alt={participant.name} />
          ) : (
            participant?.name?.[0] || room.name[0]
          )}
        </Avatar>
      );
    }

    // 2명 이상일 때: AvatarGroup (Figma 디자인에 맞춰 겹쳐서 표시)
    const maxDisplay = 3; // 최대 3개까지 표시
    const displayParticipants = participants.slice(0, maxDisplay);
    const remainingCount = participants.length - maxDisplay;

    // Avatar들이 겹치면서 표시되므로 필요한 너비 계산
    // 첫 번째 Avatar는 32px, 나머지는 각각 20px씩 추가 (32 - 12px 겹침)
    const totalWidth = 32 + (displayParticipants.length - 1) * 20 + (remainingCount > 0 ? 20 : 0);

    return (
      <Box
        sx={{
          position: 'relative',
          width: Math.max(40, totalWidth),
          height: 40,
          display: 'flex',
          alignItems: 'center',
          overflow: 'visible',
        }}
      >
        <Stack
          direction="row"
          spacing={0}
          sx={{
            position: 'relative',
            alignItems: 'center',
            justifyContent: 'flex-end',
            height: '100%',
            overflow: 'visible',
          }}
        >
          {displayParticipants.map((participant, index) => (
            <Avatar
              key={participant.name || index}
              sx={{
                width: 32,
                height: 32,
                border: '2px solid',
                borderColor: 'background.paper',
                position: 'relative',
                zIndex: displayParticipants.length - index,
                marginRight: index < displayParticipants.length - 1 ? '-12px' : 0,
                flexShrink: 0,
              }}
            >
              {participant.avatar ? (
                <img src={participant.avatar} alt={participant.name} />
              ) : (
                participant.name?.[0] || ''
              )}
            </Avatar>
          ))}
          {remainingCount > 0 && (
            <Avatar
              sx={{
                width: 32,
                height: 32,
                border: '2px solid',
                borderColor: 'background.paper',
                bgcolor: 'primary.lighter',
                color: 'primary.dark',
                fontSize: 12,
                fontWeight: 500,
                lineHeight: '18px',
                position: 'relative',
                zIndex: 0,
                marginLeft: '-12px',
                flexShrink: 0,
              }}
            >
              +{remainingCount}
            </Avatar>
          )}
        </Stack>
      </Box>
    );
  };

  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      sx={{
        p: { xs: 2, lg: 2.5 },
        borderBottom: '1px solid',
        borderColor: 'divider',
        maxHeight: { xs: 64, lg: 72 },
        width: '100%',
        flexShrink: 0,
      }}
    >
      <Stack direction="row" spacing={2} alignItems="center">
        {renderAvatar()}
        <Box>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {room.name}
            </Typography>
            {isGroupChat && (
              <IconButton
                size="small"
                onClick={handleOpenRenameModal}
                sx={{
                  width: 16,
                  height: 16,
                  p: 0,
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                }}
              >
                <Iconify icon="solar:pen-bold" width={16} sx={{ color: 'text.primary' }} />
              </IconButton>
            )}
          </Stack>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {room.type === 'emergency' ? room.organizationName || '이편한자동화기술 물류팀' : ''}
          </Typography>
        </Box>
      </Stack>
      {room.type !== 'emergency' && !isChatbot && (
        <>
          <IconButton size="small" onClick={onOpen}>
            <Iconify icon="eva:more-vertical-fill" width={20} />
          </IconButton>
          <CustomPopover
            open={open}
            anchorEl={anchorEl}
            onClose={onClose}
            slotProps={{ paper: { sx: { p: 0 } } }}
          >
            <MenuList>
              <MenuItem onClick={handleOpenLeaveModal}>
                <ListItemText primary="나가기" />
              </MenuItem>
            </MenuList>
          </CustomPopover>
        </>
      )}

      {/* 채팅방 이름 변경 모달 */}
      {isGroupChat && (
        <RenameChatRoomModal
          open={renameModalOpen}
          onClose={handleCloseRenameModal}
          onConfirm={handleConfirmRename}
          room={room}
          currentName={room.name}
        />
      )}

      {/* 채팅방 나가기 모달 */}
      <LeaveChatRoomModal
        open={leaveModalOpen}
        onClose={handleCloseLeaveModal}
        onConfirm={handleConfirmLeave}
        room={room}
      />
    </Stack>
  );
}
