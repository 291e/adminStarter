import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';

import DialogBtn from 'src/components/safeyoui/button/dialogBtn';
import type { ChatRoom } from 'src/_mock/_chat';
import warningIcon from 'src/assets/icons/safeyoui/warning.svg';

// ----------------------------------------------------------------------

type Participant = {
  id?: string;
  name: string;
  role?: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: (participantIds: string[]) => void;
  room?: ChatRoom | null;
  participants: Participant[];
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
  const getParticipantId = (participant: Participant, idx: number) =>
    participant.id || `participant-${idx}`;

  const selectedParticipants = participants.filter((participant, idx) =>
    selectedParticipantIds.includes(getParticipantId(participant, idx))
  );

  // 대화 상대가 1명일 경우 상대방 프로필 정보 표시
  // 일반 채팅(1대1)이거나 필터링된 참가자가 1명일 경우
  const isSingleParticipant = participants.length === 1 || room?.type === 'normal';
  // 대화 상대가 1명일 경우 첫 번째 선택된 참가자만 표시
  // 일반 채팅의 경우 선택된 참가자가 없어도 첫 번째 참가자를 표시
  const displayParticipant = isSingleParticipant
    ? selectedParticipants[0] || participants[0]
    : null;

  const handleConfirm = () => {
    if (!room) return;

    // TODO: TanStack Query Hook(useMutation)으로 채팅방에서 참가자 내보내기 API 호출
    // 채팅방 타입에 따라 다른 API 엔드포인트 사용
    // const mutation = useMutation({
    //   mutationFn: (data: { roomId: string; participantIds: string[]; roomType: string }) => {
    //     if (data.roomType === 'chatbot') {
    //       // 챗봇 채팅: 내보내기 불가능하거나 특별한 처리
    //       return Promise.reject(new Error('챗봇 채팅에서는 참가자를 내보낼 수 없습니다.'));
    //     } else if (data.roomType === 'emergency') {
    //       // 사고 발생 현황 채팅: 응급 담당자 내보내기
    //       return removeEmergencyParticipants(data.roomId, data.participantIds);
    //     } else {
    //       // 일반 채팅/그룹 채팅: 일반 참가자 내보내기
    //       return removeChatParticipants(data.roomId, data.participantIds);
    //     }
    //   },
    //   onSuccess: () => {
    //     queryClient.invalidateQueries({ queryKey: ['chatRoom', room.id, 'participants'] });
    //     // 성공 토스트 메시지 표시
    //     onClose();
    //   },
    //   onError: (error) => {
    //     console.error('참가자 내보내기 실패:', error);
    //     // 에러 토스트 메시지 표시
    //   },
    // });
    // mutation.mutate({ roomId: room.id, participantIds: selectedParticipantIds, roomType: room.type || 'normal' });

    onConfirm(selectedParticipantIds);
    onClose();
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
              {displayParticipant.role && (
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: 14,
                    fontWeight: 400,
                    lineHeight: '22px',
                    color: 'text.disabled',
                  }}
                >
                  {displayParticipant.role}
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
