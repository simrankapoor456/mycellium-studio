export const BLUEPRINT_INTERRUPTED_MESSAGE =
  "Blueprint generation was interrupted before a complete response was received. Your foundation is still saved. Retry generation.";

export type SafeResponseErrorCode =
  | "EMPTY_RESPONSE"
  | "INVALID_JSON"
  | "NON_JSON_RESPONSE"
  | "RESPONSE_ABORTED"
  | "RESPONSE_INTERRUPTED";

export type SafeJsonResponse =
  | Readonly<{ ok: true; body: unknown }>
  | Readonly<{
      ok: false;
      error: Readonly<{
        code: SafeResponseErrorCode;
        message: string;
        retryable: true;
      }>;
    }>;

export async function readJsonResponseSafely(response: Pick<Response, "status" | "text">): Promise<SafeJsonResponse> {
  if (response.status === 204) return interrupted("EMPTY_RESPONSE");

  let text: string;
  try {
    text = await response.text();
  } catch (error) {
    return interrupted(isAbortError(error) ? "RESPONSE_ABORTED" : "RESPONSE_INTERRUPTED");
  }

  if (!text.trim()) return interrupted("EMPTY_RESPONSE");

  try {
    return { ok: true, body: JSON.parse(text) as unknown };
  } catch {
    return interrupted(looksLikeHtml(text) ? "NON_JSON_RESPONSE" : "INVALID_JSON");
  }
}

export function readTypedApiError(
  input: unknown,
  fallback = BLUEPRINT_INTERRUPTED_MESSAGE,
): Readonly<{ code: string; message: string; retryable: boolean }> {
  if (typeof input !== "object" || input === null || !("error" in input)) {
    return { code: "GENERATION_INTERRUPTED", message: fallback, retryable: true };
  }

  const error = input.error;
  if (typeof error !== "object" || error === null) {
    return { code: "GENERATION_INTERRUPTED", message: fallback, retryable: true };
  }

  const code = "code" in error && typeof error.code === "string" ? error.code : "GENERATION_INTERRUPTED";
  const message = "message" in error && typeof error.message === "string" ? error.message : fallback;
  const retryable = !("retryable" in error) || error.retryable !== false;
  return { code, message, retryable };
}

function interrupted(code: SafeResponseErrorCode): SafeJsonResponse {
  return { ok: false, error: { code, message: BLUEPRINT_INTERRUPTED_MESSAGE, retryable: true } };
}

function isAbortError(error: unknown): boolean {
  return typeof error === "object" && error !== null && "name" in error && error.name === "AbortError";
}

function looksLikeHtml(text: string): boolean {
  const normalized = text.trimStart().toLowerCase();
  return normalized.startsWith("<!doctype html") || normalized.startsWith("<html");
}
