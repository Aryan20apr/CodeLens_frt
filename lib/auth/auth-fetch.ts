import { setAuthResolutionState } from "@/lib/auth/auth-resolution";
import { tryRefreshSession } from "@/lib/auth/refresh-session";
import { clearAuthSession, getAuthSession, setAuthFromLogin } from "@/lib/auth/session";

const PATHS_WITHOUT_REFRESH_RETRY = new Set([
  "/api/v1/auth/refresh",
  "/api/v1/auth/login",
  "/api/v1/auth/register",
]);

function pathnameOf(input: RequestInfo | URL): string | null {
  try {
    if (typeof input === "string") return new URL(input).pathname;
    if (input instanceof URL) return input.pathname;
    if (input instanceof Request) return new URL(input.url).pathname;
  } catch {
    return null;
  }
  return null;
}

function shouldRetryAfterRefresh(input: RequestInfo | URL, status: number): boolean {
  if (status !== 401) return false;
  const pathname = pathnameOf(input);
  if (!pathname) return true;
  return !PATHS_WITHOUT_REFRESH_RETRY.has(pathname);
}

export interface AuthFetchOptions {
  /** Bearer token; defaults to the current session access token when omitted. */
  accessToken?: string;
}

/**
 * Browser fetch wrapper for authenticated API calls. On 401, attempts one
 * cookie-based refresh, updates session storage, and retries the request once.
 */
export async function authFetch(
  input: RequestInfo | URL,
  init: RequestInit = {},
  options: AuthFetchOptions = {},
): Promise<Response> {
  return authFetchInternal(input, init, options, false);
}

async function authFetchInternal(
  input: RequestInfo | URL,
  init: RequestInit,
  options: AuthFetchOptions,
  isRetry: boolean,
): Promise<Response> {
  const token = options.accessToken ?? getAuthSession()?.accessToken;
  const headers = new Headers(init.headers);
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(input, {
    ...init,
    headers,
    credentials: init.credentials ?? "include",
  });

  if (isRetry || !shouldRetryAfterRefresh(input, res.status)) {
    return res;
  }

  const refreshed = await tryRefreshSession();
  if (!refreshed) {
    clearAuthSession();
    setAuthResolutionState("unauthed");
    return res;
  }

  setAuthFromLogin(refreshed);
  return authFetchInternal(
    input,
    init,
    { accessToken: refreshed.accessToken },
    true,
  );
}
