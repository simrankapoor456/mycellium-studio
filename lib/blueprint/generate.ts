import {
  ProductBlueprintSchema,
  type Lineage,
  type ProductBlueprint,
} from "@/lib/domain/blueprint/schemas";
import { DiscoveryContextSchema, type DiscoveryContext, type DiscoveryFact } from "@/lib/domain/discovery/schemas";
import type { Project } from "@/lib/domain/project/schemas";

export function generateDeterministicBlueprint(project: Project, approvedContextInput: DiscoveryContext, now: string): ProductBlueprint {
  const context = DiscoveryContextSchema.parse(approvedContextInput);
  const usableFacts = context.facts.filter((fact) => fact.status === "confirmed" || fact.status === "inferred");
  const objectiveFact = firstFact(usableFacts, "business_objective") ?? firstFact(usableFacts, "problem") ?? usableFacts[0];
  const objective = objectiveFact?.value ?? project.description ?? `Create a useful first release of ${project.name}.`;
  const targetFacts = factsFor(usableFacts, "target_users");
  const targetUsers = targetFacts.length > 0 ? targetFacts.map((fact) => fact.value) : [project.target_users ?? "The first validated user group"];
  const metricFacts = factsFor(usableFacts, "success_metrics");
  const requirementFacts = [...factsFor(usableFacts, "functional_requirements"), ...factsFor(usableFacts, "use_cases")];
  const requirementSeeds = requirementFacts.length > 0 ? requirementFacts.slice(0, 6) : [objectiveFact].filter((fact): fact is DiscoveryFact => Boolean(fact));
  const requirements: ProductBlueprint["requirements"] = requirementSeeds.map((fact, index) => ({
    ...entity(`REQ-${index + 1}`, requirementTitle(fact.value, index), fact.value, index < 2 ? "high" as const : "medium" as const, lineageFromFacts([fact], "fallback")),
    category: "functional" as const,
    acceptanceCriteria: [`A ${targetUsers[0]} can complete this capability from the primary workflow.`, "Invalid or incomplete input receives clear feedback."],
  }));
  if (requirements.length === 0) {
    requirements.push({ ...entity("REQ-1", "Deliver the primary product outcome", objective, "high", emptyLineage("fallback")), category: "functional", acceptanceCriteria: ["The primary user can complete the core outcome."] });
  }

  const qualityFacts = factsFor(usableFacts, "non_functional_requirements");
  for (const [index, fact] of qualityFacts.slice(0, 3).entries()) {
    requirements.push({ ...entity(`NFR-${index + 1}`, `Quality boundary ${index + 1}`, fact.value, "medium", lineageFromFacts([fact], "fallback")), category: "non_functional", acceptanceCriteria: ["The boundary is verified before release."] });
  }

  const architectureDecisions = [
    { title: "Keep identity and ownership server verified", description: "Every persisted operation derives identity from the authenticated session and remains constrained by row-level security.", rationale: "Product context and blueprint data are private project records." },
    { title: "Use one validated blueprint contract", description: "Blueprint and document views read and write the same versioned canonical data.", rationale: "A single contract prevents visual and export representations from drifting." },
  ].map((decision, index) => ({
    ...entity(`ARCH-${index + 1}`, decision.title, decision.description, index === 0 ? "high" : "medium", lineageFromFacts(usableFacts.slice(0, 4), "fallback")),
    rationale: decision.rationale,
    relatedRequirementIds: requirements.map((item) => item.id),
  }));

  const inScope = requirements.slice(0, 5).map((requirement, index) => ({ ...entity(`SCOPE-IN-${index + 1}`, requirement.title, requirement.description, requirement.priority, { ...requirement.lineage, requirementIds: [requirement.id], generatedFromIds: [requirement.id] }), boundary: "in" as const }));
  const outOfScope = ["Team administration", "Billing and subscriptions", "Automatic external publishing"].map((title, index) => ({ ...entity(`SCOPE-OUT-${index + 1}`, title, `${title} remains outside the approved first release.`, "low", emptyLineage("fallback")), boundary: "out" as const }));
  const epics = requirements.slice(0, 4).map((requirement, index) => ({ ...entity(`EPIC-${index + 1}`, requirement.title, `Deliver the approved ${requirement.title.toLowerCase()} outcome.`, requirement.priority, { ...requirement.lineage, requirementIds: [requirement.id], generatedFromIds: [requirement.id] }), requirementIds: [requirement.id] }));
  const stories = epics.map((epic, index) => ({ ...entity(`STORY-${index + 1}`, `Complete ${epic.title.toLowerCase()}`, `A reviewable user flow for ${epic.title.toLowerCase()}.`, epic.priority, { ...epic.lineage, generatedFromIds: [epic.id] }), epicId: epic.id, userStory: `As ${targetUsers[0]}, I want to ${epic.title.toLowerCase()} so that I can achieve the approved product outcome.`, acceptanceCriteria: ["The happy path completes successfully.", "Errors are actionable and preserve user input.", "The workflow remains keyboard and mobile accessible."] }));
  const tasks = stories.flatMap((story, storyIndex) => [
    { ...entity(`TASK-${storyIndex + 1}-1`, `Implement ${story.title.toLowerCase()}`, story.description, story.priority, { ...story.lineage, generatedFromIds: [story.id] }, "fullstack", 5), storyId: story.id, ownerType: "fullstack" as const, dependencyTaskIds: [], sprintId: storyIndex < 2 ? "SPRINT-1" : "SPRINT-2" },
    { ...entity(`TASK-${storyIndex + 1}-2`, `Verify ${story.title.toLowerCase()}`, `Test the acceptance criteria and ownership boundary for ${story.title.toLowerCase()}.`, story.priority, { ...story.lineage, generatedFromIds: [story.id] }, "qa", 3), storyId: story.id, ownerType: "qa" as const, dependencyTaskIds: [`TASK-${storyIndex + 1}-1`], sprintId: storyIndex < 2 ? "SPRINT-1" : "SPRINT-2" },
  ]);
  const sprintPlan = [1, 2].map((number) => {
    const sprintId = `SPRINT-${number}`;
    const sprintTasks = tasks.filter((task) => task.sprintId === sprintId);
    return { ...entity(sprintId, `Sprint ${number}`, number === 1 ? "Establish the primary product path." : "Complete delivery structure and review.", number === 1 ? "high" : "medium", lineageFromIds(sprintTasks.map((task) => task.id), "fallback")), goal: number === 1 ? "Prove the core experience end to end." : "Complete the remaining approved scope and quality checks.", capacity: project.capacity ?? 24, taskIds: sprintTasks.map((task) => task.id) };
  }).filter((sprint) => sprint.taskIds.length > 0);
  const riskFacts = factsFor(usableFacts, "risks");
  const risks = (riskFacts.length > 0 ? riskFacts : [undefined]).map((fact, index) => ({ ...entity(`RISK-${index + 1}`, fact ? `Known risk ${index + 1}` : "Scope may outgrow the first release", fact?.value ?? "The approved context may still contain assumptions that expand delivery work.", "medium", fact ? lineageFromFacts([fact], "fallback") : emptyLineage("fallback")), impact: "medium" as const, mitigation: fact ? "Review this risk before assigning dependent work." : "Protect the approved scope boundary and re-review material additions." }));
  const goals = [objective, "Preserve a visible connection from confirmed context to delivery work."].map((value, index) => entity(`GOAL-${index + 1}`, index === 0 ? "Primary outcome" : "Traceable execution", value, index === 0 ? "high" : "medium", index === 0 && objectiveFact ? lineageFromFacts([objectiveFact], "fallback") : emptyLineage("fallback")));

  return ProductBlueprintSchema.parse({
    schemaVersion: "2.0",
    projectId: project.id,
    projectName: project.name,
    projectType: project.project_type ?? "web-app",
    summary: `${project.name} turns the approved discovery context into traceable requirements, architecture, scope, and delivery work.`,
    generationSource: "fallback",
    version: 1,
    createdAt: now,
    updatedAt: now,
    overview: { businessObjective: objective, targetUsers, successMetrics: metricFacts.map((fact) => fact.value) },
    understanding: { factIds: usableFacts.map((fact) => fact.id), unresolvedItems: calculateUnresolved(context), acceptedUnknownFactIds: context.acceptedUnknownFactIds },
    goals,
    requirements,
    architectureDecisions,
    scope: { inScope, outOfScope },
    epics,
    stories,
    tasks,
    sprintPlan,
    risks,
    review: { qualityScore: Math.max(50, 96 - context.contradictions.filter((item) => item.status === "open").length * 15 - context.facts.filter((fact) => fact.status === "unknown" && !context.acceptedUnknownFactIds.includes(fact.id)).length * 5), warnings: calculateUnresolved(context), unresolvedFactCategories: [...new Set(context.facts.filter((fact) => fact.status === "unknown" && !context.acceptedUnknownFactIds.includes(fact.id)).map((fact) => fact.category))] },
  });
}

