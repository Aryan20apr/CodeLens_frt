import { apiBaseUrl } from "@/lib/api-config";
import { extractApiErrorMessage } from "@/lib/api-response";
import { authFetch } from "@/lib/auth/auth-fetch";

/**
 * POSTs to the logout endpoint with the access token and same-origin refresh cookie
 * (sent via `credentials: "include"`). API responds 200 or 204.
 */
export async function logoutWithAccessToken(accessToken: string): Promise<void> {
  const res = await authFetch(
    `${apiBaseUrl}/api/v1/auth/logout`,
    { method: "POST" },
    { accessToken },
  );

  if (!res.ok && res.status !== 204) {
    const data: unknown = await res.json().catch(() => ({}));
    const message = extractApiErrorMessage(data, `Logout failed (${res.status})`);
    throw new Error(message);
  }
}
