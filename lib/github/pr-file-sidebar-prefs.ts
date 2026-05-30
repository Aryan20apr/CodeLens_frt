const STORAGE_KEY = "codelens-pr-file-sidebar";
export const PR_FILE_SIDEBAR_DEFAULT_WIDTH = 288;
export const PR_FILE_SIDEBAR_MIN_WIDTH = 200;
export const PR_FILE_SIDEBAR_MAX_WIDTH = 520;
export const PR_FILE_SIDEBAR_COLLAPSED_WIDTH = 44;

export interface PrFileSidebarPrefs {
  width: number;
  collapsed: boolean;
}

const DEFAULT_PREFS: PrFileSidebarPrefs = {
  width: PR_FILE_SIDEBAR_DEFAULT_WIDTH,
  collapsed: false,
};

const listeners = new Set<() => void>();

let cachedRaw: string | null = null;
let clientSnapshot: PrFileSidebarPrefs = DEFAULT_PREFS;

export function clampPrFileSidebarWidth(value: number): number {
  return Math.min(PR_FILE_SIDEBAR_MAX_WIDTH, Math.max(PR_FILE_SIDEBAR_MIN_WIDTH, Math.round(value)));
}

function parsePrefs(raw: string): PrFileSidebarPrefs {
  const parsed = JSON.parse(raw) as Partial<PrFileSidebarPrefs>;
  return {
    width:
      typeof parsed.width === "number"
        ? clampPrFileSidebarWidth(parsed.width)
        : PR_FILE_SIDEBAR_DEFAULT_WIDTH,
    collapsed: parsed.collapsed === true,
  };
}

function syncClientSnapshotFromStorage(): PrFileSidebarPrefs {
  if (typeof window === "undefined") return DEFAULT_PREFS;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === cachedRaw) return clientSnapshot;

    cachedRaw = raw;
    if (!raw) {
      clientSnapshot = DEFAULT_PREFS;
      return clientSnapshot;
    }

    const next = parsePrefs(raw);
    if (
      clientSnapshot.width === next.width &&
      clientSnapshot.collapsed === next.collapsed
    ) {
      return clientSnapshot;
    }

    clientSnapshot = next;
    return clientSnapshot;
  } catch {
    cachedRaw = null;
    clientSnapshot = DEFAULT_PREFS;
    return clientSnapshot;
  }
}

export function readPrFileSidebarPrefs(): PrFileSidebarPrefs {
  return syncClientSnapshotFromStorage();
}

export function writePrFileSidebarPrefs(prefs: PrFileSidebarPrefs): void {
  if (typeof window === "undefined") return;

  const normalized: PrFileSidebarPrefs = {
    width: clampPrFileSidebarWidth(prefs.width),
    collapsed: prefs.collapsed,
  };

  const raw = JSON.stringify(normalized);
  if (raw === cachedRaw) return;

  try {
    localStorage.setItem(STORAGE_KEY, raw);
  } catch {
    return;
  }

  cachedRaw = raw;
  clientSnapshot = normalized;

  for (const listener of listeners) {
    listener();
  }
}

export function subscribePrFileSidebarPrefs(onStoreChange: () => void): () => void {
  listeners.add(onStoreChange);
  return () => listeners.delete(onStoreChange);
}

export function getPrFileSidebarServerPrefs(): PrFileSidebarPrefs {
  return DEFAULT_PREFS;
}
