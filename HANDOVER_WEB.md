# 웹 인수인계 문서

## 1. 개요
- 저장소: `adminStarter`
- 용도: 관리자 웹
- 주요 기술:
  - React 19
  - TypeScript
  - Vite
  - MUI
  - React Query
  - Firebase Auth / Firestore
  - Axios

이 웹은 관리자용 채팅, 문서, 대시보드, 조직/결제 관리, VOD 관리 기능을 담당합니다.

## 2. 실행 / 빌드

### 주요 명령어
```bash
yarn install
yarn dev
yarn build
yarn lint
```

### 참고
- `yarn build`는 통과하지만 기존 warning이 다수 남아 있음
- 현재 기준 빌드는 통과, warning은 구조적 기존 이슈로 분리 관리 필요

## 3. 핵심 디렉터리
- `src/sections/Chat`
  - 관리자 채팅 UI
- `src/services/chat2`
  - chat2 API 연동
- `src/sections/DashBoard`
  - 대시보드 카드, 공유문서, 서명 대기 문서
- `src/sections/PDF`
  - 안전보건체계관리 문서
- `src/auth/context/jwt`
  - 토큰 저장 및 세션 처리
- `src/lib/axios.ts`
  - API 공통 인터셉터, refresh token 처리

## 4. 디렉터리별 기능 / 수정 가이드

### 프로젝트 루트

#### `public`
- 기능:
  - 정적 이미지, favicon, 브라우저 공개 자산
- 수정 방법:
  - 브랜딩 리소스 변경 시 사용

#### `src`
- 기능:
  - 실제 관리자 웹 소스 전체
- 수정 방법:
  - 기능 변경은 대부분 `sections + services + routes`를 같이 확인

#### `dist`
- 기능:
  - 빌드 산출물
- 수정 방법:
  - 직접 수정하지 않음

#### `node_modules`
- 기능:
  - 패키지 의존성
- 수정 방법:
  - 직접 수정하지 않음

#### `.agent`, `.agents`, `.cursor`
- 기능:
  - 로컬 개발용 에이전트/에디터 설정
- 수정 방법:
  - 제품 기능 수정과 직접 관련 없음

### `src` 하위 공통 디렉터리

#### `src/_mock`
- 기능:
  - 로컬 목업 데이터, 데모용 임시 데이터
- 수정 방법:
  - 실제 API와 헷갈리지 않도록 테스트/스토리 전용으로만 사용

#### `src/assets`
- 기능:
  - 이미지, 아이콘, 폰트 등 프론트 자산
- 수정 방법:
  - 브랜딩/UI 리소스 수정 시 사용

#### `src/auth`
- 기능:
  - 로그인, 권한, JWT 세션 컨텍스트
- 수정 방법:
  - 로그인/세션/새로고침 후 로그아웃 문제는 여기부터 확인

#### `src/components`
- 기능:
  - 프로젝트 공용 UI 컴포넌트
- 수정 방법:
  - 여러 섹션에서 공통으로 쓰는 버튼/모달/테이블은 여기 수정

#### `src/config`
- 기능:
  - 환경변수, 앱 설정, 서버 URL, 메뉴 상수
- 수정 방법:
  - 배포 환경 URL, 글로벌 설정 변경 시 우선 확인

#### `src/layouts`
- 기능:
  - 관리자 페이지 레이아웃, 사이드바, 헤더, 공통 프레임
- 수정 방법:
  - 전체 화면 구조가 바뀌면 여기부터 수정

#### `src/lib`
- 기능:
  - axios, firebase, 공통 client 초기화
- 수정 방법:
  - 네트워크/실시간 연결/공통 클라이언트 이슈는 여기 확인

#### `src/pages`
- 기능:
  - 페이지 엔트리 파일
- 수정 방법:
  - 새 메뉴/새 페이지 추가 시 `routes`와 함께 수정

#### `src/routes`
- 기능:
  - 라우터 정의, 권한별 라우트, 메뉴 진입 경로
- 수정 방법:
  - 페이지 이동 문제, 메뉴 추가 시 필수 확인

#### `src/sections`
- 기능:
  - 업무 도메인별 실제 화면 구현
- 수정 방법:
  - 기능 수정은 대부분 해당 `sections/*`와 연결된 `services/*`를 같이 본다

#### `src/services`
- 기능:
  - 백엔드 API 호출, 타입 정의, 서비스 계층
- 수정 방법:
  - 계약 mismatch, 응답 파싱 문제는 UI보다 먼저 여기 확인

#### `src/theme`
- 기능:
  - MUI 테마, 팔레트, 타이포, 글로벌 스타일
- 수정 방법:
  - 공통 색상/폰트/spacing 변경 시 사용

#### `src/utils`
- 기능:
  - 날짜/문자열/파일/공통 헬퍼 함수
- 수정 방법:
  - 포맷팅, 변환 로직 중복 발생 시 우선 이 디렉터리 검토

### `src/sections` 상세

#### `src/sections/AdminDashBoard`
- 기능:
  - 관리자 전용 대시보드 화면
- 수정 방법:
  - 운영 지표/요약 카드 변경 시 사용

