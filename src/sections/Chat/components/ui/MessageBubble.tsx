import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';

type Props = {
  sender: string;
  message: string;
  timestamp: string;
  isOwn: boolean;
  avatarUrl?: string;
  messageType?: 'TEXT' | 'IMAGE' | 'FILE' | 'SYSTEM';
  sharedDocumentIdx?: number;
  onFileClick?: (sharedDocumentIdx: number) => void;
};

export default function MessageBubble({
  sender,
  message,
  timestamp,
  isOwn,
  avatarUrl,
  messageType,
  sharedDocumentIdx,
  onFileClick,
}: Props) {
  const handleFileClick = () => {
    if (messageType === 'FILE' && sharedDocumentIdx && onFileClick) {
      onFileClick(sharedDocumentIdx);
    }
  };

  const isFileMessage = messageType === 'FILE' && sharedDocumentIdx;
  if (isOwn) {
    // 내 메시지
    return (
      <Stack
        direction="row"
        spacing={0.5}
        justifyContent="flex-end"
        alignItems="flex-end"
      >
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          {timestamp}
        </Typography>
        <Box
          sx={{
            maxWidth: '70%',
            px: 1,
            py: 1,
            borderRadius: '12px 0px 12px 12px',
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            ...(isFileMessage && {
              cursor: 'pointer',
              '&:hover': {
                bgcolor: 'primary.dark',
              },
            }),
          }}
          onClick={isFileMessage ? handleFileClick : undefined}
        >
          <Typography variant="body2" sx={{ fontSize: 14, lineHeight: '22px' }}>
            {message}
          </Typography>
        </Box>
      </Stack>
    );
  }

  // 상대방 메시지
  return (
    <Stack direction="row" spacing={0.5} sx={{ alignItems: 'flex-start' }}>
      <Avatar src={avatarUrl} sx={{ width: 40, height: 40 }}>
        {sender?.[0] ?? '?'}
      </Avatar>
      <Stack spacing={0.5} sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="caption" sx={{ fontSize: 12, fontWeight: 400 }}>
          {sender}
        </Typography>
        <Stack direction="row" spacing={0.5} alignItems="flex-end">
          <Box
            sx={{
              maxWidth: 240,
              px: 1,
              py: 1,
              borderRadius: '0px 12px 12px 12px',
              bgcolor: 'grey.200',
              color: 'text.primary',
              ...(isFileMessage && {
                cursor: 'pointer',
                '&:hover': {
                  bgcolor: 'grey.300',
                },
              }),
            }}
            onClick={isFileMessage ? handleFileClick : undefined}
          >
            <Typography variant="body2" sx={{ fontSize: 14, lineHeight: '22px' }}>
              {message}
            </Typography>
          </Box>
          <Typography
            variant="caption"
            sx={{
              fontSize: 12,
              color: 'text.secondary',
              lineHeight: 1.35,
            }}
          >
            {timestamp}
          </Typography>
        </Stack>
      </Stack>
    </Stack>
  );
}

