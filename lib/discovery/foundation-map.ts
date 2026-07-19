import type { DiscoveryContext, FactCategory, ReadinessAssessment } from "@/lib/domain/discovery/schemas";

export const FOUNDATION_AREAS = [
  { id: "users", label: "Users", categories: ["target_users", "use_cases"] },
  { id: "problem", label: "Problem", categories: ["problem"] },
  { id: "outcome", label: "Outcome", categories: ["business_objective", "success_metrics"] },
  { id: "evidence", label: "Evidence", categories: ["assumptions", "unknowns"] },
  { id: "scope", label: "Scope", categories: ["functional_requirements", "non_functional_requirements", "included_scope", "excluded_scope"] },
  { id: "feasibility", label: "Feasibility", categories: ["constraints", "technical_preferences", "dependencies", "architecture_decisions"] },
  { id: "risks", label: "Risks", categories: ["risks"] },
] as const satisfies readonly Readonly<{ id: string; label: string; categories: readonly FactCategory[] }>[];

export type FoundationAreaState = "rooted" | "emerging" | "unresolved" | "blocked";

export type FoundationArea = Readonly<{
  id: typeof FOUNDATION_AREAS[number]["id"];
  label: string;
  state: FoundationAreaState;
  facts: DiscoveryContext["facts"];
  gaps: FactCategory[];
}>;

export function buildFoundationAreas(
  context: DiscoveryContext,
  readiness: ReadinessAssessment,
): FoundationArea[] {
  const activeFacts = context.facts.filter((fact) => fact.deletedAt === null && fact.status !== "rejected");
  const blockedFactIds = new Set([
    ...context.contradictions.filter((item) => item.status === "open").flatMap((item) => item.factIds),
    ...context.challenges.filter((item) => item.status === "open" && ["critical", "material"].includes(item.severity)).flatMap((item) => item.sourceFactIds),
  ]);

  return FOUNDATION_AREAS.map((area) => {
    const categories = new Set<FactCategory>(area.categories);
    const facts = activeFacts.filter((fact) => categories.has(fact.category));
    const gaps = readiness.criticalGaps.filter((category) => categories.has(category));
    const blocked = facts.some((fact) => blockedFactIds.has(fact.id));
    const confirmed = facts.some((fact) => fact.status === "confirmed");
    const emerging = facts.some((fact) => fact.status === "inferred");
    let state: FoundationAreaState = "unresolved";

    if (blocked) state = "blocked";
    else if (confirmed && gaps.length === 0) state = "rooted";
    else if (confirmed || emerging) state = "emerging";

    return { id: area.id, label: area.label, state, facts, gaps };
  });
}
