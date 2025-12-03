import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';

import DialogBtn from 'src/components/safeyoui/button/dialogBtn';
import { useRemoveParticipants } from 'src/sections/Chat/hooks/use-chat-api';
import { useQueryClient } from '@tanstack/react-query';
import type { ChatRoomDto, ChatParticipantDto } from 'src/services/chat/chat.types';
import warningIcon from 'src/assets/icons/safeyoui/warning.svg';

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

  // 대화 상대가 1명일 경우 상대방 프로필 정보 표시
  // 일반 채팅(1대1)이거나 필터링된 참가자가 1명일 경우
  const isSingleParticipant = participants.length === 1 || room?.type === 'NORMAL';
  // 대화 상대가 1명일 경우 첫 번째 선택된 참가자만 표시
  // 일반 채팅의 경우 선택된 참가자가 없어도 첫 번째 참가자를 표시
  const displayParticipant = isSingleParticipant
    ? selectedParticipants[0] || participants[0]
    : null;

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
      <DialogContent
        sx={{
          px: 3.5,
          py: 3,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2.5,
        }}
      >
        {/* 경고 아이콘 */}
        <Box
          sx={{
            width: 64,
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <img src={warningIcon} alt="warning" width={64} height={64} />
        </Box>

        {/* 텍스트 영역 */}
        <Stack spacing={1} alignItems="center" sx={{ textAlign: 'center' }}>
          <Typography variant="h5" sx={{ fontWeight: 700, fontSize: 20, lineHeight: '30px' }}>
            {isSingleParticipant
              ? '이 사용자를 내보내시겠습니까?'
              : '선택한 사용자를 내보내시겠습니까?'}
          </Typography>
          <Typography
            variant="subtitle2"
            sx={{
              fontSize: 14,
              fontWeight: 600,
              lineHeight: '22px',
              color: 'text.secondary',
            }}
          >
            {isSingleParticipant
              ? '내보내기를 진행하면 이 사용자는 대화에 참여할 수 없으며, 복구할 수 없습니다.'
              : '내보내기를 진행하면 이 사용자들은 대화에 참여할 수 없으며, 복구할 수 없습니다.'}
          </Typography>
        </Stack>

        {/* 대화 상대가 1명일 경우: 아바타와 사용자 정보 표시 */}
        {isSingleParticipant && displayParticipant ? (
          <Stack spacing={1} alignItems="center" sx={{ width: '100%', pt: 1 }}>
            <Avatar
              sx={{
                width: 64,
                height: 64,
                bgcolor: 'grey.300',
                fontSize: 24,
                fontWeight: 600,
              }}
            >
              {displayParticipant.name[0]}
            </Avatar>
            <Stack spacing={0.5} alignItems="center">
              <Typography
                variant="subtitle1"
                sx={{
                  fontSize: 16,
                  fontWeight: 600,
                  lineHeight: '24px',
                  color: 'text.primary',
                }}
              >
                {displayParticipant.name}
              </Typography>
              {(displayParticipant as any).role && (
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: 14,
                    fontWeight: 400,
                    lineHeight: '22px',
                    color: 'text.disabled',
                  }}
                >
                  {(displayParticipant as any).role}
                </Typography>
              )}
            </Stack>
          </Stack>
        ) : (
          /* 그룹 채팅: 선택된 참가자 Chip 목록 */
          selectedParticipants.length > 0 && (
            <Stack
              direction="row"
              spacing={1}
              sx={{
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: 1,
                width: '100%',
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
          )
        )}
      </DialogContent>

      <DialogActions sx={{ px: 2, pb: 3, pt: 0 }}>
        <Stack direction="row" spacing={1.5} justifyContent="center" sx={{ width: '100%' }}>
          <DialogBtn variant="outlined" onClick={onClose} sx={{ minHeight: 36, fontSize: 14 }}>
            취소
          </DialogBtn>
          <DialogBtn
            variant="contained"
            onClick={handleConfirm}
            sx={{ minHeight: 36, fontSize: 14 }}
          >
            내보내기
          </DialogBtn>
        </Stack>
      </DialogActions>
    </Dialog>
  );
}
