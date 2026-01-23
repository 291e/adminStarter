# SafeYouI Web 채팅 연동 가이드 (React + Firebase RTDB)

## 목차
1. 서론
2. 아키텍처 요약
3. 사전 준비 체크리스트
4. Firebase Web SDK 설정
5. 로그인 + Custom Token 인증
6. 채팅방 목록/메타데이터 연동
7. 메시지 로딩(페이징) + 실시간 구독
8. 메시지 필드 스펙(필수)
9. 메시지 전송(멀티 업데이트) 표준
10. 읽음/온라인 상태 처리
11. UI 렌더링/번역 처리 팁
12. React Query 캐시 전략(권장)
13. Web 푸시 알림(FCM) 연동
14. Firebase Rules 점검 체크리스트
15. 트러블슈팅
16. 최종 점검 체크리스트

---

## 1. 서론
본 문서는 SafeYouI(안전해유) 모바일 앱에서 사용 중인 **Firebase Realtime Database(RTDB) 기반 채팅 시스템**을 **Web(React)**에 동일하게 연동하기 위한 통합 가이드다.

핵심 원칙은 다음과 같다.
- **방 목록/메타데이터는 백엔드 API**, **실시간 메시지/상태는 Firebase RTDB**를 주로 사용한다.
- 인증은 **백엔드에서 발급하는 Firebase Custom Token**으로 Web에서 `signInWithCustomToken` 한다.
- 모바일과 동일한 데이터 정합성을 위해, 메시지 전송 시 **멀티 업데이트(update multipath)** 패턴을 반드시 준수한다.

> ⚠️ 중요: Web에서 사용하는 Firebase 프로젝트/RTDB가 **백엔드가 Custom Token을 발급하는 Firebase 프로젝트**와 반드시 일치해야 한다. 불일치 시 `auth/custom-token-mismatch`가 발생한다.

---

## 2. 아키텍처 요약
### 2.1 구성 요소
- **백엔드 API**
  - 채팅방 목록/메타데이터
  - 참가자 정보 보조
  - 첨부파일(있다면 업로드/다운로드 메타)
  - 읽음 처리/백업 등 운영성 API
- **Firebase RTDB**
  - 실시간 메시지(`/chatRooms/{roomId}/messages`)
  - `lastMessage`, `updatedAt`, `participants.{id}.unreadCount` 등 실시간 상태
- **인증(Auth)**
  - 백엔드 로그인 → `firebaseToken` 수신 → Web에서 `signInWithCustomToken`

### 2.2 데이터 소스 분리 전략(권장)
- **초기 리스트 로딩**: API(`/chat/rooms`)로 가져와 빠르게 렌더링
- **실시간 갱신**: RTDB room 단위 구독으로 `lastMessage`, `unreadCount`, `online` 등을 업데이트

---

## 3. 사전 준비 체크리스트
- [ ] 백엔드 로그인 응답에 `firebaseToken`이 포함되는지 확인
- [ ] Web Firebase 설정값이 올바른지 확인 (`apiKey/authDomain/projectId/databaseURL`)
- [ ] `databaseURL`이 포함되어 있는지 확인(Realtime Database 사용 시 필수)
- [ ] Custom Token의 `uid`가 **memberIdx 문자열**인지 확인(규칙/키 매칭 기반)
- [ ] Firebase Rules가 Web 접근을 허용하도록 설정되어 있는지 확인

---

## 4. Firebase Web SDK 설정
### 4.1 설치
```bash
npm i firebase
```

### 4.2 firebaseClient.ts 구성
> Vite 기준 예시이며, CRA/Next에서도 동일 개념으로 환경변수만 맞추면 된다.

```ts
// firebaseClient.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  // (선택) messagingSenderId, appId 등이 필요하면 추가
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);
```

---

## 5. 로그인 + Custom Token 인증
백엔드 로그인 응답에 `firebaseToken`이 포함되어야 하며, Web에서도 동일하게 Firebase 인증을 완료해야 RTDB Rules가 통과된다.

