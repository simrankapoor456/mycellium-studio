import {
  AiDiscoveryResponseSchema,
  DiscoveryContextSchema,
  DiscoveryTurnResponseSchema,
  GraphChangesSchema,
  ProductGraphSchema,
  ReadinessAssessmentSchema,
  type AiDiscoveryResponse,
  type DiscoveryContext,
  type DiscoveryFact,
  type DiscoveryReviewInput,
  type DiscoveryTurnResponse,
  type FactCategory,
  type ProductGraph,
  type ReadinessAssessment,
} from "@/lib/domain/discovery/schemas";

const CATEGORY_ORDER = [
  "business_objective",
  "problem",
  "target_users",
  "use_cases",
  "success_metrics",
  "functional_requirements",
  "constraints",
  "risks",
  "non_functional_requirements",
  "assumptions",
  "architecture_decisions",
] as const satisfies readonly FactCategory[];

const CATEGORY_CONFIG: Record<FactCategory, { label: string; question: string; weight: number; critical: boolean; single: boolean }> = {
  business_objective: { label: "Business objective", question: "What should this product change for the business or person funding it?", weight: 14, critical: true, single: true },
  problem: { label: "Problem", question: "What painful situation should the first version solve, in the user's own workflow?", weight: 14, critical: true, single: true },
  target_users: { label: "Target users", question: "Who is the first version specifically for?", weight: 14, critical: true, single: false },
  use_cases: { label: "Primary use case", question: "What is the one outcome that user must complete in the first release?", weight: 14, critical: true, single: false },
  success_metrics: { label: "Success metric", question: "What observable result would tell you the first release is working?", weight: 10, critical: true, single: false },
  functional_requirements: { label: "Functional requirement", question: "Which capability is essential for that first successful outcome?", weight: 10, critical: false, single: false },
  non_functional_requirements: { label: "Quality requirement", question: "Are there security, accessibility, reliability, or performance expectations we must treat as requirements?", weight: 5, critical: false, single: false },
  constraints: { label: "Constraint", question: "Which deadline, budget, platform, or policy constraint most affects the design?", weight: 10, critical: false, single: false },
  assumptions: { label: "Assumption", question: "Which important belief are you relying on but have not validated yet?", weight: 4, critical: false, single: false },
  risks: { label: "Risk", question: "What could make this product unsafe, unusable, or not worth shipping?", weight: 6, critical: false, single: false },
  architecture_decisions: { label: "Architecture decision", question: "Is there a technical boundary already decided, or should architecture remain open?", weight: 3, critical: false, single: false },
  unknowns: { label: "Unknown", question: "Which unresolved choice would be most useful to clarify next?", weight: 0, critical: false, single: false },
};

type ProjectSeed = Readonly<{
  id: string;
  description: string | null;
  targetUsers: string | null;
  constraints: string | null;
}>;

type AdvanceDiscoveryInput = Readonly<{
  context: DiscoveryContext;
  messageId: string;
  message: string;
  mode: "ai" | "fallback";
  now: string;
  aiResponse?: AiDiscoveryResponse;
}>;

export function createInitialDiscoveryContext(project: ProjectSeed, now: string): DiscoveryContext {
  const seedFacts: DiscoveryFact[] = [];

  if (project.description?.trim()) {
    seedFacts.push(createFact("business_objective", "Starting idea", project.description, "inferred", [], now));
  }
  if (project.targetUsers?.trim()) {
    seedFacts.push(createFact("target_users", "Initial target users", project.targetUsers, "inferred", [], now));
  }
  if (project.constraints?.trim()) {
    seedFacts.push(createFact("constraints", "Known constraints", project.constraints, "confirmed", [], now));
  }

  const context = {
    schemaVersion: "1.0",
    projectId: project.id,
    version: 0,
    facts: seedFacts,
    contradictions: [],
    acceptedUnknownFactIds: [],
    graph: buildProductGraph(seedFacts, []),
    updatedAt: now,
  } as const;

  return DiscoveryContextSchema.parse(context);
}

