import { apiBaseUrl } from "@/lib/api-config";
import { authFetch } from "@/lib/auth/auth-fetch";

/**
 * POSTs to the logout endpoint with the access token and same-origin refresh cookie
 * (sent via `credentials: "include"`). API responds 204; Set-Cookie may clear refresh_token.
 */
export async function logoutWithAccessToken(accessToken: string): Promise<void> {
  const res = await authFetch(
    `${apiBaseUrl}/api/v1/auth/logout`,
    { method: "POST" },
    { accessToken },
  );

  if (res.status !== 204) {
    throw new Error(
      res.status === 0 ? "Logout request could not be completed" : `Logout failed (${res.status})`,
    );
  }
}