export function normalizeAiBlueprint(candidate: unknown, project: Project, context: DiscoveryContext, now: string): ProductBlueprint {
  const parsed = ProductBlueprintSchema.parse(candidate);
  const normalized = ProductBlueprintSchema.parse({ ...parsed, projectId: project.id, projectName: project.name, projectType: project.project_type ?? "web-app", generationSource: "ai", version: 1, createdAt: now, updatedAt: now });
  const issues = validateBlueprintLineage(normalized, context);
  if (issues.length > 0) throw new Error(`Invalid blueprint lineage: ${issues.join("; ")}`);
  return normalized;
}

export function validateBlueprintLineage(blueprint: ProductBlueprint, context: DiscoveryContext): string[] {
  const factIds = new Set(context.facts.map((fact) => fact.id));
  const requirementIds = new Set(blueprint.requirements.map((item) => item.id));
  const entityIds = new Set([...blueprint.goals, ...blueprint.requirements, ...blueprint.architectureDecisions, ...blueprint.scope.inScope, ...blueprint.scope.outOfScope, ...blueprint.epics, ...blueprint.stories, ...blueprint.tasks, ...blueprint.sprintPlan, ...blueprint.risks].map((item) => item.id));
  const issues: string[] = [];
  for (const entity of [...blueprint.goals, ...blueprint.requirements, ...blueprint.architectureDecisions, ...blueprint.scope.inScope, ...blueprint.scope.outOfScope, ...blueprint.epics, ...blueprint.stories, ...blueprint.tasks, ...blueprint.sprintPlan, ...blueprint.risks]) {
    if (entity.lineage.factIds.some((id) => !factIds.has(id))) issues.push(`${entity.id} references an unknown fact`);
    if (entity.lineage.requirementIds.some((id) => !requirementIds.has(id))) issues.push(`${entity.id} references an unknown requirement`);
    if (entity.lineage.generatedFromIds.some((id) => !entityIds.has(id) && !factIds.has(id))) issues.push(`${entity.id} has an unknown generated-from reference`);
  }
  return issues;
}

