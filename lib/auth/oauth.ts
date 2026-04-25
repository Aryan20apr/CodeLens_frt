import { apiBaseUrl } from "@/lib/api-config";

export type OAuthProvider = "google" | "github";

export function getOAuthStartUrl(provider: OAuthProvider): string {
  return `${apiBaseUrl}/api/v1/auth/${provider}`;
}

export function startOAuth(provider: OAuthProvider): void {
  window.location.href = getOAuthStartUrl(provider);
}
