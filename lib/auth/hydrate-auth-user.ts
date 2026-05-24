import {
  fetchCurrentUser,
  mapCurrentUserToAuthUser,
} from "@/lib/auth/fetch-current-user";
import { setAuthUser } from "@/lib/auth/session";
import type { AuthUser } from "@/lib/auth/types";

/**
 * Loads the signed-in user from GET /api/v1/users/me and merges into session storage.
 * Returns null on network or auth errors (caller decides whether to sign out).
 */
export async function hydrateAuthUser(accessToken: string): Promise<AuthUser | null> {
  try {
    const profile = await fetchCurrentUser(accessToken);
    const user = mapCurrentUserToAuthUser(profile);
    setAuthUser(user);
    return user;
  } catch {
    return null;
  }
}
