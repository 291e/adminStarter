# Firebase 채팅 기능 연동 가이드

## 목차
1. [Firebase 콘솔 설정](#1-firebase-콘솔-설정)
2. [Firebase Security Rules 설정](#2-firebase-security-rules-설정)
3. [프론트엔드 Firebase SDK 설정](#3-프론트엔드-firebase-sdk-설정)
4. [인증 연동](#4-인증-연동)
5. [실시간 메시지 송수신](#5-실시간-메시지-송수신)
6. [백엔드 API 연동](#6-백엔드-api-연동)
7. [메시지 백업](#7-메시지-백업)

---

## 1. Firebase 콘솔 설정

### 1.1 Realtime Database 생성

1. Firebase 콘솔 접속: https://console.firebase.google.com
2. 프로젝트 선택 또는 새 프로젝트 생성
3. **Realtime Database** 메뉴로 이동
4. **데이터베이스 만들기** 클릭
5. 위치 선택 (예: `asia-northeast3` - 서울)
6. **테스트 모드로 시작** 선택 (나중에 Security Rules로 보안 설정)

### 1.2 데이터베이스 URL 확인

Realtime Database 생성 후 상단에 표시되는 URL을 확인:
```
https://your-project-id-default-rtdb.asia-northeast3.firebasedatabase.app
```

이 URL을 `.env` 파일에 설정:
```env
FIREBASE_DATABASE_URL=https://your-project-id-default-rtdb.asia-northeast3.firebasedatabase.app
```

### 1.3 Service Account 키 생성

1. Firebase 콘솔 → **프로젝트 설정** → **서비스 계정** 탭
2. **새 비공개 키 생성** 클릭
3. JSON 파일 다운로드
4. JSON 파일 내용을 `.env` 파일에 설정 (한 줄로 변환):
```env
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"your-project-id",...}
```

또는 `firebase-adminsdk.json` 파일로 저장하고 경로 지정:
```env
FIREBASE_SERVER_KEY=./firebase-adminsdk.json
```

---

## 2. Firebase Security Rules 설정

Firebase 콘솔 → **Realtime Database** → **규칙** 탭에서 다음 규칙 설정:

```json
{
  "rules": {
    "chatRooms": {
      "$roomId": {
        // 채팅방 접근 권한: 참가자만 읽기/쓰기 가능
        ".read": "auth != null && (root.child('chatRooms').child($roomId).child('participants').child(auth.uid).exists() || root.child('chatRooms').child($roomId).child('participants').child('chatbot').exists())",
        ".write": "auth != null && (root.child('chatRooms').child($roomId).child('participants').child(auth.uid).exists() || root.child('chatRooms').child($roomId).child('participants').child('chatbot').exists())",
        
        "messages": {
          "$messageId": {
            // 메시지는 참가자만 읽기 가능
            ".read": "auth != null && (root.child('chatRooms').child($roomId).child('participants').child(auth.uid).exists() || root.child('chatRooms').child($roomId).child('participants').child('chatbot').exists())",
            // 메시지 작성은 본인만 가능
            ".write": "auth != null && (newData.child('senderMemberIdx').val() == auth.uid || auth.uid == 'chatbot')",
            ".validate": "newData.hasChildren(['id', 'chatRoomId', 'senderMemberIdx', 'message', 'messageType', 'timestamp'])"
          }
        },
        
        "participants": {
          "$memberIdx": {
            // 참가자 정보는 참가자만 읽기 가능
            ".read": "auth != null && (root.child('chatRooms').child($roomId).child('participants').child(auth.uid).exists() || auth.uid == $memberIdx)",
            // 참가자 추가는 admin만 가능 (백엔드에서 처리)
            ".write": false
          }
        }
      }
    },
    
    "users": {
      "$memberIdx": {
        // 사용자 정보는 본인만 읽기/쓰기 가능
        ".read": "auth != null && auth.uid == $memberIdx",
        ".write": "auth != null && auth.uid == $memberIdx"
      }
    }
  }
}
```

---

## 3. 프론트엔드 Firebase SDK 설정

### 3.1 React Native (Expo) 예시

#### 패키지 설치
```bash
npm install firebase
# 또는
expo install firebase
```

#### Firebase 초기화 파일 생성 (`src/config/firebase.ts`)

```typescript
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAuth } from 'firebase/auth';

// Firebase 설정 (프로젝트 설정에서 확인)
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project-id.firebaseapp.com",
  databaseURL: "https://your-project-id-default-rtdb.asia-northeast3.firebasedatabase.app",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);

// Realtime Database 인스턴스
export const database = getDatabase(app);

// Auth 인스턴스
export const auth = getAuth(app);

export default app;
```

### 3.2 React (Web) 예시

동일한 방식으로 초기화하되, `getDatabase` 대신 `getDatabase` 사용:

```typescript
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  // ... 동일
};

const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
export const auth = getAuth(app);
```

---

## 4. 인증 연동

### 4.1 백엔드에서 커스텀 토큰 발급

사용자가 로그인하면 백엔드 API를 호출하여 Firebase 커스텀 토큰을 받습니다:

```typescript
// API 호출 예시
const getFirebaseToken = async (accessToken: string) => {
  const response = await fetch('https://your-api.com/sign/firebase-token', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });
  
  const data = await response.json();
  return data.data.customToken; // Firebase 커스텀 토큰
};
```

### 4.2 프론트엔드에서 Firebase 인증

```typescript
import { signInWithCustomToken } from 'firebase/auth';
import { auth } from './config/firebase';

const authenticateFirebase = async (accessToken: string) => {
  try {
    // 1. 백엔드에서 커스텀 토큰 받기
    const customToken = await getFirebaseToken(accessToken);
    
    // 2. Firebase에 커스텀 토큰으로 로그인
    const userCredential = await signInWithCustomToken(auth, customToken);
    const firebaseUser = userCredential.user;
    
    console.log('Firebase 인증 성공:', firebaseUser.uid);
    return firebaseUser;
  } catch (error) {
    console.error('Firebase 인증 실패:', error);
    throw error;
  }
};
```

**중요**: Firebase Auth의 `uid`는 백엔드에서 설정한 `memberIdx.toString()`과 동일합니다.

---

## 5. 실시간 메시지 송수신

### 5.1 채팅방 생성 (백엔드 API 호출)

```typescript
const createChatRoom = async (accessToken: string, roomData: {
  name: string;
  type: 'NORMAL' | 'GROUP' | 'EMERGENCY' | 'CHATBOT';
  isGroup: number;
  memberIndexes?: number[];
}) => {
  const response = await fetch('https://your-api.com/chat/rooms', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(roomData),
  });
  
  return await response.json();
};
```

### 5.2 Firebase RTDB에 채팅방 생성

백엔드에서 채팅방을 생성한 후, `chatRoomId`를 받아서 Firebase RTDB에도 채팅방을 생성합니다:

```typescript
import { ref, set, get } from 'firebase/database';
import { database } from './config/firebase';

const createFirebaseChatRoom = async (chatRoomId: string, chatRoomIdx: number, participants: number[]) => {
  const roomRef = ref(database, `chatRooms/${chatRoomId}`);
  
  const roomData = {
    id: chatRoomId,
    chatRoomIdx: chatRoomIdx,
    createdAt: Date.now(),
    status: 'active',
    participants: {},
    messages: {},
  };
  
  // 참가자 정보 추가
  participants.forEach((memberIdx) => {
    roomData.participants[memberIdx] = {
      joinedAt: Date.now(),
      lastSeen: Date.now(),
      online: 0,
      unreadCount: 0,
      visible: true,
    };
  });
  
  await set(roomRef, roomData);
};
```

### 5.3 메시지 전송

```typescript
import { ref, push, set } from 'firebase/database';
import { database, auth } from './config/firebase';

const sendMessage = async (
  chatRoomId: string,
  message: string,
  messageType: 'TEXT' | 'IMAGE' | 'FILE' | 'SYSTEM' = 'TEXT',
  attachments?: string[],
  signalType?: 'RISK' | 'RESCUE' | 'EVACUATION'
) => {
  const messagesRef = ref(database, `chatRooms/${chatRoomId}/messages`);
  const newMessageRef = push(messagesRef);
  
  const messageData = {
    id: newMessageRef.key, // Firebase가 생성한 고유 ID
    chatRoomId: chatRoomId,
    senderMemberIdx: parseInt(auth.currentUser?.uid || '0'),
    message: message,
    messageType: messageType,
    signalType: signalType || null,
    attachments: attachments || null,
    timestamp: Date.now().toString(),
    isRead: false,
  };
  
  await set(newMessageRef, messageData);
  
  // 메시지 전송 후 백엔드에 백업 요청
  await backupMessageToBackend(messageData);
  
  return messageData;
};
```

### 5.4 실시간 메시지 수신

```typescript
import { ref, onChildAdded, off } from 'firebase/database';
import { database } from './config/firebase';

const listenToMessages = (
  chatRoomId: string,
  onMessageReceived: (message: any) => void
) => {
  const messagesRef = ref(database, `chatRooms/${chatRoomId}/messages`);
  
  // 새 메시지가 추가될 때마다 호출
  const unsubscribe = onChildAdded(messagesRef, (snapshot) => {
    const message = snapshot.val();
    onMessageReceived(message);
  });
  
  // 컴포넌트 언마운트 시 리스너 제거
  return () => {
    off(messagesRef, 'child_added', unsubscribe);
  };
};

// 사용 예시 (React)
useEffect(() => {
  const unsubscribe = listenToMessages(chatRoomId, (message) => {
    setMessages((prev) => [...prev, message]);
  });
  
  return () => {
    unsubscribe();
  };
}, [chatRoomId]);
```

### 5.5 메시지 목록 조회 (초기 로드)

```typescript
import { ref, query, orderByChild, limitToLast, get } from 'firebase/database';
import { database } from './config/firebase';

const loadMessages = async (chatRoomId: string, limit: number = 50) => {
  const messagesRef = ref(database, `chatRooms/${chatRoomId}/messages`);
  const messagesQuery = query(
    messagesRef,
    orderByChild('timestamp'),
    limitToLast(limit)
  );
  
  const snapshot = await get(messagesQuery);
  const messages: any[] = [];
  
  snapshot.forEach((child) => {
    messages.push(child.val());
  });
  
  return messages.reverse(); // 최신 메시지가 마지막에 오도록
};
```

---

## 6. 백엔드 API 연동

### 6.1 채팅방 목록 조회

```typescript
const getChatRoomList = async (
  accessToken: string,
  page: number = 1,
  pageSize: number = 10
) => {
  const response = await fetch(
    `https://your-api.com/chat/rooms?page=${page}&pageSize=${pageSize}`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    }
  );
  
  return await response.json();
};
```

### 6.2 채팅방 정보 조회

```typescript
const getChatRoom = async (accessToken: string, chatRoomIdx: number) => {
  const response = await fetch(
    `https://your-api.com/chat/rooms/${chatRoomIdx}`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    }
  );
  
  return await response.json();
};
```

### 6.3 참가자 초대

```typescript
const inviteParticipants = async (
  accessToken: string,
  chatRoomIdx: number,
  memberIndexes: number[]
) => {
  const response = await fetch(
    `https://your-api.com/chat/rooms/${chatRoomIdx}/participants`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ memberIndexes }),
    }
  );
  
  return await response.json();
};
```

### 6.4 마지막 읽은 시간 업데이트

```typescript
const updateLastReadAt = async (
  accessToken: string,
  chatRoomIdx: number,
  timestamp: string
) => {
  const response = await fetch(
    `https://your-api.com/chat/rooms/${chatRoomIdx}/read`,
    {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ timestamp }),
    }
  );
  
  return await response.json();
};
```

---

## 7. 메시지 백업

Firebase RTDB에 메시지를 저장한 후, 백엔드 API를 호출하여 RDBMS에 백업합니다:

```typescript
const backupMessageToBackend = async (
  accessToken: string,
  messageData: {
    id: string;
    chatRoomId: string;
    senderMemberIdx: number;
    message: string;
    messageType: string;
    signalType?: string;
    attachments?: string[];
    timestamp: string;
  }
) => {
  try {
    const response = await fetch(
      'https://your-api.com/chat/messages/backup',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messageData),
      }
    );
    
    if (!response.ok) {
      console.error('메시지 백업 실패:', await response.text());
    }
  } catch (error) {
    console.error('메시지 백업 에러:', error);
  }
};
```

---

## 8. 데이터 구조

### 8.1 Firebase RTDB 구조

```
chatRooms/
  {chatRoomId}/
    id: "room-uuid"
    chatRoomIdx: 123
    createdAt: 1234567890
    status: "active"
    participants/
      {memberIdx}/
        joinedAt: 1234567890
        lastSeen: 1234567890
        online: 0
        unreadCount: 0
        visible: true
    messages/
      {messageId}/
        id: "message-uuid"
        chatRoomId: "room-uuid"
        senderMemberIdx: 456
        message: "안녕하세요"
        messageType: "TEXT"
        signalType: null
        attachments: null
        timestamp: "1234567890"
        isRead: false

