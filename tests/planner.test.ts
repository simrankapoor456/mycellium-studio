import { describe, expect, it } from "vitest";

import { PlanOutputSchema, PlanningInputSchema } from "@/lib/domain/plan/schemas";
import { getStories } from "@/lib/domain/plan/selectors";
import { generatePlan } from "@/lib/planner/generate-plan";

const input = {
  brief:
    "Build a planning tool for small teams that converts software briefs into sprint stories, review questions, and downloadable exports with a clear success goal.",
  projectName: "Grounded Planner",
  projectType: "internal-tool",
  teamSize: 4,
  sprintDurationWeeks: 2,
  sprintCapacityPoints: 24,
  planningDepth: "balanced",
} as const;

describe("PlanningInputSchema", () => {
  it("applies Phase 1 defaults", () => {
    const parsedInput = PlanningInputSchema.parse({ brief: input.brief });

    expect(parsedInput).toMatchObject({
      projectType: "web-app",
      teamSize: 3,
      sprintDurationWeeks: 2,
      sprintCapacityPoints: 24,
      planningDepth: "balanced",
    });
  });
});

describe("generatePlan", () => {
  it("returns output that matches the canonical schema", () => {
    const plan = generatePlan(input);

    expect(PlanOutputSchema.safeParse(plan).success).toBe(true);
    expect(plan.schema_version).toBe("1.0");
    expect(plan.project_name).toBe("Grounded Planner");
  });

  it("returns the same plan for the same input", () => {
    expect(generatePlan(input)).toEqual(generatePlan(input));
  });

  it("allocates every story exactly once", () => {
    const plan = generatePlan(input);
    const storyIds = getStories(plan).map((story) => story.story_id);
    const allocatedStoryIds = plan.sprints.flatMap((sprint) =>
      sprint.stories.map((story) => story.story_id),
    );

    expect(allocatedStoryIds).toHaveLength(storyIds.length);
    expect(new Set(allocatedStoryIds)).toEqual(new Set(storyIds));
  });
});
