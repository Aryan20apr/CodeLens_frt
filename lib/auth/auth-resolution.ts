export type AuthResolutionState = "unknown" | "authed" | "unauthed";

let authResolutionState: AuthResolutionState = "unknown";

export function getAuthResolutionState(): AuthResolutionState {
  return authResolutionState;
}

export function setAuthResolutionState(next: Exclude<AuthResolutionState, "unknown">): void {
  authResolutionState = next;
}
