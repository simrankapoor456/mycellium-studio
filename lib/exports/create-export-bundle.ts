import type { PlanOutput } from "@/lib/domain/plan/schemas";
import { planToCsv } from "@/lib/exports/to-csv";
import { planToJson } from "@/lib/exports/to-json";
import { planToMarkdown } from "@/lib/exports/to-markdown";

export type ExportArtifact = Readonly<{
  format: "markdown" | "json" | "csv";
  filename: string;
  mimeType: string;
  content: string;
}>;

export function createExportBundle(plan: PlanOutput): readonly ExportArtifact[] {
  const filenameRoot = slugify(plan.project_name);

  return [
    {
      format: "markdown",
      filename: `${filenameRoot}-plan.md`,
      mimeType: "text/markdown;charset=utf-8",
      content: planToMarkdown(plan),
    },
    {
      format: "json",
      filename: `${filenameRoot}-plan.json`,
      mimeType: "application/json;charset=utf-8",
      content: planToJson(plan),
    },
    {
      format: "csv",
      filename: `${filenameRoot}-tasks.csv`,
      mimeType: "text/csv;charset=utf-8",
      content: planToCsv(plan),
    },
  ];
}

function slugify(value: string): string {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "mycellium-studio"
  );
}
