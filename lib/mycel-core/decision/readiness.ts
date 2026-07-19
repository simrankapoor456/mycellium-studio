import type { ProductBlueprint } from "@/lib/domain/blueprint/schemas";
import type { DiscoveryContext, ReadinessAssessment } from "@/lib/domain/discovery/schemas";
import type { Project } from "@/lib/domain/project/schemas";
import type { DecisionResult } from "@/lib/mycel-core/types";
import { hasBlockingChallenges } from "@/lib/mycel-core/decision/challenges";

export function decideContextApproval(
  context: DiscoveryContext,
  readiness: ReadinessAssessment,
): DecisionResult<DiscoveryContext> {
  if (readiness.status === "discovering") {
    return { status: "requires_clarification", explanation: "A few foundation decisions still need clarity before approval." };
  }

  if (context.contradictions.some((item) => item.status === "open")) {
    return { status: "requires_clarification", explanation: "Resolve the open contradiction before approval." };
  }

  if (hasBlockingChallenges(context)) {
    return { status: "requires_review", explanation: "Review each material challenge before approval." };
  }

  return { status: "allowed", explanation: "The product foundation is ready for approval.", value: context };
}

export function decideBlueprintGeneration(project: Project): DecisionResult<Project> {
  if (!project.approved_discovery_context || !project.discovery_approved_at) {
    return { status: "requires_review", explanation: "Approve the product foundation before architecture." };
  }

  return { status: "allowed", explanation: "The approved foundation can be architected.", value: project };
}

export function decideBlueprintExport(blueprint: ProductBlueprint | null): DecisionResult<ProductBlueprint> {
  if (!blueprint) {
    return { status: "requires_review", explanation: "Exports become available after your first Product Blueprint is created." };
  }

  return { status: "allowed", explanation: "The latest saved blueprint can be exported.", value: blueprint };
}
