import { useEffect, useMemo, useRef, useState } from 'react';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { CONFIG } from 'src/global-config';
import { getVodSubtitleContent } from 'src/services/vod/vod.service';

// ----------------------------------------------------------------------

type Props = {
  vodIdx: number;
  videoUrl: string;
  availableLanguages?: string[];
  vttMap?: Record<string, string>;
  defaultLanguage?: string;
  onEnded?: () => void;
  serverUrl?: string;
  disableControls?: boolean;
  disableControlInteraction?: boolean;
};

type SubtitleCue = {
  start: number;
  end: number;
  text: string;
};

const normalizeLanguageCode = (lang?: string | null): string => {
  if (!lang) return '';

  const lower = String(lang).trim().toLowerCase();
  const map: Record<string, string> = {
    kr: 'ko',
    kor: 'ko',
    ko_kr: 'ko',
    korean: 'ko',
    vn: 'vi',
    vie: 'vi',
    vi_vn: 'vi',
    vietnamese: 'vi',
    uzb: 'uz',
    uz_uz: 'uz',
    eng: 'en',
    en_us: 'en',
    en_gb: 'en',
    zh_cn: 'zh',
    zh_tw: 'zh',
  };

  return map[lower] || lower.split('-')[0].split('_')[0];
};

const normalizeWebVttContent = (raw: string): string => {
  const withoutPrefix = raw.replace(/^\uFEFF?webvtt\s*\r?\n/i, '');
  return withoutPrefix.trimStart().startsWith('WEBVTT')
    ? withoutPrefix
    : `WEBVTT\n\n${withoutPrefix}`;
};

const parseTimestamp = (value: string): number | null => {
  const clean = value.trim().replace(',', '.');
  const parts = clean.split(':');
  if (parts.length < 2 || parts.length > 3) return null;

  let hours = 0;
  let minutes = 0;
  let seconds = 0;
  let millis = 0;

  if (parts.length === 3) {
    hours = Number(parts[0]);
    minutes = Number(parts[1]);
    const [sec, ms = '0'] = parts[2].split('.');
    seconds = Number(sec);
    millis = Number(ms.padEnd(3, '0').slice(0, 3));
  } else {
    minutes = Number(parts[0]);
    const [sec, ms = '0'] = parts[1].split('.');
    seconds = Number(sec);
    millis = Number(ms.padEnd(3, '0').slice(0, 3));
  }

  if ([hours, minutes, seconds, millis].some((num) => Number.isNaN(num))) {
    return null;
  }

  return hours * 3600 + minutes * 60 + seconds + millis / 1000;
};

const parseWebVtt = (raw: string): SubtitleCue[] => {
  const normalized = normalizeWebVttContent(raw).replace(/\r/g, '');
  const lines = normalized.split('\n');
  const cues: SubtitleCue[] = [];

  let index = 0;
  while (index < lines.length) {
    const line = lines[index].trim();
    if (!line) {
      index += 1;
      continue;
    }

    let timingLine = line;
    if (!timingLine.includes('-->')) {
      index += 1;
      timingLine = (lines[index] || '').trim();
    }

    if (!timingLine.includes('-->')) {
      index += 1;
      continue;
    }

    const [startRaw, endRawWithSettings = ''] = timingLine.split('-->');
    const endRaw = endRawWithSettings.trim().split(/\s+/)[0];
    const start = parseTimestamp(startRaw);
    const end = parseTimestamp(endRaw);

    index += 1;

    const textLines: string[] = [];
    while (index < lines.length && lines[index].trim() !== '') {
      textLines.push(lines[index]);
      index += 1;
    }

    if (start !== null && end !== null && end >= start) {
      cues.push({
        start,
        end,
        text: textLines.join('\n').trim(),
      });
    }
  }

  return cues;
};

