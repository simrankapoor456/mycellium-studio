import type { DecisionResult } from "@/lib/mycel-core/types";

export function decisionHttpStatus(decision: DecisionResult<unknown>): number {
  if (decision.status === "denied") {
    return decision.explanation === "Sign in to continue." ? 401 : 404;
  }

  if (decision.status === "requires_review" || decision.status === "requires_clarification") {
    return 409;
  }

  if (decision.status === "fallback_required") {
    return 503;
  }

  return 200;
}

export function decisionError(decision: Exclude<DecisionResult<unknown>, { status: "allowed" }>) {
  return { error: decision.explanation, decision: decision.status } as const;
}
