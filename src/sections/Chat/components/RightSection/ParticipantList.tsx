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
import RemoveParticipantModal from './RemoveParticipantModal';
// TODO: API 연동 시 현재 사용자 정보로 필터링하기 위해 사용
// import { useAuthContext } from 'src/auth/hooks/use-auth-context';
import type { ChatRoom } from 'src/_mock/_chat';

type Participant = {
  id?: string;
  name: string;
  role?: string;
};

type Props = {
  room?: ChatRoom | null;
  participants: Participant[];
  onInvite?: () => void;
  onRemove?: (participantIds: string[]) => void;
};

export default function ParticipantList({ room, participants, onInvite, onRemove }: Props) {
  // TODO: API 연동 시 현재 사용자 정보로 필터링하기 위해 사용
  // const { user } = useAuthContext();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [removeModalOpen, setRemoveModalOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  // 채팅방 타입에 따라 필터링된 참가자 목록
  // TODO: TanStack Query Hook(useQuery)으로 채팅방 타입별 참가자 목록 조회
  // const { data: filteredParticipants } = useQuery({
  //   queryKey: ['chatParticipants', room?.id, room?.type],
  //   queryFn: () => {
  //     if (room?.type === 'chatbot') {
  //       // 챗봇 채팅: 챗봇만 표시
  //       return getChatbotParticipants(room.id);
  //     } else if (room?.type === 'emergency') {
  //       // 사고 발생 현황 채팅: 응급 담당자들만 표시
  //       return getEmergencyParticipants(room.id);
  //     } else {
  //       // 일반 채팅/그룹 채팅: 일반 참가자들 표시
  //       return getNormalParticipants(room?.id);
  //     }
  //   },
  //   enabled: !!room,
  // });

  // 임시: 채팅방 타입에 따라 필터링 (실제로는 API에서 받아온 데이터 사용)
  // TODO: TanStack Query Hook(useQuery)으로 채팅방 타입별 참가자 목록 조회
  // const { data: filteredParticipants } = useQuery({
  //   queryKey: ['chatParticipants', room?.id, room?.type],
  //   queryFn: () => {
  //     if (room?.type === 'chatbot') {
  //       // 챗봇 채팅: 챗봇만 표시
  //       return getChatbotParticipants(room.id);
  //     } else if (room?.type === 'emergency') {
  //       // 사고 발생 현황 채팅: 응급 담당자들만 표시
  //       return getEmergencyParticipants(room.id);
  //     } else {
  //       // 일반 채팅/그룹 채팅: 일반 참가자들 표시
  //       return getNormalParticipants(room?.id);
  //     }
  //   },
  //   enabled: !!room,
  // });

  // 임시: 채팅방 타입에 따라 필터링 (실제로는 API에서 받아온 데이터 사용)
  const filteredParticipants = (() => {
    if (!room) return participants;
    if (room.type === 'chatbot') {
      // 챗봇 채팅: 챗봇만 표시
      return participants.filter((p) => p.name === '챗봇' || p.role === 'chatbot');
    } else if (room.type === 'emergency') {
      // 사고 발생 현황 채팅: 응급 담당자들만 표시 (조직 관리자, 관리 감독자, 안전보건 담당자)
      return participants.filter(
        (p) =>
          p.role === '안전보건 담당자' ||
          p.role === '관리 감독자' ||
          p.role === '조직 관리자' ||
          p.role === 'CEO' ||
          p.role === 'CTO'
      );
    } else if (room.type === 'normal') {
      // 일반 채팅(1대1): 채팅방 이름과 일치하는 참가자만 표시
      // TODO: API에서 받아온 데이터에는 현재 사용자 정보가 포함되어 있으므로,
      // user.id 또는 user.displayName과 비교하여 필터링
      // const currentUserName = user?.displayName || user?.name || '';
      // return participants.filter((p) => p.name !== currentUserName).slice(0, 1);

      // 임시: 채팅방 이름(room.name)과 일치하는 참가자만 표시
      // 예: room.name이 "홍길동"이면 "홍길동" 참가자만 표시
      const matchedParticipant = participants.find((p) => p.name === room.name);
      return matchedParticipant ? [matchedParticipant] : participants.slice(0, 1);
    } else {
      // 그룹 채팅: 모든 참가자 표시
      return participants;
    }
  })();

  // 사고 발생 현황 또는 챗봇 채팅인지 확인 (체크박스, 내보내기, 초대하기 버튼 숨김)
  const isEmergencyOrChatbot = room?.type === 'emergency' || room?.type === 'chatbot';

  // 대화 상대가 1명일 때 프로필 형태로 표시 (일반 채팅 1대1)
  const isSingleParticipant = filteredParticipants.length === 1 && room?.type === 'normal';

  const handleToggleSelect = (participantId: string) => {
    setSelectedIds((prev) =>
      prev.includes(participantId)
        ? prev.filter((id) => id !== participantId)
        : [...prev, participantId]
    );
  };

  const handleRemoveClick = () => {
    if (selectedIds.length > 0) {
      setRemoveModalOpen(true);
    }
  };

  const handleConfirmRemove = (participantIds: string[]) => {
    if (onRemove) {
      onRemove(participantIds);
      setSelectedIds([]);
    }
    setRemoveModalOpen(false);
  };

  const getParticipantId = (participant: Participant, idx: number) =>
    participant.id || `participant-${idx}`;

  return (
    <Box
      sx={{
        borderBottom: '1px solid #E0E0E0',
        flex: isExpanded ? 1 : '0 0 auto',
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
          대화 상대 ({filteredParticipants.length})
        </Typography>
        {/* 사고 발생 현황 또는 챗봇에서는 초대하기 버튼 숨김 */}
        {!isEmergencyOrChatbot && (
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
            <IconButton
              size="small"
              onClick={() => setIsExpanded(!isExpanded)}
              sx={{
                width: 16,
                height: 16,
                transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)',
                transition: 'transform 0.2s',
              }}
            >
              <Iconify icon="eva:arrow-ios-downward-fill" width={16} />
            </IconButton>
          </Stack>
        )}
      </Box>

      {/* 참가자 리스트 */}
      {isExpanded && (
        <Scrollbar sx={{ flex: 1 }}>
          {isSingleParticipant ? (
            // 대화 상대가 1명일 때 프로필 형태로 표시
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                py: 4,
                px: 2,
                gap: 1,
              }}
            >
              <Avatar
                sx={{
                  width: 64,
                  height: 64,
                  bgcolor: 'grey.300',
                  mb: 0.5,
                }}
              >
                {filteredParticipants[0].name[0]}
              </Avatar>
              <Stack spacing={0.5} alignItems="center">
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontSize: 16,
                    fontWeight: 600,
                    lineHeight: '24px',
                    textAlign: 'center',
                    color: 'text.primary',
                  }}
                >
                  {filteredParticipants[0].name}
                </Typography>
                {filteredParticipants[0].role && (
                  <Typography
                    variant="body2"
                    sx={{
                      fontSize: 14,
                      fontWeight: 400,
                      lineHeight: '22px',
                      textAlign: 'center',
                      color: 'text.disabled',
                    }}
                  >
                    {filteredParticipants[0].role}
                  </Typography>
                )}
              </Stack>
            </Box>
          ) : (
            <List disablePadding>
              {filteredParticipants.map((participant, idx) => {
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
                    {/* 사고 발생 현황 또는 챗봇에서는 체크박스 숨김 */}
                    {!isEmergencyOrChatbot && (
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
                    )}
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
          )}
        </Scrollbar>
      )}

      {/* 내보내기 버튼 - 사고 발생 현황 또는 챗봇에서는 숨김, 대화 상대가 1명일 때도 숨김 */}
      {!isEmergencyOrChatbot && !isSingleParticipant && selectedIds.length > 0 && (
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
            onClick={handleRemoveClick}
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

      {/* 내보내기 확인 모달 */}
      <RemoveParticipantModal
        open={removeModalOpen}
        onClose={() => setRemoveModalOpen(false)}
        onConfirm={handleConfirmRemove}
        room={room}
        participants={filteredParticipants}
        selectedParticipantIds={selectedIds}
      />
    </Box>
  );
}
