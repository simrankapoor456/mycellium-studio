import type { DiscoveryFact, FactCategory, ReadinessAssessment } from "@/lib/domain/discovery/schemas";

export const DISCOVERY_CATEGORY_COPY: Record<FactCategory, { label: string; question: string }> = {
  business_objective: { label: "Business objective", question: "What should this product change for the person or business behind it?" },
  product_type: { label: "Product type", question: "Which product form best fits this experience?" },
  problem: { label: "Problem", question: "Where does the current approach break down for the person using it?" },
  target_users: { label: "Target users", question: "Who should feel that the first version was made specifically for them?" },
  use_cases: { label: "Primary outcome", question: "What is the one outcome the first version must help the user accomplish?" },
  success_metrics: { label: "Success measure", question: "What observable result would show that the first release is working?" },
  functional_requirements: { label: "Core capability", question: "Which capability is essential to make that outcome possible?" },
  non_functional_requirements: { label: "Quality expectation", question: "Which security, accessibility, reliability, or performance expectation cannot be compromised?" },
  constraints: { label: "Constraint", question: "Which budget, platform, policy, or delivery boundary will shape the design most?" },
  assumptions: { label: "Assumption", question: "Which important belief are you relying on but have not validated yet?" },
  risks: { label: "Risk", question: "What could make this product unsafe, frustrating, or not worth shipping?" },
  architecture_decisions: { label: "Technical boundary", question: "Is any technical boundary already decided, or should the architecture stay open for now?" },
  included_scope: { label: "Included scope", question: "Which capability must stay inside the first release boundary?" },
  excluded_scope: { label: "Excluded scope", question: "What should explicitly wait until later?" },
  technical_preferences: { label: "Technical preference", question: "Is there a technical preference worth preserving, or should this stay open?" },
  dependencies: { label: "Dependency", question: "Which outside system or data source could control whether the product works?" },
  unknowns: { label: "Open question", question: "Which unresolved choice would be most useful to settle next?" },
};

export const MYCELLIUM_COPY = {
  engineState: {
    ai_enhanced: "Mycel Core · AI enhanced",
    reliable: "Mycel Core · Reliable mode",
    ai_unavailable_reliable: "Mycel Core · AI unavailable, Reliable mode active",
  },
  mode: {
    ai: "AI-guided discovery",
    fallback: "Reliable mode",
    fallbackDetail: "Using Mycellium's built-in planning engine",
  },
  emptyStates: {
    discovery: "Start with what is clearest. Mycel Core will choose the next essential decision.",
    blueprint: "The idea has a starting point. Discovery will make its foundation explicit.",
  },
  transitions: {
    foundationChanged: "A product decision is now grounded in the foundation.",
    reviewReady: "This is enough to review a provisional foundation.",
    architectReady: "The foundation is ready to architect.",
  },
  review: {
    eyebrow: "Foundation review",
    title: "Review the product foundation.",
    description: "Keep what is true, correct what is not, and make the remaining unknowns intentional.",
    pendingTitle: "The foundation is ready for your judgment",
    pendingDetail: "Confirm essential decisions and explicitly carry any remaining uncertainty forward.",
    approvedTitle: "The foundation is ready to architect",
    approvedDetail: "Mycellium can now turn the approved foundation into a traceable Product Blueprint.",
  },
  generation: {
    idle: "Architect my product",
    active: "Creating the blueprint",
    reveal: "The saved architecture is ready.",
    complete: "Your Product Blueprint is ready.",
    failure: "The blueprint could not be created yet. Your approved foundation is safe, and exports will unlock after generation succeeds.",
  },
  export: {
    title: "Take the blueprint with you",
    description: "Every format is built from the latest saved version, including your edits.",
    lockedTitle: "Blueprint required",
    lockedDescription: "Create a persisted Product Blueprint before exporting.",
    unavailableAfterFailure: "Exports are still locked because blueprint generation did not finish.",
    preparing: "Preparing export",
    success: "Download ready",
    failure: "That export could not be prepared. Your blueprint is unchanged. Try again.",
  },
} as const;

type ReadinessPresentation = Readonly<{
  title: string;
  statusLabel: string;
  summary: string;
  momentum: string;
}>;

