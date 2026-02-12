import { CONFIG } from 'src/global-config';

const originFromBase = (base: string): string => {
  try {
    return new URL(base).origin;
  } catch {
    return base;
  }
};

export const resolveFileUrl = (url?: string | null): string | null => {
  if (!url) return null;

  let trimmed = url.trim();
  if (!trimmed) return null;

  // 잘못된 형식: data:image/png;base64,data/admin/... 같은 경우 처리
  if (
    trimmed.startsWith('data:image/png;base64,data/admin/') ||
    trimmed.startsWith('data:image/png;base64,/data/admin/')
  ) {
    trimmed = trimmed.replace(/^data:image\/png;base64,/, '');
  }

  // data URL인 경우 그대로 반환 (실제 base64 데이터)
  if (trimmed.startsWith('data:image') || trimmed.startsWith('data:')) return trimmed;

  // 이미 전체 URL인 경우
  if (/^https?:\/\//i.test(trimmed)) return trimmed;

  const base = (CONFIG.serverUrl || '').trim();
  if (!base) return trimmed;

  // "/safeyoui/api/..." 같은 경로는 origin만 붙여서 사용
  if (trimmed.startsWith('/safeyoui/api')) {
    const origin = originFromBase(base);
    return `${origin}${trimmed}`;
  }

  const normalizedBase = base.endsWith('/') ? base.slice(0, -1) : base;
  const path = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return `${normalizedBase}${path}`;
};
