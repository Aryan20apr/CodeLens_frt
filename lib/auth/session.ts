import type { AuthSession, AuthUser, LoginResponse, RegisterResponse } from "@/lib/auth/types";

const STORAGE_KEY = "codelens_auth";
const AUTH_CHANGED = "codelens-auth-changed";

function emitAuthChanged(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(AUTH_CHANGED));
}

function assertClient(): void {
  if (typeof window === "undefined")
    throw new Error("Session helpers are only available in the browser");
}

function toSession(
  r: { accessToken: string; user: AuthUser },
  apiKey?: string,
): AuthSession {
  const session: AuthSession = { accessToken: r.accessToken, user: r.user };
  if (apiKey != null) session.apiKey = apiKey;
  return session;
}

function persist(res: AuthSession): void {
  assertClient();
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(res));
  emitAuthChanged();
}

function readRawSession(): string | null {
  if (typeof window === "undefined") return null;
  const fromSession = sessionStorage.getItem(STORAGE_KEY);
  if (fromSession) return fromSession;

  // Backward-compat for old localStorage sessions written before OAuth callback support.
  const fromLocal = localStorage.getItem(STORAGE_KEY);
  if (fromLocal) {
    sessionStorage.setItem(STORAGE_KEY, fromLocal);
    localStorage.removeItem(STORAGE_KEY);
    emitAuthChanged();
  }
  return fromLocal;
}

export function setAuthFromRegister(response: RegisterResponse) {
  persist(
    toSession(
      { accessToken: response.accessToken, user: response.user },
      response.apiKey,
    ),
  );
}

export function setAuthFromLogin(response: LoginResponse) {
  persist(toSession(response));
}

export function setAuthFromOAuthAccessToken(accessToken: string): void {
  const previous = getAuthSession();
  const next: AuthSession = previous
    ? { ...previous, accessToken }
    : { accessToken };
  persist(next);
}

export function getAuthSession(): AuthSession | null {
  const raw = readRawSession();
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthSession;
  } catch {
    return null;
  }
}

export function clearAuthSession(): void {
  assertClient();
  sessionStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(STORAGE_KEY);
  emitAuthChanged();
}

export const CODELENS_AUTH_CHANGE_EVENT = AUTH_CHANGED;
