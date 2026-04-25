import { apiBaseUrl } from "@/lib/api-config";
import type { LoginResponse } from "@/lib/auth/types";

let inFlight: Promise<LoginResponse | null> | null = null;

/**
 * Uses the httpOnly refresh cookie (sent via `credentials: "include"`). Returns
 * a new access token and user, or `null` if the refresh session is missing or invalid.
 */
export function tryRefreshSession(): Promise<LoginResponse | null> {
  if (inFlight) return inFlight;
  inFlight = (async () => {
    const res = await fetch(`${apiBaseUrl}/api/v1/auth/refresh`, {
      method: "POST",
      headers: { Accept: "application/json" },
      body: "",
      credentials: "include",
    });
    if (!res.ok) return null;
    const data: unknown = await res.json().catch(() => null);
    if (!data || typeof data !== "object") return null;
    if (!("accessToken" in data) || !("user" in data)) return null;
    return data as LoginResponse;
  })().finally(() => {
    inFlight = null;
  });
  return inFlight;
}