const resolveVttUrl = (path: string, serverUrl?: string): string => {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  const baseUrl = (serverUrl || CONFIG.serverUrl).replace(/\/$/, '');
  const resolvedPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${resolvedPath}`;
};

export default function VideoPlayer({
  vodIdx,
  videoUrl,
  availableLanguages = [],
  vttMap,
  defaultLanguage,
  onEnded,
  serverUrl,
  disableControls = false,
  disableControlInteraction = false,
}: Props) {
  const playerRef = useRef<HTMLVideoElement | null>(null);
  const activeCueIndexRef = useRef<number>(-1);

  const controlsListValue = useMemo(() => {
    const list: string[] = [];
    if (disableControls) {
      list.push('nodownload', 'nofullscreen', 'noremoteplayback');
    }
    if (disableControlInteraction) {
      list.push('noplaybackrate');
    }
    return list.length > 0 ? list.join(' ') : undefined;
  }, [disableControls, disableControlInteraction]);

  const preferredLanguage = useMemo(() => {
    const normalizedDefault = normalizeLanguageCode(defaultLanguage);
    if (normalizedDefault) return normalizedDefault;
    if (availableLanguages.includes('ko')) return 'ko';
    return availableLanguages[0] || '';
  }, [defaultLanguage, availableLanguages]);

  const [selectedLanguage, setSelectedLanguage] = useState<string>(preferredLanguage);
  const [subtitleCues, setSubtitleCues] = useState<SubtitleCue[]>([]);
  const [subtitleText, setSubtitleText] = useState<string>('');

  useEffect(() => {
    if (!preferredLanguage) return;
    setSelectedLanguage((prev) => (prev === preferredLanguage ? prev : preferredLanguage));
  }, [preferredLanguage]);

  useEffect(() => {
    let cancelled = false;

    const loadSubtitleCues = async () => {
      if (!vodIdx || !selectedLanguage) {
        setSubtitleCues([]);
        setSubtitleText('');
        activeCueIndexRef.current = -1;
        return;
      }

      let rawContent = '';

      try {
        rawContent = await getVodSubtitleContent(vodIdx, selectedLanguage, 'vtt');
      } catch {
        // subtitle API 실패 시 vttMap fallback
        const fallbackPath = vttMap?.[selectedLanguage];
        if (fallbackPath) {
          try {
            const response = await fetch(resolveVttUrl(fallbackPath, serverUrl), {
              credentials: 'include',
            });
            if (response.ok) {
              rawContent = await response.text();
            }
          } catch {
            rawContent = '';
          }
        }
      }

      if (cancelled) return;

      const cues = rawContent ? parseWebVtt(rawContent) : [];
      setSubtitleCues(cues);
      setSubtitleText('');
      activeCueIndexRef.current = -1;
    };

    loadSubtitleCues();

    return () => {
      cancelled = true;
    };
  }, [vodIdx, selectedLanguage, vttMap, serverUrl]);

  const syncSubtitleByTime = (currentTime: number) => {
    if (subtitleCues.length === 0) {
      if (subtitleText) setSubtitleText('');
      activeCueIndexRef.current = -1;
      return;
    }

    const currentIndex = activeCueIndexRef.current;
    if (currentIndex >= 0) {
      const activeCue = subtitleCues[currentIndex];
      if (activeCue && currentTime >= activeCue.start && currentTime <= activeCue.end) {
        if (subtitleText !== activeCue.text) {
          setSubtitleText(activeCue.text);
        }
        return;
      }
    }

    const nextIndex = subtitleCues.findIndex(
      (cue) => currentTime >= cue.start && currentTime <= cue.end
    );

    activeCueIndexRef.current = nextIndex;
    const nextText = nextIndex >= 0 ? subtitleCues[nextIndex].text : '';
    if (subtitleText !== nextText) {
      setSubtitleText(nextText);
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      {!videoUrl ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
          <Typography variant="body2" color="text.secondary">
            비디오를 불러오는 중...
          </Typography>
        </Box>
      ) : (
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            bgcolor: 'black',
            borderRadius: 1,
            overflow: 'hidden',
            '& video': {
              width: '100%',
              maxHeight: '500px',
              display: 'block',
              position: 'relative',
              '&::-webkit-media-controls-panel': {
                display: 'flex !important',
              },
              '&::-webkit-media-controls-play-button': {
                display: 'flex !important',
              },
              '&::-webkit-media-controls-timeline': {
                display: 'flex !important',
              },
              '&::-webkit-media-controls-current-time-display': {
                display: 'flex !important',
              },
              '&::-webkit-media-controls-time-remaining-display': {
                display: 'flex !important',
              },
              '&::-webkit-media-controls-mute-button': {
                display: 'flex !important',
              },
              '&::-webkit-media-controls-volume-slider': {
                display: 'flex !important',
              },
              '&::-webkit-media-controls-fullscreen-button': {
                display: 'flex !important',
              },
            },
          }}
        >
          <video
            ref={playerRef}
            autoPlay
            controls={!disableControls}
            controlsList={controlsListValue}
            onClick={(e) => {
              const videoEl = e.currentTarget;
              if (videoEl.paused) {
                videoEl.play();
              } else {
                videoEl.pause();
              }
            }}
            onRateChange={(e) => {
              if (!disableControlInteraction) return;
              const videoEl = e.currentTarget;
              if (videoEl.playbackRate !== 1) {
                videoEl.playbackRate = 1;
              }
            }}
            onContextMenu={(e) => {
              if (disableControls) e.preventDefault();
            }}
            crossOrigin="anonymous"
            onLoadedData={(e) => {
              syncSubtitleByTime(e.currentTarget.currentTime);
            }}
            onTimeUpdate={(e) => {
              const videoEl = e.currentTarget;
              if (disableControlInteraction && videoEl.playbackRate !== 1) {
                videoEl.playbackRate = 1;
              }
              syncSubtitleByTime(videoEl.currentTime);
            }}
            onEnded={onEnded}
          >
            <source src={videoUrl} type="video/mp4" />
            브라우저가 비디오를 지원하지 않습니다.
          </video>

          {!!subtitleText && (
            <Box
              sx={{
                pointerEvents: 'none',
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: 56,
                zIndex: 3,
                display: 'flex',
                justifyContent: 'center',
                px: 1,
              }}
            >
              <Typography
                sx={{
                  maxWidth: '92%',
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 1,
                  color: '#fff',
                  fontSize: 15,
                  fontWeight: 600,
                  lineHeight: 1.45,
                  textAlign: 'center',
                  whiteSpace: 'pre-line',
                  bgcolor: 'rgba(0,0,0,0.72)',
                  textShadow: '0 1px 2px rgba(0,0,0,0.7)',
                }}
              >
                {subtitleText}
              </Typography>
            </Box>
          )}

          {disableControlInteraction && !disableControls && (
            <Box
              aria-hidden
              sx={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: 0,
                height: 48,
                zIndex: 2,
                pointerEvents: 'auto',
              }}
              onClick={(e) => e.preventDefault()}
              onPointerDown={(e) => e.preventDefault()}
            />
          )}
        </Box>
      )}
    </Box>
  );
}
