import { useState, useMemo, useRef } from 'react';

import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';

import { CONFIG } from 'src/global-config';

// ----------------------------------------------------------------------

type Props = {
  vodIdx: number;
  videoUrl: string;
  availableLanguages?: string[];
  vttMap?: Record<string, string>; // VTT 파일 경로 맵 (언어 코드 -> 경로)
  defaultLanguage?: string; // 사용자 언어 (memberLang)에 따른 자동 자막 선택
  onEnded?: () => void;
  serverUrl?: string;
};

const LANGUAGE_LABELS: Record<string, string> = {
  ko: '한국어',
  en: 'English',
  vi: 'Tiếng Việt',
  uk: 'Українська',
  zh: '中文',
  ja: '日本語',
  th: 'ไทย',
  id: 'Bahasa Indonesia',
  my: 'မြန်မာ',
  ne: 'नेपाली',
  ru: 'Русский',
};

export default function VideoPlayer({
  vodIdx,
  videoUrl,
  availableLanguages = [],
  vttMap,
  defaultLanguage,
  onEnded,
  serverUrl,
}: Props) {
  // 🐛 디버깅: VideoPlayer props 확인
  console.log('🎥 [VideoPlayer] Props 수신:', {
    vodIdx,
    videoUrl,
    availableLanguages,
    vttMap,
    defaultLanguage,
    serverUrl,
  });

  // 자막 언어 초기값 결정: defaultLanguage → 'ko' → 첫 번째 가용 언어
  const getInitialLanguage = () => {
    if (defaultLanguage && availableLanguages.includes(defaultLanguage)) {
      return defaultLanguage;
    }
    if (availableLanguages.includes('ko')) {
      return 'ko';
    }
    return availableLanguages[0] || '';
  };

  const [selectedLanguage, setSelectedLanguage] = useState<string>(getInitialLanguage());

  /**
   * [수정 1] useRef<ReactPlayer> 에러 해결
   * ReactPlayer는 '값(Value)'이자 '클래스'이지만, 타입으로 직접 쓸 때 충돌이 날 수 있습니다.
   * 또한 getInternalPlayer() 등 내부 함수를 편하게 쓰기 위해 <any>로 선언하는 것이 정신 건강에 좋습니다.
   */
  const playerRef = useRef<any>(null);

  // 1. 자막 트랙 목록 생성 (vttMap에서 직접 파일 경로 사용, 비디오와 동일한 방식)
  const tracks = useMemo(() => {
    if (availableLanguages.length === 0 || !vttMap) return [];

    const baseUrl = (serverUrl || CONFIG.serverUrl).replace(/\/$/, '');

    return availableLanguages
      .map((lang) => {
        // vttMap에서 해당 언어의 VTT 파일 경로 가져오기
        const vttPath = vttMap[lang];
        if (!vttPath) return null;

        // 비디오와 동일한 방식으로 URL 생성: CONFIG.serverUrl + vttPath
        const path = vttPath.startsWith('/') ? vttPath : `/${vttPath}`;
        const vttUrl = `${baseUrl}${path}`;

        console.log(`🎥 [VideoPlayer] 자막 트랙 생성 - 언어: ${lang}, URL: ${vttUrl}`);

        return {
          kind: 'captions' as const,
          src: vttUrl,
          srcLang: lang,
          label: LANGUAGE_LABELS[lang] || lang,
          default: lang === selectedLanguage,
        };
      })
      .filter(Boolean);
  }, [availableLanguages, vttMap, serverUrl, selectedLanguage]);

  // 2. ReactPlayer Config 설정
  const playerConfig = useMemo(
    () =>
      ({
        file: {
          attributes: {
            controls: true,
            playsInline: true,
            crossOrigin: 'anonymous', // [필수] 자막 CORS 문제 해결
          },
          tracks,
        },
        /**
         * [수정 2] Config 타입 불일치 에러 해결
         * 라이브러리의 Config 타입 정의가 복잡해서 객체 리터럴과 충돌이 잦습니다.
         * 'as any'를 붙여서 TS 검사를 통과시킵니다. (런타임에서는 완벽하게 동작함)
         */
      }) as any,
    [tracks]
  );

  // 3. 언어 변경 핸들러 (네이티브 HTMLVideoElement 사용)
  const handleLanguageChange = (lang: string) => {
    setSelectedLanguage(lang);

    // playerRef.current는 이제 직접 HTMLVideoElement를 참조
    const videoEl = playerRef.current as HTMLVideoElement | null;

    if (videoEl && videoEl.textTracks) {
      console.log(`🎥 [VideoPlayer] 언어 변경: ${lang}, 트랙 수: ${videoEl.textTracks.length}`);

      for (let i = 0; i < videoEl.textTracks.length; i++) {
        const track = videoEl.textTracks[i];

        if (lang === '') {
          track.mode = 'hidden';
        } else if (track.language === lang) {
          track.mode = 'showing';
          console.log(`🎥 [VideoPlayer] 자막 표시: ${track.language} (${track.label})`);
        } else {
          track.mode = 'hidden';
        }
      }
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* videoUrl이 없으면 로딩 표시 */}
      {!videoUrl ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
          <Typography variant="body2" color="text.secondary">
            비디오를 불러오는 중...
          </Typography>
        </Box>
      ) : (
        <>
          {/* 자막 언어 선택 UI */}
          {availableLanguages.length > 0 && (
            <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                자막 언어:
              </Typography>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <Select
                  value={selectedLanguage}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  displayEmpty
                >
                  <MenuItem value="">자막 끄기</MenuItem>
                  {availableLanguages.map((lang) => (
                    <MenuItem key={lang} value={lang}>
                      {LANGUAGE_LABELS[lang] || lang}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          )}

          {/* 플레이어 영역 - 네이티브 video 태그로 테스트 */}
          <Box
            sx={{
              position: 'relative',
              width: '100%',
              bgcolor: 'black',
              borderRadius: 1,
              overflow: 'hidden',
            }}
          >
            {/* 디버깅용: 네이티브 HTML5 video 태그 사용 */}
            <video
              ref={playerRef}
              controls
              crossOrigin="anonymous"
              style={{ width: '100%', maxHeight: '500px' }}
              onLoadedData={(e) => {
                console.log('🎥 [Native Video] onLoadedData: 데이터 로드 완료');
                // 자막 자동 활성화
                const videoEl = e.target as HTMLVideoElement;
                if (videoEl.textTracks && videoEl.textTracks.length > 0) {
                  for (let i = 0; i < videoEl.textTracks.length; i++) {
                    const textTrack = videoEl.textTracks[i];
                    if (textTrack.language === selectedLanguage) {
                      textTrack.mode = 'showing';
                      console.log(`🎥 [Native Video] 자막 활성화: ${textTrack.language}`);
                    } else {
                      textTrack.mode = 'hidden';
                    }
                  }
                }
              }}
              onError={(e) => {
                console.error('🎥 [Native Video] onError:', e);
                console.error('🎥 [Native Video] 에러 상세:', (e.target as HTMLVideoElement).error);
              }}
              onCanPlay={() => console.log('🎥 [Native Video] onCanPlay: 재생 가능')}
              onPlay={() => console.log('🎥 [Native Video] onPlay: 재생 시작')}
              onEnded={onEnded}
            >
              <source src={videoUrl} type="video/mp4" />
              {/* 자막 트랙 */}
              {tracks.map((track, index) => {
                if (!track) return null;
                // 첫 번째 트랙 또는 선택된 언어의 트랙을 기본으로 활성화
                const isDefault = track.default === true;
                return (
                  <track
                    key={track.srcLang}
                    kind="captions"
                    src={track.src}
                    srcLang={track.srcLang}
                    label={String(track.label || track.srcLang)}
                    {...(isDefault ? { default: true } : {})}
                  />
                );
              })}
              브라우저가 비디오를 지원하지 않습니다.
            </video>
          </Box>
        </>
      )}
    </Box>
  );
}

