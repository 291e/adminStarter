import { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from 'src/config/firebase';
import type { FirebaseMessage } from './use-chat-room-firebase';

type ChatRoomRealtime = {
  lastMessage: FirebaseMessage | null;
  lastMessageAt?: string;
  unreadCount?: number;
};

export function useChatRoomLastMessage(
  chatRoomId?: string,
  memberIdx?: number | null,
  enabled: boolean = true
) {
  const [state, setState] = useState<ChatRoomRealtime>({
    lastMessage: null,
  });

  useEffect(() => {
    if (!enabled || !chatRoomId || !database) return undefined;

    const roomRef = ref(database, `chatRooms/${chatRoomId}`);

    const unsubscribe = onValue(roomRef, (snapshot) => {
      if (!snapshot.exists()) {
        setState({ lastMessage: null });
        return;
      }

      const data = snapshot.val() as any;
      const rawLastMessage = data?.lastMessage;
      const lastMessageAt = data?.lastMessageAt;
      const memberKey = memberIdx ? String(memberIdx) : null;
      const unreadCount = memberKey ? data?.participants?.[memberKey]?.unreadCount : undefined;

      let lastMessage: FirebaseMessage | null = null;
      if (rawLastMessage) {
        const messageText =
          typeof rawLastMessage === 'string'
            ? rawLastMessage
            : rawLastMessage.message || rawLastMessage.text || '';
        const timestamp =
          rawLastMessage.timestamp ||
          rawLastMessage.createdAt?.toString() ||
          lastMessageAt ||
          '';

        lastMessage = {
          id: rawLastMessage.id || `last-${chatRoomId}`,
          chatRoomId,
          senderMemberIdx: String(rawLastMessage.senderMemberIdx || rawLastMessage.senderId || ''),
          senderId: rawLastMessage.senderId,
          senderName: rawLastMessage.senderName,
          message: messageText,
          text: rawLastMessage.text || rawLastMessage.message || messageText,
          messageType: rawLastMessage.messageType || 'TEXT',
          timestamp,
          createdAt: rawLastMessage.createdAt,
          isRead: false,
          translations: rawLastMessage.translations,
          sharedDocumentIdx: rawLastMessage.sharedDocumentIdx,
          metadata: rawLastMessage.metadata,
        };
      }

      setState({
        lastMessage,
        lastMessageAt,
        unreadCount,
      });
    });

    return () => {
      unsubscribe();
    };
  }, [chatRoomId, memberIdx, database, enabled]);

  return state;
}
