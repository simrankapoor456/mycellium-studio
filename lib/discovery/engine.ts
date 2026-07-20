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
import { hasBlockingChallenges, mergeProductChallenges } from "@/lib/mycel-core/decision/challenges";
import { DISCOVERY_CATEGORY_ORDER, getNextDiscoveryPrompt } from "@/lib/discovery/questions";
import {
  buildContradictionDescription,
  buildDiscoveryControlMessage,
  buildDiscoveryTransitionMessage,
  DISCOVERY_CATEGORY_COPY,
  getReadinessPresentation,
} from "@/lib/voice/mycellium";

const CATEGORY_ORDER = DISCOVERY_CATEGORY_ORDER;

const CATEGORY_CONFIG: Record<FactCategory, { label: string; question: string; weight: number; critical: boolean; single: boolean }> = {
  business_objective: { ...DISCOVERY_CATEGORY_COPY.business_objective, weight: 14, critical: true, single: true },
  product_type: { ...DISCOVERY_CATEGORY_COPY.product_type, weight: 0, critical: false, single: true },
  problem: { ...DISCOVERY_CATEGORY_COPY.problem, weight: 14, critical: true, single: true },
  target_users: { ...DISCOVERY_CATEGORY_COPY.target_users, weight: 14, critical: true, single: false },
  use_cases: { ...DISCOVERY_CATEGORY_COPY.use_cases, weight: 14, critical: true, single: false },
  success_metrics: { ...DISCOVERY_CATEGORY_COPY.success_metrics, weight: 10, critical: true, single: false },
  functional_requirements: { ...DISCOVERY_CATEGORY_COPY.functional_requirements, weight: 10, critical: false, single: false },
  non_functional_requirements: { ...DISCOVERY_CATEGORY_COPY.non_functional_requirements, weight: 5, critical: false, single: false },
  constraints: { ...DISCOVERY_CATEGORY_COPY.constraints, weight: 10, critical: false, single: false },
  assumptions: { ...DISCOVERY_CATEGORY_COPY.assumptions, weight: 4, critical: false, single: false },
  risks: { ...DISCOVERY_CATEGORY_COPY.risks, weight: 6, critical: false, single: false },
  architecture_decisions: { ...DISCOVERY_CATEGORY_COPY.architecture_decisions, weight: 3, critical: false, single: false },
  included_scope: { ...DISCOVERY_CATEGORY_COPY.included_scope, weight: 4, critical: false, single: false },
  excluded_scope: { ...DISCOVERY_CATEGORY_COPY.excluded_scope, weight: 3, critical: false, single: false },
  technical_preferences: { ...DISCOVERY_CATEGORY_COPY.technical_preferences, weight: 2, critical: false, single: false },
  dependencies: { ...DISCOVERY_CATEGORY_COPY.dependencies, weight: 3, critical: false, single: false },
  unknowns: { ...DISCOVERY_CATEGORY_COPY.unknowns, weight: 0, critical: false, single: false },
};

type ProjectSeed = Readonly<{
  id: string;
  description: string | null;
  targetUsers: string | null;
  constraints: string | null;
  productTypeLabel?: string | null;
}>;

type AdvanceDiscoveryInput = Readonly<{
  context: DiscoveryContext;
  messageId: string;
  message: string;
  controlAction?: "mark_unknown" | "ask_later";
  mode: "ai" | "fallback";
  now: string;
  aiResponse?: AiDiscoveryResponse;
  engineState?: "ai_enhanced" | "reliable" | "ai_unavailable_reliable";
}>;

export function createInitialDiscoveryContext(project: ProjectSeed, now: string): DiscoveryContext {
  const seedFacts: DiscoveryFact[] = [];

  if (project.description?.trim()) {
    const sourceFacts = extractDeterministicFacts(project.description, "business_objective");
    seedFacts.push(...sourceFacts.map((fact) => createFact(
      fact.category,
      fact.label,
      fact.value,
      "inferred",
      [],
      now,
      Math.min(fact.confidence, 0.72),
    )));
  }
  if (project.productTypeLabel?.trim()) {
    seedFacts.push(createFact("product_type", "Product type", project.productTypeLabel, "confirmed", [], now));
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
    challenges: [],
    unresolvedDecisionIds: [],
    approvalState: "pending",
    graph: buildProductGraph(seedFacts, []),
    updatedAt: now,
  } as const;

  return DiscoveryContextSchema.parse(context);
}

