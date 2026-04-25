const raw = process.env.NEXT_PUBLIC_API_BASE_URL;
if (raw == null || raw === "") {
  throw new Error("NEXT_PUBLIC_API_BASE_URL is not set");
}

export const apiBaseUrl = raw.replace(/\/$/, "");
