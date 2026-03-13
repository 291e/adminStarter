import { JWT_STORAGE_KEY, REFRESH_TOKEN_STORAGE_KEY } from './constant';

const ACCESS_KEYS = [JWT_STORAGE_KEY, 'accessToken'];
const REFRESH_KEYS = [REFRESH_TOKEN_STORAGE_KEY, 'refreshToken'];

function readStorage(keys: string[], storage?: Storage): string | null {
  if (!storage) return null;

  for (const key of keys) {
    const value = storage.getItem(key)?.trim();
    if (value) {
      return value;
    }
  }

  return null;
}

function removeStorageKeys(keys: string[], storage?: Storage) {
  if (!storage) return;

  for (const key of keys) {
    storage.removeItem(key);
  }
}

export function getStoredAccessToken(): string | null {
  if (typeof window === 'undefined') return null;

  return (
    readStorage(ACCESS_KEYS, window.sessionStorage) ??
    readStorage(ACCESS_KEYS, window.localStorage)
  );
}

export function getStoredRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;

  return (
    readStorage(REFRESH_KEYS, window.sessionStorage) ??
    readStorage(REFRESH_KEYS, window.localStorage)
  );
}

export function storeAccessToken(accessToken: string) {
  if (typeof window === 'undefined') return;

  const normalized = accessToken.trim();
  if (!normalized) return;

  window.sessionStorage.setItem(JWT_STORAGE_KEY, normalized);
  window.sessionStorage.setItem('accessToken', normalized);
  removeStorageKeys(ACCESS_KEYS, window.localStorage);
}

export function storeRefreshToken(refreshToken: string) {
  if (typeof window === 'undefined') return;

  const normalized = refreshToken.trim();
  if (!normalized) return;

  window.sessionStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, normalized);
  window.sessionStorage.setItem('refreshToken', normalized);
  removeStorageKeys(REFRESH_KEYS, window.localStorage);
}

export function clearStoredTokens() {
  if (typeof window === 'undefined') return;

  removeStorageKeys(ACCESS_KEYS, window.sessionStorage);
  removeStorageKeys(REFRESH_KEYS, window.sessionStorage);
  removeStorageKeys(ACCESS_KEYS, window.localStorage);
  removeStorageKeys(REFRESH_KEYS, window.localStorage);
}
