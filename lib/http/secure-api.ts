import "server-only";

import { NextResponse } from "next/server";
import { z } from "zod";

import type { CoreOutcome } from "@/lib/mycel-core/types";

const ProjectIdSchema = z.string().uuid();
const MAX_JSON_BODY_BYTES = 1_000_000;

type ErrorStatus = 400 | 401 | 404 | 409 | 413 | 415 | 429 | 500;

export type SecureJsonBody =
  | Readonly<{ ok: true; value: unknown }>
  | Readonly<{ ok: false; response: NextResponse }>;

export function parseProjectId(value: string):
  | Readonly<{ ok: true; value: string }>
  | Readonly<{ ok: false; response: NextResponse }> {
  const parsed = ProjectIdSchema.safeParse(value);
  return parsed.success
    ? { ok: true, value: parsed.data }
    : { ok: false, response: apiErrorResponse(400, "INVALID_PROJECT_ID", "A valid project identifier is required.") };
}

export async function readSecureJsonBody(request: Request): Promise<SecureJsonBody> {
  const contentType = request.headers.get("content-type")?.split(";", 1)[0]?.trim().toLowerCase() ?? "";
  if (contentType !== "application/json" && !contentType.endsWith("+json")) {
    return {
      ok: false,
      response: apiErrorResponse(415, "UNSUPPORTED_MEDIA_TYPE", "This endpoint accepts JSON requests only."),
    };
  }

  const declaredLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > MAX_JSON_BODY_BYTES) {
    return {
      ok: false,
      response: apiErrorResponse(413, "REQUEST_TOO_LARGE", "The request body is too large."),
    };
  }

  let text: string;
  try {
    text = await request.text();
  } catch {
    return {
      ok: false,
      response: apiErrorResponse(400, "INVALID_JSON", "The request body could not be read."),
    };
  }

  if (new TextEncoder().encode(text).byteLength > MAX_JSON_BODY_BYTES) {
    return {
      ok: false,
      response: apiErrorResponse(413, "REQUEST_TOO_LARGE", "The request body is too large."),
    };
  }

  try {
    return { ok: true, value: JSON.parse(text) as unknown };
  } catch {
    return {
      ok: false,
      response: apiErrorResponse(400, "INVALID_JSON", "The request body must contain valid JSON."),
    };
  }
}

export function coreOutcomeResponse<Value, Details>(
  outcome: CoreOutcome<Value, Details>,
): NextResponse {
  if (outcome.ok) {
    return NextResponse.json(outcome.data, { headers: privateNoStoreHeaders() });
  }

  return apiErrorResponse(
    outcome.status,
    statusCode(outcome.status),
    outcome.error,
    outcome.status === 429 || outcome.status === 500,
    {
      decision: outcome.decision,
      ...(outcome.details === undefined ? {} : { details: outcome.details }),
    },
  );
}

export function unexpectedApiErrorResponse(): NextResponse {
  return apiErrorResponse(
    500,
    "INTERNAL_ERROR",
    "We could not complete that request. Please try again.",
    true,
  );
}

export function apiErrorResponse(
  status: ErrorStatus,
  code: string,
  message: string,
  retryable = false,
  additional: Readonly<Record<string, unknown>> = {},
): NextResponse {
  return NextResponse.json(
    { error: { code, message, retryable }, ...additional },
    { status, headers: privateNoStoreHeaders() },
  );
}

function statusCode(status: CoreOutcome<unknown>["status"]): string {
  if (status === 400) return "INVALID_REQUEST";
  if (status === 401) return "AUTHENTICATION_REQUIRED";
  if (status === 404) return "PROJECT_NOT_FOUND";
  if (status === 409) return "REQUEST_CONFLICT";
  if (status === 429) return "RATE_LIMITED";
  return "INTERNAL_ERROR";
}

function privateNoStoreHeaders(): HeadersInit {
  return { "Cache-Control": "private, no-store" };
}
