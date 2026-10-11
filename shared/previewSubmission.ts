export const PREVIEW_SUBMISSION_DISABLED_CODE = "PREVIEW_SUBMISSION_DISABLED" as const;
export const PREVIEW_SUBMISSION_DISABLED_MESSAGE =
  "Submissions are unavailable in this preview. Please use the live website to contact Concrete Concepts Group.";

/** A terminal client-side refusal: callers must not retry, fall back, or report success. */
export class PreviewSubmissionDisabledError extends Error {
  readonly code = PREVIEW_SUBMISSION_DISABLED_CODE;

  constructor(message = PREVIEW_SUBMISSION_DISABLED_MESSAGE) {
    super(message);
    this.name = "PreviewSubmissionDisabledError";
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isPreviewMarker(value: unknown): boolean {
  return value === PREVIEW_SUBMISSION_DISABLED_CODE
    || (typeof value === "string" && value.includes(PREVIEW_SUBMISSION_DISABLED_CODE));
}

/**
 * Detect the terminal refusal across REST JSON and tRPC's single/batch error
 * envelopes. The bounded walk intentionally examines values rather than a
 * particular transport envelope shape, so a library envelope change cannot
 * accidentally reopen an email fallback.
 */
export function isPreviewSubmissionDisabled(error: unknown): boolean {
  if (error instanceof PreviewSubmissionDisabledError) return true;

  const seen = new Set<object>();
  const pending: unknown[] = [error];
  let inspected = 0;

  while (pending.length > 0 && inspected < 128) {
    const current = pending.pop();
    inspected += 1;

    if (isPreviewMarker(current)) return true;
    if (current instanceof Error && isPreviewMarker(current.message)) return true;
    if (Array.isArray(current)) {
      pending.push(...current);
      continue;
    }
    if (!isRecord(current) || seen.has(current)) continue;
    seen.add(current);

    for (const [key, value] of Object.entries(current)) {
      if ((key === "code" || key === "previewCode" || key === "message") && isPreviewMarker(value)) {
        return true;
      }
      if (["data", "error", "json", "body", "response", "cause", "errors", "result", "shape"].includes(key)) {
        pending.push(value);
      }
    }
  }

  return false;
}