export function advanceDiscovery(input: AdvanceDiscoveryInput): DiscoveryTurnResponse {
  const previous = DiscoveryContextSchema.parse(input.context);
  const aiResponse = input.aiResponse ? AiDiscoveryResponseSchema.parse(input.aiResponse) : null;
  const currentPrompt = getNextDiscoveryPrompt(previous);
  const controlCategory = currentPrompt?.category ?? "unknowns";
  const rawFacts = input.controlAction
    ? [{
      category: controlCategory,
      label: CATEGORY_CONFIG[controlCategory].label,
      value: input.controlAction === "ask_later" ? "Deferred for foundation review" : "Intentionally left unknown",
      status: "unknown" as const,
      confidence: 1,
    }]
    : aiResponse
    ? [...aiResponse.extractedFacts, ...aiResponse.updatedFacts]
    : extractDeterministicFacts(input.message, controlCategory);
  const extractedFacts = rawFacts.map((fact) =>
    createFact(fact.category, fact.label, fact.value, fact.status, [input.messageId], input.now, fact.confidence),
  );
  const { facts, updatedFacts } = mergeFacts(previous.facts, extractedFacts, input.now);
  const contradictions = detectContradictions(facts, previous.contradictions);
  const graph = buildProductGraph(facts, contradictions);
  const provisionalContext = DiscoveryContextSchema.parse({
    ...previous,
    version: previous.version + 1,
    facts,
    contradictions,
    graph,
    acceptedUnknownFactIds: input.controlAction === "ask_later"
      ? [...new Set([...previous.acceptedUnknownFactIds, ...extractedFacts.map((fact) => fact.id)])]
      : previous.acceptedUnknownFactIds,
    approvalState: previous.approvalState === "approved" ? "stale" : "pending",
    updatedAt: input.now,
  });
  const challenges = mergeProductChallenges(provisionalContext, input.now, aiResponse?.challenges ?? []);
  const unresolvedDecisionIds = calculateUnresolvedDecisionIds(provisionalContext, challenges);
  const context = DiscoveryContextSchema.parse({ ...provisionalContext, challenges, unresolvedDecisionIds });
  const readinessAssessment = calculateReadiness(context);
  const nextPrompt = getNextDiscoveryPrompt(context);
  const nextQuestion = nextPrompt?.question ?? "The current foundation is ready for review.";
  const assistantMessage = input.controlAction
    ? buildDiscoveryControlMessage(input.controlAction, controlCategory, readinessAssessment)
    : buildDiscoveryTransitionMessage(calculateReadiness(previous), readinessAssessment, extractedFacts);

  return DiscoveryTurnResponseSchema.parse({
    assistantMessage,
    assistantQuestion: nextQuestion,
    questionId: nextPrompt?.id ?? "review",
    questionCategory: nextPrompt?.category ?? "unknowns",
    questionReason: nextPrompt?.reason ?? "Review now to confirm what is grounded and keep remaining uncertainty explicit.",
    extractedFacts,
    updatedFacts,
    unresolvedItems: readinessAssessment.areasNeedingClarification.map((category) => CATEGORY_CONFIG[category].label),
    contradictions: contradictions.filter((item) => item.status === "open"),
    challenges,
    readinessAssessment,
    graphChanges: diffGraphs(previous.graph, graph),
    discoveryMode: input.mode,
    engineState: input.engineState ?? (input.mode === "ai" ? "ai_enhanced" : "reliable"),
    context,
  });
}

export function calculateReadiness(contextInput: DiscoveryContext): ReadinessAssessment {
  const context = DiscoveryContextSchema.parse(contextInput);
  const acceptedUnknowns = new Set(context.acceptedUnknownFactIds);
  const activeFacts = context.facts.filter((fact) => fact.deletedAt === null);
  const confirmedFields = uniqueCategories(activeFacts.filter((fact) => fact.status === "confirmed"));
  const inferredFields = uniqueCategories(activeFacts.filter((fact) => fact.status === "inferred"));
  const unknownFacts = activeFacts.filter((fact) => fact.status === "unknown");
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
  const openChallenges = context.challenges.filter((challenge) => challenge.status === "open");
  const blockingChallenges = openChallenges.filter((challenge) => ["critical", "material"].includes(challenge.severity));
  const status = criticalGaps.length === 0 && openContradictions.length === 0 && blockingChallenges.length === 0 && score >= 65
    ? "ready"
    : score >= 45 || criticalGaps.length <= 2
      ? "needs_review"
      : "discovering";
  const nextPrompt = getNextDiscoveryPrompt(context);

  const readiness = ReadinessAssessmentSchema.parse({
    score: Math.max(0, score - openContradictions.length * 10 - blockingChallenges.length * 4),
    status,
    confirmedFields,
    explicitlyUnknownFields,
    criticalGaps,
    contradictions: openContradictions.map((item) => item.description),
    openChallenges: openChallenges.map((challenge) => challenge.id),
    recommendedNextQuestion: status === "ready" || !nextPrompt
      ? "Review the structured understanding, then approve it when it reflects your intent."
      : nextPrompt.question,
    explanation: "Foundation progress calculated.",
    rootedAreas: CATEGORY_ORDER.filter((category) => rooted.has(category)),
    areasNeedingClarification: CATEGORY_ORDER.filter((category) => !rooted.has(category) && !resolvedByUnknown.has(category)),
  });
  return ReadinessAssessmentSchema.parse({ ...readiness, explanation: getReadinessPresentation(readiness).summary });
}

