## Minimal TypeScript v7.3.0 — Starter (Vite + React 19 + TS)

이 리포지토리는 Minimal UI Starter 템플릿(Vite, React 19, TypeScript)입니다. 대시보드/인증/레이아웃/테마/라우팅 구조가 준비되어 있어 바로 기능을 추가할 수 있습니다.

## 환경 변수(.env)

다음 키를 필요에 따라 설정합니다. 루트에 `.env` 파일을 만들고 값을 채우세요.

```env
# API 베이스 URL (axios baseURL)
VITE_SERVER_URL=https://api-dev-minimal-7.vercel.app

# 정적 자산(퍼블릭 CDN 등) 경로 prefix (선택)
VITE_ASSETS_DIR=""

# 인증/서드파티 키 (필요 시)
VITE_MAPBOX_API_KEY=

# Firebase (선택)
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APPID=
VITE_FIREBASE_MEASUREMENT_ID=

# Amplify (선택)
VITE_AWS_AMPLIFY_USER_POOL_ID=
VITE_AWS_AMPLIFY_USER_POOL_WEB_CLIENT_ID=
VITE_AWS_AMPLIFY_REGION=

# Auth0 (선택)
VITE_AUTH0_CLIENT_ID=
VITE_AUTH0_DOMAIN=
VITE_AUTH0_CALLBACK_URL=

# Supabase (선택)
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

> 참고: 샘플/데모 데이터는 기본적으로 `VITE_SERVER_URL`을 통해 제공됩니다. 별도 목서버를 쓰려면 아래 "Mock Server" 참고.

## 프로젝트 구조 개요

- `src/main.tsx`: 라우터 생성 및 루트 렌더링
- `src/app.tsx`: 전역 Provider(Theme, Settings, Auth) 및 전역 UX(ProgressBar 등)
- `src/routes/sections/*`: React Router v7 라우트 정의(인증/대시보드 섹션)
- `src/pages/*`: 실제 화면 페이지 컴포넌트
- `src/layouts/*`: 레이아웃 컴포넌트(대시보드/심플/인증 분할 등)
- `src/theme/*`: MUI 테마 설정, 오버라이드, 타입 확장
- `src/auth/*`: 인증 컨텍스트/가드/JWT 유틸
- `src/lib/axios.ts`: axios 인스턴스와 API 엔드포인트 정의
- `public/*`: 정적 자산(아이콘, 이미지, 폰트 등)

## 라우팅(React Router v7)

- 루트 라우터는 `src/main.tsx`에서 `createBrowserRouter`로 생성합니다.
- 실제 섹션은 `src/routes/sections/index.tsx`에서 합쳐집니다.
  - `/` 접속 시 `CONFIG.auth.redirectPath`로 리다이렉트
  - `/auth/*`: 인증 라우트(게스트 전용)
  - `/dashboard/*`: 대시보드 라우트(인증 보호)

새 페이지 추가 예시(대시보드 하위):

1. 페이지 파일 생성: `src/pages/dashboard/seven.tsx`
2. 라우트 등록: `src/routes/sections/dashboard.tsx`

```tsx
// children에 추가
{ path: 'seven', element: <PageSeven /> }
```

3. 네비게이션 노출(선택): `src/layouts/nav-config-dashboard.tsx`에 항목 추가

## 인증(JWT) 토글/연동

- 전역 설정: `src/global-config.ts`의 `CONFIG.auth`
  - `method`: 'jwt' 등 방식 지정
  - `skip`: true로 설정 시 라우트 가드를 비활성화(로그인 없이 접근)
  - `redirectPath`: 루트 접속 시 리다이렉트되는 경로
- JWT Provider: `src/auth/context/jwt/auth-provider.tsx`
  - 세션 토큰을 `sessionStorage`(키: `JWT_STORAGE_KEY`)로 관리
  - 유효 토큰이면 `/api/auth/me`로 사용자 정보 확인 후 컨텍스트에 저장
- 가드
  - `AuthGuard`: 인증 필요 구간 보호
  - `GuestGuard`: 비인증 사용자만 접근 허용(로그인/회원가입)

로그인/회원가입 화면은 `src/pages/auth/jwt/*`에서 제공됩니다.

## 데이터 통신(axios)

- 인스턴스: `src/lib/axios.ts`
  - `baseURL`은 `CONFIG.serverUrl`(.env의 `VITE_SERVER_URL`)을 사용
  - 공통 에러 로깅 및 `fetcher` 헬퍼 제공
- 엔드포인트: `endpoints` 상수에 경로가 정리되어 있습니다.
  - 예: `endpoints.auth.signIn`, `endpoints.post.list` 등

## 테마/스타일(MUI + Emotion)

- 테마 루트: `src/theme/theme-provider.tsx`
- 설정: `src/theme/theme-config.ts`, `src/theme/theme-overrides.ts`
- 클래스/유틸: `src/theme/create-classes.ts`, `src/theme/core/*`
- 전역 CSS: `src/global.css`

테마 모드/설정 패널:

- `src/components/settings`의 `SettingsProvider`와 `SettingsDrawer`로 바로 런타임에서 테마/레이아웃 옵션을 조절할 수 있습니다.

## 레이아웃

- 대시보드 레이아웃: `src/layouts/dashboard`
- 심플 레이아웃: `src/layouts/simple`
- 인증 분할 레이아웃: `src/layouts/auth-split`

새 레이아웃을 만들려면 `src/layouts/your-layout`을 만들고, 해당 라우트에서 감싸면 됩니다.

## 아이콘/일러스트/에셋

- 런타임 SVG/TSX 아이콘: `src/assets/icons/*`
- 일러스트(React 컴포넌트): `src/assets/illustrations/*`
- 정적 파일: `public/assets/*`, `public/fonts/*`, `public/logo/*`

## Mock Server

기본 데모 데이터: `https://api-dev-minimal-[version].vercel.app`

로컬 목서버 설정:

- 가이드: https://docs.minimals.cc/mock-server
- 리소스 다운로드: https://www.dropbox.com/scl/fo/bopqsyaatc8fbquswxwww/AKgu6V6ZGmxtu22MuzsL5L4?rlkey=8s55vnilwz2d8nsrcmdo2a6ci&dl=0

> `.env` 파일도 함께 복사해야 합니다. 환경 변수 누락 시 앱이 정상 동작하지 않을 수 있습니다.

## 자주 하는 수정 시나리오

- 인증 없이 개발하고 싶어요

  - `src/global-config.ts`에서 `auth.skip = true`로 변경

- 초기 진입 경로를 바꾸고 싶어요

  - `CONFIG.auth.redirectPath`를 원하는 경로로 변경(`/dashboard` 등)

- API 서버 주소를 바꾸고 싶어요

  - `.env`의 `VITE_SERVER_URL` 수정 → 재시작

- 새 페이지/메뉴를 추가하고 싶어요

  - `src/pages`에 파일 추가 → `src/routes/sections/*`에 라우트 등록 → 필요 시 `src/layouts/nav-config-*.tsx`에 메뉴 추가

- 테마/폰트를 커스터마이즈하고 싶어요
  - `src/theme/*`와 `src/components/settings`를 확인해 오버라이드/설정 패널 적용

## 배포

정적 빌드 산출물은 `dist/`에 생성됩니다. Vercel/Netlify/Static 호스팅에서 루트로 서빙하고, SPA 라우팅 규칙(모든 경로를 `index.html`로 리라이트)을 설정하세요.

## 트러블슈팅

- 타입 오류/린트 오류가 있어요
  - `yarn tsc:dev`, `yarn lint:fix`, `yarn fm:fix`를 순서대로 실행하세요.
- 라우팅이 404로 떨어져요(서버 배포)
  - SPA 재작성 규칙을 배포 서비스에 설정하세요.
- 이미지/아이콘 경로가 깨져요
  - `VITE_ASSETS_DIR` 사용 시 프리픽스가 올바른지 확인하세요.

---

## 참고

- 전체 버전(풀 템플릿)에서 컴포넌트를 복사해 사용할 수 있습니다. 의존성 버전 호환을 맞춰주세요.
