import { apiBaseUrl } from "@/lib/api-config";

/**
 * POSTs to the logout endpoint with the access token and same-origin refresh cookie
 * (sent via `credentials: "include"`). API responds 204; Set-Cookie may clear refresh_token.
 */
export async function logoutWithAccessToken(accessToken: string): Promise<void> {
  const res = await fetch(`${apiBaseUrl}/api/v1/auth/logout`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
    credentials: "include",
  });

  if (res.status !== 204) {
    throw new Error(
      res.status === 0 ? "Logout request could not be completed" : `Logout failed (${res.status})`,
    );
  }
}
