import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { generateDeterministicBlueprint, normalizeAiBlueprint } from "@/lib/blueprint/generate";
import { advanceDiscovery, applyDiscoveryReview, calculateReadiness, createInitialDiscoveryContext } from "@/lib/discovery/engine";
import { AiDiscoveryResponseSchema, type AiDiscoveryResponse } from "@/lib/domain/discovery/schemas";
import { ProjectOutputSchema } from "@/lib/domain/project/schemas";
import { authorizeEntityId, authorizeOwnedProject } from "@/lib/mycel-core/decision/authorize";
import { decideContextApproval } from "@/lib/mycel-core/decision/readiness";
import { canContinueDiscovery, isWithinRateLimit } from "@/lib/mycel-core/decision/policies";
import { validateAiDiscoveryProposal, validateProviderProposal } from "@/lib/mycel-core/decision/validate";
import { generateReliablePressureTest } from "@/lib/mycel-core/execution/blueprint";

const projectId = "42ad2ff0-4835-47d1-b3fe-d6c1f58863a2";
const userId = "2d9065fe-829c-4c6c-b867-7663f43e8740";
const now = "2026-07-18T00:00:00.000Z";
const project = ProjectOutputSchema.parse({ id: projectId, user_id: userId, name: "Signal Garden", description: "A focused product planning tool", project_type: "web-app", target_users: "Product leads", team_size: 3, sprint_length: "2-weeks", capacity: 24, planning_depth: "balanced", constraints: "Private project records", status: "ready", discovery_context: null, readiness_state: null, plan: null, plan_schema_version: null, generation_source: null, created_at: now, updated_at: now });

describe("Mycel Core boundaries", () => {
  it("keeps provider code free of persistence and routes transport through orchestration", () => {
    const providerSource = readFileSync("lib/mycel-core/ai/openai.ts", "utf8");
    const routeSource = readFileSync("app/api/projects/[id]/discovery/route.ts", "utf8");
    expect(providerSource).not.toMatch(/supabase|persist|from\("projects"\)/i);
    expect(routeSource).toContain("orchestrateDiscoveryTurn");
    expect(routeSource).not.toMatch(/requestAi|createClient|from\("projects"\)/);
  });

  it("backs duplicate workflow protection with owner-scoped unique request keys", () => {
    const migration = readFileSync("supabase/migrations/20260718190000_mycel_core_intelligence.sql", "utf8");
    expect(migration).toContain("workflow_requests_project_operation_request_unique");
    expect(migration).toContain("project_id,");
    expect(migration).toContain("operation,");
    expect(migration).toContain("request_id");
  });

  it("denies missing identity, ownership mismatches, and unknown entity IDs", () => {
    expect(authorizeOwnedProject(null, project).status).toBe("denied");
    expect(authorizeOwnedProject("10000000-0000-4000-8000-000000000001", project).status).toBe("denied");
    expect(authorizeEntityId("other", new Set(["owned"])).status).toBe("denied");
  });

  it("blocks archived transitions and enforces bounded request rates", () => {
    expect(canContinueDiscovery("archived")).toBe(false);
    expect(canContinueDiscovery("ready")).toBe(true);
    expect(isWithinRateLimit(3, 4)).toBe(true);
    expect(isWithinRateLimit(4, 4)).toBe(false);
  });

  it("rejects malformed or untrusted AI proposals before execution", () => {
    expect(validateProviderProposal(AiDiscoveryResponseSchema, { assistantMessage: "partial" }).status).toBe("fallback_required");
    const proposal = validAiProposal();
    proposal.challenges.push({ category: "privacy", severity: "material", title: "Data boundary", description: "Clarify the private data boundary.", sourceFactIds: ["not-owned"] });
    expect(validateAiDiscoveryProposal(proposal, new Set()).status).toBe("fallback_required");
    expect(validateProviderProposal(AiDiscoveryResponseSchema, { ...validAiProposal(), unexpected: true }).status).toBe("fallback_required");
  });
});

