import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';

import DialogBtn from 'src/components/safeyoui/button/dialogBtn';
import { useRemoveParticipants } from 'src/sections/Chat/hooks/use-chat-api';
import { useQueryClient } from '@tanstack/react-query';
import type { ChatRoomDto, ChatParticipantDto } from 'src/services/chat/chat.types';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: (participantIds: string[]) => void;
  room?: ChatRoomDto | null;
  participants: ChatParticipantDto[];
  selectedParticipantIds: string[];
};

export default function RemoveParticipantModal({
  open,
  onClose,
  onConfirm,
  room,
  participants,
  selectedParticipantIds,
}: Props) {
  // 선택된 참가자 이름 가져오기
  const getParticipantId = (participant: ChatParticipantDto, idx: number) =>
    participant.memberIdx?.toString() || `participant-${idx}`;

  const selectedParticipants = participants.filter((participant, idx) =>
    selectedParticipantIds.includes(getParticipantId(participant, idx))
  );

  // 선택된 참가자가 1명인지 여부
  const isSingleParticipant = selectedParticipants.length === 1;

  const queryClient = useQueryClient();
  const removeParticipantsMutation = useRemoveParticipants();

  const handleConfirm = async () => {
    if (!room?.chatRoomIdx || selectedParticipantIds.length === 0) return;

    // 챗봇 채팅에서는 내보내기 불가
    if (room.type === 'CHATBOT') {
      console.error('챗봇 채팅에서는 참가자를 내보낼 수 없습니다.');
      return;
    }

    try {
      // participantIds를 memberIndexes로 변환
      const memberIndexes = selectedParticipantIds
        .map((id) => {
          // id가 memberIdx 문자열인 경우
          const parsed = Number(id);
          if (!Number.isNaN(parsed)) return parsed;

          // participants에서 memberIdx로 찾기
          const participant = participants.find(
            (p) => p.memberIdx?.toString() === id || p.memberIdx === Number(id)
          );
          return participant?.memberIdx ? Number(participant.memberIdx) : null;
        })
        .filter((idx): idx is number => idx !== null && !Number.isNaN(idx));

      if (memberIndexes.length === 0) {
        console.error('유효한 참가자 인덱스를 찾을 수 없습니다.');
        return;
      }

      await removeParticipantsMutation.mutateAsync({
        chatRoomIdx: room.chatRoomIdx,
        memberIndexes,
      });

      // 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: ['chatParticipants', room.chatRoomIdx] });
      queryClient.invalidateQueries({ queryKey: ['chatRooms'] });
      queryClient.invalidateQueries({ queryKey: ['chatRoom', room.chatRoomIdx] });

      onConfirm(selectedParticipantIds);
      onClose();
    } catch (error) {
      console.error('참가자 내보내기 실패:', error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogContent>
        <Stack spacing={2} alignItems="center" sx={{ pt: 2 }}>
          {/* 경고 아이콘 */}
          <Box
            sx={{
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Iconify
              icon={'solar:danger-circle-bold' as any}
              width={64}
              sx={{ color: 'error.main' }}
            />
          </Box>

          {/* 메시지 */}
          <Typography variant="subtitle1" sx={{ textAlign: 'center' }}>
            {isSingleParticipant
              ? '선택한 사용자를 내보내시겠습니까?'
              : '선택한 사용자들을 내보내시겠습니까?'}
          </Typography>
          <Typography variant="body2" sx={{ textAlign: 'center', mt: 1 }}>
            {isSingleParticipant ? (
              <>
                내보내기를 진행하면 이 사용자는 대화에 <br /> 참여할 수 없으며, 복구할 수 없습니다.
              </>
            ) : (
              <>
                내보내기를 진행하면 이 사용자들은 대화에 <br /> 참여할 수 없으며, 복구할 수
                없습니다.
              </>
            )}
          </Typography>
        </Stack>

        {/* 선택된 참가자 Chip 목록 */}
        {selectedParticipants.length > 0 && (
          <Stack
            direction="row"
            spacing={1}
            sx={{
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: 1,
              width: '100%',
              pt: 1,
            }}
          >
            {selectedParticipants.map((participant, idx) => {
              const participantId = getParticipantId(participant, idx);
              return (
                <Chip
                  key={participantId}
                  label={participant.name}
                  size="small"
                  sx={{
                    height: 24,
                    bgcolor: 'info.lighter',
                    color: 'info.darker',
                    fontSize: 13,
                    fontWeight: 500,
                    lineHeight: '18px',
                    '& .MuiChip-label': {
                      px: 1.25,
                      py: 0,
                    },
                  }}
                />
              );
            })}
          </Stack>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, justifyContent: 'center', gap: 1 }}>
        <DialogBtn variant="outlined" onClick={onClose} sx={{ minWidth: 64 }}>
          취소
        </DialogBtn>
        <DialogBtn variant="contained" onClick={handleConfirm} sx={{ minWidth: 64 }}>
          내보내기
        </DialogBtn>
      </DialogActions>
    </Dialog>
  );
}
