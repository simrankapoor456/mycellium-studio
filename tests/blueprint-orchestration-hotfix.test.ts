import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { generateDeterministicBlueprint } from "@/lib/blueprint/generate";
import { calculateReadiness, createInitialDiscoveryContext } from "@/lib/discovery/engine";
import type { DiscoveryContext, FactCategory } from "@/lib/domain/discovery/schemas";
import { ProjectOutputSchema, type Project } from "@/lib/domain/project/schemas";
import { ProviderTimeoutError } from "@/lib/mycel-core/ai/timeout";
import { decideContextApproval } from "@/lib/mycel-core/decision/readiness";
import { orchestrateBlueprintGeneration } from "@/lib/mycel-core/orchestration";

const mocks = vi.hoisted(() => ({
  beginWorkflowRequest: vi.fn(),
  completeWorkflowRequest: vi.fn(),
  countRecentWorkflowRequests: vi.fn(),
  failWorkflowRequest: vi.fn(),
  isOpenAiConfigured: vi.fn(),
  loadAuthenticatedUser: vi.fn(),
  loadOwnedProject: vi.fn(),
  persistBlueprint: vi.fn(),
  requestAiBlueprint: vi.fn(),
}));

vi.mock("@/lib/mycel-core/ai/openai", () => ({
  requestAiBlueprint: mocks.requestAiBlueprint,
  requestAiDiscovery: vi.fn(),
  requestAiPressureTest: vi.fn(),
}));

vi.mock("@/lib/mycel-core/ai/provider", () => ({
  isOpenAiConfigured: mocks.isOpenAiConfigured,
}));

vi.mock("@/lib/mycel-core/execution/blueprint", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/mycel-core/execution/blueprint")>();
  return { ...actual, persistBlueprint: mocks.persistBlueprint };
});

vi.mock("@/lib/mycel-core/execution/persistence", () => ({
  beginWorkflowRequest: mocks.beginWorkflowRequest,
  completeWorkflowRequest: mocks.completeWorkflowRequest,
  countRecentWorkflowRequests: mocks.countRecentWorkflowRequests,
  failWorkflowRequest: mocks.failWorkflowRequest,
  loadAuthenticatedUser: mocks.loadAuthenticatedUser,
  loadOwnedProject: mocks.loadOwnedProject,
  persistPressureTest: vi.fn(),
}));

const projectId = "42ad2ff0-4835-47d1-b3fe-d6c1f58863a2";
const userId = "2d9065fe-829c-4c6c-b867-7663f43e8740";
const requestId = "30000000-0000-4000-8000-000000000041";
const now = "2026-07-20T20:30:00.000Z";
const approvedContext = buildApprovedContext();
const baseProject = buildProject();

beforeEach(() => {
  mocks.loadAuthenticatedUser.mockResolvedValue({ id: userId });
  mocks.loadOwnedProject.mockResolvedValue(baseProject);
  mocks.beginWorkflowRequest.mockResolvedValue({ kind: "untracked" });
  mocks.completeWorkflowRequest.mockResolvedValue(undefined);
  mocks.countRecentWorkflowRequests.mockResolvedValue(0);
  mocks.failWorkflowRequest.mockResolvedValue(undefined);
  mocks.isOpenAiConfigured.mockReturnValue(true);
  mocks.persistBlueprint.mockResolvedValue(undefined);
  mocks.requestAiBlueprint.mockRejectedValue(new ProviderTimeoutError());
  vi.spyOn(console, "info").mockImplementation(() => undefined);
  vi.spyOn(console, "warn").mockImplementation(() => undefined);
  vi.spyOn(console, "error").mockImplementation(() => undefined);
});

afterEach(() => {
  vi.clearAllMocks();
  vi.restoreAllMocks();
});

describe("blueprint orchestration hotfix", () => {
  it("falls back after a provider timeout and persists one reliable blueprint", async () => {
    const outcome = await orchestrateBlueprintGeneration(projectId, { requestId });

    expect(outcome).toMatchObject({
      ok: true,
      data: { generationSource: "fallback", engineState: "ai_unavailable_reliable" },
    });
    expect(mocks.requestAiBlueprint).toHaveBeenCalledOnce();
    expect(mocks.persistBlueprint).toHaveBeenCalledOnce();
    expect(mocks.persistBlueprint).toHaveBeenCalledWith(projectId, userId, expect.any(Object), requestId);
    expect(mocks.completeWorkflowRequest).toHaveBeenCalledOnce();
  });

  it("returns a persisted blueprint after an uncertain client failure without generating a duplicate", async () => {
    const blueprint = generateDeterministicBlueprint(baseProject, approvedContext, now);
    const persistedProject: Project = {
      ...baseProject,
      blueprint_version: blueprint.version,
      generation_source: blueprint.generationSource,
      last_generation_request_id: requestId,
      plan: blueprint,
      plan_schema_version: blueprint.schemaVersion,
    };
    mocks.loadOwnedProject.mockResolvedValueOnce(persistedProject);

    const outcome = await orchestrateBlueprintGeneration(projectId, { requestId });

    expect(outcome).toMatchObject({ ok: true, data: { blueprint, generationSource: "fallback", engineState: "reliable" } });
    expect(mocks.beginWorkflowRequest).not.toHaveBeenCalled();
    expect(mocks.requestAiBlueprint).not.toHaveBeenCalled();
    expect(mocks.persistBlueprint).not.toHaveBeenCalled();
    expect(mocks.completeWorkflowRequest).toHaveBeenCalledOnce();
  });
});

function buildApprovedContext() {
  const context = createInitialDiscoveryContext({
    id: projectId,
    description: null,
    targetUsers: null,
    constraints: null,
  }, now);
  const factSeeds: readonly (readonly [FactCategory, string, string])[] = [
    ["business_objective", "Business objective", "Reduce planning rework."],
    ["problem", "Problem", "Product decisions become scattered and lose their evidence."],
    ["target_users", "Target users", "Product owners."],
    ["use_cases", "Primary use case", "Create and review one grounded product blueprint."],
    ["success_metrics", "Success measure", "Reduce planning rework by half."],
    ["functional_requirements", "Core requirement", "Preserve traceable product decisions."],
    ["constraints", "Constraint", "Keep project records private."],
  ];
  const groundedFacts = factSeeds.map(([category, label, value], index) => ({
    id: `fact-hotfix-${index}`,
    category,
    label,
    value,
    status: "confirmed" as const,
    confidence: 1,
    sourceMessageIds: [],
    createdAt: now,
    updatedAt: now,
    manuallyEdited: true,
    deletedAt: null,
  }));
  const approved: DiscoveryContext = { ...context, facts: groundedFacts };
  if (decideContextApproval(approved, calculateReadiness(approved)).status !== "allowed") {
    throw new Error("Test context must be architecture-ready.");
  }
  return approved;
}

function buildProject(): Project {
  return ProjectOutputSchema.parse({
    id: projectId,
    user_id: userId,
    name: "Signal Garden",
    description: "A product workspace for grounded planning decisions.",
    project_type: "web-app",
    target_users: "Product owners",
    team_size: 2,
    sprint_length: "2-weeks",
    capacity: 20,
    planning_depth: "balanced",
    constraints: "Private project records and keyboard access are required.",
    status: "ready",
    discovery_context: approvedContext,
    approved_discovery_context: approvedContext,
    discovery_approved_at: now,
    readiness_state: calculateReadiness(approvedContext),
    plan: null,
    plan_schema_version: null,
    generation_source: null,
    created_at: now,
    updated_at: now,
  });
}
