import { describe, expect, it } from "vitest";

import { DiscoveryMessageCreateSchema } from "@/lib/domain/discovery/schemas";
import {
  createProjectDuplicate,
  duplicateProjectName,
} from "@/lib/domain/project/duplication";
import {
  assertProjectOwnership,
  ProjectOwnershipError,
} from "@/lib/domain/project/ownership";
import {
  ProjectCreateInputSchema,
  ProjectOutputSchema,
} from "@/lib/domain/project/schemas";

const userId = "2d9065fe-829c-4c6c-b867-7663f43e8740";
const projectId = "42ad2ff0-4835-47d1-b3fe-d6c1f58863a2";

const project = ProjectOutputSchema.parse({
  id: projectId,
  user_id: userId,
  name: "Release planner",
  description: "Plan a careful release.",
  project_type: "web-app",
  target_users: "Small product teams",
  team_size: 3,
  sprint_length: "2-weeks",
  capacity: 24,
  planning_depth: "balanced",
  constraints: "No external integrations",
  status: "discovery",
  discovery_context: { objective: "Reduce planning churn" },
  readiness_state: { complete: false },
  plan: { schema_version: "1.0" },
  plan_schema_version: "1.0",
  generation_source: "deterministic",
  created_at: "2026-07-17T22:00:00.000Z",
  updated_at: "2026-07-17T22:00:00.000Z",
});

describe("project form validation", () => {
  it("trims text and coerces bounded numeric form values", () => {
    const result = ProjectCreateInputSchema.parse({
      name: "  New workspace  ",
      description: "  A useful project  ",
      projectType: "internal-tool",
      targetUsers: "  Operators  ",
      teamSize: "4",
      sprintLength: "2-weeks",
      capacity: "30",
      planningDepth: "detailed",
      constraints: "   ",
    });

    expect(result).toMatchObject({
      name: "New workspace",
      description: "A useful project",
      teamSize: 4,
      capacity: 30,
      constraints: null,
    });
  });

  it.each([
    ["empty name", { name: "   " }],
    ["oversized team", { teamSize: 51 }],
    ["zero capacity", { capacity: 0 }],
    ["invalid sprint", { sprintLength: "5-weeks" }],
  ])("rejects %s", (_label, override) => {
    const result = ProjectCreateInputSchema.safeParse({
      name: "Valid",
      description: "A clear project description.",
      projectType: "web-app",
      targetUsers: "",
      teamSize: 3,
      sprintLength: "2-weeks",
      capacity: 24,
      planningDepth: "balanced",
      constraints: "",
      ...override,
    });

    expect(result.success).toBe(false);
  });

  it("requires only the core starting context and normalizes optional planning fields", () => {
    const result = ProjectCreateInputSchema.parse({
      name: "Living notes",
      description: "Turn scattered product context into a grounded plan.",
      projectType: "",
      customProjectType: "",
      targetUsers: "",
      teamSize: "3",
      sprintLength: "2-weeks",
      capacity: "",
      planningDepth: "",
      constraints: "",
    });

    expect(result).toMatchObject({
      projectType: null,
      targetUsers: null,
      capacity: null,
      planningDepth: null,
      constraints: null,
    });
  });

  it.each([
    ["Project name is required.", { name: "" }],
    ["Project description is required.", { description: "" }],
  ])("returns actionable required-field copy", (message, override) => {
    const result = ProjectCreateInputSchema.safeParse({
      name: "Living notes",
      description: "A grounded product description.",
      projectType: "",
      customProjectType: "",
      targetUsers: "",
      teamSize: "3",
      sprintLength: "2-weeks",
      capacity: "",
      planningDepth: "",
      constraints: "",
      ...override,
    });

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues[0]?.message).toBe(message);
  });
});

describe("project duplication", () => {
  it("appends Copy while respecting the database name limit", () => {
    expect(duplicateProjectName("Roadmap")).toBe("Roadmap Copy");
    expect(duplicateProjectName("x".repeat(120))).toHaveLength(120);
    expect(duplicateProjectName("x".repeat(120)).endsWith(" Copy")).toBe(true);
  });

  it("creates a new owned insert and preserves persisted project data", () => {
    const newId = "4d33a83e-42ce-4766-8106-a060695f45ab";
    const duplicate = createProjectDuplicate(project, userId, () => newId);

    expect(duplicate).toMatchObject({
      id: newId,
      user_id: userId,
      name: "Release planner Copy",
      discovery_context: project.discovery_context,
      plan: project.plan,
    });
    expect(duplicate.id).not.toBe(project.id);
  });

  it("refuses to map a project owned by another user", () => {
    expect(() =>
      createProjectDuplicate(project, "6480609a-12ce-4da5-bc64-d56bb01a5f64"),
    ).toThrow(ProjectOwnershipError);
  });
});

describe("ownership and persistence schemas", () => {
  it("accepts matching ownership and rejects mismatches", () => {
    expect(() => assertProjectOwnership(project, userId)).not.toThrow();
    expect(() =>
      assertProjectOwnership(project, "6480609a-12ce-4da5-bc64-d56bb01a5f64"),
    ).toThrow(ProjectOwnershipError);
  });

  it("parses valid discovery persistence input", () => {
    expect(
      DiscoveryMessageCreateSchema.parse({
        projectId,
        role: "user",
        content: "  The target users are product managers.  ",
        structuredFacts: { target_users: ["product managers"] },
        sequenceNumber: 1,
      }),
    ).toMatchObject({ content: "The target users are product managers.", sequenceNumber: 1 });
  });

  it("rejects invalid persisted project rows", () => {
    expect(() => ProjectOutputSchema.parse({ ...project, status: "public" })).toThrow();
  });
});
