import Box from '@mui/material/Box';

import ParticipantList from './ParticipantList';
import AttachmentList from './AttachmentList';
import type { ChatAttachment2, ChatParticipant2, ChatRoom2 } from '../../chat2.types';

type Props = {
  room?: ChatRoom2 | null;
  participants: ChatParticipant2[];
  attachments: ChatAttachment2[];
  onInvite?: () => void;
  onRemove?: (participantIds: string[]) => void;
  onFileClick?: (attachment: ChatAttachment2) => void;
};

export default function RightSection({
  room,
  participants,
  attachments,
  onInvite,
  onRemove,
  onFileClick,
}: Props) {
  return (
    <Box
      sx={{
        width: { xs: '100%', lg: 264 },
        flex: { xs: 'none', lg: '0 0 264px' },
        height: { xs: 300, lg: 'auto' },
        maxHeight: { xs: 300, lg: 'none' },
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.paper',
        flexShrink: 0,
        overflow: 'hidden',
      }}
    >
      <ParticipantList
        room={room}
        participants={participants}
        onInvite={onInvite}
        onRemove={onRemove}
      />
      <AttachmentList attachments={attachments} onFileClick={onFileClick} />
    </Box>
  );
}