export function advanceDiscovery(input: AdvanceDiscoveryInput): DiscoveryTurnResponse {
  const previous = DiscoveryContextSchema.parse(input.context);
  const rawFacts = input.aiResponse
    ? AiDiscoveryResponseSchema.parse(input.aiResponse).facts
    : extractDeterministicFacts(input.message, chooseNextCategory(previous));
  const extractedFacts = rawFacts.map((fact) =>
    createFact(fact.category, fact.label, fact.value, fact.status, [input.messageId], input.now, fact.confidence),
  );
  const { facts, updatedFacts } = mergeFacts(previous.facts, extractedFacts, input.now);
  const contradictions = detectContradictions(facts, previous.contradictions);
  const graph = buildProductGraph(facts, contradictions);
  const context = DiscoveryContextSchema.parse({
    ...previous,
    version: previous.version + 1,
    facts,
    contradictions,
    graph,
    updatedAt: input.now,
  });
  const readinessAssessment = calculateReadiness(context);
  const nextQuestion = input.aiResponse?.nextQuestion || readinessAssessment.recommendedNextQuestion;
  const acknowledgement = input.aiResponse?.acknowledgement || buildAcknowledgement(extractedFacts);

  return DiscoveryTurnResponseSchema.parse({
    assistantMessage: acknowledgement,
    assistantQuestion: nextQuestion,
    extractedFacts,
    updatedFacts,
    unresolvedItems: readinessAssessment.areasNeedingClarification.map((category) => CATEGORY_CONFIG[category].label),
    contradictions: contradictions.filter((item) => item.status === "open"),
    readinessAssessment,
    graphChanges: diffGraphs(previous.graph, graph),
    discoveryMode: input.mode,
    context,
  });
}

export function calculateReadiness(contextInput: DiscoveryContext): ReadinessAssessment {
  const context = DiscoveryContextSchema.parse(contextInput);
  const acceptedUnknowns = new Set(context.acceptedUnknownFactIds);
  const confirmedFields = uniqueCategories(context.facts.filter((fact) => fact.status === "confirmed"));
  const inferredFields = uniqueCategories(context.facts.filter((fact) => fact.status === "inferred"));
  const unknownFacts = context.facts.filter((fact) => fact.status === "unknown");
  const explicitlyUnknownFields = uniqueCategories(unknownFacts);
  const resolvedByUnknown = new Set(unknownFacts.filter((fact) => acceptedUnknowns.has(fact.id)).map((fact) => fact.category));
  const rooted = new Set<FactCategory>([...confirmedFields, ...inferredFields]);
  const score = Math.min(100, Math.round(CATEGORY_ORDER.reduce((total, category) => {
    const config = CATEGORY_CONFIG[category];
    if (confirmedFields.includes(category)) return total + config.weight;
    if (inferredFields.includes(category)) return total + config.weight * 0.65;
    if (resolvedByUnknown.has(category)) return total + config.weight * 0.35;
    return total;
  }, 0)));
  const criticalGaps = CATEGORY_ORDER.filter((category) => CATEGORY_CONFIG[category].critical && !rooted.has(category) && !resolvedByUnknown.has(category));
  const openContradictions = context.contradictions.filter((item) => item.status === "open");
  const status = criticalGaps.length === 0 && openContradictions.length === 0 && score >= 65
    ? "ready"
    : score >= 45 || criticalGaps.length <= 2
      ? "needs_review"
      : "discovering";
  const nextCategory = chooseNextCategory(context);

  return ReadinessAssessmentSchema.parse({
    score: Math.max(0, score - openContradictions.length * 10),
    status,
    confirmedFields,
    explicitlyUnknownFields,
    criticalGaps,
    contradictions: openContradictions.map((item) => item.description),
    recommendedNextQuestion: status === "ready" ? "Review the structured understanding, then approve it when it reflects your intent." : CATEGORY_CONFIG[nextCategory].question,
    explanation: status === "ready" ? "The critical product areas are rooted and no unresolved contradiction blocks architecture." : `${rooted.size} product areas are rooted; ${criticalGaps.length} critical gap${criticalGaps.length === 1 ? "" : "s"} and ${openContradictions.length} contradiction${openContradictions.length === 1 ? "" : "s"} still need attention.`,
    rootedAreas: CATEGORY_ORDER.filter((category) => rooted.has(category)),
    areasNeedingClarification: CATEGORY_ORDER.filter((category) => !rooted.has(category) && !resolvedByUnknown.has(category)),
  });
}

export function canApproveDiscovery(context: DiscoveryContext): boolean {
  const readiness = calculateReadiness(context);
  return readiness.status !== "discovering" && !context.contradictions.some((item) => item.status === "open");
}

