import type { DiscoveryFact, FactCategory, ReadinessAssessment } from "@/lib/domain/discovery/schemas";

export const DISCOVERY_CATEGORY_COPY: Record<FactCategory, { label: string; question: string }> = {
  business_objective: { label: "Business objective", question: "What should this product change for the person or business behind it?" },
  product_type: { label: "Product type", question: "Which product form best fits this experience?" },
  problem: { label: "Problem", question: "Where does the current approach break down for the person using it?" },
  target_users: { label: "Target users", question: "Who should feel that the first version was made specifically for them?" },
  use_cases: { label: "Primary outcome", question: "What is the one outcome the first version must help the user accomplish?" },
  success_metrics: { label: "Success measure", question: "What observable result would convince you the first release is working?" },
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
    discovery: "Start wherever the idea feels clearest. I'll help find the next useful question.",
    blueprint: "The idea has a starting point. Discovery will give it a shape we can architect.",
  },
  transitions: {
    ideaHasShape: "The idea has a shape now.",
    foundationGrowing: "The foundation is getting stronger.",
    reviewReady: "I think I understand the product. Let's review the foundation.",
    architectReady: "Your product is ready to be architected.",
  },
  review: {
    eyebrow: "Foundation review",
    title: "Let's make sure I have the product right.",
    description: "Keep what is true, correct what is not, and make the remaining unknowns intentional.",
    pendingTitle: "A few decisions still need your judgment",
    pendingDetail: "Your approval locks the exact foundation used to create the blueprint.",
    approvedTitle: "Your product is ready to be architected",
    approvedDetail: "The foundation is approved. Mycellium can now turn it into a traceable plan.",
  },
  generation: {
    idle: "Architect my product",
    active: "Shaping the blueprint",
    reveal: "The blueprint is taking form.",
    complete: "Your Product Blueprint is ready.",
    failure: "The blueprint could not be created yet. Your approved foundation is safe, and exports will unlock after generation succeeds.",
  },
  export: {
    title: "Take the blueprint with you",
    description: "Every format is built from the latest saved version, including your edits.",
    lockedTitle: "Exports unlock with your first Product Blueprint",
    lockedDescription: "Exports become available after your first Product Blueprint is created.",
    unavailableAfterFailure: "Exports are still locked because blueprint generation did not finish.",
    preparing: "Preparing export",
    success: "Download ready",
    failure: "That export could not be prepared. Try again in a moment.",
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
      title: `Foundation strength: ${readiness.score}%`,
      statusLabel: "Decision needed",
      summary: `${rootedCount} ${pluralize("area", rootedCount)} rooted. ${contradictionCount} ${pluralize("contradiction", contradictionCount)} still ${contradictionCount === 1 ? "needs" : "need"} a clear answer.`,
      momentum: contradictionCount === 1 ? "One contradiction is holding the plan back." : "A few contradictions are holding the plan back.",
    };
  }

  if (readiness.status === "ready") {
    return {
      title: `Foundation strength: ${readiness.score}%`,
      statusLabel: "Ready to architect",
      summary: `${rootedCount} ${pluralize("area", rootedCount)} rooted. The remaining unknowns will not change the core architecture.`,
      momentum: MYCELLIUM_COPY.transitions.architectReady,
    };
  }

  if (readiness.status === "needs_review") {
    return {
      title: `Foundation strength: ${readiness.score}%`,
      statusLabel: "Ready for review",
      summary: `${rootedCount} ${pluralize("area", rootedCount)} rooted. ${clarityCount} ${pluralize("decision", clarityCount)} still ${clarityCount === 1 ? "needs" : "need"} clarity.`,
      momentum: MYCELLIUM_COPY.transitions.foundationGrowing,
    };
  }

  return {
    title: `Foundation strength: ${readiness.score}%`,
    statusLabel: "Taking shape",
    summary: `${rootedCount} ${pluralize("area", rootedCount)} rooted. ${clarityCount} ${pluralize("area", clarityCount)} still ${clarityCount === 1 ? "needs" : "need"} clarity.`,
    momentum: rootedCount >= 3 ? MYCELLIUM_COPY.transitions.ideaHasShape : "We're finding the product's strongest roots.",
  };
}

export function buildDiscoveryAcknowledgement(facts: readonly DiscoveryFact[], seed: string): string {
  if (facts.length === 0) {
    return selectStableCopy([
      "I hear the direction, but it has not changed the product foundation yet.",
      "That helps me follow your thinking. I still need one concrete product decision to root it.",
    ], seed);
  }

  if (facts.every((fact) => fact.status === "unknown")) {
    return selectStableCopy([
      "That's a useful unknown. I'll keep it visible instead of filling in the blank.",
      "Fair — that decision is still open. We can design around the uncertainty for now.",
      "Good to name what is not decided yet. I won't pretend we know more than we do.",
    ], seed);
  }

  const categories = new Set(facts.map((fact) => fact.category));

  if (categories.has("target_users")) {
    return selectStableCopy([
      "That gives us a clearer picture of who this is for.",
      "Good — the first user is coming into focus.",
      "Now we have someone specific to design for.",
    ], seed);
  }

  if (categories.has("problem")) {
    return selectStableCopy([
      "That makes the pain much more concrete.",
      "Good — now we can see where the current workflow breaks down.",
      "That gives the product a problem worth organizing around.",
    ], seed);
  }

  if (categories.has("business_objective")) {
    return selectStableCopy([
      "That gives the product a sharper reason to exist.",
      "Good — the outcome behind the idea is clearer now.",
      "Now we know what this product needs to change.",
    ], seed);
  }

  const labels = [...new Set(facts.map((fact) => DISCOVERY_CATEGORY_COPY[fact.category].label.toLowerCase()))].slice(0, 2);

  return selectStableCopy([
    `That adds real shape around ${joinNaturally(labels)}.`,
    `Useful — ${joinNaturally(labels)} ${labels.length === 1 ? "is" : "are"} clearer now.`,
    `I can place ${joinNaturally(labels)} more confidently in the product foundation.`,
  ], seed);
}

export function buildDiscoveryInsight(readiness: ReadinessAssessment): string {
  const presentation = getReadinessPresentation(readiness);

  if (readiness.contradictions.length > 0) {
    return "I'm seeing a possible contradiction here. We should settle it before it shapes the architecture.";
  }

  if (readiness.status === "ready") {
    return MYCELLIUM_COPY.transitions.reviewReady;
  }

  return presentation.momentum;
}

export function buildContradictionDescription(category: FactCategory): string {
  const label = DISCOVERY_CATEGORY_COPY[category].label.toLowerCase();
  return `I'm seeing two different answers for ${label}. One decision needs to win before the plan can settle.`;
}

export function selectStableCopy(options: readonly string[], seed: string): string {
  let hash = 0;

  for (let index = 0; index < seed.length; index += 1) {
    hash = Math.imul(hash, 31) + seed.charCodeAt(index);
  }

  return options[Math.abs(hash) % options.length] ?? options[0] ?? "";
}

function joinNaturally(items: readonly string[]): string {
  if (items.length < 2) {
    return items[0] ?? "the product";
  }

  return `${items[0]} and ${items[1]}`;
}

function pluralize(noun: string, count: number): string {
  return count === 1 ? noun : `${noun}s`;
}
