import type { AuthSession, AuthUser, RegisterResponse, LoginResponse } from "@/lib/auth/types";

const STORAGE_KEY = "codelens_auth";

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

function persist(res: AuthSession) {
  assertClient();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(res));
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

export function getAuthSession(): AuthSession | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthSession;
  } catch {
    return null;
  }
}

export function clearAuthSession(): void {
  assertClient();
  localStorage.removeItem(STORAGE_KEY);
}
