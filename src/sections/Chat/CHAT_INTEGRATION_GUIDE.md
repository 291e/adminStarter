# Firebase 인증 및 권한 설정 가이드

## 🔐 Firebase Custom Token 인증 (필수)

네이티브 앱에서 Firebase Realtime Database에 접근하려면 **반드시 Firebase 인증**이 필요합니다. 인증 없이는 `permission-denied` 에러가 발생합니다.

---

## 1. 웹 앱에서의 처리 방식

웹 앱에서는 로그인 시 백엔드에서 받은 `firebaseToken`을 사용하여 자동으로 Firebase 인증을 수행합니다:

```typescript
// src/auth/context/jwt/action.ts
import { signInWithCustomToken } from 'firebase/auth';
import { auth } from 'src/config/firebase';

// 로그인 응답에서 firebaseToken 추출
const firebaseToken = res.body?.data?.firebaseToken;

if (firebaseToken) {
  await setPersistence(auth, browserLocalPersistence);
  await signInWithCustomToken(auth, firebaseToken);
}
```

**중요**: Firebase Custom Token의 `uid`는 `memberIdx.toString()`입니다.

---

## 2. 네이티브 앱에서의 처리 방식

네이티브 앱에서도 동일하게 로그인 후 Firebase 인증을 수행해야 합니다.

### iOS (Swift)

```swift
import FirebaseAuth

func authenticateFirebase(firebaseToken: String) async throws {
    let auth = Auth.auth()
    let credential = try await auth.signIn(withCustomToken: firebaseToken)
    print("Firebase 인증 성공: \(credential.user.uid)")
}
```

### Android (Kotlin)

```kotlin
import com.google.firebase.auth.FirebaseAuth

suspend fun authenticateFirebase(firebaseToken: String) {
    val auth = FirebaseAuth.getInstance()
    val result = auth.signInWithCustomToken(firebaseToken).await()
    println("Firebase 인증 성공: ${result.user?.uid}")
}
```

### React Native

```typescript
import auth from '@react-native-firebase/auth';

const authenticateFirebase = async (firebaseToken: string) => {
  try {
    const userCredential = await auth().signInWithCustomToken(firebaseToken);
    console.log('Firebase 인증 성공:', userCredential.user.uid);
  } catch (error) {
    console.error('Firebase 인증 실패:', error);
    throw error;
  }
};
```

---

## 3. 로그인 플로우 (네이티브)

### iOS (Swift)

```swift
func login(email: String, password: String) async throws {
    // 1. 백엔드 로그인 API 호출
    let loginResponse = try await callLoginAPI(email: email, password: password)

    // 2. JWT 토큰 저장
    UserDefaults.standard.set(loginResponse.accessToken, forKey: "accessToken")

    // 3. Firebase Custom Token으로 인증 (필수!)
    if let firebaseToken = loginResponse.firebaseToken {
        try await authenticateFirebase(firebaseToken: firebaseToken)
    } else {
        throw NSError(domain: "FirebaseTokenMissing", code: -1)
    }
}
```

### Android (Kotlin)

```kotlin
suspend fun login(email: String, password: String) {
    // 1. 백엔드 로그인 API 호출
    val loginResponse = callLoginAPI(email, password)

    // 2. JWT 토큰 저장
    saveToken(loginResponse.accessToken)

    // 3. Firebase Custom Token으로 인증 (필수!)
    loginResponse.firebaseToken?.let { token ->
        authenticateFirebase(token)
    } ?: throw Exception("Firebase token missing")
}
```

### 로그인 응답 구조

```typescript
{
  header: { isSuccess: true, ... },
  accessToken: "jwt-token-for-api",      // 백엔드 API 호출용
  refreshToken: "jwt-refresh-token",     // 토큰 갱신용
  firebaseToken: "firebase-custom-token", // Firebase 인증용 (필수!)
  member: { memberIdx: 1, ... }
}
```

---

## 4. Firebase Database 규칙

### 기본 규칙 (개발용)

```json
{
  "rules": {
    "chatRooms": {
      "$chatRoomId": {
        "messages": {
          "$messageId": {
            ".read": "auth != null",
            ".write": "auth != null &&
                       (!data.exists() ||
                        data.child('senderMemberIdx').val() == auth.uid)",
            ".validate": "newData.hasChildren(['id', 'chatRoomId', 'senderMemberIdx', 'message', 'timestamp'])"
          }
        }
      }
    }
  }
}
```

### 프로덕션 규칙 (권장)

