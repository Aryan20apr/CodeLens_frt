const STORAGE_KEY = "codelens_github_install_state";
const STATE_TTL_MS = 15 * 60 * 1000;

interface StoredInstallState {
  value: string;
  createdAt: number;
}

function assertClient(): void {
  if (typeof window === "undefined") {
    throw new Error("GitHub install state is only available in the browser");
  }
}

export function createGithubInstallState(): string {
  assertClient();
  const value = crypto.randomUUID();
  const payload: StoredInstallState = { value, createdAt: Date.now() };
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  return value;
}

export function verifyGithubInstallState(received: string | null): boolean {
  if (!received || received.trim() === "") return false;

  assertClient();
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return false;

  try {
    const stored = JSON.parse(raw) as StoredInstallState;
    if (typeof stored.value !== "string" || typeof stored.createdAt !== "number") return false;
    if (Date.now() - stored.createdAt > STATE_TTL_MS) return false;
    return stored.value === received;
  } catch {
    return false;
  }
}

export function clearGithubInstallState(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(STORAGE_KEY);
}
