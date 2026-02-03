import { useEffect, useLayoutEffect, useRef, useState } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';

import { Scrollbar } from 'src/components/scrollbar';
import MessageBubble from './MessageBubble';

type ChatMessage = {
  id: string;
  sender: string;
  message: string;
  timestamp: string;
  dateLabel?: string;
  avatarUrl?: string;
  isOwn?: boolean;
  messageType?: 'TEXT' | 'IMAGE' | 'VIDEO' | 'FILE' | 'SYSTEM' | 'EMERGENCY';
  sharedDocumentIdx?: number;
  attachments?: string[] | null;
  metadata?: {
    type?: string;
    location?: {
      latitude: number;
      longitude: number;
      address?: string;
    };
  };
};

type Props = {
  messages: ChatMessage[];
  conversationDate?: string;
  roomId?: string | number; // 채팅방 변경 감지용
  onFileMessageClick?: (sharedDocumentIdx: number) => void;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
};

export default function MessageList({
  messages,
  conversationDate,
  roomId,
  onFileMessageClick,
  hasMore,
  isLoadingMore,
  onLoadMore,
}: Props) {
  const scrollbarRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const prevMessagesLengthRef = useRef(messages.length);
  const prevLastMessageIdRef = useRef<string | undefined>(messages[messages.length - 1]?.id);
  const prevRoomIdRef = useRef<string | number | undefined>(roomId);
  const isUserScrollingRef = useRef(false);

  const dateLabel =
    conversationDate || messages[0]?.dateLabel || new Date().toLocaleDateString('ko-KR');

  // 스크롤을 맨 아래로 이동하는 함수 (여러 방법 시도)
  const scrollToBottom = (smooth = false) => {
    if (!scrollbarRef.current) return;

    // 방법 1: SimpleBar의 scrollableNode 찾기
    const scrollableNode = scrollbarRef.current.querySelector(
      '.simplebar-content-wrapper'
    ) as HTMLElement;

    if (scrollableNode) {
      const scrollHeight = scrollableNode.scrollHeight;
      const clientHeight = scrollableNode.clientHeight;
      const maxScroll = scrollHeight - clientHeight;

      // 즉시 스크롤 (smooth가 false일 때)
      if (!smooth) {
        scrollableNode.scrollTop = scrollHeight;
      } else {
        scrollableNode.scrollTo({
          top: scrollHeight,
          behavior: 'smooth',
        });
      }

      // 추가 안전장치: 여러 방법으로 시도
      setTimeout(() => {
        if (scrollableNode.scrollTop < maxScroll - 5) {
          scrollableNode.scrollTop = scrollHeight;
        }
      }, 10);

      setTimeout(() => {
        if (scrollableNode.scrollTop < maxScroll - 5) {
          scrollableNode.scrollTop = scrollHeight;
        }
      }, 50);
    }

    // 방법 2: messagesEndRef로 스크롤 (fallback)
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
    }
  };

  // 스크롤 위치 확인 함수 (맨 아래에 있는지 체크)
  const checkIfAtBottom = () => {
    if (!scrollbarRef.current) return false;

    const scrollableNode = scrollbarRef.current.querySelector(
      '.simplebar-content-wrapper'
    ) as HTMLElement;
    if (!scrollableNode) return false;

    const { scrollTop, scrollHeight, clientHeight } = scrollableNode;
    // 100px 여유를 두고 맨 아래인지 확인
    const threshold = 100;
    return scrollHeight - scrollTop - clientHeight < threshold;
  };

  // 스크롤 이벤트 핸들러
  useEffect(() => {
    if (!scrollbarRef.current) {
      return undefined;
    }

    const scrollableNode = scrollbarRef.current.querySelector(
      '.simplebar-content-wrapper'
    ) as HTMLElement;
    if (!scrollableNode) {
      return undefined;
    }

    let scrollTimeout: NodeJS.Timeout;

    const handleScroll = () => {
      // 사용자가 스크롤 중임을 표시
      isUserScrollingRef.current = true;
      clearTimeout(scrollTimeout);

      const atBottom = checkIfAtBottom();
      setIsAtBottom(atBottom);

      // 사용자가 위로 스크롤하면 자동 스크롤 비활성화
      if (!atBottom) {
        setShouldAutoScroll(false);
      } else {
        // 맨 아래로 돌아오면 자동 스크롤 다시 활성화
        setShouldAutoScroll(true);
      }

      // 스크롤이 멈춘 후 플래그 해제
      scrollTimeout = setTimeout(() => {
        isUserScrollingRef.current = false;
      }, 150);
    };

    scrollableNode.addEventListener('scroll', handleScroll);
    return () => {
      scrollableNode.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, []);

  // 채팅방 변경 시 초기화 및 스크롤
  useEffect(() => {
    if (roomId !== undefined && roomId !== prevRoomIdRef.current) {
      prevRoomIdRef.current = roomId;
      prevMessagesLengthRef.current = messages.length;
      prevLastMessageIdRef.current = messages[messages.length - 1]?.id;
      setIsAtBottom(true);
      setShouldAutoScroll(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  // 메시지 변경 시 자동 스크롤 (useLayoutEffect로 DOM 업데이트 직후 실행)
  useLayoutEffect(() => {
    // 채팅방이 변경되었을 때
    if (roomId !== undefined && roomId !== prevRoomIdRef.current) {
      prevRoomIdRef.current = roomId;
      // requestAnimationFrame으로 DOM 렌더링 완료 후 스크롤
      requestAnimationFrame(() => {
        scrollToBottom(false);
        setIsAtBottom(true);
        setShouldAutoScroll(true);
      });
      return;
    }

    // 메시지가 처음 로드되거나 메시지 개수가 0에서 증가할 때
    if (messages.length > 0 && prevMessagesLengthRef.current === 0) {
      prevLastMessageIdRef.current = messages[messages.length - 1]?.id;
      requestAnimationFrame(() => {
        scrollToBottom(false);
        setIsAtBottom(true);
        setShouldAutoScroll(true);
      });
      prevMessagesLengthRef.current = messages.length;
      return;
    }

    // 새 메시지가 추가되었을 때
    const lastMessageId = messages[messages.length - 1]?.id;
    const isNewMessage = lastMessageId && lastMessageId !== prevLastMessageIdRef.current;
    const isMessageAdded = messages.length > prevMessagesLengthRef.current;

    if (isNewMessage || isMessageAdded) {
      // 사용자가 스크롤 중이 아니고, 자동 스크롤이 활성화되어 있거나 맨 아래에 있을 때만 스크롤
      if (!isUserScrollingRef.current && (shouldAutoScroll || isAtBottom)) {
        requestAnimationFrame(() => {
          scrollToBottom(true);
          setIsAtBottom(true);
        });
      }
      prevLastMessageIdRef.current = lastMessageId;
      prevMessagesLengthRef.current = messages.length;
    } else {
      prevMessagesLengthRef.current = messages.length;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, roomId]);

  return (
    <Scrollbar ref={scrollbarRef} sx={{ flex: 1, p: { xs: 2, lg: 2.5 } }}>
      <Stack spacing={2}>
        {hasMore && onLoadMore && (
          <Box sx={{ display: 'flex', justifyContent: 'center', pt: 1 }}>
            <Button
              size="small"
              variant="outlined"
              onClick={onLoadMore}
              disabled={isLoadingMore}
            >
              {isLoadingMore ? '불러오는 중...' : '이전 메시지 더보기'}
            </Button>
          </Box>
        )}
        {/* 날짜 구분선 */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Divider sx={{ flex: 1 }} />
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {dateLabel}
          </Typography>
          <Divider sx={{ flex: 1 }} />
        </Box>

        {messages.map((message) => (
          <Box key={message.id} sx={{ mb: 2 }}>
            <MessageBubble
              sender={message.sender}
              message={message.message}
              timestamp={message.timestamp}
              avatarUrl={message.avatarUrl}
              isOwn={message.isOwn || false}
              messageType={message.messageType}
              sharedDocumentIdx={message.sharedDocumentIdx}
              attachments={message.attachments}
              metadata={message.metadata}
              onFileClick={onFileMessageClick}
            />
          </Box>
        ))}
        {/* 스크롤 앵커: 자동 스크롤을 위한 더미 엘리먼트 */}
        <div ref={messagesEndRef} style={{ height: 1, width: '100%' }} />
      </Stack>
    </Scrollbar>
  );
}