```json
{
  "rules": {
    "chatRooms": {
      "$chatRoomId": {
        // 채팅방 접근 권한: 참가자만 읽기/쓰기 가능
        ".read": "auth != null &&
                   (root.child('chatRooms').child($chatRoomId).child('participants').child(auth.uid).exists() ||
                    root.child('chatRooms').child($chatRoomId).child('participants').child('chatbot').exists())",
        ".write": "auth != null &&
                   (root.child('chatRooms').child($chatRoomId).child('participants').child(auth.uid).exists() ||
                    root.child('chatRooms').child($chatRoomId).child('participants').child('chatbot').exists())",

        "messages": {
          "$messageId": {
            // 메시지는 참가자만 읽기 가능
            ".read": "auth != null &&
                       (root.child('chatRooms').child($chatRoomId).child('participants').child(auth.uid).exists() ||
                        root.child('chatRooms').child($chatRoomId).child('participants').child('chatbot').exists())",
            // 메시지 작성은 본인만 가능 (senderMemberIdx == auth.uid)
            ".write": "auth != null &&
                       (newData.child('senderMemberIdx').val() == auth.uid ||
                        auth.uid == 'chatbot')",
            ".validate": "newData.hasChildren(['id', 'chatRoomId', 'senderMemberIdx', 'message', 'messageType', 'timestamp'])"
          }
        },

        "participants": {
          "$memberIdx": {
            // 참가자 정보는 참가자만 읽기 가능
            ".read": "auth != null &&
                       (root.child('chatRooms').child($chatRoomId).child('participants').child(auth.uid).exists() ||
                        auth.uid == $memberIdx)",
            // 참가자 추가는 백엔드에서만 처리
            ".write": false
          }
        }
      }
    }
  }
}
```

---

## 5. 중요 주의사항

### 1. `auth.uid`는 `memberIdx.toString()`

백엔드에서 Custom Token 생성 시 `uid`를 `memberIdx.toString()`으로 설정하므로, Database Rules에서도 `auth.uid`를 사용합니다.

```typescript
// 백엔드에서 Custom Token 생성 예시
const firebaseToken = await admin.auth().createCustomToken(String(member.memberIdx), {
  role: member.memberRole,
  companyIdx: member.companyIdx,
});
```

### 2. `senderMemberIdx` 타입

Firebase Database에 저장할 때 `senderMemberIdx`를 **문자열로 저장**해야 `auth.uid`와 비교가 가능합니다:

```typescript
// ❌ 잘못된 예시 (숫자)
const messageData = {
  senderMemberIdx: memberIdx, // 숫자
  // ...
};

// ✅ 올바른 예시 (문자열)
const messageData = {
  senderMemberIdx: String(memberIdx), // 문자열로 저장
  // ...
};
```

**네이티브 앱 예시**:

```swift
// iOS (Swift)
let messageData: [String: Any] = [
    "senderMemberIdx": String(memberIdx), // 문자열로 저장
    // ...
]
```

```kotlin
// Android (Kotlin)
val messageData = mapOf(
    "senderMemberIdx" to memberIdx.toString(), // 문자열로 저장
    // ...
)
```

### 3. 참가자 목록 관리

프로덕션 규칙에서는 `chatRooms/{chatRoomId}/participants/{memberIdx}` 경로에 참가자 정보가 있어야 합니다. 백엔드에서 채팅방 생성 시 Firebase에도 참가자 정보를 추가해야 합니다.

### 4. 인증 토큰 갱신

JWT 토큰 만료 시 자동 갱신 로직이 필요합니다. Firebase Custom Token도 함께 갱신해야 할 수 있습니다.

---

## 6. 에러 해결

### `permission-denied` 에러 발생 시

1. **Firebase 인증 확인**: 로그인 후 `signInWithCustomToken`이 호출되었는지 확인
2. **토큰 확인**: `firebaseToken`이 로그인 응답에 포함되어 있는지 확인
3. **Database Rules 확인**: Firebase Console에서 규칙이 올바르게 설정되었는지 확인
4. **`senderMemberIdx` 타입 확인**: 문자열로 저장되었는지 확인

### 디버깅 방법

```typescript
// Firebase 인증 상태 확인
import { auth } from 'firebase/auth';

console.log('Firebase 인증 상태:', auth.currentUser);
console.log('Firebase UID:', auth.currentUser?.uid);
```

```swift
// iOS
let user = Auth.auth().currentUser
print("Firebase UID: \(user?.uid ?? "nil")")
```

```kotlin
// Android
val user = FirebaseAuth.getInstance().currentUser
println("Firebase UID: ${user?.uid}")
```

---

## 📚 참고 파일

- **Firebase 설정**: `src/config/firebase.ts`
- **로그인 액션**: `src/auth/context/jwt/action.ts`
- **채팅방 Firebase 훅**: `src/sections/Chat/hooks/use-chat-room-firebase.ts`











