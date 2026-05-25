import type { GithubPullRequestFile } from "@/lib/github/types";

/**
 * GitHub PR file patches omit the `diff --git` header that gitdiff-parser expects.
 * Prepend a minimal git diff header so react-diff-view's parseDiff can parse them.
 */
export function normalizeGithubPatch(file: GithubPullRequestFile): string {
  const patch = file.patch?.trim() ?? "";
  if (!patch) return "";
  if (patch.startsWith("diff --git")) return patch;

  const filename = file.filename;
  const previous = file.previousFilename;

  if (file.status === "renamed" && previous) {
    return [
      `diff --git a/${previous} b/${filename}`,
      `rename from ${previous}`,
      `rename to ${filename}`,
      patch,
    ].join("\n");
  }

  if (file.status === "added") {
    return [`diff --git a/${filename} b/${filename}`, "new file mode 100644", patch].join("\n");
  }

  if (file.status === "removed") {
    return [`diff --git a/${filename} b/${filename}`, "deleted file mode 100644", patch].join(
      "\n",
    );
  }

  const oldPath = previous ?? filename;
  return [`diff --git a/${oldPath} b/${filename}`, patch].join("\n");
}
