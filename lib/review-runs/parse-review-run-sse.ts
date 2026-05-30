import type {
  ReviewRunDonePayload,
  ReviewRunSnapshotPayload,
  ReviewRunStepPayload,
  ReviewRunStreamEvent,
  ReviewRunStreamEventKind,
} from "@/lib/review-runs/review-run-stream-types";

function parseEventBlock(block: string): ReviewRunStreamEvent | null {
  const lines = block.split("\n").filter((line) => line.length > 0);
  let eventKind: ReviewRunStreamEventKind | null = null;
  const dataLines: string[] = [];

  for (const line of lines) {
    if (line.startsWith("event:")) {
      const name = line.slice(6).trim();
      if (name === "snapshot" || name === "step" || name === "done") {
        eventKind = name;
      }
      continue;
    }
    if (line.startsWith("data:")) {
      dataLines.push(line.slice(5).trimStart());
    }
  }

  if (!eventKind || dataLines.length === 0) return null;

  try {
    const data: unknown = JSON.parse(dataLines.join("\n"));
    if (!data || typeof data !== "object") return null;

    if (eventKind === "snapshot") {
      const row = data as Record<string, unknown>;
      if (typeof row.id !== "string" || typeof row.repoFullName !== "string") return null;
      return { kind: "snapshot", data: data as ReviewRunSnapshotPayload };
    }

    if (eventKind === "step") {
      const row = data as Record<string, unknown>;
      if (typeof row.step !== "string" || typeof row.status !== "string") return null;
      return { kind: "step", data: data as ReviewRunStepPayload };
    }

    if (eventKind === "done") {
      const row = data as Record<string, unknown>;
      if (typeof row.status !== "string") return null;
      return { kind: "done", data: data as ReviewRunDonePayload };
    }
  } catch {
    return null;
  }

  return null;
}

export class ReviewRunSseParser {
  private buffer = "";

  push(chunk: string): ReviewRunStreamEvent[] {
    this.buffer += chunk;
    const events: ReviewRunStreamEvent[] = [];

    let boundary = this.buffer.indexOf("\n\n");
    while (boundary !== -1) {
      const block = this.buffer.slice(0, boundary).trim();
      this.buffer = this.buffer.slice(boundary + 2);

      if (block.length > 0) {
        const parsed = parseEventBlock(block);
        if (parsed) events.push(parsed);
      }

      boundary = this.buffer.indexOf("\n\n");
    }

    return events;
  }

  reset(): void {
    this.buffer = "";
  }
}