function entity(id: string, title: string, description: string, priority: "low" | "medium" | "high", lineage: Lineage, owner: string | null = null, estimate: number | null = null) {
  return { id, title, description, status: "draft" as const, priority, owner, estimate, manuallyEdited: false, lineage };
}

function lineageFromFacts(facts: readonly DiscoveryFact[], source: Lineage["source"]): Lineage {
  return { sourceMessageIds: [...new Set(facts.flatMap((fact) => fact.sourceMessageIds))], factIds: facts.map((fact) => fact.id), requirementIds: [], generatedFromIds: facts.map((fact) => fact.id), source };
}

function lineageFromIds(ids: string[], source: Lineage["source"]): Lineage {
  return { sourceMessageIds: [], factIds: [], requirementIds: [], generatedFromIds: ids, source };
}

function emptyLineage(source: Lineage["source"]): Lineage {
  return { sourceMessageIds: [], factIds: [], requirementIds: [], generatedFromIds: [], source };
}

function factsFor(facts: readonly DiscoveryFact[], category: DiscoveryFact["category"]) {
  return facts.filter((fact) => fact.category === category);
}

function firstFact(facts: readonly DiscoveryFact[], category: DiscoveryFact["category"]) {
  return facts.find((fact) => fact.category === category);
}

function requirementTitle(value: string, index: number) {
  const cleaned = value.replace(/\s+/g, " ").trim();
  return cleaned.length <= 80 ? cleaned : `Core requirement ${index + 1}`;
}

function calculateUnresolved(context: DiscoveryContext): string[] {
  const unknowns = context.facts.filter((fact) => fact.status === "unknown" && !context.acceptedUnknownFactIds.includes(fact.id)).map((fact) => `${fact.label}: ${fact.value}`);
  const contradictions = context.contradictions.filter((item) => item.status === "open").map((item) => item.description);
  return [...unknowns, ...contradictions];
}
