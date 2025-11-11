import { useState } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import IconButton from '@mui/material/IconButton';
import Checkbox from '@mui/material/Checkbox';
import Button from '@mui/material/Button';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

type Participant = {
  id?: string;
  name: string;
  role?: string;
};

type Props = {
  participants: Participant[];
  onInvite?: () => void;
  onRemove?: (participantIds: string[]) => void;
};

export default function ParticipantList({ participants, onInvite, onRemove }: Props) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const handleToggleSelect = (participantId: string) => {
    setSelectedIds((prev) =>
      prev.includes(participantId)
        ? prev.filter((id) => id !== participantId)
        : [...prev, participantId]
    );
  };

  const handleRemove = () => {
    if (selectedIds.length > 0 && onRemove) {
      onRemove(selectedIds);
      setSelectedIds([]);
    }
  };

  const getParticipantId = (participant: Participant, idx: number) =>
    participant.id || `participant-${idx}`;

  return (
    <Box
      sx={{
        borderBottom: '1px solid #E0E0E0',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        bgcolor: 'background.paper',
      }}
    >
      {/* 헤더 */}
      <Box
        sx={{
          bgcolor: 'grey.50',
          px: 2,
          py: 1,
          minHeight: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography variant="overline" sx={{ fontWeight: 700, color: 'text.secondary' }}>
          대화 상대 ({participants.length})
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <Button
            variant="outlined"
            size="small"
            onClick={onInvite}
            startIcon={<Iconify icon="solar:add-circle-bold" width={18} />}
            sx={{
              minHeight: 30,
              py: 0.5,
              px: 1,
              borderColor: 'grey.300',
              color: 'primary.main',
              fontSize: 13,
              fontWeight: 700,
              '&:hover': {
                borderColor: 'primary.main',
                bgcolor: 'primary.lighter',
              },
            }}
          >
            초대하기
          </Button>
          <IconButton size="small" sx={{ width: 16, height: 16 }}>
            <Iconify icon="eva:arrow-ios-downward-fill" width={16} />
          </IconButton>
        </Stack>
      </Box>

      {/* 참가자 리스트 */}
      <Scrollbar sx={{ flex: 1 }}>
        <List disablePadding>
          {participants.map((participant, idx) => {
            const participantId = getParticipantId(participant, idx);
            const isSelected = selectedIds.includes(participantId);

            return (
              <ListItem
                key={participantId}
                disablePadding
                sx={{
                  px: 1,
                  py: 1,
                  gap: 1.5,
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    minHeight: 56,
                    pl: 1,
                  }}
                >
                  <Checkbox
                    checked={isSelected}
                    onChange={() => handleToggleSelect(participantId)}
                    size="small"
                    sx={{ p: 1 }}
                  />
                </Box>
                <Avatar sx={{ width: 40, height: 40, bgcolor: 'grey.300' }}>
                  {participant.name[0]}
                </Avatar>
                <Stack spacing={0.5} sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontSize: 14,
                      fontWeight: 400,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {participant.name}
                  </Typography>
                  {participant.role && (
                    <Typography
                      variant="caption"
                      sx={{
                        fontSize: 14,
                        color: 'text.secondary',
                      }}
                    >
                      {participant.role}
                    </Typography>
                  )}
                </Stack>
              </ListItem>
            );
          })}
        </List>
      </Scrollbar>

      {/* 내보내기 버튼 */}
      {selectedIds.length > 0 && (
        <Box
          sx={{
            bgcolor: 'grey.50',
            px: 2,
            py: 1.5,
            borderTop: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Button
            variant="contained"
            color="error"
            fullWidth
            onClick={handleRemove}
            sx={{
              minHeight: 36,
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            내보내기 ({selectedIds.length})
          </Button>
        </Box>
      )}
    </Box>
  );
}
