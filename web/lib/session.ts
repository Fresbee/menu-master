import { cookies } from "next/headers";

const API_URL = process.env.API_URL;
const ACCESS_COOKIE_MAX_AGE = 60 * 15;
const REFRESH_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

type TokenResponse = {
  access_token: string;
  refresh_token: string;
};

type SessionTokens = {
  accessToken?: string;
  refreshToken?: string;
};

type FetchWithSessionOptions = {
  includeRefreshToken?: boolean;
  retryOnUnauthorized?: boolean;
};

function ensureApiUrl(): string {
  if (!API_URL) {
    throw new Error("API_URL is not configured.");
  }

  return API_URL;
}

function buildCookieHeader(
  tokens: SessionTokens,
  includeRefreshToken: boolean,
): string {
  const parts = [
    tokens.accessToken ? `access_token=${tokens.accessToken}` : "",
    includeRefreshToken && tokens.refreshToken
      ? `refresh_token=${tokens.refreshToken}`
      : "",
  ];

  return parts.filter(Boolean).join("; ");
}

async function getSessionTokens(): Promise<SessionTokens> {
  const cookieStore = await cookies();

  return {
    accessToken: cookieStore.get("access_token")?.value,
    refreshToken: cookieStore.get("refresh_token")?.value,
  };
}

export async function setSessionCookies(tokens: TokenResponse) {
  const cookieStore = await cookies();

  cookieStore.set("access_token", tokens.access_token, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    path: "/",
    maxAge: ACCESS_COOKIE_MAX_AGE,
  });

  cookieStore.set("refresh_token", tokens.refresh_token, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    path: "/",
    maxAge: REFRESH_COOKIE_MAX_AGE,
  });
}

export async function clearSessionCookies() {
  const cookieStore = await cookies();
  cookieStore.delete("access_token");
  cookieStore.delete("refresh_token");
}

async function refreshSessionTokens(
  tokens: SessionTokens,
): Promise<SessionTokens | null> {
  if (!tokens.refreshToken) {
    await clearSessionCookies();
    return null;
  }

  const refreshResponse = await fetch(`${ensureApiUrl()}/auth/refresh`, {
    method: "POST",
    headers: {
      Cookie: buildCookieHeader(tokens, true),
    },
    cache: "no-store",
  });

  const refreshPayload = (await refreshResponse.json().catch(() => null)) as
    | TokenResponse
    | null;

  if (!refreshResponse.ok || !refreshPayload) {
    await clearSessionCookies();
    return null;
  }

  await setSessionCookies(refreshPayload);

  return {
    accessToken: refreshPayload.access_token,
    refreshToken: refreshPayload.refresh_token,
  };
}

export async function fetchApiWithSession(
  path: string,
  init: RequestInit = {},
  options: FetchWithSessionOptions = {},
): Promise<Response> {
  const { includeRefreshToken = false, retryOnUnauthorized = true } = options;
  const url = `${ensureApiUrl()}${path}`;
  let tokens = await getSessionTokens();

  const doFetch = (currentTokens: SessionTokens) => {
    const headers = new Headers(init.headers);
    const cookieHeader = buildCookieHeader(currentTokens, includeRefreshToken);

    if (cookieHeader) {
      headers.set("Cookie", cookieHeader);
    } else {
      headers.delete("Cookie");
    }

    return fetch(url, {
      ...init,
      headers,
      cache: "no-store",
    });
  };

  let response = await doFetch(tokens);

  if (response.status !== 401 || !retryOnUnauthorized) {
    return response;
  }

  const refreshedTokens = await refreshSessionTokens(tokens);
  if (!refreshedTokens) {
    return response;
  }

  tokens = refreshedTokens;
  response = await doFetch(tokens);

  return response;
}