export function canApproveDiscovery(context: DiscoveryContext): boolean {
  const readiness = calculateReadiness(context);
  return readiness.status !== "discovering" && !context.contradictions.some((item) => item.status === "open") && !hasBlockingChallenges(context);
}

export function applyDiscoveryReview(contextInput: DiscoveryContext, input: DiscoveryReviewInput, now: string): DiscoveryContext {
  const context = DiscoveryContextSchema.parse(contextInput);
  let facts = context.facts.map((fact) => ({ ...fact }));
  let contradictions = context.contradictions.map((item) => ({ ...item }));
  const acceptedUnknowns = new Set(context.acceptedUnknownFactIds);

  if (input.action === "edit_fact") {
    ensureFactExists(facts, input.factId);
    facts = facts.map((fact) => fact.id === input.factId ? { ...fact, value: input.value, status: input.status, manuallyEdited: true, updatedAt: now } : fact);
  } else if (input.action === "reject_assumption") {
    ensureFactExists(facts, input.factId);
    facts = facts.map((fact) => fact.id === input.factId ? { ...fact, status: "rejected" as const, manuallyEdited: true, updatedAt: now } : fact);
  } else if (input.action === "confirm_fact") {
    ensureFactExists(facts, input.factId);
    facts = facts.map((fact) => fact.id === input.factId ? { ...fact, status: "confirmed" as const, manuallyEdited: true, deletedAt: null, updatedAt: now } : fact);
  } else if (input.action === "mark_unknown") {
    ensureFactExists(facts, input.factId);
    facts = facts.map((fact) => fact.id === input.factId ? { ...fact, status: "unknown" as const, manuallyEdited: true, deletedAt: null, updatedAt: now } : fact);
  } else if (input.action === "delete_fact") {
    ensureFactExists(facts, input.factId);
    acceptedUnknowns.delete(input.factId);
    facts = facts.map((fact) => fact.id === input.factId ? { ...fact, status: "rejected" as const, manuallyEdited: true, deletedAt: now, updatedAt: now } : fact);
  } else if (input.action === "accept_unknown") {
    ensureFactExists(facts, input.factId);
    acceptedUnknowns.add(input.factId);
  } else if (input.action === "acknowledge_challenge") {
    const challenge = context.challenges.find((item) => item.id === input.challengeId);
    if (!challenge) throw new Error("Challenge not found.");
    context.challenges = context.challenges.map((item) => item.id === input.challengeId ? { ...item, status: "acknowledged" as const, manuallyEdited: true, updatedAt: now } : item);
  } else if (input.action === "accept_challenge_risk") {
    const challenge = context.challenges.find((item) => item.id === input.challengeId);
    if (!challenge) throw new Error("Challenge not found.");
    context.challenges = context.challenges.map((item) => item.id === input.challengeId ? { ...item, status: "accepted_risk" as const, manuallyEdited: true, updatedAt: now } : item);
  } else if (input.action === "resolve_challenge") {
    const challenge = context.challenges.find((item) => item.id === input.challengeId);
    if (!challenge) throw new Error("Challenge not found.");
    context.challenges = context.challenges.map((item) => item.id === input.challengeId ? { ...item, status: "resolved" as const, manuallyEdited: true, updatedAt: now } : item);
  } else if (input.action === "resolve_contradiction") {
    const contradiction = contradictions.find((item) => item.id === input.contradictionId);
    if (!contradiction || !contradiction.factIds.includes(input.confirmedFactId)) throw new Error("Contradiction not found.");
    contradictions = contradictions.map((item) => item.id === input.contradictionId ? { ...item, status: "resolved" as const, resolution: input.resolution } : item);
    facts = facts.map((fact) => contradiction.factIds.includes(fact.id) ? { ...fact, status: fact.id === input.confirmedFactId ? "confirmed" as const : "rejected" as const, manuallyEdited: true, updatedAt: now } : fact);
  }

  const graph = buildProductGraph(facts, contradictions);
  const challengeContext = DiscoveryContextSchema.parse({ ...context, facts, contradictions, graph });
  const challenges = mergeProductChallenges(challengeContext, now);

  return DiscoveryContextSchema.parse({
    ...context,
    version: context.version + 1,
    facts,
    contradictions,
    acceptedUnknownFactIds: [...acceptedUnknowns],
    challenges,
    unresolvedDecisionIds: calculateUnresolvedDecisionIds(challengeContext, challenges),
    approvalState: context.approvalState === "approved" ? "stale" : "pending",
    graph,
    updatedAt: now,
  });
}