export function getReadinessPresentation(readiness: ReadinessAssessment): ReadinessPresentation {
  const rootedCount = readiness.rootedAreas.length;
  const clarityCount = readiness.areasNeedingClarification.length;
  const contradictionCount = readiness.contradictions.length;

  if (contradictionCount > 0) {
    return {
      title: "Foundation readiness",
      statusLabel: "Decision needed",
      summary: `${rootedCount} ${pluralize("area", rootedCount)} rooted. ${contradictionCount} conflicting ${pluralize("direction", contradictionCount)} must be resolved.`,
      momentum: "Resolve the conflicting direction before architecture is created.",
    };
  }

  if (readiness.status === "ready") {
    return {
      title: "Foundation readiness",
      statusLabel: "Ready to architect",
      summary: `${rootedCount} ${pluralize("area", rootedCount)} rooted. Remaining unknowns can stay documented without changing the core architecture.`,
      momentum: MYCELLIUM_COPY.transitions.architectReady,
    };
  }

  if (readiness.status === "needs_review") {
    return {
      title: "Foundation readiness",
      statusLabel: "Ready for review",
      summary: `${rootedCount} ${pluralize("area", rootedCount)} rooted. ${clarityCount} recommended ${pluralize("refinement", clarityCount)} remain.`,
      momentum: "Review now or continue with the next useful decision.",
    };
  }

  return {
    title: "Foundation readiness",
    statusLabel: "Building context",
    summary: `${rootedCount} ${pluralize("area", rootedCount)} rooted. ${readiness.criticalGaps.length} essential ${pluralize("decision", readiness.criticalGaps.length)} remain open.`,
    momentum: rootedCount >= 3 ? "The next essential decision will improve the provisional foundation." : "Start with the product outcome, user, and problem.",
  };
}

export function buildDiscoveryTransitionMessage(
  before: ReadinessAssessment,
  after: ReadinessAssessment,
  facts: readonly DiscoveryFact[],
): string {
  if (after.contradictions.length > before.contradictions.length) {
    return "This answer conflicts with an earlier direction. The choice stays open until it is resolved in Foundation Review.";
  }

  if (facts.length === 0) {
    return "This answer did not change a product decision yet. Add a concrete outcome, boundary, or user need when it becomes clear.";
  }

  if (facts.every((fact) => fact.status === "unknown")) {
    return "The decision is recorded as unknown. It stays visible and is not treated as a confirmed fact.";
  }

  if (after.status === "ready" && before.status !== "ready") {
    return MYCELLIUM_COPY.transitions.reviewReady;
  }

  const criticalImprovement = before.criticalGaps.length - after.criticalGaps.length;
  const labels = [...new Set(facts.map((fact) => DISCOVERY_CATEGORY_COPY[fact.category].label))].slice(0, 2);
  const subject = joinNaturally(labels);

  if (criticalImprovement > 0) {
    return `${subject} is now grounded. ${after.criticalGaps.length} essential ${pluralize("decision", after.criticalGaps.length)} remain open.`;
  }

  if (facts.some((fact) => ["included_scope", "excluded_scope", "constraints"].includes(fact.category))) {
    return `${subject} now defines a clearer product boundary. Open items remain separate from confirmed scope.`;
  }

  return `${subject} is now part of the product foundation. ${after.areasNeedingClarification.length} recommended ${pluralize("refinement", after.areasNeedingClarification.length)} remain.`;
}

export function buildDiscoveryControlMessage(
  action: "mark_unknown" | "ask_later",
  category: FactCategory,
  readiness: ReadinessAssessment,
): string {
  const label = DISCOVERY_CATEGORY_COPY[category].label;
  const state = action === "ask_later"
    ? `${label} is deferred and will remain visible in Foundation Review.`
    : `${label} is recorded as unknown and will not be treated as a confirmed fact.`;
  const next = readiness.status === "ready"
    ? " The current foundation is ready to review."
    : ` ${readiness.criticalGaps.length} essential ${pluralize("decision", readiness.criticalGaps.length)} remain open.`;
  return `${state}${next}`;
}

export function buildContradictionDescription(category: FactCategory): string {
  const label = DISCOVERY_CATEGORY_COPY[category].label.toLowerCase();
  return `Two different answers exist for ${label}. Choose one direction before architecture is created.`;
}

function joinNaturally(items: readonly string[]): string {
  if (items.length < 2) return items[0] ?? "The product direction";
  return `${items[0]} and ${items[1]}`;
}

function pluralize(noun: string, count: number): string {
  return count === 1 ? noun : `${noun}s`;
}