```ts
import { signInWithCustomToken } from 'firebase/auth';
import { auth } from './firebaseClient';

// 예시: api는 axios 인스턴스
const login = async (id: string, password: string) => {
  const res = await api.post('/user/signin', { memberId: id, password });

  // ⚠️ 실제 응답 경로는 서버 응답 구조에 맞춰 정리
  const { accessToken, firebaseToken, member } = res.data.body.data.body.data;

  // REST API 인증 헤더 세팅
  api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;

  // Firebase Custom Token 인증
  if (firebaseToken) {
    await signInWithCustomToken(auth, firebaseToken);
  }

  // 서버 규칙 기준: auth.currentUser.uid === member.memberIdx
};
```

> ✅ 디버그 팁: 로그인 후 `auth.currentUser?.uid`를 콘솔로 확인하고, RTDB의 `participants/{uid}` 키와 정확히 일치하는지 확인한다.

---

## 6. 채팅방 목록/메타데이터 연동
모바일처럼 **API로 방 목록을 가져오고**, **RTDB를 실시간 갱신용으로 사용**한다.

### 6.1 방 목록(API)
```ts
const rooms = await api.get('/chat/rooms?page=1&pageSize=100');
```

### 6.2 Room 단위 RTDB 구독(lastMessage, unreadCount 등)
```ts
import { onValue, ref } from 'firebase/database';
import { db } from './firebaseClient';

const unsubscribe = onValue(ref(db, `chatRooms/${roomId}`), snap => {
  const room = snap.val();
  // room.lastMessage, room.participants[myId].unreadCount 등을 UI에 반영
});
```

> 권장: 방 목록에서 모든 room을 동시에 구독하면 비용/성능 부담이 생길 수 있다.
> - MVP: 화면에 표시되는 room만 구독
> - 확장: lastMessage 업데이트만을 위한 별도 경량 구독 전략(또는 서버 fan-out)

---

## 7. 메시지 로딩(페이징) + 실시간 구독
### 7.1 기본 로딩 (최근 N개)
메시지는 `chatRooms/{roomId}/messages`에 있으며, 모바일과 동일하게 `timestamp(문자열)` 기준 정렬/페이징한다.

```ts
import { query, ref, orderByChild, limitToLast, get } from 'firebase/database';
import { db } from './firebaseClient';

const q = query(
  ref(db, `chatRooms/${roomId}/messages`),
  orderByChild('timestamp'),
  limitToLast(50),
);

const snap = await get(q);
const messages: any[] = [];
snap.forEach(child => messages.push(child.val()));
```

### 7.2 실시간 신규 메시지 구독(onChildAdded)
- 초기 로딩 이후 마지막 timestamp 이후부터 신규만 구독
- 중복 방지(이미 있는 id면 무시)

(아래는 훅 샘플 섹션에서 완성형 제공)

---

## 8. 메시지 필드 스펙(필수)
모바일 코드 기준 필수 필드(서버/클라이언트 모두 동일 규약 유지 필요):

```json
{
  "id": "messageId",
  "chatRoomId": "roomId",
  "senderMemberIdx": "123",
  "message": "원문",
  "messageType": "TEXT|IMAGE|FILE|EMERGENCY",
  "timestamp": "1700000000000",
  "createdAt": 1700000000000,
  "senderName": "홍길동",
  "translations": { "ko": "...", "en": "...", "vn": "...", "uz": "..." },
  "metadata": {},
  "sharedDocumentIdx": 123
}
```

추가 규칙:
- `lastMessage`는 `chatRooms/{roomId}/lastMessage`에 저장
- `timestamp`는 문자열이지만, 값은 `Date.now()` 기반 밀리초 문자열로 유지(정렬 기준)

---

## 9. 메시지 전송(멀티 업데이트) 표준
모바일과 동일하게 멀티 업데이트를 수행해야 정합성이 맞는다.

필수 동작:
- `chatRooms/{roomId}/messages/{messageId}` 저장
- `chatRooms/{roomId}/lastMessage` 업데이트
- `chatRooms/{roomId}/lastMessageAt` / `updatedAt` 업데이트
- 참가자 `unreadCount` 증가/리셋

