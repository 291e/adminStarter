# Chat Service

채팅 API 서비스

## API 목록

### 1. 채팅방 목록 조회
- **함수**: `getChatRooms`
- **메서드**: GET
- **엔드포인트**: `/api/chat/rooms`
- **설명**: 사용자가 참여한 채팅방 목록을 조회합니다.

### 2. 메시지 목록 조회
- **함수**: `getMessages`
- **메서드**: GET
- **엔드포인트**: `/api/chat/rooms/:roomId/messages`
- **설명**: 특정 채팅방의 메시지 목록을 조회합니다.

### 3. 참가자 목록 조회
- **함수**: `getParticipants`
- **메서드**: GET
- **엔드포인트**: `/api/chat/rooms/:roomId/participants`
- **설명**: 특정 채팅방의 참가자 목록을 조회합니다.

### 4. 메시지 전송
- **함수**: `sendMessage`
- **메서드**: POST
- **엔드포인트**: `/api/chat/rooms/:roomId/messages`
- **설명**: 채팅방에 메시지를 전송합니다.

### 5. 참가자 초대
- **함수**: `inviteParticipants`
- **메서드**: POST
- **엔드포인트**: `/api/chat/rooms/:roomId/participants/invite`
- **설명**: 채팅방에 참가자를 초대합니다.

### 6. 참가자 내보내기
- **함수**: `removeParticipants`
- **메서드**: DELETE
- **엔드포인트**: `/api/chat/rooms/:roomId/participants`
- **설명**: 채팅방에서 참가자를 내보냅니다.

### 7. 응급 통계 조회
- **함수**: `getEmergencyStats`
- **메서드**: GET
- **엔드포인트**: `/api/chat/rooms/:roomId/emergency-stats`
- **설명**: 응급 채팅방의 통계 정보를 조회합니다.

### 8. 첨부 파일 목록 조회
- **함수**: `getAttachments`
- **메서드**: GET
- **엔드포인트**: `/api/chat/rooms/:roomId/attachments`
- **설명**: 특정 채팅방의 첨부 파일 목록을 조회합니다.

### 9. 이미지 파일 업로드
- **함수**: `uploadImage`
- **메서드**: POST
- **엔드포인트**: `/api/chat/upload/image`
- **설명**: 채팅에 이미지 파일을 업로드합니다.

### 10. 음성 파일 업로드
- **함수**: `uploadVoice`
- **메서드**: POST
- **엔드포인트**: `/api/chat/upload/voice`
- **설명**: 채팅에 음성 파일을 업로드합니다.

