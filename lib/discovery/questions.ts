import type { DiscoveryContext, FactCategory } from "@/lib/domain/discovery/schemas";
import { DISCOVERY_CATEGORY_COPY } from "@/lib/voice/mycellium";

export const DISCOVERY_CATEGORY_ORDER = [
  "business_objective",
  "product_type",
  "target_users",
  "use_cases",
  "problem",
  "success_metrics",
  "functional_requirements",
  "constraints",
  "risks",
  "non_functional_requirements",
  "assumptions",
  "architecture_decisions",
  "included_scope",
  "excluded_scope",
  "technical_preferences",
  "dependencies",
] as const satisfies readonly FactCategory[];

export type DiscoveryPrompt = Readonly<{
  id: string;
  category: FactCategory;
  question: string;
  reason: string;
}>;

export function getNextDiscoveryPrompt(context: DiscoveryContext): DiscoveryPrompt | null {
  const covered = new Set(context.facts
    .filter((fact) => fact.deletedAt === null && fact.status !== "rejected")
    .map((fact) => fact.category));
  const category = DISCOVERY_CATEGORY_ORDER.find((candidate) => !covered.has(candidate));
  if (!category) return null;

  return {
    id: `category:${category}`,
    category,
    question: DISCOVERY_CATEGORY_COPY[category].question,
    reason: questionReasonFor(category),
  };
}

function questionReasonFor(category: FactCategory): string {
  if (category === "use_cases") {
    return "This separates the essential product outcome from capabilities that can wait.";
  }

  if (["business_objective", "problem", "target_users", "success_metrics"].includes(category)) {
    return "This decision shapes the core product outcome and the scope built around it.";
  }

  return "This makes the next architecture and delivery trade-off more grounded.";
}