### 9.1 Web용 메시지 전송 유틸(표준)
```ts
// sendMessage.ts
import { ref, push, update, get } from 'firebase/database';
import { db } from './firebaseClient';

type SendMessageParams = {
  roomId: string;
  senderId: string; // memberIdx 문자열
  senderName: string;
  text: string;
  metadata?: any;
  translations?: Record<string, string>;
  messageType?: 'TEXT' | 'IMAGE' | 'FILE' | 'EMERGENCY';
  sharedDocumentIdx?: number;
};

export async function sendRoomMessage({
  roomId,
  senderId,
  senderName,
  text,
  metadata,
  translations,
  messageType = 'TEXT',
  sharedDocumentIdx,
}: SendMessageParams) {
  const createdAt = Date.now();
  const messageId = push(ref(db, `chatRooms/${roomId}/messages`)).key!;

  const message = {
    id: messageId,
    chatRoomId: roomId,
    senderMemberIdx: senderId,
    message: text,
    messageType,
    timestamp: createdAt.toString(),
    createdAt,
    senderName,
    translations,
    metadata,
    sharedDocumentIdx,
    isRead: false,
  };

  const lastMessage = {
    message: text,
    text,
    translations,
    timestamp: createdAt.toString(),
    createdAt,
    senderMemberIdx: senderId,
    senderId,
    senderName,
  };

  // participants 가져와 unreadCount 갱신
  const participantsSnap = await get(ref(db, `chatRooms/${roomId}/participants`));
  const participants = participantsSnap.val() || {};

  const updates: Record<string, any> = {};
  updates[`chatRooms/${roomId}/messages/${messageId}`] = message;
  updates[`chatRooms/${roomId}/lastMessage`] = lastMessage;
  updates[`chatRooms/${roomId}/lastMessageAt`] = createdAt.toString();
  updates[`chatRooms/${roomId}/updatedAt`] = createdAt;

  Object.entries(participants).forEach(([pid, p]: [string, any]) => {
    if (pid === senderId || pid === 'chatbot') return;
    const unread = (p?.unreadCount ?? 0) + 1;
    updates[`chatRooms/${roomId}/participants/${pid}/unreadCount`] = unread;
    updates[`chatRooms/${roomId}/participants/${pid}/lastSeen`] = p?.lastSeen ?? createdAt;
  });

  // 발신자 unread 0
  updates[`chatRooms/${roomId}/participants/${senderId}/unreadCount`] = 0;

  await update(ref(db), updates);
}
```

---

## 10. 읽음/온라인 상태 처리
모바일 구현과 동일한 개념으로 입장/퇴장/읽음 처리를 구현한다.

```ts
import { ref, update } from 'firebase/database';
import { db } from './firebaseClient';

// 입장
export async function enterRoom(roomId: string, userId: string) {
  const now = Date.now();
  await update(ref(db), {
    [`chatRooms/${roomId}/participants/${userId}/online`]: 1,
    [`chatRooms/${roomId}/participants/${userId}/lastSeen`]: now,
  });
}

// 퇴장
export async function quitRoom(roomId: string, userId: string) {
  await update(ref(db), {
    [`chatRooms/${roomId}/participants/${userId}/online`]: 0,
  });
}

// 읽음 처리
export async function markRoomSeen(roomId: string, userId: string) {
  const now = Date.now();
  await update(ref(db), {
    [`chatRooms/${roomId}/participants/${userId}/lastSeen`]: now,
    [`chatRooms/${roomId}/participants/${userId}/unreadCount`]: 0,
  });
}
```

### 10.1 알림 배지 계산
- 모든 room의 `participants/{userId}/unreadCount` 합산

```ts
const totalUnread = rooms.reduce((sum, r) => {
  const me = r.participants?.[userId];
  return sum + (me?.unreadCount ?? 0);
}, 0);
```

---

## 11. UI 렌더링/번역 처리 팁
### 11.1 lastMessage 번역 누락 케이스
- `lastMessage.translations`가 없으면 원문 그대로 표시될 수 있다.
- Web에서는 시스템 메시지를 i18n 키로 변환해 표시하는 것을 권장한다.

```ts
const docPrefix = /^새 문서가 등록되었습니다\.\s*/;
if (docPrefix.test(lastMessageText)) {
  const title = lastMessageText.replace(docPrefix, '');
  lastMessageText = `${t('new_document_registered')} ${title}`;
}
```

### 11.2 이미지/파일 메시지 표시
- messageType 또는 metadata.type으로 분기
- 예: 이미지 메시지일 때 리스트에서는 `[이미지]` 프리픽스 사용

---

