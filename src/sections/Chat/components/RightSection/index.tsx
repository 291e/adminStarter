import Box from '@mui/material/Box';

import ParticipantList from './ParticipantList';
import AttachmentList from './AttachmentList';
import type { ChatRoom } from 'src/_mock/_chat';

type Participant = {
  name: string;
  role?: string;
};

type Attachment = {
  name: string;
  type: 'image' | 'pdf' | 'txt' | string;
  date: string;
};

type Props = {
  room?: ChatRoom | null;
  participants: Participant[];
  attachments: Attachment[];
  onInvite?: () => void;
  onRemove?: (participantIds: string[]) => void;
};

export default function RightSection({
  room,
  participants,
  attachments,
  onInvite,
  onRemove,
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
      <ParticipantList room={room} participants={participants} onInvite={onInvite} onRemove={onRemove} />
      <AttachmentList attachments={attachments} />
    </Box>
  );
}


