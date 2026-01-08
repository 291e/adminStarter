import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ref, onValue } from 'firebase/database';
import { database } from 'src/config/firebase';
import { useAuthContext } from 'src/auth/hooks';

export function useChatRoomsEvent() {
  const { user } = useAuthContext();
  const queryClient = useQueryClient();

  // 내 memberIdx 찾기
  const memberIdx =
    user?.memberIdx ||
    user?.memberIndex ||
    user?.member?.memberIdx ||
    user?.member?.memberIndex ||
    (user as any)?.id;

  useEffect(() => {
    if (!memberIdx || !database) return undefined;

    // 내 사용자 정보 노드를 구독
    // 백엔드에서 채팅방 생성/초대 시 이 노드의 어떤 필드라도 업데이트한다면 감지 가능
    // 또는 /users/{memberIdx}/chatRooms 같은 매핑 정보를 관리한다면 감지 가능
    const userRef = ref(database, `users/${memberIdx}`);

    const handleDataChange = (snapshot: any) => {
      // 데이터가 변경되면 채팅방 목록 Refetch
      // (최적화를 위해 snapshot 내용을 분석해서 실제 채팅방 관련 변경인지 체크하면 좋겠지만,
      // 현재 구조를 모르므로 일단 모든 변경에 대해 갱신 시도)
      queryClient.invalidateQueries({ queryKey: ['chatRooms'] });
    };

    // onValue는 데이터가 처음 로드될 때도 호출되므로,
    // 채팅방 목록이 처음 로드되는 시점과 겹쳐서 자연스럽게 최신화됨.
    const unsubscribe = onValue(userRef, handleDataChange);

    return () => {
      // off(userRef, 'value', handleDataChange); // unsubscribe() 호출이 더 권장됨
      unsubscribe();
    };
  }, [memberIdx, queryClient]);
}
