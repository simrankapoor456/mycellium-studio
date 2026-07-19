import { ProductBlueprintSchema, type ProductBlueprint } from "@/lib/domain/blueprint/schemas";
import { PressureTestSchema, type PressureTest } from "@/lib/domain/pressure-test/schemas";

export type BlueprintExportFormat = "markdown" | "json" | "csv";

export function blueprintToJson(input: ProductBlueprint): string {
  return JSON.stringify(ProductBlueprintSchema.parse(input), null, 2);
}

export function blueprintToMarkdown(input: ProductBlueprint, pressureTestInput?: PressureTest | null): string {
  const blueprint = ProductBlueprintSchema.parse(input);
  const pressureTest = pressureTestInput ? PressureTestSchema.parse(pressureTestInput) : null;
  const lines = [`# ${blueprint.projectName}`, "", blueprint.summary, "", "## Understanding", `Business objective: ${blueprint.overview.businessObjective}`, "", "### Target users", ...blueprint.overview.targetUsers.map((item) => `- ${item}`), "", "### Success metrics", ...blueprint.overview.successMetrics.map((item) => `- ${item}`), "", "### Assumptions", ...listOrNone(blueprint.assumptions), "", "### Constraints", ...listOrNone(blueprint.constraints), "", "### Dependencies", ...listOrNone(blueprint.dependencies), "", "### Trade-offs", ...listOrNone(blueprint.tradeOffs), "", "### Ownership suggestions", ...listOrNone(blueprint.ownershipSuggestions), "", "## Goals", ...blueprint.goals.map((item) => `- **${item.title}:** ${item.description}`), "", "## Requirements"];
  for (const item of blueprint.requirements) lines.push(`### ${item.id}: ${item.title}`, item.description, ...item.acceptanceCriteria.map((criterion) => `- ${criterion}`), lineageLine(item), "");
  lines.push("## Architecture");
  for (const item of blueprint.architectureDecisions) lines.push(`### ${item.id}: ${item.title}`, item.description, `Rationale: ${item.rationale}`, lineageLine(item), "");
  lines.push("## Scope", "### In scope", ...blueprint.scope.inScope.map((item) => `- ${item.title}: ${item.description}`), "", "### Out of scope", ...blueprint.scope.outOfScope.map((item) => `- ${item.title}: ${item.description}`), "", "## Epics");
  for (const item of blueprint.epics) lines.push(`- **${item.id}: ${item.title}** — ${item.description}`);
  lines.push("", "## Stories");
  for (const item of blueprint.stories) lines.push(`### ${item.id}: ${item.title}`, item.userStory, ...item.acceptanceCriteria.map((criterion) => `- ${criterion}`), "");
  lines.push("## Tasks", ...blueprint.tasks.map((item) => `- **${item.id}: ${item.title}** (${item.ownerType}, ${item.estimate ?? "unestimated"}) — ${item.description}`), "", "## Risks", ...blueprint.risks.map((item) => `- **${item.title} (${item.impact})** — ${item.description} Mitigation: ${item.mitigation}`), "", "## Sprint plan");
  for (const sprint of blueprint.sprintPlan) lines.push(`### ${sprint.title}`, sprint.goal, ...sprint.taskIds.map((id) => `- ${id}`), "");
  lines.push("## Unresolved items", ...(blueprint.understanding.unresolvedItems.length ? blueprint.understanding.unresolvedItems.map((item) => `- ${item}`) : ["- None"]), "");
  if (pressureTest) {
    lines.push("## Pressure Test", pressureTest.overallAssessment, "", "### Critical findings", ...(pressureTest.criticalFindings.length ? pressureTest.criticalFindings.map((item) => `- ${item}`) : ["- None"]), "", "### Recommended next actions", ...pressureTest.recommendedNextActions.map((item) => `- ${item}`), "", `Pressure Test mode: ${pressureTest.pressureTestMode}`, "");
  }
  lines.push(`Generation source: ${blueprint.generationSource}`, `Schema version: ${blueprint.schemaVersion}`);
  return lines.join("\n");
}

export function blueprintToCsv(input: ProductBlueprint): string {
  const blueprint = ProductBlueprintSchema.parse(input);
  const rows: Array<Array<string | number>> = [["type", "id", "parent_id", "title", "status", "priority", "owner", "estimate", "description", "fact_ids", "requirement_ids", "generation_source"]];
  const add = (type: string, item: { id: string; title: string; status: string; priority: string; owner: string | null; estimate: number | null; description: string; lineage: { factIds: string[]; requirementIds: string[]; source: string } }, parent = "") => rows.push([type, item.id, parent, item.title, item.status, item.priority, item.owner ?? "", item.estimate ?? "", item.description, item.lineage.factIds.join("|"), item.lineage.requirementIds.join("|"), item.lineage.source]);
  blueprint.goals.forEach((item) => add("goal", item));
  blueprint.requirements.forEach((item) => add("requirement", item));
  blueprint.architectureDecisions.forEach((item) => add("architecture", item));
  blueprint.scope.inScope.forEach((item) => add("scope_in", item));
  blueprint.scope.outOfScope.forEach((item) => add("scope_out", item));
  blueprint.epics.forEach((item) => add("epic", item));
  blueprint.stories.forEach((item) => add("story", item, item.epicId));
  blueprint.tasks.forEach((item) => add("task", item, item.storyId));
  blueprint.sprintPlan.forEach((item) => add("sprint", item));
  blueprint.risks.forEach((item) => add("risk", item));
  return rows.map((row) => row.map(csvCell).join(",")).join("\n");
}

function lineageLine(item: { lineage: { factIds: string[]; sourceMessageIds: string[]; source: string } }) {
  return `Lineage: ${item.lineage.source}; facts ${item.lineage.factIds.join(", ") || "none"}; messages ${item.lineage.sourceMessageIds.join(", ") || "none"}.`;
}

function csvCell(value: string | number) {
  return `"${String(value).replaceAll('"', '""')}"`;
}

function listOrNone(items: readonly string[]): string[] {
  return items.length ? items.map((item) => `- ${item}`) : ["- None"];
}