export function applyDiscoveryReview(contextInput: DiscoveryContext, input: DiscoveryReviewInput, now: string): DiscoveryContext {
  const context = DiscoveryContextSchema.parse(contextInput);
  let facts = context.facts.map((fact) => ({ ...fact }));
  let contradictions = context.contradictions.map((item) => ({ ...item }));
  const acceptedUnknowns = new Set(context.acceptedUnknownFactIds);

  if (input.action === "edit_fact") {
    facts = facts.map((fact) => fact.id === input.factId ? { ...fact, value: input.value, status: input.status, manuallyEdited: true, updatedAt: now } : fact);
  } else if (input.action === "reject_assumption") {
    facts = facts.map((fact) => fact.id === input.factId ? { ...fact, status: "rejected" as const, manuallyEdited: true, updatedAt: now } : fact);
  } else if (input.action === "accept_unknown") {
    acceptedUnknowns.add(input.factId);
  } else if (input.action === "resolve_contradiction") {
    const contradiction = contradictions.find((item) => item.id === input.contradictionId);
    if (!contradiction || !contradiction.factIds.includes(input.confirmedFactId)) throw new Error("Contradiction not found.");
    contradictions = contradictions.map((item) => item.id === input.contradictionId ? { ...item, status: "resolved" as const, resolution: input.resolution } : item);
    facts = facts.map((fact) => contradiction.factIds.includes(fact.id) ? { ...fact, status: fact.id === input.confirmedFactId ? "confirmed" as const : "rejected" as const, manuallyEdited: true, updatedAt: now } : fact);
  }

  return DiscoveryContextSchema.parse({
    ...context,
    version: context.version + 1,
    facts,
    contradictions,
    acceptedUnknownFactIds: [...acceptedUnknowns],
    graph: buildProductGraph(facts, contradictions),
    updatedAt: now,
  });
}

export function buildProductGraph(facts: readonly DiscoveryFact[], contradictions: DiscoveryContext["contradictions"]): ProductGraph {
  const contradictedIds = new Set(contradictions.filter((item) => item.status === "open").flatMap((item) => item.factIds));
  const nodes = facts.filter((fact) => fact.status !== "rejected").map((fact) => ({
    id: fact.id,
    category: fact.category,
    label: fact.label,
    value: fact.value,
    state: contradictedIds.has(fact.id) ? "contradicted" as const : fact.status,
    sourceFactIds: [fact.id],
  }));
  const anchor = nodes.find((node) => node.category === "business_objective") ?? nodes[0];
  const edges: ProductGraph["edges"] = anchor ? nodes.filter((node) => node.id !== anchor.id).map((node) => ({
    id: stableId("edge", [anchor.id, node.id]),
    source: anchor.id,
    target: node.id,
    kind: "supports" as const,
    state: "active" as const,
  })) : [];

  for (const contradiction of contradictions) {
    const [source, ...targets] = contradiction.factIds;
    if (!source) continue;
    for (const target of targets) edges.push({ id: stableId("conflict", [source, target]), source, target, kind: "contradicts", state: contradiction.status === "resolved" ? "resolved" : "active" });
  }

  return ProductGraphSchema.parse({ nodes, edges });
}

export function boundConversationContext<T extends { content: string }>(messages: readonly T[], maximumMessages = 12, maximumCharacters = 12_000): T[] {
  const bounded: T[] = [];
  let characters = 0;
  for (const message of [...messages].reverse()) {
    if (bounded.length >= maximumMessages || characters + message.content.length > maximumCharacters) break;
    bounded.unshift(message);
    characters += message.content.length;
  }
  return bounded;
}

