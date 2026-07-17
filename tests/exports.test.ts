import { describe, expect, it } from "vitest";

import { PlanOutputSchema } from "@/lib/domain/plan/schemas";
import { createExportBundle, planToCsv, planToJson, planToMarkdown } from "@/lib/exports";
import { generatePlan } from "@/lib/planner/generate-plan";

const plan = generatePlan({
  brief:
    "Create a useful sprint planning tool for a product team with Markdown, JSON, and CSV download formats.",
  projectName: "Export Garden",
});

describe("plan export utilities", () => {
  it("creates human-readable Markdown", () => {
    const markdown = planToMarkdown(plan);

    expect(markdown).toContain("# Export Garden");
    expect(markdown).toContain("## Sprint plan");
  });

  it("creates parseable canonical JSON", () => {
    const exportedPlan = PlanOutputSchema.parse(JSON.parse(planToJson(plan)));

    expect(exportedPlan).toEqual(plan);
  });

  it("creates quoted CSV rows", () => {
    const csv = planToCsv(plan);

    expect(csv.split("\n")[0]).toBe(
      '"type","id","title","priority","estimate","owner","description"',
    );
    expect(csv).toContain('"story"');
  });

  it("creates a typed three-file bundle", () => {
    const bundle = createExportBundle(plan);

    expect(bundle.map((artifact) => artifact.filename)).toEqual([
      "export-garden-plan.md",
      "export-garden-plan.json",
      "export-garden-tasks.csv",
    ]);
  });
});