users/
  {memberIdx}/
    memberIdx: 456
    memberId: "user123"
    memberName: "홍길동"
    memberNameOrg: "홍길동"
    memberEmail: "hong@example.com"
    memberPhone: "010-1234-5678"
    companyIdx: 789
    memberRole: "MEMBER"
    profileImage: "https://..."
    updateAt: "2024-01-01T00:00:00Z"
```

### 8.2 백엔드 RDBMS 구조

- `chatRoom`: 채팅방 메타데이터
- `chatParticipant`: 채팅방 참가자 정보
- `chatMessage`: 백업된 메시지 (Firebase RTDB → RDBMS)

---

## 9. 주의사항

1. **Firebase Auth UID**: 백엔드에서 생성한 커스텀 토큰의 `uid`는 `memberIdx.toString()`과 동일해야 합니다.

2. **메시지 백업**: Firebase RTDB에 메시지를 저장한 후 반드시 백엔드 API로 백업해야 합니다.

3. **오프라인 지원**: Firebase RTDB는 기본적으로 오프라인 캐싱을 지원하지만, 네트워크 복구 시 동기화가 필요합니다.

4. **보안**: Firebase Security Rules를 반드시 설정하여 권한이 없는 사용자의 접근을 차단해야 합니다.

5. **성능**: 메시지가 많아지면 초기 로드 시 `limitToLast`를 사용하여 최근 메시지만 조회하세요.

---

## 10. 트러블슈팅

### 10.1 Firebase 인증 실패
- 커스텀 토큰이 올바르게 생성되었는지 확인
- Firebase 프로젝트 설정에서 Authentication이 활성화되었는지 확인

### 10.2 메시지 전송 실패
- Firebase Security Rules 확인
- 채팅방 참가자 목록에 현재 사용자가 포함되어 있는지 확인

### 10.3 실시간 업데이트가 안 됨
- Firebase 리스너가 올바르게 등록되었는지 확인
- 컴포넌트 언마운트 시 리스너가 제거되었는지 확인

---

## 11. 참고 자료

- [Firebase Realtime Database 문서](https://firebase.google.com/docs/database)
- [Firebase Authentication 문서](https://firebase.google.com/docs/auth)
- [Firebase Security Rules 문서](https://firebase.google.com/docs/database/security)

