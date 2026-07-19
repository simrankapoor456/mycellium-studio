import { z } from "zod";

import { AiDiscoveryResponseSchema, type AiDiscoveryResponse } from "@/lib/domain/discovery/schemas";
import type { DecisionResult } from "@/lib/mycel-core/types";

export function validateRequest<Schema extends z.ZodType>(
  schema: Schema,
  input: unknown,
  explanation: string,
): DecisionResult<z.output<Schema>> {
  const parsed = schema.safeParse(input);

  if (!parsed.success) {
    return { status: "denied", explanation };
  }

  return { status: "allowed", explanation: "Request is valid.", value: parsed.data };
}

export function validateProviderProposal<Schema extends z.ZodType>(
  schema: Schema,
  input: unknown,
): DecisionResult<z.output<Schema>> {
  const parsed = schema.safeParse(input);

  if (!parsed.success) {
    return {
      status: "fallback_required",
      explanation: "AI output could not pass Mycel Core checks. Reliable mode is active.",
    };
  }

  return { status: "allowed", explanation: "AI proposal passed schema checks.", value: parsed.data };
}

export function validateAiDiscoveryProposal(
  input: unknown,
  validFactIds: ReadonlySet<string>,
): DecisionResult<AiDiscoveryResponse> {
  const decision = validateProviderProposal(AiDiscoveryResponseSchema, input);

  if (decision.status !== "allowed") {
    return decision;
  }

  if (decision.value.generationMode !== "ai") {
    return {
      status: "fallback_required",
      explanation: "AI output reported an invalid engine state. Reliable mode is active.",
    };
  }

  const hasUnknownSource = decision.value.challenges.some((challenge) =>
    challenge.sourceFactIds.some((id) => !validFactIds.has(id)),
  );

  if (hasUnknownSource) {
    return {
      status: "fallback_required",
      explanation: "AI output referenced unknown project context. Reliable mode is active.",
    };
  }

  return decision;
}
