# VOD Service

VOD (Video On Demand) API 서비스

## API 목록

### 1. 비디오 업로드 및 STT/번역 처리
- **함수**: `uploadVod`
- **메서드**: POST
- **엔드포인트**: `/vods`
- **설명**: 비디오 파일을 업로드하고 STT(Speech-to-Text) 및 번역 처리를 시작합니다.

### 2. VOD 상세 조회
- **함수**: `getVodDetail`
- **메서드**: GET
- **엔드포인트**: `/vods/{vodIdx}`
- **설명**: VOD의 상세 정보(메타데이터 및 VTT 경로)를 조회합니다.

### 3. VOD 처리 상태 폴링
- **함수**: `getVodStatus`
- **메서드**: GET
- **엔드포인트**: `/vods/{vodIdx}/status`
- **설명**: VOD 처리 상태를 조회합니다. 주기적으로 호출하여 진행 상황을 확인할 수 있습니다.

### 4. 비디오 스트리밍 URL
- **함수**: `getVodVideoUrl`
- **메서드**: GET
- **엔드포인트**: `/vods/{vodIdx}/video`
- **설명**: 비디오 스트리밍 URL을 반환합니다.

### 5. 언어별 VTT 파일 다운로드 URL
- **함수**: `getVodVttUrl`
- **메서드**: GET
- **엔드포인트**: `/vods/{vodIdx}/vtt/{lang}`
- **설명**: 특정 언어의 VTT 자막 파일 다운로드 URL을 반환합니다.

## 사용 예시

### React Hook 사용

```typescript
import { useUploadVod, useVodDetail, useVodStatus } from 'src/sections/VOD/hooks/use-vod-api';

// VOD 업로드
const uploadMutation = useUploadVod();
const handleUpload = (file: File) => {
  uploadMutation.mutate({
    video: file,
    targetLanguages: ['en', 'vi', 'uk'],
  });
};

// VOD 상세 조회
const { data: vodDetail } = useVodDetail(vodIdx, true);

// VOD 상태 폴링 (3초마다)
const { data: status } = useVodStatus(vodIdx, {
  enabled: true,
  refetchInterval: 3000,
});
```

## 타입 정의

- `VodStatus`: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
- `VodProcessStep`: 'QUEUED' | 'EXTRACTING_AUDIO' | 'TRANSCRIBING' | 'TRANSLATING' | 'COMPLETED'
- `VodDetail`: VOD 상세 정보 타입
- `UploadVodParams`: 업로드 파라미터 타입














