import { useState, useEffect } from 'react';
import { ref, query, orderByChild, limitToLast, onValue } from 'firebase/database';
import { database } from 'src/config/firebase';
import type { FirebaseMessage } from './use-chat-room-firebase';

export function useChatRoomLastMessage(chatRoomId?: string) {
  const [lastMessage, setLastMessage] = useState<FirebaseMessage | null>(null);

  useEffect(() => {
    if (!chatRoomId || !database) return undefined;

    const messagesRef = ref(database, `chatRooms/${chatRoomId}/messages`);
    const q = query(messagesRef, orderByChild('timestamp'), limitToLast(1));

    const unsubscribe = onValue(q, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        // data는 객체 형태 { messageId: content, ... } 이므로 값만 추출
        const messages = Object.values(data) as FirebaseMessage[];
        if (messages.length > 0) {
          setLastMessage(messages[0]);
        } else {
          setLastMessage(null);
        }
      } else {
        setLastMessage(null);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [chatRoomId]);

  return lastMessage;
}