#### `src/sections/ApiSetting`
- 기능:
  - API 설정 관리 화면

#### `src/sections/Board`
- 기능:
  - 게시판/공지/콘텐츠 관리 화면

#### `src/sections/ChackList`
- 기능:
  - 체크리스트 관리 화면

#### `src/sections/Chat`
- 기능:
  - 좌측 방 목록
  - 중앙 메시지
  - 우측 참가자/첨부 정보
  - 답글, 삭제, 제목 수정, 참가자 내보내기
- 수정 방법:
  - 채팅 메인 흐름은 `view.tsx`가 진입점
  - 메시지 버블/답글/삭제는 `components/ui`
  - 방 목록 미리보기는 `LeftSection`
- 먼저 볼 파일:
  - `src/sections/Chat/view.tsx`
  - `src/sections/Chat/components/ui/MessageList.tsx`
  - `src/sections/Chat/components/ui/MessageBubble.tsx`
  - `src/sections/Chat/components/LeftSection/ChatRoomItem.tsx`

#### `src/sections/CodeSetting`
- 기능:
  - 코드/분류 기준값 설정 화면

#### `src/sections/DashBoard`
- 기능:
  - 서명 대기 문서 카드
  - 공유문서 카드
  - 대시보드 표/목록
- 수정 방법:
  - 등록일/요청일/시간대 문제는 이 디렉터리부터 확인
  - 카드 표현과 데이터 가공이 함께 있어 API 타입도 같이 보는 편이 안전
- 먼저 볼 파일:
  - `src/sections/DashBoard/components/PendingSignaturesCard.tsx`
  - `src/sections/DashBoard/components/SharedDocumentsCard.tsx`
  - `src/sections/DashBoard/SharedDocument/components/Table.tsx`

#### `src/sections/DocumentSetting`
- 기능:
  - 문서 설정/템플릿 관련 화면

#### `src/sections/EducationReport`
- 기능:
  - 교육 이수/교육 리포트 화면

#### `src/sections/Inquiries`
- 기능:
  - 문의/고객 요청 관리 화면

#### `src/sections/LibraryReport`
- 기능:
  - 라이브러리/자료 리포트 화면

#### `src/sections/Notification`
- 기능:
  - 관리자 알림 목록/읽음 처리 UI

#### `src/sections/Operation`
- 기능:
  - 운영 관리 화면

#### `src/sections/Organization`
- 기능:
  - 조직/사업장 관리, 구독/결제 관련 UI

#### `src/sections/PDF`
- 기능:
  - 안전보건체계관리 문서 작성/수정/상세
  - TBM, 교육, 결재, 서명
- 수정 방법:
  - 작성 화면은 `create`
  - 수정 화면은 `edit`
  - 상세/출력은 `[risk_id]`
  - 한 문서 타입을 수정할 때는 `view`, `tables`, `types`를 같이 확인
- 먼저 볼 파일:
  - `src/sections/PDF/Risk_2200/create/view.tsx`
  - `src/sections/PDF/Risk_2200/edit/view.tsx`
  - `src/sections/PDF/Risk_2200/[risk_id]/view.tsx`

#### `src/sections/SafetyReport`
- 기능:
  - 안전 리포트/통계 화면

#### `src/sections/SafetySystem`
- 기능:
  - 안전보건체계관리 중심 화면

#### `src/sections/Sales`
- 기능:
  - 영업/매출 관련 화면

#### `src/sections/ServiceSetting`
- 기능:
  - 서비스 설정 화면

#### `src/sections/VOD`
- 기능:
  - VOD 업로드/목록/상세/관리 화면

#### `src/sections/blank`, `src/sections/error`
- 기능:
  - 공백 페이지, 에러 페이지

### `src/services` 상세

#### `src/services/chat2`
- 기능:
  - chat2 REST API 타입/호출
  - 방 생성, 제목 수정, 읽음, 참가자 내보내기, 메시지 삭제
- 수정 방법:
  - 서버 API가 바뀌면 여기부터 타입과 호출을 수정
  - 화면 에러보다 계약 mismatch일 때 가장 먼저 보는 위치
- 먼저 볼 파일:
  - `src/services/chat2/chat2.service.ts`
  - `src/services/chat2/chat2.types.ts`

#### `src/services/chat`
- 기능:
  - 구형 채팅 또는 레거시 채팅 API 계층
- 수정 방법:
  - `chat2`와 혼동하지 않도록 신규 기능은 우선 `chat2` 사용 여부 확인

#### `src/services/notification`, `src/services/notifications`
- 기능:
  - 알림 API, 알림 타입 매핑, 알림 목록 데이터 처리

#### `src/services/safety-system`
- 기능:
  - 문서/결재/서명/교육 관련 API 타입과 호출

#### `src/services/risk-2200`
- 기능:
  - Risk 2200 문서 전용 API 계층

#### `src/services/payment`
- 기능:
  - 요금제, 구독, 결제 관련 API

#### `src/services/sign`
- 기능:
  - 로그인/회원가입/세션 관련 API

#### `src/services/system`
- 기능:
  - 공통 업로드/시스템 설정 API

