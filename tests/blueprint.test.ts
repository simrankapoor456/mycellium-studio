import { describe, expect, it } from "vitest";

import { applyBlueprintEdit } from "@/lib/blueprint/editing";
import { blueprintToCsv, blueprintToJson, blueprintToMarkdown } from "@/lib/blueprint/exports";
import { generateDeterministicBlueprint, validateBlueprintLineage } from "@/lib/blueprint/generate";
import { advanceDiscovery, createInitialDiscoveryContext } from "@/lib/discovery/engine";
import { ProductBlueprintSchema } from "@/lib/domain/blueprint/schemas";
import { ProjectOutputSchema } from "@/lib/domain/project/schemas";

const projectId = "42ad2ff0-4835-47d1-b3fe-d6c1f58863a2";
const now = "2026-07-18T00:00:00.000Z";
const project = ProjectOutputSchema.parse({ id: projectId, user_id: "2d9065fe-829c-4c6c-b867-7663f43e8740", name: "Invoice roots", description: "An invoicing tool for freelancers", project_type: "web-app", target_users: "Independent designers", team_size: 3, sprint_length: "2-weeks", capacity: 24, planning_depth: "balanced", constraints: "No accounting integrations in v1", status: "ready", discovery_context: null, readiness_state: null, plan: null, plan_schema_version: null, generation_source: null, created_at: now, updated_at: now });

function approvedContext() {
  let context = createInitialDiscoveryContext({ id: projectId, description: project.description, targetUsers: project.target_users, constraints: project.constraints }, now);
  ["The problem is that freelance designers lose time chasing late invoices.", "They need to create, send, and track invoices.", "Success means cutting invoice administration time in half.", "Security and keyboard accessibility are required.", "The main risk is exposing financial details."].forEach((message, index) => { context = advanceDiscovery({ context, messageId: `20000000-0000-4000-8000-${String(index).padStart(12, "0")}`, message, mode: "fallback", now }).context; });
  return context;
}

describe("canonical Product Blueprint", () => {
  it("generates the complete fallback hierarchy with valid lineage", () => {
    const context = approvedContext(); const blueprint = generateDeterministicBlueprint(project, context, now);
    expect(ProductBlueprintSchema.parse(blueprint)).toEqual(blueprint);
    expect(blueprint.requirements.length).toBeGreaterThan(0);
    expect(blueprint.architectureDecisions.length).toBeGreaterThan(0);
    expect(blueprint.tasks.every((task) => task.storyId && task.sprintId)).toBe(true);
    expect(validateBlueprintLineage(blueprint, context)).toEqual([]);
  });

  it("persists controlled edits in the canonical contract and marks manual lineage", () => {
    const blueprint = generateDeterministicBlueprint(project, approvedContext(), now); const requirement = blueprint.requirements[0]!;
    const edited = applyBlueprintEdit(blueprint, { entityType: "requirement", entityId: requirement.id, changes: { title: "Send a reviewed invoice", status: "approved", owner: "Product lead" } }, "2026-07-18T01:00:00.000Z");
    expect(edited.version).toBe(2);
    expect(edited.requirements[0]).toMatchObject({ title: "Send a reviewed invoice", status: "approved", manuallyEdited: true, lineage: { source: "manual" } });
  });

  it("exports the currently edited blueprint with hierarchy and safe CSV escaping", () => {
    const blueprint = generateDeterministicBlueprint(project, approvedContext(), now); const story = blueprint.stories[0]!;
    const edited = applyBlueprintEdit(blueprint, { entityType: "story", entityId: story.id, changes: { title: "Review, send, and track invoice" } }, "2026-07-18T01:00:00.000Z");
    expect(blueprintToMarkdown(edited)).toContain("Review, send, and track invoice");
    expect(blueprintToJson(edited)).toContain('"schemaVersion": "2.0"');
    expect(blueprintToCsv(edited)).toContain('"Review, send, and track invoice"');
    expect(blueprintToCsv(edited).split("\n")[0]).toContain("parent_id");
  });

  it("rejects AI-shaped output that does not match schema parity", () => {
    const blueprint = generateDeterministicBlueprint(project, approvedContext(), now);
    expect(ProductBlueprintSchema.safeParse({ ...blueprint, schemaVersion: "1.0" }).success).toBe(false);
  });
});
