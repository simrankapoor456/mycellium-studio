import type { DiscoveryContext, FactCategory, ReadinessAssessment } from "@/lib/domain/discovery/schemas";
import { DISCOVERY_CATEGORY_COPY } from "@/lib/voice/mycellium";

export type FoundationReviewItem = Readonly<{
  id: string;
  label: string;
  detail: string;
  targetId: string;
}>;

export type FoundationReviewGroup = Readonly<{
  id: "blocking" | "recommended" | "deferred" | "contradictions" | "challenges";
  label: string;
  description: string;
  items: FoundationReviewItem[];
}>;

export function buildFoundationReviewGroups(
  context: DiscoveryContext,
  readiness: ReadinessAssessment,
): FoundationReviewGroup[] {
  const activeFacts = context.facts.filter((fact) => fact.deletedAt === null && fact.status !== "rejected");
  const unknownFacts = activeFacts.filter((fact) => fact.status === "unknown");
  const unknownCategories = new Set(unknownFacts.map((fact) => fact.category));
  const criticalCategories = new Set(readiness.criticalGaps);

  const blocking = readiness.criticalGaps
    .filter((category) => !unknownCategories.has(category))
    .map((category) => ({
      id: `blocking-${category}`,
      label: `${DISCOVERY_CATEGORY_COPY[category].label} needs a grounded decision`,
      detail: "Resolve this essential area before architecture is committed.",
      targetId: `foundation-area-${foundationAreaForCategory(category)}`,
    }));

  const recommended = readiness.areasNeedingClarification
    .filter((category) => !criticalCategories.has(category) && !unknownCategories.has(category))
    .map((category) => ({
      id: `recommended-${category}`,
      label: DISCOVERY_CATEGORY_COPY[category].label,
      detail: "This refinement can improve the blueprint but does not need to become a fabricated fact.",
      targetId: `foundation-area-${foundationAreaForCategory(category)}`,
    }));

  const deferred = unknownFacts.map((fact) => ({
    id: `deferred-${fact.id}`,
    label: fact.label,
    detail: context.acceptedUnknownFactIds.includes(fact.id)
      ? "Explicitly carried forward as an unknown."
      : "Keep unknown, clarify it, or accept it as a documented assumption.",
    targetId: `review-fact-${fact.id}`,
  }));

  const contradictions = context.contradictions
    .filter((item) => item.status === "open")
    .map((item) => ({
      id: `contradiction-${item.id}`,
      label: "Choose one product direction",
      detail: item.description,
      targetId: `review-contradiction-${item.id}`,
    }));

  const challenges = context.challenges
    .filter((item) => item.status !== "resolved")
    .map((item) => ({
      id: `challenge-${item.id}`,
      label: item.title,
      detail: `${formatValue(item.severity)}. ${formatValue(item.status)}.`,
      targetId: `review-challenge-${item.id}`,
    }));

  return [
    { id: "blocking", label: "Blocking decisions", description: "Required before architecture can be committed safely.", items: blocking },
    { id: "recommended", label: "Recommended clarifications", description: "Improve quality without turning uncertainty into a fact.", items: recommended },
    { id: "deferred", label: "Deferred unknowns", description: "Intentionally unresolved and carried forward explicitly.", items: deferred },
    { id: "contradictions", label: "Contradictions", description: "Need a documented choice before architecture is created.", items: contradictions },
    { id: "challenges", label: "Challenges", description: "Accept, mitigate, or resolve these using the existing product rules.", items: challenges },
  ];
}

function foundationAreaForCategory(category: FactCategory): string {
  if (category === "target_users" || category === "use_cases") return "users";
  if (category === "problem") return "problem";
  if (category === "business_objective" || category === "success_metrics") return "outcome";
  if (category === "risks" || category === "unknowns") return "risks";
  if (["constraints", "technical_preferences", "dependencies", "architecture_decisions"].includes(category)) return "feasibility";
  if (category === "included_scope" || category === "excluded_scope" || category.includes("requirements")) return "scope";
  return "evidence";
}

function formatValue(value: string): string {
  const normalized = value.replaceAll("_", " ");
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}