#### `src/services/vod`
- 기능:
  - VOD 업로드, 조회, 자막/description 관련 API

#### `src/services/organization`
- 기능:
  - 조직/사업장 조회 및 수정 API

#### `src/services/member`
- 기능:
  - 회원 관련 API

#### `src/services/dashboard`
- 기능:
  - 대시보드 데이터 API

#### `src/services/admin-dashboard`
- 기능:
  - 관리자 요약 지표 API

#### `src/services/api-setting`, `board`, `checklist`, `code-setting`, `education-report`, `library-report`, `operation`, `service-setting`
- 기능:
  - 각 업무 섹션별 전용 API 계층
- 수정 방법:
  - 화면명과 동일한 서비스 디렉터리를 1차 대응 위치로 보면 됨

### 인증/공통 클라이언트

#### `src/auth/context/jwt`
- 기능:
  - access/refresh token 저장
  - 로그인 상태 복원
  - 자동 refresh
- 수정 방법:
  - 로그인 직후 문제는 `action.ts`
  - 새로고침 후 세션 만료 문제는 `auth-provider.tsx`, `storage.ts`
- 먼저 볼 파일:
  - `src/auth/context/jwt/action.ts`
  - `src/auth/context/jwt/auth-provider.tsx`
  - `src/auth/context/jwt/storage.ts`

#### `src/lib/axios.ts`
- 기능:
  - 공통 Axios 인스턴스
  - refresh token 재시도
  - BaseResponseDto 평탄화
- 수정 방법:
  - API 응답 모양이 이상하거나 200인데 실패 처리되는 경우 여기 인터셉터 확인

## 5. 수정 작업 권장 순서

### 채팅 수정
1. `src/sections/Chat/view.tsx`에서 데이터 흐름 확인
2. `src/services/chat2`에서 API 타입/호출 확인
3. 메시지 표시 문제는 `components/ui`
4. 방 목록 미리보기 문제는 `LeftSection`

### 문서/대시보드 수정
1. `src/sections/DashBoard` 카드 컴포넌트 확인
2. 상세/작성/수정이면 `src/sections/PDF`로 이동
3. 날짜 포맷 문제는 `src/utils/format-time` 사용 여부 먼저 확인

### 인증 수정
1. `src/lib/axios.ts`
2. `src/auth/context/jwt`

## 6. 최근 중요 변경 사항

### 채팅
- 답글 기능 추가
- 관리자도 채팅방 제목 수정 / 참여자 내보내기 가능하도록 API 연동
- 메시지 삭제 UI 추가
- 삭제 메시지 문구와 방 목록 미리보기 현지화
- 앱이 보낸 메시지와 웹이 보낸 메시지가 같은 `replyTo` 구조를 사용하도록 정리

관련 파일:
- `src/sections/Chat/view.tsx`
- `src/sections/Chat/components/ui/MessageList.tsx`
- `src/sections/Chat/components/ui/MessageBubble.tsx`
- `src/sections/Chat/components/LeftSection/ChatRoomItem.tsx`
- `src/services/chat2/chat2.service.ts`
- `src/services/chat2/chat2.types.ts`

### 인증
- access token 만료 시 refresh token으로 자동 갱신

관련 파일:
- `src/lib/axios.ts`
- `src/auth/context/jwt/storage.ts`
- `src/auth/context/jwt/auth-provider.tsx`
- `src/auth/context/jwt/action.ts`

### 대시보드 시간대 표시
- 등록일/요청일을 UTC 문자열이 아닌 브라우저 로컬 시간대로 포맷

관련 파일:
- `src/sections/DashBoard/components/PendingSignaturesCard.tsx`
- `src/sections/DashBoard/components/SharedDocumentsCard.tsx`
- `src/sections/DashBoard/SharedDocument/components/Table.tsx`

## 7. 현재 운영 관점 주의 사항

### 채팅
- 메시지 읽기는 Firestore 실시간 구독 기반
- 메시지 생성은 `chat2/messages` API 우선
- 채팅 이미지/동영상은 과거 데이터 경로 이슈가 남아 있을 수 있음

### 삭제 메시지
- 현재는 본인 메시지, 24시간 이내만 삭제 가능
- UI는 이 조건일 때만 삭제 버튼 노출

### 빌드 warning
- 전체 warning이 많음
- 이번 인수인계 시점에는 기능 오류와 별개로 보고, 추후 정리 필요

## 8. 미해결 / 후속 작업
- 응급신고 주소/기관명 번역은 QA 실패 상태
- 채팅 백업 기능 미구현
- 결제 알림 QA 미완료
- 웹에서 모든 날짜 필드가 일관되게 포맷되는지 추가 점검 필요

## 9. 확인 추천 순서
1. 로그인 / 세션 만료 후 자동 갱신
2. 채팅방 생성 / 제목 수정 / 참여자 내보내기
3. 답글 / 메시지 삭제 / 삭제 메시지 다국어
4. 대시보드 등록일/요청일 시간대
5. 문서/공유문서 상세 확인

## 10. 최종 검증 명령
```bash
yarn build
yarn lint
```
