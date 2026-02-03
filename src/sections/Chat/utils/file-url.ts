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
  const trimmed = url.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith('data:image') || trimmed.startsWith('data:')) return trimmed;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;

  const base = (CONFIG.serverUrl || '').trim();
  if (!base) return trimmed;

  if (trimmed.startsWith('/')) {
    if (trimmed.startsWith('/safeyoui/api')) {
      const origin = originFromBase(base);
      return `${origin}${trimmed}`;
    }
    const normalizedBase = base.endsWith('/') ? base.slice(0, -1) : base;
    return `${normalizedBase}${trimmed}`;
  }

  const normalizedBase = base.endsWith('/') ? base : `${base}/`;
  return `${normalizedBase}${trimmed}`;
};
