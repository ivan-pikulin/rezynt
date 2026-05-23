import FingerprintJS from '@fingerprintjs/fingerprintjs';
import { TokenResponse } from '../../../features/auth/types/auth';

const isBrowser = typeof document !== 'undefined';
const SHARED_COOKIE_DOMAINS = ['rezynt.ru', 'rezynt.com'];
const ACCESS_COOKIE = 'rz_access_token';
const REFRESH_COOKIE = 'rz_refresh_token';
const GUEST_COOKIE = 'rz_guest_id';

const getSharedCookieDomain = (): string | null => {
  if (!isBrowser) {
    return null;
  }

  const hostname = window.location.hostname;
  const baseDomain = SHARED_COOKIE_DOMAINS.find(
    domain => hostname === domain || hostname.endsWith(`.${domain}`)
  );
  return baseDomain ? `.${baseDomain}` : null;
};

const shouldUseSharedCookies = () => {
  return Boolean(getSharedCookieDomain());
};

const setCookie = (name: string, value: string, maxAgeSeconds?: number) => {
  if (!isBrowser || !shouldUseSharedCookies()) return;
  let cookie = `${name}=${encodeURIComponent(value)};path=/;SameSite=None;Secure`;
  const cookieDomain = getSharedCookieDomain();
  if (cookieDomain) {
    cookie += `;domain=${cookieDomain}`;
  }
  if (typeof maxAgeSeconds === 'number') {
    cookie += `;Max-Age=${Math.max(0, maxAgeSeconds)}`;
  }
  document.cookie = cookie;
};

const getCookie = (name: string): string | null => {
  if (!isBrowser || !shouldUseSharedCookies()) return null;
  const cookieString = document.cookie || '';
  const parts = cookieString.split(';').map(part => part.trim());
  for (const part of parts) {
    if (part.startsWith(`${name}=`)) {
      return decodeURIComponent(part.slice(name.length + 1));
    }
  }
  return null;
};

const clearCookie = (name: string) => {
  if (!isBrowser || !shouldUseSharedCookies()) return;
  let cookie = `${name}=;path=/;Max-Age=0;SameSite=None;Secure`;
  const cookieDomain = getSharedCookieDomain();
  if (cookieDomain) {
    cookie += `;domain=${cookieDomain}`;
  }
  document.cookie = cookie;
};

const decodeTokenMaxAge = (token: string): number | undefined => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const nowSeconds = Math.floor(Date.now() / 1000);
    if (payload.exp && typeof payload.exp === 'number') {
      return Math.max(0, payload.exp - nowSeconds);
    }
  } catch (error) {
    // ignore decoding errors
  }
  return undefined;
};

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

const readTokenWithCookieFallback = (storageKey: string, cookieName: string): string | null => {
  const localValue = localStorage.getItem(storageKey);
  if (localValue) {
    return localValue;
  }
  const cookieValue = getCookie(cookieName);
  if (cookieValue) {
    return cookieValue;
  }
  return null;
};

const persistTokenWithCookie = (storageKey: string, cookieName: string, token: string | null) => {
  if (!token) {
    localStorage.removeItem(storageKey);
    clearCookie(cookieName);
    return;
  }
  localStorage.setItem(storageKey, token);
  const maxAge = decodeTokenMaxAge(token);
  setCookie(cookieName, token, maxAge);
};

const readGuestIdWithCookieFallback = (): string | null => {
  const localValue = localStorage.getItem('guest_id');
  if (localValue) {
    return localValue;
  }
  return getCookie(GUEST_COOKIE);
};

const persistGuestId = (guestId: string | null) => {
  if (!guestId) {
    localStorage.removeItem('guest_id');
    clearCookie(GUEST_COOKIE);
    return;
  }
  localStorage.setItem('guest_id', guestId);
  setCookie(GUEST_COOKIE, guestId);
};

export const tokenService = {
  getAccessToken: (): string | null => {
    return readTokenWithCookieFallback('access_token', ACCESS_COOKIE);
  },

  getRefreshToken: (): string | null => {
    return readTokenWithCookieFallback('refresh_token', REFRESH_COOKIE);
  },

  getGuestId: (): string | null => {
    return readGuestIdWithCookieFallback();
  },

  setGuestId: (guestId: string) => {
    persistGuestId(guestId);
  },

  clearGuestId: () => {
    persistGuestId(null);
  },

  getOrCreateGuestId: async (): Promise<string> => {
    const existingGuestId = readGuestIdWithCookieFallback();
    if (existingGuestId) {
      return existingGuestId;
    }

    try {
      const fp = await FingerprintJS.load();
      const result = await fp.get();
      const guestId = result.visitorId;
      persistGuestId(guestId);
      return guestId;
    } catch (error) {
      const guestId = generateUUID();
      persistGuestId(guestId);
      return guestId;
    }
  },

  clearTokens: () => {
    persistTokenWithCookie('access_token', ACCESS_COOKIE, null);
    persistTokenWithCookie('refresh_token', REFRESH_COOKIE, null);
    localStorage.removeItem('token_type');
  },

  storeTokens: (tokens: TokenResponse) => {
    persistTokenWithCookie('access_token', ACCESS_COOKIE, tokens.access_token);
    persistTokenWithCookie('refresh_token', REFRESH_COOKIE, tokens.refresh_token);
    localStorage.setItem('token_type', tokens.token_type);
    if (tokens.guest_id) {
      persistGuestId(tokens.guest_id);
    }
  },

  refreshToken: async (refreshToken: string): Promise<TokenResponse> => {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }
    
    return response.json();
  },
};
