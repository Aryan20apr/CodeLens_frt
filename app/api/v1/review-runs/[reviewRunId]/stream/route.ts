import { apiBaseUrl } from "@/lib/api-config";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ reviewRunId: string }>;
}

export async function GET(request: Request, context: RouteContext) {
  const { reviewRunId } = await context.params;
  const authorization = request.headers.get("authorization");

  if (!authorization) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  let upstream: Response;
  try {
    upstream = await fetch(
      `${apiBaseUrl}/api/v1/review-runs/${encodeURIComponent(reviewRunId)}/stream`,
      {
        method: "GET",
        headers: {
          Accept: "text/event-stream",
          Authorization: authorization,
        },
        cache: "no-store",
      },
    );
  } catch {
    return Response.json({ message: "Could not reach review API" }, { status: 502 });
  }

  if (!upstream.ok) {
    const body = await upstream.text();
    return new Response(body, {
      status: upstream.status,
      headers: {
        "Content-Type": upstream.headers.get("Content-Type") ?? "application/json",
      },
    });
  }

  if (!upstream.body) {
    const text = await upstream.text();
    return new Response(text, {
      status: upstream.status,
      headers: {
        "Content-Type": upstream.headers.get("Content-Type") ?? "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
      },
    });
  }

  return new Response(upstream.body, {
    status: upstream.status,
    headers: {
      "Content-Type": upstream.headers.get("Content-Type") ?? "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
    },
  });
}
