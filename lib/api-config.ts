const raw = process.env.NEXT_PUBLIC_API_BASE_URL;
if (raw == null || raw === "") {
  throw new Error("NEXT_PUBLIC_API_BASE_URL is not set");
}

/**
 * API origin only. `NEXT_PUBLIC_API_BASE_URL` must be the **backend** base (e.g. http://localhost:3000),
 * not the Next.js app URL. If the scheme is omitted (e.g. `localhost:3000`), it is treated as
 * `http://…` so `window.location` navigations are absolute — otherwise the browser treats the
 * string as a path on the current host and the API is never called.
 */
function parseApiOrigin(input: string): string {
  const trimmed = input.trim();
  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `http://${trimmed}`;
  let url: URL;
  try {
    url = new URL(withScheme);
  } catch {
    throw new Error(
      "NEXT_PUBLIC_API_BASE_URL must be a valid URL (e.g. http://localhost:3000 or https://api.example.com)",
    );
  }
  return url.origin;
}

export const apiBaseUrl = parseApiOrigin(raw);
