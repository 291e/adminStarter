import axios from 'src/lib/axios';

import {
  clearStoredTokens,
  storeAccessToken,
  storeRefreshToken,
} from './storage';

// ----------------------------------------------------------------------

export function jwtDecode(token: string) {
  try {
    if (!token) return null;

    const parts = token.split('.');
    if (parts.length < 2) {
      throw new Error('Invalid token!');
    }

    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = JSON.parse(atob(base64));

    return decoded;
  } catch (error) {
    console.error('Error decoding token:', error);
    throw error;
  }
}

// ----------------------------------------------------------------------

export function isValidToken(accessToken: string) {
  if (!accessToken) {
    return false;
  }

  try {
    const decoded = jwtDecode(accessToken);

    if (!decoded || !('exp' in decoded)) {
      return false;
    }

    const currentTime = Date.now() / 1000;

    return decoded.exp > currentTime;
  } catch (error) {
    console.error('Error during token validation:', error);
    return false;
  }
}

// ----------------------------------------------------------------------

// export function tokenExpired(exp: number) {
//   const currentTime = Date.now();
//   const timeLeft = exp * 1000 - currentTime;

//   setTimeout(() => {
//     try {
//       alert('로그인이 만료되었습니다. 다시 로그인해주세요.');
//       sessionStorage.removeItem(JWT_STORAGE_KEY);
//       window.location.href = buildAppPath(paths.auth.jwt.signIn);
//     } catch (error) {
//       console.error('Error during token expiration:', error);
//       throw error;
//     }
//   }, timeLeft);
// }

// ----------------------------------------------------------------------

export async function setSession(
  accessToken: string | null,
  refreshToken?: string | null
) {
  try {
    if (accessToken) {
      storeAccessToken(accessToken);
      if (typeof refreshToken === 'string' && refreshToken.trim()) {
        storeRefreshToken(refreshToken);
      }

      axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;

      const decodedToken = jwtDecode(accessToken);

      if (decodedToken && 'exp' in decodedToken) {
        // tokenExpired(decodedToken.exp);
      } else {
        throw new Error('Invalid access token!');
      }
    } else {
      clearStoredTokens();
      delete axios.defaults.headers.common.Authorization;
    }
  } catch (error) {
    console.error('Error during set session:', error);
    throw error;
  }
}
