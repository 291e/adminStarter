import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import IconButton from '@mui/material/IconButton';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

type Attachment = {
  name: string;
  type: 'image' | 'pdf' | 'txt' | string;
  date: string;
};

type Props = {
  attachments: Attachment[];
};

export default function AttachmentList({ attachments }: Props) {
  const getFileIcon = (type: string) => {
    if (type === 'image') return 'solar:gallery-bold' as any;
    if (type === 'pdf') return 'solar:file-text-bold' as any;
    return 'solar:document-text-bold' as any;
  };

  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ p: 2, minHeight: 40 }}
      >
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          첨부 파일 ({attachments.length})
        </Typography>
        <IconButton size="small">
          <Iconify icon={'eva:arrow-ios-downward-fill' as any} width={16} />
        </IconButton>
      </Stack>
      <Scrollbar sx={{ flex: 1 }}>
        <List disablePadding sx={{ p: 2 }}>
          {attachments.map((file, idx) => (
            <ListItem key={idx} disablePadding sx={{ mb: 1.5 }}>
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ width: '100%' }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 1,
                    bgcolor: 'grey.200',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Iconify icon={getFileIcon(file.type)} width={24} />
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 500,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {file.name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {file.date}
                  </Typography>
                </Box>
              </Stack>
            </ListItem>
          ))}
        </List>
      </Scrollbar>
    </Box>
  );
}

