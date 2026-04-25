import type { AuthSession, RegisterResponse } from "@/lib/auth/types";

const STORAGE_KEY = "codelens_auth";

function assertClient(): void {
  if (typeof window === "undefined")
    throw new Error("Session helpers are only available in the browser");
}

export function setAuthFromRegister(response: RegisterResponse): void {
  assertClient();
  const session: AuthSession = {
    accessToken: response.accessToken,
    apiKey: response.apiKey,
    user: response.user,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
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