describe("Mycel Core product decisions", () => {
  it("requires a response to material challenges before approval", () => {
    let context = createInitialDiscoveryContext({ id: projectId, description: null, targetUsers: null, constraints: null }, now);
    const answers = [
      "The business objective is to reduce planning rework.",
      "The problem is that teams lose time reconciling scattered product decisions.",
      "Everyone is a target user.",
      "The primary use case is to create and review one grounded product blueprint.",
      "Success means reducing planning time by 50 percent.",
    ];
    answers.forEach((message, index) => {
      context = advanceDiscovery({ context, messageId: `40000000-0000-4000-8000-${String(index).padStart(12, "0")}`, message, mode: "fallback", now }).context;
    });
    const readiness = calculateReadiness(context);
    expect(decideContextApproval(context, readiness).status).toBe("requires_review");
    for (const challenge of context.challenges.filter((item) => item.status === "open")) {
      context = applyDiscoveryReview(context, { action: "acknowledge_challenge", challengeId: challenge.id }, now);
    }
    expect(decideContextApproval(context, calculateReadiness(context)).status).toBe("allowed");
  });

  it("preserves lineage and manual state across graph edits", () => {
    const turn = advanceDiscovery({ context: createInitialDiscoveryContext({ id: projectId, description: null, targetUsers: null, constraints: null }, now), messageId: "50000000-0000-4000-8000-000000000001", message: "Product leads need to review grounded requirements.", mode: "fallback", now });
    const fact = turn.context.facts[0];
    expect(fact).toBeDefined();
    if (!fact) return;
    const edited = applyDiscoveryReview(turn.context, { action: "edit_fact", factId: fact.id, value: "Product leads need a traceable review path.", status: "confirmed" }, now);
    const saved = edited.facts.find((item) => item.id === fact.id);
    expect(saved).toMatchObject({ manuallyEdited: true, sourceMessageIds: fact.sourceMessageIds });
    const deleted = applyDiscoveryReview(edited, { action: "delete_fact", factId: fact.id }, now);
    expect(deleted.graph.nodes.some((node) => node.id === fact.id)).toBe(false);
  });

  it("normalizes generated IDs and keeps valid lineage only", () => {
    const context = approvedContext();
    const reliable = generateDeterministicBlueprint(project, context, now);
    const candidate = {
      ...reliable,
      goals: reliable.goals.map((goal, index) => ({ ...goal, id: `provider-goal-${index}` })),
      risks: reliable.risks.map((risk, index) => ({ ...risk, id: `provider-risk-${index}` })),
    };
    const normalized = normalizeAiBlueprint(candidate, project, context, now);
    expect(normalized.goals.map((goal) => goal.id)).toEqual(normalized.goals.map((_, index) => `GOAL-${index + 1}`));
    expect(normalized.risks.map((risk) => risk.id)).toEqual(normalized.risks.map((_, index) => `RISK-${index + 1}`));
    expect(normalized.goals.every((goal) => goal.lineage.source === "ai")).toBe(true);
  });

  it("runs Reliable Pressure Test without mutating the blueprint", () => {
    const blueprint = generateDeterministicBlueprint(project, approvedContext(), now);
    const before = JSON.stringify(blueprint);
    const pressureTest = generateReliablePressureTest(blueprint);
    expect(pressureTest.pressureTestMode).toBe("fallback");
    expect(pressureTest.overallAssessment.length).toBeGreaterThan(0);
    expect(JSON.stringify(blueprint)).toBe(before);
  });
});

function approvedContext() {
  let context = createInitialDiscoveryContext({ id: projectId, description: project.description, targetUsers: project.target_users, constraints: project.constraints }, now);
  ["The problem is scattered product decisions.", "Product leads need to create and review one blueprint.", "Success means reducing planning time by 50 percent."].forEach((message, index) => {
    context = advanceDiscovery({ context, messageId: `60000000-0000-4000-8000-${String(index).padStart(12, "0")}`, message, mode: "fallback", now }).context;
  });
  return context;
}

function validAiProposal(): AiDiscoveryResponse {
  return {
    assistantMessage: "The primary outcome is clearer.",
    assistantQuestion: "Which result matters most?",
    questionReason: "It will anchor the product boundary.",
    extractedFacts: [],
    updatedFacts: [],
    unresolvedItems: [],
    contradictions: [],
    challenges: [],
    proposedGraphChanges: { relationships: [] },
    proposedReadinessSignals: { supportedCategories: [], unknownCategories: [] },
    generationMode: "ai",
  };
}
