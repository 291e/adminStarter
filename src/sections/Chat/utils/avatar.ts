import { CONFIG } from 'src/global-config';

const getAssetBaseUrl = () => {
  const raw = (CONFIG.serverUrl || '').trim();
  if (!raw) return '';

  const stripApiPath = (value: string) =>
    value
      .replace(/\/safeyoui\/api\/?$/i, '')
      .replace(/\/api\/?$/i, '')
      .replace(/\/$/, '');

  try {
    const url = new URL(raw, window.location.origin);
    url.pathname = stripApiPath(url.pathname);
    const normalizedPath = url.pathname.replace(/\/$/, '');
    return normalizedPath ? `${url.origin}${normalizedPath}` : url.origin;
  } catch {
    return stripApiPath(raw);
  }
};

const isLikelyBase64 = (value: string) =>
  value.length > 80 &&
  !value.startsWith('data/admin/') &&
  !value.startsWith('/data/') &&
  !value.startsWith('/') &&
  /^[A-Za-z0-9+/=_-]+$/.test(value);

export const getChatAvatarUrl = (url?: string | null): string | undefined => {
  if (!url) return undefined;
  const trimmed = url.trim();
  if (!trimmed) return undefined;

  // 잘못된 형식: data:image/png;base64,data/admin/... 같은 경우 처리
  if (
    trimmed.startsWith('data:image/png;base64,data/admin/') ||
    trimmed.startsWith('data:image/png;base64,/data/admin/')
  ) {
    const cleanUrl = trimmed.replace(/^data:image\/png;base64,/, '');
    const baseUrl = getAssetBaseUrl();
    const path = cleanUrl.startsWith('/') ? cleanUrl : `/${cleanUrl}`;
    return baseUrl ? `${baseUrl}${path}` : path;
  }

  // 이미 전체 URL인 경우
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  // base64 데이터 URL인 경우 그대로 반환
  if (trimmed.startsWith('data:image/') && !trimmed.includes('data/admin/')) {
    return trimmed;
  }

  // base64 문자열만 있는 경우
  if (isLikelyBase64(trimmed)) {
    return `data:image/png;base64,${trimmed}`;
  }

  // 상대 경로인 경우 서버 URL과 결합
  const baseUrl = getAssetBaseUrl();
  const path = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return baseUrl ? `${baseUrl}${path}` : path;
};
