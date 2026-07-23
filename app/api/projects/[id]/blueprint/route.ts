import { NextResponse } from "next/server";

import { BLUEPRINT_INTERRUPTED_MESSAGE } from "@/lib/errors/response";
import { parseProjectId, readSecureJsonBody } from "@/lib/http/secure-api";
import { orchestrateBlueprintEdit, orchestrateBlueprintGeneration } from "@/lib/mycel-core/orchestration";
import { logBlueprintGeneration, safeGenerationErrorCode } from "@/lib/mycel-core/generation-logging";
import type { CoreOutcome } from "@/lib/mycel-core/types";

export const maxDuration = 60;

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return handleBlueprintRequest(request, params, "generation");
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return handleBlueprintRequest(request, params, "edit");
}

async function handleBlueprintRequest(
  request: Request,
  params: Promise<{ id: string }>,
  operation: "generation" | "edit",
) {
  let requestId: string | null = null;
  try {
    const { id } = await params;
    const projectId = parseProjectId(id);
    if (!projectId.ok) return projectId.response;
    const parsedBody = await readSecureJsonBody(request);
    if (!parsedBody.ok) return parsedBody.response;
    requestId = readRequestId(parsedBody.value);
    const outcome = operation === "generation"
      ? await orchestrateBlueprintGeneration(projectId.value, parsedBody.value)
      : await orchestrateBlueprintEdit(projectId.value, parsedBody.value);

    if (outcome.ok) {
      logBlueprintGeneration("response_completion", { operation, requestId, status: 200 });
      return NextResponse.json(outcome.data);
    }

    logBlueprintGeneration("response_completion", { operation, requestId, status: outcome.status }, outcome.status >= 500 ? "error" : "warn");
    return NextResponse.json({
      error: apiError(outcome, operation),
      decision: outcome.decision,
      ...(outcome.details === undefined ? {} : { details: outcome.details }),
    }, { status: outcome.status });
  } catch (error) {
    logBlueprintGeneration("response_completion", {
      operation,
      requestId,
      status: 500,
      errorCode: safeGenerationErrorCode(error),
    }, "error");
    return NextResponse.json({
      error: {
        code: operation === "generation" ? "GENERATION_INTERRUPTED" : "BLUEPRINT_EDIT_INTERRUPTED",
        message: operation === "generation"
          ? BLUEPRINT_INTERRUPTED_MESSAGE
          : "The blueprint change was interrupted. Your edits are still here. Retry.",
        retryable: true,
      },
    }, { status: 500 });
  }
}

function readRequestId(input: unknown): string | null {
  return typeof input === "object" && input !== null && "requestId" in input && typeof input.requestId === "string"
    ? input.requestId
    : null;
}

function apiError(outcome: Extract<CoreOutcome<unknown, unknown>, { ok: false }>, operation: "generation" | "edit") {
  const code = outcome.status === 400 ? "INVALID_REQUEST"
    : outcome.status === 401 ? "AUTHENTICATION_REQUIRED"
      : outcome.status === 404 ? "PROJECT_NOT_FOUND"
        : outcome.status === 409 ? operation === "generation" ? "GENERATION_NOT_READY" : "BLUEPRINT_EDIT_CONFLICT"
          : outcome.status === 429 ? "RATE_LIMITED"
            : operation === "generation" ? "GENERATION_FAILED" : "BLUEPRINT_EDIT_FAILED";
  return {
    code,
    message: outcome.error,
    retryable: outcome.status === 429 || outcome.status === 500,
  };
}
