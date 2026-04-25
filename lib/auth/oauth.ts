import { apiBaseUrl } from "@/lib/api-config";

export type OAuthProvider = "google" | "github";

/**
 * Full URL to the API OAuth start endpoint. Built with the URL API so the browser always
 * performs a top-level navigation to the API host (not a path on the Next.js origin).
 */
export function getOAuthStartUrl(provider: OAuthProvider): string {
  return new URL(`/api/v1/auth/${provider}`, `${apiBaseUrl}/`).href;
}

export function startOAuth(provider: OAuthProvider): void {
  window.location.assign(getOAuthStartUrl(provider));
}