## 12. React Query 캐시 전략(권장)
### 12.1 방 목록 Query
```ts
import { useQuery } from '@tanstack/react-query';
import api from './api';

export const chatRoomsKey = (userId: string) => ['chat', 'rooms', userId];

export function useChatRooms(userId: string) {
  return useQuery({
    queryKey: chatRoomsKey(userId),
    queryFn: async () => {
      const res = await api.get('/chat/rooms?page=1&pageSize=100');
      return res.data.body.data.chatRoomList ?? [];
    },
    staleTime: 30_000,
  });
}
```

### 12.2 RTDB로 lastMessage/unreadCount 실시간 동기화
```ts
import { useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from './firebaseClient';
import { useQueryClient } from '@tanstack/react-query';

export function useRoomRealtime(roomId: string, userId: string) {
  const qc = useQueryClient();

  useEffect(() => {
    if (!roomId) return;
    const unsub = onValue(ref(db, `chatRooms/${roomId}`), snap => {
      const room = snap.val();
      if (!room) return;

      qc.setQueryData(chatRoomsKey(userId), (prev: any) => {
        if (!prev) return prev;
        return prev.map((r: any) =>
          r.id === roomId
            ? {
                ...r,
                lastMessage: room.lastMessage,
                participants: {
                  ...r.participants,
                  ...room.participants,
                },
              }
            : r,
        );
      });
    });
    return () => unsub();
  }, [roomId, userId, qc]);
}
```

---

## 13. Web 푸시 알림(FCM) 연동
> Web 푸시는 브라우저/도메인/HTTPS/서비스워커 조건이 필요하다.

### 13.1 설치
```bash
npm i firebase
```

### 13.2 서비스 워커 구성(/public/firebase-messaging-sw.js)
```js
importScripts('https://www.gstatic.com/firebasejs/10.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: '... ',
  authDomain: '... ',
  projectId: '... ',
  messagingSenderId: '... ',
  appId: '... ',
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(payload => {
  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: '/logo192.png',
  });
});
```

### 13.3 브라우저 토큰 획득 및 서버 저장
```ts
import { getMessaging, getToken } from 'firebase/messaging';
import { app } from './firebaseClient';

export async function requestFcmToken() {
  const messaging = getMessaging(app);

  const token = await getToken(messaging, {
    vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
  });

  // 서버에 저장
  await api.post('/user/update-fcm-token', { token });
}
```

### 13.4 서비스 워커 등록
```ts
if ('serviceWorker' in navigator) {
  await navigator.serviceWorker.register('/firebase-messaging-sw.js');
}
```

---

## 14. Firebase Rules 점검 체크리스트
### 14.1 Custom Token의 auth.uid
- 서버가 발급하는 Custom Token의 `uid`는 반드시 **memberIdx 문자열**이어야 한다.
- Rules에서 `auth.uid`와 participants key를 비교하는 경우가 많다.

### 14.2 Rules 점검(개념)
- `chatRooms/{roomId}` read 허용: `participants/{auth.uid}` 존재 여부
- messages write 허용: `senderMemberIdx == auth.uid`

### 14.3 점검 순서(실전)
1) Web에서 `auth.currentUser.uid` 확인
2) `chatRooms/{roomId}/participants/{uid}` 존재 여부 확인
3) Rules에서 `auth != null` 및 participants 경로 검사
4) Firebase Console에서 Rules 로그/RTDB 접근 로그 확인

---

## 15. 트러블슈팅
### 15.1 auth/custom-token-mismatch
**원인**: Web Firebase 프로젝트가 백엔드 Custom Token 발급 프로젝트와 다름
- 해결: Web Firebase 설정이 **백엔드와 동일한 Firebase 프로젝트**를 바라보도록 수정

### 15.2 permission-denied
**원인**: Firebase Rules에서 auth.uid 조건 불충족
- 해결 체크:
  - Custom Token uid == memberIdx인지
  - participants/{uid}가 실제로 존재하는지
  - Rules가 read/write 조건을 과도하게 막지 않는지

### 15.3 lastMessage가 번역 없이 노출
- 해결: 시스템 메시지/고정 문구는 Web에서 i18n 변환 처리

### 15.4 메시지 순서가 뒤엉킴
- 해결: `timestamp`(문자열) 값이 `Date.now().toString()` 형식인지 확인
- createdAt과 timestamp 불일치 시 정렬 기준을 하나로 통일