function extractDeterministicFacts(message: string, fallbackCategory: FactCategory): AiDiscoveryResponse["facts"] {
  const normalized = message.toLowerCase();
  const unknown = /^(unknown|undecided|not sure|i don't know|i do not know|tbd|not applicable|n\/a)[.!\s]*$/i.test(message.trim());
  if (unknown) return [{ category: fallbackCategory, label: CATEGORY_CONFIG[fallbackCategory].label, value: message.trim(), status: "unknown", confidence: 1 }];

  const categories = new Set<FactCategory>();
  if (/\b(goal|objective|want to build|want to create|business)\b/.test(normalized)) categories.add("business_objective");
  if (/\b(problem|pain|struggle|difficult|hard|lose|waste)\b/.test(normalized)) categories.add("problem");
  if (/\b(freelanc(?:e|er|ers)|designer|consultant|contractor|student|founder|customer|operator|team|user)\b/.test(normalized)) categories.add("target_users");
  if (/\b(use case|workflow|invoic\w*|track|create|send|manage|review|approve)\b/.test(normalized)) categories.add("use_cases");
  if (/\b(success|metric|measure|faster|reduce|increase|conversion|retention)\b/.test(normalized)) categories.add("success_metrics");
  if (/\b(must|only|deadline|budget|without|cannot|can't|platform|policy|minimal)\b/.test(normalized)) categories.add("constraints");
  if (/\b(risk|concern|worry|unsafe|security|fraud|failure)\b/.test(normalized)) categories.add("risks");
  if (/\b(feature|support|allow|need to|should be able)\b/.test(normalized)) categories.add("functional_requirements");
  if (categories.size === 0) categories.add(fallbackCategory);

  return [...categories].slice(0, 5).map((category) => ({ category, label: CATEGORY_CONFIG[category].label, value: message.trim(), status: "confirmed" as const, confidence: 0.82 }));
}

function mergeFacts(existing: readonly DiscoveryFact[], extracted: readonly DiscoveryFact[], now: string) {
  const facts = existing.map((fact) => ({ ...fact }));
  const updatedFacts: DiscoveryFact[] = [];
  for (const candidate of extracted) {
    const match = facts.find((fact) => fact.category === candidate.category && normalize(fact.value) === normalize(candidate.value));
    if (match) {
      match.status = candidate.status;
      match.confidence = Math.max(match.confidence, candidate.confidence);
      match.sourceMessageIds = [...new Set([...match.sourceMessageIds, ...candidate.sourceMessageIds])];
      match.updatedAt = now;
      updatedFacts.push({ ...match });
    } else {
      facts.push(candidate);
    }
  }
  return { facts, updatedFacts };
}

function detectContradictions(facts: readonly DiscoveryFact[], previous: DiscoveryContext["contradictions"]): DiscoveryContext["contradictions"] {
  const contradictions = previous.map((item) => ({ ...item }));
  for (const category of CATEGORY_ORDER) {
    if (!CATEGORY_CONFIG[category].single) continue;
    const candidates = facts.filter((fact) => fact.category === category && ["confirmed", "inferred"].includes(fact.status));
    if (candidates.length < 2) continue;
    const distinct = new Map(candidates.map((fact) => [normalize(fact.value), fact]));
    if (distinct.size < 2) continue;
    const pair = [...distinct.values()].slice(-2);
    const pairIds = pair.map((fact) => fact.id).sort();
    const id = stableId("contradiction", pairIds);
    if (!contradictions.some((item) => item.id === id)) contradictions.push({ id, factIds: pairIds, description: `${CATEGORY_CONFIG[category].label} has two competing answers that need a decision.`, status: "open", resolution: null, sourceMessageIds: [...new Set(pair.flatMap((fact) => fact.sourceMessageIds))] });
  }
  return contradictions;
}

function chooseNextCategory(context: DiscoveryContext): FactCategory {
  const accepted = new Set(context.acceptedUnknownFactIds);
  const covered = new Set(context.facts.filter((fact) => fact.status !== "rejected" && (fact.status !== "unknown" || accepted.has(fact.id))).map((fact) => fact.category));
  return CATEGORY_ORDER.find((category) => !covered.has(category)) ?? "unknowns";
}

function createFact(category: FactCategory, label: string, value: string, status: DiscoveryFact["status"], sourceMessageIds: string[], now: string, confidence = status === "confirmed" ? 0.85 : 0.6): DiscoveryFact {
  return { id: stableId("fact", [category, normalize(value)]), category, label, value: value.trim(), status, confidence, sourceMessageIds, createdAt: now, updatedAt: now, manuallyEdited: false };
}

function diffGraphs(before: ProductGraph, after: ProductGraph) {
  const beforeNodes = new Map(before.nodes.map((node) => [node.id, node]));
  const beforeEdges = new Map(before.edges.map((edge) => [edge.id, edge]));
  return GraphChangesSchema.parse({
    addedNodes: after.nodes.filter((node) => !beforeNodes.has(node.id)),
    updatedNodes: after.nodes.filter((node) => beforeNodes.has(node.id) && JSON.stringify(beforeNodes.get(node.id)) !== JSON.stringify(node)),
    addedEdges: after.edges.filter((edge) => !beforeEdges.has(edge.id)),
    resolvedEdgeIds: after.edges.filter((edge) => edge.state === "resolved" && beforeEdges.get(edge.id)?.state === "active").map((edge) => edge.id),
  });
}

function buildAcknowledgement(facts: readonly DiscoveryFact[]): string {
  if (facts.length === 0) return "I kept your answer, but it does not create a requirement yet.";
  if (facts.every((fact) => fact.status === "unknown")) return "That is useful uncertainty. I will keep it explicit instead of guessing.";
  const labels = [...new Set(facts.map((fact) => fact.label.toLowerCase()))];
  return `That adds ${labels.slice(0, 2).join(" and ")} to the product understanding.`;
}

function uniqueCategories(facts: readonly DiscoveryFact[]): FactCategory[] {
  return [...new Set(facts.map((fact) => fact.category))];
}

function stableId(prefix: string, parts: readonly string[]): string {
  const text = parts.join("|");
  let hash = 2_166_136_261;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16_777_619);
  }
  return `${prefix}-${(hash >>> 0).toString(36)}`;
}

function normalize(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}
