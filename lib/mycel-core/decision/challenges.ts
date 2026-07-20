import {
  AiChallengeProposalSchema,
  ProductChallengeSchema,
  type DiscoveryContext,
  type DiscoveryFact,
  type ProductChallenge,
} from "@/lib/domain/discovery/schemas";

type ChallengeSeed = Readonly<{
  category: ProductChallenge["category"];
  severity: ProductChallenge["severity"];
  title: string;
  description: string;
  facts: readonly DiscoveryFact[];
}>;

export function mergeProductChallenges(
  context: DiscoveryContext,
  now: string,
  proposed: readonly unknown[] = [],
): ProductChallenge[] {
  const activeFacts = context.facts.filter((fact) => fact.status !== "rejected" && fact.deletedAt === null);
  const seeds = [...deterministicChallengeSeeds(activeFacts, context), ...trustedProposalSeeds(proposed, activeFacts)];
  const previous = new Map(context.challenges.map((challenge) => [challenge.id, challenge]));
  const currentIds = new Set<string>();
  const challenges = seeds.map((seed) => {
    const id = stableChallengeId(seed.category, seed.facts.map((fact) => fact.id));
    currentIds.add(id);
    const existing = previous.get(id);

    return ProductChallengeSchema.parse({
      id,
      category: seed.category,
      severity: seed.severity,
      title: seed.title,
      description: seed.description,
      status: existing?.status ?? "open",
      sourceFactIds: seed.facts.map((fact) => fact.id),
      sourceMessageIds: [...new Set(seed.facts.flatMap((fact) => fact.sourceMessageIds))],
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
      manuallyEdited: existing?.manuallyEdited ?? false,
    });
  });

  for (const existing of context.challenges) {
    if (!currentIds.has(existing.id)) {
      challenges.push(ProductChallengeSchema.parse({ ...existing, status: "resolved", updatedAt: now }));
    }
  }

  return [...new Map(challenges.map((challenge) => [challenge.id, challenge])).values()];
}

export function hasBlockingChallenges(context: DiscoveryContext): boolean {
  return context.challenges.some(
    (challenge) => challenge.status === "open" && ["critical", "material"].includes(challenge.severity),
  );
}