export function buildProductGraph(facts: readonly DiscoveryFact[], contradictions: DiscoveryContext["contradictions"]): ProductGraph {
  const contradictedIds = new Set(contradictions.filter((item) => item.status === "open").flatMap((item) => item.factIds));
  const nodes = facts.filter((fact) => fact.status !== "rejected" && fact.deletedAt === null).map((fact) => ({
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

function extractDeterministicFacts(message: string, fallbackCategory: FactCategory): AiDiscoveryResponse["extractedFacts"] {
  const normalized = message.toLowerCase();
  const unknown = /^(unknown|undecided|not sure|i don't know|i do not know|tbd|not applicable|n\/a)[.!\s]*$/i.test(message.trim());
  if (unknown) return [{ category: fallbackCategory, label: CATEGORY_CONFIG[fallbackCategory].label, value: message.trim(), status: "unknown", confidence: 1 }];

  const categories = new Set<FactCategory>();
  if (/\b(goal|objective|want to build|want to create|business)\b/.test(normalized)) categories.add("business_objective");
  if (/\b(problem|pain|struggle|difficult|hard|lose|waste)\b/.test(normalized)) categories.add("problem");
  if (/\b(freelanc(?:e|er|ers)|designer|consultant|contractor|student|founder|customer|operator|team|user)\b/.test(normalized)) categories.add("target_users");
  if (/\b(use case|workflow|invoic\w*|track|create|send|manage|review|approve)\b/.test(normalized)) categories.add("use_cases");
  if (/\b(success|metric|measure|faster|reduce|increase|conversion|retention)\b/.test(normalized)) categories.add("success_metrics");
  if (/\b(must|only|budget|without|cannot|can't|platform|policy|minimal)\b/.test(normalized)) categories.add("constraints");
  if (/\b(risk|concern|worry|unsafe|security|fraud|failure)\b/.test(normalized)) categories.add("risks");
  if (/\b(feature|support|allow|need to|should be able)\b/.test(normalized)) categories.add("functional_requirements");
  if (/\b(in scope|include in|first release includes|must include)\b/.test(normalized)) categories.add("included_scope");
  if (/\b(out of scope|later release|not include|exclude|defer)\b/.test(normalized)) categories.add("excluded_scope");
  if (/\b(technology|framework|database|hosting|platform preference|technical preference)\b/.test(normalized)) categories.add("technical_preferences");
  if (/\b(depend|third[- ]party|external api|vendor|integration)\b/.test(normalized)) categories.add("dependencies");
  if (categories.size === 0) categories.add(fallbackCategory);

  return [...categories].slice(0, 5).map((category) => ({ category, label: CATEGORY_CONFIG[category].label, value: message.trim(), status: "confirmed" as const, confidence: 0.82 }));
}

function mergeFacts(existing: readonly DiscoveryFact[], extracted: readonly DiscoveryFact[], now: string) {
  const facts = existing.map((fact) => ({ ...fact }));
  const updatedFacts: DiscoveryFact[] = [];
  for (const candidate of extracted) {
    const match = facts.find((fact) => fact.deletedAt === null && fact.category === candidate.category && normalize(fact.value) === normalize(candidate.value));
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
    if (!contradictions.some((item) => item.id === id)) contradictions.push({ id, factIds: pairIds, description: buildContradictionDescription(category), status: "open", resolution: null, sourceMessageIds: [...new Set(pair.flatMap((fact) => fact.sourceMessageIds))] });
  }
  return contradictions;
}


function createFact(category: FactCategory, label: string, value: string, status: DiscoveryFact["status"], sourceMessageIds: string[], now: string, confidence = status === "confirmed" ? 0.85 : 0.6): DiscoveryFact {
  return { id: stableId("fact", [category, normalize(value)]), category, label, value: value.trim(), status, confidence, sourceMessageIds, createdAt: now, updatedAt: now, manuallyEdited: false, deletedAt: null };
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

function ensureFactExists(facts: readonly DiscoveryFact[], factId: string): void {
  if (!facts.some((fact) => fact.id === factId && fact.deletedAt === null)) {
    throw new Error("Fact not found.");
  }
}

function calculateUnresolvedDecisionIds(
  context: DiscoveryContext,
  challenges: DiscoveryContext["challenges"],
): string[] {
  const unknownIds = context.facts
    .filter((fact) => fact.deletedAt === null && fact.status === "unknown" && !context.acceptedUnknownFactIds.includes(fact.id))
    .map((fact) => fact.id);
  const contradictionIds = context.contradictions.filter((item) => item.status === "open").map((item) => item.id);
  const challengeIds = challenges.filter((item) => item.status === "open").map((item) => item.id);
  return [...new Set([...unknownIds, ...contradictionIds, ...challengeIds])];
}
