import { CONFIG } from 'src/global-config';

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const getServerHost = () => {
  const base = (CONFIG.serverUrl || '').trim();
  if (!base) return null;
  try {
    return new URL(base).host;
  } catch {
    return null;
  }
};

const getNormalizedServerUrl = () => {
  const base = (CONFIG.serverUrl || '').trim();
  if (!base) return null;
  return base.endsWith('/') ? base.slice(0, -1) : base;
};

/**
 * Quill content may contain image src like `/data/admin/...` which won't render in dev because Vite
 * only proxies `/safeyoui/*`. Prefix with `CONFIG.serverUrl` so images load consistently.
 */
export const resolveAdminImageUrlsInHtml = (html: string) => {
  if (!html) return html;

  const serverUrl = getNormalizedServerUrl();
  if (!serverUrl) return html;

  // Only rewrite relative `data/admin` paths. Keep `http(s)://` and `data:` as-is.
  return html.replace(
    /(<img\b[^>]*?\ssrc\s*=\s*["'])(?!https?:\/\/|data:)(\/?data\/admin\/[^"']+)(["'][^>]*>)/gi,
    (_match, prefix: string, src: string, suffix: string) => {
      const path = src.startsWith('/') ? src : `/${src}`;
      return `${prefix}${serverUrl}${path}${suffix}`;
    }
  );
};

/**
 * Keep stored HTML stable by stripping our own server origin from admin image URLs.
 * Example: `https://host/.../data/admin/x.png` -> `/data/admin/x.png`
 */
export const stripAdminImageOriginFromHtml = (html: string) => {
  if (!html) return html;

  const host = getServerHost();
  if (!host) return html;

  const hostPattern = escapeRegExp(host);

  return html.replace(
    new RegExp(
      `(\\ssrc\\s*=\\s*["'])https?:\\/\\/${hostPattern}[^"']*?(\\/data\\/admin\\/[^"']+)(["'])`,
      'gi'
    ),
    '$1$2$3'
  );
};