---

## 16. 최종 점검 체크리스트
- [ ] Custom Token 프로젝트 일치 여부
- [ ] Rules에서 `auth.uid == memberIdx` 기반 접근 가능 여부
- [ ] Web Firebase `databaseURL` 설정 여부
- [ ] 방 목록(API) + 상태 갱신(RTDB) 분리 적용 여부
- [ ] 메시지 전송 멀티 업데이트 패턴 준수 여부
- [ ] 입장/퇴장/읽음 처리 동기화 여부
- [ ] lastMessage 번역 처리 로직 적용 여부
- [ ] 서비스 워커 등록 및 VAPID 키 설정(푸시 사용 시)

---

## 부록 A. Web용 RTDB 구독/페이징 훅 샘플
> 아래 훅은 "초기 50개 로드 + 이후 신규 메시지 실시간 구독 + 이전 메시지 추가 로딩"을 제공한다.

```ts
// useRoomMessages.ts
import { useEffect, useState, useCallback } from 'react';
import {
  ref,
  onChildAdded,
  query,
  orderByChild,
  startAt,
  endAt,
  limitToLast,
  get,
} from 'firebase/database';
import { db } from './firebaseClient';

export type RoomMessage = {
  id: string;
  message?: string;
  text?: string;
  senderMemberIdx?: string;
  senderId?: string;
  senderName?: string;
  createdAt: number;
  timestamp?: string;
  translations?: Record<string, string>;
  metadata?: any;
  messageType?: 'TEXT' | 'IMAGE' | 'FILE' | 'EMERGENCY';
  sharedDocumentIdx?: number;
};

const INITIAL_LIMIT = 50;
const LOAD_MORE_LIMIT = 20;

export function useRoomMessages(roomId: string) {
  const [messages, setMessages] = useState<RoomMessage[]>([]);
  const [oldestCreatedAt, setOldestCreatedAt] = useState<number | null>(null);
  const [hasMore, setHasMore] = useState(true);

  // 초기 로딩 + 신규 구독
  useEffect(() => {
    if (!roomId) return;
    let unsub: (() => void) | null = null;

    const loadInitial = async () => {
      const q = query(
        ref(db, `chatRooms/${roomId}/messages`),
        orderByChild('timestamp'),
        limitToLast(INITIAL_LIMIT),
      );
      const snap = await get(q);
      const loaded: RoomMessage[] = [];
      snap.forEach(child => loaded.push(child.val()));

      loaded.sort((a, b) => (a.createdAt ?? 0) - (b.createdAt ?? 0));

      setMessages(loaded);
      if (loaded.length > 0) setOldestCreatedAt(loaded[0].createdAt);
      setHasMore(loaded.length >= INITIAL_LIMIT);

      const lastCreatedAt = loaded.length ? loaded[loaded.length - 1].createdAt : 0;
      const liveQuery = query(
        ref(db, `chatRooms/${roomId}/messages`),
        orderByChild('timestamp'),
        startAt((lastCreatedAt + 1).toString()),
      );

      unsub = onChildAdded(liveQuery, snap2 => {
        const msg = snap2.val();
        setMessages(prev => {
          if (prev.find(m => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
      });
    };

    loadInitial();
    return () => {
      if (unsub) unsub();
    };
  }, [roomId]);

  // 이전 메시지 로딩
  const loadMore = useCallback(async () => {
    if (!roomId || !oldestCreatedAt) return;

    const q = query(
      ref(db, `chatRooms/${roomId}/messages`),
      orderByChild('timestamp'),
      endAt((oldestCreatedAt - 1).toString()),
      limitToLast(LOAD_MORE_LIMIT),
    );

    const snap = await get(q);
    const older: RoomMessage[] = [];
    snap.forEach(child => older.push(child.val()));
    older.sort((a, b) => (a.createdAt ?? 0) - (b.createdAt ?? 0));

    if (older.length > 0) {
      setMessages(prev => [...older, ...prev]);
      setOldestCreatedAt(older[0].createdAt);
    }

    setHasMore(older.length >= LOAD_MORE_LIMIT);
  }, [roomId, oldestCreatedAt]);

  return { messages, hasMore, loadMore };
}
```

