import type { ProductBlueprint } from "@/lib/domain/blueprint/schemas";
import {
  FoundationApprovalDetailsSchema,
  type DiscoveryContext,
  type FoundationApprovalDetails,
  type FoundationBlocker,
  type ReadinessAssessment,
} from "@/lib/domain/discovery/schemas";
import type { Project } from "@/lib/domain/project/schemas";
import type { DecisionResult } from "@/lib/mycel-core/types";
import { hasBlockingChallenges } from "@/lib/mycel-core/decision/challenges";

export function decideContextApproval(
  context: DiscoveryContext,
  readiness: ReadinessAssessment,
): DecisionResult<DiscoveryContext, FoundationApprovalDetails> {
  const details = buildFoundationApprovalDetails(context, readiness);

  if (details) {
    const requiresClarification = details.counts.missingFoundation > 0
      || details.counts.unknowns > 0
      || details.counts.contradictions > 0;

    return {
      status: requiresClarification ? "requires_clarification" : "requires_review",
      explanation: details.summary,
      details,
    };
  }

  return { status: "allowed", explanation: "The product foundation is ready for approval.", value: context };
}

export function buildFoundationApprovalDetails(
  context: DiscoveryContext,
  readiness: ReadinessAssessment,
): FoundationApprovalDetails | null {
  const unknownFacts = context.facts.filter((fact) =>
    fact.deletedAt === null
    && fact.status === "unknown"
    && !context.acceptedUnknownFactIds.includes(fact.id),
  );
  const unknownCategories = new Set(unknownFacts.map((fact) => fact.category));
  const missingFoundation: FoundationBlocker[] = readiness.criticalGaps
    .filter((category) => !unknownCategories.has(category))
    .map((category) => ({
      id: `gap-${category}`,
      kind: "missing_foundation",
      label: `${formatCategory(category)} needs clarity`,
      detail: "Add or confirm this part of the product foundation in discovery.",
      targetId: `foundation-area-${foundationAreaForCategory(category)}`,
    }));
  const unknowns: FoundationBlocker[] = unknownFacts.map((fact) => ({
    id: fact.id,
    kind: "unknown",
    label: `${fact.label} is still open`,
    detail: "Clarify this item or explicitly plan around the unknown.",
    targetId: `review-fact-${fact.id}`,
  }));
  const contradictions: FoundationBlocker[] = context.contradictions
    .filter((item) => item.status === "open")
    .map((item) => ({
      id: item.id,
      kind: "contradiction",
      label: "Two directions still conflict",
      detail: item.description,
      targetId: `review-contradiction-${item.id}`,
    }));
  const challenges: FoundationBlocker[] = context.challenges
    .filter((challenge) => challenge.status === "open" && ["critical", "material"].includes(challenge.severity))
    .map((challenge) => ({
      id: challenge.id,
      kind: "challenge",
      label: challenge.title,
      detail: challenge.description,
      targetId: `review-challenge-${challenge.id}`,
    }));
  const blockers = [...missingFoundation, ...unknowns, ...contradictions, ...challenges];

  if (blockers.length === 0 && readiness.status !== "discovering" && !hasBlockingChallenges(context)) {
    return null;
  }

  if (blockers.length === 0) {
    missingFoundation.push({
      id: "gap-foundation",
      kind: "missing_foundation",
      label: "The core product direction needs clarity",
      detail: "Continue discovery until the essential product direction is grounded.",
      targetId: "foundation-area-outcome",
    });
    blockers.push(...missingFoundation);
  }

  return FoundationApprovalDetailsSchema.parse({
    total: blockers.length,
    summary: blockerSummary(blockers.length),
    counts: {
      missingFoundation: missingFoundation.length,
      unknowns: unknowns.length,
      contradictions: contradictions.length,
      challenges: challenges.length,
    },
    blockers,
  });
}

function blockerSummary(total: number): string {
  if (total === 1) {
    return "One decision still needs your input before Mycel Core can architect the product.";
  }

  return `${total} decisions still need your input before Mycel Core can architect the product.`;
}

function formatCategory(category: string): string {
  const value = category.replaceAll("_", " ");
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function foundationAreaForCategory(category: string): string {
  if (category === "target_users" || category === "use_cases") return "users";
  if (category === "problem") return "problem";
  if (category === "business_objective" || category === "success_metrics") return "outcome";
  if (category === "risks" || category === "unknowns") return "risks";
  if (category === "constraints" || category === "technical_preferences" || category === "dependencies") return "feasibility";
  if (category === "included_scope" || category === "excluded_scope" || category.includes("requirements")) return "scope";
  return "evidence";
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