function deterministicChallengeSeeds(facts: readonly DiscoveryFact[], context: DiscoveryContext): ChallengeSeed[] {
  const seeds: ChallengeSeed[] = [];
  const factsByCategory = new Map<DiscoveryFact["category"], DiscoveryFact[]>();

  for (const fact of facts) {
    const current = factsByCategory.get(fact.category) ?? [];
    current.push(fact);
    factsByCategory.set(fact.category, current);
  }

  const audienceFacts = factsByCategory.get("target_users") ?? [];
  if (audienceFacts.some((fact) => /\b(everyone|anyone|all users|all people|all businesses)\b/i.test(fact.value))) {
    seeds.push(seed("broad_audience", "material", "The first audience is too broad", "Choose one first user group so product trade-offs have a clear center.", audienceFacts));
  }

  const outcomeFacts = factsByCategory.get("use_cases") ?? [];
  if (outcomeFacts.length === 0) {
    seeds.push(seed("unclear_outcome", "material", "The primary outcome is still unclear", "Name the one result a person must complete in the first release.", factsByCategory.get("business_objective") ?? []));
  }

  const goalFacts = factsByCategory.get("business_objective") ?? [];
  if (context.contradictions.some((item) => item.status === "open" && item.factIds.some((id) => goalFacts.some((fact) => fact.id === id)))) {
    seeds.push(seed("conflicting_goals", "critical", "Product goals are pulling apart", "Resolve the competing product outcomes before they shape scope and architecture.", goalFacts));
  }

  const requirementFacts = factsByCategory.get("functional_requirements") ?? [];
  if (requirementFacts.length > 8 || requirementFacts.some((fact) => /\b(everything|all[- ]in[- ]one|every feature)\b/i.test(fact.value))) {
    seeds.push(seed("excessive_scope", "material", "The first release may be carrying too much", "Protect the primary outcome by moving secondary capabilities later.", requirementFacts));
  }

  const metricFacts = factsByCategory.get("success_metrics") ?? [];
  if (metricFacts.length === 0 || metricFacts.every((fact) => !/\d|percent|rate|time|count|frequency|reduction|increase/i.test(fact.value))) {
    seeds.push(seed("weak_metrics", "material", "Success needs an observable signal", "Choose a measurable result that can show whether the first release is working.", metricFacts.length ? metricFacts : goalFacts));
  }

  const combined = facts.map((fact) => fact.value).join(" ");
  addPatternSeed(seeds, /\b(third[- ]party|external api|vendor dependency)\b/i, combined, "risky_dependency", "material", "A dependency could control delivery", "Confirm availability, limits, failure behavior, and a degraded path.", facts);
  addPatternSeed(seeds, /\b(personal data|sensitive data|financial data|health data|location data|private data)\b/i, combined, "privacy", "critical", "Sensitive data needs an explicit boundary", "Define the minimum data collected, retention, access, and deletion behavior.", facts);
  addPatternSeed(seeds, /\b(scrape|crawl|external data|third[- ]party data)\b/i, combined, "external_data", "material", "External data access needs proof", "Confirm permission, availability, and a path for missing or restricted data.", facts);
  addPatternSeed(seeds, /\b(real[- ]time|latest data|current data|fresh data)\b/i, combined, "stale_data", "material", "Freshness expectations need a contract", "Define how old data may be and what the product shows when updates fail.", facts);
  addPatternSeed(seeds, /\b(recommend|ranking|personaliz)\w*/i, combined, "bias", "material", "Recommendations need fairness checks", "Make inputs, user control, and harmful skew visible before relying on recommendations.", facts);
  addPatternSeed(seeds, /\b(bulk action|automatic action|auto[- ]send|mass message)\b/i, combined, "unsafe_automation", "critical", "Automation needs a human safety boundary", "Require preview, confirmation, limits, and recovery for high-impact actions.", facts);
  addPatternSeed(seeds, /\b(integrat|connector|webhook)\w*/i, combined, "unsupported_integration", "advisory", "Integration assumptions need confirmation", "Keep the core outcome usable when an external connection is unavailable.", facts);

  return seeds;
}

function trustedProposalSeeds(proposed: readonly unknown[], facts: readonly DiscoveryFact[]): ChallengeSeed[] {
  const factMap = new Map(facts.map((fact) => [fact.id, fact]));

  return proposed.flatMap((input) => {
    const parsed = AiChallengeProposalSchema.safeParse(input);
    if (!parsed.success) {
      return [];
    }

    const sourceFacts = parsed.data.sourceFactIds.flatMap((id) => {
      const fact = factMap.get(id);
      return fact ? [fact] : [];
    });

    if (parsed.data.sourceFactIds.length > 0 && sourceFacts.length === 0) {
      return [];
    }

    return [{ ...parsed.data, facts: sourceFacts }];
  });
}

function seed(
  category: ChallengeSeed["category"],
  severity: ChallengeSeed["severity"],
  title: string,
  description: string,
  facts: readonly DiscoveryFact[],
): ChallengeSeed {
  return { category, severity, title, description, facts };
}

function addPatternSeed(
  seeds: ChallengeSeed[],
  pattern: RegExp,
  content: string,
  category: ChallengeSeed["category"],
  severity: ChallengeSeed["severity"],
  title: string,
  description: string,
  facts: readonly DiscoveryFact[],
): void {
  if (pattern.test(content)) {
    seeds.push(seed(category, severity, title, description, facts.filter((fact) => pattern.test(fact.value))));
  }
}

function stableChallengeId(category: string, factIds: readonly string[]): string {
  const text = `${category}|${[...factIds].toSorted().join("|")}`;
  let hash = 2_166_136_261;

  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16_777_619);
  }

  return `challenge-${(hash >>> 0).toString(36)}`;
}
